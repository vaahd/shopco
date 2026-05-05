import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";
import { productService } from "@/services/productService";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SlidersHorizontal, ChevronRight, X, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/data/products";

export default function ProductListing() {
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterParam = searchParams.get("filter");
  const searchQuery = searchParams.get("search");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatic = async () => {
      try {
        const cats = await productService.getCategories();
        setDbCategories(cats);
      } catch (e) {}
    };
    loadStatic();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        let ordering = "-created_at";
        if (sortBy === "low") ordering = "price";
        if (sortBy === "high") ordering = "-price";
        if (sortBy === "popular") ordering = "-rating";

        const data = await productService.getProducts({
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          search: searchQuery || undefined,
          filter: filterParam || undefined,
          page: currentPage,
          ordering: ordering
        } as any);

        if (data.results) {
          setDbProducts(data.results);
          setTotalCount(data.count);
        } else {
          setDbProducts(data);
          setTotalCount(data.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, [searchQuery, selectedCategory, filterParam, sortBy, currentPage]);

  const filtered = useMemo(() => {
    const dataSource = dbProducts.length > 0 ? dbProducts : products;
    let result = [...dataSource];

    // Note: Backend handles most filtering now, this is for static data fallback or fine-tuning
    if (dbProducts.length === 0) {
       if (selectedCategory !== "All") result = result.filter((p) => p.category === selectedCategory);
       if (filterParam === "sale") result = result.filter((p) => p.discount);
       if (filterParam === "new") result = result.filter((p) => p.is_new);
       result = result.filter((p) => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]);
       if (sortBy === "low") result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
       if (sortBy === "high") result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
       if (sortBy === "popular") result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating));
    } else {
       // Just price filter if backend doesn't support it yet
       result = result.filter((p) => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]);
    }
    
    return result;
  }, [dbProducts, filterParam, priceRange, sortBy, selectedCategory]);

  const pageTitle = useMemo(() => {
    if (searchQuery) return searchQuery;
    if (filterParam === "sale") return "On Sale";
    if (filterParam === "new") return "New In";
    if (filterParam === "brands") return "Our Brands";
    if (selectedCategory !== "All") return selectedCategory;
    return "Shop All";
  }, [searchQuery, filterParam, selectedCategory]);

  const breadcrumbLabel = useMemo(() => {
    if (searchQuery) return "Search";
    if (filterParam === "sale") return "On Sale";
    if (filterParam === "new") return "New Arrivals";
    if (filterParam === "brands") return "Brands";
    if (selectedCategory !== "All") return selectedCategory;
    return "Shop";
  }, [searchQuery, filterParam, selectedCategory]);

  return (
    <div className="container-shop py-10 lg:py-20 animate-fade-in text-foreground">
      <Breadcrumbs customLabel={breadcrumbLabel} />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start mt-8 sm:mt-12">
        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-[1000] lg:hidden flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowFilters(false)} />
            <aside className="relative w-[320px] bg-background h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 p-10 border-l border-white/10">
              <div className="flex items-center justify-between mb-12">
                <h3 className="font-black text-3xl uppercase tracking-tighter">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-3 bg-secondary rounded-full hover:scale-110 transition-transform">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-12">
                 <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">Categories</h4>
                  <div className="flex flex-col gap-2">
                    {["All", ...dbCategories.map(c => c.name)].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setShowFilters(false); }}
                        className={`flex items-center justify-between w-full text-left text-xs py-4 px-6 rounded-2xl transition-all ${
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground font-black shadow-lg"
                            : "bg-secondary text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 font-bold"
                        }`}
                      >
                        {cat}
                        {selectedCategory === cat && <ChevronRight size={14} className="opacity-50" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-primary/5 pt-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-40">Price Threshold</h4>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-black mt-6 tracking-tighter">
                    <span className="opacity-40 text-primary">$0</span>
                    <span className="px-4 py-1.5 bg-primary text-primary-foreground dark:bg-zinc-900 dark:text-white rounded-lg border border-primary/10 shadow-sm leading-none italic">MAX: ${priceRange[1]}</span>
                  </div>
                </div>

                <Button 
                  className="w-full rounded-2xl py-8 text-xs font-black uppercase tracking-widest mt-10 shadow-2xl"
                  onClick={() => setShowFilters(false)}
                >
                  Confirm Selection
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Sidebar filters - desktop */}
        <aside className="hidden lg:block w-[240px] shrink-0 sticky top-32">
          <div className="flex flex-col gap-12">
            
            {/* Header Section */}
            <div className="flex items-center justify-between group cursor-default">
              <div className="group cursor-default">
                <h3 className="font-black text-2xl uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">Filters</h3>
                <div className="h-[3px] w-14 bg-primary transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:w-28" />
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full opacity-60">
                 <SlidersHorizontal size={14} />
              </div>
            </div>

            {/* Categories - Editorial List Style */}
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-bold mb-6 uppercase tracking-[0.3em] text-muted-foreground/60">Collections</h4>
                <div className="flex flex-col gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`group relative flex items-center justify-between w-full text-left transition-all py-1.5 ${
                        selectedCategory === cat
                          ? "text-primary font-black"
                          : "text-muted-foreground/40 hover:text-foreground font-bold"
                      }`}
                    >
                      <div className="flex items-center gap-0">
                         {/* Selection Indicator: Clean Vertical Bar */}
                         <div className={`absolute -left-4 w-[3px] bg-primary rounded-full transition-all duration-300 ${selectedCategory === cat ? 'h-full opacity-100' : 'h-0 opacity-0'}`} />
                         
                         <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat ? 'translate-x-[0px]' : 'group-hover:translate-x-1'}`}>
                           {cat}
                         </span>
                      </div>
                      <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${selectedCategory === cat ? 'opacity-20' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range - Minimalist Slider */}
              <div className="border-t border-primary/5 pt-10">
                <h4 className="text-[10px] font-bold mb-8 uppercase tracking-[0.3em] text-muted-foreground/60">Price Point</h4>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full h-0.5 bg-secondary accent-primary rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] font-black text-primary mt-6 tracking-widest uppercase">
                     <span className="opacity-40">$0</span>
                     <span className="bg-primary text-primary-foreground dark:bg-zinc-900 dark:text-white px-3 py-1.5 rounded-sm italic leading-none border border-primary/10 shadow-sm">${priceRange[1]}</span>
                  </div>
                </div>
              </div>
              
              {/* Reset Action */}
              {(selectedCategory !== "All" || priceRange[1] !== 500) && (
                <button 
                  onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, 500]);
                  }}
                  className="text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-[0.2em] transition-all flex items-center gap-2 group border-b border-transparent hover:border-primary/20 pb-1"
                >
                  <X size={12} className="group-hover:rotate-90 transition-transform duration-500" />
                  Reset Selection
                </button>
              )}
            </div>

            {/* Premium Detail Accessory */}
            <div className="border-t border-primary/5 pt-8 opacity-20">
               <p className="text-[10px] font-medium leading-relaxed italic">
                 Curated for the modern <br/> fashion aesthetic.
               </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-12">
            <div className="flex-1">
              {searchQuery ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-primary/40 mb-2">
                    <Search size={18} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Search Result</span>
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-2">
                    {pageTitle}
                  </h1>
                  <p className="text-xs font-bold text-muted-foreground uppercase opacity-40 tracking-[0.2em] ml-1">
                    Found {filtered.length} matching items in our archive
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                    {pageTitle}
                  </h1>
                  <p className="text-xs font-bold text-muted-foreground uppercase opacity-40 tracking-[0.2em] ml-1">
                    Explore our latest curated collection
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                className="lg:hidden flex items-center justify-center gap-2 px-6 py-4 bg-secondary rounded-full font-black text-[11px] uppercase hover:scale-105 active:scale-95 transition-all shadow-sm"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal size={14} />
                Refine
              </button>
              
              {/* Custom High-End Dropdown Interface */}
              <div className="relative group">
                <div className="relative">
                  <button 
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    onBlur={() => setTimeout(() => setShowSortDropdown(false), 200)}
                    className="bg-card border-2 border-primary/10 rounded-full pl-6 pr-10 sm:pl-8 sm:pr-14 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-secondary/50 transition-all shadow-sm flex items-center gap-2 w-full xs:min-w-[220px] justify-between cursor-pointer relative z-20 overflow-hidden active:scale-[0.98]"
                  >
                    <span className="truncate">{sortBy === "popular" ? "Trending First" : sortBy === "low" ? "Lower Price" : "Higher Price"}</span>
                    <ChevronRight size={16} className={`shrink-0 transition-transform duration-500 ${showSortDropdown ? '-rotate-90' : 'rotate-90'}`} />
                  </button>
                  
                  {showSortDropdown && (
                    <div 
                      className="absolute top-[calc(100%+12px)] right-0 w-full min-w-[220px] bg-background border-2 border-primary/5 shadow-2xl rounded-[1.5rem] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-300"
                    >
                      {[
                        { id: "popular", label: "Trending First" },
                        { id: "low", label: "Lower Price" },
                        { id: "high", label: "Higher Price" }
                      ].map((option) => (
                        <button 
                          key={option.id}
                          onMouseDown={(e) => { e.preventDefault(); setSortBy(option.id); setShowSortDropdown(false); }}
                          className={`w-full text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between group ${
                            sortBy === option.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-secondary text-foreground/60 hover:text-foreground"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-primary/5 mb-10" />

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {filtered.map((product, idx) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-32 px-6 sm:py-40 bg-secondary/20 rounded-[3rem] border border-dashed border-primary/10 animate-in fade-in zoom-in duration-700">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-background rounded-full mb-8 shadow-2xl relative">
                  <div className="absolute inset-0 bg-primary/5 animate-ping rounded-full" />
                  <Search size={32} className="text-primary opacity-30" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">No results for "{searchQuery}"</h3>
              <p className="text-muted-foreground font-medium italic mb-12 max-w-xs mx-auto">None of our archive matches your current selection. Maybe try one of these instead?</p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                 {categories.slice(1, 6).map(cat => (
                   <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-6 py-3 bg-background border border-primary/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                   >
                     {cat}
                   </button>
                 ))}
              </div>

              <Button 
                onClick={() => {
                  setSelectedCategory("All");
                  setPriceRange([0, 500]);
                  navigate("/products");
                }}
                className="rounded-full px-12 py-7 font-black uppercase tracking-widest shadow-xl group overflow-hidden relative"
              >
                <span className="relative z-10">Reset Discovery</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && totalCount > 12 && (
            <div className="mt-20 flex items-center justify-between border-t border-primary/5 pt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                Page {currentPage} of {Math.ceil(totalCount / 12)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }}
                  className="rounded-full px-8 py-4 text-[10px] font-black uppercase tracking-widest border-2 disabled:opacity-20"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage >= Math.ceil(totalCount / 12)}
                  onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }}
                  className="rounded-full px-8 py-4 text-[10px] font-black uppercase tracking-widest border-2 disabled:opacity-20"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
