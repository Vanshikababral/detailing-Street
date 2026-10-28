'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

const stats = [
  {
    value: 500,
    suffix: '+',
    label: 'Cars Protected',
    desc: 'Trusted by hundreds of happy vehicle owners across Ludhiana',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    value: 5,
    suffix: '★',
    label: 'Google Rating',
    desc: 'Consistently rated 5 stars for quality, precision & professionalism',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    value: 7,
    suffix: '+',
    label: 'Premium Services',
    desc: 'Full-range detailing from PPF to Borophene under one roof',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    value: 2,
    suffix: '',
    label: 'Studio Locations',
    desc: 'Model Town & near Suffian Chowk for your convenience',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const reasons = [
  {
    title: 'Premium International Products',
    desc: 'We exclusively use globally certified products from 3M, XPEL, SunTek, and other world-leading brands.',
  },
  {
    title: 'Certified Expert Technicians',
    desc: 'Every job is handled by trained, experienced professionals who treat your vehicle like their own.',
  },
  {
    title: 'Advanced Protection Technology',
    desc: 'From self-healing PPF to graphene-enhanced Borophene — we stock the most advanced protection solutions available.',
  },
  {
    title: '100% Customer Satisfaction',
    desc: 'We don\'t close a job until you\'re completely satisfied. Our work speaks for itself through our reviews.',
  },
];

export default function WhyChooseUs() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section-padding relative overflow-hidden" style={{ background: '#0D0D0D' }}>
      {/* Diagonal red accent */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-red via-brand-red/50 to-transparent" />

      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="text-brand-red text-xs tracking-[0.3em] uppercase font-bold mb-3 block"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            The Difference
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            WHY CHOOSE US
          </h2>
          <span className="red-line" />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass border border-brand-black-border rounded-xl p-6 text-center group hover:border-brand-red/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mx-auto mb-4 group-hover:bg-brand-red/20 transition-colors duration-300">
                {stat.icon}
              </div>
              <div
                className="text-4xl font-black text-brand-red mb-1"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {inView && (
                  <CountUp end={stat.value} duration={2.5} delay={i * 0.2} />
                )}
                {stat.suffix}
              </div>
              <p className="text-white font-bold text-sm mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>
                {stat.label.toUpperCase()}
              </p>
              <p className="text-white/40 text-xs leading-relaxed">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
              className="flex gap-4 p-6 bg-brand-black-card border border-brand-black-border rounded-xl hover:border-brand-red/30 transition-all duration-300 group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-red flex items-center justify-center mt-0.5">
                <span className="text-white font-black text-base" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-2 group-hover:text-brand-red transition-colors duration-300"
                  style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em' }}>
                  {reason.title.toUpperCase()}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{reason.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
