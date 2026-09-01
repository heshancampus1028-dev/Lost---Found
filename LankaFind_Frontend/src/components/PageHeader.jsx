import React from 'react';
import { motion } from 'framer-motion';

// Consistent glass/gradient header banner used at the top of every inner page,
// echoing the Home hero's look in a smaller, page-scoped form.
// accent: a Tailwind gradient pair, e.g. "from-red-600 to-orange-500"
function PageHeader({ icon, title, subtitle, accent = 'from-blue-600 to-blue-400' }) {
  return (
    <div className={`bg-gradient-to-r ${accent} relative overflow-hidden rounded-3xl shadow-lg mb-8`}>
      <div className="absolute inset-0 bg-black/10" />
      {/* faint decorative glow, echoes the Home hero's floating-chip motif without repeating it literally */}
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-7 sm:py-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-white/80 text-sm mt-1.5 font-normal">{subtitle}</p>}
      </motion.div>
    </div>
  );
}

export default PageHeader;
