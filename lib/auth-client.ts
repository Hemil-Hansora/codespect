import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
export const { signOut, signIn, useSession , customer, checkout } = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [polarClient()],
});
