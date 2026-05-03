import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { Menu, LogOut, Camera, PanelLeft, Sparkles } from 'lucide-react';
import NavexaLogo from './components/NavexaLogo';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import ModeSelector from './components/ModeSelector';
import InputBox from './components/InputBox';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import ImageCropperModal from './components/ImageCropperModal';
import SettingsModal from './components/SettingsModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentMode, setCurrentMode] = useState('auto');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [chatHistory, setChatHistory] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [appearance, setAppearance] = useState('System');
  const isDark = appearance === 'Dark' || (appearance === 'System' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Handle Theme
  useEffect(() => {
    const applyTheme = (theme) => {
      const root = document.documentElement;
      if (theme === 'Dark' || (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    applyTheme(appearance);

    if (appearance === 'System') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('System');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [appearance]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load user specific data if needed
        setProfilePhoto(currentUser.photoURL);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    const newUserMessage = { role: 'user', text };
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      console.log('Sending message to backend:', text);
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: text,
        history: messages.map(m => ({ role: m.role, text: m.text }))
      });

      const { mode, response: aiText } = response.data;
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: aiText, 
        mode 
      }]);

      if (messages.length === 0) {
        const title = text.length > 30 ? text.substring(0, 30) + '...' : text;
        setChatHistory(prev => [{ title, id: Date.now() }, ...prev]);
      }

    } catch (error) {
      console.error('Full Error details:', error);
      const errorMessage = error.response?.data?.error || 'I encountered an error connecting to the AI engine. Please ensure the backend server is running and the API key is valid.';
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `⚠️ ${errorMessage}`, 
        isError: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMessages([]);
  };

  const handleClearChats = () => {
    setMessages([]);
    setChatHistory([]);
    setShowSettingsModal(false);
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input value so the same file can be selected again
    e.target.value = null;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageForCrop(reader.result);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const getPublicIdFromUrl = (url) => {
    try {
      if (!url || !url.includes('cloudinary.com')) return null;
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        let path = parts[1];
        const pathParts = path.split('/');
        pathParts.shift(); // remove version e.g. v1714488390
        const fullPath = pathParts.join('/');
        const decoded = decodeURIComponent(fullPath);
        const idWithoutExtension = decoded.substring(0, decoded.lastIndexOf('.'));
        return idWithoutExtension;
      }
    } catch(e) {
      console.error("Error parsing Cloudinary URL", e);
    }
    return null;
  };

  const handleCroppedImageUpload = async (croppedFile) => {
    setIsCropperOpen(false);
    
    const oldPhotoUrl = profilePhoto; // Save old photo url to delete later
    
    const formData = new FormData();
    formData.append('file', croppedFile);
    formData.append('upload_preset', 'Navexa AI profile photo');
    formData.append('folder', 'Profile photo Navexa');

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/dszifueob/image/upload', formData);
      const url = res.data.secure_url;
      setProfilePhoto(url);
      
      // Update user profile in Firebase so it persists
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
      
      console.log('Photo uploaded and saved to Firebase:', url);

      // Attempt to delete old photo from Cloudinary via our backend securely
      if (oldPhotoUrl) {
        const publicId = getPublicIdFromUrl(oldPhotoUrl);
        if (publicId) {
          axios.post(`${API_BASE_URL}/delete-image`, { public_id: publicId })
            .then(res => console.log('Old photo deleted successfully'))
            .catch(err => console.error("Could not delete old image (Ensure API Key/Secret is in backend .env)", err));
        }
      }
    } catch (err) {
      console.error('Cloudinary error:', err);
      alert('Failed to upload photo. Check Cloudinary preset settings.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">Initializing Navexa AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen-dvh bg-[#0a0a0a] text-white overflow-hidden mesh-gradient">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-10 lg:hidden backdrop-blur-sm animate-fade-in" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        history={chatHistory} 
        onNewChat={() => setMessages([])}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        isDark={isDark}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <header className="h-16 md:h-20 border-b border-[#333]/50 flex items-center justify-between px-3 md:px-8 glass-effect z-30 relative transition-all">
          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white transition-all p-2 hover:bg-[#262626] rounded-xl lg:hidden"
              title="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <ModeSelector currentMode={currentMode} setMode={setCurrentMode} />
            </div>
          </div>

          {/* Centered Logo + Title */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 pointer-events-none whitespace-nowrap">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <NavexaLogo size={20} isDark={true} />
            </div>
            <span className="hidden xs:block text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Navexa AI
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{user.email?.split('@')[0]}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Secure</span>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl overflow-hidden border border-[#333] cursor-pointer ring-offset-2 ring-offset-[#0a0a0a] group-hover:ring-2 ring-blue-500 transition-all shadow-xl">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#171717] flex items-center justify-center">
                        <Sparkles size={16} className="text-blue-500" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={14} className="text-white" />
                      <input type="file" className="hidden" onChange={handleProfilePhotoUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 md:gap-3">
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs md:text-sm font-bold text-gray-400 hover:text-white px-2 md:px-4 py-2 transition-colors"
                >
                  Log in
                </button>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-[10px] md:text-sm font-bold bg-white text-black hover:bg-gray-200 px-3 md:px-5 py-2 md:py-2.5 rounded-full transition-all shadow-lg shadow-white/10 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Sign up for free</span>
                  <span className="sm:hidden">Join Now</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className={`flex-1 relative transition-all duration-700 ease-in-out ${messages.length === 0 ? 'flex flex-col justify-center pb-20' : 'flex flex-col'}`}>
          <div className={`${messages.length === 0 ? 'hidden' : 'flex-1'} overflow-hidden`}>
            <ChatContainer messages={messages} isTyping={isTyping} />
          </div>

          <div className={`transition-all duration-700 ease-in-out w-full px-4 md:px-0 ${messages.length === 0 ? 'transform translate-y-0' : 'pb-6 md:pb-10 pt-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent'}`}>
            <div className="max-w-3xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center mb-10 animate-fade-in">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/10">
                    <NavexaLogo size={32} className="text-blue-500" />
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white">How can I assist you?</h1>
                  <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base">
                    Navexa AI is ready to chat, code, or research. Ask anything to get started.
                  </p>
                </div>
              )}
              
              <div onClickCapture={(e) => {
                if (!user) {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowAuthModal(true);
                }
              }}>
                <InputBox onSend={handleSendMessage} disabled={isTyping || !user} />
              </div>

              {messages.length === 0 && (
                <div className="grid grid-cols-2 gap-3 mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div 
                    onClick={() => handleSendMessage("Create a login page in HTML")}
                    className="p-4 bg-[#171717] border border-[#333] rounded-2xl text-left hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                      <PanelLeft size={16} className="text-blue-500" />
                    </div>
                    <p className="text-xs font-bold mb-1">Coding Mode</p>
                    <p className="text-[10px] text-gray-500">"Create a login page in HTML"</p>
                  </div>
                  <div 
                    onClick={() => handleSendMessage("Compare Flutter vs React Native")}
                    className="p-4 bg-[#171717] border border-[#333] rounded-2xl text-left hover:border-purple-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                      <NavexaLogo size={16} className="text-purple-500" />
                    </div>
                    <p className="text-xs font-bold mb-1">Research Mode</p>
                    <p className="text-[10px] text-gray-500">"Compare Flutter vs React Native"</p>
                  </div>
                </div>
              )}

              <div className="flex justify-center items-center gap-4 mt-6 opacity-40">
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.4em]">Navexa AI</p>
                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.4em]">V1.5 Live</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showProfileModal && (
        <ProfileModal 
          user={user} 
          profilePhoto={profilePhoto} 
          onPhotoUpload={handleProfilePhotoUpload} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}

      {isCropperOpen && selectedImageForCrop && (
        <ImageCropperModal
          imageSrc={selectedImageForCrop}
          onCropComplete={handleCroppedImageUpload}
          onClose={() => setIsCropperOpen(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal 
          onClose={() => setShowSettingsModal(false)} 
          onClearChats={handleClearChats}
          appearance={appearance}
          setAppearance={setAppearance}
        />
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;
