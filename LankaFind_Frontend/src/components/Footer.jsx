import React from 'react';
import { useLanguage } from '../context/LanguageContext';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-amber-500/20 py-6 mt-12 transition-colors relative">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-amber-400" />
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="font-display font-semibold text-gray-700 dark:text-gray-200 mb-1">
          Lanka<span className="text-amber-500 dark:text-amber-400">Find</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} LankaFind. {t('footerRights')}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
