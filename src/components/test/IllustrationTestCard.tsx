'use client';

import { useState } from 'react';
import type { IconPack } from './icon-packs';

interface Option {
  value: string;
  label: string;
}

interface IllustrationTestCardProps {
  questionId: string;
  options: Option[];
  iconPack: IconPack;
}

export function IllustrationTestCard({
  questionId,
  options,
  iconPack,
}: IllustrationTestCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const count = options.length;
  const gridCols = count === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const icons = iconPack.icons[questionId] ?? {};

  return (
    <div>
      {/* Pack label badge */}
      <div className="mb-2 flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${iconPack.badgeColor}`} />
        <span className="text-xs font-semibold text-gray-700">{iconPack.name}</span>
      </div>
      <p className="mb-3 text-[11px] text-gray-400">{iconPack.description}</p>

      <fieldset>
        <legend className="sr-only">{questionId}</legend>
        <div className={`grid ${gridCols} gap-3`}>
          {options.map((option) => {
            const isSelected = selected === option.value;
            const icon = icons[option.value];

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  setSelected(isSelected ? null : option.value)
                }
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 transition-all ${
                  isSelected
                    ? 'border-samvaya-red bg-samvaya-red/10 text-gray-900 ring-2 ring-samvaya-red/30'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {icon && (
                  <span role="img" aria-hidden="true">
                    {icon}
                  </span>
                )}
                <span className="text-center text-sm font-medium">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
