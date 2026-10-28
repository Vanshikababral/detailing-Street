'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{
            transform: `scale(1.1) translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.1}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
          {/* Fallback image if video fails */}
          <Image
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=85&auto=format"
            alt="Premium sports car hero"
            fill
            priority
            className="object-cover object-center"
          />
        </video>

        {/* Dark overlays — thoda light */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/40" />
        {/* Red glow at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-brand-red/10 blur-3xl rounded-full" />
      </div>

      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Sound toggle button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={toggleMute}
        className="absolute top-24 right-6 z-20 w-10 h-10 rounded-full glass-red flex items-center justify-center text-white hover:bg-brand-red/40 transition-all duration-300"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </motion.button>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 glass-red px-4 py-2 rounded-full mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
          <span className="text-white/80 text-xs sm:text-sm tracking-widest uppercase font-semibold"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Ludhiana&apos;s #1 Premium Detailing Studio
          </span>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
          className="flex justify-center mb-2"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(ellipse, rgba(227,28,28,0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
                transform: 'scale(1.3)',
              }}
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                filter: 'drop-shadow(0 0 30px rgba(227,28,28,0.7)) drop-shadow(0 0 60px rgba(227,28,28,0.3))',
              }}
            >
              <Image
                src="/images/logo.png"
                alt="Detailing Street Ludhiana"
                width={420}
                height={160}
                className="object-contain w-64 sm:w-80 md:w-96 lg:w-[420px]"
                priority
              />
            </motion.div>
          </div>
        </motion.div>

        {/* LUDHIANA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-4"
        >
          <span
            className="block text-white/30 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.35em]"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            LUDHIANA
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-white/60 text-base sm:text-lg md:text-xl mb-4 tracking-wider"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          Premium Car Care &amp; Protection Studio
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-brand-red font-bold text-lg sm:text-xl md:text-2xl tracking-[0.4em] mb-10 uppercase"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          Protect. Enhance. Transform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a href="#booking" className="btn-primary text-sm sm:text-base px-8 py-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Appointment
          </a>
          <a href="#services" className="btn-outline text-sm sm:text-base px-8 py-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Explore Services
          </a>
          <a
            href="tel:9115555035"
            className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm sm:text-base transition-colors duration-300"
            style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            CALL NOW: 9115555035
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden"
        >
          {[
            { value: '500+', label: 'Cars Detailed' },
            { value: '5★', label: 'Google Rating' },
            { value: '7+', label: 'Services Offered' },
            { value: '2', label: 'Studio Locations' },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/60 backdrop-blur-sm px-6 py-5 text-center">
              <p className="text-brand-red text-2xl md:text-3xl font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {stat.value}
              </p>
              <p className="text-white/40 text-xs uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-brand-red to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
