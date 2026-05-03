import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import RootLayout from "@/layouts/RootLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("@/pages/Home"));
const ProductListing = lazy(() => import("@/pages/ProductListing"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Login = lazy(() => import("@/pages/Login"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full text-foreground bg-background">
    <Loader2 className="animate-spin text-primary" size={40} />
  </div>
);

const ScrollRestorer = () => {
  const location = useLocation();

  useEffect(() => {
    const key = `scroll::${location.pathname}`;

    const handleScroll = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    const key = `scroll::${location.pathname}`;
    const saved = sessionStorage.getItem(key);

    if (saved !== null) {
      const id = setTimeout(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
      }, 50);
      return () => clearTimeout(id);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollRestorer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
