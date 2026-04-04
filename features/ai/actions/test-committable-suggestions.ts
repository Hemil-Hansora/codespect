/**
 * TEST: Committable Suggestions Feature
 * 
 * This file demonstrates and tests the committable suggestions functionality
 * for CodeSpect inline review comments.
 */

import { AIIssue, buildCommentBody, buildOctokitComment } from "@/features/github/committable-suggestions";


// Test cases for the committable suggestions feature
const testCases: AIIssue[] = [
  // STEP 1 — Single-line fix
  {
    severity: "critical",
    file: "backend/src/config/database.js",
    line: 42,
    title: "Typo causes undefined export at startup",
    body: "conectDB is exported as connectDB — consumers will throw TypeError on import.",
    fix: "const connectDB = async () => {"
  },

  // STEP 2 — Multi-line fix
  {
    severity: "major",
    file: "src/auth.js",
    line: 15,
    endLine: 17,
    title: "Missing error handling",
    body: "Function doesn't handle authentication failures properly.",
    fix: "try {\n  return await authenticate(token);\n} catch (error) {\n  throw new AuthError('Authentication failed');\n}"
  },

  // Issue without fix (should show "No autofix available")
  {
    severity: "minor",
    file: "components/Button.tsx",
    line: 8,
    title: "Consider prop validation",
    body: "Adding PropTypes or TypeScript interface would improve type safety.",
  },

  // Complex multi-line fix
  {
    severity: "critical",
    file: "lib/security.ts",
    line: 23,
    endLine: 28,
    title: "SQL injection vulnerability",
    body: "Raw SQL query with user input creates injection risk.",
    fix: "const query = db.prepare(`\n  SELECT * FROM users \n  WHERE id = ? AND status = ?\n`);\nconst result = query.get(userId, 'active');\nreturn result;"
  }
];

// Mock position map for testing
const mockPositionMap = {
  "backend/src/config/database.js": { 42: 156 },
  "src/auth.js": { 15: 89, 16: 90, 17: 91 },
  "components/Button.tsx": { 8: 45 },
  "lib/security.ts": { 23: 234, 24: 235, 25: 236, 26: 237, 27: 238, 28: 239 },
};

/**
 * Test the comment body building
 */
function testCommentBodies() {
  console.log("=".repeat(80));
  console.log("TESTING COMMENT BODY GENERATION");
  console.log("=".repeat(80));

  testCases.forEach((testCase, index) => {
    console.log(`\n--- Test Case ${index + 1}: ${testCase.title} ---`);
    const body = buildCommentBody(testCase);
    console.log(body);
  });
}

/**
 * Test the octokit comment object building
 */
function testOctokitComments() {
  console.log("\n" + "=".repeat(80));
  console.log("TESTING OCTOKIT COMMENT OBJECT GENERATION");
  console.log("=".repeat(80));

  testCases.forEach((testCase, index) => {
    console.log(`\n--- Test Case ${index + 1}: ${testCase.title} ---`);
    const comment = buildOctokitComment(testCase, mockPositionMap);
    console.log(JSON.stringify(comment, null, 2));
  });
}

/**
 * Test expected output formats
 */
function testExpectedFormats() {
  console.log("\n" + "=".repeat(80));
  console.log("EXPECTED GITHUB OUTPUT EXAMPLES");
  console.log("=".repeat(80));

  console.log(`
--- SINGLE-LINE COMMITTABLE SUGGESTION ---

⚠️ Potential issue | 🔴 Critical

**Typo causes undefined export at startup**

conectDB is exported as connectDB — consumers will throw TypeError on import.

🐛 **Proposed fix**

\`\`\`suggestion
const connectDB = async () => {
\`\`\`

[Apply suggestion] ← GitHub renders this button automatically
`);

  console.log(`
--- MULTI-LINE COMMITTABLE SUGGESTION ---

⚠️ Potential issue | 🟠 Major

**Missing error handling**

Function doesn't handle authentication failures properly.

🐛 **Proposed fix**

\`\`\`suggestion
try {
  return await authenticate(token);
} catch (error) {
  throw new AuthError('Authentication failed');
}
\`\`\`

[Apply suggestion] ← GitHub renders this button for lines 15-17
`);

  console.log(`
--- NO AUTOFIX AVAILABLE ---

💡 Suggestion | 🟡 Minor

**Consider prop validation**

Adding PropTypes or TypeScript interface would improve type safety.

ℹ️ **No autofix available**

(No suggestion block - GitHub shows this as regular comment)
`);
}

/**
 * Validate the implementation against requirements
 */
function validateImplementation() {
  console.log("\n" + "=".repeat(80));
  console.log("IMPLEMENTATION VALIDATION");
  console.log("=".repeat(80));

  // Test STEP 1: Single-line suggestion
  const singleLineIssue = testCases[0];
  const singleLineComment = buildOctokitComment(singleLineIssue, mockPositionMap);
  
  console.log("\n✅ STEP 1 - Single-line committable suggestion:");
  console.log("   - Uses 'position' field:", singleLineComment?.position !== undefined);
  console.log("   - No start_line/line fields:", !singleLineComment?.start_line && !singleLineComment?.line);
  console.log("   - Contains suggestion block:", singleLineComment?.body.includes('```suggestion'));

  // Test STEP 2: Multi-line suggestion  
  const multiLineIssue = testCases[1];
  const multiLineComment = buildOctokitComment(multiLineIssue, mockPositionMap);
  
  console.log("\n✅ STEP 2 - Multi-line committable suggestion:");
  console.log("   - Uses start_line field:", multiLineComment?.start_line === 15);
  console.log("   - Uses line field (end):", multiLineComment?.line === 17);
  console.log("   - Uses RIGHT side:", multiLineComment?.side === "RIGHT");
  console.log("   - No position field:", multiLineComment?.position === undefined);

  // Test STEP 3: Autofix badges
  const withFix = buildCommentBody(singleLineIssue);
  const withoutFix = buildCommentBody(testCases[2]);
  
  console.log("\n✅ STEP 3 - Autofix badges:");
  console.log("   - With fix shows '🐛 Proposed fix':", withFix.includes('🐛 **Proposed fix**'));
  console.log("   - Without fix shows 'ℹ️ No autofix':", withoutFix.includes('ℹ️ **No autofix available**'));

  // Test STEP 6: Raw fix content
  console.log("\n✅ STEP 6 - Raw fix content:");
  console.log("   - Fix field used verbatim:", withFix.includes(singleLineIssue.fix!));
  console.log("   - No extra formatting added:", !withFix.includes('```javascript') && !withFix.includes('```ts'));
}

// Run all tests
if (require.main === module) {
  testCommentBodies();
  testOctokitComments();
  testExpectedFormats();
  validateImplementation();
}

export {
  testCases,
  mockPositionMap,
  testCommentBodies,
  testOctokitComments,
  testExpectedFormats,
  validateImplementation,
};