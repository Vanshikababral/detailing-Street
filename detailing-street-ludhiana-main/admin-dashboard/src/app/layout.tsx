import type { Metadata } from 'next';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Detailing Street Admin | Ludhiana',
  description: 'Admin dashboard for Detailing Street Ludhiana.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
