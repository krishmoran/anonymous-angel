import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ProductProvider } from '@/contexts/product-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Anonymous Angel - Send Surprise Gifts Anonymously',
  description: 'Send thoughtful, surprise gifts to someone special - completely anonymously. Make someone\'s day in just 60 seconds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ProductProvider>
            {children}
            <Toaster />
          </ProductProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}