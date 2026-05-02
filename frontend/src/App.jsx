import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { Menu, LogOut, Camera, PanelLeft } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden mesh-gradient">
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
        <header className="h-16 md:h-20 border-b border-[#333]/50 flex items-center justify-between px-4 md:px-8 glass-effect z-10 transition-all">
          <div className="flex items-center gap-3 md:gap-6">
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
            <div className="sm:hidden">
              <div className="bg-[#171717] px-3 py-1.5 rounded-lg border border-[#333] text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                {currentMode} Mode
              </div>
            </div>
          </div>

          {/* Centered Logo + Title */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 pointer-events-none">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <NavexaLogo size={20} isDark={true} />
            </div>
            <span className="hidden sm:block text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Navexa AI
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{user.email?.split('@')[0]}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Secure session</span>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl overflow-hidden border border-[#333] cursor-pointer ring-offset-2 ring-offset-[#0a0a0a] group-hover:ring-2 ring-blue-500 transition-all shadow-xl shadow-blue-500/10">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#171717] flex items-center justify-center">
                        <Sparkles size={18} className="text-blue-500" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={16} className="text-white" />
                      <input type="file" className="hidden" onChange={handleProfilePhotoUpload} accept="image/*" />
                    </label>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-gray-500 border border-transparent hover:border-red-500/20"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm font-bold text-gray-300 hover:text-white px-4 py-2 transition-colors"
                >
                  Log in
                </button>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm font-bold bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-white/10"
                >
                  Sign up for free
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatContainer messages={messages} isTyping={isTyping} />
        </div>

        <div className="p-4 md:p-10 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent relative z-10">
          <div className="max-w-4xl mx-auto">
            <div onClickCapture={(e) => {
              if (!user) {
                e.stopPropagation();
                e.preventDefault();
                setShowAuthModal(true);
              }
            }}>
              <InputBox onSend={handleSendMessage} disabled={isTyping || !user} />
            </div>
            <div className="flex justify-center items-center gap-4 mt-4">
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-[0.3em]">
                Navexa AI Premium
              </p>
              <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-[0.3em]">
                V1.2 Active
              </p>
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
