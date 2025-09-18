import { NextResponse } from "next/server";

// Mock data – in production you'd fetch from your DB
const mockDashboardData = {
  userId: "user_123",
  fiatBalance: 1234.56,
  cryptoBalance: 50.00,
  transactions: [
    {
      id: "txn_1",
      date: "2025-08-20",
      type: "Deposit",
      amount: "50.00 SUI",
      status: "Completed",
    },
    {
      id: "txn_2",
      date: "2025-08-22",
      type: "Transfer",
      amount: "$200.00",
      status: "Pending",
    },
  ],
};

export async function GET() {
  return NextResponse.json(mockDashboardData);
}
