import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatusProvider } from "@/lib/app/user-context";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { ServiceWorkerRegistration } from "@/components/app/ServiceWorkerRegistration";
import { InstallPromptBanner } from "@/components/app/InstallPromptBanner";

export default async function ApplicantLayout({
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

  // Fetch user data for status context
  const { data: userDataRaw } = await supabase
    .from("users")
    .select("role, payment_status, is_goocampus_member, onboarding_section")
    .eq("id", user.id)
    .single();
  const userData = userDataRaw as Record<string, unknown> | null;

  const role = (userData?.role as string) ?? "applicant";

  if (role === "admin" || role === "super_admin") {
    redirect("/admin");
  }

  // Fetch first name from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("user_id", user.id)
    .single();

  // Fetch membership dates from payments
  const { data: paymentRaw } = await supabase
    .from("payments")
    .select("membership_start_date, membership_end_date")
    .eq("user_id", user.id)
    .single();
  const payment = paymentRaw as Record<string, unknown> | null;

  const onboardingComplete = Number(userData?.onboarding_section) >= 13;

  const userStatus = {
    userId: user.id,
    firstName: profile?.first_name ?? null,
    paymentStatus: (userData?.payment_status as string) ?? 'unverified',
    isGoocampusMember: (userData?.is_goocampus_member as boolean) ?? false,
    onboardingComplete,
    membershipStartDate: (payment?.membership_start_date as string) ?? null,
    membershipEndDate: (payment?.membership_end_date as string) ?? null,
  };

  // During onboarding, render bare — FormShell owns its own full-viewport layout
  if (!onboardingComplete) {
    return (
      <UserStatusProvider value={userStatus}>
        {children}
        <ServiceWorkerRegistration />
      </UserStatusProvider>
    );
  }

  return (
    <UserStatusProvider value={userStatus}>
      <div className="bg-page-warm">
        <AppHeader />
        <main className="mx-auto max-w-lg px-5 pb-24 pt-14">{children}</main>
        <BottomNav />
        <InstallPromptBanner />
        <ServiceWorkerRegistration />
      </div>
    </UserStatusProvider>
  );
}
