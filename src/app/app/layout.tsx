import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatusProvider } from "@/lib/app/user-context";
// PWA chrome — deferred to v2. Imports kept so nothing breaks when we re-enable.
// import { AppHeader } from "@/components/app/AppHeader";
// import { BottomNav } from "@/components/app/BottomNav";
// import { ServiceWorkerRegistration } from "@/components/app/ServiceWorkerRegistration";
// import { InstallPromptBanner } from "@/components/app/InstallPromptBanner";

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
    .select("role, payment_status, is_goocampus_member, onboarding_section, membership_status")
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

  // Gate on membership_status, not onboarding_section. The section counter is
  // written by auto-save on every visit, so >= 13 fires when the user merely
  // opens Section M — one section before the end. membership_status only
  // changes to 'onboarding_complete' after the form is actually submitted.
  const membershipStatus = (userData?.membership_status as string) ?? 'onboarding_pending';
  const onboardingComplete = membershipStatus !== 'onboarding_pending';

  const userStatus = {
    userId: user.id,
    firstName: profile?.first_name ?? null,
    paymentStatus: (userData?.payment_status as string) ?? 'unverified',
    isGoocampusMember: (userData?.is_goocampus_member as boolean) ?? false,
    onboardingComplete,
    membershipStartDate: (payment?.membership_start_date as string) ?? null,
    membershipEndDate: (payment?.membership_end_date as string) ?? null,
  };

  // PWA chrome (AppHeader, BottomNav, ServiceWorker, InstallBanner) is deferred
  // to v2. All users get the bare layout regardless of membership status.
  // To re-enable the PWA: uncomment the imports above, restore isFormOnlyUser,
  // and reinstate the full-PWA branch below.
  return (
    <UserStatusProvider value={userStatus}>
      {children}
    </UserStatusProvider>
  );
}
