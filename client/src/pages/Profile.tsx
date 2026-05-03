import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Shield, ShoppingBag, LogOut,Package, Heart, LayoutDashboard} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";

type ProfileTab = "dashboard" | "orders" | "wishlist" | "security" | "preferences";

import { cn } from "@/lib/utils";
import { productService } from "@/services/productService";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ProfileTab>("dashboard");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (activeTab === "orders" && user) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const data = await productService.getOrders();
          setOrders(data);
        } catch (e) {}
        setLoadingOrders(false);
      };
      fetchOrders();
    }
  }, [activeTab, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await authService.changePassword(passwordData);
      toast({
        title: "Success",
        description: "Password changed successfully!",
        variant: "default",
      });
      setShowPasswordForm(false);
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const navItems: { label: string; icon: any; tab: ProfileTab }[] = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, tab: "dashboard" },
    { label: "Your Curation", icon: <Heart size={18} />, tab: "wishlist" },
    { label: "Order History", icon: <Package size={18} />, tab: "orders" },
    { label: "Security Info", icon: <Shield size={18} />, tab: "security" },
  ];

  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  return (
    <div className="container-shop py-10 lg:py-20 animate-fade-in">
      <Breadcrumbs customLabel={activeTab === "dashboard" ? "Profile" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
      
      <div className="max-w-6xl mx-auto mt-12 flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
           <div className="flex items-center gap-4 p-6 bg-secondary/30 rounded-3xl mb-8 border border-primary/5">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-xl">
                 {user?.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                 <h4 className="font-black uppercase tracking-tighter truncate leading-none mb-1">{user?.name}</h4>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Active Member</p>
              </div>
           </div>

           <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === item.tab 
                    ? "bg-black text-white shadow-xl translate-x-2" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                   <span className={activeTab === item.tab ? "text-white" : "opacity-40"}>{item.icon}</span>
                   {item.label}
                </button>
              ))}
              
              <div className="pt-8 mt-8 border-t border-primary/5">
                 <button 
                   onClick={handleLogout}
                   className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all"
                 >
                    <LogOut size={18} className="opacity-40" />
                    Sign Out
                 </button>
              </div>
           </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 min-h-[600px] animate-in fade-in slide-in-from-right duration-700">
           {activeTab === "dashboard" && (
              <div className="space-y-8">
                 <div className="p-10 bg-zinc-900 text-white rounded-[4rem] relative overflow-hidden group shadow-2xl min-h-[340px] flex flex-col justify-end cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black to-zinc-800 opacity-50" />
                    <ShoppingBag className="absolute right-[-40px] top-[-40px] w-80 h-80 opacity-5 rotate-12 group-hover:rotate-[-5deg] group-hover:scale-110 transition-all duration-1000 ease-out" />
                    <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-5 block">Personal Account Vault</span>
                       <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-8">Welcome back,<br/> {user?.name.split(' ')[0]}</h2>
                       <Button 
                          onClick={() => navigate("/products")} 
                          className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-12 h-14 font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all"
                       >
                          Explore Collection
                       </Button>
                    </div>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-8">
                    <div className="p-10 bg-card border border-primary/5 rounded-[3rem] hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden" onClick={() => setActiveTab("wishlist")}>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
                       <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-500 shadow-sm relative z-10 border border-zinc-200 dark:border-white/5">
                          <Heart size={24} className={wishlistItems.length > 0 ? "fill-current" : ""} />
                       </div>
                       <div className="relative z-10 group-hover:translate-x-1 transition-transform duration-500">
                          <h4 className="text-2xl font-black uppercase tracking-tighter mb-1">Curation Archive</h4>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">{wishlistItems.length} items saved</p>
                       </div>
                    </div>
                    <div className="p-10 bg-card border border-primary/5 rounded-[3rem] hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden" onClick={() => setActiveTab("orders")}>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
                       <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-500 shadow-sm relative z-10 border border-zinc-200 dark:border-white/5">
                          <Package size={24} />
                       </div>
                       <div className="relative z-10 group-hover:translate-x-1 transition-transform duration-500">
                          <h4 className="text-2xl font-black uppercase tracking-tighter mb-1">Order History</h4>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">{orders.length > 0 ? `${orders.length} orders found` : "No orders yet"}</p>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === "wishlist" && (
              <div className="animate-in fade-in slide-in-from-bottom duration-700">
                 <div className="flex flex-col mb-10 border-l-2 border-black dark:border-white pl-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-1.5 opacity-30">Selection Archive</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none">Your Curation</h2>
                 </div>
                 {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                       {wishlistItems.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                 ) : (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-100 dark:border-white/5">
                       <Heart size={32} className="mx-auto mb-6 opacity-20" />
                       <h4 className="text-2xl font-black uppercase tracking-tighter mb-10 italic">Empty Archive.</h4>
                       <Button 
                          onClick={() => navigate("/products")} 
                          className="rounded-full px-12 h-14 bg-transparent border-2 border-primary/20 text-foreground hover:bg-foreground hover:text-background font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all duration-500"
                       >
                          Explore Collection
                       </Button>
                    </div>
                 )}
              </div>
           )}

           {activeTab === "orders" && (
               <div className="animate-in fade-in slide-in-from-bottom duration-700">
                  <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">Recent Orders</h2>
                  
                  {loadingOrders ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2].map(i => (
                        <div key={i} className="h-24 bg-secondary/50 rounded-[2rem]" />
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                       {orders.map(order => (
                                       <div
                                          key={order.id}
                                          className="p-8 rounded-[2rem] flex items-center justify-between group cursor-pointer transition-all duration-300 border border-zinc-200 dark:border-zinc-700 shadow-lg bg-white dark:bg-zinc-800 hover:shadow-xl"
                                          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.06)" }}
                                       >
                            <div className="flex items-center gap-6">
    <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-zinc-700 shadow-md">
      {order.items?.[0]?.product_image ? (
  <img
    src={order.items[0].product_image}
    alt={order.items[0].product_name}
    className="object-cover w-full h-full"
  />
) : (
        <span className="text-xs text-muted-foreground font-bold">No Image</span>
      )}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
      <h4 className="text-lg font-black uppercase tracking-tighter truncate max-w-[200px]">{order.items?.[0]?.product_name || "Boutique Archive Item"}</h4>
    </div>
  </div>
  <div className="text-right">
    <p className="text-lg font-black tracking-tighter">${Number(order.total_amount).toFixed(2)}</p>
    <p className={cn(
      "text-[9px] font-bold uppercase tracking-widest transition-colors",
      order.status === "Pending" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
    )}>{order.status}</p>
  </div>
</div>
                       ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-secondary/30 rounded-[3rem] border border-dashed border-primary/10">
                       <Package size={32} className="mx-auto mb-6 opacity-20" />
                       <h4 className="text-2xl font-black uppercase tracking-tighter mb-10 italic">Your history is currently empty.</h4>
                    </div>
                  )}
               </div>
           )}

           {activeTab === "security" && (
              <div className="animate-in fade-in slide-in-from-bottom duration-700 max-w-xl">
                 <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">Security Info</h2>
                 <div className="space-y-6">
                    {/* Password Change Section */}
                    <div className="p-8 bg-card border rounded-[2rem]">
                       <div className="flex items-center justify-between mb-4">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">Password</label>
                          {!showPasswordForm && (
                            <button 
                              onClick={() => setShowPasswordForm(true)}
                              className="text-[9px] font-black uppercase text-primary border-b border-primary/20 hover:border-primary pb-0.5 transition-all"
                            >
                              Change
                            </button>
                          )}
                       </div>
                       
                       {showPasswordForm ? (
                         <form onSubmit={handleChangePassword} className="space-y-4">
                           <div>
                             <input 
                               type="password" 
                               placeholder="Current Password"
                               value={passwordData.current_password}
                               onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                               className="w-full bg-secondary/50 rounded-xl px-5 py-4 text-xs font-bold border-2 border-transparent focus:border-primary/20"
                               required
                             />
                           </div>
                           <div>
                             <input 
                               type="password" 
                               placeholder="New Password"
                               value={passwordData.new_password}
                               onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                               className="w-full bg-secondary/50 rounded-xl px-5 py-4 text-xs font-bold border-2 border-transparent focus:border-primary/20"
                               required
                               minLength={8}
                             />
                           </div>
                           <div>
                             <input 
                               type="password" 
                               placeholder="Confirm New Password"
                               value={passwordData.confirm_password}
                               onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                               className="w-full bg-secondary/50 rounded-xl px-5 py-4 text-xs font-bold border-2 border-transparent focus:border-primary/20"
                               required
                             />
                           </div>
                           <div className="flex gap-3 pt-2">
                             <Button 
                               type="submit"
                               disabled={changingPassword}
                               className="flex-1 rounded-xl h-11 font-black uppercase tracking-widest text-[10px]"
                             >
                               {changingPassword ? "Changing..." : "Update Password"}
                             </Button>
                             <Button 
                               type="button"
                               variant="outline"
                               onClick={() => {
                                 setShowPasswordForm(false);
                                 setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
                               }}
                               className="flex-1 rounded-xl h-11 font-black uppercase tracking-widest text-[10px]"
                             >
                               Cancel
                             </Button>
                           </div>
                         </form>
                       ) : (
                         <div className="relative">
                           <input type="password" value="••••••••••••" readOnly className="w-full bg-secondary/50 rounded-xl px-5 py-4 text-xs font-bold border-2 border-transparent" />
                         </div>
                       )}
                    </div>
                    
                              {/* Two-Factor Authentication Section */}
                              <div
                                 className="p-8 rounded-[2rem] flex items-center justify-between group cursor-pointer transition-all duration-300 border border-zinc-200 dark:border-zinc-700 shadow-lg backdrop-blur-md bg-white/70 dark:bg-zinc-800/70 hover:bg-white/90 dark:hover:bg-zinc-900/80 hover:border-emerald-400/60"
                                 style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/90 text-white rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-400 group-hover:scale-110">
                                       <Shield size={18} className="transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-black uppercase tracking-tight">Two-Factor ID</h4>
                                       <p className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">Identity protection active</p>
                                    </div>
                                 </div>
                                 <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-400 group-hover:text-white group-hover:scale-110">
                                    <Shield size={16} className="fill-current transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                                 </div>
                              </div>
                 </div>
              </div>
           )}
        </main>
      </div>
    </div>
  );
}
