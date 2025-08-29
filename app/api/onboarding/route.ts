import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // Example: call your backend service or database here
  console.log("Received onboarding data:", body);

  // Mock response
  return NextResponse.json({
    message: "User onboarded successfully",
    user: body,
  });
}
