
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <RouterProvider
        router={createBrowserRouter([
          {
            path: "/",
            element: (
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            ),
          },
          {
            path: "/dashboard",
            element: (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "/analyzer",
            element: (
              <ProtectedRoute>
                <Analyzer />
              </ProtectedRoute>
            ),
          },
          {
            path: "/library",
            element: (
              <ProtectedRoute>
                <ClipLibrary />
              </ProtectedRoute>
            ),
          },
          {
            path: "/stats",
            element: (
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            ),
          },
          {
            path: "/insights",
            element: (
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            ),
          },
          {
            path: "/myteam",
            element: (
              <ProtectedRoute>
                <MyTeam />
              </ProtectedRoute>
            ),
          },
          {
            path: "/player/:id",
            element: (
              <ProtectedRoute>
                <PlayerDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "/scouting",
            element: (
              <ProtectedRoute>
                <Scouting />
              </ProtectedRoute>
            ),
          },
          {
            path: "/report/:id",
            element: (
              <ProtectedRoute>
                <ScoutingReport />
              </ProtectedRoute>
            ),
          },
          {
            path: "/assistant",
            element: (
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            ),
          },
          {
            path: "/supabase-debug",
            element: (
              <ProtectedRoute>
                <SupabaseDebug />
              </ProtectedRoute>
            ),
          },
          {
            path: "/settings",
            element: (
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            ),
          },
          {
            path: "/auth",
            element: <Auth />
          },
          {
            path: "*",
            element: (
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            ),
          }
        ])} 
      />
    </AuthProvider>
  );
}

export default App;
