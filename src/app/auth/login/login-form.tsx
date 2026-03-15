"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { sendOtp, verifyOtp } from "./actions";

type Step = "email" | "otp";

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const handleChange = (index: number, char: string) => {
    const cleaned = char.replace(/\D/g, "");
    if (!cleaned) return;
    const newDigits = [...digits];
    newDigits[index] = cleaned[0];
    const newVal = newDigits.join("").replace(/ /g, "");
    onChange(newVal);
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

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digit === " " ? "" : digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of 6`}
          className="h-12 w-10 rounded-lg border-2 border-gray-200 bg-white text-center text-lg font-semibold text-gray-900 transition-colors focus:border-samvaya-red focus:ring-1 focus:ring-samvaya-red focus:outline-none disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl"
        />
      ))}
    </div>
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

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const result = await sendOtp(email);

      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }

      setStep("otp");
      setResendCooldown(60);
    },
    [email]
  );

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const result = await verifyOtp(email, otpCode);

      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }

      // Redirect to the originally requested path, or let middleware decide
      if (nextPath && nextPath.startsWith("/")) {
        router.push(nextPath);
      } else {
        router.refresh();
      }
    },
    [email, otpCode, router, nextPath]
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);

    const result = await sendOtp(email);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setResendCooldown(60);
  }, [email, resendCooldown]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-samvaya-blush px-4">
      <div className="w-full max-w-sm">
        {/* Logo and tagline */}
        <div className="mb-10 text-center">
          <Image
            src="/samvaya-logo-red.png"
            alt="Samvaya"
            width={180}
            height={48}
            className="mx-auto"
            priority
          />
          <p className="mt-3 text-sm text-gray-500">
            Curated matrimony for medical professionals
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-center text-base font-semibold text-gray-900">
            {step === "email" ? "Sign in to your account" : "Enter verification code"}
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            {step === "email"
              ? "We\u2019ll send a 6-digit code to your email"
              : email}
          </p>

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
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
                  className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-samvaya-red focus:bg-white focus:ring-1 focus:ring-samvaya-red focus:outline-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-samvaya-red px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-samvaya-red-dark focus:ring-2 focus:ring-samvaya-red focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending code..." : "Send verification code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                disabled={loading}
              />

              {error && (
                <p className="text-sm text-red-600 text-center" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full rounded-lg bg-samvaya-red px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-samvaya-red-dark focus:ring-2 focus:ring-samvaya-red focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify and sign in"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtpCode("");
                    setError("");
                  }}
                  className="font-medium text-samvaya-red hover:text-samvaya-red-dark"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="font-medium text-samvaya-red hover:text-samvaya-red-dark disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <a href="/legal/terms" className="underline hover:text-gray-600">
            Terms
          </a>{" "}
          and{" "}
          <a href="/legal/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
