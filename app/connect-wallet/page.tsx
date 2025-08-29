"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ConnectButton,
  useConnectWallet,
  useWallets,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export default function ConnectWalletPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [digest, setDigest] = useState<string | null>(null);

  const fixedAddress =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd";

  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fixedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConnect = () => {
    const slush = wallets.find((w) =>
      w.name.toLowerCase().includes("slush")
    );
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

    const parsed = Number(amount);
    if (isNaN(parsed) || parsed <= 0) {
      alert("Enter a valid amount (SUI).");
      return;
    }

    const suiAmountInteger = Math.floor(parsed * 1e9);

    try {
      setLoading(true);

      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [suiAmountInteger]);
      tx.transferObjects([coin], fixedAddress);

      const result: any = await signAndExecuteTransaction({ transaction: tx });
      setDigest(result?.digest ?? null);
      alert("Transaction submitted. Digest: " + (result?.digest ?? "unknown"));
    } catch (err: unknown) {
        if (err instanceof Error) {
        console.error("Deposit failed", err);
        alert("Deposit failed: " + err.message);
    } else {
        console.error("Deposit failed", err);
        alert("Deposit failed: unknown error");
    }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900 via-black to-purple-900">
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-6 border border-gray-800 bg-gray-950">
        <h1 className="text-2xl font-bold text-center text-blue-400 tracking-wide">
          ⚡ Clyra-Fi Wallet Deposit
        </h1>

        {/* Wallet connect */}
        <div className="flex items-center gap-3 justify-center">
          <ConnectButton />
          <button
            onClick={handleConnect}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-md transition-all"
          >
            Connect
          </button>
        </div>

        {/* Deposit address */}
        <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
          <label className="text-sm text-gray-400">Deposit Address</label>
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-xs text-blue-300 break-all">
              {fixedAddress}
            </span>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 text-sm"
            >
              {copied ? "✅ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="text-sm text-gray-400">Amount (SUI)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="any"
            placeholder="0.0"
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-green-400 placeholder-gray-500 font-mono mt-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-blue-500 text-black font-bold disabled:opacity-50 shadow-md transition-all"
          >
            {loading ? "🚀 Sending..." : "💸 Deposit"}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition-all"
          >
            ⬅ Back
          </button>
        </div>

        {digest && (
          <div className="text-xs text-gray-400 mt-4 border-t border-gray-800 pt-2">
            Tx Digest:{" "}
            <span className="font-mono text-green-400 break-all">{digest}</span>
          </div>
        )}
      </div>
    </div>
  );
}
