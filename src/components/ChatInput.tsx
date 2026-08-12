import { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        <div className="relative glass-strong rounded-2xl border border-white/10 focus-within:border-cyan-400/40 transition-smooth">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Peça qualquer coisa... (Enter para enviar, Shift+Enter para nova linha)"
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent text-gray-200 placeholder-gray-500 px-4 py-3.5 pr-14 resize-none outline-none text-sm leading-relaxed max-h-[200px] disabled:opacity-50"
          />
          <button
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className="absolute right-2 bottom-2 w-10 h-10 rounded-xl flex items-center justify-center transition-smooth disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-cyan-500/20 enabled:hover:border-cyan-400/40 border border-cyan-400/20 bg-cyan-500/10"
          >
            {isLoading ? (
              <Loader2 size={18} className="text-cyan-400 animate-spin" />
            ) : (
              <Send size={18} className="text-cyan-400" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-2">
          ClaudeAI Pro Max - Powered by Puter.js - 8 modelos de IA disponíveis
        </p>
      </div>
    </div>
  );
}
