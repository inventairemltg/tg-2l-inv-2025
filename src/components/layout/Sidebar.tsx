"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, LayoutDashboard, ListChecks, Box, Users, Cloud } from "lucide-react"; // Changed CloudSync to Cloud
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
  onLinkClick?: () => void;
}

const NavLink = ({ to, icon: Icon, label, currentPath, onLinkClick }: NavLinkProps) => {
  const isActive = currentPath === to;
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:text-sidebar-accent-foreground"
      )}
      onClick={onLinkClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

const Sidebar = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const currentPath = window.location.pathname; // Get current path for active link styling

  const navigation = [
    { to: "/", icon: LayoutDashboard, label: "Tableau de Bord" },
    { to: "/sessions", icon: ListChecks, label: "Sessions" },
    { to: "/zones", icon: Box, label: "Zones" },
    { to: "/teams", icon: Users, label: "Équipes" },
    { to: "/data-sync", icon: Cloud, label: "Synchronisation" }, // Changed CloudSync to Cloud
  ];

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSheetOpen(false); // Close the sheet on mobile after clicking a link
    }
  };

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-sidebar-background text-sidebar-foreground border-r-sidebar-border">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              to="#"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
              onClick={handleLinkClick}
            >
              <LayoutDashboard className="h-6 w-6" />
              <span className="sr-only">Gestion d'Inventaire</span>
            </Link>
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                currentPath={currentPath}
                onLinkClick={handleLinkClick}
              />
            ))}
          </nav>
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden border-r bg-sidebar-background text-sidebar-foreground md:block w-64 min-h-screen">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-6 w-6" />
            <span>Gestion d'Inventaire</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                currentPath={currentPath}
              />
            ))}
          </nav>
        </div>
        {/* ThemeToggle removed from desktop sidebar, now in MainLayout header */}
      </div>
    </div>
  );
};

export default Sidebar;