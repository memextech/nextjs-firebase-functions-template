import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Memex Admin',
  description: 'Memex Admin Management Console',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
