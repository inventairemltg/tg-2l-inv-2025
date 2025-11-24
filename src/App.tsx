import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryDashboard from "./pages/InventoryDashboard";
import Sessions from "./pages/Sessions";
import Zones from "./pages/Zones";
import Teams from "./pages/Teams";
import DataSync from "./pages/DataSync";
// import Index from "./pages/Index"; // Removed import for Index
import NotFound from "./pages/NotFound";
import MainLayout from "@/components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Routes using the MainLayout */}
          <Route path="/" element={<MainLayout title="Gestion d'Inventaire"><InventoryDashboard /></MainLayout>} />
          <Route path="/sessions" element={<MainLayout title="Gestion des Sessions d'Inventaire"><Sessions /></MainLayout>} />
          <Route path="/zones" element={<MainLayout title="Gestion des Zones d'Inventaire"><Zones /></MainLayout>} />
          <Route path="/teams" element={<MainLayout title="Gestion des Équipes d'Inventaire"><Teams /></MainLayout>} />
          <Route path="/data-sync" element={<MainLayout title="Synchronisation des Données"><DataSync /></MainLayout>} />
          
          {/* Other routes not using the MainLayout */}
          {/* <Route path="/index" element={<Index />} /> Removed route for Index */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;