import React, { useEffect } from 'react';
import { User, Check, Copy } from 'lucide-react';
import NavexaLogo from './NavexaLogo';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-python';

// Custom renderer to add copy button to code blocks
const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  const escapedCode = code.replace(/'/g, "&apos;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `
    <div class="relative group my-4 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#333]">
      <div class="flex items-center justify-between px-4 py-2 bg-[#2a2a2a] text-xs text-gray-400">
        <span>${language || 'code'}</span>
        <button class="copy-code-btn flex items-center gap-1 hover:text-white transition-colors" data-code="${escapedCode}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy code
        </button>
      </div>
      <pre class="!m-0 !bg-transparent !p-4"><code class="language-${language}">${escapedCode}</code></pre>
    </div>
  `;
};
marked.setOptions({ renderer });

const MessageBubble = ({ message }) => {
  const isAi = message.role === 'ai';

  useEffect(() => {
    Prism.highlightAll();

    // Attach copy event listeners
    const btns = document.querySelectorAll('.copy-code-btn');
    const handleCopy = (e) => {
      const btn = e.currentTarget;
      const code = btn.getAttribute('data-code');
      // Unescape the code for the clipboard
      const unescapedCode = code.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      navigator.clipboard.writeText(unescapedCode);
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 2000);
    };
    
    btns.forEach(btn => btn.addEventListener('click', handleCopy));
    return () => btns.forEach(btn => btn.removeEventListener('click', handleCopy));
  }, [message.text]);

  const renderContent = () => {
    return (
      <div 
        className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed break-words"
        dangerouslySetInnerHTML={{ __html: marked.parse(message.text) }}
      />
    );
  };

  return (
    <div className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'} animate-fade-in`}>
      <div className={`flex gap-4 w-full ${isAi ? 'flex-row' : 'flex-row-reverse max-w-[85%] md:max-w-[75%]'}`}>
        
        {/* Avatar */}
        {isAi && (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 mt-1">
            <NavexaLogo size={18} className="text-white" />
          </div>
        )}
        
        <div className={`min-w-0 ${isAi ? 'flex-1' : ''}`}>
          <div className={`px-5 py-3.5 ${
            isAi 
              ? 'text-gray-200 px-0 md:px-2' 
              : 'bg-[#2f2f2f] text-white rounded-3xl rounded-tr-sm inline-block'
          }`}>
            {renderContent()}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MessageBubble;
