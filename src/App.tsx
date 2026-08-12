import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, AlertCircle, Sparkles, Zap, Square, RotateCcw, Thermometer } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Welcome } from '@/components/Welcome';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { ModelSelector } from '@/components/ModelSelector';
import { supabase } from '@/lib/supabase';
import { sendMessageToClaude } from '@/lib/claude';
import type { Conversation, Message, ChatMessage } from '@/types';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-opus-4-5');
  const [temperature, setTemperature] = useState(0.3);
  const [showTempControl, setShowTempControl] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const streamingIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar conversas:', error);
      return;
    }
    setConversations(data || []);
  };

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    loadMessages(activeConversationId);
  }, [activeConversationId]);

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao carregar mensagens:', error);
      return;
    }
    setMessages(data || []);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setError(null);
    setSidebarOpen(false);
  }, []);

  const handleDeleteConversation = useCallback(async (id: string) => {
    const { error } = await supabase.from('conversations').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar conversa:', error);
      return;
    }
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    loadConversations();
  }, [activeConversationId]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
    setIsLoading(false);
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (isLoading) return;

    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove last assistant message
    const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
    if (lastAssistantIdx !== -1) {
      const realIdx = messages.length - 1 - lastAssistantIdx;
      const assistantMsg = messages[realIdx];
      // Delete from DB
      if (assistantMsg.id) {
        await supabase.from('messages').delete().eq('id', assistantMsg.id);
      }
      setMessages((prev) => prev.filter((_, i) => i !== realIdx));
    }

    // Re-send with the last user message
    setInput(lastUserMsg.content);
    // Trigger submit on next tick
    setTimeout(() => {
      handleSubmitWithText(lastUserMsg.content);
    }, 50);
  }, [messages, isLoading]);

  const handleSubmitWithText = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || isLoading) return;

    setInput('');
    setError(null);
    setIsLoading(true);
    abortRef.current = false;

    let conversationId = activeConversationId;

    try {
      if (!conversationId) {
        const title = userText.slice(0, 50) + (userText.length > 50 ? '...' : '');
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .insert({ title })
          .select()
          .single();

        if (convError) throw new Error('Erro ao criar conversa');
        conversationId = convData.id;
        setActiveConversationId(conversationId);
        setConversations((prev) => [convData, ...prev]);
      }

      const convId: string = conversationId!;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: convId,
        role: 'user',
        content: userText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const { error: msgError } = await supabase
        .from('messages')
        .insert({ conversation_id: convId, role: 'user', content: userText });

      if (msgError) console.error('Erro ao salvar mensagem:', msgError);

      const chatHistory: ChatMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userText },
      ];

      const assistantMessageId = crypto.randomUUID();
      streamingIdRef.current = assistantMessageId;
      const assistantPlaceholder: Message = {
        id: assistantMessageId,
        conversation_id: convId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantPlaceholder]);

      let fullResponse = '';

      await sendMessageToClaude(
        chatHistory,
        selectedModel,
        {
          onToken: (token) => {
            if (abortRef.current) return;
            fullResponse += token;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId ? { ...m, content: fullResponse } : m
              )
            );
          },
          onDone: async (fullText) => {
            if (abortRef.current && !fullText) {
              setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
              return;
            }

            const { error: aiMsgError } = await supabase
              .from('messages')
              .insert({ conversation_id: convId, role: 'assistant', content: fullText });

            if (aiMsgError) console.error('Erro ao salvar resposta:', aiMsgError);

            await supabase
              .from('conversations')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', convId);

            loadConversations();
          },
          onError: (errorMsg) => {
            setError(errorMsg);
            setMessages((prev) =>
              prev.filter((m) => m.id !== assistantMessageId || m.content !== '')
            );
          },
        },
        { temperature }
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      streamingIdRef.current = null;
    }
  }, [input, isLoading, activeConversationId, messages, selectedModel, temperature]);

  const handleSubmit = useCallback(() => {
    handleSubmitWithText(input);
  }, [handleSubmitWithText, input]);

  const isStreamingLast = isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'assistant' &&
    messages[messages.length - 1]?.content !== '';

  return (
    <div className="flex h-screen w-screen overflow-hidden animated-bg">
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />
      <div className="glow-orb orb-3" />
      <div className="fixed inset-0 grid-overlay pointer-events-none" />

      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 glass">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-smooth"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-sm font-medium text-gray-300 truncate max-w-[200px]">
                {activeConversationId
                  ? conversations.find((c) => c.id === activeConversationId)?.title || 'Conversa'
                  : 'Nova Conversa'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Temperature control */}
            <div className="relative">
              <button
                onClick={() => setShowTempControl(!showTempControl)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass hover:border-cyan-400/30 transition-smooth text-sm"
                title="Controlar criatividade da IA"
              >
                <Thermometer size={14} className="text-orange-400" />
                <span className="text-xs text-gray-300 font-mono hidden sm:inline">{temperature.toFixed(1)}</span>
              </button>
              {showTempControl && (
                <div className="absolute top-full mt-2 right-0 w-64 glass-strong rounded-xl border border-white/10 shadow-2xl z-50 scale-in p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Precisão</span>
                    <span className="text-xs text-gray-400">Criatividade</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-cyan-300 font-mono">{temperature.toFixed(1)}</span>
                    <span className="text-[10px] text-gray-500">
                      {temperature < 0.5 ? 'Código preciso' : temperature < 1.0 ? 'Equilibrado' : 'Criativo'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <Zap size={12} className="text-green-400" />
              <span className="text-xs text-green-300 font-medium">Grátis</span>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <Welcome onPromptClick={(prompt) => setInput(prompt)} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={isLoading && msg.id === streamingIdRef.current}
                />
              ))}

              {/* Loading indicator */}
              {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-3 fade-in-up">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-400/30 flex items-center justify-center">
                    <Sparkles size={18} className="text-cyan-300" />
                  </div>
                  <div className="message-bubble-assistant rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="text-xs font-semibold mb-2 text-cyan-400/70">ClaudeAI Pro Max</div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                      <span className="text-xs text-gray-500 ml-1">Pensando...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons while streaming */}
              {isLoading && (
                <div className="flex items-center justify-center gap-3 fade-in">
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:border-red-400/30 transition-smooth text-sm text-gray-300 hover:text-red-300"
                  >
                    <Square size={14} />
                    Parar
                  </button>
                </div>
              )}

              {/* Regenerate button when not loading */}
              {!isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
                <div className="flex items-center justify-center fade-in">
                  <button
                    onClick={handleRegenerate}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:border-cyan-400/30 transition-smooth text-sm text-gray-300 hover:text-cyan-300"
                  >
                    <RotateCcw size={14} />
                    Regenerar resposta
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 fade-in">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Erro</p>
                    <p className="text-xs text-red-400/80 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
