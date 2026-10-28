'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const services = [
  {
    id: 1,
    title: 'Paint Protection Film',
    abbr: 'PPF',
    description: 'Military-grade self-healing film that shields your paint from rock chips, scratches, UV damage, and road debris — preserving factory finish for years.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80&auto=format',
    badge: 'Most Popular',
    badgeColor: 'bg-brand-red',
    features: ['Self-Healing Technology', 'UV Protection', '10 Year Warranty'],
  },
  {
    id: 2,
    title: 'Ceramic Coating',
    abbr: 'CC',
    description: 'Nano-ceramic liquid polymer creates a permanent hydrophobic shield over your paint, delivering mirror-like gloss and effortless cleaning for years.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format',
    badge: 'Best Value',
    badgeColor: 'bg-amber-500',
    features: ['9H Hardness', 'Hydrophobic', '5 Year Protection'],
  },
  {
    id: 3,
    title: 'Premium Washing',
    abbr: 'PW',
    description: 'Professional hand wash with pH-neutral shampoos, clay bar decontamination, and paint-safe drying techniques for a showroom-quality finish every time.',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&q=80&auto=format',
    badge: null,
    badgeColor: '',
    features: ['Clay Bar Treatment', 'Hand Polish', 'Interior Detailing'],
  },
  {
    id: 4,
    title: 'Car Accessories',
    abbr: 'CA',
    description: 'Premium OEM and aftermarket accessories to elevate your driving experience — from seat covers and floor mats to LED lighting and tech upgrades.',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80&auto=format',
    badge: null,
    badgeColor: '',
    features: ['OEM Quality', 'Custom Fitment', 'Expert Installation'],
  },
  {
    id: 5,
    title: 'Coloured Wrap',
    abbr: 'CW',
    description: 'Transform your car\'s appearance with premium vinyl wraps — available in hundreds of finishes including matte, gloss, satin, chrome, and custom prints.',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80&auto=format',
    badge: 'Trending',
    badgeColor: 'bg-purple-600',
    features: ['300+ Color Options', 'Reversible', '3M/XPEL Films'],
  },
  {
    id: 6,
    title: 'Borophene Coating',
    abbr: 'BC',
    description: 'Next-generation graphene-enhanced borophene coating offers superior thermal resistance, scratch protection, and an ultra-deep gloss beyond traditional ceramics.',
    image: 'https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=600&q=80&auto=format',
    badge: 'Premium',
    badgeColor: 'bg-blue-600',
    features: ['Graphene Enhanced', 'Anti-Static', '7 Year Protection'],
  },
  {
    id: 7,
    title: 'Tinting Film',
    abbr: 'TF',
    description: 'Precision-cut ceramic window tint reduces heat, UV rays, and glare by up to 99% while keeping your cabin cool and your privacy intact.',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&q=80&auto=format',
    badge: null,
    badgeColor: '',
    features: ['99% UV Rejection', 'Heat Reduction', 'Legal Compliance'],
  },
];

export default function ServicesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="services" className="section-padding bg-brand-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Section header */}
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
            What We Offer
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            OUR SERVICES
          </h2>
          <span className="red-line" />
          <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base mt-4">
            From factory-grade protection to aesthetic transformation — we offer every service your vehicle deserves.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className={`group relative bg-brand-black-card border border-brand-black-border rounded-xl overflow-hidden card-hover cursor-pointer ${
                service.id === 1 ? 'sm:col-span-2' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black-card via-transparent to-transparent" />
                {/* Badge */}
                {service.badge && (
                  <span className={`absolute top-3 right-3 ${service.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full tracking-wide`}
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {service.badge}
                  </span>
                )}
                {/* Abbr */}
                <div className="absolute top-3 left-3 w-10 h-10 rounded-lg glass flex items-center justify-center">
                  <span className="text-brand-red font-black text-xs" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {service.abbr}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3
                  className="text-white font-bold text-base mb-2 group-hover:text-brand-red transition-colors duration-300"
                  style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.03em' }}
                >
                  {service.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {service.features.map((f) => (
                    <span
                      key={f}
                      className="text-xs text-white/40 border border-white/10 px-2 py-0.5 rounded-full"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <a
                  href="#booking"
                  className="inline-flex items-center gap-2 text-brand-red text-sm font-bold hover:gap-3 transition-all duration-300"
                  style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}
                >
                  BOOK THIS SERVICE
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              {/* Bottom red line on hover */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
