import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        const body = await req.json();
        const event = req.headers.get("x-github-event");
        console.log("Received GitHub webhook event:", event);

        if(event==="ping"){
            return NextResponse.json({message: "pong"}, {status:200});
        }

        //TODO: Handle other GitHub webhook events here

        return NextResponse.json({message: "Event processed"}, {status:200});
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}