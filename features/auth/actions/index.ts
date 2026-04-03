"use server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";

export const currentUser = async () => {
  try { 
    const session = await auth.api.getSession({
      headers:await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    return user;
  } catch (error) {
    console.log("Error fetching current user:", error);
    return null;
  }
};
