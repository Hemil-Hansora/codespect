"use server";

import { SubscriptionStatus, SubscriptionTier } from "@/generated/prisma/enums";
import {
  getRemainingLimits,
  updatePolarCustomerId,
  upgradeUserSubscription,
  UserLimits,
} from "../lib/subscription";
import { currentUser } from "@/features/auth/actions";
import { polarClient } from "../config/polar";

export interface SubscriptionData {
  user: {
    id: string;
    email: string;
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus | null;
    polarCustomerId: string | null;
    polarSubscriptionId: string | null;
  } | null;
  limits: UserLimits | null;
}

export const getSubscriptionData = async (): Promise<SubscriptionData> => {
  const user = await currentUser();
  if (!user) {
    return {
      user: null,
      limits: null,
    };
  }
  const limit = await getRemainingLimits(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus || null,
      polarCustomerId: user.polarCustomerId,
      polarSubscriptionId: user.polarSubscriptionId,
    },
    limits: limit,
  };
};

export const syncSubscriptionStatus = async () => {
  const user = await currentUser();
  console.log("Syncing subscription for user:", user);
  
  if (!user) {
    return {
      success: false,
      message: "User not found. Please sign in.",
    };
  }

  let polarCustomerId = user.polarCustomerId;

  try {
    // If user doesn't have a Polar customer ID, try to find them by email
    if (!polarCustomerId) {
      console.log("No polarCustomerId, searching by email:", user.email);
      
      const customers = await polarClient.customers.list({
        email: user.email,
      });

      const existingCustomer = customers.result?.items?.[0];
      
      if (existingCustomer) {
        // Found the customer, update our database
        console.log("Found Polar customer:", existingCustomer.id);
        await updatePolarCustomerId(user.id, existingCustomer.id);
        polarCustomerId = existingCustomer.id;
      } else {
        // No customer found in Polar
        return {
          success: true,
          message: "No payment account linked yet. You're on the free plan.",
          status: SubscriptionStatus.CANCELED,
        };
      }
    }

    const result = await polarClient.subscriptions.list({
      customerId: polarCustomerId,
    });

    const subscription = result.result?.items || [];
    console.log("Found subscriptions:", subscription.length);

    const activeSubscription = subscription.find(
      (sub) => sub.status === "active",
    );
    const latestSubscription = subscription[0];

    if (activeSubscription) {
      console.log("Active subscription found:", activeSubscription.id);
      await upgradeUserSubscription(
        user.id,
        SubscriptionTier.PRO,
        SubscriptionStatus.ACTIVE,
        activeSubscription.id,
      );
      return {
        success: true,
        message: "Subscription is active and updated.",
        status: SubscriptionStatus.ACTIVE,
      };
    } else if (latestSubscription) {
      const status =
        latestSubscription.status === "canceled"
          ? SubscriptionStatus.CANCELED
          : SubscriptionStatus.EXPIRED;

      if (latestSubscription.status !== "active") {
        await upgradeUserSubscription(
          user.id,
          SubscriptionTier.FREE,
          status,
          latestSubscription.id,
        );
      }
      return {
        success: true,
        message: `Subscription is ${latestSubscription.status} and updated.`,
        status: status,
      };
    }
    return {
      success: true,
      message: "No active subscription found. User is on free plan.",
      status: SubscriptionStatus.CANCELED,
    };
  } catch (error) {
    console.error("Error syncing subscription status:", error);
    return {
      success: false,
      message: "Error syncing subscription status.",
    };
  }
};
