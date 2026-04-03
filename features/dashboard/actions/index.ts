"use server";

import { currentUser } from "@/features/auth/actions";
import { fetchUserCotributions, getGitHubToken } from "@/features/github";
import db from "@/lib/db";


import { Octokit } from "octokit";
import { date, number } from "zod";

export const getDashboardStats = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  try {
    const token = await getGitHubToken();
    const octokit = new Octokit({ auth: token });

    const { data: githubUser } = await octokit.rest.users.getAuthenticated();

    const totalRepo = githubUser.public_repos + (githubUser.total_private_repos || 0);

    // Fetch all data in parallel for better performance
    const [calender, prsData, totalAIReviews] = await Promise.all([
      fetchUserCotributions(token, githubUser.login),
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${githubUser.login} type:pr`,
        per_page: 1,
      }),
      db.review.count(),
    ]);

    if (!calender) {
      throw new Error("Failed to fetch contributions");
    }

    const totalCommits = calender.totalContributions || 0;
    const totalPRs = prsData.data.total_count || 0;

    return {
      totalRepo,
      totalCommits,
      totalPRs,
      totalAIReviews,
    };
  } catch (error) {
    console.log("Error fetching dashboard stats:", error);
    return {
      totalRepo: 0,
      totalCommits: 0,
      totalPRs: 0,
      totalAIReviews: 0,
    };
  }
};

export const getMonthlyActivity = async () => {
  const currentUserData = await currentUser();
  if (!currentUserData) {
    throw new Error("Unauthorized");
  }
  try {
    const token = await getGitHubToken();
    const octokit = new Octokit({ auth: token });

    const { data: githubUser } = await octokit.rest.users.getAuthenticated();

    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

    // Fetch all data in parallel for better performance
    const [calender, reviews, prsData] = await Promise.all([
      fetchUserCotributions(token, githubUser.login),
      db.review.findMany({
        where: {
          repository: {
            userId: currentUserData.id,
          },
          createdAt: {
            gte: sixMonthAgo,
          },
        },
        select: {
          createdAt: true,
        },
      }),
      octokit.rest.search.issuesAndPullRequests({
        q: `author:${githubUser.login} type:pr created:>${
          sixMonthAgo.toISOString().split("T")[0]
        }`,
        per_page: 100,
      }),
    ]);

    if (!calender || !calender.weeks) {
      return [];
    }
    const monthlyData: {
      [key: string]: {
        commits: number;
        prs: number;
        review: number;
      };
    } = {};

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyData[monthKey] = {
        commits: 0,
        prs: 0,
        review: 0,
      };
    }

    calender.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].commits += day.contributionCount;
        }
      });
    });

    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].review += 1;
      }
    });

    prsData.data.items.forEach((pr) => {
      const date = new Date(pr.created_at);
      const monthKey = monthNames[date.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].prs += 1;
      }
    });

    return Object.keys(monthlyData).map((month) => ({
      month,
      ...monthlyData[month],
    }));
  } catch (error) {
    console.log("Error fetching monthly activity:", error);
    return [];
  }
};

export const getContributionStates = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  try {
    const token = await getGitHubToken();
    const octokit = new Octokit({ auth: token });
    const { data: githubUser } = await octokit.rest.users.getAuthenticated();
    const calender = await fetchUserCotributions(token, githubUser.login);
    if (!calender) {
      return null;
    }

    const contributions = calender.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: Math.min(4, Math.floor(day.contributionCount / 3)),
      })),
    );

    return { contributions, totalContributions: calender.totalContributions };
  } catch (error) {
    console.log("Error fetching contribution states:", error);
    return null;
  }
};
