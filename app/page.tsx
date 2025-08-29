"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "./lib/api";



export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    businessName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // https://clyrafiwallet.onrender.com /api/transactions/deposit
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      console.log("Response status:", res.status);
      if (!res.ok) throw new Error("Failed to submit form");

      const data = await res.json();
      localStorage.setItem("dashboardData", JSON.stringify(data));
      alert(`Success: ${JSON.stringify(data)}`);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          Welcome to CoinTracker
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="Enter your first name"
            value={form.firstName}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />

          <input
            type="text"
            name="lastName"
            placeholder="Enter your last name"
            value={form.lastName}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />

          <input
            type="text"
            name="phoneNumber"
            placeholder="Enter phone number"
            value={form.phoneNumber}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />

          <input
            type="text"
            name="businessName"
            placeholder="Enter business name"
            value={form.businessName}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />
          


          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700"
            // onClick={() => router.push("/dashboard")}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
