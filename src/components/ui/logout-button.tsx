"use client";

import { useState } from "react";
import { signOut } from "@/app/auth/login/actions";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
