'use client';

import { useState } from 'react';
import type { DistributionEntry } from '@/types/dashboard';
import { DistributionBarChart } from './DistributionBarChart';

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
  const [activeTab, setActiveTab] = useState<TabKey>('location');

  const dataMap: Record<TabKey, DistributionEntry[]> = {
    location: locationData,
    education: educationData,
    age: ageData,
    gender: genderData,
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">Applicant Distribution</h3>

      {/* Tab bar */}
      <div className="mt-3 flex gap-1 rounded-lg bg-gray-100 p-1" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="mt-4 max-h-[320px] overflow-y-auto" role="tabpanel">
        <DistributionBarChart data={dataMap[activeTab]} />
      </div>
    </div>
  );
}
