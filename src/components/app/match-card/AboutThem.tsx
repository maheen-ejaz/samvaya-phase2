'use client';

interface AboutThemProps {
  summary: string;
}

export function AboutThem({ summary }: AboutThemProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-gray-900">About Them</h4>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{summary}</p>
    </div>
  );
}
