import { highlightCode } from '@/utils/highlight';

interface ParsedSegment {
  type: 'code' | 'text';
  content: string;
  language?: string;
}

export function parseMarkdown(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

export function renderInlineText(text: string): string {
  let result = text;

  // Escape HTML
  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Blockquotes
  result = result.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-cyan-500/30 pl-3 my-2 text-gray-400 italic">$1</blockquote>');

  // Tables (simple support)
  if (/\|.*\|[\s\S]*\n\|[-:\s|]+\|/.test(result)) {
    result = result.replace(/^(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)+)/gm, (_, header, sep, body) => {
      const headerCells = header.split('|').filter((c: string) => c.trim());
      const headerHtml = headerCells.map((c: string) => `<th class="px-3 py-1.5 text-left text-xs font-semibold text-cyan-300 border-b border-cyan-500/20">${c.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter((c: string) => c.trim());
        return `<tr>${cells.map((c: string) => `<td class="px-3 py-1.5 text-xs text-gray-300 border-b border-white/5">${c.trim()}</td>`).join('')}</tr>`;
      }).join('');
      return `<table class="w-full my-3 border-collapse"><thead><tr>${headerHtml}</tr></thead><tbody>${rows}</tbody></table>`;
    });
  }

  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code class="font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded text-sm">$1</code>');

  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Italic
  result = result.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Headers
  result = result.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-3 mb-1">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-4 mb-2">$1</h1>');

  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="text-cyan-400 underline hover:text-cyan-300">$1</a>'
  );

  // Lists
  result = result.replace(/^(\s*)[-*] (.+)$/gm, '$1<li class="ml-4 list-disc">$2</li>');
  result = result.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, (match) => `<ul class="my-2 space-y-1">${match}</ul>`);

  // Numbered lists
  result = result.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Line breaks
  result = result.replace(/\n/g, '<br/>');

  // Fix double breaks around block elements
  result = result.replace(/<br\/>(<h[1-3])/g, '$1');
  result = result.replace(/(<\/h[1-3]>)<br\/>/g, '$1');
  result = result.replace(/<br\/>(<ul)/g, '$1');
  result = result.replace(/(<\/ul>)<br\/>/g, '$1');
  result = result.replace(/<br\/>(<blockquote)/g, '$1');
  result = result.replace(/(<\/blockquote>)<br\/>/g, '$1');
  result = result.replace(/<br\/>(<table)/g, '$1');
  result = result.replace(/(<\/table>)<br\/>/g, '$1');

  return result;
}

export { highlightCode };
