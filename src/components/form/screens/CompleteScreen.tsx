'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';

interface CompleteScreenProps {
  isGoocampus?: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919742811599';

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CompleteScreen({ isGoocampus }: CompleteScreenProps) {
  return (
    <div className="max-w-xl mx-auto py-12 lg:py-20 pb-[calc(3rem+env(safe-area-inset-bottom))] lg:pb-20">
      {/* Celebration check mark */}
      <div className="flex justify-center mb-6">
        <div className="relative flex items-center justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500 animate-scale-in">
            <svg
              viewBox="0 0 24 24"
              className="size-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 12 9 17 20 7" strokeDasharray="24" className="animate-checkmark" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Submitted
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground text-center mb-4 lg:text-3xl">
        Your application is in
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-2">
        Thank you for completing your Samvaya profile.
      </p>
      <p className="text-xs text-muted-foreground/60 text-center mb-10">
        All 14 sections complete · {formatDate()}
      </p>

      {isGoocampus ? <GooCampusBlock /> : <VerificationBlock />}
    </div>
  );
}

function GooCampusBlock() {
  return (
    <Card>
      <CardContent>
        <div className="text-sm font-medium text-foreground mb-3">You&apos;re all set</div>
        <p className="text-sm text-muted-foreground mb-4">
          As a GooCampus member, your verification has already been completed,
          so you can skip the verification step. Your profile will enter our
          candidate pool shortly.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          We&apos;ll reach out as soon as we have a compatible match for you.
        </p>
        <Card size="sm" className="bg-background">
          <CardContent>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              What happens next
            </div>
            <ol className="space-y-1.5">
              {[
                'Our team reviews your profile',
                'We search for compatible matches',
                'We contact you when we find one',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-xs font-medium text-primary mt-0.5 tabular-nums shrink-0">
                    {i + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function VerificationBlock() {
  return (
    <Card>
      <CardContent>
        <div className="text-sm font-medium text-foreground mb-3">One last step</div>
        <p className="text-sm text-muted-foreground mb-4">
          Before we add you to our candidate pool, we carry out the same
          comprehensive background verification that every Samvaya member
          goes through — identity, education, employment, address, financial
          standing, and court records.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          This is how we ensure every match on Samvaya is between two
          verified people. No exceptions.
        </p>

        <Card size="sm" className="mb-5 bg-background">
          <CardContent>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Verification fee
            </div>
            <div className="text-2xl font-semibold tracking-tight text-foreground mb-1">
              ₹7,080
            </div>
            <p className="text-xs text-muted-foreground">
              ₹6,000 + 18% GST. One-time, non-refundable. Verification begins
              once payment is confirmed.
            </p>
          </CardContent>
        </Card>

        <Card size="sm" className="mb-6 bg-background">
          <CardContent>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              About the service fee
            </div>
            <p className="text-xs text-muted-foreground">
              A service fee of ₹41,300 (₹35,000 + 18% GST) only applies once we
              find a compatible match and both parties confirm mutual interest.
              If we don&apos;t find a match, no service fee is required.
            </p>
          </CardContent>
        </Card>

        <Button asChild className="w-full rounded-xl">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              'Hi, I have completed my Samvaya profile and would like to proceed with the verification fee payment of ₹7,080.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact us on WhatsApp
          </a>
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Our team will also reach out to you shortly.
        </p>
      </CardContent>
    </Card>
  );
}
