import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// The floating "things people lose" motif in the hero - each chip drifts
// independently with its own duration/delay so the cluster feels organic, not looped-in-sync.
const FLOATING_ITEMS = [
  { icon: '🔑', top: '18%', left: '10%', duration: 6, delay: 0 },
  { icon: '👛', top: '65%', left: '6%', duration: 7, delay: 0.6 },
  { icon: '📱', top: '22%', left: '85%', duration: 5.5, delay: 0.3 },
  { icon: '🎒', top: '70%', left: '88%', duration: 6.5, delay: 0.9 },
  { icon: '🪪', top: '42%', left: '92%', duration: 5, delay: 1.2 },
  { icon: '🕶️', top: '48%', left: '4%', duration: 6.8, delay: 1.5 },
];

function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Only the hero search bar's typed text is needed now - it hands off to
  // the Lost Items page's own search/filter instead of a feed on this page.
  const [searchTerm, setSearchTerm] = useState('');

  const goToSearch = () => {
    const query = searchTerm.trim();
    navigate(query ? `/lost?search=${encodeURIComponent(query)}` : '/lost');
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-950 transition-colors">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden pt-28 pb-40 px-4">
        {/* Floating item chips */}
        {FLOATING_ITEMS.map((f, i) => (
          <motion.div
            key={i}
            className="glass-panel absolute w-14 h-14 rounded-2xl hidden sm:flex items-center justify-center text-2xl"
            style={{ top: f.top, left: f.left }}
            animate={{ y: [0, -16, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {f.icon}
          </motion.div>
        ))}

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-white/80 mb-6 tracking-wide"
          >
            🔎 Lose it. Find it. Get it back.
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-bold text-white leading-tight mb-5"
          >
            {t('homeWelcome')}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-amber-300 bg-clip-text text-transparent">
              LankaFind
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/70 text-lg max-w-lg mx-auto mb-9"
          >
            {t('homeSubtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/lost')}
              className="glass-panel text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2"
            >
              🔍 {t('homeLostCardTitle') || 'Report Lost'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/found')}
              className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              ✅ {t('homeFoundCardTitle') || 'Report Found'}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Floating glass search bar, overlapping the hero's bottom edge */}
      <div className="relative z-20 -mt-16 px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl dark:shadow-black/40 p-2.5 flex gap-2"
        >
          <span className="pl-3 flex items-center text-gray-400 dark:text-gray-500">🔎</span>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goToSearch()}
            className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
          />
          <button
            onClick={goToSearch}
            className="bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-400 transition"
          >
            {t('Search') || 'Search'}
          </button>
        </motion.div>
      </div>

    </div>
  );
}

export default Home;
