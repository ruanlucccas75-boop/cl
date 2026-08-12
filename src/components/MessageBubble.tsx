import { useState } from 'react';
import { Check, Copy, Sparkles, User } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { parseMarkdown, renderInlineText } from '@/utils/markdown';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const segments = parseMarkdown(message.content);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} fade-in-up`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border border-cyan-500/30'
            : 'bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-400/30'
        }`}
      >
        {isUser ? (
          <User size={18} className="text-cyan-300" />
        ) : (
          <Sparkles size={18} className="text-cyan-300" />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`relative group rounded-2xl px-4 py-3 ${
            isUser
              ? 'message-bubble-user rounded-tr-sm'
              : 'message-bubble-assistant rounded-tl-sm'
          }`}
        >
          {/* Role label */}
          <div className={`text-xs font-semibold mb-1.5 ${isUser ? 'text-cyan-300/70 text-right' : 'text-cyan-400/70'}`}>
            {isUser ? 'Você' : 'ClaudeAI Pro Max'}
          </div>

          {/* Content */}
          <div className="text-sm leading-relaxed text-gray-200">
            {segments.map((segment, i) => {
              if (segment.type === 'code') {
                return (
                  <CodeBlock
                    key={i}
                    code={segment.content}
                    language={segment.language || 'text'}
                  />
                );
              }
              return (
                <div
                  key={i}
                  className="space-y-1"
                  dangerouslySetInnerHTML={{ __html: renderInlineText(segment.content) }}
                />
              );
            })}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 align-middle blink-cursor" />
            )}
          </div>

          {/* Copy button */}
          {!isUser && !isStreaming && message.content && (
            <button
              onClick={handleCopyMessage}
              className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center w-7 h-7 rounded-lg glass-strong hover:border-cyan-400/40"
              title="Copiar mensagem"
            >
              {copied ? (
                <Check size={13} className="text-green-400" />
              ) : (
                <Copy size={13} className="text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
