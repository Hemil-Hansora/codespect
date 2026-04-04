# Inline Review Implementation Guide

## Overview
This implementation upgrades CodeSpect from posting single PR comments to posting inline diff comments that appear directly on changed lines, just like CodeRabbit.

## Installation
```bash
npm install parse-diff
# or
bun add parse-diff
```

## Complete Implementation

The `postInlineReview` function has been added to `/features/github/index.ts` with the following features:

### Function Signature
```typescript
async function postInlineReview(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number,
  pull_request: any,
  aiResult: AIResult
)
```

### Input Format (AIResult)
```typescript
interface AIIssue {
  severity: "critical" | "major" | "minor";
  file: string;
  line: number;
  title: string;
  body: string;
  fix?: string;  // Optional suggested fix
}

interface AIResult {
  issues: AIIssue[];
  summary: string;
}
```

### Example Usage

```typescript
import { Octokit } from "octokit";
import { postInlineReview } from "@/features/github";

const octokit = new Octokit({ auth: token });

// Get PR details
const { data: pull_request } = await octokit.rest.pulls.get({
  owner: "your-org",
  repo: "your-repo",
  pull_number: 123,
});

// Your AI review result
const aiResult = {
  issues: [
    {
      severity: "critical",
      file: "backend/src/config/database.js",
      line: 5,
      title: "Typo in function name",
      body: "conectDB should be connectDB",
      fix: "const connectDB = async () => {"
    },
    {
      severity: "minor",
      file: "frontend/components/Button.tsx",
      line: 12,
      title: "Missing prop validation",
      body: "Consider adding PropTypes or TypeScript interface for better type safety"
    }
  ],
  summary: "Found 2 issues: 1 critical, 1 minor. Please review the inline comments for details."
};

// Post the inline review
const result = await postInlineReview(
  octokit,
  "your-org",
  "your-repo",
  123,
  pull_request,
  aiResult
);

console.log(`Posted ${result.inlineComments} inline comments`);
console.log(`Skipped ${result.skippedIssues} issues outside diff range`);
```

## How It Works

### Step 1: Fetch PR Diff
Fetches the raw unified diff using GitHub's diff media type:
```typescript
const { data: rawDiff } = await octokit.rest.pulls.get({
  owner,
  repo,
  pull_number,
  headers: {
    accept: "application/vnd.github.v3.diff",
  },
});
```

### Step 2: Parse Diff & Build Position Map
Uses `parse-diff` to convert the raw diff into structured data, then creates a position lookup map:
```typescript
const parsedDiff = parseDiff(rawDiff);
const positionMap: Record<string, Record<number, number>> = {};

for (const file of parsedDiff) {
  let position = 0;
  
  for (const chunk of file.chunks) {
    for (const change of chunk.changes) {
      position++; // Increments for EVERY line
      
      if (change.type === "add" && file.to) {
        positionMap[file.to][change.ln] = position;
      } else if (change.type === "del" && file.from) {
        positionMap[file.from][change.ln] = position;
      }
    }
  }
}
```

**Key Point:** The `position` counter increments for every line (context, additions, deletions) and resets to 0 for each file.

### Step 3: Build Comments Array
Maps each issue to a position and builds the comment body with severity badges:

- **Critical**: ⚠️ Potential issue | 🔴 Critical
- **Major**: ⚠️ Potential issue | 🟠 Major  
- **Minor**: 💡 Suggestion | 🟡 Minor

If a `fix` is provided, it's formatted as a GitHub suggestion:
```markdown
```suggestion
const connectDB = async () => {
` ``
```

### Step 4: Post Review
Calls `octokit.pulls.createReview()` with:
- `commit_id`: Latest commit SHA (required)
- `event`: "COMMENT"
- `body`: Summary with branding
- `comments`: Array of inline comments

### Step 5: Error Handling
If the review fails with 422 (Unprocessable Entity), retries with an empty comments array to ensure the summary still posts.

### Step 6: Handle Skipped Issues
Issues outside the diff range are posted as a separate comment listing all skipped items with their file paths and line numbers.

## Return Value
```typescript
{
  success: true,
  inlineComments: number,  // Count of inline comments posted
  skippedIssues: number    // Count of issues outside diff range
}
```

## Migration from Old Method

### Before (Single Comment)
```typescript
import { postReviewComment } from "@/features/github";

await postReviewComment({
  token,
  owner,
  repo,
  prNumber,
  review: "Your review text..."
});
```

### After (Inline Comments)
```typescript
import { postInlineReview } from "@/features/github";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: token });

const { data: pull_request } = await octokit.rest.pulls.get({
  owner,
  repo,
  pull_number: prNumber,
});

await postInlineReview(
  octokit,
  owner,
  repo,
  prNumber,
  pull_request,
  aiResult  // Your AI review result
);
```

## Important Notes

1. **Commit SHA Required**: The `commit_id` parameter must be the latest commit SHA from `pull_request.head.sha`. This ensures comments appear on the correct version.

2. **Position Calculation**: GitHub's position is 1-indexed and increments for every line in the diff (including context lines). It resets for each file.

3. **Deleted Lines**: Use `change.ln` for deleted lines (the line number in the old file), not `change.ln1`.

4. **Context Lines**: Normal/context lines (type === "normal") can also be commented on.

5. **Error Recovery**: If inline comments fail, the summary will still post.

6. **Suggestion Format**: GitHub's suggestion format allows users to accept the fix with one click.

## Testing Tips

1. Create a test PR with known changes
2. Run your AI review to get issues
3. Call `postInlineReview` and verify comments appear on the correct lines
4. Test edge cases:
   - Issues on deleted lines
   - Issues outside the diff range
   - Issues with and without fixes
   - Large PRs with many files

## Troubleshooting

### Comments Not Appearing
- Verify `commit_id` matches the latest commit
- Check that line numbers match the actual lines in the diff
- Ensure the file path matches exactly (case-sensitive)

### 422 Unprocessable Entity Error
- One or more positions are invalid
- Check the position calculation logic
- Verify the file exists in the diff

### Skipped Issues
- These are issues on lines not changed in the PR
- They'll appear in a separate comment
- This is normal behavior for unchanged files

## Example Output

### Inline Comment
![Inline Comment Example](inline-comment-example.png)

### Summary Review
```markdown
# 🤖 AI Code Review

Found 5 issues: 2 critical, 2 major, 1 minor. 
Great work on the refactoring! Please address the critical issues before merging.

📝 **5 inline comments posted on changed lines**

---
Powered by Codespect • Automated Code Intelligence
```

### Skipped Issues Comment
```markdown
> ⚠️ Outside diff range — issues found in files not included in this diff

### ⚠️ Potential issue | 🔴 Critical
**File:** `backend/src/auth.js` (Line 42)
**Missing error handling**

The authentication function doesn't catch errors properly.

---
Powered by Codespect • Automated Code Intelligence
```
