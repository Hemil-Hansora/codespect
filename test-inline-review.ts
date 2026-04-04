/**
 * Test Script: Test Inline Review on a Real PR
 * 
 * Run this script to test the inline review feature on an actual PR
 * 
 * Usage:
 *   bun run test-inline-review.ts <owner> <repo> <pr_number>
 * 
 * Example:
 *   bun run test-inline-review.ts myorg myrepo 42
 */

import { Octokit } from "octokit";
import { postInlineReview } from "@/features/github";

async function testInlineReview() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error("❌ Usage: bun run test-inline-review.ts <owner> <repo> <pr_number>");
    console.error("Example: bun run test-inline-review.ts myorg myrepo 42");
    process.exit(1);
  }

  const [owner, repo, prNumberStr] = args;
  const pull_number = parseInt(prNumberStr, 10);

  if (isNaN(pull_number)) {
    console.error("❌ PR number must be a valid integer");
    process.exit(1);
  }

  // Get GitHub token from environment
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
  
  if (!token) {
    console.error("❌ GitHub token not found!");
    console.error("Set GITHUB_TOKEN or GITHUB_ACCESS_TOKEN environment variable");
    console.error("\nExample:");
    console.error("  export GITHUB_TOKEN=ghp_your_token_here");
    console.error("  bun run test-inline-review.ts myorg myrepo 42");
    process.exit(1);
  }

  console.log("🚀 Testing Inline Review Feature\n");
  console.log(`Repository: ${owner}/${repo}`);
  console.log(`PR Number: ${pull_number}\n`);

  try {
    const octokit = new Octokit({ auth: token });

    // Fetch PR details
    console.log("📥 Fetching PR details...");
    const { data: pull_request } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    });

    console.log(`✓ PR Title: ${pull_request.title}`);
    console.log(`✓ PR State: ${pull_request.state}`);
    console.log(`✓ Commit SHA: ${pull_request.head.sha}\n`);

    // Sample AI result for testing
    const aiResult = {
      issues: [
        {
          severity: "minor" as const,
          file: "README.md", // Update this to a file in your PR
          line: 1,
          title: "Test inline comment",
          body: "This is a test inline comment from the CodeSpect inline review feature. It demonstrates how comments appear directly on changed lines!",
        },
      ],
      summary: `**🧪 Test Review**

This is a test review to verify the inline comment feature is working correctly.

✅ Inline comments are posting to the diff
✅ The position mapping is working
✅ Comments appear on the correct lines

You can safely delete this test review from GitHub.`,
    };

    console.log("📝 Posting inline review...");
    const result = await postInlineReview(
      octokit,
      owner,
      repo,
      pull_number,
      pull_request,
      aiResult
    );

    console.log("\n✅ SUCCESS!\n");
    console.log(`📊 Results:`);
    console.log(`   • Inline comments posted: ${result.inlineComments}`);
    console.log(`   • Skipped issues: ${result.skippedIssues}`);
    console.log(`\n🔗 View the review at:`);
    console.log(`   ${pull_request.html_url}\n`);
    
    if (result.skippedIssues > 0) {
      console.log("ℹ️  Some issues were skipped because they're on lines not in the diff.");
      console.log("   Check the PR for a separate comment with these issues.\n");
    }

    console.log("✨ Test complete! Check your PR on GitHub.");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    
    if (error instanceof Error) {
      console.error("\nError details:", error.message);
      
      if (error.message.includes("404")) {
        console.error("\n💡 Tip: Make sure the PR exists and your token has access to this repo");
      } else if (error.message.includes("401")) {
        console.error("\n💡 Tip: Your GitHub token may be invalid or expired");
      } else if (error.message.includes("422")) {
        console.error("\n💡 Tip: The position mapping may be incorrect. Check file paths and line numbers");
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testInlineReview();
