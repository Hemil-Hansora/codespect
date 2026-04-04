"use server";

import { currentUser } from "@/features/auth/actions";
import { createWebhook, getRepositories } from "@/features/github";
import { canConnectRepository } from "@/features/payment/lib/subscription";
import { inngest } from "@/inngest/client";
import db from "@/lib/db";



export const fetchRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const githubRepos = await getRepositories(page, perPage);

  const dbRepos = await db.repository.findMany({
    where: {
      userId: user.id,
    },
  });

  const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId));

  return githubRepos.map((repo) => ({
    ...repo,
    isConnected: connectedRepoIds.has(BigInt(repo.id)),
  }));
};

export const connectRepository = async (
  owner: string,
  repo: string,
  githubId: number,
) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const canConnectRepo = await canConnectRepository(user.id);
  if (!canConnectRepo) {
    throw new Error(
      "You have reached the maximum number of repositories for your plan. Please upgrade to connect more repositories.",
    );
  }
  const webhook = await createWebhook(owner, repo);

  if (!webhook) {
    throw new Error("Failed to create webhook for the repository.");
  }

  await db.repository.create({
    data: {
      userId: user.id,
      githubId: BigInt(githubId),
      name: repo,
      owner,
      fullName: `${owner}/${repo}`,
      url: `https://github.com/${owner}/${repo}`,
    },
  });
  // await incrementRepositoryCount(user.id);

  try {
    await inngest.send({
      name: "repository.connected",
      data: {
        owner,
        repo,
        userId: user.id.toString(),
      },
    });
  } catch (error) {
    throw new Error("Failed to send repository connected event to Inngest.");
  }
  return webhook;
};
