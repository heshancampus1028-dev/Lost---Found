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
    <div className="sticky top-4 z-[9999] px-4">
      <nav className="max-w-5xl mx-auto bg-neutral-900/95 dark:bg-black/95 backdrop-blur-lg rounded-full shadow-xl shadow-black/20 border border-white/10 transition-colors">
        <div className="flex justify-between items-center h-14 pl-3 pr-2">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-base">
              🔎
            </span>
            <span className="hidden sm:inline text-base font-bold text-white tracking-wide">
              Lanka<span className="text-amber-400">Find</span>
            </span>
          </Link>

          {/* Center links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/lost" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition">{t('navLost')}</Link>
            <Link to="/found" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition">{t('navFound')}</Link>
            <Link to="/map" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition hidden sm:inline-block">Map</Link>
            <Link to="/poster" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition hidden md:inline-block">Poster</Link>

            {isAuthenticated && (
              <>
                <Link to="/my-reports" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition hidden md:inline-block">{t('navMyReports')}</Link>
                <Link to="/messages" className="relative px-3 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition hidden lg:inline-block">
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="px-3 py-1.5 rounded-full text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-white/10 transition hidden lg:inline-block">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right pill actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition text-base"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              title="Switch language"
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-gray-300 rounded-full px-2.5 h-9 hover:bg-white/10 hover:text-white transition"
            >
              🌐 {language === 'en' ? 'සිං' : 'EN'}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  title="View profile"
                  className="flex items-center gap-2 bg-white text-neutral-900 rounded-full pl-1 pr-3 h-9 hover:bg-gray-100 transition"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline text-sm font-semibold max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title={t('navLogout')}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition"
                >
                  ⏻
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white text-neutral-900 font-semibold text-sm px-4 h-9 flex items-center rounded-full hover:bg-gray-100 transition"
              >
                {t('navLogin')}
              </Link>
            )}
          </div>

        </div>
      </nav>
    </div>
  );
}

export default Navbar;
