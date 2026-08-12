import { Plus, MessageSquare, Trash2, Sparkles, X } from 'lucide-react';
import type { Conversation } from '@/types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative z-40 h-full w-72 glass-strong border-r border-white/5 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/30 rounded-xl pulse-ring" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center">
                  <Sparkles size={22} className="text-cyan-300" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold gradient-text-animated leading-tight">
                  ClaudeAI Pro Max
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  IA de Programação
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* New conversation */}
        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-400/20 hover:border-cyan-400/40 hover:from-cyan-500/25 hover:to-blue-500/15 transition-smooth text-sm font-medium text-cyan-200 btn-glow"
          >
            <Plus size={18} />
            Nova Conversa
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-xs text-gray-500">
                Nenhuma conversa ainda. Comece uma nova!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-smooth slide-in-left ${
                    activeId === conv.id
                      ? 'bg-cyan-500/10 border border-cyan-400/20'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  onClick={() => onSelect(conv.id)}
                >
                  <MessageSquare
                    size={15}
                    className={activeId === conv.id ? 'text-cyan-400' : 'text-gray-500'}
                  />
                  <span
                    className={`flex-1 text-sm truncate ${
                      activeId === conv.id ? 'text-cyan-100' : 'text-gray-400'
                    }`}
                  >
                    {conv.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-smooth flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-400 pulse-glow" />
            <span>Grátis - 8 modelos de IA</span>
          </div>
        </div>
      </aside>
    </>
  );
}
