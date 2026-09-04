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

  // Close the mobile dropdown whenever a link inside it is tapped
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

  // Shared unread badge, reused in both the desktop link and the mobile dropdown link
  const UnreadBadge = () =>
    unreadCount > 0 ? (
      <span className="ml-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full inline-flex items-center justify-center leading-none shadow-sm">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    ) : null;

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-md dark:shadow-black/30 sticky top-0 z-[9999] border-b border-transparent dark:border-amber-500/20 transition-colors">
      {/* w-full + overflow-x-hidden here (rather than assuming the page content
          never overflows) is what keeps the whole site pinned to the device
          width on mobile - a single wide element anywhere else in the app can
          no longer drag the navbar (and the horizontal scrollbar) wider than
          the screen. */}
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
            <Link to="/map" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">🗺️ Map</Link>
            <Link to="/poster" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition hidden lg:inline">🖨️ Poster</Link>

            {isAuthenticated ? (
              <>
                <Link to="/my-reports" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">{t('navMyReports')}</Link>
                <Link to="/messages" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition flex items-center">
                  💬 Messages
                  <UnreadBadge />
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition">
                    Admin
                  </Link>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden lg:inline">{t('navGreeting')}, {user.name.split(' ')[0]} 👋</span>
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
              className="text-lg text-gray-500 dark:text-amber-400 border border-gray-200 dark:border-slate-700 rounded-full w-9 h-9 flex items-center justify-center hover:border-blue-400 dark:hover:border-amber-400 transition flex-shrink-0"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              title="Switch language"
              className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-full px-3 py-1.5 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex-shrink-0"
            >
              🌐 {language === 'en' ? 'සිං' : 'EN'}
            </button>
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
          <Link to="/map" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium">🗺️ Map</Link>
          <Link to="/poster" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium">🖨️ Poster</Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-reports" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium">{t('navMyReports')}</Link>
              <Link to="/messages" onClick={closeMobileMenu} className="px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium flex items-center">
                💬 Messages
                <UnreadBadge />
              </Link>
              {user.isAdmin && (
                <Link to="/admin" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-semibold">
                  Admin
                </Link>
              )}
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800 mt-2 pt-3">
                {t('navGreeting')}, {user.name.split(' ')[0]} 👋
              </div>
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
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-lg py-2"
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={toggleLanguage}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-lg py-2"
            >
              🌐 {language === 'en' ? 'සිංහල' : 'English'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
