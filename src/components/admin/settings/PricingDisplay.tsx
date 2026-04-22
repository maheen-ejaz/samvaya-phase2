'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingDisplayProps {
  verificationFee: { amount: number; gst_pct: number; total: number; currency: string } | null;
  membershipFee: { amount: number; gst_pct: number; total: number; currency: string } | null;
}

function formatPaise(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function PricingDisplay({ verificationFee, membershipFee }: PricingDisplayProps) {
  const fees = [
    { label: 'Verification Fee', data: verificationFee, description: 'One-time, non-refundable. Covers 13-point background verification.' },
    { label: 'Membership Fee', data: membershipFee, description: 'Charged on mutual interest. 6-month active membership.' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>
          Pricing is locked and cannot be changed through the admin interface.
        </CardDescription>
        <CardAction>
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
            Locked
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fees.map(({ label, data, description }) => (
            <Card key={label} className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                {data ? (
                  <>
                    <p className="mt-1 text-3xl font-light tabular-nums tracking-tight text-foreground">
                      {formatPaise(data.total)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatPaise(data.amount)} + {data.gst_pct}% GST
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Not configured</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground/70">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
