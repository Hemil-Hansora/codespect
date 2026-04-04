import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./db";
import {
  checkout,
  polar,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { polarClient, polarDiagnostics } from "@/features/payment/config/polar";
import { updatePolarCustomerId, upgradeUserSubscription } from "@/features/payment/lib/subscription";

// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ["repo"],
    },
  },
  trustedOrigins:["http://localhost:3000", process.env.NEXT_PUBLIC_APP_URL!],
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      getCustomerCreateParams: async ({ user }) => {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            `[Polar] signup customer create email=${user.email ?? "unknown"} server=${polarDiagnostics.server} token=${polarDiagnostics.tokenFingerprint}`,
          );
        }

        return {};
      },
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRODUCT_ID!,
              slug: "CodeSpect", // Custom slug for easy reference in Checkout URL, e.g. /checkout/CodeSpect
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL || "/dashboard/subscriptions?success=true",
          authenticatedUsersOnly: true,
        }),
        portal({
          returnUrl:
            process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3000/dashboard",
        }),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onSubscriptionActive: async (payload) => {
            const customerId = payload.data.customerId;
            const user = await db.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            });

            if (user) {
              await upgradeUserSubscription(
                user.id,
                "PRO",
                "ACTIVE",
                payload.data.id,
              );
            }
          },
          onSubscriptionCanceled: async (payload) => {
            const customerId = payload.data.customerId;
            const user = await db.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            });

            if (user) {
              await upgradeUserSubscription(
                user.id,
                user.subscriptionTier,
                "CANCELED",
              );
            }
          },
          onSubscriptionRevoked: async (payload) => {
            const customerId = payload.data.customerId;
            const user = await db.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            });

            if (user) {
              await upgradeUserSubscription(user.id, "FREE", "EXPIRED");
            }
          },
          onOrderPaid: async () => {},
          onCustomerCreated: async (payload) => {
            const user = await db.user.findUnique({
              where: {
                email: payload.data.email,
              },
            });

            if (user) {
              await updatePolarCustomerId(user.id, payload.data.id);
            }
          },
        }),
      ],
    }),
  ],
});
