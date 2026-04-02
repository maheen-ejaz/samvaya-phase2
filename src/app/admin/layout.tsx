import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminTopNav } from "@/components/admin/AdminTopNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Defense-in-depth: verify role is admin or super_admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role ?? "applicant";

  if (role !== "admin" && role !== "super_admin") {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-page-admin">
      <AdminTopNav />
      <main className="mx-auto max-w-[1600px] px-6 py-6">{children}</main>
    </div>
  );
}
