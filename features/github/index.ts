"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Octokit } from "octokit";
import { currentUser } from "../auth/actions";

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
