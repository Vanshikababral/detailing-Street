import Image from 'next/image';

const services = [
  'Paint Protection Film (PPF)',
  'Ceramic Coating',
  'Premium Washing',
  'Car Accessories',
  'Coloured Wrap',
  'Borophene Coating',
  'Tinting Film',
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#060606] border-t border-white/5">
      {/* Red accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-brand-red to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-14 h-14">
                <Image
                  src="/images/logo.png"
                  alt="Detailing Street Ludhiana"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span
                  className="block text-white font-bold text-base"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  DETAILING STREET
                </span>
                <span className="block text-brand-red text-xs tracking-widest uppercase">
                  Ludhiana
                </span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Ludhiana&apos;s most trusted premium automotive care studio. We offer world-class protection, aesthetic transformation, and care for every vehicle.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.instagram.com/detailingstreet_modeltownlud"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 group"
              >
                <svg className="w-5 h-5 group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="text-sm">@detailingstreet_modeltownlud</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3
              className="text-white font-bold text-sm tracking-widest uppercase mb-5"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Services
            </h3>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="text-white/50 hover:text-brand-red text-sm transition-colors duration-300 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-red flex-shrink-0" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-white font-bold text-sm tracking-widest uppercase mb-5"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Contact
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Phone</p>
                <a
                  href="tel:9115555035"
                  className="text-white/70 hover:text-brand-red transition-colors duration-300 text-sm font-semibold"
                >
                  +91 91155 55035
                </a>
              </div>
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Email</p>
                <a
                  href="mailto:sarvottamchandel1509@gmail.com"
                  className="text-white/70 hover:text-brand-red transition-colors duration-300 text-sm break-all"
                >
                  sarvottamchandel1509@gmail.com
                </a>
              </div>
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Locations</p>
                <p className="text-white/60 text-sm leading-relaxed">
                  504-R Model Town<br />
                  Opp. Krishna Hospital<br />
                  <span className="text-white/40">Also at: Near Suffian Chowk</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs text-center">
            © {year} Detailing Street Ludhiana. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
