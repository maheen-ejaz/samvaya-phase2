import { Section } from './IdentitySnapshot';

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
        <p className="text-sm text-gray-400">No conversations recorded.</p>
      ) : (
        <div className="space-y-6">
          {transcripts.map((transcript) => {
            const info = CHAT_INFO[transcript.chatId] || { title: transcript.chatId, description: '' };
            return (
              <div key={transcript.chatId} className="rounded-lg border border-gray-100 bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{info.title}</h4>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{transcript.exchangeCount} exchanges</span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${transcript.isComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {transcript.isComplete ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="max-h-96 overflow-y-auto px-4 py-3 space-y-3">
                  {transcript.messages.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No messages in this conversation.</p>
                  ) : (
                    transcript.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-rose-50 text-gray-800 border border-rose-100'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}>
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                            {msg.role === 'user' ? 'Applicant' : 'Claude'}
                          </p>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
