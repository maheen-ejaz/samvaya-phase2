import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function LoginSkeleton() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-4xl">
        <Card className="overflow-hidden p-0 w-full">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Left panel skeleton */}
            <div className="hidden bg-samvaya-gradient-2 md:block" />
            {/* Right panel skeleton */}
            <div className="flex flex-col justify-center p-6 md:p-8 space-y-6">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
              <div className="space-y-4">
                <div>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
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
