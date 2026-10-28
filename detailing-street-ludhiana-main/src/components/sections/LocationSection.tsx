'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const locations = [
  {
    id: 1,
    name: 'Detailing Street - Model Town',
    address: '504-R Model Town',
    landmark: 'Opposite Krishna Hospital',
    city: 'Ludhiana, Punjab 141002',
    phone: '9115555035',
    hours: 'Mon-Sat: 9:00 AM - 8:00 PM',
    mapUrl: 'https://www.google.com/maps/@30.8883438,75.8450623,17z',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3431.2!2d75.8424874!3d30.8883438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzDCsDUzJzE4LjAiTiA3NcKwNTAnNDIuMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    badge: 'Main Studio',
    badgeColor: 'bg-red-600',
    icon: '🏢',
  },
  {
    id: 2,
    name: 'Detailing doctorz - Industrial Area',
    address: '66 Industrial Area A',
    landmark: 'Near Suffian Chowk, Adjoint Rocky Motor',
    city: 'Ludhiana, Punjab 141003',
    phone: '9115555035',
    hours: 'Mon-Sat: 9:00 AM - 8:00 PM',
    mapUrl: 'https://maps.app.goo.gl/JJffWk9Mt27uWyvV8',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.8!2d75.8350!3d30.8950!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s66+Industrial+Area+A+Ludhiana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    badge: 'Branch Studio',
    badgeColor: 'bg-white/10',
    icon: '🏭',
  },
];

export default function LocationSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="locations" className="section-padding" style={{ background: '#0D0D0D' }}>
      <div className="max-w-7xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span
            className="text-red-500 text-xs tracking-widest uppercase font-bold mb-3 block"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Find Us
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            OUR LOCATIONS
          </h2>
          <span className="red-line" />
          <p className="text-white/50 max-w-md mx-auto text-sm mt-4">
            Two premium studios in Ludhiana, ready to serve you with the finest automotive care.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-red-600/30 transition-all duration-300 group"
            >
              <div className="relative h-64 overflow-hidden bg-neutral-800">
                <iframe
                  src={loc.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={loc.name}
                />
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`${loc.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    {loc.badge}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="text-2xl mt-0.5">{loc.icon}</div>
                  <div>
                    <h3
                      className="text-white font-bold group-hover:text-red-500 transition-colors duration-300"
                      style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem', letterSpacing: '0.02em' }}
                    >
                      {loc.name}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">{loc.address}</p>
                    <p className="text-white/40 text-sm">{loc.landmark}</p>
                    <p className="text-red-500 text-xs mt-1 font-bold tracking-wide">{loc.city}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {loc.hours}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {loc.phone}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/50">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {loc.address}, {loc.landmark}
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex-1 justify-center py-3 text-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Get Directions
                  </a>
                  <a
                    href={`tel:${loc.phone}`}
                    className="btn-outline flex-1 justify-center py-3 text-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Now
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
