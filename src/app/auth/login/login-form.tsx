"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtp, verifyOtp } from "./actions";
import { cn } from "@/lib/utils";

type Step = "email" | "otp";

function isSafeRedirectPath(path: string | null): boolean {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  return path === "/app" || path.startsWith("/app/") || path === "/admin" || path.startsWith("/admin/");
}

// ── Design tokens ─────────────────────────────────────────
const C = {
  ink: "#1A1614",
  ink2: "#3B3430",
  muted: "#7A7370",
  faint: "#A8A19D",
  line: "#ECE7E2",
  line2: "#E3DDD6",
  bg: "#FBF8F4",
  accent: "#A3171F",
  accentSoft: "#FFF4F4",
  accentDeep: "#7D1118",
  gold: "#A8804A",
  goldSoft: "#F5EEDE",
};

// ── Arch SVG ornament ─────────────────────────────────────
function ArchOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 520" width="520" height="520" fill="none" className={className} aria-hidden="true">
      {[240, 200, 160, 120, 80].map((r, i) => (
        <circle key={r} cx="260" cy="260" r={r}
          stroke="#FFF6E9" strokeWidth="1" opacity={0.35 - i * 0.04}
          strokeDasharray={i % 2 ? "2 5" : "0"} />
      ))}
      <path d="M260 60 C310 130 310 260 260 330 C210 260 210 130 260 60 Z" stroke="#FFF6E9" strokeWidth="1" opacity="0.4" />
      <path d="M60 260 C130 210 390 210 460 260 C390 310 130 310 60 260 Z" stroke="#FFF6E9" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

// ── Brand panel (desktop left) ────────────────────────────
function BrandPanel() {
  return (
    <div
      className="hidden lg:flex relative flex-col overflow-hidden"
      style={{
        flex: "0 0 48%",
        background: `radial-gradient(140% 90% at 20% 10%, ${C.accent} 0%, ${C.accentDeep} 45%, #2A0912 85%, #150509 100%)`,
        color: "#FFF6E9",
        padding: "64px 64px 56px",
      }}
    >
      {/* Arch ornament */}
      <div className="absolute pointer-events-none" style={{ right: -160, top: -160, opacity: 0.22 }}>
        <ArchOrnament />
      </div>

      {/* Brand lockup */}
      <div className="relative flex items-center gap-3">
        <div
          className="grid place-items-center shrink-0"
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.22)",
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 22, fontWeight: 500, letterSpacing: "-0.6px",
          }}
        >s</div>
        <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 22, fontWeight: 500, letterSpacing: "-0.4px" }}>
          samvaya
        </span>
      </div>

      {/* Eyebrow */}
      <div className="relative mt-16">
        <span
          className="inline-flex items-center gap-2"
          style={{
            padding: "6px 12px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            fontSize: 10.5, fontWeight: 600,
            letterSpacing: "1.6px", textTransform: "uppercase",
            color: "rgba(255,246,233,0.82)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F5EEDE" }} />
          By invitation · For verified doctors
        </span>
      </div>

      {/* Hero */}
      <div className="relative mt-7">
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 52, lineHeight: 1.04,
            fontWeight: 500, letterSpacing: "-1.8px",
            color: "#FFF6E9",
          }}
        >
          Where exceptional<br />
          <span style={{ fontStyle: "italic", color: "#F1C88E", fontWeight: 400 }}>doctors</span> find<br />
          exceptional partners.
        </h1>
        <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.6, color: "rgba(255,246,233,0.72)", maxWidth: 380, letterSpacing: "-0.1px" }}>
          A premium, curated matrimony platform — exclusively for medical professionals across India and their diaspora.
        </p>
      </div>

      <div className="flex-1" />

      {/* Stats */}
      <div
        className="relative flex gap-7"
        style={{ paddingTop: 24, borderTop: "1px solid rgba(255,246,233,0.12)" }}
      >
        {[
          { k: "2,400+", l: "verified doctors" },
          { k: "96%", l: "profiles reviewed by humans" },
          { k: "14 days", l: "to first curated match" },
        ].map((s) => (
          <div key={s.k} className="flex-1">
            <div style={{ fontSize: 22, fontFamily: "var(--font-fraunces), serif", fontWeight: 500, letterSpacing: "-0.5px", color: "#FFF6E9" }}>{s.k}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,246,233,0.55)", marginTop: 4, letterSpacing: "0.2px" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="relative flex items-center gap-2.5"
        style={{ marginTop: 28, fontSize: 11.5, color: "rgba(255,246,233,0.45)", letterSpacing: "0.3px", textTransform: "uppercase", fontWeight: 500 }}
      >
        <span>© 2026 Samvaya Matrimony</span>
        <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,246,233,0.3)" }} />
        <span>Mumbai · Bengaluru</span>
      </div>
    </div>
  );
}

