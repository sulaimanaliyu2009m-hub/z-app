import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [wakeWarning, setWakeWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(false);
    setWakeWarning(false);
    setErrorMessage('Operation cancelled.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    setWakeWarning(false);

    timerRef.current = setTimeout(() => {
      setWakeWarning(true);
    }, 4000);

    abortControllerRef.current = new AbortController();

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { email, password, username };

      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (res.token) {
        localStorage.setItem('z_token', res.token);
        if (onAuthSuccess) onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      setLoading(false);
      setWakeWarning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{isLogin ? 'Sign In to Z' : 'Create Account'}</h2>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded text-sm">
            {errorMessage}
          </div>
        )}

        {wakeWarning && (
          <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500 text-amber-300 rounded text-sm flex items-center justify-between">
            <span>Waking up the server, this can take up to a minute...</span>
            <button
              type="button"
              onClick={handleCancel}
              className="ml-2 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm mb-1 text-slate-300">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1 text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
            }}
            className="text-sky-400 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
