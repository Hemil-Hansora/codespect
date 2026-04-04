"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Octokit } from "octokit";
import { currentUser } from "../auth/actions";
import parseDiff from "parse-diff";
import {
  buildCommentsArray,
  buildCommentBody,
  buildReviewSummary,
  sortIssuesBySeverity,
  SEVERITY_CONFIG,
  type AIIssue,
  type AIResult,
  type OctokitComment,
} from "./committable-suggestions";

export const getGitHubToken = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const account = await db.account.findFirst({
    where: {
      userId: user.id,
      providerId: "github",
    },
  });

  if (!account?.accessToken) {
    throw new Error("No GitHub access token found");
  }

  return account.accessToken;
};

export const fetchUserCotributions = async (
  token: string,
  username: string,
) => {
  if (!token) {
    throw new Error("No GitHub access token provided");
  }

  const octokit = new Octokit({ auth: token });

  const query = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar{
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
        }
    }
}}`;

  interface contributionData {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              color: string;
            }[];
          }[];
        };
      };
    };
  }

  try {
    const response: contributionData = await octokit.graphql(query, {
      username,
    });
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching contributions:", error);
    throw new Error("Failed to fetch contributions from GitHub");
  }
};

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const token = await getGitHubToken();
  if (!token) {
    throw new Error("No GitHub access token found");
  }
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    per_page: perPage,
    page: page,
    visibility: "all",
  });
  return data;
};

export const createWebhook = async (owner: string, repo: string) => {
  const token = await getGitHubToken();
  if (!token) {
    throw new Error("No GitHub access token found");
  }
  const octokit = new Octokit({ auth: token });

  const webhookURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`;

  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  const existingHook = hooks.find((hook) => hook.config.url === webhookURL);

  if (existingHook) {
    return existingHook;
  }
  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookURL,
      content_type: "json",
    },
    events: ["pull_request"],
  });

  return data;
};

export const deleteWebhook = async (owner: string, repo: string) => {
  const token = await getGitHubToken();
  if (!token) {
    throw new Error("No GitHub access token found");
  }
  const octokit = new Octokit({ auth: token });

  const webhookURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`;
  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });
    const hooksToDelete = hooks.find((hook) => hook.config.url === webhookURL);
    if (hooksToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hooksToDelete.id,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return false;
  }
};

export const getConnenctedRepositories = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  try {
    const repos = await db.repository.findMany({
      where: { userId: user.id },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return repos;
  } catch (error) {
    console.error("Error fetching connected repositories:", error);
    throw new Error("Failed to fetch connected repositories");
  }
};

export const disconnectRepository = async (repoId: number) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  try {
    const repos = await db.repository.findUnique({
      where: { id: repoId, userId: user.id },
    });

    if (!repos) {
      throw new Error("Repository not found");
    }

    await deleteWebhook(repos.owner, repos.name);

    await db.repository.deleteMany({
      where: {
        id: repoId,
        userId: user.id,
      },
    });
    revalidatePath("/dashboard/repositories", "page");
    revalidatePath("/dashboard/settings", "page");
    return true;
  } catch (error) {
    console.error("Error disconnecting repository:", error);
    throw new Error("Failed to disconnect repository");
  }
};

export const disconnectAllRepositories = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  try {
    const repos = await db.repository.findMany({
      where: { userId: user.id },
    });

    Promise.all(
      repos.map(async (repo) => {
        await deleteWebhook(repo.owner, repo.name);
      }),
    );
    await db.repository.deleteMany({
      where: {
        userId: user.id,
      },
    });
    revalidatePath("/dashboard/repositories", "page");
    revalidatePath("/dashboard/settings", "page");
    return true;
  } catch (error) {
    console.error("Error disconnecting all repositories:", error);
    throw new Error("Failed to disconnect all repositories");
  }
};

export const getRepoFileContents = async (data: {
  token: string;
  owner: string;
  repo: string;
  path?: string | undefined;
}): Promise<{ path: string; content: string }[]> => {
  const octokit = new Octokit({ auth: data.token });
  const { data: content } = await octokit.rest.repos.getContent({
    owner: data.owner,
    repo: data.repo,
    path: data.path || "",
  });

  if (!Array.isArray(content)) {
    if (content.type === "file" && content.content) {
      return [
        {
          path: content.path,
          content: Buffer.from(content.content, "base64").toString("utf-8"),
        },
      ];
    }
    return [];
  }

  let files: { path: string; content: string }[] = [];

  for (const item of content) {
    if (item.type === "file") {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: data.owner,
        repo: data.repo,
        path: item.path,
      });

      if (
        !Array.isArray(fileData) &&
        fileData.type === "file" &&
        fileData.content
      ) {
        if (
          !item.path.match(
            /\.(png|jpg|jpeg|gif|svg|ico|lock|exe|dll|bin|class|jar|war|ear|pdf|zip|tar|gz|mp3|mp4|avi|mov|wmv|flv|mkv)$/i,
          )
        ) {
          files.push({
            path: item.path,
            content: Buffer.from(fileData.content, "base64").toString("utf-8"),
          });
        }
      }
    } else if (item.type === "dir") {
      const subFiles = await getRepoFileContents({
        token: data.token,
        owner: data.owner,
        repo: data.repo,
        path: item.path,
      });
      files = files.concat(subFiles);
    }
  }
  return files;
};

export const getPullRequestDiff = async ({
  token,
  owner,
  repo,
  prNumber,
}: {
  token: string;
  owner: string;
  repo: string;
  prNumber: number;
}) => {
  const octokit = new Octokit({ auth: token });

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: "diff",
    },
  });

  return {
    diff: diff as unknown as string,
    title: pr.title,
    description: pr.body || "",
  };
};

export const postReviewComment = async ({
  token,
  owner,
  repo,
  prNumber,
  review,
}: {
  token: string;
  owner: string;
  repo: string;
  prNumber: number;
  review: string;
}) => {
  const octokit = new Octokit({ auth: token });

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `# 🤖 AI Code Review

${review}

---
<div align="center">
  <sub>Powered by <strong>Codespect</strong> • Automated Code Intelligence</sub>
</div>
`,
  });
};

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

    // STEP 4 — Build the comments array using committable suggestions
    const { comments: commentsArray, skipped: skippedIssues } = buildCommentsArray(
      aiResult.issues,
      positionMap
    );

    // Build summary body using the new buildReviewSummary function
    const summaryBody = buildReviewSummary(aiResult);

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
        const config = SEVERITY_CONFIG[issue.severity];
        
        skippedBody += `### ${config.prefix} | ${config.badge}\n`;
        skippedBody += `**File:** \`${issue.file}\` (Line ${issue.line}${issue.endLine ? `-${issue.endLine}` : ''})\n`;
        skippedBody += `**${issue.title}**\n\n`;
        skippedBody += `${config.urgency}\n\n`;
        skippedBody += `${issue.body}\n\n`;

        if (issue.fix) {
          skippedBody += `🐛 **Proposed fix**\n\`\`\`\n${issue.fix}\n\`\`\`\n\n`;
        } else {
          skippedBody += `ℹ️ **No autofix available**\n\n`;
        }

        skippedBody += `---\n\n`;
      }

      skippedBody += `<sub>CodeSpect · [Report false positive](https://github.com) · Powered by AI</sub>`;

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
