'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Locations', href: '#locations' },
  { label: 'Contact', href: '#booking' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* Logo */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16">
            <Image
              src="/images/logo.png"
              alt="Detailing Street Ludhiana"
              fill
              className="object-contain"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(227,28,28,0.6))',
              }}
            />
          </div>
          <div className="hidden sm:block">
            <span
              className="block text-white font-bold text-sm leading-tight"
              style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.05em' }}
            >
              DETAILING STREET
            </span>
            <span className="block text-red-500 text-xs tracking-widest uppercase">
              Ludhiana
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors duration-300 relative group"
              style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em' }}
            >
              {link.label.toUpperCase()}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-4">
          <a href="#booking" className="btn-primary hidden sm:inline-flex text-xs py-2.5 px-5">
            Book Now
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-white/80 hover:text-red-500 text-base font-semibold tracking-widest uppercase transition-colors duration-300 py-2 border-b border-white/5"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {link.label}
                </a>
              ))}
              <a href="tel:9115555035" className="btn-primary justify-center mt-2">
                Call Now: 9115555035
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
