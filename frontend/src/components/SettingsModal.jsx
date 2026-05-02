import React, { useState } from 'react';
import { 
  X, Settings, Bell, Palette, LayoutGrid, ShieldAlert, 
  Lock, Users, User, Play, ChevronDown, Check
} from 'lucide-react';

const SettingsModal = ({ onClose, onClearChats, appearance, setAppearance }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  // States for General Tab
  const [contrast, setContrast] = useState('System');
  const [accentColor, setAccentColor] = useState('Default');
  const [language, setLanguage] = useState('Auto-detect');
  const [spokenLanguage, setSpokenLanguage] = useState('Auto-detect');
  const [voice, setVoice] = useState('Breeze');
  const [separateVoice, setSeparateVoice] = useState(false);

  // States for other tabs
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [chatHistory, setChatHistory] = useState(true);
  
  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'personalization', label: 'Personalization', icon: <Palette size={18} /> },
    { id: 'apps', label: 'Apps', icon: <LayoutGrid size={18} /> },
    { id: 'data', label: 'Data controls', icon: <ShieldAlert size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'parental', label: 'Parental controls', icon: <Users size={18} /> },
    { id: 'account', label: 'Account', icon: <User size={18} /> }
  ];

  const Dropdown = ({ value, options, onChange, hasColorDot }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm text-gray-200 hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-[#2f2f2f]"
        >
          {hasColorDot && <div className="w-3 h-3 rounded-full bg-gray-400"></div>}
          {value} <ChevronDown size={14} />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-[#2f2f2f] border border-[#424242] rounded-xl shadow-xl z-50 overflow-hidden py-1">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#424242] flex items-center justify-between"
              >
                {opt}
                {value === opt && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Toggle = ({ checked, onChange }) => (
    <button 
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
    >
      <span className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-all ${checked ? 'left-[calc(100%-1.125rem)]' : 'left-1'}`}></span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 md:p-10">
      <div className="bg-[#212121] w-full max-w-[900px] h-full max-h-[750px] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-in border border-[#333]">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-[280px] flex-shrink-0 bg-[#212121] border-b md:border-b-0 md:border-r border-[#333] flex flex-col py-2 md:py-3 z-10">
          <div className="px-4 mb-2 flex justify-between items-center md:block">
            <h2 className="text-lg font-bold text-white md:hidden">Settings</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#2f2f2f] rounded-lg text-gray-400 hover:text-white transition-all md:mb-4"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex overflow-x-auto md:flex-col md:overflow-y-auto px-2 custom-scrollbar space-x-2 md:space-x-0 md:space-y-1 pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl transition-all text-xs md:text-sm font-medium
                  ${activeTab === tab.id 
                    ? 'bg-[#2f2f2f] text-white' 
                    : 'text-gray-300 hover:bg-[#2f2f2f] hover:text-white'
                  }
                `}
              >
                <span className={`${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-[#212121] flex flex-col relative overflow-hidden">
          
          {/* MFA Banner - specific to Security/General based on screenshot */}
          {activeTab === 'general' && (
            <div className="m-6 p-4 bg-[#2f2f2f] rounded-xl flex items-center justify-between gap-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                Add multi-factor authentication (MFA), like a text message or authenticator app, to help protect your account when logging in.
              </p>
              <button className="px-4 py-2 border border-gray-500 rounded-full text-sm text-white font-medium hover:bg-[#424242] transition-colors whitespace-nowrap">
                Set up MFA
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar">
            
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fade-in max-w-2xl mt-4">
                
                <div className="flex items-center justify-between py-3 border-b border-[#333]">
                  <span className="text-sm text-white">Appearance</span>
                  <Dropdown 
                    value={appearance} 
                    options={['System', 'Dark', 'Light']} 
                    onChange={setAppearance} 
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#333]">
                  <span className="text-sm text-white">Contrast</span>
                  <Dropdown 
                    value={contrast} 
                    options={['System', 'High']} 
                    onChange={setContrast} 
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#333]">
                  <span className="text-sm text-white">Accent color</span>
                  <Dropdown 
                    value={accentColor} 
                    options={['Default', 'Blue', 'Green', 'Purple']} 
                    onChange={setAccentColor} 
                    hasColorDot
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#333]">
                  <span className="text-sm text-white">Language</span>
                  <Dropdown 
                    value={language} 
                    options={['Auto-detect', 'English (US)', 'Hindi', 'Spanish']} 
                    onChange={setLanguage} 
                  />
                </div>

                <div className="py-4 border-b border-[#333]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Spoken language</span>
                    <Dropdown 
                      value={spokenLanguage} 
                      options={['Auto-detect', 'English', 'Hindi']} 
                      onChange={setSpokenLanguage} 
                    />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.
                  </p>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-[#333]">
                  <span className="text-sm text-white">Voice</span>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2f2f2f] hover:bg-[#424242] rounded-full text-sm text-white transition-colors">
                      <Play size={14} fill="currentColor" /> Play
                    </button>
                    <Dropdown 
                      value={voice} 
                      options={['Breeze', 'Cove', 'Ember', 'Juniper']} 
                      onChange={setVoice} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-[#333]">
                  <div>
                    <div className="text-sm text-white mb-1">Separate Voice</div>
                    <div className="text-xs text-gray-400">Keep Navexa AI Voice in a separate full screen, without real time transcripts and visuals.</div>
                  </div>
                  <Toggle checked={separateVoice} onChange={setSeparateVoice} />
                </div>

              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6 animate-fade-in max-w-2xl mt-4">
                <div className="flex items-center justify-between py-4 border-b border-[#333]">
                  <div className="pr-10">
                    <div className="text-sm text-white mb-1">Chat history & training</div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      Save new chats on this browser to your history and allow them to be used to improve our models. Unsaved chats will be deleted from our systems within 30 days.
                    </div>
                  </div>
                  <Toggle checked={chatHistory} onChange={setChatHistory} />
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-[#333]">
                  <span className="text-sm text-white">Clear all chats</span>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all chats?')) onClearChats();
                    }}
                    className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-full font-medium text-sm transition-all"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-[#333]">
                  <span className="text-sm text-white">Export data</span>
                  <button className="px-4 py-2 border border-gray-500 hover:bg-[#424242] rounded-full text-white font-medium text-sm transition-all">
                    Export
                  </button>
                </div>
              </div>
            )}

            {/* Empty state for other tabs */}
            {['notifications', 'personalization', 'apps', 'security', 'parental', 'account'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-full mt-20 text-center animate-fade-in">
                <div className="w-16 h-16 bg-[#2f2f2f] rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                  {tabs.find(t => t.id === activeTab)?.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{tabs.find(t => t.id === activeTab)?.label}</h4>
                <p className="text-sm text-gray-400 max-w-sm">
                  This section is available in the Navexa AI architecture. Custom configurations can be added here.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
