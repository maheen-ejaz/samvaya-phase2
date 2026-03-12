import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendChatMessage } from '@/lib/claude/client';
import { getChatConfig } from '@/lib/claude/prompts';
import type { ChatMessage, ChatRequest, ChatState } from '@/lib/claude/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { chatId, messages, userMessage } = body;

  if (!chatId || !userMessage) {
    return NextResponse.json({ error: 'Missing chatId or userMessage' }, { status: 400 });
  }

  const config = getChatConfig(chatId);
  const isInitiation = userMessage === '[START_CONVERSATION]';

  if (isInitiation) {
    // Check if we already have an opening message saved (prevents overwrite on page refresh)
    const { data: existingProfile } = await supabase
      .from('compatibility_profiles')
      .select('chat_state')
      .eq('user_id', user.id)
      .maybeSingle();

    const savedState = (existingProfile?.chat_state as Record<string, unknown>)?.[chatId] as ChatState | undefined;
    if (savedState?.messages && savedState.messages.length > 0) {
      return NextResponse.json({
        assistantMessage: savedState.messages[0].content,
        exchangeCount: savedState.exchangeCount,
        isComplete: savedState.isComplete,
      });
    }

    // Generate opening message — no exchange counted
    let assistantResponse: string;
    try {
      assistantResponse = await sendChatMessage(config.systemPrompt, [
        { id: 'init', role: 'user', content: 'Please start the conversation with your opening question.', timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error('Claude API error:', err);
      return NextResponse.json(
        { error: 'Failed to start conversation. Please try again.' },
        { status: 502 }
      );
    }

    // Save initial chat state
    const openingMessage: ChatMessage = {
      id: `assistant-${crypto.randomUUID()}`,
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
    };

    const chatState: ChatState = {
      messages: [openingMessage],
      exchangeCount: 0,
      isComplete: false,
    };

    await saveChatState(supabase, user.id, chatId, chatState);

    return NextResponse.json({
      assistantMessage: assistantResponse,
      exchangeCount: 0,
      isComplete: false,
    });
  }

  // Regular message — count exchanges from SERVER state, not client-supplied messages
  const { data: existingProfile } = await supabase
    .from('compatibility_profiles')
    .select('chat_state')
    .eq('user_id', user.id)
    .maybeSingle();

  const serverChatState = (existingProfile?.chat_state as Record<string, unknown>)?.[chatId] as ChatState | undefined;
  const currentExchangeCount = serverChatState?.exchangeCount ?? 0;

  if (currentExchangeCount >= config.maxExchanges) {
    return NextResponse.json({ error: 'Conversation already complete' }, { status: 400 });
  }

  const newExchangeCount = currentExchangeCount + 1;
  const isLastExchange = newExchangeCount >= config.maxExchanges;

  // Build message history for Claude (exclude the init prompt if present)
  const historyForClaude: ChatMessage[] = [...messages, {
    id: `user-${crypto.randomUUID()}`,
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  }];

  let assistantResponse: string;

  if (isLastExchange) {
    // Final exchange — use fixed closing message
    assistantResponse = config.closingMessage;
  } else {
    try {
      assistantResponse = await sendChatMessage(config.systemPrompt, historyForClaude);
    } catch (err) {
      console.error('Claude API error:', err);
      return NextResponse.json(
        { error: 'Failed to get response from AI. Please try again.' },
        { status: 502 }
      );
    }
  }

  const userMsg: ChatMessage = {
    id: `user-${crypto.randomUUID()}`,
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  };

  const assistantMsg: ChatMessage = {
    id: `assistant-${crypto.randomUUID()}`,
    role: 'assistant',
    content: assistantResponse,
    timestamp: new Date().toISOString(),
  };

  const allMessages = [...messages, userMsg, assistantMsg];

  const chatState: ChatState = {
    messages: allMessages,
    exchangeCount: newExchangeCount,
    isComplete: isLastExchange,
  };

  await saveChatState(supabase, user.id, chatId, chatState);

  return NextResponse.json({
    assistantMessage: assistantResponse,
    exchangeCount: newExchangeCount,
    isComplete: isLastExchange,
  });
}

async function saveChatState(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  chatId: string,
  chatState: ChatState
) {
  try {
    const { data: existing } = await supabase
      .from('compatibility_profiles')
      .select('chat_state')
      .eq('user_id', userId)
      .maybeSingle();

    const currentChatState = (existing?.chat_state as Record<string, unknown>) || {};
    const updatedChatState = { ...currentChatState, [chatId]: chatState } as unknown as Record<string, never>;

    if (existing) {
      await supabase
        .from('compatibility_profiles')
        .update({ chat_state: updatedChatState as never })
        .eq('user_id', userId);
    } else {
      await supabase.from('compatibility_profiles').insert({
        user_id: userId,
        chat_state: updatedChatState as never,
      });
    }
  } catch (err) {
    console.error('Failed to save chat state:', err);
  }
}
