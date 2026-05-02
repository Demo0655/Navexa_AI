import React, { useRef, useEffect } from 'react';
import { Terminal, Code, Search } from 'lucide-react';
import MessageBubble from './MessageBubble';
import NavexaLogo from './NavexaLogo';

const ChatContainer = ({ messages, isTyping }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 animate-bounce">
            <NavexaLogo size={28} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight">How can I assist you?</h1>
          <p className="text-gray-500 leading-relaxed">
            I'm Navexa AI, your multi-mode intelligent assistant. Ask me to write code, analyze research, or just have a chat.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mt-12 w-full">
            <div className="p-4 bg-[#171717] border border-[#333] rounded-2xl text-left hover:border-blue-500/50 transition-all cursor-pointer group">
              <Code size={18} className="mb-2 text-blue-500" />
              <p className="text-xs font-semibold mb-1">Coding Mode</p>
              <p className="text-[10px] text-gray-500">"Create a login page in HTML"</p>
            </div>
            <div className="p-4 bg-[#171717] border border-[#333] rounded-2xl text-left hover:border-purple-500/50 transition-all cursor-pointer group">
              <Search size={18} className="mb-2 text-purple-500" />
              <p className="text-xs font-semibold mb-1">Research Mode</p>
              <p className="text-[10px] text-gray-500">"Compare Flutter vs React Native"</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {isTyping && (
            <div className="flex gap-4 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex gap-1">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
