import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const InputBox = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto relative group">
      <div className="relative flex items-end gap-2 bg-[#171717] border border-[#333] rounded-2xl p-2 pl-4 transition-all shadow-2xl">
        <textarea
          ref={textareaRef}
          rows="1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Navexa AI..."
          className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none py-2 text-sm md:text-base custom-scrollbar"
          style={{ minHeight: '24px' }}
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className={`
            p-2 rounded-xl transition-all flex-shrink-0
            ${text.trim() && !disabled 
              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20' 
              : 'bg-[#262626] text-gray-600 cursor-not-allowed'}
          `}
        >
          <ArrowUp size={20} />
        </button>
      </div>
    </div>
  );
};

export default InputBox;
