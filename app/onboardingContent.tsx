// Create a separate component for the content that uses useSearchParams
// components/OnboardingContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

function OnboardingContent() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const searchParams = useSearchParams();
  const company_name = searchParams.get("company_name");
  
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    pin: "",
    confirmPin: "",
    phoneNumber: "",
  });

  useEffect(() => {
    localStorage.setItem("company", company_name || "");
    const new_company = localStorage.getItem("company");
    console.log("Retrieved 001:", new_company);
    setName(company_name || "");
  }, [company_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName) {
      alert("First name and last name are required");
      return;
    }
    if (form.pin !== form.confirmPin) {
      alert("Pins do not match");
      return;
    }
    if (!form.email || !form.phoneNumber) {
      alert("Email and phone number are required");
      return;
    }

    const formDataToSend = {
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phoneNumber: form.phoneNumber,
      pin: form.pin,
      confirmPin: form.confirmPin,
      organizationId: name,
    };
    setIsLoading(true);

    const fallbackEndpoint = "/api/onboarding";

    try {
      const res = await fetch(fallbackEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataToSend),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit form on fallback endpoint");
      }

      localStorage.setItem("userData", JSON.stringify(data));
      console.log("Response data:", data);
      alert(`Success: ${data?.message}`);
      
      router.push("/dashboard");
    } catch (fallbackErr) {
      console.error("Fallback endpoint error:", fallbackErr);
      alert(fallbackErr || "Error submitting form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          Welcome to {name || "Meedl"}
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
            type="text"
            name="phoneNumber"
            placeholder="Enter phone number"
            value={form.phoneNumber}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />

          <input
            type="password"
            name="pin"
            placeholder="Enter Pin"
            value={form.pin}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />

          <input
            type="password"
            name="confirmPin"
            placeholder="Confirm Pin"
            value={form.confirmPin}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700`}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingContent;
