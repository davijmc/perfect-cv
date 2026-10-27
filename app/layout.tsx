import type { Metadata } from 'next';
import './globals.css';
import { MainNav } from '@/components/layout/main-nav';

export const metadata: Metadata = {
  title: 'Perfect CV - Gerador Inteligente e Local de Currículos',
  description: 'Crie e adapte currículos profissionais de alta conversão (ATS-friendly) com IA multi-provedor rodando 100% no seu computador.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <MainNav />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
