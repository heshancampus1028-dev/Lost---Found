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
    // Same gradient the hero sections use, so the strip behind the pill
    // matches the page background instead of showing the default body color.
    // hero-gradient already carries its own light/dark variants.
    <div className="sticky top-0 z-[9999] hero-gradient">
      <div className="pt-4 pb-2 px-4">
        <nav className="max-w-6xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-full shadow-lg dark:shadow-black/30 border border-gray-200/60 dark:border-amber-500/20 transition-colors">
          <div className="flex justify-between items-center h-14 pl-5 pr-2 gap-2">

            {/* Logo (text only) */}
            <Link to="/" className="text-lg font-bold text-blue-600 dark:text-blue-400 tracking-wide shrink-0">
              Lanka<span className="text-amber-500 dark:text-amber-400">Find</span>
            </Link>

            {/* Center links */}
            <div className="flex items-center gap-1">
              <Link to="/lost" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition whitespace-nowrap shrink-0">{t('navLost')}</Link>
              <Link to="/found" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-black/5 dark:hover:bg-white/5 transition whitespace-nowrap shrink-0">{t('navFound')}</Link>
              <Link to="/map" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition hidden sm:inline-block whitespace-nowrap shrink-0">Map</Link>

              {isAuthenticated && (
                <>
                  <Link to="/my-reports" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition hidden md:inline-block whitespace-nowrap shrink-0">{t('navMyReports')}</Link>
                  <Link to="/messages" className="relative px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition hidden lg:inline-block whitespace-nowrap shrink-0">
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="px-3 py-1.5 rounded-full text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-black/5 dark:hover:bg-white/5 transition hidden lg:inline-block whitespace-nowrap shrink-0">
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap"
                    title="View profile"
                  >
                    {t('navGreeting')}, {user.name.split(' ')[0]} 👋
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 font-medium text-sm transition whitespace-nowrap"
                  >
                    {t('navLogout')}
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-400 font-medium text-sm transition shadow-sm whitespace-nowrap">
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
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-full px-3 py-1.5 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                🌐 {language === 'en' ? 'සිං' : 'EN'}
              </button>
            </div>

          </div>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
