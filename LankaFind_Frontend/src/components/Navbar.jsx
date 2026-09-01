import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Keep the Messages badge fresh: fetch on login, then poll in the
  // background (same cadence as the Messages page) so a new message shows
  // up as a red badge without needing a refresh.
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const response = await api.get('/messages/conversations');
        const total = response.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchUnread();
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-md dark:shadow-black/30 sticky top-0 z-[9999] border-b border-transparent dark:border-amber-500/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wide">
            Lanka<span className="text-amber-500 dark:text-amber-400">Find</span>
          </Link>

          {/* Links */}
          <div className="flex space-x-4 sm:space-x-6 items-center">
            <Link to="/lost" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">{t('navLost')}</Link>
            <Link to="/found" className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium transition">{t('navFound')}</Link>
            <Link to="/map" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">Map</Link>
            <Link to="/poster" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition hidden md:inline">Poster</Link>

            {isAuthenticated ? (
              <>
                <Link to="/my-reports" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">{t('navMyReports')}</Link>
                <Link to="/messages" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition">
                    Admin
                  </Link>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{t('navGreeting')}, {user.name.split(' ')[0]} 👋</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 font-medium transition"
                >
                  {t('navLogout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 font-medium transition shadow-sm">
                {t('navLogin')}
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="text-lg text-gray-500 dark:text-amber-400 border border-gray-200 dark:border-slate-700 rounded-full w-9 h-9 flex items-center justify-center hover:border-blue-400 dark:hover:border-amber-400 transition"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              title="Switch language"
              className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-full px-3 py-1.5 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              🌐 {language === 'en' ? 'සිං' : 'EN'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
