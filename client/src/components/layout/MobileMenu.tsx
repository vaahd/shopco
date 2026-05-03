import { Link, useNavigate } from "react-router-dom";
import { X, User, Search, ShoppingBag, Percent, Sparkles, Tag, ChevronRight, Sun, Moon, LogOut } from "lucide-react";
import { useAppSelector, useAppDispatch, RootState } from "@/store";
import { setMobileMenuOpen, toggleMobileMenu } from "@/store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";
import { useTheme } from "next-themes";
import { useState } from "react";

export function MobileMenu() {
  const { isMobileMenuOpen } = useAppSelector((state: RootState) => state.ui);
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  if (!isMobileMenuOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/products");
    }
    dispatch(setMobileMenuOpen(false));
  };

  const navLinks = [
    { label: "Shop", href: "/products", icon: <ShoppingBag size={20} /> },
    { label: "On Sale", href: "/products?filter=sale", icon: <Percent size={20} /> },
    { label: "New Arrivals", href: "/products?filter=new", icon: <Sparkles size={20} /> },
    { label: "Brands", href: "/products?filter=brands", icon: <Tag size={20} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={() => dispatch(setMobileMenuOpen(false))} />
      <nav 
        className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-background/80 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 overflow-hidden border-r border-white/5"
      >
        {/* Header / User Info */}
        <div className="p-8 bg-secondary/50 border-b flex items-center justify-between">
           <Link 
            to={isAuthenticated ? "/profile" : "/login"}
            onClick={() => dispatch(setMobileMenuOpen(false))}
            className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
           >
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
           </Link>
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
                className="w-full bg-secondary/30 rounded-2xl pl-12 pr-12 py-4 text-sm font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
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
              onClick={() => { dispatch(logout()); dispatch(setMobileMenuOpen(false)); navigate("/login"); }}
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
  );
}
