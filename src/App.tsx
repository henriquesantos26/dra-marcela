import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocaleProvider } from "./contexts/LocaleContext";
import { SiteContentProvider } from "./contexts/SiteContentContext";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/ChatWidget";
import TrackingScriptInjector from "./components/TrackingScriptInjector";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <LocaleProvider>
          <SiteContentProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/acessar" element={<AuthPage />} />
                <Route path="/admin" element={
                  <ProtectedAdminRoute>
                    <AdminPage />
                  </ProtectedAdminRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatWidget />
              <TrackingScriptInjector />
            </BrowserRouter>
          </SiteContentProvider>
        </LocaleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
