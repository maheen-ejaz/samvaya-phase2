import { Section } from './IdentitySnapshot';

interface DocumentItem {
  id: string;
  documentType: string;
  url: string;
  uploadedAt: string;
  verificationStatus: string;
}

interface DocumentViewerProps {
  documents: DocumentItem[];
}

const TYPE_LABELS: Record<string, string> = {
  identity_document: 'Identity Document (Aadhaar / Passport)',
  kundali: 'Kundali',
  other: 'Other Document',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  verified: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  needs_resubmission: 'bg-orange-50 text-orange-700',
};

export function DocumentViewer({ documents }: DocumentViewerProps) {
  return (
    <Section title="Documents">
      {documents.length === 0 ? (
        <p className="text-sm text-gray-400">No documents uploaded.</p>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              {/* Thumbnail / preview */}
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 overflow-hidden rounded-md border border-gray-200 hover:border-gray-400 transition-colors"
              >
                {doc.url.match(/\.(pdf)$/i) ? (
                  <div className="flex h-20 w-16 items-center justify-center bg-white text-xs font-medium text-gray-500">
                    PDF
                  </div>
                ) : (
                  <img
                    src={doc.url}
                    alt={TYPE_LABELS[doc.documentType] || doc.documentType}
                    className="h-20 w-16 object-cover"
                  />
                )}
              </a>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {TYPE_LABELS[doc.documentType] || doc.documentType}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[doc.verificationStatus] || 'bg-gray-100 text-gray-600'}`}>
                  {doc.verificationStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>

              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View full
              </a>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
