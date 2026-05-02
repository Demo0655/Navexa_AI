import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, X, Sparkles } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#171717] rounded-[2rem] border border-[#333] shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col md:flex-row animate-zoom-in">
        
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

        {/* Left Side - Info/Graphic */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#0a0a0a] to-[#171717] p-10 flex flex-col justify-between relative border-r border-[#333] z-10 hidden md:flex">
          <div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-8 animate-float">
              <Sparkles className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Unlock the Power of <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Navexa AI</span>
            </h2>
            <p className="text-gray-400 leading-relaxed text-sm">
              Experience the next generation of conversational AI. Sign in to save your history, customize your profile, and access premium multi-modal capabilities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#262626]/50 border border-[#333]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-300 font-medium">Secure End-to-End Encryption</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 relative z-10 flex flex-col justify-center bg-[#171717]">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#262626] text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
              <p className="text-sm text-gray-400">
                {isLogin ? 'Enter your details to continue.' : 'Join Navexa AI for free today.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-[#333]"></div>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Or continue with</span>
              <div className="flex-1 h-px bg-[#333]"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full mt-6 py-3.5 bg-[#262626] hover:bg-[#333] text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors border border-[#424242]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white font-bold hover:underline"
                >
                  {isLogin ? 'Sign up for free' : 'Log in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
