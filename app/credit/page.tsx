"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreditWalletPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletError, setWalletError] = useState("");
  const [bankForm, setBankForm] = useState({
    emailPhoneOrWallet: "",
    amount: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const walletAddress =
    "0x9616a7936669d6276a06fa72edd30d95ae9d67d973ee47d856a830aed06096ba"; // mock wallet address
  const router = useRouter();

  // const copyToClipboard = () => {
  //   navigator.clipboard.writeText(walletAddress);
  //   alert("Wallet address copied ✅");
  // };

  const handleBankFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };

  const handleBankFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const walletType = localStorage.getItem("Fiat") || "Fiat";
    const payload = {
      emailPhoneOrWallet: bankForm.emailPhoneOrWallet,
      amount: bankForm.amount,
      walletType,
    };

    try {
      const res = await fetch("https://clyrafiwallet.onrender.com/api/transactions/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit bank transfer");
      }

      alert(`Success: ${data?.message}`);
      setBankForm({ emailPhoneOrWallet: "", amount: "" });
      setShowBankModal(false);
      router.push("/dashboard"); // Adjust as needed
    } catch (err) {
      console.error("Bank transfer error:", err);
      alert(err || "Error submitting bank transfer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWalletError("");
    
    // Allow empty string
    if (value === "") {
      setWalletAmount(value);
      return;
    }
    
    // Check if it's a valid number
    if (isNaN(Number(value))) {
      setWalletError("Please enter a valid number");
      setWalletAmount(value);
      return;
    }
    
    // Check if it's non-negative
    if (Number(value) < 0) {
      setWalletError("Amount cannot be negative");
      setWalletAmount(value);
      return;
    }
    
    // Check if it has more than 2 decimal places
    const decimalPart = value.split('.')[1];
    if (decimalPart && decimalPart.length > 9) {
      setWalletError("Amount can have at most 9 decimal places");
      setWalletAmount(value);
      return;
    }
    
    // Valid input
    setWalletAmount(value);
    
    // Save to localStorage
    const stored = localStorage.getItem("userData") || "unknown_user";
    const parsed = JSON.parse(stored);
    let username = "User";
    username = parsed.user.fullName.split(" ")[0];  
    const walletData = { username, amount: value };
    try {
      localStorage.setItem("walletData", JSON.stringify(walletData));
      console.log("Stored walletData:", walletData);
    } catch (err) {
      console.error("Error saving to localStorage:", err);
      setWalletError("Failed to save wallet data");
    }
  };

  const handleConnectWallet = () => {
    // Validate before routing
    if (!walletAmount) {
      setWalletError("Please enter an amount");
      return;
    }
    
    const numValue = Number(walletAmount);
    if (isNaN(numValue) || numValue < 0) {
      setWalletError("Please enter a valid non-negative amount");
      return;
    }
    
    // If validation passes, route to connect wallet
    router.push("/connect-wallet");
  };

  const handleContinue = () => {
    if (!selectedMethod) return;

    switch (selectedMethod) {
      case "card":
        router.push("/credit/card");
        break;
      case "bank":
        setShowBankModal(true); // Show modal instead of routing
        break;
      case "onramp":
        router.push("/credit/onramp");
        break;
      case "wallet":
        // For wallet method, we need to validate before continuing
        if (!walletAmount) {
          setWalletError("Please enter an amount");
          return;
        }
        
        const numValue = Number(walletAmount);
        if (isNaN(numValue) || numValue < 0) {
          setWalletError("Please enter a valid non-negative amount");
          return;
        }
        
        router.push("/credit/wallet");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <div className="max-w-lg w-full mx-auto p-6 flex flex-col">
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
            <span className="h-5 w-5 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="h-3 w-3 bg-gray-400 rounded-full opacity-50" />
            </span>
          </div>

          {/* External Wallet */}
          <div
            onClick={() => setSelectedMethod("wallet")}
            className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
              selectedMethod === "wallet"
                ? "border-purple-600 bg-purple-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">External Wallet</span>
              
            </div>
            
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Amount (SUI)"
                value={walletAmount}
                onChange={handleWalletAmountChange}
                className="px-3 py-2 text-sm border rounded-lg flex-1"
                onClick={(e) => e.stopPropagation()} 
              />
              <button
                className="px-3 py-2 text-sm bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnectWallet();
                }}
              >
                Connect Wallet
              </button>
            </div>
            
            {walletError && (
              <div className="mt-2 text-red-500 text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {walletError}
              </div>
            )}
          </div>

          {/* Wallet Details
          {selectedMethod === "wallet" && (
            <div className="p-4 rounded-xl border bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px]">{walletAddress}</span>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Copy the wallet address above and deposit your funds to complete the transaction.
              </p>
            </div>
          )} */}
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

      {/* Bank Transfer Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Bank Transfer Details</h2>
            <form onSubmit={handleBankFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email, Phone, or Wallet Address
                </label>
                <input
                  type="text"
                  name="emailPhoneOrWallet"
                  value={bankForm.emailPhoneOrWallet}
                  onChange={handleBankFormChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter email, phone, or wallet address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={bankForm.amount}
                  onChange={handleBankFormChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}