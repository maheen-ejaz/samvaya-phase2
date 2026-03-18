import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginSkeleton() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-samvaya-gradient px-4">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <div className="h-12 w-44 rounded-lg bg-white/20 animate-pulse" />
        </div>
        <div className="overflow-hidden rounded-3xl bg-white/95 shadow-2xl">
          <div className="h-1 bg-gradient-to-r from-samvaya-red via-samvaya-red-light to-samvaya-gold" />
          <div className="space-y-4 p-6">
            <div className="mx-auto h-5 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="mx-auto h-4 w-56 rounded bg-gray-100 animate-pulse" />
            <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-11 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
