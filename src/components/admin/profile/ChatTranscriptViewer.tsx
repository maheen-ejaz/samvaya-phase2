import { Section } from './IdentitySnapshot';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface ChatTranscript {
  chatId: string;
  title: string;
  messages: ChatMessage[];
  exchangeCount: number;
  isComplete: boolean;
}

interface ChatTranscriptViewerProps {
  transcripts: ChatTranscript[];
}

const CHAT_INFO: Record<string, { title: string; description: string }> = {
  Q38: { title: 'Family Background', description: 'Family emotional texture, childhood, domestic expectations' },
  Q75: { title: 'Goals & Values', description: 'Career vision, partner role, conflict style, financial values' },
  Q100: { title: 'Closing Thoughts', description: 'Anything else the applicant wanted to share' },
};

export function ChatTranscriptViewer({ transcripts }: ChatTranscriptViewerProps) {
  return (
    <Section title="AI Conversation Transcripts">
      {transcripts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No conversations recorded.</p>
      ) : (
        <div className="space-y-6">
          {transcripts.map((transcript) => {
            const info = CHAT_INFO[transcript.chatId] || { title: transcript.chatId, description: '' };
            return (
              <Card key={transcript.chatId}>
                {/* Header */}
                <CardHeader className="border-b">
                  <CardTitle>
                    <span className="text-sm font-medium text-foreground">{info.title}</span>
                    <p className="text-xs font-normal text-muted-foreground">{info.description}</p>
                  </CardTitle>
                  <CardAction>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{transcript.exchangeCount} exchanges</span>
                      <Badge variant={transcript.isComplete ? 'default' : 'secondary'}>
                        {transcript.isComplete ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </div>
                  </CardAction>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0">
                  <ScrollArea className="max-h-96">
                    <div className="space-y-3 px-4 py-3">
                      {transcript.messages.length === 0 ? (
                        <p className="text-xs italic text-muted-foreground">No messages in this conversation.</p>
                      ) : (
                        transcript.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                              msg.role === 'user'
                                ? 'border border-primary/20 bg-primary/10 text-foreground'
                                : 'border border-border bg-card text-foreground'
                            }`}>
                              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                {msg.role === 'user' ? 'Applicant' : 'Claude'}
                              </p>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Section>
  );
}
