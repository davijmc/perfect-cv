'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Settings, 
  User, 
  Sparkles, 
  Library, 
  ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

export const NAV_ITEMS = [
  { href: '/settings', label: 'Configurações', icon: Settings },
  { href: '/profile', label: 'Meu Perfil', icon: User },
  { href: '/generator', label: 'Gerador de CV', icon: Sparkles },
  { href: '/resumes', label: 'Biblioteca', icon: Library },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Perfect <span className="text-blue-600">CV</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <ShieldCheck className="h-3 w-3" />
                <span>Local & Seguro</span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className={clsx('h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-500')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/generator"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Novo Currículo</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
