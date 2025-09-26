import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import VotingDashboard from "./pages/VotingDashboard";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import ConnectWallet from "./components/ConnectWallet";

const queryClient = new QueryClient();

const App = () => {
  const [account, setAccount] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Prosledjujemo account u Navigation i ConnectWallet */}
          <Navigation account={account} setAccount={setAccount} />

          <Routes>
            <Route path="/" element={<Home />} />

            {/* Dashboard ruta se prikazuje samo ako je wallet povezan */}
            {account && (
              <Route path="/dashboard" element={<VotingDashboard />} />
            )}

            <Route path="/results" element={<Results />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
