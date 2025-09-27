// "use client";

// import { useState,useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";



// export default function OnboardingPage() {
//   // const searchParams = useSearchParams();
//   // const company_name = searchParams.get("company_name");
//   // const setName = company_name? company_name : ""
//   const [name,setName] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

//   const searchParams = useSearchParams();
//   const company_name = searchParams.get("company_name");
//   useEffect(() => {
//   localStorage.setItem("company", company_name || "")
//   const new_company = localStorage.getItem("company");
//   console.log("Retrieved 001:", new_company);
//    setName(company_name || "")
//   },[setName])

  

//   const router = useRouter();
//   const [form, setForm] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     pin: "",
//     confirmPin: "",
//     phoneNumber: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

   

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//      if (!form.firstName || !form.lastName) {
//       alert("First name and last name are required");
//       return;
//     }
//     if (form.pin !== form.confirmPin) {
//       alert("Pins do not match");
//       return;
//     }
//     if (!form.email || !form.phoneNumber) {
//       alert("Email and phone number are required");
//       return;
//     }

//     const formDataToSend = {
//       fullName: `${form.firstName} ${form.lastName}`.trim(),
//       email: form.email,
//       phoneNumber: form.phoneNumber,
//       pin: form.pin,
//       confirmPin: form.confirmPin,
//       organizationId: name,
//     }
//     setIsLoading(true);

//     // Define primary and fallback endpoints
//     const primaryEndpoint = `${BASE_URL}/api/endusers`;
//     const fallbackEndpoint = "/api/onboarding";
//     // https://clyrafiwallet.onrender.com/api/users/register
//     // try {
//     //   const res = await fetch(primaryEndpoint, {
//     //     method: "POST",
//     //     headers: { "Content-Type": "application/json" },
//     //     body: JSON.stringify(formDataToSend),
//     //   });
//     //   console.log("Response status:", res.status);
      

//     //   const data = await res.json();
//     //   if (!res.ok) {
//     //     throw new Error(data.message || "Failed to submit form");
//     //   }
//     //   localStorage.setItem("userData", JSON.stringify(data));
//     //   // alert(`Success: ${data?.message}`);
//     //   router.push("/dashboard");
//     // } catch (err) {
//     //   console.error(err);
//     //   // alert("Error submitting form");
//     //   // Try fallback endpoint
//     // console.log(`Falling back to endpoint: ${fallbackEndpoint}`);
//     try {
//       const res = await fetch(fallbackEndpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formDataToSend),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.message || "Failed to submit form on fallback endpoint");
//       }

//       const userData = localStorage.setItem("userData", JSON.stringify(data));
//       console.log(userData);
//       console.log("Response data:", data);
//       alert(`Success: ${data?.message}`);
      
//       router.push("/dashboard");
//     } catch (fallbackErr) {
//       console.error("Fallback endpoint error:", fallbackErr);
//       alert(fallbackErr || "Error submitting form");
//     }
//     // }finally {
//     //   setIsLoading(false);
//     // }
//   };

  

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
//         <h1 className="mb-6 text-center text-2xl font-bold text-black">
//           Welcome to {name || "Meedl"}
//         </h1>

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <input
//             type="text"
//             name="firstName"
//             placeholder="Enter your first name"
//             value={form.firstName}
//             onChange={handleChange}
//             className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
//           />

//           <input
//             type="text"
//             name="lastName"
//             placeholder="Enter your last name"
//             value={form.lastName}
//             onChange={handleChange}
//             className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
//           />

//           <input
//             type="email"
//             name="email"
//             placeholder="Enter your email"
//             value={form.email}
//             onChange={handleChange}
//             className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
//           />

//           <input
//             type="text"
//             name="phoneNumber"
//             placeholder="Enter phone number"
//             value={form.phoneNumber}
//             onChange={handleChange}
//             className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
//           />

//           <input
//             type="password"
//             name="pin"
//             placeholder="Enter Pin"
//             value={form.pin}
//             onChange={handleChange}
//             className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
//           />

//           <input
//             type="password"
//             name="confirmPin"
//             placeholder="Confirm Pin"
//             value={form.confirmPin}
//             onChange={handleChange}
//             className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
//           />
          

//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700`}
//             // onClick={() => router.push("/dashboard")}
//           >
//             {isLoading ? "Submitting..." : "Submit"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// Main component with Suspense wrapper
import { Suspense } from "react";
import OnboardingContent from "./onboardingContent";

function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-black">Loading...</h1>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingContent />
    </Suspense>
  );
}
