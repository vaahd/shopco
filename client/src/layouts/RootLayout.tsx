import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { useEffect, useState } from "react";
import { useAppSelector, RootState, useAppDispatch } from "@/store";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { setCartOpen, setMobileMenuOpen } from "@/store/slices/uiSlice";

export default function RootLayout() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { isCartOpen, isMobileMenuOpen } = useAppSelector((state: RootState) => state.ui);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Top Loading Bar Logic
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);

    // Dynamic Title Logic
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get("filter");
    const search = searchParams.get("search");
    
    let title = "SHOP.CO | Home";
    
    if (path === "/products") {
      if (search) title = `Search: ${search} | SHOP.CO`;
      else if (filter === "sale") title = "On Sale | SHOP.CO";
      else if (filter === "new") title = "New Arrivals | SHOP.CO";
      else if (filter === "brands") title = "Our Brands | SHOP.CO";
      else title = "Shop Products | SHOP.CO";
    }
    else if (path === "/cart") title = "Your Bag | SHOP.CO";
    else if (path === "/checkout") title = "Secure Checkout | SHOP.CO";
    else if (path === "/login") title = "Sign In | SHOP.CO";
    
    if (!path.startsWith("/products/")) {
      document.title = title;
    }

    // Close drawers on route change
    dispatch(setCartOpen(false));
    dispatch(setMobileMenuOpen(false));

    return () => clearTimeout(timer);
  }, [location, dispatch]);

  const isAnyDrawerOpen = isCartOpen || isMobileMenuOpen;

  // Prevent background scroll when drawers are open
  useEffect(() => {
    if (isAnyDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isAnyDrawerOpen]);

  return (
    <div className="relative min-h-screen bg-background selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Top Loading Bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[9999] overflow-hidden">
          <div className="h-full bg-primary animate-progress-bar w-full origin-left" />
        </div>
      )}
      
      <div 
        className={`transition-[transform,filter] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isAnyDrawerOpen ? "blur-[5px] scale-[0.985] brightness-[0.85] grayscale-[10%]" : "blur-0 scale-100 brightness-100 grayscale-0"
        } will-change-[transform,filter]`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-80px)]">
          <Outlet />
        </main>
        <Footer />
      </div>

      <ScrollToTop />

      {/* Global Overlays rendered at Root Level for Unified Blur */}
      <div className="relative z-[1000]">
        <CartDrawer isOpen={isCartOpen} onClose={() => dispatch(setCartOpen(false))} />
        <MobileMenu />
      </div>
    </div>
  );
}
