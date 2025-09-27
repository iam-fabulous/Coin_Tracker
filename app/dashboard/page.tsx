"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllLedgerEntries, getLedgerCount, formatTimestamp, TransactionEntry } from "../lib/ledger";

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
  const [blockchainTransactions, setBlockchainTransactions] = useState<TransactionEntry[]>([]);
  const [blockchainLoading, setBlockchainLoading] = useState(false);


  // Function to fetch blockchain transactions
  const fetchBlockchainTransactions = async () => {
    setBlockchainLoading(true);
    try {
      // First check the count
      const countResponse = await getLedgerCount();
      if (countResponse.success && typeof countResponse.data === 'number') {
        const totalCount = countResponse.data;
        
        if (totalCount > 0) {
          // If count >= 10, get only 10, otherwise get all
          const limit = totalCount >= 10 ? 10 : undefined;
          const entriesResponse = await getAllLedgerEntries(limit);
          
          if (entriesResponse.success && entriesResponse.entries) {
            setBlockchainTransactions(entriesResponse.entries);
          } else {
            console.error("Failed to fetch blockchain transactions:", entriesResponse.error);
            setBlockchainTransactions([]);
          }
        } else {
          setBlockchainTransactions([]);
        }
      } else {
        console.error("Failed to get ledger count:", countResponse.error);
        setBlockchainTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching blockchain transactions:", error);
      setBlockchainTransactions([]);
    } finally {
      setBlockchainLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        // ✅ Load onboarding data
        const stored = localStorage.getItem("userData");
        if (stored) {
          const parsed = JSON.parse(stored);
          // ✅ Normalize nested user object into flat structure
          const normalized: OnboardingData = {
            fullName: parsed.user.fullName,
            email: parsed.user.email,
            phoneNumber: parsed.user.phoneNumber,
            userId: parsed.user.userId ?? "", // in case it's missing
            message: parsed.message,
            orgId: parsed.user.organizationId,
            businessName: parsed.user.businessName ?? "",
            apiPublicKey: parsed.apiPublicKey ?? "",
            apiSecret: parsed.apiSecret ?? "",
            apiKeyType: parsed.apiKeyType ?? "",
            kybStatus: parsed.kybStatus ?? "",
          };

          setOnboarding(normalized);
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
        // ✅ Fetch blockchain transactions
        await fetchBlockchainTransactions();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Convert blockchain transactions to dashboard format
  // const formatBlockchainTransactions = (entries: TransactionEntry[]): Transaction[] => {
  //   return entries.map((entry, index) => ({
  //     id: `blockchain-${index}-${entry.date}`,
  //     date: formatTimestamp(entry.date),
  //     type: `${entry.transaction_type} (${entry.company_name})`,
  //     amount: `${(entry.amount / 1000000000).toFixed(4)} SUI`, // Convert from MIST to SUI
  //     status: entry.status.charAt(0).toUpperCase() + entry.status.slice(1), // Capitalize first letter
  //   }));
  // };


  const MIST_PER_SUI = 1000000000;

const formatBlockchainTransactions = (entries: TransactionEntry[]): Transaction[] => {
  return entries.map((entry, index) => {
    console.log(`This is format for amount: `,entry.amount);
    // Ensure amount is handled as BigInt for accuracy
    const amountBigInt = BigInt(entry.amount);
    // Convert to SUI as a string to avoid floating point issues
    const amountSui = Number(amountBigInt) / MIST_PER_SUI;

    return {
      id: `blockchain-${index}-${entry.date}`,
      date: formatTimestamp(entry.date),
      type: `${entry.transaction_type} (${entry.company_name})`,
      amount: `${amountSui} SUI`,
      status: entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
    };
  });
};


  // const formatBlockchainTransactions = (entries: TransactionEntry[]): Transaction[] => {
  //   return entries.map((entry, index) => {
  //     // Fix the amount precision issue
  //     const suiAmount = entry.amount / 1000000000;
  //     let formattedAmount;
      
  //     if (suiAmount >= 1) {
  //       // For amounts >= 1, show up to 4 decimal places
  //       formattedAmount = suiAmount.toFixed(4).replace(/\.?0+$/, '');
  //     } else {
  //       // For amounts < 1, show up to 9 decimal places to capture small amounts
  //       formattedAmount = suiAmount.toFixed(9).replace(/\.?0+$/, '');
  //     }
      
  //     return {
  //       id: `blockchain-${index}-${entry.date}`,
  //       date: formatTimestamp(entry.date),
  //       type: `${entry.transaction_type} (${entry.company_name})`,
  //       amount: `${formattedAmount} SUI`,
  //       status: entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
  //     };
  //   });
  // };


  // Calculate total blockchain deposits for crypto balance update
  const calculateBlockchainDeposits = (): number => {
    return blockchainTransactions
      .filter(entry => entry.transaction_type.toLowerCase().includes('deposit'))
      .reduce((total, entry) => total + (entry.amount / 1e9), 0);
  };

  // Get updated crypto balance including blockchain deposits
  const getUpdatedCryptoBalance = (): number => {
    const apiBalance = dashboard?.cryptoBalance || 0;
    const blockchainDeposits = calculateBlockchainDeposits();
    return apiBalance + blockchainDeposits;
  };
  

   // Combine API transactions and blockchain transactions
  const getAllTransactions = (): Transaction[] => {
    const apiTransactions = dashboard?.transactions || [];
    const blockchainTxns = formatBlockchainTransactions(blockchainTransactions);
    
    // Combine and sort by date (most recent first)
    const combined = [...blockchainTxns, ...apiTransactions];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };


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

  const allTransactions = getAllTransactions();
  
 return (
    <div className="p-6 bg-white h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-2 text-black">
        Welcome,{" "}
        {onboarding
          ? onboarding.fullName.split(" ")[0]
          : "User"}
      </h1>
      <p className="text-gray-600 mb-6">
        Email: {onboarding?.email || "Not available"}
      </p>

      {/* Debug Information Section - REMOVED */}

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
              <p className="text-gray-800">Crypto Balance(SUI)</p>
              <h2 className="text-xl font-semibold text-black">
                {/* {dashboard.cryptoBalance.toLocaleString()} SUI */}
                {getUpdatedCryptoBalance().toFixed(4)} SUI
              </h2>
              {blockchainTransactions.length > 0 && (
                <div className="text-xs text-gray-600 mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Includes +{calculateBlockchainDeposits().toFixed(4)} from blockchain
                </div>
              )}
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-black">
              Recent Transactions
            </h2>
            <div className="flex items-center gap-2">
              {blockchainLoading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
              )}
              <button
                onClick={fetchBlockchainTransactions}
                disabled={blockchainLoading}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {blockchainLoading ? "Loading..." : "Refresh Blockchain"}
              </button>
            </div>
          </div>

          {/* Transaction Stats */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm font-medium text-gray-700">
                Total: {allTransactions.length} transactions
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Blockchain: {blockchainTransactions.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>API: {dashboard.transactions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Transactions Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Transaction Details
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allTransactions.length > 0 ? (
                    allTransactions.map((txn, index) => (
                      <tr 
                        key={txn.id} 
                        className={`hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        {/* Date Column */}
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(txn.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(txn.date).toLocaleTimeString()}
                          </div>
                        </td>
                        
                        {/* Transaction Details Column */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {txn.type}
                            </div>
                            {txn.id.startsWith("blockchain-") && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                                On-chain verified
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {/* Amount Column */}
                        <td className="px-4 py-4 text-right">
                          <div className={`text-sm font-semibold ${
                            txn.type.toLowerCase().includes('deposit') || txn.type.toLowerCase().includes('credit')
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}>
                            {txn.amount}
                          </div>
                        </td>
                        
                        {/* Status Column */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            txn.status.toLowerCase().includes("completed")
                              ? "bg-green-100 text-green-800"
                              : txn.status.toLowerCase().includes("pending")
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        
                        {/* Source Column */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            txn.id.startsWith("blockchain-") 
                              ? "bg-blue-100 text-blue-700 border border-blue-200" 
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}>
                            {txn.id.startsWith("blockchain-") ? (
                              <div className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                                Blockchain
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                API
                              </div>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 font-medium">No transactions found</p>
                          <p className="text-gray-400 text-sm">Your transactions will appear here once you make deposits or transfers</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Show if there are more blockchain transactions available */}
          {blockchainTransactions.length === 10 && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Showing latest 10 blockchain transactions
              </p>
              <button
                onClick={() => router.push("/transactions")} // You can create a full transactions page
                className="text-blue-500 hover:text-blue-700 text-sm underline"
              >
                View All Transactions
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}