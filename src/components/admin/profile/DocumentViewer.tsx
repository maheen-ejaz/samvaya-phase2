import { Section } from './IdentitySnapshot';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'verified': return 'default';
    case 'pending': return 'secondary';
    case 'rejected': return 'destructive';
    case 'needs_resubmission': return 'outline';
    default: return 'secondary';
  }
}

export function DocumentViewer({ documents }: DocumentViewerProps) {
  return (
    <Section title="Documents">
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents uploaded.</p>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-start gap-4 rounded-lg border border-border bg-muted p-4">
              {/* Thumbnail / preview */}
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 overflow-hidden rounded-md border border-border transition-colors hover:border-foreground/30"
              >
                {doc.url.match(/\.(pdf)$/i) ? (
                  <div className="flex h-20 w-16 items-center justify-center bg-card text-xs font-medium text-muted-foreground">
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
                <p className="text-sm font-medium text-foreground">
                  {TYPE_LABELS[doc.documentType] || doc.documentType}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <Badge variant={getStatusVariant(doc.verificationStatus)} className="mt-2">
                  {doc.verificationStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  View full
                </a>
              </Button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
