import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Analyzer from "./pages/Analyzer";
import Stats from "./pages/Stats";
import Assistant from "./pages/Assistant";
import Insights from "./pages/Insights";
import MyTeam from "./pages/MyTeam";
import PlayerDetail from "./pages/PlayerDetail";
import Scouting from "./pages/Scouting";
import ScoutingReport from "./pages/ScoutingReport";
import ClipLibrary from "./pages/ClipLibrary";
import NotFound from "./pages/NotFound";
import SupabaseDebug from "./pages/SupabaseDebug";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/library" element={<ClipLibrary />} />
          <Route path="/myteam" element={<MyTeam />} />
          <Route path="/myteam/player/:teamId/:playerId" element={<PlayerDetail />} />
          <Route path="/scouting" element={<Scouting />} />
          <Route path="/scouting/:teamId" element={<ScoutingReport />} />
          <Route path="/debug/supabase" element={<SupabaseDebug />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
