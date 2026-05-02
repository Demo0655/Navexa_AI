import React from 'react';
import { Zap, MessageSquare, Code, Search } from 'lucide-react';

const modes = [
  { id: 'auto', label: 'Auto', icon: Zap, color: 'text-blue-400' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-green-400' },
  { id: 'code', label: 'Code', icon: Code, color: 'text-blue-500' },
  { id: 'research', label: 'Research', icon: Search, color: 'text-purple-500' },
];

const ModeSelector = ({ currentMode, setMode }) => {
  return (
    <div className="flex bg-[#171717] p-1 rounded-xl border border-[#333]">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => setMode(mode.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${isActive 
                ? 'bg-[#262626] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            <Icon size={14} className={isActive ? mode.color : 'text-gray-600'} />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
