import React, { useState } from 'react';
import { auth, googleProvider, appleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import axios from 'axios';
import NavexaLogo from './NavexaLogo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message.includes('auth/') ? err.message.split('/')[1].replace(/-/g, ' ') : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPass = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/send-otp`, { email });
      setShowOtp(true);
    } catch (err) {
      setError("Failed to send OTP. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
      if (res.data.success) {
        setShowOtp(false);
        await sendPasswordResetEmail(auth, email);
        alert("OTP Verified. A password reset link has been sent to your email.");
        setShowForgot(false);
      }
    } catch (err) {
      setError("Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-float"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-lg relative">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30 transform hover:scale-110 transition-transform duration-500 cursor-pointer">
            <NavexaLogo size={40} isDark={true} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
            Navexa AI
          </h1>
          <p className="text-gray-400 text-center font-medium max-w-[280px]">
            {showForgot ? 'Recover your access' : isLogin ? 'Sign in to continue your journey' : 'Join our community of innovators'}
          </p>
        </div>

        {/* Main Card */}
        <div className="premium-card p-6 md:p-10 animate-slide-in relative overflow-hidden">
          {/* Subtle Progress Bar for Loading */}
          {loading && <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 w-full animate-pulse"></div>}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-2xl mb-6 flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              {error}
            </div>
          )}

          {!showForgot ? (
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-500 transition-colors">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="premium-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-500 transition-colors">Password</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-xs text-blue-500 hover:text-blue-400 font-bold tracking-wide"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="premium-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {loading ? <Loader2 className="animate-spin" size={22} /> : (isLogin ? 'Sign In Now' : 'Create Account')}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#262626]"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]"><span className="bg-[#171717] px-4 text-gray-600">Secure Connect</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => handleSocialLogin(googleProvider)}
                  className="flex items-center justify-center gap-3 bg-[#0a0a0a] border border-[#262626] py-3.5 rounded-2xl hover:bg-[#262626] hover:border-blue-500/30 transition-all text-sm font-bold active:scale-[0.97]"
                >
                  <Chrome size={20} className="text-blue-500" /> Google
                </button>
                <button 
                  type="button"
                  onClick={() => handleSocialLogin(appleProvider)}
                  className="flex items-center justify-center gap-3 bg-[#0a0a0a] border border-[#262626] py-3.5 rounded-2xl hover:bg-[#262626] hover:border-gray-500/30 transition-all text-sm font-bold active:scale-[0.97]"
                >
                  <Apple size={20} className="text-white" /> Apple
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={showOtp ? handleVerifyOtp : handleForgotPass} className="space-y-6">
              <button 
                type="button"
                onClick={() => { setShowForgot(false); setShowOtp(false); }}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>

              <div className="space-y-2 group">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                  {showOtp ? 'Security Verification' : 'Account Email'}
                </label>
                <div className="relative">
                  {showOtp ? (
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-2xl py-5 px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-center text-3xl tracking-[0.5em] font-black text-blue-500"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  ) : (
                    <>
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="premium-input"
                        placeholder="Enter your registered email"
                        required
                      />
                    </>
                  )}
                </div>
                {showOtp && <p className="text-[10px] text-center text-gray-500 mt-2">Enter the 6-digit code sent to your mail</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : (showOtp ? 'Verify Security Code' : 'Send Recovery OTP')}
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <p className="mt-10 text-center text-sm font-medium animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {!showForgot && (
            <span className="text-gray-500">
              {isLogin ? "New to Navexa AI? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 hover:text-blue-400 font-bold hover:underline underline-offset-4 decoration-2 transition-all"
              >
                {isLogin ? 'Join Now' : 'Sign In Instead'}
              </button>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
