"use server";

import { inngest } from "@/inngest/client";
import db from "@/lib/db";
import { getPullRequestDiff } from "@/module/github/lib/github";
import { canCreateReview, incrementReviewCount } from "@/module/payment/lib/subscription";

export const reviewPullRequest = async ({
  owner,
  repoName,
  prNumber,
}: {
  owner: string;
  repoName: string;
  prNumber: number;
}) => {
  try {
    const repository = await db.repository.findFirst({
      where: {
        owner,
        name: repoName,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new Error(
        `Repository ${owner}/${repoName} not found in the database. Please reconnect your repository.`,
      );
    }

    const canReview = await canCreateReview(repository.user.id, repository.id);

    if(!canReview){
      throw new Error(
        `You have reached the maximum number of reviews for your plan. Please upgrade your subscription to continue requesting reviews.`,
      )
    }

    const githubAccount = repository.user.accounts[0];
    if (!githubAccount.accessToken) {
      throw new Error(
        `GitHub access token not found for user ${repository.user.id}. Please reconnect your account.`,
      );
    }

    await inngest.send({
      name: "pr.review.requested",
      data: {
        owner,
        repoName,
        prNumber,
        userId: repository.user.id,
      },
    });

    await incrementReviewCount(repository.user.id , repository.id);

    return { success: true, message: "Pull request review initiated." };
  } catch (error) {
    try {
      const repository = await db.repository.findFirst({
        where: {
          owner,
          name: repoName,
        },
      });
      if (repository) {
        await db.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: "Faild to fetch PR",
            prURL: `https://github.com/${owner}/${repoName}/pull/${prNumber}`,
            status: "FAILED",
            review: `Failed to initiate review for PR #${prNumber} in ${owner}/${repoName} due to an error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        });
      }
    } catch (dberror) {
      console.error("Failed to save the review error to the database", dberror);
    }
  }
};
