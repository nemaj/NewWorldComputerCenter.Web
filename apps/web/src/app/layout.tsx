import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Internet Subscription Manager',
  description: 'Admin dashboard for plans, invoices, and payment records'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
