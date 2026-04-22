"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { sendOtp, verifyOtp } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

type Step = "email" | "otp";

/** Validate redirect path — prevent open redirect attacks */
function isSafeRedirectPath(path: string | null): boolean {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  return path === "/app" || path.startsWith("/app/") || path === "/admin" || path.startsWith("/admin/");
}

function CountdownRing({ seconds, total = 60 }: { seconds: number; total?: number }) {
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - seconds / total);

  return (
    <svg className="size-7" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r={radius.toString()} stroke="#e5e7eb" strokeWidth="2.5" fill="none" />
      <circle
        cx="14" cy="14" r={radius.toString()}
        stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"
        strokeDasharray={circumference.toString()}
        strokeDashoffset={strokeDashoffset.toString()}
        transform="rotate(-90 14 14)"
        style={{ transition: "stroke-dashoffset 0.5s linear" }}
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!otpError) return;
    const timer = setTimeout(() => setOtpError(false), 1000);
    return () => clearTimeout(timer);
  }, [otpError]);

  const handleSendOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      const result = await sendOtp(email);
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      setTransitioning(true);
      setTimeout(() => { setStep("otp"); setResendCooldown(60); setTransitioning(false); }, 150);
    },
    [email]
  );

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading || verifySuccess) return;
      setError("");
      setLoading(true);
      const result = await verifyOtp(email, otpCode);
      if (result.error) {
        setLoading(false);
        setError(result.error);
        setOtpError(true);
        return;
      }
      setVerifySuccess(true);
      setTimeout(() => {
        try {
          if (isSafeRedirectPath(nextPath)) { router.push(nextPath!); }
          else { router.push("/app"); }
        } catch { router.push("/app"); }
      }, 600);
    },
    [email, otpCode, router, nextPath, loading, verifySuccess]
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setLoading(true);
    const result = await sendOtp(email);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setResendCooldown(60);
  }, [email, resendCooldown, loading]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-4xl">
        <Card className="overflow-hidden p-0 w-full">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* ═══ LEFT — Brand Visual ═══ */}
            <div className="relative hidden flex-col items-center justify-center gap-8 overflow-hidden bg-samvaya-gradient-2 p-12 md:flex">
              {/* Decorative dot pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true">
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
              </div>

              <div className="relative z-10 animate-fade-in">
                <Image
                  src="/samvaya-logo-white.png"
                  alt="Samvaya"
                  width={160}
                  height={44}
                  className="drop-shadow-lg"
                  priority
                />
              </div>

              <div className="relative z-10 animate-fade-in-up text-center">
                <h1 className="text-3xl font-light leading-tight tracking-tight text-white xl:text-4xl">
                  Where Exceptional<br />
                  Doctors Find<br />
                  Exceptional Partners
                </h1>
                <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
                  A premium, curated matrimony platform exclusively for medical professionals in India.
                </p>
              </div>

              <p className="relative z-10 mt-4 text-xs text-white/40">&copy; 2026 Samvaya Matrimony</p>
            </div>

            {/* ═══ RIGHT — Login Form ═══ */}
            <div className="flex flex-col justify-center p-6 md:p-8">
              {/* Mobile logo */}
              <div className="mb-8 md:hidden">
                <Image
                  src="/samvaya-logo-red.png"
                  alt="Samvaya"
                  width={140}
                  height={38}
                  className="mx-auto"
                  priority
                />
              </div>

              <div className="flex flex-col items-center gap-2 text-center mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {step === "email" ? "Sign in to your account" : "Enter verification code"}
                </h2>
                <p className="text-sm text-muted-foreground text-balance">
                  {step === "email"
                    ? "We\u2019ll send a 6-digit code to your email"
                    : <>Code sent to <span className="font-medium text-foreground">{email}</span></>}
                </p>
              </div>

              {step === "otp" && (
                <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
                  <AlertCircleIcon className="size-4 text-amber-600" />
                  <AlertDescription className="text-xs leading-relaxed">
                    Can&apos;t find it? Check your <strong>spam or junk folder</strong>. The code may take up to 3 minutes to arrive.
                  </AlertDescription>
                </Alert>
              )}

              <div className={cn("transition-opacity duration-150", transitioning ? "opacity-0" : "opacity-100")}>
                {step === "email" ? (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                        placeholder="you@example.com"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    {error && (
                      <p className="animate-fade-in-up text-sm text-destructive" role="alert">{error}</p>
                    )}

                    <Button type="submit" disabled={loading} className="w-full rounded-xl">
                      {loading ? (<><Spinner className="size-4" /> Sending code...</>) : "Send verification code"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="animate-fade-in space-y-5">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={setOtpCode}
                        disabled={loading || verifySuccess}
                        autoFocus
                        aria-invalid={otpError || undefined}
                        className={cn(otpError && "animate-shake")}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className={cn("size-12 text-lg", verifySuccess && "border-emerald-500 bg-emerald-50")} />
                          <InputOTPSlot index={1} className={cn("size-12 text-lg", verifySuccess && "border-emerald-500 bg-emerald-50")} />
                          <InputOTPSlot index={2} className={cn("size-12 text-lg", verifySuccess && "border-emerald-500 bg-emerald-50")} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} className={cn("size-12 text-lg", verifySuccess && "border-emerald-500 bg-emerald-50")} />
                          <InputOTPSlot index={4} className={cn("size-12 text-lg", verifySuccess && "border-emerald-500 bg-emerald-50")} />
                          <InputOTPSlot index={5} className={cn("size-12 text-lg", verifySuccess && "border-emerald-500 bg-emerald-50")} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <p className="animate-fade-in-up text-center text-sm text-destructive" role="alert">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={loading || otpCode.length < 6 || verifySuccess}
                      className={cn(
                        "w-full rounded-xl",
                        verifySuccess && "bg-emerald-600 hover:bg-emerald-600",
                      )}
                    >
                      {verifySuccess ? (
                        <><CheckCircle2Icon className="size-5" /> Verified!</>
                      ) : loading ? (
                        <><Spinner className="size-4" /> Verifying...</>
                      ) : (
                        "Verify and sign in"
                      )}
                    </Button>

                    {!verifySuccess && (
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => { setStep("email"); setOtpCode(""); setError(""); setOtpError(false); setVerifySuccess(false); }}
                          className="text-primary"
                        >
                          Change email
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResend}
                          disabled={resendCooldown > 0 || loading}
                          className="gap-1.5 text-primary"
                        >
                          {resendCooldown > 0 && <CountdownRing seconds={resendCooldown} />}
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                        </Button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By signing in, you agree to our{" "}
        <a href="/legal/terms" className="underline underline-offset-4 hover:text-foreground">Terms</a>
        {" "}and{" "}
        <a href="/legal/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</a>
      </p>
    </div>
  );
}
