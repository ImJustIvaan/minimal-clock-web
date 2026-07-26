import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Mode = 'password' | 'magicLink';

export default function AuthModal({ isDarkMode, onClose }: { isDarkMode: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>('password');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submitPassword = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({ email: email.trim(), password });
        if (err) throw err;
        setInfo('Account created. You can sign in now.');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitMagicLink = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (err) throw err;
      setInfo('Check your email for a sign-in link.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href },
      });
      if (err) throw err;
      // Browser is redirected to Google; nothing else to do here.
    } catch (e) {
      setError('Google sign-in failed.');
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-transparent border-b outline-none py-2 text-sm font-medium transition-colors ${
    isDarkMode ? 'border-zinc-100/15 focus:border-zinc-100/60 placeholder:text-zinc-100/30' : 'border-zinc-900/15 focus:border-zinc-900/60 placeholder:text-zinc-900/30'
  }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`max-w-sm w-full p-8 rounded-3xl shadow-2xl relative ${isDarkMode ? 'bg-zinc-900 text-zinc-50' : 'bg-white text-zinc-900'}`}
      >
        <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100 cursor-pointer" title="Close">
          <X size={20} />
        </button>

        <h2 className="text-xs font-mono uppercase tracking-widest opacity-40 text-center mb-8">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>

        <div className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          {mode === 'password' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          )}

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          {info && <p className="text-xs opacity-60 text-center">{info}</p>}

          <button
            disabled={loading || !email || (mode === 'password' && !password)}
            onClick={mode === 'password' ? submitPassword : submitMagicLink}
            className="w-full py-3 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
          >
            {loading ? '...' : mode === 'password' ? (isSignUp ? 'Sign Up' : 'Sign In') : 'Send Magic Link'}
          </button>

          <button
            onClick={() => setMode(mode === 'password' ? 'magicLink' : 'password')}
            className="text-xs opacity-50 hover:opacity-80 cursor-pointer"
          >
            {mode === 'password' ? 'Use a magic link instead' : 'Use a password instead'}
          </button>

          {mode === 'password' && (
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs opacity-50 hover:opacity-80 -mt-3 cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          )}

          <div className="flex items-center gap-3 -mx-1">
            <div className={`flex-1 h-px ${isDarkMode ? 'bg-zinc-100/10' : 'bg-zinc-900/10'}`} />
            <span className="text-[11px] opacity-40">OR</span>
            <div className={`flex-1 h-px ${isDarkMode ? 'bg-zinc-100/10' : 'bg-zinc-900/10'}`} />
          </div>

          <button
            disabled={loading}
            onClick={signInWithGoogle}
            className={`w-full py-3 rounded-xl border font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 cursor-pointer ${
              isDarkMode ? 'border-zinc-100/20' : 'border-zinc-900/20'
            }`}
          >
            Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
