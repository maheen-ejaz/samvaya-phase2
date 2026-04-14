'use client';

import { useState } from 'react';
import type { DistributionEntry } from '@/types/dashboard';
import { DistributionBarChart } from './DistributionBarChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type TabKey = 'location' | 'education' | 'age' | 'gender';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'location', label: 'Location' },
  { key: 'education', label: 'Education' },
  { key: 'age', label: 'Age Group' },
  { key: 'gender', label: 'Gender' },
];

interface DistributionTabsProps {
  locationData: DistributionEntry[];
  educationData: DistributionEntry[];
  ageData: DistributionEntry[];
  genderData: DistributionEntry[];
}

export function DistributionTabs({ locationData, educationData, ageData, genderData }: DistributionTabsProps) {
  const dataMap: Record<TabKey, DistributionEntry[]> = {
    location: locationData,
    education: educationData,
    age: ageData,
    gender: genderData,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Applicant Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="location">
          <TabsList variant="line">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <div className="mt-4 max-h-[320px] overflow-y-auto">
                <DistributionBarChart data={dataMap[tab.key]} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
