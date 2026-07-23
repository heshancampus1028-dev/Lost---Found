import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Send login data to the backend
      const response = await api.post('/auth/login', { email, password });

      setMessage(response.data.msg);

      // Save the user + token in AuthContext (also persists to localStorage)
      login(response.data.user, response.data.token);

      // Redirect to the home page after 1 second
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.msg);
      } else {
        setError(t('serverErrorRetry'));
      }
    }
  };

  return (
    <div className="min-h-screen hero-gradient transition-colors flex items-center justify-center p-4 relative overflow-hidden">
      {/* soft ambient glow, echoes the Home hero without repeating its floating-icon signature */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl dark:shadow-black/40 border border-white/20 dark:border-slate-800 relative z-10"
      >
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-2xl mb-2">🔐</span>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('welcomeBack')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Alert messages */}
        {message && <div className="mb-4 p-3 bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-300 text-sm rounded-xl text-center font-medium">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-sm rounded-xl text-center font-medium">{error}</div>}

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('labelEmail')}</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('labelPassword')}</label>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-amber-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 shadow-md transition mt-2"
          >
            {t('signIn')}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
          {t('noAccount')}{' '}
          <Link to="/register" className="font-semibold text-blue-600 dark:text-amber-400 hover:underline">
            {t('registerHere')}
          </Link>
        </p>

      </motion.div>
    </div>
  );
}

export default Login;
