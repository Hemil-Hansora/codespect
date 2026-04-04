import { reviewPullRequest } from "@/features/ai/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");
    console.log("Received GitHub webhook event:", event);

    if (event === "ping") {
      return NextResponse.json({ message: "pong" }, { status: 200 });
    }

    if (event === "pull_request") {
      const action = body.action;
      const prNumber = body.number;
      const repo = body.repository.full_name;

      const [owner, repoName] = repo.split("/");

      if (action === "opened" || action === "synchronize") {
        reviewPullRequest({ owner, repoName, prNumber })
          .then(() => console.log(`Review Completed for ${repo} #${prNumber}`))
          .catch((e) =>
            console.error(`Review Failed for ${repo} #${prNumber}:`, e),
          );
      }
    }

    return NextResponse.json({ message: "Event processed" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
