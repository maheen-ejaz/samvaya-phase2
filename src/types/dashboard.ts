// Dashboard-specific types for the admin command center

export interface DashboardAlert {
  id: string;
  userId: string;
  name: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  actionHref?: string;
  actionEndpoint?: string;
  actionPayload?: Record<string, unknown>;
  daysStuck?: number;
}

export interface DashboardMatch {
  suggestionId: string;
  presentationId: string | null;
  personA: { id: string; name: string; details?: string };
  personB: { id: string; name: string; details?: string };
  compatibilityScore: number;
  matchReason: string;
  fullNarrative: string;
  compatibilityReport: Record<string, unknown> | null;
  currentStage: 'pending_review' | 'approved' | 'presented' | 'mutual_interest';
  daysInStage: number;
  nextAction: string;
  adminNotes: string | null;
}

export interface DashboardActivityLog {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface DashboardCommLog {
  id: string;
  recipientName: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  channel: string;
}

export interface DistributionEntry {
  label: string;
  count: number;
}

export interface MatchStageCounts {
  pendingReview: number;
  approvedReady: number;
  presentedPending: number;
  mutualInterest: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  conversionPct: number | null;
}
