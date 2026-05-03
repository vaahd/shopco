import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store";
import { removeItem, updateQuantity, removeItemFromServer, updateQuantityOnServer } from "@/store/slices/cartSlice";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const getColorName = (color: any): string => {
  if (!color) return "";
  if (typeof color === "object") return color.name || "";
  return String(color);
};

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-background/80 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col border-l border-white/5 z-[1001]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg ring-4 ring-primary/10">
              <ShoppingBag size={18} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 leading-none">Your Wardrobe</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
              <div className="opacity-20 animate-pulse">
                <ShoppingBag size={64} strokeWidth={1} />
              </div>
              <div className="space-y-2 opacity-40 italic">
                <p className="text-sm font-black uppercase tracking-[0.2em]">Empty Collection</p>
              </div>
              <Button asChild variant="outline" className="rounded-full px-10 h-12 font-black uppercase tracking-widest text-[10px] border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Link to="/products" onClick={onClose}>Find Style</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${getColorName(item.color)}`} className="flex gap-4 group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary border border-primary/5 flex-shrink-0">
                  <img
                    src={item.product.image?.startsWith("http") ? item.product.image : `http://127.0.0.1:8000${item.product.image}`}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-sm uppercase tracking-tight">{item.product.name}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                      {item.size} / {getColorName(item.color)}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center bg-secondary rounded-full px-2 py-1 gap-3">
                      <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center hover:bg-primary/10 rounded-full transition-all font-black"
                        onClick={() => handleQuantity(item, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </button>
                      <span className="text-xs font-black">{item.quantity}</span>
                      <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center hover:bg-primary/10 rounded-full transition-all font-black"
                        onClick={() => handleQuantity(item, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-black text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-white/5 flex flex-col gap-4 mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Cart Summary</span>
              <span className="text-xl font-black italic tracking-tighter">${subtotal.toFixed(2)}</span>
            </div>
            <Link to="/cart" onClick={onClose} className="block w-full">
              <Button variant="outline" className="w-full rounded-2xl py-6 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-primary/5 hover:border-primary/20 transition-all">
                Review Bag
              </Button>
            </Link>
            <Link to="/checkout" onClick={onClose} className="block w-full">
              <Button className="w-full rounded-2xl py-7 text-xs font-black uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Secure Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <p className="text-center text-[9px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-40 mt-2">
              Complimentary shipping on all orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
