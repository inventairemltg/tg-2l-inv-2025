import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryDashboard from "./pages/InventoryDashboard";
import Sessions from "./pages/Sessions";
import Zones from "./pages/Zones";
import Teams from "./pages/Teams";
import DataSync from "./pages/DataSync"; // Import the new DataSync page
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InventoryDashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/zones" element={<Zones />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/data-sync" element={<DataSync />} /> {/* Add route for DataSync page */}
          <Route path="/index" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;