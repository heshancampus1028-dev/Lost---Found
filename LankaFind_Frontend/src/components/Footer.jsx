import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import QRPoster from './QRPoster';

// Pages where an item-report form is the main focus - the footer is hidden here
// so it doesn't crowd the form or distract from finishing the report.
const HIDDEN_ON = ['/lost/report', '/found/report'];

function Footer() {
  const { t } = useLanguage();
  const location = useLocation();

  if (HIDDEN_ON.includes(location.pathname)) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-gray-300 mt-12 relative">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <p className="font-display text-xl font-bold text-white mb-3">
            Lanka<span className="text-amber-400">Find</span>
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            {t('footerTagline') || 'Helping reunite people with their lost belongings across Sri Lanka. Report lost or found items easily.'}
          </p>
          <div className="flex gap-3">
            {[
              { label: 'Facebook', path: 'M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z' },
              { label: 'Twitter', path: 'M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 00-7 3.7A11.6 11.6 0 013 4.9a4.1 4.1 0 001.3 5.5c-.6 0-1.2-.2-1.7-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 01-1.8.1c.5 1.6 2 2.8 3.8 2.8A8.3 8.3 0 012 18.4a11.6 11.6 0 006.3 1.9c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2z' },
              { label: 'Instagram', path: 'M12 2c2.7 0 3.1 0 4.1.1 1 .1 1.7.2 2.3.5.6.3 1.1.6 1.6 1.1.5.5.8 1 1.1 1.6.3.6.4 1.3.5 2.3.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c-.1 1-.2 1.7-.5 2.3a4.6 4.6 0 01-1.1 1.6c-.5.5-1 .8-1.6 1.1-.6.3-1.3.4-2.3.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1-.1-1.7-.2-2.3-.5a4.6 4.6 0 01-1.6-1.1 4.6 4.6 0 01-1.1-1.6c-.3-.6-.4-1.3-.5-2.3C2 15.1 2 14.7 2 12s0-3.1.1-4.1c.1-1 .2-1.7.5-2.3.3-.6.6-1.1 1.1-1.6.5-.5 1-.8 1.6-1.1.6-.3 1.3-.4 2.3-.5C8.9 2 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z' },
              { label: 'LinkedIn', path: 'M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5V9h3zM6.5 7.7A1.7 1.7 0 118.2 6a1.7 1.7 0 01-1.7 1.7zM19 19h-3v-4.8c0-1.1 0-2.6-1.6-2.6s-1.9 1.3-1.9 2.5V19h-3V9h2.9v1.3a3.1 3.1 0 012.8-1.6c3 0 3.6 2 3.6 4.6z' }
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-display font-semibold mb-3 pb-1 border-b-2 border-emerald-400 inline-block">
            Quick Links
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { label: t('navLost') || 'Lost Items', to: '/lost' },
              { label: t('navFound') || 'Found Items', to: '/found' },
              { label: 'Map', to: '/map' },
              { label: 'My Reports', to: '/my-reports' }
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition">
                  <span>›</span> {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-white font-display font-semibold mb-3 pb-1 border-b-2 border-amber-400 inline-block">
            Categories
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {['Electronics', 'Documents', 'Bags & Wallets', 'Personal Items'].map((c) => (
              <li key={c}>
                <Link
                  to={`/lost?category=${encodeURIComponent(c)}`}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-amber-400 transition"
                >
                  <span>›</span> {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Scan to report */}
        <div>
          <h3 className="text-white font-display font-semibold mb-3 pb-1 border-b-2 border-blue-400 inline-block">
            Scan &amp; Report
          </h3>
          <div className="mt-3">
            <QRPoster
              url={window.location.origin}
              subtitle="Scan to report it on LankaFind"
              accentColor="#2563eb"
              compact
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} LankaFind. {t('footerRights')}
          </p>
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
