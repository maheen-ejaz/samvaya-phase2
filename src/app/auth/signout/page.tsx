"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      router.replace("/auth/login");
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF9]">
      <p className="text-sm text-gray-500">Signing out…</p>
    </div>
  );
}
