import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  const tabs = [
    { name: 'Reservas', path: '/', icon: '📊' },
    { name: 'Clientes', path: '/clientes', icon: '👥' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
  ];

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-[#0a9d96] text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">
            🍽️ Sistema de Reservas - Casa José
          </h1>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-md sticky top-[88px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-1">
            {tabs.map((tab) => (
              <Link key={tab.path} href={tab.path}>
                <button
                  className={`tab ${isActive(tab.path) ? 'tab-active' : ''}`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-12">
        <p className="text-sm">
          © {new Date().getFullYear()} Casa José - Sistema de Reservas
        </p>
      </footer>
    </div>
  );
}
