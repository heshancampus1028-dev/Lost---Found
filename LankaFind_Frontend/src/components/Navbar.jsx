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
  const [mobileOpen, setMobileOpen] = useState(false); // hamburger dropdown state (mobile only)

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  const closeMobileMenu = () => setMobileOpen(false);

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

  // Reused pill toggle-switch for theme, shared by desktop and mobile
  const ThemeToggle = ({ className = '' }) => (
    <button
      onClick={toggleTheme}
      title="Toggle theme"
      aria-label="Toggle dark mode"
      className={`relative w-14 h-8 rounded-full flex items-center px-1 transition-colors duration-300 border ${
        isDark ? 'bg-blue-950 border-blue-500/40' : 'bg-amber-50 border-amber-200'
      } ${className}`}
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
  );

  // Reused language pill, shared by desktop and mobile
  const LanguageToggle = ({ className = '' }) => (
    <button
      onClick={toggleLanguage}
      title="Switch language"
      className={`flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-full px-3.5 py-1.5 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M3 12h18M12 3c2.4 2.6 3.6 5.7 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.7-3.6-9s1.2-6.4 3.6-9z" />
      </svg>
      {language === 'en' ? 'සිංහල' : 'English'}
    </button>
  );

  const UnreadBadge = () =>
    unreadCount > 0 ? (
      <span className="ml-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full inline-flex items-center justify-center leading-none shadow-sm">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    ) : null;

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-md dark:shadow-black/30 sticky top-0 z-[9999] border-b border-transparent dark:border-amber-500/20 transition-colors">
      {/* w-full here (rather than assuming page content never overflows) is
          what keeps the whole site pinned to the device width on mobile - a
          single wide element anywhere else in the app can no longer drag the
          navbar (and the horizontal scrollbar) wider than the screen. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wide flex-shrink-0">
            Lanka<span className="text-amber-500 dark:text-amber-400">Find</span>
          </Link>

          {/* ── Desktop links (md and up) ─────────────────────── */}
          <div className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            <Link to="/lost" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">{t('navLost')}</Link>
            <Link to="/found" className="text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium transition">{t('navFound')}</Link>
            <Link to="/map" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">Map</Link>

            {isAuthenticated ? (
              <>
                <Link to="/my-reports" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">{t('navMyReports')}</Link>
                <Link to="/messages" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition flex items-center">
                  Messages
                  <UnreadBadge />
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition">
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-sm text-gray-500 dark:text-gray-400 hidden lg:inline hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
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

            <ThemeToggle className="flex-shrink-0" />
            <LanguageToggle className="flex-shrink-0" />
          </div>

          {/* ── Mobile controls (below md): unread dot + hamburger ── */}
          <div className="flex md:hidden items-center gap-3">
            {isAuthenticated && unreadCount > 0 && (
              <Link to="/messages" onClick={closeMobileMenu} className="relative text-xl">
                💬
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </Link>
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown panel (below md) ────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 pt-2 space-y-1 w-full">
          <Link to="/lost" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium">{t('navLost')}</Link>
          <Link to="/found" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium">{t('navFound')}</Link>
          <Link to="/map" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium">Map</Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-reports" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium">{t('navMyReports')}</Link>
              <Link to="/messages" onClick={closeMobileMenu} className="px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium flex items-center">
                Messages
                <UnreadBadge />
              </Link>
              {user.isAdmin && (
                <Link to="/admin" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-semibold">
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium border-t border-gray-100 dark:border-slate-800 mt-2 pt-3"
              >
                {t('navGreeting')}, {user.name.split(' ')[0]} 👋
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium"
              >
                {t('navLogout')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="block text-center px-3 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-medium shadow-sm"
            >
              {t('navLogin')}
            </Link>
          )}

          {/* Theme + language toggles */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-slate-800 mt-2">
            <ThemeToggle />
            <LanguageToggle className="flex-1 justify-center" />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
