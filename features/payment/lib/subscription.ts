import { SubscriptionStatus, SubscriptionTier } from "@/generated/prisma/enums";
import db from "@/lib/db";

export interface UserLimits {
  tier: SubscriptionTier;
  repository: {
    current: number;
    limit: number | null;
    canAdd: boolean;
  };
  review: {
    [repositoryId: string]: {
      current: number;
      limit: number | null;
      canAdd: boolean;
    };
  };
}

const TIER_LIMITS = {
  FREE: {
    repositories: 5,
    reviewsPerRepo: 5,
  },
  PRO: {
    repositories: null,
    reviewsPerRepo: null,
  },
} as const;

export const getUserTier = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionTier: true,
    },
  });

  return (user?.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE;
};

export const getUserUsage = async (userId: string) => {
  let usage = await db.userUsage.findUnique({
    where: {
      userId,
    },
  });

  if (!usage) {
    usage = await db.userUsage.create({
      data: {
        userId,
        repositoryCount: 0,
        reviewCount: {},
      },
    });
  }
  return usage;
};

export const canConnectRepository = async (userId: string) => {
  const tier = await getUserTier(userId);

  if (tier === "PRO") {
    return true;
  }

  const usage = await getUserUsage(userId);
  const limit = TIER_LIMITS.FREE.repositories;

  return usage.repositoryCount < limit;
};

export const canCreateReview = async (userId: string, repositoryId: number) => {
  const tier = await getUserTier(userId);
  if (tier === "PRO") {
    return true;
  }

  const usage = await getUserUsage(userId);
  const limit = TIER_LIMITS.FREE.reviewsPerRepo;
  const reviewCount = usage.reviewCount as Record<string, number>;
  const currentCount = reviewCount[repositoryId] || 0;

  return currentCount < limit;
};

export const incrementRepositoryCount = async (userId: string) => {
  await db.userUsage.upsert({
    where: { userId },
    create: {
      userId,
      repositoryCount: 1,
      reviewCount: {},
    },
    update: {
      repositoryCount: { increment: 1 },
    },
  });
};

export const decrementRepositoryCount = async (userId: string) => {
  const usage = await getUserUsage(userId);
  if (usage.repositoryCount > 0) {
    await db.userUsage.update({
      where: { userId },
      data: {
        repositoryCount: { decrement: 1 },
      },
    });
  }
};

export const incrementReviewCount = async (
  userId: string,
  repositoryId: number,
) => {
  const usage = await getUserUsage(userId);
  const reviewCount = usage.reviewCount as Record<string, number>;

  reviewCount[repositoryId] = (reviewCount[repositoryId] || 0) + 1;

  await db.userUsage.update({
    where: { userId },
    data: {
      reviewCount,
    },
  });
};

export const getRemainingLimits = async (userId: string) => {
  const tier = await getUserTier(userId);
  const usage = await getUserUsage(userId);
  const reviewCount = usage.reviewCount as Record<string, number>;

  const limits: UserLimits = {
    tier,
    repository: {
      current: usage.repositoryCount,
      limit: TIER_LIMITS[tier].repositories,
      canAdd:
        tier === "PRO" || usage.repositoryCount < TIER_LIMITS.FREE.repositories,
    },
    review: {},
  };

  const repositories = await db.repository.findMany({
    where: { userId },
    select: { id: true },
  });

  for (const repo of repositories) {
    const currentCount = reviewCount[repo.id] || 0;
    limits.review[repo.id] = {
      current: currentCount,
      limit: TIER_LIMITS[tier].reviewsPerRepo,
      canAdd: tier === "PRO" || currentCount < TIER_LIMITS.FREE.reviewsPerRepo,
    };
  }
  return limits;
};

export const upgradeUserSubscription = async (
  userId: string,
  newTier: SubscriptionTier,
  status: SubscriptionStatus,
  polarSubscriptionId?: string,
) => {
  await db.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: newTier,
      subscriptionStatus: status,
      polarSubscriptionId: polarSubscriptionId || undefined,
    },
  });
};


export const updatePolarCustomerId = async (userId: string, polarCustomerId: string) => {
    await db.user.update({
        where:{id:userId},
        data:{
            polarCustomerId
        }
    })
}