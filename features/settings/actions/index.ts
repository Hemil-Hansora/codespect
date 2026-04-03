"use server";

import { currentUser } from "@/features/auth/actions";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export const updateUserProfile = async (data: {
  name?: string;
  email?: string;
}) => {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  try {
    const updateUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        email: data.email,
      },
      select:{
        id: true,
        name: true,
        email: true,
      }
    });

    if(!updateUser) {
      throw new Error("Failed to update user profile");
    }
    revalidatePath("/dashboard/settings","page");
    return updateUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
};
