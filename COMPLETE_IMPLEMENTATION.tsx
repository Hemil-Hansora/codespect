/**
 * COMPLETE INLINE REVIEW IMPLEMENTATION
 * 
 * This file shows the exact postInlineReview function implementation
 * Location: /features/github/index.ts
 */

import parseDiff from "parse-diff";
import { Octokit } from "octokit";

interface AIIssue {
  severity: "critical" | "major" | "minor";
  file: string;
  line: number;
  title: string;
  body: string;
  fix?: string;
}

interface AIResult {
  issues: AIIssue[];
  summary: string;
}

export async function postInlineReview(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number,
  pull_request: any,
  aiResult: AIResult
) {
  try {
    // STEP 2 — Fetch the PR diff
    const { data: rawDiff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
    });

    // STEP 3 — Build a position lookup map
    const parsedDiff = parseDiff(rawDiff as unknown as string);
    const positionMap: Record<string, Record<number, number>> = {};

    for (const file of parsedDiff) {
      let position = 0;

      // Initialize maps for both old and new file paths
      if (file.to) {
        positionMap[file.to] = {};
      }
      if (file.from && file.from !== file.to) {
        positionMap[file.from] = {};
      }

      // Iterate through chunks and changes
      for (const chunk of file.chunks) {
        for (const change of chunk.changes) {
          position++; // Increment for every line (context, addition, deletion)

          if (change.type === "add" && file.to) {
            // For added lines, use the new line number (ln)
            positionMap[file.to][change.ln] = position;
          } else if (change.type === "del" && file.from) {
            // For deleted lines, use the old line number (ln)
            positionMap[file.from][change.ln] = position;
          } else if (change.type === "normal") {
            // For context lines, map both old and new line numbers
            if (file.to && change.ln2) {
              positionMap[file.to][change.ln2] = position;
            }
            if (file.from && change.ln1) {
              positionMap[file.from][change.ln1] = position;
            }
          }
        }
      }
    }

    // STEP 4 — Build the comments array
    const severityBadge = {
      critical: "⚠️ Potential issue | 🔴 Critical",
      major: "⚠️ Potential issue | 🟠 Major",
      minor: "💡 Suggestion | 🟡 Minor",
    };

    const commentsArray: { path: string; position: number; body: string }[] = [];
    const skippedIssues: AIIssue[] = [];

    for (const issue of aiResult.issues) {
      const position = positionMap[issue.file]?.[issue.line];

      if (position === undefined) {
        // Collect issues outside diff range
        skippedIssues.push(issue);
        continue;
      }

      // Build comment body
      let body = `${severityBadge[issue.severity]}\n\n**${issue.title}**\n\n${issue.body}`;

      if (issue.fix) {
        body += `\n\n\`\`\`suggestion\n${issue.fix}\n\`\`\``;
      }

      commentsArray.push({
        path: issue.file,
        position,
        body,
      });
    }

    // Build summary body with CodeSpect branding
    const summaryBody = `# 🤖 AI Code Review

${aiResult.summary}

${commentsArray.length > 0 ? `\n📝 **${commentsArray.length} inline comment${commentsArray.length !== 1 ? 's' : ''} posted on changed lines**` : ''}

---
<div align="center">
  <sub>Powered by <strong>Codespect</strong> • Automated Code Intelligence</sub>
</div>
`;

    // STEP 5 — Post the review
    try {
      await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number,
        commit_id: pull_request.head.sha,
        event: "COMMENT",
        body: summaryBody,
        comments: commentsArray,
      });
    } catch (error: any) {
      // STEP 7 — Handle 422 errors by retrying without comments
      if (error.status === 422) {
        console.error("Failed to post inline comments, retrying with summary only:", error);
        await octokit.rest.pulls.createReview({
          owner,
          repo,
          pull_number,
          commit_id: pull_request.head.sha,
          event: "COMMENT",
          body: summaryBody,
          comments: [],
        });
      } else {
        throw error;
      }
    }

    // STEP 6 — Handle skipped issues (outside diff range)
    if (skippedIssues.length > 0) {
      let skippedBody = `> ⚠️ **Outside diff range** — issues found in files not included in this diff\n\n`;

      for (const issue of skippedIssues) {
        skippedBody += `### ${severityBadge[issue.severity]}\n`;
        skippedBody += `**File:** \`${issue.file}\` (Line ${issue.line})\n`;
        skippedBody += `**${issue.title}**\n\n`;
        skippedBody += `${issue.body}\n\n`;

        if (issue.fix) {
          skippedBody += `**Suggested fix:**\n\`\`\`\n${issue.fix}\n\`\`\`\n\n`;
        }

        skippedBody += `---\n\n`;
      }

      skippedBody += `<div align="center">\n  <sub>Powered by <strong>Codespect</strong> • Automated Code Intelligence</sub>\n</div>`;

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: skippedBody,
      });
    }

    return {
      success: true,
      inlineComments: commentsArray.length,
      skippedIssues: skippedIssues.length,
    };
  } catch (error) {
    console.error("Error posting inline review:", error);
    throw error;
  }
}
