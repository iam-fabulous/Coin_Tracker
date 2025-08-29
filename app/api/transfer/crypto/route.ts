import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount, recipient } = await req.json();

  // TODO: Replace this with your real transfer logic
  console.log("Crypto transfer request:", { amount, recipient });

  return NextResponse.json({
    message: "Transfer successful",
    transfer: {
      amount,
      recipient,
      date: new Date().toISOString(),
    },
  });
}
