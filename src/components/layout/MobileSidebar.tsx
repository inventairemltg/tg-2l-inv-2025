"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, LayoutDashboard, ListChecks, Box, Users, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

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

const MobileSidebar = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const currentPath = window.location.pathname;

  const navigation = [
    { to: "/", icon: LayoutDashboard, label: "Tableau de Bord" },
    { to: "/sessions", icon: ListChecks, label: "Sessions" },
    { to: "/zones", icon: Box, label: "Zones" },
    { to: "/teams", icon: Users, label: "Équipes" },
    { to: "/data-sync", icon: Cloud, label: "Synchronisation" },
  ];

  const handleLinkClick = () => {
    setIsSheetOpen(false); // Close the sheet on mobile after clicking a link
  };

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
};

export default MobileSidebar;