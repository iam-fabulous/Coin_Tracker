"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreditWalletPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const walletAddress =
    "0x9616a7936669d6276a06fa72edd30d95ae9d67d973ee47d856a830aed06096ba"; // mock wallet address

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    alert("Wallet address copied ✅");
  };
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedMethod) return;

    // route user to different page depending on choice
    switch (selectedMethod) {
      case "card":
        router.push("/credit/card");
        break;
      case "bank":
        router.push("https://clyrafiwallet.onrender.com/api/transactions/deposit");
        break;
      case "onramp":
        router.push("/credit/onramp");
        break;
      case "wallet":
        router.push("/credit/wallet");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <div className="max-w-lg w-full mx-auto p-6 flex flex-col ">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-6">Credit My Wallet</h1>

        {/* Payment Methods */}
        <div className="space-y-4 flex-1">
          {/* Card */}
          <div
            onClick={() => alert("Card payments are coming soon 🚀")}
            className="flex items-center justify-between p-4 rounded-xl border cursor-not-allowed bg-gray-100 opacity-70"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600">Card</span>
              <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            </div>

            {/* Disabled radio button style */}
            <span className="h-5 w-5 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="h-3 w-3 bg-gray-400 rounded-full opacity-50" />
            </span>
          </div>

          {/* Bank Transfer */}
          <div
            onClick={() => setSelectedMethod("bank")}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
              selectedMethod === "bank"
                ? "border-purple-600 bg-purple-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <span className="font-medium">Bank Transfer</span>
            <span
              className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                selectedMethod === "bank"
                  ? "border-purple-600"
                  : "border-gray-400"
              }`}
            >
              {selectedMethod === "bank" && (
                <span className="h-3 w-3 bg-purple-600 rounded-full" />
              )}
            </span>
          </div>

          {/* On-Ramp */}
          <div
            onClick={() => alert("On-Ramp service is coming soon 🚀")}
            className="flex items-center justify-between p-4 rounded-xl border cursor-not-allowed bg-gray-100 opacity-70"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600">On-ramp Service</span>
              <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            </div>

            {/* Disabled radio button style */}
            <span className="h-5 w-5 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="h-3 w-3 bg-gray-400 rounded-full opacity-50" />
            </span>
          </div>

            {/* External Wallet */}
            <div
              onClick={() => setSelectedMethod("wallet")}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                selectedMethod === "wallet"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <span className="font-medium">External Wallet</span>

              <div className="flex gap-2">
                {/* View Address Button */}
                <button
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWalletDetails((prev) => !prev); // toggle address view
                  }}
                >
                  View Address
                </button>

                {/* Connect Wallet Button (routes to another page) */}
                <button
                  className="px-3 py-1 text-sm bg-purple-700 text-white rounded-lg hover:bg-purple-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/connect-wallet"); // navigate to wallet connection page
                  }}
                >
                  Connect Wallet
                </button>
              </div>
            </div>

            {/* Wallet Details (only visible when View Address is clicked) */}
            {showWalletDetails && (
              <div className="p-4 rounded-xl border bg-gray-50 space-y-3">
                {/* Wallet Address + Copy Button */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">{walletAddress}</span>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Copy
                  </button>
                </div>

                {/* Instructions */}
                <p className="text-xs text-gray-600">
                  Copy the wallet address above and deposit your funds to complete the transaction.
                </p>
              </div>
            )}

        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
            selectedMethod
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
