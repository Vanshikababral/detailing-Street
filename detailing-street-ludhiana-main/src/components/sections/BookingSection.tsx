'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import toast from 'react-hot-toast';

const services = [
  'Paint Protection Film (PPF)',
  'Ceramic Coating',
  'Premium Washing',
  'Car Accessories',
  'Coloured Wrap',
  'Borophene Coating',
  'Tinting Film',
  'Other / Consultation',
];

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM',
];

interface FormState {
  customerName: string;
  phoneNumber: string;
  email: string;
  carModel: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

const initialForm: FormState = {
  customerName: '',
  phoneNumber: '',
  email: '',
  carModel: '',
  service: '',
  preferredDate: '',
  preferredTime: '',
  message: '',
};

function DarkSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          background: '#0f0f0f',
          color: value ? '#ffffff' : 'rgba(255,255,255,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
        }}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(227,28,28,0.1)] cursor-pointer"
      >
        <option value="" style={{ background: '#0f0f0f', color: 'rgba(255,255,255,0.3)' }}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt}
            value={opt}
            style={{ background: '#0f0f0f', color: '#ffffff' }}
          >
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default function BookingSection() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!form.customerName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!form.phoneNumber.trim() || !/^[6-9]\d{9}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!form.service) {
      toast.error('Please select a service.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Booking ${data.bookingId} Submitted! Our team will contact you shortly.`,
          {
            duration: 6000,
            style: {
              background: '#0f2a1a',
              border: '1px solid rgba(34,197,94,0.4)',
              color: '#fff',
            },
          }
        );
        setForm(initialForm);
      } else {
        toast.error(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please call us at 9115555035.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const inputStyle = {
    background: '#0f0f0f',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff',
  };

  return (
    <section id="booking" className="section-padding bg-brand-black relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 bg-glow-radial pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(227,28,28,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(227,28,28,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span
            className="text-brand-red text-xs tracking-[0.3em] uppercase font-bold mb-3 block"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Reserve Your Slot
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            BOOK APPOINTMENT
          </h2>
          <span className="red-line" />
          <p className="text-white/50 max-w-lg mx-auto text-sm mt-4">
            Fill in your details below and our team will reach out to confirm your booking within 2 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="glass border border-brand-black-border rounded-2xl p-6 sm:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label
                className="block text-white/60 text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Full Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={inputStyle}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 placeholder:text-white/20 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(227,28,28,0.1)]"
              />
            </div>

            <div>
              <label
                className="block text-white/60 text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                style={inputStyle}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 placeholder:text-white/20 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(227,28,28,0.1)]"
              />
            </div>

            <div>
              <label
                className="block text-white/60 text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={inputStyle}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 placeholder:text-white/20 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(227,28,28,0.1)]"
              />
            </div>

            <div>
              <label
                className="block text-white/60 text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Car Model
              </label>
              <input
                type="text"
                name="carModel"
                value={form.carModel}
                onChange={handleChange}
                placeholder="e.g. Hyundai Creta 2023"
                style={inputStyle}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 placeholder:text-white/20 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(227,28,28,0.1)]"
              />
            </div>

            <div>
              <label
                className="block text-white/60 text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Service Required *
              </label>
              <DarkSelect
                name="service"
                value={form.service}
                onChange={handleChange}
                options={services}
                placeholder="Select a service"
              />
            </div>

            <div>
              <label
                className="block text-white/60 text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Preferred Date
              </label>
              <input
                type="date"
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                min={today}
                style={{
                  ...inputStyle,
                  colorScheme: 'dark',
                }}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(227,28,28,0.1)]"
              />
            </div>

            <div>
              <label
                className="block text-white/60 text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Preferred Time
              </label>
              <DarkSelect
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleChange}
                options={timeSlots}
                placeholder="Select a time slot"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                className="block text-white/60 text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Additional Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Any specific requirements or questions..."
                rows={4}
                style={inputStyle}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 placeholder:text-white/20 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(227,28,28,0.1)] resize-none"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1 sm:flex-none sm:min-w-[240px] justify-center py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Submit Booking Request
                </>
              )}
            </button>
            <p className="text-white/30 text-xs text-center sm:text-left">
              Or call us directly at{' '}
              <a href="tel:9115555035" className="text-brand-red font-bold hover:underline">
                9115555035
              </a>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-6 justify-center">
            {[
              { icon: '🔒', text: 'Data Secure' },
              { icon: '⚡', text: 'Quick Response' },
              { icon: '✅', text: 'No Spam' },
              { icon: '📞', text: 'Team Confirms Within 2 Hrs' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-white/30 text-xs">
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
