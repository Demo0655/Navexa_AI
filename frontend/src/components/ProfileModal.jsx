import React, { useState } from 'react';
import { X, Camera, User, Mail, Calendar, Shield, LogOut, Eye, Check } from 'lucide-react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';

const ProfileModal = ({ user, profilePhoto, onPhotoUpload, onClose }) => {
  const [name, setName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setIsEditing(false);
      alert('Name updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#171717] w-full max-w-lg rounded-[2.5rem] border border-[#333] shadow-2xl overflow-hidden relative animate-slide-in">
        
        {/* Header */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-700 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col items-center">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] border-4 border-[#171717] overflow-hidden bg-[#262626] shadow-2xl relative">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <User size={48} />
                  </div>
                )}
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    title="View Photo"
                  >
                    <Eye size={18} />
                  </button>
                  <label className="p-2 bg-blue-500 hover:bg-blue-400 rounded-full text-white cursor-pointer transition-all shadow-lg">
                    <Camera size={18} />
                    <input type="file" className="hidden" onChange={onPhotoUpload} accept="image/*" />
                  </label>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-[#171717] rounded-full"></div>
            </div>

            <div className="mt-6 text-center w-full">
              {isEditing ? (
                <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#0a0a0a] border border-blue-500/50 rounded-xl px-4 py-2 text-center text-lg font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all w-full"
                    autoFocus
                  />
                  <button 
                    onClick={handleUpdateName}
                    disabled={loading}
                    className="p-2 bg-blue-500 hover:bg-blue-400 rounded-xl text-white transition-all shadow-lg"
                  >
                    <Check size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 group">
                  <h2 className="text-2xl font-black tracking-tight text-white">{name || 'Navexa User'}</h2>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 bg-[#262626] rounded-lg text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Camera size={14} />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest">Navexa AI Member</p>
            </div>

            {/* Info Cards */}
            <div className="w-full mt-8 space-y-3">
              <div className="bg-[#0a0a0a]/50 border border-[#333] p-4 rounded-2xl flex items-center gap-4 group hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <Mail size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-600 tracking-tighter">Email Address</p>
                  <p className="text-sm font-semibold text-gray-300">{user?.email}</p>
                </div>
              </div>

              <div className="bg-[#0a0a0a]/50 border border-[#333] p-4 rounded-2xl flex items-center gap-4 group hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-600 tracking-tighter">Member Since</p>
                  <p className="text-sm font-semibold text-gray-300">{new Date(user?.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="bg-[#0a0a0a]/50 border border-[#333] p-4 rounded-2xl flex items-center gap-4 group hover:border-green-500/30 transition-all">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-600 tracking-tighter">Account Status</p>
                  <p className="text-sm font-semibold text-green-500 flex items-center gap-1">Verified <Check size={12} /></p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => auth.signOut()}
              className="mt-8 w-full py-4 border border-red-500/20 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Sign Out from Device
            </button>
          </div>
        </div>
      </div>

      {/* Full Photo Preview Overlay */}
      {showPreview && profilePhoto && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPreview(false)}>
          <button className="absolute top-8 right-8 text-white hover:scale-110 transition-all">
            <X size={32} />
          </button>
          <img 
            src={profilePhoto} 
            alt="Profile Preview" 
            className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl border-4 border-white/10 animate-zoom-in" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileModal;
