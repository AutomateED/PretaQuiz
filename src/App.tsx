import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import CookieConsent from "@/components/CookieConsent";
import HomePage from "./pages/HomePage";

import Setup from "./pages/Setup";
import QuizPage from "./pages/QuizPage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Dpa from "./pages/Dpa";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminBlog from "./pages/AdminBlog";
import Welcome from "./pages/Welcome";
import Waitlist from "./pages/Waitlist";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import HelpChat from "@/components/HelpChat";

const queryClient = new QueryClient();

const App = () => (
  <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please refresh.</p>}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/get-started" element={<Navigate to="/" replace />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/quiz/:slug" element={<QuizPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/dpa" element={<Dpa />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/waitlist" element={<Waitlist />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        <HelpChat />
        <CookieConsent />
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

export default App;