// ── Email field ───────────────────────────────────────────
function EmailField({
  value, onChange, focused, hasError, onFocus, onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  focused: boolean;
  hasError: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const border = hasError ? "#B3261E" : focused ? C.accent : C.line2;
  return (
    <div>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: "-0.1px", marginBottom: 8 }}>
        Email address
      </label>
      <div
        style={{
          height: 56, padding: "0 18px",
          background: "#FFFFFF",
          border: `1.5px solid ${border}`,
          borderRadius: 14,
          boxShadow: focused ? `0 0 0 3px ${C.accentSoft}` : "none",
          display: "flex", alignItems: "center", gap: 10,
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
          <rect x="2" y="4" width="14" height="10" rx="2" stroke={C.muted} strokeWidth="1.3" />
          <path d="M2.5 5l6.5 4.5L15.5 5" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value.trim().toLowerCase())}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="you@hospital.com"
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 16, letterSpacing: "-0.1px", color: value ? C.ink : C.faint,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        />
        {hasError && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="7" fill="#B3261E" />
            <path d="M8 4.5v4M8 11v.3" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

// ── Primary button ────────────────────────────────────────
function PrimaryButton({ children, disabled, loading, onClick, type = "submit" }: {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="form-btn-primary w-full"
    >
      {loading ? (
        <>
          <span style={{
            width: 16, height: 16, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.4)",
            borderTopColor: "#FFFFFF",
            display: "inline-block",
            animation: "spin 0.9s linear infinite",
          }} />
          {children}
        </>
      ) : children}
    </button>
  );
}

// ── Email step ────────────────────────────────────────────
function EmailStep({
  email, setEmail, error, loading, onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 420, marginInline: "auto", display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h2 style={{
          margin: 0, fontFamily: "var(--font-fraunces), serif",
          fontSize: 32, fontWeight: 500, letterSpacing: "-0.8px", color: C.ink, lineHeight: 1.15,
        }}>
          Welcome back
        </h2>
        <p style={{ marginTop: 8, fontSize: 15, color: C.muted, lineHeight: 1.55, letterSpacing: "-0.05px" }}>
          Sign in to continue your Samvaya profile — or start fresh if this is your first visit.
        </p>
      </div>

      <EmailField
        value={email}
        onChange={setEmail}
        focused={focused}
        hasError={hasError}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {error && (
        <p style={{ margin: "-16px 0 0", fontSize: 12.5, color: "#B3261E", lineHeight: 1.45 }} role="alert">
          {error}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <PrimaryButton disabled={!email || hasError} loading={loading}>
          {loading ? "Sending code…" : (
            <>
              Send verification code
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </PrimaryButton>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.line }} />
          <span style={{ fontSize: 11, color: C.faint, letterSpacing: "1.4px", textTransform: "uppercase", fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.line }} />
        </div>

        {/* Hint: no Google auth — just invite info */}
      </div>

      {/* Invite-only callout */}
      <div style={{
        padding: "14px 16px",
        background: C.goldSoft,
        border: `1px solid rgba(168,128,74,0.24)`,
        borderRadius: 12,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M9 1.5L2 4v5c0 4 3 7 7 7.5 4-.5 7-3.5 7-7.5V4L9 1.5z" stroke={C.gold} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6.5 9L8 10.5l3.5-3.5" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p style={{ margin: 0, fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>
          <strong style={{ color: C.ink, fontWeight: 600 }}>Invite only.</strong>{" "}
          If you don&apos;t have an invite, request one from a Samvaya matchmaker and we&apos;ll be in touch within 48 hours.{" "}
          <a href="mailto:hello@samvayamatrimony.com" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>
            Request an invite →
          </a>
        </p>
      </div>
    </form>
  );
}

// ── Custom OTP input — 6 separate cells matching the Claude Design spec ───
function OtpCells({
  value, onChange, disabled, hasError, success, autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  success?: boolean;
  autoFocus?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const focusIndex = (i: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(5, i))];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (i: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      // Clear current cell
      const next = (value.slice(0, i) + value.slice(i + 1)).slice(0, 6);
      onChange(next);
      return;
    }
    if (cleaned.length === 1) {
      const next = (value.slice(0, i) + cleaned + value.slice(i + 1)).slice(0, 6);
      onChange(next);
      if (i < 5) focusIndex(i + 1);
      return;
    }
    // Pasted multiple digits in a single cell
    const merged = (value.slice(0, i) + cleaned).slice(0, 6);
    onChange(merged);
    focusIndex(Math.min(5, i + cleaned.length));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        // Clear current cell — handled by onChange
        return;
      }
      if (i > 0) {
        e.preventDefault();
        const next = (value.slice(0, i - 1) + value.slice(i)).slice(0, 6);
        onChange(next);
        focusIndex(i - 1);
      }
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); focusIndex(i - 1); return; }
    if (e.key === "ArrowRight" && i < 5) { e.preventDefault(); focusIndex(i + 1); return; }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focusIndex(Math.min(5, pasted.length));
  };

  return (
    <div className="flex gap-2 sm:gap-2.5 w-full">
      {digits.map((d, i) => {
        const isActive = !success && !disabled && (
          // Active cell: first empty cell, or last cell when full
          value.length === i || (value.length === 6 && i === 5)
        );
        const filled = !!d;
        const border = hasError
          ? "#B3261E"
          : success
            ? "#2F7A5B"
            : isActive
              ? C.accent
              : (filled ? C.line : C.line2);
        return (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={d}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1} of 6`}
            aria-invalid={hasError || undefined}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              height: 62,
              padding: 0,
              textAlign: "center",
              background: success ? "#ECFDF5" : "#FFFFFF",
              border: `1.5px solid ${border}`,
              borderRadius: 14,
              boxShadow: isActive ? `0 0 0 3px ${C.accentSoft}` : "none",
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 28,
              fontWeight: 500,
              color: C.ink,
              letterSpacing: "-0.4px",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              caretColor: C.accent,
            }}
          />
        );
      })}
    </div>
  );
}

// ── OTP step ──────────────────────────────────────────────
function OtpStep({
  email, otpCode, setOtpCode, error, loading, verifySuccess, otpError,
  resendCooldown, onSubmit, onBack, onResend,
}: {
  email: string; otpCode: string; setOtpCode: (v: string) => void;
  error: string; loading: boolean; verifySuccess: boolean; otpError: boolean;
  resendCooldown: number; onSubmit: (e: React.FormEvent) => void;
  onBack: () => void; onResend: () => void;
}) {
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 420, marginInline: "auto", display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: 0, background: "transparent", border: "none", cursor: "pointer",
            color: C.muted, fontSize: 13, fontWeight: 500,
            fontFamily: "var(--font-inter), sans-serif",
            display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M7 3L4 6l3 3" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Use a different email
        </button>
        <h2 style={{
          margin: 0, fontFamily: "var(--font-fraunces), serif",
          fontSize: 32, fontWeight: 500, letterSpacing: "-0.8px", color: C.ink, lineHeight: 1.15,
        }}>
          Check your inbox
        </h2>
        <p style={{ marginTop: 10, fontSize: 15, color: C.muted, lineHeight: 1.55, letterSpacing: "-0.05px" }}>
          We&apos;ve sent a 6-digit code to{" "}
          <strong style={{ color: C.ink, fontWeight: 600 }}>{email}</strong>.{" "}
          It expires in 10 minutes.
        </p>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: "-0.1px", marginBottom: 10 }}>
          Verification code
        </div>
        <div className={cn(otpError && "animate-shake")}>
          <OtpCells
            value={otpCode}
            onChange={setOtpCode}
            disabled={loading || verifySuccess}
            hasError={otpError}
            success={verifySuccess}
            autoFocus
          />
        </div>
      </div>

      {error && (
        <p style={{ margin: "-16px 0 0", fontSize: 12.5, color: "#B3261E", textAlign: "center", lineHeight: 1.45 }} role="alert">
          {error}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: C.muted }}>
        <span>Didn&apos;t get it?</span>
        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0 || loading}
          style={{
            background: "transparent", border: "none", padding: 0, cursor: resendCooldown > 0 || loading ? "default" : "pointer",
            color: resendCooldown > 0 || loading ? C.muted : C.accent,
            fontSize: 13, fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : "Resend code"}
        </button>
      </div>

      <PrimaryButton disabled={otpCode.length < 6} loading={loading}>
        {verifySuccess ? "Verified! Redirecting…" : loading ? "Verifying…" : "Continue"}
      </PrimaryButton>

      {/* Security note */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px",
        background: "#FFFFFF", border: `1px solid ${C.line}`,
        borderRadius: 12, fontSize: 12.5, color: C.muted, lineHeight: 1.45,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
          <rect x="2.5" y="6" width="9" height="6" rx="1.2" stroke={C.muted} strokeWidth="1.3" />
          <path d="M4.5 6V4.2a2.5 2.5 0 015 0V6" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        We never store this code. After verification, you&apos;ll stay signed in on this device for 30 days.
      </div>
    </form>
  );
}

// ── Mobile hero + card layout ─────────────────────────────
function MobileHero({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="lg:hidden flex flex-col min-h-svh"
      style={{
        background: `radial-gradient(140% 80% at 30% 0%, ${C.accent} 0%, ${C.accentDeep} 50%, #1B0309 100%)`,
        color: "#FFF6E9",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Arch ornament */}
      <div className="absolute pointer-events-none" style={{ right: -120, top: -120, opacity: 0.18 }}>
        <svg viewBox="0 0 400 400" width="400" height="400" fill="none" aria-hidden="true">
          {[180, 140, 100, 60].map((r, i) => (
            <circle key={r} cx="200" cy="200" r={r} stroke="#FFF6E9" strokeWidth="1"
              opacity={0.4 - i * 0.06} strokeDasharray={i % 2 ? "2 5" : "0"} />
          ))}
        </svg>
      </div>

      {/* Brand + hero */}
      <div style={{ padding: "48px 28px 0", position: "relative" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="grid place-items-center shrink-0"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 18, fontWeight: 500, letterSpacing: "-0.4px",
              color: "#FFF6E9",
            }}
          >s</div>
          <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 18, fontWeight: 500, letterSpacing: "-0.3px" }}>
            samvaya
          </span>
        </div>

        <h1 style={{
          marginTop: 36, fontSize: 32, lineHeight: 1.08,
          fontFamily: "var(--font-fraunces), serif",
          fontWeight: 500, letterSpacing: "-1px",
        }}>
          Where exceptional{" "}
          <span style={{ fontStyle: "italic", color: "#F1C88E", fontWeight: 400 }}>doctors</span>{" "}
          find exceptional partners.
        </h1>
        <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.55, color: "rgba(255,246,233,0.68)", maxWidth: 360 }}>
          A premium, curated matrimony platform — exclusively for medical professionals in India.
        </p>
      </div>

      <div className="flex-1 min-h-[24px]" />

      {/* Form card */}
      <div
        className="mx-4 mb-4 sm:mx-6 sm:mb-6"
        style={{
          background: "#FFFFFF", borderRadius: 22,
          padding: "28px 24px 32px",
          color: C.ink,
          boxShadow: "0 -6px 24px rgba(0,0,0,0.24)",
        }}
      >
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────
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
  const [redirecting, setRedirecting] = useState(false);
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

  const handleSendOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await sendOtp(email);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setTransitioning(true);
    setTimeout(() => { setStep("otp"); setResendCooldown(60); setTransitioning(false); }, 150);
  }, [email]);

  const handleVerifyOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || verifySuccess) return;
    setError("");
    setLoading(true);
    const result = await verifyOtp(email, otpCode);
    if (result.error) {
      setLoading(false); setError(result.error); setOtpError(true); return;
    }
    setVerifySuccess(true);
    setTimeout(() => {
      setRedirecting(true);
      try {
        if (isSafeRedirectPath(nextPath)) { router.push(nextPath!); }
        else { router.push("/app"); }
      } catch { router.push("/app"); }
    }, 500);
  }, [email, otpCode, router, nextPath, loading, verifySuccess]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || loading) return;
    setError(""); setLoading(true);
    const result = await sendOtp(email);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setResendCooldown(60);
  }, [email, resendCooldown, loading]);

  const handleBack = useCallback(() => {
    setStep("email"); setOtpCode(""); setError(""); setOtpError(false); setVerifySuccess(false);
  }, []);

  if (redirecting) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4" style={{ background: C.bg }}>
        <span style={{
          width: 24, height: 24, borderRadius: "50%",
          border: `2.5px solid ${C.line2}`,
          borderTopColor: C.accent,
          display: "inline-block",
          animation: "spin 0.9s linear infinite",
        }} />
        <p style={{ fontSize: 14, color: C.muted }}>Taking you to your account…</p>
      </div>
    );
  }

  const formContent = step === "email" ? (
    <EmailStep email={email} setEmail={setEmail} error={error} loading={loading} onSubmit={handleSendOtp} />
  ) : (
    <OtpStep
      email={email} otpCode={otpCode} setOtpCode={setOtpCode}
      error={error} loading={loading} verifySuccess={verifySuccess} otpError={otpError}
      resendCooldown={resendCooldown} onSubmit={handleVerifyOtp}
      onBack={handleBack} onResend={handleResend}
    />
  );

  return (
    <>
      {/* Mobile / tablet layout — single column with hero + card */}
      <MobileHero>
        <div
          className={cn("transition-opacity duration-150 w-full", transitioning ? "opacity-0" : "opacity-100")}
        >
          {formContent}
        </div>
      </MobileHero>

      {/* Desktop layout — split panel (≥ 1024px) */}
      <div
        className="hidden lg:flex min-h-svh items-center justify-center"
        style={{ background: C.bg, padding: "40px" }}
      >
        <div
          style={{
            width: "100%", maxWidth: 1200,
            display: "flex",
            background: "#FFFFFF",
            borderRadius: 24,
            overflow: "hidden",
            border: `1px solid ${C.line}`,
            boxShadow: "0 1px 2px rgba(26,22,20,0.04), 0 24px 60px rgba(26,22,20,0.08)",
            minHeight: 740,
          }}
        >
          <BrandPanel />

          {/* Right panel */}
          <div
            style={{
              flex: 1, minWidth: 0,
              padding: "64px 72px",
              display: "flex", flexDirection: "column",
              background: `linear-gradient(180deg, #FFFFFF 0%, ${C.bg} 100%)`,
            }}
          >
            {/* Top-right helper */}
            <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 13, color: C.muted }}>
              {step === "otp" ? "Having trouble?" : "New to Samvaya?"}
              <a
                href="mailto:hello@samvayamatrimony.com"
                style={{ marginLeft: 6, color: C.accent, fontWeight: 600, textDecoration: "none" }}
              >
                {step === "otp" ? "Contact concierge" : "Request an invite →"}
              </a>
            </div>

            {/* Centered form */}
            <div
              className={cn("flex-1 flex items-center justify-center transition-opacity duration-150", transitioning ? "opacity-0" : "opacity-100")}
            >
              {formContent}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 12.5, color: C.muted,
                paddingTop: 24, borderTop: `1px solid ${C.line}`,
              }}
            >
              <span>
                By continuing, you agree to our{" "}
                <a href="/legal/terms" style={{ color: C.ink2, textDecoration: "underline", textDecorationColor: C.line2, textUnderlineOffset: 3 }}>Terms</a>
                <span style={{ margin: "0 4px" }}>and</span>
                <a href="/legal/privacy" style={{ color: C.ink2, textDecoration: "underline", textDecorationColor: C.line2, textUnderlineOffset: 3 }}>Privacy Policy</a>.
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="2.5" y="6" width="9" height="6" rx="1.2" stroke={C.muted} strokeWidth="1.3" />
                  <path d="M4.5 6V4.2a2.5 2.5 0 015 0V6" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Encrypted end-to-end
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
