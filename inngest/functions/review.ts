import db from "@/lib/db";
import { inngest } from "../client";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getPullRequestDiff, postReviewComment, postInlineReview } from "@/features/github";
import { retrieveContent } from "@/features/ai/lib/rag";
import { Octokit } from "octokit";

export const generateReview = inngest.createFunction(
  {
    id: "generate-review",
    concurrency: 5,
  },
  {
    event: "pr.review.requested",
  },

  async ({ event, step }) => {
    const { owner, repoName, prNumber, userId } = event.data;

    const { description, diff, title, token } = await step.run(
      "fetch-pr-diff",
      async () => {
        const account = await db.account.findFirst({
          where: {
            userId,
            providerId: "github",
          },
        });

        if (!account?.accessToken) {
          throw new Error("No GitHub access token found");
        }
        const data = await getPullRequestDiff({
          owner,
          repo: repoName,
          prNumber,
          token: account.accessToken,
        });

        return { ...data, token: account.accessToken };
      },
    );

    const context = await step.run("retrieve-context", async () => {
      const query = `${title}\n${description}`;
        
      return await retrieveContent({ query, repoId: `${owner}/${repoName}` });
    });

    // Generate structured review with inline issues
    const { review, aiResult } = await step.run("generate-review", async () => {
      // First, generate structured issues for inline comments
      const issuesPrompt = `You are a principal engineer doing a final production review. Your output feeds directly into a GitHub PR review API — precision is mandatory.

PR Title: ${title}
PR Description: ${description || "No description provided"}

Codebase Context:
${context.join("\n\n")}

Diff:
\`\`\`diff
${diff}
\`\`\`

EXTRACTION RULES — read before analyzing:

1. LINE NUMBERS: Extract the line number from the diff header for each hunk:
   @@ -oldStart,oldCount +newStart,newCount @@
   For added lines (starting with +): use the new file line number (newStart + offset)
   For removed/existing lines (starting with -): use the old file line number
   Never guess a line number — if uncertain, omit the issue.

2. FILE PATHS: Use the exact path from the diff header:
   +++ b/path/to/file.ts → file is "path/to/file.ts" (strip the "b/" prefix)

3. FIX FIELD: The fix must be ONLY the replacement code for that line or block.
   No explanation, no comments, no surrounding context lines.
   It will be inserted verbatim as a GitHub committable suggestion.
   If the fix requires changes across multiple non-adjacent lines, omit the fix field.

4. MULTI-LINE FIXES: If a fix spans consecutive lines, set:
   "line": first line number,
   "endLine": last line number,
   "fix": "complete replacement block for all lines inclusive"

5. LIMITS:
   - Max 3 critical issues
   - Max 4 major issues  
   - Max 3 minor issues
   - If you find more, keep only the highest-impact ones
   - Zero issues is a valid and correct response

6. SKIP THESE — do not report:
   - Formatting, whitespace, or style preferences
   - Issues already handled by the fix in another issue
   - Anything you are not confident about from the diff alone
   - Generic best-practice advice not tied to a specific line

Return ONLY raw JSON. No markdown. No code fences. No explanation before or after.

{
  "issues": [
    {
      "severity": "critical" | "major" | "minor",
      "file": "exact/file/path.ts",
      "line": 42,
      "endLine": 45,
      "title": "Max 8 words",
      "body": "What breaks and why. One or two sentences. No generic advice.",
      "fix": "exact replacement code only, or omit if multi-file or non-adjacent"
    }
  ],
  "summary": "One sentence: what this PR does and its merge risk",
  "riskLevel": "critical" | "major" | "minor" | "safe"
}

Severity contract:
- critical: will cause a runtime crash, data loss, security breach, or app startup failure
- major: wrong behavior under real inputs, broken contract, likely regression in production
- minor: edge case gap, naming confusion, missing guard — correct but suboptimal`

      const issuesResponse = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: issuesPrompt,
      });

      let parsedResult;
      try {
        // Try to parse the JSON response
        const jsonText = issuesResponse.text.trim()
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '');
        parsedResult = JSON.parse(jsonText);
      } catch (error) {
        console.error("Failed to parse AI issues response:", error);
        parsedResult = {
          issues: [],
          summary: "AI analysis completed but failed to generate structured output."
        };
      }

      // Then generate the detailed markdown review
      const reviewPrompt = `You are a principal engineer at a top-tier tech company reviewing a PR that could ship to production today. Be precise, ruthless about what matters, and silent about what doesn't. Skip generic advice entirely.
PR Title: ${title}
PR Description: ${description || "No description provided"}
Codebase Context:
${context.join("\n\n")}
Diff:
\`\`\`diff
${diff}
\`\`\`

---

Respond in the following sections. Omit any section that has nothing meaningful to say — do not write a section just to fill it.

---

## Walkthrough

For each changed file, one paragraph max. Only explain what actually changed in behavior — not what the code looks like. Skip files with trivial changes (formatting, imports, renames).

---

## Change Comparison Table

If this PR modifies existing behavior (replaces logic, changes a schema, renames a contract, alters a flow), produce a markdown table showing before vs after:

| Aspect | Before | After | Impact |
|--------|--------|-------|--------|

Aspects to compare (only include rows that actually changed):
- Function signature
- Return type / shape
- DB schema field
- Route path / method
- Auth requirement
- Error handling
- Default values
- Performance characteristic

Omit this section entirely if the PR is purely additive with no behavioral changes.
---
## Visualization
Produce ONE Mermaid diagram. Choose the type that best fits the PR:
- **Sequence diagram** — if the PR changes how components communicate or adds async flows
- **Flowchart** — if the PR adds branching logic, a new algorithm, or a decision tree
- **Pie chart** — if the PR touches multiple areas and a breakdown of issue severity or file change distribution is useful
- **Bar chart (xychart-beta)** — if there is a measurable before/after (e.g. steps reduced, endpoints added)
Rules:
- No quotes, parentheses, or curly braces inside node labels or note text
- Max 8 nodes / steps
- If none of the above adds genuine clarity, omit this section entirely
\`\`\`mermaid
...
\`\`\`
---
## Issues
Only list real problems. Format each as:
**[🔴 Critical | 🟠 Major | 🟡 Minor]** \`filename:line\`
> One sentence: what is wrong and what breaks because of it.
\`\`\`suggestion
corrected code here
\`\`\`
Severity guide:
- 🔴 Critical — will break in production, data loss, security hole, app won't start
- 🟠 Major — wrong behavior under real conditions, violates a contract, likely regression
- 🟡 Minor — code smell, edge case, naming issue, missing guard — worth fixing but not blocking
If there are zero real issues, write: *No issues found.*
---
## Suggestions
Only include suggestions that would meaningfully change the design, performance, or maintainability — not style preferences. Max 3.
Each suggestion must have a concrete example. No pseudocode — real code only.
---
## Questions for the Author
Max 3 questions. Ask only if the answer would change the review outcome or reveal a design gap. Do not ask questions you can answer from the diff itself.
---
## Summary
One paragraph. What does this PR accomplish, what is the risk level, and is it ready to merge?
Risk level: 🔴 Do not merge / 🟠 Merge with fixes / 🟢 Ready to merge`

      const reviewResponse = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: reviewPrompt,
      });

      return {
        review: reviewResponse.text,
        aiResult: parsedResult
      };
    });

    // Post review with inline comments (with fallback)
    await step.run("post-review", async () => {
      const octokit = new Octokit({ auth: token });

      try {
        // First, try to get the PR details for inline review
        const { data: pull_request } = await octokit.rest.pulls.get({
          owner,
          repo: repoName,
          pull_number: prNumber,
        });

        // Try to post inline review if we have issues
        if (aiResult.issues && aiResult.issues.length > 0) {
          const result = await postInlineReview(
            octokit,
            owner,
            repoName,
            prNumber,
            pull_request,
            aiResult
          );

          console.log(`Posted ${result.inlineComments} inline comments, ${result.skippedIssues} skipped`);
          
          // Also post the detailed review as a separate comment
          await postReviewComment({
            owner,
            repo: repoName,
            prNumber,
            token,
            review,
          });
        } else {
          // No inline issues, just post the regular review
          await postReviewComment({
            owner,
            repo: repoName,
            prNumber,
            token,
            review,
          });
        }
      } catch (error) {
        console.error("Failed to post inline review, falling back to single comment:", error);
        
        // Fallback to single comment if inline review fails
        await postReviewComment({
          owner,
          repo: repoName,
          prNumber,
          token,
          review,
        });
      }
    });

    await step.run("save-review", async () => {
      const repository = await db.repository.findFirst({
        where: {
          owner,
          name: repoName,
        },
      });

      if (repository) {
        // await db.review.create({
        //   data: {
        //     repositoryId: repository.id,
        //     prNumber,
        //     prTitle: title,
        //     prURL: `https://github.com/${owner}/${repoName}/pull/${prNumber}`,
        //     review,
        //     status: "COMPLETED",
        //   },
        // });

        await db.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: title,
            prURL: `https://github.com/${owner}/${repoName}/pull/${prNumber}`,
            review,
            status: "COMPLETED",
          },
        });
      }
    });

    return {
      success: true,
      message: "Review generated and posted successfully.",
    };
  },
);
