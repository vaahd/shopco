import { Link } from "react-router-dom";
import { Product } from "@/types";
import { StarRating } from "@/components/common/StarRating";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleWishlist, toggleWishlistOnServer } from "@/store/slices/wishlistSlice";
import { toast } from "sonner";
import { getMediaUrl } from "@/utils/media";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch      = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isWishlisted  = wishlistItems.some((item) => item.id === product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated) {
      dispatch(toggleWishlistOnServer(product));
    } else {
      dispatch(toggleWishlist(product));
    }

    if (!isWishlisted) {
      toast.success("SAVED TO ARCHIVE", {
        description: `${product.name.toUpperCase()} HAS BEEN ADDED TO YOUR COLLECTION.`,
        duration: 2000,
      });
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group block animate-fade-in relative">
      <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-4 bg-[#F0EEED] dark:bg-zinc-900 relative">
        <OptimizedImage
          src={getMediaUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 border ${
            isWishlisted
              ? "bg-black text-white border-black scale-105 shadow-xl"
              : "bg-white/80 backdrop-blur-sm text-black border-zinc-200 hover:bg-black hover:text-white hover:border-black transition-colors"
          } active:scale-95`}
        >
          <Heart
            size={16}
            className={`transition-all duration-500 ${isWishlisted ? "fill-current" : ""}`}
          />
        </button>
      </div>
      {product.brand && (
        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/40 block mb-0.5 group-hover:text-primary transition-colors">
          {product.brand}
        </span>
      )}
      <h3 className="font-bold text-foreground text-[13px] sm:text-lg truncate group-hover:text-primary transition-colors uppercase tracking-tight min-w-0">
        {product.name}
      </h3>

      <div className="mt-1.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} />
          <span className="text-[9px] sm:text-xs text-muted-foreground font-medium opacity-60 hidden xs:inline">{product.rating}/5</span>
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3">
          <span className="font-bold text-foreground text-base sm:text-2xl leading-none">${product.price}</span>
          {(product.originalPrice || product.discount) && (
            <div className="flex items-center gap-1.5">
              {product.originalPrice && (
                <span className="text-muted-foreground line-through text-[10px] sm:text-base font-medium opacity-30">${product.originalPrice}</span>
              )}
              {product.discount && (
                <span className="badge-sale !rounded-full !px-1.5 !py-0 sm:!px-2.5 sm:!py-0.5 font-bold !text-[8px] sm:!text-[9px]">
                  -{product.discount}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
