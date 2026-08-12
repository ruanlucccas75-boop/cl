import { Code2, Bug, Rocket, FileCode, Sparkles, Zap, ShieldCheck, Database, Brain, Globe } from 'lucide-react';

interface WelcomeProps {
  onPromptClick: (prompt: string) => void;
}

const suggestions = [
  {
    icon: Code2,
    title: 'API REST completa',
    prompt: 'Crie uma API REST completa em Node.js com Express, incluindo rotas CRUD, middleware de autenticação JWT, validação de dados, tratamento de erros e documentação.',
  },
  {
    icon: Bug,
    title: 'Debugar código',
    prompt: 'Meu código Python está dando erro de TypeError: NoneType object is not subscriptable na linha 42. Como debugar e corrigir definitivamente?',
  },
  {
    icon: Rocket,
    title: 'Otimizar performance',
    prompt: 'Como otimizar uma query SQL lenta em tabela com milhões de registros? Mostre exemplos de índices, particionamento e query rewriting.',
  },
  {
    icon: FileCode,
    title: 'Componente React',
    prompt: 'Crie um componente React TypeScript de um calendário interativo com navegação entre meses, seleção de datas, animações e testes unitários.',
  },
  {
    icon: Database,
    title: 'Schema de banco',
    prompt: 'Crie um schema PostgreSQL completo para um sistema de e-commerce com tabelas de usuários, produtos, pedidos, pagamentos e estoque. Inclua índices e relações.',
  },
  {
    icon: Brain,
    title: 'Algoritmo complexo',
    prompt: 'Implemente um algoritmo de machine learning de classificação de texto usando Python, TensorFlow e BERT. Código completo e funcional.',
  },
  {
    icon: Globe,
    title: 'App full-stack',
    prompt: 'Crie um app full-stack de lista de tarefas com React, TypeScript, Node.js, WebSocket para tempo real e deploy com Docker. Código completo.',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança de código',
    prompt: 'Revise este código de autenticação e aponte todas as vulnerabilidades de segurança com correções: function login(user, pass) { return db.query("SELECT * FROM users WHERE name=\'"+user+"\' AND pass=\'"+pass+"\'"); }',
  },
];

export function Welcome({ onPromptClick }: WelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 fade-in overflow-y-auto py-8">
      {/* Animated logo */}
      <div className="relative mb-8 flex-shrink-0">
        <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl pulse-ring" />
        <div className="absolute inset-0 bg-blue-500/20 rounded-3xl pulse-ring" style={{ animationDelay: '0.5s' }} />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/30 via-blue-600/20 to-teal-500/10 border border-cyan-400/30 flex items-center justify-center pulse-glow">
          <Sparkles size={40} className="text-cyan-300" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold gradient-text-animated mb-3 text-center">
        ClaudeAI Pro Max
      </h1>
      <p className="text-gray-400 text-center max-w-md mb-2">
        A IA de programação mais avançada do mundo
      </p>

      {/* Feature badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <Zap size={12} className="text-green-400" />
          <span className="text-xs text-green-300 font-medium">100% Grátis</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <ShieldCheck size={12} className="text-cyan-400" />
          <span className="text-xs text-cyan-300 font-medium">Sem API Key</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Sparkles size={12} className="text-blue-400" />
          <span className="text-xs text-blue-300 font-medium">8 Modelos de IA</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
          <Code2 size={12} className="text-orange-400" />
          <span className="text-xs text-orange-300 font-medium">Zero Erros</span>
        </div>
      </div>

      <p className="text-gray-500 text-sm text-center max-w-lg mb-8">
        Peça qualquer coisa. Código perfeito em qualquer linguagem, streaming em tempo real, sem erros.
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl w-full">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onPromptClick(s.prompt)}
            className="group flex items-start gap-3 p-4 rounded-2xl glass hover:border-cyan-400/30 hover-lift transition-smooth text-left scale-in"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition-smooth">
              <s.icon size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-smooth">
                {s.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
