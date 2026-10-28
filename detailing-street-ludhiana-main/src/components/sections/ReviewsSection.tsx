'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const GOOGLE_REVIEW_LINK = 'https://share.google/uahFugmLxLlofKX7o';

const reviews = [
  {
    id: 1,
    name: 'Varinder',
    rating: 5,
    date: 'Just now',
    review: 'Best PPF service ever in Ludhiana, must go, best staff and quality, reasonable prices.',
    initials: 'V',
    color: 'bg-orange-500',
  },
  {
    id: 2,
    name: 'Gourav Bhola',
    rating: 5,
    date: '56 minutes ago',
    review: 'Great work, fully satisfied.',
    initials: 'GB',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    name: '4627 Shubham Dhawan',
    rating: 5,
    date: '23 hours ago',
    review: 'Best in Ludhiana, must visit.',
    initials: 'SD',
    color: 'bg-green-600',
  },
  {
    id: 4,
    name: 'Hitanshu Sharma',
    rating: 5,
    date: '23 hours ago',
    review: 'Very good service.',
    initials: 'HS',
    color: 'bg-purple-600',
  },
  {
    id: 5,
    name: 'Ashish Arora',
    rating: 5,
    date: '2 days ago',
    review: 'Best work in Ludhiana, must visit.',
    initials: 'AA',
    color: 'bg-red-600',
  },
  {
    id: 6,
    name: 'Sakshi Diwanker',
    rating: 5,
    date: '3 days ago',
    review: 'I have done my car washing from here, best service they give all the time.',
    initials: 'SD',
    color: 'bg-pink-600',
  },
  {
    id: 7,
    name: 'Gentlemen',
    rating: 5,
    date: '3 days ago',
    review: 'I got my Bolero PPF done here, best quality, reasonable price. I love their work and cooperation.',
    initials: 'G',
    color: 'bg-yellow-600',
  },
  {
    id: 8,
    name: 'Saini Akshay',
    rating: 5,
    date: '3 days ago',
    review: 'I got my bike PPF from here, best quality and good staff, very cooperative. Must visit here!',
    initials: 'SA',
    color: 'bg-teal-600',
  },
  {
    id: 9,
    name: 'Tarun Chandel',
    rating: 5,
    date: '6 days ago',
    review: 'Best work ever. I have got my Creta PPF from here, best quality and price. Must visit.',
    initials: 'TC',
    color: 'bg-indigo-600',
  },
  {
    id: 10,
    name: 'Sarvottam Chandel',
    rating: 5,
    date: '6 days ago',
    review: 'Excellent detailing studio in Ludhiana. Top quality work with premium products.',
    initials: 'SC',
    color: 'bg-brand-red',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'star-filled' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const [current, setCurrent] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const visible = 3;
  const maxIndex = reviews.length - visible;
  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  return (
    <section id="reviews" className="section-padding bg-brand-black relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-radial pointer-events-none" />
      <div className="max-w-7xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <span className="text-brand-red text-xs tracking-[0.3em] uppercase font-bold mb-3 block"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Happy Customers
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}>
            GOOGLE REVIEWS
          </h2>
          <span className="red-line" />

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="text-center">
              <p className="text-6xl font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>5.0</p>
              <StarRating rating={5} />
              <p className="text-white/40 text-xs mt-1">Based on 10 Google Reviews</p>
            </div>
            <div className="h-16 w-px bg-white/10" />
            <a
              href={GOOGLE_REVIEW_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm py-2.5 px-5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Write a Review
            </a>
          </div>
        </motion.div>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-5"
            animate={{ x: `calc(-${current * (100 / visible)}% - ${current * 20 / visible}px)` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08 }}
                className="flex-shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.33%-14px)] bg-brand-black-card border border-brand-black-border rounded-xl p-6 hover:border-brand-red/30 transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{review.name}</p>
                      <p className="text-white/30 text-xs">{review.date}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  </svg>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-white/60 text-sm leading-relaxed mt-3">&ldquo;{review.review}&rdquo;</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <button onClick={prev} disabled={current === 0}
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-red/40 disabled:opacity-30 transition-all duration-300">
            ←
          </button>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${current === i ? 'bg-brand-red w-6' : 'bg-white/20'}`} />
          ))}
          <button onClick={next} disabled={current === maxIndex}
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-red/40 disabled:opacity-30 transition-all duration-300">
            →
          </button>
        </div>

        <div className="text-center mt-8">
          <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Read All Google Reviews
          </a>
        </div>
      </div>
    </section>
  );
}
