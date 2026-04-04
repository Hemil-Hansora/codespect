import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
export const { signOut, signIn, useSession , customer, checkout } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ,
  plugins: [polarClient()],
});
