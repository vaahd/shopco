import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  customLabel?: string;
}

export function Breadcrumbs({ customLabel }: BreadcrumbsProps) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (location.pathname === "/") return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
      <Link to="/" className="hover:text-foreground transition-all duration-300 flex items-center gap-1.5 group">
        <Home size={14} className="mb-0.5" />
        <span className="hidden sm:inline font-black uppercase tracking-widest text-[10px] group-hover:tracking-tighter transition-all">Home</span>
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        
        let displayName = name;
        
        if (isLast && customLabel) {
            displayName = customLabel;
        } else {
            // Standard formatting
            displayName = name.charAt(0).toUpperCase() + name.slice(1);
            if (name === "products") displayName = "Shop";
            if (name === "cart") displayName = "Bag";
            if (name === "checkout") displayName = "Secure Checkout";
        }

        return (
          <div key={name} className="flex items-center gap-2.5">
            <ChevronRight size={12} className="shrink-0 opacity-20" />
            {isLast ? (
              <span className="text-foreground font-black uppercase tracking-widest text-[10px] border-b-[3px] border-primary leading-none pb-1">
                {displayName}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-foreground transition-all font-black uppercase tracking-widest text-[10px]">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
