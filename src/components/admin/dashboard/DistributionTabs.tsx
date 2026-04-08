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
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="type-heading text-gray-900">Applicant Distribution</h3>

      {/* Tab bar */}
      <div className="mt-3 flex border-b border-gray-100" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-admin-blue-500 text-admin-blue-900'
                : 'text-gray-400 hover:text-gray-600'
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
