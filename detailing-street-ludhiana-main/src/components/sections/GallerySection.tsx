'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const categories = ['All', 'Studio', 'PPF', 'Ceramic', 'Wrap'];

const galleryItems = [
  {
    id: 1,
    category: 'Studio',
    title: 'Detailing Street Studio',
    image: '/images/gallery/studio1.png',
    tag: 'Our Studio',
  },
  {
    id: 2,
    category: 'Studio',
    title: 'Premium Work in Progress',
    image: '/images/gallery/studio2.png',
    tag: 'In Progress',
  },
  {
    id: 3,
    category: 'PPF',
    title: 'PPF Application',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format',
    tag: 'Full Body PPF',
  },
  {
    id: 4,
    category: 'Ceramic',
    title: 'Ceramic Coating',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format',
    tag: '9H Ceramic',
  },
  {
    id: 5,
    category: 'Wrap',
    title: 'Matte Black Full Wrap',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format',
    tag: 'Matte Vinyl',
  },
  {
    id: 6,
    category: 'Ceramic',
    title: 'Graphene Ceramic',
    image: 'https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=800&q=80&auto=format',
    tag: 'Graphene Pro',
  },
];

const videos = [
  { src: '/videos/IMG_1036.mov', poster: '' },
  { src: '/videos/IMG_1149.mov', poster: '' },
];

// FIX: lazy video thumbnail — only plays in lightbox, not autoplay on page
function VideoThumb({ src, onClick }: { src: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group rounded-2xl overflow-hidden border border-brand-black-border hover:border-brand-red/40 transition-all duration-300 bg-brand-black-card"
      style={{ width: '180px', height: '320px' }}
    >
      {/* Static thumbnail placeholder instead of autoplay video */}
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-black-card to-black/80">
        <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <span className="text-white/50 text-xs">Tap to play</span>
      </div>
    </div>
  );
}

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxImg, setLightboxImg] = useState<null | { image: string; title: string }>(null);
  const [lightboxVideo, setLightboxVideo] = useState<null | string>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const filtered =
    activeCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="section-padding bg-brand-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto" ref={ref}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-brand-red text-xs tracking-[0.3em] uppercase font-bold mb-3 block"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Our Work
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}>
            RECENT WORK
          </h2>
          <span className="red-line" />
          <p className="text-white/50 max-w-md mx-auto text-sm mt-4">
            Every project is a masterpiece. Explore our portfolio of premium automotive transformations.
          </p>
        </motion.div>

        {/* Videos — Portrait/Reel Style — FIX: no autoplay, click-to-play in lightbox */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-5 mb-12"
        >
          {videos.map((video, i) => (
            <VideoThumb key={i} src={video.src} onClick={() => setLightboxVideo(video.src)} />
          ))}
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-brand-red text-white shadow-red-glow-sm'
                  : 'glass text-white/50 hover:text-white hover:border-brand-red/30'
              }`}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group relative rounded-xl overflow-hidden cursor-pointer"
                style={{ aspectRatio: '4/3' }}
                onClick={() => setLightboxImg({ image: item.image, title: item.title })}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-brand-red text-xs font-bold tracking-widest uppercase mb-1">{item.tag}</span>
                  <p className="text-white font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.title}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="text-center mt-10">
          <a
            href="https://www.instagram.com/reel/DaK4abqPO89/?igsh=MTdsc2xvNDR5Z3YyNg=="
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            View More on Instagram
          </a>
        </div>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxImg(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="relative rounded-xl overflow-hidden"
              style={{ maxHeight: '90vh', maxWidth: '90vw' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImg.image}
                alt={lightboxImg.title}
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] w-auto"
              />
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-brand-red transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Lightbox — fullscreen portrait */}
      <AnimatePresence>
        {lightboxVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ height: '85vh', aspectRatio: '9/16' }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={lightboxVideo}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setLightboxVideo(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-brand-red transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
