import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Only Home/Login/Register render their own hero-gradient section, so
  // the navbar should only wear that dark-navy backdrop there. Every other
  // page (Lost, Found, Map, Profile, etc.) uses the app's normal light/dark
  // background, so the navbar should match that instead - white in light
  // mode, the app's near-black slate in dark mode.
  const isHeroPage = ['/', '/login', '/register'].includes(pathname);
  const backdropClass = isHeroPage
    ? 'hero-gradient'
    : 'bg-white dark:bg-slate-950';

  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false); // hamburger dropdown (mobile only)
  const [showScrollTop, setShowScrollTop] = useState(false); // back-to-top button

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  const closeMobileMenu = () => setMobileOpen(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Show the "back to top" button once the page has scrolled down a bit.
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const UnreadBadge = () =>
    unreadCount > 0 ? (
      <span className="ml-1.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full inline-flex items-center justify-center leading-none shadow-sm">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    ) : null;

  return (
    <>
      {/* Same gradient the hero sections use, so the strip behind the pill
          matches the page background instead of showing the default body color
          - but only on pages that actually render a hero (Home/Login/Register).
          Elsewhere it matches the app's normal light/dark background. */}
      <div className={`${backdropClass} transition-colors`}>
        <div className="pt-4 pb-2 px-4">
          <nav className={`max-w-6xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg dark:shadow-black/30 border border-gray-200/60 dark:border-amber-500/20 transition-all ${mobileOpen ? 'rounded-3xl' : 'rounded-full'}`}>
            <div className="flex justify-between items-center h-14 pl-5 pr-2 gap-2">

              {/* Logo (text only) */}
              <Link to="/" className="text-lg font-bold text-blue-600 dark:text-blue-400 tracking-wide shrink-0">
                Lanka<span className="text-amber-500 dark:text-amber-400">Find</span>
              </Link>

              {/* Center links — desktop only, mobile uses the hamburger panel below */}
              <div className="hidden md:flex items-center gap-1">
                <Link to="/lost" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition whitespace-nowrap shrink-0">{t('navLost')}</Link>
                <Link to="/found" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-black/5 dark:hover:bg-white/5 transition whitespace-nowrap shrink-0">{t('navFound')}</Link>
                <Link to="/map" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition whitespace-nowrap shrink-0">Map</Link>

                {isAuthenticated && (
                  <>
                    <Link to="/my-reports" className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition whitespace-nowrap shrink-0">{t('navMyReports')}</Link>
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

              {/* Right side actions — desktop only */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
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
                  className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-full px-3 py-1.5 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  🌐 {language === 'en' ? 'සිං' : 'EN'}
                </button>
              </div>

              {/* Mobile controls: unread dot + hamburger */}
              <div className="flex md:hidden items-center gap-2">
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
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300"
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

            {/* Mobile dropdown panel */}
            {mobileOpen && (
              <div className="md:hidden border-t border-gray-100 dark:border-slate-800 px-4 pb-4 pt-2 space-y-1">
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
                  <button
                    onClick={toggleTheme}
                    title="Toggle theme"
                    className="text-lg text-gray-500 dark:text-amber-400 border border-gray-200 dark:border-slate-700 rounded-full w-9 h-9 flex items-center justify-center"
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>
                  <button
                    onClick={toggleLanguage}
                    title="Switch language"
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-full px-3 py-1.5"
                  >
                    🌐 {language === 'en' ? 'සිංහල' : 'English'}
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Back-to-top button — fades in once the page has scrolled down */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Back to top"
          className="fixed bottom-6 right-6 z-[9999] w-11 h-11 rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}

export default Navbar;
