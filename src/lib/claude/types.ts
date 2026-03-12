// Claude AI chat type definitions

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export interface ChatConfig {
  chatId: 'Q38' | 'Q75' | 'Q100';
  maxExchanges: number;
  title: string;
  systemPrompt: string;
  extractionPrompt: string;
  closingMessage: string;
  nudgeText: string;
}

export interface ChatState {
  messages: ChatMessage[];
  exchangeCount: number;
  isComplete: boolean;
}

export interface ExtractionResult {
  // Spider web dimensions (Conv 1 contributes to 3)
  family_orientation_score?: number;
  family_orientation_notes?: string;
  traditionalism_score?: number;
  traditionalism_notes?: string;
  independence_vs_togetherness_score?: number;
  independence_vs_togetherness_notes?: string;
  // Conv 2 dimensions (stubs — populated when Q75 is built)
  career_ambition_score?: number;
  career_ambition_notes?: string;
  emotional_expressiveness_score?: number;
  emotional_expressiveness_notes?: string;
  social_orientation_score?: number;
  social_orientation_notes?: string;
  relocation_openness_score?: number;
  relocation_openness_notes?: string;
  life_pace_score?: number;
  life_pace_notes?: string;
  // Additional extracted fields
  communication_style?: string;
  conflict_approach?: string;
  partner_role_vision?: string;
  financial_values?: string;
  // Summary fields
  ai_personality_summary?: string;
  ai_compatibility_keywords?: string[];
  key_quote?: string;
  ai_red_flags?: string;
}

// API request/response types
export interface ChatRequest {
  chatId: 'Q38' | 'Q75' | 'Q100';
  messages: ChatMessage[];
  userMessage: string;
}

export interface ChatResponse {
  assistantMessage: string;
  exchangeCount: number;
  isComplete: boolean;
}

export interface ExtractionRequest {
  chatId: 'Q38' | 'Q75' | 'Q100';
  transcript: string;
}
