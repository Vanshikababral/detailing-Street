'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const faqs = [
  {
    q: 'What is Paint Protection Film (PPF)?',
    a: 'Paint Protection Film (PPF) is a thick, self-healing thermoplastic urethane film applied to your car\'s painted surfaces. It protects against rock chips, scratches, bird droppings, UV damage, and road debris. Modern PPF is virtually invisible and can last 10+ years with proper care. At Detailing Street, we use premium brands like XPEL and SunTek for guaranteed results.',
  },
  {
    q: 'What is Ceramic Coating and how long does it last?',
    a: 'Ceramic Coating is a liquid polymer that chemically bonds with your car\'s factory paint to create a permanent, hydrophobic protective layer. It delivers incredible gloss depth, makes cleaning effortless, and resists UV fading, chemical etching, and light scratches. Our 9H ceramic coatings typically last 3–7 years depending on the product tier selected.',
  },
  {
    q: 'Is Window Tinting Film legal in India?',
    a: 'According to the Motor Vehicles Act and Supreme Court guidelines, the front windshield must allow at least 70% Visible Light Transmission (VLT), and side windows must allow at least 50% VLT. We strictly comply with all legal limits and can advise you on the best tint percentages for comfort and compliance. Our team ensures every installation passes RTO standards.',
  },
  {
    q: 'Which service is best for my car?',
    a: 'The best service depends on your goals: For maximum paint protection with a flawless finish — PPF is the gold standard. For long-lasting gloss and hydrophobic properties at a great value — Ceramic Coating. For a complete visual transformation — Coloured Wrap or Borophene Coating. For heat and UV protection — Tinting Film. We offer free consultations to recommend the ideal solution for your car, budget, and usage. Call us at 9115555035.',
  },
  {
    q: 'How long does a Ceramic Coating application take?',
    a: 'A full ceramic coating job typically takes 1–3 days depending on the vehicle size and required paint correction beforehand. We perform thorough paint decontamination, polishing, and surface prep before coating to ensure maximum bonding and longevity. Your car will need to stay dry for at least 24 hours post-application.',
  },
  {
    q: 'Do you offer a warranty on your services?',
    a: 'Yes! All our major services come with a warranty: PPF installations carry a 10-year manufacturer\'s warranty against yellowing, cracking, and peeling. Ceramic Coatings are warranted for 3–7 years based on the tier. Coloured Wraps have a 2-year warranty. We stand behind every job and will fix any issues within the warranty period at no cost.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section-padding" style={{ background: '#0D0D0D' }}>
      <div className="max-w-4xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-brand-red text-xs tracking-[0.3em] uppercase font-bold mb-3 block"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Got Questions?
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            FREQUENTLY ASKED
          </h2>
          <span className="red-line" />
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                open === i
                  ? 'border-brand-red/40 bg-brand-red/5'
                  : 'border-brand-black-border bg-brand-black-card hover:border-brand-red/20'
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
              >
                <span
                  className={`font-bold text-sm sm:text-base transition-colors duration-300 ${
                    open === i ? 'text-white' : 'text-white/80'
                  }`}
                  style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.03em' }}
                >
                  {faq.q}
                </span>
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    open === i ? 'bg-brand-red text-white rotate-45' : 'bg-white/5 text-white/40'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5">
                      <div className="w-full h-px bg-brand-red/20 mb-4" />
                      <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <p className="text-white/40 text-sm mb-4">Still have questions? We&apos;re happy to help.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:9115555035" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call: 9115555035
            </a>
            <a href="#booking" className="btn-outline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book a Free Consultation
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
