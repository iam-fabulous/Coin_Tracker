"use client";

import { useState } from "react";

export default function TransferCryptoPage() {
  const [form, setForm] = useState({
    amount: "",
    recipient: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/transfer/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Transfer failed");

      const data = await res.json();
      alert(`✅ Transfer successful: ${JSON.stringify(data)}`);
      setForm({ amount: "", recipient: "" }); // reset form
    } catch (err) {
      console.error(err);
      alert("❌ Error processing transfer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      {/* Breadcrumb */}
      <p className="text-sm text-gray-500 mb-4">Transfer / Crypto</p>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-2">Transfer Crypto</h1>
      <p className="mb-6 text-gray-600">Send crypto to another wallet</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="text"
          name="recipient"
          placeholder="Recipient"
          value={form.recipient}
          onChange={handleChange}
          className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
