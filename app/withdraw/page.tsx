"use client";

import { useState } from "react";

export default function WithdrawPage() {
  const [method, setMethod] = useState<"fiat" | "crypto" | null>(null);
  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    name: "",
    wallet: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWithdraw = () => {
    console.log("Withdraw request:", { method, ...form });
    // TODO: call your Withdraw API with method + form data
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-black">Withdraw Funds</h1>

        {/* Step 1: Choose withdrawal type */}
        {!method ? (
          <div className="space-y-4">
            <button
              onClick={() => setMethod("fiat")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
            >
              Withdraw Fiat
            </button>
            <button
              onClick={() => setMethod("crypto")}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700"
            >
              Withdraw Crypto
            </button>
          </div>
        ) : (
          <>
            {/* Step 2: Fiat withdrawal */}
            {method === "fiat" && (
              <div className="space-y-4">
                <p className="text-gray-700 font-semibold">
                  Your Fiat Balance: <span className="text-black">₦100,000</span>
                </p>

                <input
                  type="text"
                  name="bankName"
                  placeholder="Bank Name"
                  value={form.bankName}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl text-gray-500"
                />

                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Account Number"
                  value={form.accountNumber}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl text-gray-500"
                />

                <input
                  type="number"
                  name="amount"
                  placeholder="Amount (₦)"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl text-gray-500"
                />
              </div>
            )}

            {/* Step 2: Crypto withdrawal */}
            {method === "crypto" && (
              <div className="space-y-4">
                <p className="text-gray-700 font-semibold">
                  Your SUI Balance: <span className="text-black">500 SUI</span>
                </p>

                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl text-gray-500"
                />

                <input
                  type="text"
                  name="wallet"
                  placeholder="External Wallet Address"
                  value={form.wallet}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl text-gray-500"
                />

                <input
                  type="number"
                  name="amount"
                  placeholder="Amount (SUI)"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl text-gray-500"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setMethod(null)}
                className="flex-1 bg-gray-300 text-black py-3 rounded-xl hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700"
              >
                Withdraw
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
