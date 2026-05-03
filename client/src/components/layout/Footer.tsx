import { Link } from "react-router-dom";
import { Mail, Twitter, Facebook, Instagram, Github, Loader2 } from "lucide-react";
import { useState } from "react";
import { newsletterService } from "../../services/newsletterService";
import { useToast } from "../../hooks/use-toast";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await newsletterService.subscribe({ email });
      toast({
        title: "Subscribed successfully!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.response?.data?.email?.[0] || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <footer className="bg-secondary mt-32 sm:mt-48">
      {/* Newsletter */}
      <div className="container-shop -translate-y-1/3 sm:-translate-y-1/2 px-4 sm:px-6">
        <div className="bg-black text-white dark:bg-zinc-900 rounded-[2.5rem] px-6 py-8 sm:px-16 sm:py-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-20 shadow-2xl overflow-hidden relative border border-white/5 dark:border-white/10">
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black max-w-lg leading-[1.1] tracking-tighter text-center lg:text-left uppercase italic animate-in slide-in-from-left duration-700">
            Stay up to date about our latest offers
          </h3>
          <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-w-[400px]">
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <div className="relative group">
                <Mail size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-pill pl-14 pr-6 py-4 sm:py-5 text-sm bg-white dark:bg-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all text-black dark:text-white border-none shadow-inner"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-pill py-4 sm:py-5 text-sm font-bold bg-white text-black hover:bg-zinc-100 dark:bg-white dark:text-black dark:hover:bg-zinc-100 transform hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
              </button>
            </form>
          </div>
          {/* Subtle background glow for a premium feel */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>

      <div className="container-shop pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">SHOP.CO</Link>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              We have clothes that suit your style and which you're proud to wear. From women to men.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-background border hover:bg-primary hover:text-primary-foreground transition-all">
                <Twitter size={14} fill="currentColor" />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground text-background hover:bg-primary-dark transition-all">
                <Facebook size={14} fill="currentColor" />
              </a>
              <a href="#" className="text-foreground w-8 h-8 flex items-center justify-center rounded-full bg-background border hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram size={14} />
              </a>
              <a href="#" className="text-foreground w-8 h-8 flex items-center justify-center rounded-full bg-background border hover:bg-primary hover:text-primary-foreground transition-all">
                <Github size={14} />
              </a>
            </div>
          </div>
          {[
            { title: "Company", links: [{ label: "About", href: "/" }, { label: "Features", href: "/products" }, { label: "Works", href: "/" }, { label: "Career", href: "/" }] },
            { title: "Help", links: [{ label: "Customer Support", href: "mailto:support@shop.co" }, { label: "Delivery Details", href: "/products" }, { label: "Terms & Conditions", href: "/" }, { label: "Privacy Policy", href: "/" }] },
            { title: "FAQ", links: [{ label: "Account", href: "/login" }, { label: "Manage Deliveries", href: "/" }, { label: "Orders", href: "/login" }, { label: "Payments", href: "/cart" }] },
            { title: "Resources", links: [{ label: "Free eBooks", href: "/" }, { label: "Development Tutorial", href: "/" }, { label: "How to - Blog", href: "/" }, { label: "YouTube Playlist", href: "/" }] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-xs tracking-widest uppercase mb-4 opacity-80">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") || link.href.startsWith("mailto") ? (
                      <a href={link.href} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-all">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-all">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-muted/30 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[13px] font-medium text-muted-foreground">SHOP.CO © 2024. ALL RIGHTS RESERVED. </p>
          <div className="flex items-center gap-3">
            {["Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay"].map((method) => (
              <div key={method} className="bg-background rounded-md px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:scale-110 transition-transform cursor-pointer shadow-sm">
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
