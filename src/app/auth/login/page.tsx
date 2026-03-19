import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel skeleton */}
      <div className="hidden w-1/2 bg-samvaya-gradient-2 lg:block" />
      {/* Right panel skeleton */}
      <div className="flex w-full flex-col items-center justify-center bg-[#FAFAF9] px-6 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          <div className="card-glass p-10">
            <div className="h-7 w-56 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-100" />
            <div className="mt-8 space-y-5">
              <div>
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
              </div>
              <div className="h-12 animate-pulse rounded-xl bg-gray-200" />
            </div>
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
