import { useAppSelector, useAppDispatch } from "@/store";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { clearCart } from "@/store/slices/cartSlice";
import { ChevronRight, CreditCard, ShieldCheck, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import apiClient from "@/api/apiClient";

export default function Checkout() {
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const discount = subtotal * 0.2;
  const delivery = 15;
  const total = subtotal - discount + delivery;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please login to place an order." });
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    try {
      const orderPayload = {
        total_amount: Number(total.toFixed(2)),
        items: items.map(item => ({
          product_id: Number(String(item.product.id).replace("p", "")),
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.product.price
        }))
      };

      const response = await apiClient.post('orders/', orderPayload);
      
      dispatch(clearCart());
      toast.success("Order confirmed!", {
        description: `Order ID: #ORD-${response.data.id} is being processed.`,
      });
      navigate("/");
    } catch (error: any) {
      toast.error("Checkout failed", {
        description: error.response?.data?.detail || "Connection error."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-shop py-32 text-center animate-fade-in">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 opacity-40 italic">Your cart is currently empty</h1>
        <Link to="/products" className="inline-block mt-4">
          <Button 
            className="rounded-full px-12 h-14 bg-transparent border-2 border-primary/20 text-foreground hover:bg-foreground hover:text-background font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all duration-500"
          >
            Start Shopping Archive
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-10 animate-fade-in">
       {/* Breadcrumb */}
       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8">
        <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-foreground border-b-2 border-primary/10 pb-0.5">Checkout</span>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <div className="flex items-center justify-between relative px-2 sm:px-10">
          <div className="absolute top-[22px] left-[10%] right-[10%] h-[2px] bg-muted-foreground/10 dark:bg-white/5 z-0" />
          <div className="absolute top-[22px] left-[10%] w-[40%] h-[2px] bg-primary z-0" />
          
          {[
            { id: 1, label: "SHOPPING BAG", status: "completed" },
            { id: 2, label: "REVIEW ORDER", status: "active" },
            { id: 3, label: "PAYMENT", status: "pending" },
          ].map((step, index) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 font-black text-xs ${
                  step.status === "completed" 
                    ? "bg-primary border-primary text-primary-foreground shadow-lg scale-110" 
                    : step.status === "active" 
                      ? "bg-background border-primary text-primary shadow-[0_0_20px_rgba(0,0,0,0.1)] scale-110 animate-pulse-subtle" 
                      : "bg-secondary/50 border-transparent text-muted-foreground/40"
                }`}
              >
                {step.status === "completed" ? <Check size={20} /> : step.id}
              </div>
              <span className={`mt-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                step.status === "pending" ? "opacity-30" : "opacity-100"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <h1 className="text-4xl sm:text-5xl font-black mb-10 tracking-tighter uppercase italic text-center">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12">
          <div className="border-2 rounded-2xl p-8 bg-card shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8 border-b-2 pb-6">
              <ShieldCheck className="text-success" size={28} />
              <h2 className="text-2xl font-bold">Secure Checkout</h2>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase opacity-60 mb-2">Shipping Information</h4>
                <p className="font-bold text-lg">{user?.name}</p>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-muted-foreground mt-1 underline cursor-pointer">Edit Shipping Address</p>
              </div>

              <div className="pt-6 border-t font-bold">
                <h4 className="text-sm font-bold text-muted-foreground uppercase opacity-60 mb-4">Order Summary</h4>
                <div className="space-y-3">
                   {items.map(item => (
                     <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                        <span>{item.product.name} (x{item.quantity})</span>
                        <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="pt-6 border-t space-y-3 font-bold">
                <div className="flex justify-between text-muted-foreground">
                   <span>Subtotal</span>
                   <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sale">
                   <span>Discount</span>
                   <span>-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground font-bold">
                   <span>Delivery</span>
                   <span className="text-foreground">${delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl pt-4 font-extrabold border-t-2">
                   <span>Total</span>
                   <span className="tracking-tighter">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full rounded-pill py-6 sm:py-8 text-lg sm:text-xl font-bold uppercase shadow-xl relative overflow-hidden" 
              onClick={handlePlaceOrder}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing Order..." :<>Complete Purchase <CreditCard size={20} className="ml-2" /></>}
              {isProcessing && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-loading-stripes" />}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-6">By clicking &quot;Complete Purchase&quot;, you agree to shop.co terms & conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
