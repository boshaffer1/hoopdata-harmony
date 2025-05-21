
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Analyzer from "@/pages/Analyzer";
import ClipLibrary from "@/pages/ClipLibrary";
import Stats from "@/pages/Stats";
import Insights from "@/pages/Insights";
import MyTeam from "@/pages/MyTeam";
import PlayerDetail from "@/pages/PlayerDetail";
import Scouting from "@/pages/Scouting";
import ScoutingReport from "@/pages/ScoutingReport";
import Assistant from "@/pages/Assistant";
import SupabaseDebug from "@/pages/SupabaseDebug";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import { AuthProvider } from "@/hooks/auth/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <RouterProvider
        router={createBrowserRouter([
          {
            path: "/",
            element: <Index />
          },
          {
            path: "/dashboard",
            element: <Dashboard />
          },
          {
            path: "/analyzer",
            element: <Analyzer />
          },
          {
            path: "/library",
            element: <ClipLibrary />
          },
          {
            path: "/stats",
            element: <Stats />
          },
          {
            path: "/insights",
            element: <Insights />
          },
          {
            path: "/myteam",
            element: <MyTeam />
          },
          {
            path: "/player/:id",
            element: <PlayerDetail />
          },
          {
            path: "/scouting",
            element: <Scouting />
          },
          {
            path: "/report/:id",
            element: <ScoutingReport />
          },
          {
            path: "/assistant",
            element: <Assistant />
          },
          {
            path: "/supabase-debug",
            element: <SupabaseDebug />
          },
          {
            path: "/settings",
            element: <Settings />
          },
          {
            path: "/auth",
            element: <Auth />
          },
          {
            path: "*",
            element: <NotFound />
          }
        ])} 
      />
    </AuthProvider>
  );
}

export default App;
