import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Cpu } from 'lucide-react';
import { AI_MODELS, type AIModel } from '@/types';

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const badgeColors: Record<string, string> = {
    MAX: 'bg-gradient-to-r from-purple-500/30 to-pink-500/20 text-pink-300 border-pink-500/30',
    PRO: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    FAST: 'bg-green-500/15 text-green-300 border-green-500/30',
    CODE: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    NEW: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    EU: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:border-cyan-400/30 transition-smooth text-sm"
      >
        <Cpu size={14} className="text-cyan-400" />
        <span className="text-gray-200 font-medium hidden sm:inline">{current.name}</span>
        {current.badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColors[current.badge] || badgeColors.PRO}`}>
            {current.badge}
          </span>
        )}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-72 glass-strong rounded-xl border border-white/10 shadow-2xl z-50 scale-in overflow-hidden">
          <div className="p-2 max-h-80 overflow-y-auto">
            {AI_MODELS.map((model: AIModel) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model.id);
                  setOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-smooth text-left ${
                  selectedModel === model.id
                    ? 'bg-cyan-500/10 border border-cyan-400/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">{model.name}</span>
                    {model.badge && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${badgeColors[model.badge] || badgeColors.PRO}`}>
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
                </div>
                {selectedModel === model.id && (
                  <Check size={16} className="text-cyan-400 flex-shrink-0 mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
