import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/components/Web3Provider";
import { DisputeChat } from "@/components/DisputeChat";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Gigs from "./pages/Gigs";
import GigDetails from "./pages/GigDetails";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import ProfileSettings from "./pages/ProfileSettings";

const queryClient = new QueryClient();

const App = () => (
  <Web3Provider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gigs" element={<Gigs />} />
            <Route path="/gigs/:id" element={<GigDetails />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/settings" element={<ProfileSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <DisputeChat />
      </TooltipProvider>
    </QueryClientProvider>
  </Web3Provider>
);

export default App;
