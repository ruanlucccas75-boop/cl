import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { highlightCode } from '@/utils/highlight';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = highlightCode(code, language);

  return (
    <div className="code-block fade-in">
      <div className="code-block-header">
        <span className="text-xs font-mono text-cyan-400/80 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-smooth"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <div className="code-block-content">
        <pre className="text-gray-200 whitespace-pre">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
}
