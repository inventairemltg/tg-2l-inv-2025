import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryDashboard from "./pages/InventoryDashboard";
import Sessions from "./pages/Sessions";
import Zones from "./pages/Zones";
import Teams from "./pages/Teams";
import DataSync from "./pages/DataSync";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Import the new Login page
import Profile from "./pages/Profile"; // Import the new Profile page
import MainLayout from "@/components/layout/MainLayout";
import { SessionContextProvider, ProtectedRoute } from "@/components/SessionContextProvider"; // Import SessionContextProvider and ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Using Sonner for all toast notifications */}
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}> {/* Enabled future flags */}
        <SessionContextProvider> {/* Wrap the entire app with SessionContextProvider */}
          <Routes>
            <Route path="/login" element={<Login />} /> {/* Login page */}
            
            {/* Protected routes using the MainLayout */}
            <Route path="/" element={<ProtectedRoute><MainLayout title="Gestion d'Inventaire"><InventoryDashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><MainLayout title="Gestion des Sessions d'Inventaire"><Sessions /></MainLayout></ProtectedRoute>} />
            <Route path="/zones" element={<ProtectedRoute><MainLayout title="Gestion des Zones d'Inventaire"><Zones /></MainLayout></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><MainLayout title="Gestion des Équipes d'Inventaire"><Teams /></MainLayout></ProtectedRoute>} />
            <Route path="/data-sync" element={<ProtectedRoute><MainLayout title="Synchronisation des Données"><DataSync /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout title="Mon Profil"><Profile /></MainLayout></ProtectedRoute>} /> {/* Profile page */}
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;