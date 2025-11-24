"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import DesktopSidebar from "./DesktopSidebar"; // Import the new DesktopSidebar component
import MobileSidebar from "./MobileSidebar"; // Import the new MobileSidebar component
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle

interface MainLayoutProps {
  children: React.ReactNode;
  title: string; // To dynamically set the page title in the header
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[250px_1fr] lg:grid-cols-[280px_1fr]">
      <DesktopSidebar /> {/* Render the DesktopSidebar */}
      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-800 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
          <div className="md:hidden">
            {/* Mobile sidebar trigger is now handled by the MobileSidebar component */}
            <MobileSidebar /> 
          </div>
          <h1 className="flex-1 text-2xl font-bold text-gray-800 dark:text-gray-50">{title}</h1>
          {/* ThemeToggle is now always visible in the header */}
          <ThemeToggle />
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
    </div>
  );
};

export default MainLayout;