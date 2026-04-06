"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { sendOtp, verifyOtp } from "./actions";

type Step = "email" | "otp";

/** Validate redirect path — prevent open redirect attacks */
function isSafeRedirectPath(path: string | null): boolean {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  return path === "/app" || path.startsWith("/app/") || path === "/admin" || path.startsWith("/admin/");
}

function OtpInput({
  value,
  onChange,
  disabled,
  hasError,
  shakeKey,
  isSuccess,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  hasError: boolean;
  shakeKey: number;
  isSuccess: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);
  const [filledIndices, setFilledIndices] = useState<Set<number>>(new Set());

  const handleChange = (index: number, char: string) => {
    const cleaned = char.replace(/\D/g, "");
    if (!cleaned) return;
    const newDigits = [...digits];
    newDigits[index] = cleaned[0];
    const newVal = newDigits.join("").replace(/ /g, "");
    onChange(newVal);

    setFilledIndices((prev) => new Set(prev).add(index));
    setTimeout(() => {
      setFilledIndices((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 200);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (digits[index] && digits[index] !== " ") {
        newDigits[index] = " ";
        onChange(newDigits.join("").trimEnd());
      } else if (index > 0) {
        newDigits[index - 1] = " ";
        onChange(newDigits.join("").trimEnd());
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const getBorderClass = (index: number) => {
    if (isSuccess) return "border-green-500 bg-green-50";
    if (hasError) return "border-red-400 bg-red-50/30";
    if (filledIndices.has(index)) return "border-samvaya-red scale-105";
    return "border-gray-200 bg-white";
  };

  return (
    <div
      key={shakeKey}
      className={`flex justify-center gap-2.5 ${hasError ? "animate-shake" : ""}`}
      onPaste={handlePaste}
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled || isSuccess}
          value={digit === " " ? "" : digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of 6`}
          className={`h-12 w-10 rounded-xl border-2 text-center text-lg font-semibold text-gray-900 shadow-sm transition-all duration-150 focus:border-samvaya-red focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.15)] focus:outline-none disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl ${getBorderClass(i)}`}
        />
      ))}
    </div>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" className="text-green-500" />
      <path
        d="M6 10.5 8.5 13 14 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-500 animate-checkmark"
        strokeDasharray="24"
        strokeDashoffset="24"
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
  const [shakeKey, setShakeKey] = useState(0);
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
        setShakeKey((k) => k + 1);
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
    <div className="flex min-h-screen">
      {/* ═══ LEFT PANEL — Brand Visual ═══ */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center gap-8 overflow-hidden bg-samvaya-gradient-2 p-12 lg:flex">
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

        {/* Logo */}
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

        {/* Hero text */}
        <div className="relative z-10 animate-fade-in-up text-center">
          <h1 className="type-heading-xl leading-tight tracking-tight text-white xl:text-5xl">
            Where Exceptional<br />
            Doctors Find<br />
            Exceptional Partners
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-white/70">
            A premium, curated matrimony platform exclusively for medical professionals in India.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-4">
          <p className="text-sm text-white/40">&copy; 2026 Samvaya Matrimony</p>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Login Form ═══ */}
      <div className="flex w-full flex-col justify-center bg-[#FAFAF9] px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Mobile logo (hidden on desktop) */}
        <div className="mb-10 lg:hidden">
          <Image
            src="/samvaya-logo-red.png"
            alt="Samvaya"
            width={140}
            height={38}
            className="mx-auto"
            priority
          />
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Glass form card */}
          <div className="card-glass animate-scale-in p-8 sm:p-10">
            <h2 className="type-heading-lg text-gray-900">
              {step === "email" ? "Sign in to your account" : "Enter verification code"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {step === "email"
                ? "We\u2019ll send a 6-digit code to your email"
                : `Code sent to ${email}`}
            </p>

            {step === "otp" && (
              <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                Can&apos;t find it? Check your <strong>spam or junk folder</strong>. The code may take up to 3 minutes to arrive — please wait before requesting a new one.
              </p>
            )}

            <div className={`transition-opacity duration-150 ${transitioning ? "opacity-0" : "opacity-100"}`}>
              {step === "email" ? (
                <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                      placeholder="you@example.com"
                      className="input-glass"
                    />
                  </div>

                  {error && (
                    <p className="animate-fade-in-up text-sm text-red-600" role="alert">{error}</p>
                  )}

                  <button type="submit" disabled={loading} className="btn-dark">
                    {loading ? (<><Spinner /> Sending code...</>) : "Send verification code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="animate-fade-in mt-8 space-y-5">
                  <OtpInput
                    value={otpCode}
                    onChange={setOtpCode}
                    disabled={loading}
                    hasError={otpError}
                    shakeKey={shakeKey}
                    isSuccess={verifySuccess}
                  />

                  {error && (
                    <p className="animate-fade-in-up text-center text-sm text-red-600" role="alert">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6 || verifySuccess}
                    className={verifySuccess
                      ? "btn-dark !bg-green-600 hover:!bg-green-600"
                      : "btn-dark"
                    }
                  >
                    {verifySuccess ? (<><CheckmarkIcon /> Verified!</>) : loading ? (<><Spinner /> Verifying...</>) : "Verify and sign in"}
                  </button>

                  {!verifySuccess && (
                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => { setStep("email"); setOtpCode(""); setError(""); setOtpError(false); setVerifySuccess(false); }}
                        className="btn-ghost !px-3 !py-2 !text-sm text-samvaya-red hover:text-samvaya-red-dark"
                      >
                        Change email
                      </button>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || loading}
                        className="btn-ghost !px-3 !py-2 !text-sm text-samvaya-red hover:text-samvaya-red-dark disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Legal footer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <a href="/legal/terms" className="text-gray-500 underline transition-colors hover:text-gray-700">Terms</a>
            {" "}and{" "}
            <a href="/legal/privacy" className="text-gray-500 underline transition-colors hover:text-gray-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
