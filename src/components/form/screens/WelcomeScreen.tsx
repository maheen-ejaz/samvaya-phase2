'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react';

interface WelcomeScreenProps {
  firstName?: string | null;
}

const SECTION_GROUPS = [
  {
    label: 'About You',
    sections: ['Basic Identity', 'Location & Citizenship', 'Religion & Community'],
  },
  {
    label: 'Life & Values',
    sections: ['Family Background', 'Physical Details', 'Lifestyle', 'Personality & Interests'],
  },
  {
    label: 'Career & Finances',
    sections: ['Education', 'Career', 'Financial Background'],
  },
  {
    label: 'Compatibility',
    sections: ['Goals & Values', 'Partner Preferences'],
  },
  {
    label: 'Verification',
    sections: ['Documents & Verification', 'Conversations'],
  },
];

export function WelcomeScreen({ firstName }: WelcomeScreenProps) {
  const [sectionMapOpen, setSectionMapOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto py-12 lg:py-20 pb-[calc(3rem+env(safe-area-inset-bottom))] lg:pb-20">
      <div className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Welcome
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground text-center mb-4 lg:text-3xl">
        {firstName ? `Hi ${firstName}, let's begin` : "Let's build your profile"}
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-10">
        About 100 questions, 14 sections. Takes around 45–60 minutes.
        Everything is saved automatically — you can pause and resume anytime.
      </p>

      <Card className="mb-6">
        <CardContent>
          <div className="text-sm font-medium text-foreground mb-3">A few things to know</div>
          <ul className="space-y-2.5">
            <Bullet>
              Everything you share is private. We never share your details with
              other members until you both confirm mutual interest.
            </Bullet>
            <Bullet>
              There are no right or wrong answers — be honest, take your time.
            </Bullet>
            <Bullet>
              Three of the questions are short conversations with Samvaya
              (about 4–6 messages each). They&apos;re how we get to know you.
            </Bullet>
          </ul>
        </CardContent>
      </Card>

      {/* Expandable section map */}
      <div className="mb-10">
        <button
          type="button"
          onClick={() => setSectionMapOpen((o) => !o)}
          className="mx-auto flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-opacity"
          aria-expanded={sectionMapOpen}
        >
          <ChevronRightIcon
            className={cn('size-3 transition-transform', sectionMapOpen && 'rotate-90')}
          />
          {sectionMapOpen ? 'Hide section overview' : 'See what\'s covered in 14 sections'}
        </button>

        {sectionMapOpen && (
          <Card className="mt-4 animate-fade-in-up">
            <CardContent className="space-y-3">
              {SECTION_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    {group.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.sections.map((name) => (
                      <Badge key={name} variant="outline" className="text-xs font-normal">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-center">
        <Button asChild className="min-w-[14rem] gap-1.5 rounded-xl">
          <Link href="/app/onboarding/a/intro">
            Begin
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
      <span
        className="mt-2 inline-block size-1 shrink-0 rounded-full bg-primary"
        aria-hidden="true"
      />
      <span>{children}</span>
    </li>
  );
}
