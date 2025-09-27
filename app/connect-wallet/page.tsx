"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ConnectButton,
  useConnectWallet,
  useWallets,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { addLedgerEntry } from "../lib/ledger";

interface WalletData {
  username: string;
  amount: string;
}

export default function WalletDeposit() {
  const router = useRouter();
  // const [dashboardData, setUserName] =useState<dashboardData>({ })
  const [walletData, setWalletData] = useState<WalletData>({ username: "", amount: "" });
  const [company_name,setName] = useState("");
  // const [copied, setCopied] = useState(false);
  const [digest, setDigest] = useState<string | null>(null);

  const fixedAddress = "0x9616a7936669d6276a06fa72edd30d95ae9d67d973ee47d856a830aed06096ba";

  // Sui wallet hooks
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction, isPending: isProcessing } = useSignAndExecuteTransaction();

  useEffect(() => {
    // Get data from localStorage
    // const storedUserName = localStorage.getItem("dashboardData")
    const storedWalletData = localStorage.getItem("walletData");
    
    
    if (storedWalletData) {
      try {
        setWalletData(JSON.parse(storedWalletData));
      } catch (err) {
        console.error("Error parsing wallet data:", err);
      }
    }
    
    // setCompanyName(storedCompanyName);
    // setUserName(storedUserName);
  }, []);

  useEffect(() => {
  const company_name = localStorage.getItem("company");
  console.log("Retrieved company_name from localStorage:", company_name);
   setName(company_name || "")
  },[setName])

  // const copyToClipboard = async () => {
  //   await navigator.clipboard.writeText(fixedAddress);
  //   setCopied(true);
  //   setTimeout(() => setCopied(false), 1500);
  // };

  const handleConnect = () => {
    const slush = wallets.find((w) => w.name.toLowerCase().includes("slush"));
    if (slush) {
      connect({ wallet: slush }, { onSuccess: () => console.log("connected") });
      return;
    }
    console.warn("Slush wallet not found; use ConnectButton instead.");
  };

  const handleDeposit = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!walletData || !walletData.amount) {
      alert("No deposit amount found. Please go back and enter an amount.");
      return;
    }

    const parsed = Number(walletData.amount);
    if (isNaN(parsed) || parsed <= 0) {
      alert("Invalid amount found. Please go back and enter a valid amount.");
      return;
    }

    const suiAmountInteger = Math.floor(parsed * 1e9);

    try {
      // Build transaction
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [suiAmountInteger]);
      tx.transferObjects([coin], fixedAddress);

      // Sign and execute transaction
      const rawResult: unknown = await signAndExecuteTransaction({ 
        transaction: tx,
        // options: {
        //   showEffects: true,
        // }
      });

      // Type guard for digest
      if (
        rawResult &&
        typeof rawResult === "object" &&
        "digest" in rawResult &&
        typeof (rawResult as { digest: string }).digest === "string"
      ) {
        const resultDigest = (rawResult as { digest: string }).digest;
        setDigest(resultDigest);
        alert("Transaction submitted. Digest: " + resultDigest);
      
        // Add entry to backup ledger after successful transaction
        try {
          const currentTimestamp = Date.now();
          const ledgerResult = await addLedgerEntry({
            company_name: company_name,
            username: walletData.username,
            amount: suiAmountInteger, // Store in MIST (smallest unit)
            transaction_type: "deposit",
            transaction_address: currentAccount.address, // Use connected wallet address
            status: "completed",
            date: currentTimestamp,
          });

          if (ledgerResult.success) {
            console.log("Successfully added entry to backup ledger:", ledgerResult.transactionDigest);
          } else {
            console.error("Failed to add entry to backup ledger:", ledgerResult.error);
          }
        } catch (ledgerError) {
          console.error("Error adding to backup ledger:", ledgerError);
          // Don't show error to user as main transaction was successful
        }

      } else {
        setDigest(null);
        alert("Transaction submitted, but digest unknown.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Deposit failed", err);
        alert("Deposit failed: " + err.message);
      } else {
        console.error("Deposit failed", err);
        alert("Deposit failed: unknown error");
      }
    } //router.push("/dashboard");
  };

  const handleBack = () => {
    //router.back();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900 via-black to-purple-900">
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-6 border border-gray-800 bg-gray-950">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
          Clyra-Fi Wallet Deposit
        </h1>

        {/* User information from localStorage */}
        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
          <h2 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            User Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
              <span className="text-sm text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                Company:
              </span>
              <span className="font-semibold text-blue-300">{company_name}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
              <span className="text-sm text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Username:
              </span>
              <span className="font-semibold text-green-300">{walletData.username}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
              <span className="text-sm text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Amount to deposit:
              </span>
              <span className="font-semibold text-purple-300">{walletData.amount} SUI</span>
            </div>
          </div>
        </div>

        {/* Wallet connect */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-semibold text-blue-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            Wallet Connection
          </h2>
          <div className="flex items-center gap-3 justify-center">
            <ConnectButton />
            <button
              onClick={handleConnect}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-md transition-all"
            >
              Connect
            </button>
          </div>
          
          {currentAccount && (
            <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 mt-2">
              <div className="flex items-center text-sm text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Wallet connected successfully
              </div>
              <div className="text-xs text-gray-400 mt-1 truncate">
                {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-blue-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
            Deposit Actions
          </h2>
          <button 
            onClick={handleDeposit}
            disabled={isProcessing || !currentAccount}
            className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-blue-500 flex items-center justify-center px-4 py-3 rounded-lg text-white font-bold shadow-md w-full transition-all ${isProcessing ? 'animate-pulse' : ''} ${!currentAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {isProcessing ? 'Processing...' : `Deposit ${walletData.amount} SUI`}
          </button>

          <button 
            onClick={handleBack}
            className="bg-gray-700 hover:bg-gray-600 flex items-center justify-center px-4 py-3 rounded-lg text-gray-200 font-semibold w-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Goto dashboard
          </button>
        </div>

        {digest && (
          <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold text-green-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Transaction Submitted
            </h3>
            <p className="text-xs text-gray-300 mt-2">Tx Digest:</p>
            <p className="text-xs text-green-300 font-mono break-all mt-1">
              {digest}
            </p>
            <div className="flex items-center text-xs text-gray-400 mt-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Transaction Successful!
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-800">
          <p>Powered by Mysten Labs • Sui Blockchain</p>
        </div>
      </div>
    </div>
  );
}