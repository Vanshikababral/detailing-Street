import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

export const metadata: Metadata = {
  title: {
    default: 'Detailing Street Ludhiana | Premium Car Detailing & PPF Studio',
    template: '%s | Detailing Street Ludhiana',
  },
  description:
    'Ludhiana\'s #1 premium automotive detailing studio. Expert Paint Protection Film (PPF), Ceramic Coating, Car Wrapping, Window Tinting & more. Two convenient locations in Model Town & near Suffian Chowk.',
  keywords: [
    'car detailing Ludhiana',
    'ceramic coating Ludhiana',
    'PPF Ludhiana',
    'paint protection film Ludhiana',
    'car wrapping Ludhiana',
    'tinting film Ludhiana',
    'car accessories Ludhiana',
    'borophene coating',
    'coloured wrap Ludhiana',
    'premium car wash Ludhiana',
    'auto detailing Punjab',
    'detailing street',
    'model town Ludhiana detailing',
  ],
  authors: [{ name: 'Detailing Street Ludhiana' }],
  creator: 'Detailing Street Ludhiana',
  publisher: 'Detailing Street Ludhiana',
  metadataBase: new URL('https://detailingstreetludhiana.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://detailingstreetludhiana.com',
    siteName: 'Detailing Street Ludhiana',
    title: 'Detailing Street Ludhiana | Premium Car Detailing & PPF Studio',
    description:
      'Experience world-class car care at Ludhiana\'s most premium auto detailing studio. PPF, Ceramic Coating, Wraps, Tinting & more.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Detailing Street Ludhiana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Detailing Street Ludhiana | Premium Car Detailing',
    description: 'Ludhiana\'s #1 premium automotive detailing studio.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  name: 'Detailing Street Ludhiana',
  description: 'Premium automotive detailing studio offering PPF, Ceramic Coating, Car Wrapping, Tinting Film, and more.',
  url: 'https://detailingstreetludhiana.com',
  telephone: '+919115555035',
  email: 'sarvottamchandel1509@gmail.com',
  sameAs: [
    'https://www.instagram.com/detailingstreet_modeltownlud',
  ],
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: '504-R Model Town, Opposite Krishna Hospital',
      addressLocality: 'Ludhiana',
      addressRegion: 'Punjab',
      postalCode: '141002',
      addressCountry: 'IN',
    },
  ],
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '30.9010',
    longitude: '75.8573',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00',
    },
  ],
  priceRange: '₹₹₹',
  servesCuisine: 'Automotive Detailing',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Detailing Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Paint Protection Film (PPF)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ceramic Coating' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Premium Car Washing' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Coloured Car Wrap' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Window Tinting Film' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Borophene Coating' } },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#E31C1C" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#141414',
              color: '#fff',
              border: '1px solid rgba(227,28,28,0.3)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#E31C1C',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
