import { cn } from '@/lib/utils';
import type { DashboardMatch } from '@/types/dashboard';
import { InteractiveSpiderChart } from './InteractiveSpiderChart';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MatchRowDetailProps {
  match: DashboardMatch;
}

export function MatchRowDetail({ match }: MatchRowDetailProps) {
  const report = match.compatibilityReport;
  const hasDimensions = report && typeof report === 'object' && 'dimension_scores' in report;
  const dimensions = hasDimensions
    ? (report.dimension_scores as Record<string, { score: number; weight: number; notes: string }>)
    : null;
  const highlights = report && Array.isArray(report.highlights) ? report.highlights as string[] : [];
  const concerns = report && Array.isArray(report.concerns) ? report.concerns as string[] : [];

  return (
    <div className={cn('border-t border-border bg-muted/50 px-6 py-5')}>
      {/* Match narrative */}
      {match.fullNarrative && (
        <Card className="mb-4">
          <CardContent>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Why This Match</h4>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{match.fullNarrative}</p>
          </CardContent>
        </Card>
      )}

      {/* Spider chart + Highlights/Concerns side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Interactive spider chart */}
        <Card>
          <CardContent>
            {dimensions ? (
              <InteractiveSpiderChart
                dimensions={dimensions}
                overallScore={match.compatibilityScore}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No compatibility data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Right: Highlights + Concerns */}
        <div className="space-y-3">
          {highlights.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent>
                <h5 className="flex items-center gap-1 text-xs font-semibold text-green-800">
                  <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800">Highlights</Badge>
                </h5>
                <ul className="mt-1.5 space-y-1">
                  {highlights.map((h, i) => (
                    <li key={i} className="text-xs text-green-900">+ {h}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {concerns.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent>
                <h5 className="flex items-center gap-1 text-xs font-semibold text-red-800">
                  <Badge variant="outline" className="border-red-300 bg-red-100 text-red-800">Concerns</Badge>
                </h5>
                <ul className="mt-1.5 space-y-1">
                  {concerns.map((c, i) => (
                    <li key={i} className="text-xs text-red-900">! {c}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {match.adminNotes && (
            <Card>
              <CardContent>
                <h5 className="text-xs font-semibold text-muted-foreground">Admin Notes</h5>
                <p className="mt-1 text-xs text-foreground">{match.adminNotes}</p>
              </CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground">{match.daysInStage}d in current stage</p>
        </div>
      </div>
    </div>
  );
}
