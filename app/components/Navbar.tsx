"use client";

import { Suspense } from "react";
import NavbarContent from "./NavbarContent";

export default function Navbar() {
  return (
    <Suspense fallback={<div className="px-6 py-4">Loading...</div>}>
      <NavbarContent />
    </Suspense>
  );
}
