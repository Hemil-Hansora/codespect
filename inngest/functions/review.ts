import db from "@/lib/db";
import { inngest } from "../client";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getPullRequestDiff, postReviewComment } from "@/features/github";
import { retrieveContent } from "@/features/ai/lib/rag";

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

    const review = await step.run("generate-review", async () => {
      const prompt = `You are a senior software engineer and expert code reviewer with extensive experience in software development and code quality assurance in large-scale projects. Analyze the following pull request thoroughly and provide a detailed,clear, constructive code review.Assume that code may be merged into a large production codebase, so pay close attention to code quality, maintainability, performance, and security.

            PR Title: ${title}
            PR Description: ${description || "No description provided"}

            Context from Codebase:
            The following files and snippets represent surrounding code relevant to the changes made in this pull request. Use this information to better understand the implications of the changes.
            ${context.join("\n\n")}

            Code Changes:
            \`\`\`diff
            ${diff}
            \`\`\`

            Your review must be spacific , actionable, and grounded in he actual code changes (avoid generic advice).
            Please provide:
            1. **Walkthrough**: Provide a file-by-file explanation of what changed and why it matters.
            call out : New logic paths,Modified behaviors,Removed or deprecated functionality
            2. **Sequence Diagram**: A Mermaid JS sequence diagram visualizing the flow of the changes (if applicable). Use \`\`\`mermaid ... \`\`\` block. **IMPORTANT**: Ensure the Mermaid syntax is valid. Do not use special characters (like quotes, braces, parentheses) inside Note text or labels as it breaks rendering. Keep the diagram simple.
            3. **Summary**: A concise, high-level overview of what this PR accomplishes and its impact.
            4. **Strengths**: Highlight what is done well, such as: Good design decisions ,Clean abstractions , Performance or readability improvements ,Correct use of patterns or libraries
            5. **Issues**: Identify real problems, including but not limited to:
            Bugs or logical errors ,Security vulnerabilities,Edge cases,Performance regressions,Maintainability concerns,Inconsistencies with existing codebase conventions,Be explicit about where and why.
            6. **Suggestions**: Provide concrete improvements, ideally with:
            Refactoring ideas,Alternative approaches,Naming improvements,Test coverage suggestions,Examples or pseudocode where helpful,Avoid vague advice.
            7. **Questions**: Pose thoughtful questions that the author should consider, such as:   
            Clarifications on requirements or design decisions,Considerations about future implications,Opportunities for further discussion                                

            Use Markdown formatting with appropriate headings, bullet points, and code blocks to enhance readability.Be professional, direct, and technically rigorous 
            Format your response in markdown.`;

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
      });

      return text;
    });

    await step.run("post-comment", async () => {
      await postReviewComment({
        owner,
        repo: repoName,
        prNumber,
        token,
        review,
      });
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
