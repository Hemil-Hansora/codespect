import { auth } from "@/lib/auth"
import { Elysia } from "elysia"
import { node } from "@elysiajs/node"

export const app = new Elysia({ prefix: "/api", adapter: node() })
  .mount(auth.handler)
  .get("/hello", () => "Hello, World!")

export type App = typeof app