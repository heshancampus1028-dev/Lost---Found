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
                <Link
                  to="/profile"
                  className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                  title="View / edit profile"
                >
                  {t('navGreeting')}, {user.name.split(' ')[0]} 👋
                </Link>
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

            {/* Theme toggle - modern pill switch with a sliding sun/moon icon */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              aria-label="Toggle dark mode"
              className={`relative w-14 h-8 rounded-full flex items-center px-1 transition-colors duration-300 border ${
                isDark
                  ? 'bg-blue-950 border-blue-500/40'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 ${
                  isDark ? 'translate-x-6 bg-slate-800' : 'translate-x-0 bg-white'
                }`}
              >
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-300">
                    <path d="M21.75 15.002a9.72 9.72 0 01-3.752.752 9.75 9.75 0 01-9.75-9.75c0-1.33.27-2.598.752-3.752A9.753 9.753 0 003 11.25 9.75 9.75 0 0012.75 21a9.753 9.753 0 009-5.998z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-500">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                )}
              </span>
            </button>

            {/* Language toggle - full language name, not abbreviated */}
            <button
              onClick={toggleLanguage}
              title="Switch language"
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-full px-3.5 py-1.5 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M3 12h18M12 3c2.4 2.6 3.6 5.7 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.7-3.6-9s1.2-6.4 3.6-9z" />
              </svg>
              {language === 'en' ? 'සිංහල' : 'English'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
