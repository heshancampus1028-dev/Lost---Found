import React from 'react';
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

  return (
    <div className="bg-gray-50 dark:bg-slate-950 transition-colors">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden pt-28 pb-20 px-4">
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

      {/* ── ABOUT / HOW IT WORKS ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">
            How LankaFind Works
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            A free, community-driven platform to reunite people with the things they've
            lost — no phone number needed, no middleman, just a simple report and a match.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: '📝',
              title: 'Report It',
              desc: 'Lost or found something? Post the details, a photo, and where it happened - it only takes a minute.',
              accent: 'from-red-500 to-orange-400'
            },
            {
              icon: '🔍',
              title: 'Get Matched',
              desc: 'LankaFind automatically compares new reports against existing ones and suggests likely matches for you.',
              accent: 'from-blue-500 to-indigo-400'
            },
            {
              icon: '🤝',
              title: 'Reunite',
              desc: 'Message the other person right on LankaFind, verify ownership, and get your item back safely.',
              accent: 'from-emerald-500 to-teal-400'
            }
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-6 text-center"
            >
              <div
                className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center text-2xl shadow-md`}
              >
                {step.icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;
