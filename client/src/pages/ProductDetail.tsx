import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productService } from "@/services/productService";
import { useAppDispatch, useAppSelector } from "@/store";
import { addItem, addItemToServer } from "@/store/slices/cartSlice";
import { StarRating } from "@/components/common/StarRating";
import { ProductCard } from "@/components/product/ProductCard";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ChevronRight, Minus, Plus, Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { getColorHex } from "@/utils/colors";
import { cn } from "@/lib/utils";
import { products as staticProducts } from "@/data/products";
import { getMediaUrl } from "@/utils/media";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        let data;
        try {
          data = await productService.getProductById(String(id));
        } catch (e) {
          data = staticProducts.find(p => String(p.id) === String(id));
        }
        if (!data) data = staticProducts.find(p => String(p.id) === String(id));

        if (data) {
          setProduct(data);
          let related = [];
          try {
            const resp = await productService.getProducts({ category: data.category });
            // Handle both paginated {results: []} and non-paginated [] responses
            const list = resp.results || (Array.isArray(resp) ? resp : []);
            
            if (list.length === 0) {
              related = staticProducts.filter(p => p.category === data.category);
            } else {
              related = list;
            }
          } catch (e) {
            related = staticProducts.filter(p => p.category === data.category);
          }
          const finalRelated = Array.isArray(related) ? related : [];
          setRelatedProducts(finalRelated.filter((p: any) => p.id !== data.id).slice(0, 4));
          document.title = `${data.name} | SHOP.CO`;
          window.scrollTo(0, 0);
        }
      } catch (e) {
        console.error("Critical Load Error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (isLoading) return (
    <div className="container-shop py-10 lg:py-20 animate-fade-in">
       <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-10 lg:gap-20">
          <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
          </div>
          <div className="space-y-6">
             <div className="h-12 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
             </div>
             <div className="h-6 w-1/4 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
             </div>
             <div className="h-24 w-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
             </div>
             <div className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative mt-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
             </div>
          </div>
       </div>
    </div>
  );

  if (!product) {
    return (
      <div className="container-shop py-20 text-center animate-fade-in">
        <h1 className="text-2xl font-black italic uppercase mb-4">Product not found</h1>
        <Link to="/products" className="text-muted-foreground hover:text-foreground underline uppercase text-xs font-bold tracking-widest">
          Back to collection
        </Link>
      </div>
    );
  }

  const originalPrice = product.original_price || product.originalPrice;
  const reviewCount   = product.review_count ?? product.reviewCount ?? product?.reviews?.length ?? 0;
  const isNew         = product.is_new || product.isNew;

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize || !selectedColor) {
      toast({ title: "Selection Required", description: "Please select size and color", variant: "destructive" });
      return;
    }
    if (isAuthenticated) {
      dispatch(addItemToServer({
        product_id: Number(String(product.id).replace("p", "")),
        quantity,
        size: selectedSize,
        color: selectedColor.name,
      }));
    } else {
      dispatch(addItem({ product, quantity, size: selectedSize, color: selectedColor }));
    }
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your wardrobe.`,
      action: (
        <ToastAction altText="View Cart" className="font-black" onClick={() => navigate("/cart")}>
          VIEW CART
        </ToastAction>
      ),
    });
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (!reviewComment.trim()) {
      toast({ title: "Comment Required", description: "Please add your review before submitting.", variant: "destructive" });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await productService.postReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      toast({
        title: "Review submitted",
        description: "Thank you! Your review is now live.",
      });

      const updatedProduct = await productService.getProductById(product.id);
      setProduct(updatedProduct);
      setReviewComment("");
      setReviewRating(5);
      setIsReviewing(false);
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.response?.data?.error || error?.response?.data || "Unable to submit review.";
      toast({ title: "Review failed", description: String(message), variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="container-shop py-8 animate-fade-in">
      <Breadcrumbs customLabel={product.name} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-10 lg:gap-20 items-start">
        {/* Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
           <div className="flex md:flex-col gap-3 sm:gap-4 overflow-x-auto md:overflow-visible no-scrollbar shrink-0">
             {product.colors.map((color: any) => {
               const colorImg = color.image ? getMediaUrl(color.image) : getMediaUrl(product.image);
               return (
                 <button
                   key={color.name}
                   type="button"
                   onClick={() => setSelectedColor(color)}
                   className={cn(
                     "w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-32 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-zinc-50 dark:bg-zinc-900 group shrink-0",
                     selectedColor?.name === color.name ? "border-primary shadow-lg" : "border-transparent opacity-60 hover:opacity-100 hover:border-primary/20"
                   )}
                 >
                    <OptimizedImage src={colorImg} alt={color.name} className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110" />
                 </button>
               );
             })}
           </div>

           <div className="flex-1 relative group aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 transform-gpu transition-all duration-700 hover:shadow-primary/10">
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
              <OptimizedImage
                src={selectedColor?.image ? getMediaUrl(selectedColor.image) : getMediaUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-1000 ease-in-out transform group-hover:scale-105"
                key={selectedColor?.name}
              />
              {isNew && (
                <div className="absolute top-6 right-6 z-20">
                   <div className="bg-primary text-primary-foreground px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl animate-fade-in skew-x-[-12deg]">
                     New Arrival
                   </div>
                </div>
              )}
              <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                 <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                   Studio Perspective
                 </div>
              </div>
           </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.brand && (
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-primary/40 mb-3 animate-slide-in-left">
              {product.brand}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight uppercase">{product.name}</h1>
          <div className="mt-4 flex items-center">
            <StarRating rating={product.rating} reviewCount={reviewCount} size={22} />
          </div>
          <div className="flex items-center gap-4 mt-6">
            <span className="text-4xl font-bold">${product.price}</span>
            {originalPrice && (
              <span className="text-2xl text-muted-foreground line-through opacity-40 font-medium">${originalPrice}</span>
            )}
            {product.discount && <span className="badge-sale text-lg font-bold px-4">-{product.discount}%</span>}
          </div>
          <p className="text-muted-foreground mt-6 text-lg leading-relaxed border-b pb-8">{product.description}</p>

          <div className="mt-8">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 opacity-40">Select Color</h4>
            <div className="flex flex-wrap gap-5">
              {product.colors.map((color: any) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(selectedColor?.name === color.name ? null : color)}
                  title={color.name}
                  className={`group relative flex flex-col items-center gap-2 transition-all duration-300 ${
                    selectedColor?.name === color.name ? "scale-110" : "hover:scale-105"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full border-2 transition-all p-0.5 shadow-sm ${
                    selectedColor?.name === color.name ? "border-primary ring-2 ring-primary/20" : "border-primary/5 hover:border-primary/40"
                  }`}>
                    <div className="w-full h-full rounded-full flex items-center justify-center border border-black/5" style={{ background: getColorHex(color.name) }}>
                      {selectedColor?.name === color.name && (
                        <Check size={16} className={color.name.toLowerCase().includes("white") || color.name.toLowerCase().includes("beige") || color.name.toLowerCase().includes("cream") ? "text-black" : "text-white"} />
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${
                    selectedColor?.name === color.name ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  }`}>
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4 opacity-50">Choose Size</h4>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size: any) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSize(selectedSize === size.size ? "" : size.size)}
                  className={`px-6 py-3 rounded-pill text-sm font-black uppercase tracking-tight transition-all min-w-[70px] border-2 ${
                    selectedSize === size.size
                      ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                      : "bg-secondary text-secondary-foreground hover:bg-accent border-primary/5 dark:border-white/5"
                  }`}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center bg-secondary/50 dark:bg-zinc-900 rounded-full p-1 border-2 border-primary/5 hover:border-primary/10 transition-all shadow-sm">
              <button type="button" className="p-3 hover:scale-110 transition-transform" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-bold text-base">{quantity}</span>
              <button type="button" className="p-3 hover:scale-110 transition-transform" onClick={() => setQuantity(quantity + 1)}>
                <Plus size={16} />
              </button>
            </div>
            <Button onClick={handleAddToCart} className="w-full sm:w-fit px-12 rounded-full py-6 text-sm sm:text-base font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary/90 transition-all active:scale-[0.98] animate-fade-in">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="mt-20 border-t pt-12">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto bg-transparent p-0 mb-10 overflow-x-auto no-scrollbar">
            <TabsTrigger value="details" className="text-lg px-8 py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-primary border-b-4 border-transparent bg-transparent transition-all">Product Details</TabsTrigger>
            <TabsTrigger value="reviews" className="text-lg px-8 py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-primary border-b-4 border-transparent bg-transparent transition-all">Reviews & Ratings</TabsTrigger>
            <TabsTrigger value="faqs" className="text-lg px-8 py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-primary border-b-4 border-transparent bg-transparent transition-all">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Key Specifications</h3>
                <ul className="space-y-4 text-muted-foreground list-disc pl-5">
                  <li>Premium Quality Cotton Material</li>
                  <li>Breathable and Sweat Resistant</li>
                  <li>Eco-Friendly Dyes and Treatments</li>
                  <li>Machine Washable &amp; Shrink Resistant</li>
                </ul>
              </div>
              <div className="bg-secondary/30 p-8 rounded-3xl">
                <h4 className="font-bold mb-4">Manufacturer Information</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Produced in accordance with international quality standards. Designed for durability and the ultimate comfort. Style.co ensures ethical sourcing for all materials used in this garment.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
                All Reviews
                <span className="text-muted-foreground font-normal ml-3 text-sm sm:text-lg opacity-60">({product?.reviews?.length || 0})</span>
              </h3>
              <Button onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                  return;
                }
                setIsReviewing((prev) => !prev);
              }} className="w-full sm:w-auto rounded-full px-10 py-7 text-xs font-black uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all shadow-xl">
                {isReviewing ? "Cancel Review" : "Write a Review"}
              </Button>
            </div>
            {isAuthenticated && isReviewing && (
              <div className="mb-10 rounded-[2rem] border border-white/10 bg-zinc-950/95 p-6 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.75)]">
                <div className="mb-5">
                  <h4 className="text-2xl font-bold tracking-tight text-white">Write your review</h4>
                  <p className="mt-2 text-sm text-zinc-400">Reviews are accepted only after delivery. If your order has been delivered, share your honest experience.</p>
                </div>
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm uppercase tracking-[0.25em] text-zinc-400">Rating</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        const active = reviewRating >= value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewRating(value)}
                            aria-label={`${value} star`}
                            className={`flex h-12 w-12 items-center justify-center rounded-full border transition duration-200 ${
                              active
                                ? "border-amber-400 bg-amber-400/15 text-amber-300 shadow-[0_18px_40px_-26px_rgba(245,158,11,0.9)]"
                                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/30 hover:bg-white/15"
                            }`}
                          >
                            <Star
                              className={`h-5 w-5 ${active ? "fill-current text-amber-400" : "text-zinc-400"}`}
                              fill={active ? "currentColor" : "none"}
                              stroke="currentColor"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-500">Tap a star for your rating, then tell us what worked and what could improve.</div>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows={5}
                  placeholder="Share your experience with the product, fit, quality, and delivery."
                  className="w-full rounded-[1.75rem] border border-white/10 bg-zinc-900/90 px-5 py-4 text-sm text-white outline-none transition-colors duration-200 placeholder:text-zinc-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-zinc-400">Your review will be validated after delivery.</div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                    className="w-full sm:w-auto rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest shadow-xl"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {product?.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review: any) => (
                  <div key={review.id} className="border-2 rounded-2xl p-8 hover:border-primary/20 transition-all bg-card/10 group min-h-[220px]">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, si) => <Star key={si} size={18} className={si < review.rating ? "fill-current text-amber-500" : "opacity-20"} />)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <span className="font-bold text-lg group-hover:text-primary transition-colors break-words">{review.user_name}</span>
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                         <Check size={10} className="text-white" />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed italic">&quot;{review.comment}&quot;</p>
                    <p className="mt-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Posted on {review.created_at}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="faqs" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="max-w-3xl space-y-8">
              {[
                { q: "Is the sizing accurate?", a: "Yes, our sizes follow standard international charts. We recommend choosing your usual size." },
                { q: "What is your return policy?", a: "We offer a 30-day hassle-free return policy if the tag is intact and item is unworn." },
              ].map((faq, i) => (
                <div key={i} className="border-b pb-6">
                  <h4 className="font-bold text-xl mb-3">{faq.q}</h4>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 uppercase tracking-tighter italic">YOU MIGHT ALSO LIKE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
