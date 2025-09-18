"use client";

import { useState,useEffect } from "react";
import { useSearchParams } from "next/navigation";
// import { Menu } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const company_name = searchParams.get("company_name");
  const setName = company_name? company_name : ""

  useEffect(() => {
    localStorage.setItem("company_name", setName)
  },[setName])

   const [name,setCompanyName] = useState("")


  useEffect(() => {
  const company_name = localStorage.getItem("company_name")
   setCompanyName(company_name || "")
  },[setCompanyName])

  return (
    <nav className="w-full border-b bg-white px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="font-bold text-lg text-gray-900">{name || "Meedl"}</div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
        <a href="#" className="hover:text-purple-600">Buy/Sell</a>
        <a href="#" className="hover:text-purple-600">Trade</a>
        <a href="#" className="hover:text-purple-600">Earn</a>
        <a href="#" className="hover:text-purple-600">Borrow</a>
        <a href="#" className="hover:text-purple-600">Card</a>
        <a href="#" className="hover:text-purple-600">NFT</a>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center space-x-4">
        <button className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
          {/* You can replace with an actual icon */}
          <span className="text-sm font-bold">?</span>
        </button>
        <button className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
          <span className="text-sm font-bold">⚙</span>
        </button>
        <button className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
          <span className="text-sm font-bold">👤</span>
        </button>
      </div>

        {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="space-y-1">
          <span className="block h-0.5 w-6 bg-gray-700"></span>
          <span className="block h-0.5 w-6 bg-gray-700"></span>
          <span className="block h-0.5 w-6 bg-gray-700"></span>
        </div>
      </button>
    </nav>
  );
}
