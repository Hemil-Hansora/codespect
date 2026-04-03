import { App } from "@/server"
import { treaty } from "@elysiajs/eden"

const baseUrl =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const api =
  treaty<App>(baseUrl)