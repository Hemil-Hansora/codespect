/**
 * EXAMPLE: Using postInlineReview to post AI code review comments
 * 
 * This example shows how to use the new inline review function
 * to post comments directly on changed lines in a PR.
 */

import { Octokit } from "octokit";
import { postInlineReview } from "@/features/github";

/**
 * Example 1: Basic usage with a sample AI review result
 */
export async function exampleBasicUsage() {
  const token = "your_github_token";
  const octokit = new Octokit({ auth: token });
  
  const owner = "your-org";
  const repo = "your-repo";
  const pull_number = 123;

  // Fetch PR details (required for commit SHA)
  const { data: pull_request } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
  });

  // Sample AI review result
  const aiResult = {
    issues: [
      {
        severity: "critical" as const,
        file: "backend/src/config/database.js",
        line: 5,
        title: "Typo in function name",
        body: "The function name `conectDB` should be `connectDB` to follow proper naming conventions.",
        fix: "const connectDB = async () => {",
      },
      {
        severity: "major" as const,
        file: "backend/src/middleware/auth.js",
        line: 12,
        title: "Potential security vulnerability",
        body: "The JWT secret is hardcoded. This should be moved to environment variables to prevent security breaches.",
        fix: "const secret = process.env.JWT_SECRET;",
      },
      {
        severity: "minor" as const,
        file: "frontend/components/Button.tsx",
        line: 8,
        title: "Missing prop validation",
        body: "Consider adding PropTypes or TypeScript interface for the `variant` prop to improve type safety.",
      },
    ],
    summary: "Found 3 issues: 1 critical, 1 major, 1 minor. Please address the critical and major issues before merging.",
  };

  // Post the inline review
  const result = await postInlineReview(
    octokit,
    owner,
    repo,
    pull_number,
    pull_request,
    aiResult
  );

  console.log(`✅ Successfully posted review!`);
  console.log(`📝 Inline comments: ${result.inlineComments}`);
  console.log(`⚠️  Skipped issues: ${result.skippedIssues}`);

  return result;
}

/**
 * Example 2: Integration with webhook handler
 * This shows how to use it in a PR webhook handler
 */
export async function exampleWebhookHandler(
  webhookPayload: any,
  token: string,
  aiReviewResult: any
) {
  const octokit = new Octokit({ auth: token });

  const owner = webhookPayload.repository.owner.login;
  const repo = webhookPayload.repository.name;
  const pull_number = webhookPayload.pull_request.number;
  const pull_request = webhookPayload.pull_request;

  try {
    const result = await postInlineReview(
      octokit,
      owner,
      repo,
      pull_number,
      pull_request,
      aiReviewResult
    );

    console.log(`Review posted for PR #${pull_number}`);
    return result;
  } catch (error) {
    console.error("Failed to post review:", error);
    throw error;
  }
}

/**
 * Example 3: Fallback to old comment method if inline review fails
 */
export async function exampleWithFallback(
  token: string,
  owner: string,
  repo: string,
  pull_number: number,
  aiResult: any
) {
  const octokit = new Octokit({ auth: token });

  try {
    // Try to fetch PR and post inline review
    const { data: pull_request } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    });

    const result = await postInlineReview(
      octokit,
      owner,
      repo,
      pull_number,
      pull_request,
      aiResult
    );

    return { method: "inline", ...result };
  } catch (error) {
    console.warn("Inline review failed, falling back to single comment:", error);

    // Fallback to old single comment method
    const reviewText = formatReviewAsSingleComment(aiResult);
    
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: reviewText,
    });

    return { method: "fallback", success: true };
  }
}

/**
 * Helper function to format AI result as a single comment (fallback)
 */
function formatReviewAsSingleComment(aiResult: any): string {
  const severityEmoji = {
    critical: "🔴",
    major: "🟠",
    minor: "🟡",
  };

  let comment = `# 🤖 AI Code Review\n\n${aiResult.summary}\n\n`;

  if (aiResult.issues.length > 0) {
    comment += `## Issues Found\n\n`;

    for (const issue of aiResult.issues) {
      const emoji = severityEmoji[issue.severity as keyof typeof severityEmoji];
      comment += `### ${emoji} ${issue.severity.toUpperCase()}: ${issue.title}\n`;
      comment += `**File:** \`${issue.file}\` (Line ${issue.line})\n\n`;
      comment += `${issue.body}\n\n`;

      if (issue.fix) {
        comment += `**Suggested fix:**\n\`\`\`\n${issue.fix}\n\`\`\`\n\n`;
      }

      comment += `---\n\n`;
    }
  }

  comment += `<div align="center">\n  <sub>Powered by <strong>Codespect</strong> • Automated Code Intelligence</sub>\n</div>`;

  return comment;
}

/**
 * Example 4: Batching reviews for multiple PRs
 */
export async function exampleBatchReviews(
  token: string,
  reviews: Array<{
    owner: string;
    repo: string;
    pull_number: number;
    aiResult: any;
  }>
) {
  const octokit = new Octokit({ auth: token });
  const results = [];

  for (const review of reviews) {
    try {
      const { data: pull_request } = await octokit.rest.pulls.get({
        owner: review.owner,
        repo: review.repo,
        pull_number: review.pull_number,
      });

      const result = await postInlineReview(
        octokit,
        review.owner,
        review.repo,
        review.pull_number,
        pull_request,
        review.aiResult
      );

      results.push({
        pr: `${review.owner}/${review.repo}#${review.pull_number}`,
        success: true,
        ...result,
      });
    } catch (error) {
      results.push({
        pr: `${review.owner}/${review.repo}#${review.pull_number}`,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Example 5: Filter issues by severity before posting
 */
export async function exampleFilteredReview(
  token: string,
  owner: string,
  repo: string,
  pull_number: number,
  aiResult: any,
  minSeverity: "minor" | "major" | "critical" = "minor"
) {
  const octokit = new Octokit({ auth: token });
  
  const severityLevels = { minor: 1, major: 2, critical: 3 };
  const minLevel = severityLevels[minSeverity];

  // Filter issues by severity
  const filteredResult = {
    ...aiResult,
    issues: aiResult.issues.filter(
      (issue: any) => severityLevels[issue.severity as keyof typeof severityLevels] >= minLevel
    ),
  };

  const { data: pull_request } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
  });

  return await postInlineReview(
    octokit,
    owner,
    repo,
    pull_number,
    pull_request,
    filteredResult
  );
}

/**
 * Example 6: Real-world integration in API route
 */
export async function exampleAPIRoute(request: Request) {
  // This would typically be in app/api/review/route.ts or similar
  const body = await request.json();
  
  const { token, owner, repo, pull_number, aiResult } = body;

  if (!token || !owner || !repo || !pull_number || !aiResult) {
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const octokit = new Octokit({ auth: token });

    const { data: pull_request } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    });

    const result = await postInlineReview(
      octokit,
      owner,
      repo,
      pull_number,
      pull_request,
      aiResult
    );

    return Response.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Error posting review:", error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
