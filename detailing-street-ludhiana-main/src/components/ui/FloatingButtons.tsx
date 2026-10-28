'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function FloatingButtons() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col gap-3">
      {/* Directions */}
      <motion.a
        href="https://maps.google.com/?q=Model+Town+Ludhiana+Punjab"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full glass-red flex items-center justify-center shadow-red-glow transition-all duration-300 pulse-glow"
        aria-label="Get Directions"
        title="Get Directions"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </motion.a>

      {/* Call Now */}
      <motion.a
        href="tel:9115555035"
        initial={{ opacity: 0, scale: 0, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand-red flex items-center justify-center shadow-red-glow transition-all duration-300 pulse-glow"
        aria-label="Call Now"
        title="Call: 9115555035"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </motion.a>
    </div>
  );
}
