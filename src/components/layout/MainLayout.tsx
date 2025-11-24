"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { MadeWithDyad } from "@/components/made-with-dyad";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string; // To dynamically set the page title in the header
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50 mb-2 md:mb-0">{title}</h1>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Tableau de Bord</Link>
          <Link to="/sessions" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Sessions</Link>
          <Link to="/zones" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Zones</Link>
          <Link to="/teams" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Équipes</Link>
          <Link to="/data-sync" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Synchronisation</Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 container mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white p-4 text-center mt-auto">
        <p className="mb-2">&copy; 2024 Gestion d'Inventaire. Tous droits réservés.</p>
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default MainLayout;