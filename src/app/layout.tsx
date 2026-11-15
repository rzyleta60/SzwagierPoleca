import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'szwagierpoleca.pl – Prawdziwe okazje narzędziowe i recenzje Szwagra',
  description: 'Portal z najlepszymi promocjami na elektronarzędzia, sprzęt warsztatowy, motoryzacyjny i domowy. Twarde recenzje, kody rabatowe i błędy cenowe przetestowane w garażu.',
  keywords: ['narzędzia', 'promocje narzędziowe', 'DeWalt', 'Parkside', 'warsztat', 'szwagier poleca', 'błędy cenowe', 'klucze', 'okazje'],
  openGraph: {
    title: 'szwagierpoleca.pl – Prawdziwy sprzęt, zero ściemy',
    description: 'Najgorętsze okazje, testy sprzętu i werdykty Szwagra. Nie przepłacaj w marketach.',
    url: 'https://szwagierpoleca.pl',
    siteName: 'szwagierpoleca.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
