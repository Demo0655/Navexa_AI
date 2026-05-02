import React from 'react';
import { Plus, MessageSquare, User, Settings, Sparkles, LogIn, PanelLeft, X } from 'lucide-react';
import NavexaLogo from './NavexaLogo';

const Sidebar = ({ isOpen, setIsOpen, history, onNewChat, onOpenProfile, onOpenSettings, user, onLoginClick, isDark = true }) => {
  return (
    <aside className={`
      ${isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-0 lg:translate-x-0 lg:w-[68px]'} 
      fixed lg:relative z-20 h-full bg-[#171717] border-r border-[#333] transition-all duration-300 flex flex-col overflow-hidden
    `}>
      {/* Header / Logo */}
      {isOpen ? (
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <NavexaLogo size={16} isDark={isDark} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 truncate">
              Navexa AI
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-[#262626] rounded-xl text-gray-400 hover:text-white transition-colors flex-shrink-0"
            title="Close sidebar"
          >
            <PanelLeft size={20} className="hidden lg:block" />
            <X size={20} className="lg:hidden" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center p-3 mt-1">
          <button 
            onClick={() => setIsOpen(true)} 
            className="group relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#262626] transition-all"
            title="Open sidebar"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                <NavexaLogo size={16} isDark={isDark} className="text-white" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 group-hover:text-white">
              <PanelLeft size={20} />
            </div>
          </button>
        </div>
      )}

      {/* New Chat Button */}
      <div className={`${isOpen ? 'px-4' : 'px-2'} mb-6`}>
        <button 
          onClick={onNewChat}
          className={`w-full flex items-center ${isOpen ? 'gap-2 p-3 justify-start' : 'justify-center p-3'} border border-[#333] rounded-xl hover:bg-[#262626] transition-all group`}
          title="New Chat"
        >
          <Plus size={18} className="text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
          {isOpen && <span className="text-sm text-gray-400 group-hover:text-white transition-colors whitespace-nowrap">New Chat</span>}
        </button>
      </div>

      {/* History Area */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        {isOpen && (
          <div className="text-[10px] px-4 mb-2 text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">
            Recent History
          </div>
        )}
        
        {history.length === 0 ? (
          isOpen && (
            <div className="px-4 py-8 text-center whitespace-nowrap">
              <p className="text-xs text-gray-600 italic">No conversations yet</p>
            </div>
          )
        ) : (
          history.map(item => (
            <button 
              key={item.id}
              className={`w-full flex items-center ${isOpen ? 'gap-3 p-3 justify-start' : 'justify-center p-3'} rounded-xl hover:bg-[#262626] text-sm text-gray-400 hover:text-white transition-all mb-1 group`}
              title={!isOpen ? item.title : ""}
            >
              <MessageSquare size={16} className="text-gray-600 group-hover:text-blue-400 flex-shrink-0" />
              {isOpen && <span className="truncate whitespace-nowrap">{item.title}</span>}
            </button>
          ))
        )}
      </div>

      {/* Bottom Actions */}
      <div className={`border-t border-[#333] ${isOpen ? 'p-4 space-y-1' : 'p-2 space-y-2 flex flex-col items-center py-4'}`}>
        {user ? (
          <>
            <button 
              onClick={onOpenProfile}
              className={`w-full flex items-center ${isOpen ? 'gap-3 p-3 justify-start' : 'justify-center p-3'} rounded-xl hover:bg-[#262626] text-gray-400 hover:text-white transition-all`}
              title="My Account"
            >
              <User size={18} className="flex-shrink-0" />
              {isOpen && <span className="text-sm whitespace-nowrap">My Account</span>}
            </button>
            <button 
              onClick={onOpenSettings}
              className={`w-full flex items-center ${isOpen ? 'gap-3 p-3 justify-start' : 'justify-center p-3'} rounded-xl hover:bg-[#262626] text-gray-400 hover:text-white transition-all`}
              title="Settings"
            >
              <Settings size={18} className="flex-shrink-0" />
              {isOpen && <span className="text-sm whitespace-nowrap">Settings</span>}
            </button>
          </>
        ) : (
          isOpen ? (
            <div className="px-2 py-3">
              <h4 className="text-sm font-bold text-white mb-1 whitespace-nowrap">Log in to Navexa AI</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Save your chat history, customize your settings, and unlock premium features.
              </p>
              <button 
                onClick={onLoginClick}
                className="w-full py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all shadow-lg shadow-white/10 text-sm whitespace-nowrap"
              >
                Log in
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="p-3 rounded-xl hover:bg-[#262626] text-gray-400 hover:text-white transition-all"
              title="Log in"
            >
              <LogIn size={18} />
            </button>
          )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
