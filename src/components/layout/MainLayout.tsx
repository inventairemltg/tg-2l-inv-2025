"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import DesktopSidebar from "./DesktopSidebar"; // Import the new DesktopSidebar component
import MobileSidebar from "./MobileSidebar"; // Import the new MobileSidebar component
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, LogOut } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string; // To dynamically set the page title in the header
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const { supabase, session } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      showError('Erreur lors de la déconnexion: ' + error.message);
    } else {
      showSuccess('Vous avez été déconnecté.');
      navigate('/login');
    }
  };

  // Get user initials for avatar fallback
  const userEmail = session?.user?.email;
  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : 'UN';

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.user_metadata?.avatar_url || undefined} alt="User Avatar" />
                    <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                <DropdownMenuLabel className="dark:text-gray-50">Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-gray-700" />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-50">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-700" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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