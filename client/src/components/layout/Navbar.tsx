import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, User, Sun, Moon, LogOut, ShoppingBag, Percent, Sparkles, Tag, ChevronRight } from "lucide-react";
import { useAppSelector, useAppDispatch, RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { toggleCart, toggleMobileMenu, setCartOpen, setMobileMenuOpen } from "@/store/slices/uiSlice";
import { productService } from "@/services/productService";
import { products as staticProducts } from "@/data/products";
import { useEffect } from "react";

export function Navbar() {
  const { items } = useAppSelector((state: RootState) => state.cart);
  const auth = useAppSelector((state: RootState) => state.auth);
  const { isCartOpen, isMobileMenuOpen } = useAppSelector((state: RootState) => state.ui);
  const { isAuthenticated, user } = auth;
  const dispatch = useAppDispatch();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const data = await productService.getProducts({ search: searchQuery });
          const productsList = data.results || data;
          setSuggestions(productsList.slice(0, 5));
        } catch (e) {
          const fallback = staticProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
          setSuggestions(fallback);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/products");
    }
    dispatch(setMobileMenuOpen(false));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLinks = [
    { label: "Shop", href: "/products", icon: <ShoppingBag size={20} /> },
    { label: "On Sale", href: "/products?filter=sale", icon: <Percent size={20} /> },
    { label: "New Arrivals", href: "/products?filter=new", icon: <Sparkles size={20} /> },
    { label: "Brands", href: "/products?filter=brands", icon: <Tag size={20} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-300">
      <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-[9px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap overflow-x-auto no-scrollbar">
         Sign up and get 20% off to your first order. 
         <Link to="/login" className="underline ml-2 hover:opacity-80 transition-opacity shrink-0">Sign Up Now</Link>
      </div>

      <div className="container-shop flex items-center justify-between h-16 sm:h-20">
        <button
          className="lg:hidden p-2 -ml-2"
          onClick={() => dispatch(toggleMobileMenu())}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link 
          to="/" 
          className="font-display text-xl sm:text-3xl font-extrabold tracking-tight shrink-0 mr-2 sm:mr-10 hover:scale-105 transition-transform"
        >
          SHOP.CO
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search bar - desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-8 relative">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative w-full group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full bg-secondary rounded-pill pl-12 pr-12 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border-2 border-transparent focus:bg-background transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          {/* Search Suggestions Overlay */}
          {searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b bg-secondary/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Suggestions</p>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {suggestions.map((p, i) => (
                  <button 
                    key={p.id || i}
                    onClick={() => { navigate(`/products/${p.id}`); setSearchQuery(""); }}
                    className="w-full text-left p-4 hover:bg-secondary flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-primary/5">
                         <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium italic">In {p.category} Archive</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black tracking-tighter">${p.price}</p>
                       <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-primary" />
                    </div>
                  </button>
                ))}
                {suggestions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm font-bold opacity-60 uppercase">Searching the archive...</p>
                  </div>
                )}
              </div>
              <Link to={`/products?search=${searchQuery}`} className="block p-4 border-t bg-primary/5 text-center text-xs font-black text-primary uppercase tracking-tighter hover:bg-primary/10 transition-colors">
                View all results for "{searchQuery}"
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
          </button>
          
          <Link to="/products" className="xs:hidden p-1.5 hover:bg-secondary rounded-full transition-all" aria-label="Search">
            <Search size={20} />
          </Link>
          
          <button 
            onClick={() => dispatch(setCartOpen(true))}
            className="p-1.5 sm:p-2.5 relative hover:bg-secondary rounded-full transition-all" 
            aria-label="Cart"
          >
            <ShoppingCart size={20} className="sm:w-5 sm:h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground text-[8px] sm:text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border-2 border-background">
                {totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-3">
               <Link 
                 to="/profile" 
                 className="hidden sm:inline text-xs font-black uppercase tracking-tighter opacity-70 hover:opacity-100 hover:text-primary transition-all cursor-pointer"
               >
                 Hi, {user?.name.split(' ')[0]}
               </Link>
               <button onClick={handleLogout} className="p-1.5 sm:p-2.5 hover:bg-destructive/10 text-destructive rounded-full transition-all" title="Logout">
                  <LogOut size={20} className="sm:w-5 sm:h-5" />
               </button>
            </div>
          ) : (
            <Link to="/login" className="p-1.5 sm:p-2.5 hover:bg-secondary rounded-full transition-all" aria-label="Account">
               <User size={20} className="sm:w-5 sm:h-5" />
            </Link>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[12px]" onClick={() => dispatch(setMobileMenuOpen(false))} />
          <nav 
            className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-background/80 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 overflow-hidden border-r border-white/5"
          >
            {/* Header / User Info */}
            <div className="p-8 bg-secondary/50 border-b flex items-center justify-between">
               <div className="flex items-center gap-4">
                  {isAuthenticated ? (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg ring-4 ring-primary/10">
                       {user?.name.charAt(0)}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border-2 border-primary/5">
                       <User size={24} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-black uppercase tracking-tighter text-lg leading-none mb-1">
                       {isAuthenticated ? user?.name : "Welcome Guest"}
                    </h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                       {isAuthenticated ? "Platinum Member" : "Login to your account"}
                    </p>
                  </div>
               </div>
               <button onClick={() => dispatch(setMobileMenuOpen(false))} className="p-3 bg-background rounded-full shadow-sm hover:scale-110 transition-transform">
                  <X size={20} />
               </button>
            </div>

            {/* Search Input in Menu */}
            <div className="p-6">
               <form onSubmit={handleSearch} className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ARCHIVE..."
                    className="w-full bg-secondary/30 rounded-2xl pl-12 pr-6 py-4 text-sm font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/5"
                  />
               </form>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 ml-4 mb-6">Collections</p>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="flex items-center justify-between w-full p-5 rounded-3xl hover:bg-secondary transition-all active:scale-95 group"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                >
                  <div className="flex items-center gap-5">
                     <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                        {link.icon}
                     </div>
                     <span className="text-sm font-black uppercase tracking-widest group-hover:translate-x-1 transition-all duration-300">{link.label}</span>
                  </div>
                  <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
                </Link>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t bg-secondary/20 space-y-6">
               <button 
                onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); dispatch(setMobileMenuOpen(false)); }}
                className="w-full flex items-center justify-between p-2 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
               >
                  <div className="flex items-center gap-3">
                     {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                     <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === "dark" ? 'bg-primary' : 'bg-zinc-300'}`}>
                     <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme === "dark" ? 'right-1' : 'left-1'}`} />
                  </div>
               </button>

               {isAuthenticated ? (
                 <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-2 text-xs font-black uppercase tracking-widest text-destructive hover:scale-105 transition-all"
                 >
                   <LogOut size={18} />
                   Logout Archive
                 </button>
               ) : (
                 <Link 
                  to="/login"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                  className="w-full h-14 bg-primary text-primary-foreground flex items-center justify-center rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                 >
                   Secure Login
                 </Link>
               )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
