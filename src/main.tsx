
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'sonner';
import { initializeStorage } from "@/utils/setup-supabase-storage";

// Initialize Supabase storage for videos
initializeStorage();

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster position="top-center" richColors />
  </>
);
