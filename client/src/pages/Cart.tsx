import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store";
import { removeItem, updateQuantity, removeItemFromServer, updateQuantityOnServer } from "@/store/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Minus, Plus, Trash2, Tag, ShoppingBag, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import apiClient from "@/api/apiClient";

const getColorName = (color: any): string => {
  if (!color) return "";
  if (typeof color === "object") return color.name || "";
  return String(color);
};

export default function Cart() {
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [promoCode, setPromoCode]       = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult]   = useState<{ valid: boolean; discount_percent?: number; message: string } | null>(null);

  const totalPrice  = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 15 : 0;
  const baseDiscount = totalPrice * 0.2;
  const promoDiscount = promoResult?.valid ? totalPrice * (promoResult.discount_percent! / 100) : 0;
  const totalDiscount = baseDiscount + promoDiscount;
  const finalTotal  = totalPrice - totalDiscount + deliveryFee;

  const handleRemove = (item: any) => {
    if (isAuthenticated && item.backendId) {
      dispatch(removeItemFromServer(item.backendId));
    } else {
      dispatch(removeItem({ productId: item.product.id, size: item.size, color: item.color }));
    }
  };

  const handleQuantity = (item: any, quantity: number) => {
    if (isAuthenticated && item.backendId) {
      dispatch(updateQuantityOnServer({ backendId: item.backendId, quantity }));
    } else {
      dispatch(updateQuantity({ productId: item.product.id, size: item.size, color: item.color, quantity }));
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const res = await apiClient.post("promo/validate/", { code: promoCode.trim().toUpperCase() });
      setPromoResult(res.data);
    } catch (err: any) {
      setPromoResult({
        valid: false,
        message: err.response?.data?.message || "Invalid or expired promo code.",
      });
    } finally {
      setPromoLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-shop py-32 text-center animate-fade-in text-foreground">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-secondary rounded-full mb-6">
          <ShoppingBag size={48} className="text-muted-foreground opacity-20" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">YOUR CART IS EMPTY</h1>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Explore our latest arrivals to find something you love.</p>
        <Link to="/products">
          <Button className="rounded-pill px-14 py-8 text-lg font-bold shadow-xl">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-10 animate-fade-in">
      <Breadcrumbs />
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 tracking-tighter">YOUR CART</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart items */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-2 rounded-2xl overflow-hidden bg-card/10 p-2 sm:p-4">
            {items.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.size}-${getColorName(item.color)}`}
                className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-5 ${idx !== items.length - 1 ? 'border-b-2' : ''}`}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 border">
                  <OptimizedImage
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-base md:text-lg uppercase tracking-tight break-words">{item.product.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium italic">
                        Size: <span className="text-foreground">{item.size}</span> · Color: <span className="text-foreground">{getColorName(item.color)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="text-destructive p-3 sm:p-2 hover:bg-destructive/10 rounded-full transition-colors shrink-0 ml-2"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-extrabold text-lg sm:text-xl md:text-2xl">${(item.product.price * item.quantity).toFixed(2)}</span>
                    <div className="flex items-center bg-secondary rounded-pill p-1 border shrink-0">
                      <button
                        type="button"
                        className="p-2 hover:scale-110 transition-transform"
                        onClick={() => handleQuantity(item, Math.max(1, item.quantity - 1))}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        className="p-2 hover:scale-110 transition-transform"
                        onClick={() => handleQuantity(item, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-5 h-fit sticky top-24">
          <div className="border-2 rounded-2xl p-8 bg-card/20 shadow-sm">
            <h3 className="text-2xl font-extrabold mb-8 tracking-tight text-foreground">ORDER SUMMARY</h3>
            <div className="space-y-5 text-base">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-bold uppercase tracking-widest text-xs opacity-60">Subtotal</span>
                <span className="font-bold text-foreground text-lg">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest text-xs opacity-60 text-muted-foreground">Discount (-20%)</span>
                <span className="font-bold text-sale text-lg">-${baseDiscount.toFixed(2)}</span>
              </div>
              {promoResult?.valid && (
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-xs text-green-500">
                    Promo ({promoResult.discount_percent}% off)
                  </span>
                  <span className="font-bold text-green-500 text-lg">-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest text-xs opacity-60 text-muted-foreground">Delivery Fee</span>
                <span className="font-bold text-foreground text-lg">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t-2 pt-6 flex justify-between items-center">
                <span className="text-xl font-extrabold tracking-tight">TOTAL</span>
                <span className="text-3xl font-extrabold tracking-tighter">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <div className="relative flex-1">
                <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Add promo code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoResult(null);
                  }}
                  className="w-full bg-secondary rounded-pill pl-12 pr-4 py-4 text-sm font-bold border-2 border-transparent focus:border-primary transition-all focus:outline-none uppercase"
                />
              </div>
              <Button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
                className="rounded-pill px-8 font-bold h-auto py-4"
              >
                {promoLoading ? "..." : "Apply"}
              </Button>
            </div>

            {/* Promo result message */}
            {promoResult && (
              <div className={`flex items-center gap-2 mt-3 text-xs font-bold uppercase tracking-widest ${promoResult.valid ? "text-green-500" : "text-destructive"}`}>
                {promoResult.valid
                  ? <CheckCircle2 size={14} />
                  : <XCircle size={14} />
                }
                {promoResult.message}
              </div>
            )}

            <Button
              type="button"
              className="w-full rounded-pill py-8 text-lg font-extrabold mt-8 shadow-xl hover:shadow-primary/10 transition-all uppercase tracking-tight"
              onClick={() => navigate("/checkout", { state: { promoDiscount, promoCode: promoResult?.valid ? promoCode : null } })}
            >
              Go to Checkout <ChevronRight size={20} className="ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-6 font-medium">Secure checkout with 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
