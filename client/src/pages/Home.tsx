import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";
import { productService } from "@/services/productService";
import heroImage from "@/assets/hero-couple.jpg";
import { products as staticProducts } from "@/data/products";

function HeroSection() {
  return (
    <section className="bg-hero-bg overflow-hidden">
      <div className="container-shop flex flex-col lg:flex-row items-center justify-between py-10 lg:py-0">
        <div className="lg:w-1/2 py-12 lg:py-24 animate-in fade-in slide-in-from-left duration-1000">
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black uppercase tracking-tighter leading-[1] mb-6">
            Find clothes that match your style
          </h1>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base leading-relaxed mb-10 opacity-80">
            Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
          </p>
          <Link to="/products">
            <Button size="lg" className="rounded-full px-12 py-8 text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
              Shop Now
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 mt-16 max-w-sm">
            {[
              { val: "200+", label: "International Brands" },
              { val: "2,000+", label: "High-Quality Products" },
              { val: "30,000+", label: "Happy Customers" },
              { val: "50+", label: "Store Locations" }
            ].map((stat) => (
              <div key={stat.label} className="border-l-2 border-primary/10 pl-6 hover:border-primary transition-colors">
                <p className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">{stat.val}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:w-[45%] relative mt-12 lg:mt-0 animate-in fade-in slide-in-from-right duration-1000">
          <div className="rounded-[3rem] overflow-hidden shadow-edge border border-white/10 group relative">
            <img src={heroImage} alt="Luxury fashion" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

function BrandStrip() {
  const brands = ["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein", "VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"];
  return (
    <div className="bg-black py-10 sm:py-14 overflow-hidden border-y border-white/5 whitespace-nowrap">
      <div className="flex animate-marquee items-center gap-16 sm:gap-32 w-max px-10">
        {brands.map((brand, i) => (
          <span 
            key={`${brand}-${i}`} 
            className="text-white text-2xl sm:text-5xl font-black tracking-tighter opacity-70 hover:opacity-100 transition-all cursor-default select-none hover:scale-110 inline-block"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProductCollection({ title, products, isLoading }: { title: string, products: any[], isLoading: boolean }) {
  return (
    <section className="py-24 sm:py-32 animate-fade-in">
      <div className="container-shop">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none">{title}</h2>
          <div className="h-[3px] w-24 bg-primary mx-auto" />
        </div>
        
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <Link to="/products">
            <Button 
              className="rounded-full px-16 py-8 border-2 border-primary/20 bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px]"
            >
              View All Archive
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeItems = async () => {
      try {
        const data = await productService.getProducts();
        setDbProducts(data);
      } catch (err) {
        console.error("Home products fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeItems();
  }, []);

  const displayProducts = dbProducts.length > 0 ? dbProducts : staticProducts;
  const newArrivals = displayProducts.filter(p => (p as any).is_new !== undefined ? (p as any).is_new : (p as any).isNew).slice(0, 4);
  const topSelling = [...displayProducts].sort((a,b) => b.rating - a.rating).slice(0, 4);

  return (
    <main className="overflow-hidden bg-background">
      <HeroSection />
      <BrandStrip />
      <ProductCollection title="New Arrivals" products={newArrivals} isLoading={isLoading} />
      <div className="container-shop px-10"><div className="h-[1px] bg-foreground/10 w-full" /></div>
      <ProductCollection title="Top Selling" products={topSelling} isLoading={isLoading} />
    </main>
  );
}
