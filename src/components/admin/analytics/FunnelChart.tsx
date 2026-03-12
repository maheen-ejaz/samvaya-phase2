'use client';

interface FunnelStage {
  stage: string;
  count: number;
  placeholder?: boolean;
}

interface FunnelChartProps {
  data: FunnelStage[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Applicant Funnel</h2>
      <p className="mt-1 text-sm text-gray-500">Progression through each stage.</p>

      <div className="mt-6 space-y-3">
        {data.map((stage) => (
          <div key={stage.stage} className="flex items-center gap-4">
            <div className="w-36 flex-shrink-0 text-right">
              <span
                className={`text-sm font-medium ${
                  stage.placeholder ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {stage.stage}
              </span>
            </div>
            <div className="flex-1">
              {stage.placeholder ? (
                <div className="flex h-8 items-center rounded-md bg-gray-50 px-3">
                  <span className="text-xs text-gray-400">Coming in Phase 2B</span>
                </div>
              ) : (
                <div className="relative h-8 w-full rounded-md bg-gray-100">
                  <div
                    className="flex h-full items-center rounded-md bg-rose-500 px-3 transition-all duration-500"
                    style={{ width: `${Math.max((stage.count / maxCount) * 100, 8)}%` }}
                  >
                    <span className="text-sm font-semibold text-white">
                      {stage.count}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
