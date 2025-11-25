"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import { LayoutDashboard, ListChecks, Box, Users, Cloud, Package } from "lucide-react"; // Import Package icon
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
}

const NavLink = ({ to, icon: Icon, label, currentPath }: NavLinkProps) => {
  const isActive = currentPath === to;
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

const DesktopSidebar = () => {
  const location = useLocation(); // Use useLocation hook
  const currentPath = location.pathname; // Get current path from location object

  const navigation = [
    { to: "/", icon: LayoutDashboard, label: "Tableau de Bord" },
    { to: "/sessions", icon: ListChecks, label: "Sessions" },
    { to: "/zones", icon: Box, label: "Zones" },
    { to: "/teams", icon: Users, label: "Équipes" },
    { to: "/items", icon: Package, label: "Articles" },
    { to: "/data-sync", icon: Cloud, label: "Synchronisation" },
  ];

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
      </div>
    </div>
  );
};

export default DesktopSidebar;