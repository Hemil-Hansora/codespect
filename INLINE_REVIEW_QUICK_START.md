# Quick Start: Inline Review Implementation

## ✅ Installation Complete

```bash
npm install parse-diff  # Already installed ✓
```

## 🚀 Quick Usage

```typescript
import { Octokit } from "octokit";
import { postInlineReview } from "@/features/github";

// Initialize Octokit
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
      file: "src/database.js",
      line: 5,
      title: "Typo in function name",
      body: "conectDB should be connectDB",
      fix: "const connectDB = async () => {"  // optional
    }
  ],
  summary: "Found 1 critical issue"
};

// Post inline review
const result = await postInlineReview(
  octokit,
  "your-org",
  "your-repo", 
  123,
  pull_request,
  aiResult
);

console.log(`Posted ${result.inlineComments} inline comments`);
```

## 📋 What Was Implemented

### New Function Added
- **Location**: `/features/github/index.ts`
- **Function**: `postInlineReview()`
- **Export**: Already exported, ready to use

### Features Implemented

✅ **STEP 1** — Installed `parse-diff` package  
✅ **STEP 2** — Fetches PR diff with proper headers  
✅ **STEP 3** — Builds position lookup map from parsed diff  
✅ **STEP 4** — Creates comment array with severity badges  
✅ **STEP 5** — Posts review with `octokit.pulls.createReview()`  
✅ **STEP 6** — Handles skipped issues in separate comment  
✅ **STEP 7** — Error handling with 422 retry logic  

### Severity Badges

- **Critical**: ⚠️ Potential issue | 🔴 Critical
- **Major**: ⚠️ Potential issue | 🟠 Major
- **Minor**: 💡 Suggestion | 🟡 Minor

### GitHub Suggestion Format

If you provide a `fix` field, it will be formatted as a GitHub suggestion that users can accept with one click:

```suggestion
const connectDB = async () => {
```

## 🔄 Migration Path

### Old Method (Single Comment)
```typescript
import { postReviewComment } from "@/features/github";

await postReviewComment({
  token,
  owner,
  repo,
  prNumber,
  review: "Your review..."
});
```

### New Method (Inline Comments) ⭐
```typescript
import { postInlineReview } from "@/features/github";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: token });
const { data: pr } = await octokit.rest.pulls.get({
  owner, repo, pull_number: prNumber
});

await postInlineReview(octokit, owner, repo, prNumber, pr, aiResult);
```

## 📦 Files Created

1. **Implementation**: `/features/github/index.ts` (updated)
2. **Documentation**: `/INLINE_REVIEW_IMPLEMENTATION.md`
3. **Examples**: `/INLINE_REVIEW_USAGE_EXAMPLES.tsx`
4. **Quick Start**: `/INLINE_REVIEW_QUICK_START.md` (this file)

## 🧪 Testing

1. Create a test PR with some changes
2. Run your AI review to generate the `aiResult` object
3. Call `postInlineReview()` with the result
4. Check that comments appear on the correct lines in GitHub

## ⚠️ Important Notes

- **Commit SHA Required**: Must use `pull_request.head.sha`
- **Position Indexing**: Starts at 1, increments per line, resets per file
- **File Paths**: Must match exactly (case-sensitive)
- **Line Numbers**: Must be actual line numbers in the file
- **Deleted Lines**: Comments can be posted on deleted lines too

## 🐛 Troubleshooting

### Comments not appearing?
- Verify `commit_id` matches latest commit
- Check file paths are exact
- Ensure line numbers are in the diff

### 422 Error?
- The function automatically retries with summary only
- Check logs for invalid positions

### All issues skipped?
- Issues are on lines not changed in the PR
- They'll appear in a separate comment

## 📖 Need More Help?

See the detailed documentation files:
- `INLINE_REVIEW_IMPLEMENTATION.md` - Complete guide
- `INLINE_REVIEW_USAGE_EXAMPLES.tsx` - 6 usage examples

## ✨ What's Next?

You can now:
1. Update your webhook handlers to use `postInlineReview()`
2. Keep the old `postReviewComment()` as a fallback
3. Test with real PRs
4. Customize the severity badges or formatting
5. Add filters (e.g., only show critical/major issues)

---

**Need to customize?** The function is at `/features/github/index.ts` starting at line ~375.
