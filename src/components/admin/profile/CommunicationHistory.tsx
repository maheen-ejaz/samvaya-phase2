import { Section } from './IdentitySnapshot';

export interface CommLogEntry {
  id: string;
  channel: string;
  subject: string | null;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

interface CommunicationHistoryProps {
  entries: CommLogEntry[];
}

const CHANNEL_LABEL: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
};

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
};

export function CommunicationHistory({ entries }: CommunicationHistoryProps) {
  return (
    <Section title="Communication History">
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No emails or messages sent yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {entry.subject || '(no subject)'}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {CHANNEL_LABEL[entry.channel] || entry.channel} ·{' '}
                  {formatDate(entry.sentAt || entry.createdAt)}
                </p>
              </div>
              <span
                className={`shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[entry.status] || 'bg-gray-100 text-gray-600'}`}
              >
                {entry.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
