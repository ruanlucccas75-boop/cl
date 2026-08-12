export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4.5',
    description: 'Mais poderoso da Anthropic - raciocínio profundo',
    badge: 'MAX',
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    description: 'Equilíbrio perfeito entre poder e velocidade',
    badge: 'PRO',
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    description: 'Rápido e eficiente da OpenAI',
    badge: 'FAST',
  },
  {
    id: 'gpt-5.3-chat',
    name: 'GPT-5.3 Chat',
    description: 'Modelo avançado da OpenAI',
    badge: 'PRO',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Rápido do Google',
    badge: 'FAST',
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'Especialista em código aberto',
    badge: 'CODE',
  },
  {
    id: 'grok-4',
    name: 'Grok 4',
    description: 'IA da xAI (Elon Musk)',
    badge: 'NEW',
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    description: 'Modelo europeu de alta performance',
    badge: 'EU',
  },
];
