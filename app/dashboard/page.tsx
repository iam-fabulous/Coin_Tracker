"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: string;
  status: string;
}

interface DashboardData {
  userId: string;
  fiatBalance: number;
  cryptoBalance: number;
  transactions: Transaction[];
}

interface OnboardingData {
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  userId: string;
  message: string;
  orgId: string;
  apiPublicKey: string;
  apiSecret: string;
  apiKeyType: string;
  kybStatus: string;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        // ✅ Load onboarding data
        const stored = localStorage.getItem("onboardingData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setOnboarding(parsed);

          // ✅ Show popup if just registered
          if (parsed.message === "Registered successfully") {
            alert("Registered successfully 🎉");
          }
        }

        // ✅ Fetch dashboard balances/transactions
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setDashboard(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  if (loading)
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white h-screen">
      <h1 className="text-2xl font-bold mb-2 text-black">
        Welcome,{" "}
        {onboarding
          ? onboarding.fullName.split(" ")[0]
          : "User"}
      </h1>
      <p className="text-gray-600 mb-6">
        Email: {onboarding?.email || "Not available"}
      </p>

      {dashboard && (
        <>
          {/* Balance Section */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-200 p-4 rounded-lg">
              <p className="text-gray-800">Fiat Balance</p>
              <h2 className="text-xl font-semibold text-black">
                ${dashboard.fiatBalance.toLocaleString()}
              </h2>
            </div>
            <div className="bg-gray-200 p-4 rounded-lg">
              <p className="text-gray-800">Crypto Balance</p>
              <h2 className="text-xl font-semibold text-black">
                ${dashboard.cryptoBalance.toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Action Buttons */} 
          <div className="grid grid-cols-2 gap-4 mb-6"> 
            <button onClick={() => router.push("/credit")} 
              className="bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700" >
              Credit 
            </button> 
            <button onClick={() => router.push("/withdraw")} 
              className="bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700" > 
              Withdraw 
            </button> 
            <button onClick={() => router.push("/transfer/crypto")} 
              className="bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700" > 
              Transfer Crypto 
            </button> 
            <button onClick={() => router.push("/transfer/fiat")} 
              className="bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700" > 
              Transfer Fiat 
            </button> 
          </div>

          {/* Transactions */}
          <h2 className="text-lg font-semibold mb-3 text-black">
            Recent Transactions
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-black/90">
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.transactions.map((txn) => (
                <tr key={txn.id} className="border-b text-purple-600">
                  <td className="p-2">{txn.date}</td>
                  <td className="p-2">{txn.type}</td>
                  <td className="p-2">{txn.amount}</td>
                  <td
                    className={`p-2 ${
                      txn.status === "Completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {txn.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
