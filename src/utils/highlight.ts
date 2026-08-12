const keywords = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'default', 'try', 'catch', 'finally',
  'throw', 'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'this', 'super',
  'class', 'extends', 'implements', 'interface', 'enum', 'type', 'namespace',
  'import', 'export', 'from', 'as', 'async', 'await', 'yield', 'static',
  'public', 'private', 'protected', 'readonly', 'abstract', 'virtual', 'override',
  'def', 'elif', 'lambda', 'with', 'pass', 'None', 'True', 'False', 'and', 'or',
  'not', 'is', 'print', 'require', 'module', 'exports', 'undefined', 'null',
  'void', 'struct', 'union', 'fn', 'mut', 'match', 'impl', 'trait',
  'use', 'pub', 'crate', 'mod', 'where', 'self', 'ref', 'move',
  'package', 'func', 'go', 'defer', 'chan', 'select', 'range', 'make',
  'val', 'fun', 'object', 'companion', 'data', 'sealed', 'when',
  'by', 'lateinit', 'init', 'constructor', 'suspend',
  'final', 'throws', 'synchronized', 'volatile', 'transient', 'native', 'assert',
  'elif', 'except', 'finally', 'global', 'nonlocal', 'raise', 'return', 'with',
  'yield', 'async', 'await', 'break', 'continue', 'pass', 'lambda',
  'declare', 'module', 'global', 'namespace', 'from',
]);

const builtins = new Set([
  'console', 'window', 'document', 'Math', 'JSON', 'Object', 'Array',
  'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set', 'Date',
  'Error', 'RegExp', 'Symbol', 'Proxy', 'Reflect', 'WeakMap', 'WeakSet',
  'ArrayBuffer', 'Int8Array', 'Uint8Array', 'Float32Array', 'Float64Array',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'decodeURI',
  'encodeURIComponent', 'decodeURIComponent',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'fetch', 'Request', 'Response', 'Headers', 'URL', 'URLSearchParams',
  'localStorage', 'sessionStorage', 'crypto', 'performance',
  'alert', 'confirm', 'prompt',
  'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict',
  'tuple', 'set', 'bool', 'open', 'input', 'type', 'isinstance',
  'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed', 'sum', 'min', 'max',
  'abs', 'round', 'all', 'any', 'format', 'super',
  'println', 'printf', 'scanf', 'malloc', 'free', 'sizeof', 'typedef',
  'std', 'cout', 'cin', 'endl', 'vector', 'string',
  'React', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback',
  'useContext', 'useReducer', 'Component', 'Fragment',
  'Vue', 'computed', 'watch', 'reactive', 'ref',
  'express', 'app', 'router', 'require',
  'pytest', 'unittest', 'asyncio', 'threading',
  'Deno', 'process', 'Buffer', 'stream', 'EventEmitter',
]);

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

interface Token {
  type: 'string' | 'comment' | 'number' | 'keyword' | 'builtin' | 'function' | 'tag' | 'plain';
  value: string;
}

export function highlightCode(code: string, language: string): string {
  // Tokenize first, then highlight - avoids nested highlighting bugs
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];
    const remaining = code.slice(i);

    // Multi-line comments /* */
    const blockCommentMatch = remaining.match(/^\/\*[\s\S]*?\*\//);
    if (blockCommentMatch) {
      tokens.push({ type: 'comment', value: blockCommentMatch[0] });
      i += blockCommentMatch[0].length;
      continue;
    }

    // Single-line comments // or #
    const lineCommentMatch = remaining.match(/^(\/\/|#)[^\n]*/);
    if (lineCommentMatch) {
      tokens.push({ type: 'comment', value: lineCommentMatch[0] });
      i += lineCommentMatch[0].length;
      continue;
    }

    // Triple-quoted strings (Python) """ or '''
    const tripleMatch = remaining.match(/^(?:"""[\s\S]*?"""|'''[\s\S]*?''')/);
    if (tripleMatch) {
      tokens.push({ type: 'string', value: tripleMatch[0] });
      i += tripleMatch[0].length;
      continue;
    }

    // Strings: double, single, backtick
    const stringMatch = remaining.match(/^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/);
    if (stringMatch) {
      tokens.push({ type: 'string', value: stringMatch[0] });
      i += stringMatch[0].length;
      continue;
    }

    // Numbers
    const numberMatch = remaining.match(/^\d+\.?\d*([eE][+-]?\d+)?/);
    if (numberMatch) {
      tokens.push({ type: 'number', value: numberMatch[0] });
      i += numberMatch[0].length;
      continue;
    }

    // Identifiers/keywords
    const identMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (identMatch) {
      const word = identMatch[0];

      // Check if followed by ( for function call
      const afterIdx = i + word.length;
      let afterChar = '';
      for (let j = afterIdx; j < code.length; j++) {
        if (code[j] !== ' ' && code[j] !== '\t') {
          afterChar = code[j];
          break;
        }
      }

      if (keywords.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (builtins.has(word)) {
        tokens.push({ type: 'builtin', value: word });
      } else if (afterChar === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i += word.length;
      continue;
    }

    // HTML tags
    if (['html', 'xml', 'jsx', 'tsx', 'vue', 'svelte'].includes(language) && (char === '<' || char === '>')) {
      const tagMatch = remaining.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/);
      if (tagMatch) {
        tokens.push({ type: 'tag', value: tagMatch[0] });
        i += tagMatch[0].length;
        continue;
      }
    }

    // Default: single char
    tokens.push({ type: 'plain', value: char });
    i++;
  }

  // Build HTML
  return tokens
    .map((t) => {
      const escaped = escapeHtml(t.value);
      if (t.type === 'plain') return escaped;
      return `<span class="token-${t.type}">${escaped}</span>`;
    })
    .join('');
}
