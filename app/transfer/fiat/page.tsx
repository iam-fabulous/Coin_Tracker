"use client";

import { useState } from "react";

export default function TransferFiatPage() {
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  // const [currency, setCurrency] = useState("USD");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("https://clyrafiwallet.onrender.com/api/transactions/p2p/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, recipient, amount}),
    });

    if (res.ok) {
      alert("Fiat transfer successful ✅");
      setAmount("");
      setRecipient("");
    } else {
      alert("Fiat transfer failed ❌");
    }
  };

  return (
    <div className="p-6 bg-white h-screen">
      <h1 className="text-2xl font-bold mb-6 text-black">Transfer Fiat</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md bg-gray-100 p-6 rounded-lg shadow"
      >

        {/* Sender */}
        <div>
          <label className="block mb-1 text-gray-800">Sender</label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter sender"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-400 text-gray-500"
          />
        </div>

        {/* Recipient */}
        <div>
          <label className="block mb-1 text-gray-800">Recipient</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-400 text-gray-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block mb-1 text-gray-800">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-400 text-gray-500"
          />
        </div>

        {/* Currency
        <div>
          <label className="block mb-1 text-gray-800">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-purple-400 text-gray-500"
          >
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
            <option value="EUR">EUR</option>
          </select>
        </div> */}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700"
        >
          Transfer
        </button>
      </form>
    </div>
  );
}
