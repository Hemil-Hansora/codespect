/**
 * CodeSpect Committable Suggestions Implementation
 * 
 * This module implements GitHub committable suggestions for inline PR reviews.
 * Users can apply AI-suggested fixes with one click.
 */

interface AIIssue {
  severity: "critical" | "major" | "minor";
  file: string;
  line: number;
  endLine?: number;
  title: string;
  body: string;
  fix?: string;
}

interface AIResult {
  issues: AIIssue[];
  summary: string;
  riskLevel: "critical" | "major" | "minor" | "safe";
}

interface OctokitComment {
  path: string;
  body: string;
  position?: number;
  start_line?: number;
  start_side?: "RIGHT";
  line?: number;
  side?: "RIGHT";
}

type PositionMap = Record<string, Record<number, number>>;

const SEVERITY_CONFIG = {
  critical: {
    badge: "🔴 Critical",
    prefix: "⚠️ Potential issue",
    label: "CRITICAL",
    urgency: "**Must fix before merge.**",
  },
  major: {
    badge: "🟠 Major",
    prefix: "⚠️ Potential issue",
    label: "MAJOR",
    urgency: "**Should fix before merge.**",
  },
  minor: {
    badge: "🟡 Minor",
    prefix: "💡 Suggestion",
    label: "MINOR",
    urgency: "**Consider fixing.**",
  },
} as const;

const RISK_LEVEL_CONFIG = {
  critical: { emoji: "🔴", label: "Do not merge" },
  major: { emoji: "🟠", label: "Merge with fixes" },
  minor: { emoji: "🟡", label: "Merge with minor fixes" },
  safe: { emoji: "🟢", label: "Ready to merge" },
} as const;

const SEVERITY_WEIGHT = { critical: 0, major: 1, minor: 2 } as const;

function sortIssuesBySeverity(issues: AIIssue[]): AIIssue[] {
  return [...issues].sort(
    (a, b) => SEVERITY_WEIGHT[a.severity] - SEVERITY_WEIGHT[b.severity]
  );
}

function buildCommentBody(issue: AIIssue): string {
  const config = SEVERITY_CONFIG[issue.severity];

  let body = `${config.prefix} | ${config.badge}\n\n---\n\n`;

  body += `**${issue.title}**\n\n${config.urgency}\n\n`;

  body += `${issue.body}\n\n`;

  if (issue.fix) {
    body += `🐛 **Proposed fix**\n\`\`\`suggestion\n${issue.fix}\n\`\`\``;
  } else {
    body += `ℹ️ **No autofix available**`;
  }

  body += `\n\n---\n<sub>CodeSpect · [Report false positive](https://github.com) · Powered by AI</sub>`;

  return body;
}

function buildReviewSummary(aiResult: AIResult): string {
  const riskConfig = RISK_LEVEL_CONFIG[aiResult.riskLevel];

  const counts = {
    critical: aiResult.issues.filter((i) => i.severity === "critical").length,
    major: aiResult.issues.filter((i) => i.severity === "major").length,
    minor: aiResult.issues.filter((i) => i.severity === "minor").length,
  };

  let summary = `## 🤖 CodeSpect Review — ${riskConfig.emoji} ${riskConfig.label}\n\n`;

  summary += `| Severity | Count |\n`;
  summary += `|----------|-------|\n`;
  summary += `| 🔴 Critical | ${counts.critical} |\n`;
  summary += `| 🟠 Major    | ${counts.major} |\n`;
  summary += `| 🟡 Minor    | ${counts.minor} |\n\n`;

  summary += `${aiResult.summary}\n\n`;

  summary += `---\n*Powered by CodeSpect — AI Code Intelligence*`;

  return summary;
}

function buildOctokitComment(
  issue: AIIssue,
  positionMap: PositionMap
): OctokitComment | null {
  const lineForPosition = issue.endLine ?? issue.line;
  const position = positionMap[issue.file]?.[lineForPosition];

  if (position === undefined) {
    return null;
  }

  const comment: OctokitComment = {
    path: issue.file,
    body: buildCommentBody(issue),
  };

  if (issue.endLine !== undefined) {
    comment.start_line = issue.line;
    comment.start_side = "RIGHT";
    comment.line = issue.endLine;
    comment.side = "RIGHT";
  } else {
    comment.position = position;
  }

  return comment;
}

function buildCommentsArray(
  issues: AIIssue[],
  positionMap: PositionMap
): { comments: OctokitComment[]; skipped: AIIssue[] } {
  const sortedIssues = sortIssuesBySeverity(issues);
  const comments: OctokitComment[] = [];
  const skipped: AIIssue[] = [];

  for (const issue of sortedIssues) {
    const comment = buildOctokitComment(issue, positionMap);

    if (comment) {
      comments.push(comment);
    } else {
      skipped.push(issue);
    }
  }

  return { comments, skipped };
}

export {
  buildCommentBody,
  buildOctokitComment,
  buildCommentsArray,
  buildReviewSummary,
  sortIssuesBySeverity,
  SEVERITY_CONFIG,
  RISK_LEVEL_CONFIG,
  type AIIssue,
  type AIResult,
  type OctokitComment,
  type PositionMap,
};