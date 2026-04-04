"use server";

import { Octokit } from "octokit";
import { postInlineReview } from "@/features/github";
import { getGitHubToken } from "@/features/github";
import db from "@/lib/db";

export async function testInlineReviewAction(
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const token = await getGitHubToken();
    const octokit = new Octokit({ auth: token });

    // Fetch PR details
    const { data: pull_request } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    // Sample AI result for testing
    const aiResult = {
      issues: [
        {
          severity: "minor" as const,
          file: "README.md",
          line: 1,
          title: "Test inline comment",
          body: "This is a test inline comment from CodeSpect to verify the inline review feature is working correctly!",
        },
      ],
      summary: `**🧪 Test Review**

This is a test review to verify the inline comment feature is working.

✅ Inline comments are posting correctly
✅ Position mapping is working
✅ Comments appear on the right lines

You can safely delete this test review.`,
      riskLevel: "minor" as const,
    };

    const result = await postInlineReview(
      octokit,
      owner,
      repo,
      prNumber,
      pull_request,
      aiResult
    );

    return {
      success: true,
      message: `Posted ${result.inlineComments} inline comments, ${result.skippedIssues} skipped`,
      prUrl: pull_request.html_url,
    };
  } catch (error) {
    console.error("Test failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function triggerReviewForPR(
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const repository = await db.repository.findFirst({
      where: {
        owner,
        name: repo,
      },
      include: {
        user: true,
      },
    });

    if (!repository) {
      throw new Error("Repository not found");
    }

    const { reviewPullRequest } = await import("@/features/ai/actions");
    
    await reviewPullRequest({
      owner,
      repoName: repo,
      prNumber,
    });

    return {
      success: true,
      message: "Review triggered successfully",
    };
  } catch (error) {
    console.error("Failed to trigger review:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
