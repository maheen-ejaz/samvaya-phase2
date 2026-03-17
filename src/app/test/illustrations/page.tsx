'use client';

import { useState } from 'react';
import { ICON_PACKS, TEST_QUESTIONS } from '@/components/test/icon-packs';
import { IllustrationTestCard } from '@/components/test/IllustrationTestCard';

export default function IllustrationTestPage() {
  const [visiblePacks, setVisiblePacks] = useState<Set<number>>(
    new Set(ICON_PACKS.map((_, i) => i))
  );

  function togglePack(index: number) {
    setVisiblePacks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        if (next.size > 1) next.delete(index); // keep at least 1
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-samvaya-mist px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900">
          Illustration Style Comparison
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Tap any option to preview its selected state. Toggle packs below to
          filter.
        </p>

        {/* Pack filter toggles */}
        <div className="mt-4 flex flex-wrap gap-2">
          {ICON_PACKS.map((pack, i) => (
            <button
              key={pack.name}
              type="button"
              onClick={() => togglePack(i)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                visiblePacks.has(i)
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${pack.badgeColor}`}
              />
              {pack.name}
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="mx-auto mt-8 max-w-6xl space-y-12">
        {TEST_QUESTIONS.map((q) => (
          <section key={q.id}>
            <h2 className="mb-1 text-lg font-semibold text-gray-800">
              {q.id}: {q.text}
            </h2>
            <p className="mb-4 text-xs text-gray-400">
              {q.options.length} options &middot;{' '}
              {q.options.length === 3 ? '3-column' : '2-column'} grid
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ICON_PACKS.map((pack, i) =>
                visiblePacks.has(i) ? (
                  <div
                    key={pack.name}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <IllustrationTestCard
                      questionId={q.id}
                      options={q.options}
                      iconPack={pack}
                    />
                  </div>
                ) : null
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Footer note */}
      <div className="mx-auto mt-12 max-w-6xl border-t border-gray-200 pt-6">
        <p className="text-xs text-gray-400">
          This is a test page for comparing illustration styles. Once a pack is
          chosen, the icons will be applied to the main form codebase.
        </p>
      </div>
    </main>
  );
}
