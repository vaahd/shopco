import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginWithJWT, clearError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, Loader2, User, KeyRound, ChevronLeft } from "lucide-react";
import authVibe from "@/assets/auth-vibe.png";

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

function SignInForm({ setMode }: { setMode: (m: any) => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state: any) => state.auth);
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(loginSchema), mode: "onBlur", reValidateMode: "onChange"
  });

  const onSubmit = async (data: any) => {
    const result = await dispatch(loginWithJWT({ email: data.email, password: data.password, rememberMe }));
    if (loginWithJWT.fulfilled.match(result)) {
      toast.success("Identity Verified", { description: "Welcome back." });
      navigate("/");
    } else {
      const msg = (result.payload as any) || "Invalid email or password.";
      setError("email", { message: msg });
      setError("password", { message: "Please check your password." }); 
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} noValidate className="space-y-4">
      <div className="space-y-1">
        <div className="relative group">
          <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-all" />
          <input {...register("email")} type="email" placeholder="EMAIL ADDRESS" className={`w-full rounded-2xl bg-secondary focus:bg-background pl-11 pr-5 py-4 text-xs font-black uppercase tracking-tighter border-2 ${errors.email ? "border-destructive shake" : "border-transparent focus:border-primary/20"}`} />
        </div>
        {errors.email && <p className="text-[9px] text-destructive font-black uppercase tracking-widest ml-4">{String(errors.email.message)}</p>}
      </div>

      <div className="space-y-1">
        <div className="relative group">
          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-all" />
          <input {...register("password")} type="password" placeholder="PASSWORD" className={`w-full rounded-2xl bg-secondary focus:bg-background pl-11 pr-5 py-4 text-xs font-black uppercase tracking-tighter border-2 ${errors.password ? "border-destructive shake" : "border-transparent focus:border-primary/20"}`} />
        </div>
        {errors.password && (
          <p className="text-[9px] text-destructive font-black uppercase tracking-widest ml-4">{String(errors.password.message)}</p>
        )}
      </div>

      <div className="flex justify-between items-center py-2">
         <label className="flex items-center gap-2 cursor-pointer group">
           <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="accent-primary" />
           <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all">Keep me in</span>
         </label>
         <button type="button" onClick={() => setMode("forgot")} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">Forgot Password?</button>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground rounded-full py-5 text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-[1.01] active:scale-95 transition-all">
        {loading ? <Loader2 className="animate-spin inline mr-2" size={15} /> : "Sign In"}
      </button>

      <div className="mt-8 text-center pt-6 border-t font-black uppercase tracking-widest text-[9px]">
        <span className="opacity-40">New here?</span>
        <button type="button" onClick={() => setMode("signup")} className="ml-2 text-primary hover:underline underline-offset-4">CREATE ACCOUNT</button>
      </div>
    </form>
  );
}

function SignUpForm({ setMode }: { setMode: (m: any) => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state: any) => state.auth);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(signupSchema), mode: "onBlur"
  });

  const onSubmit = async (data: any) => {
    const result = await dispatch(loginWithJWT({ email: data.email, password: data.password, name: data.fullName, rememberMe: true }));
    if (loginWithJWT.fulfilled.match(result)) {
      toast.success("Account Ready!", { description: "Welcome to SHOP.CO" });
      navigate("/");
    } else {
      const msg = (result.payload as any) || "Could not create account. Try again.";
      setError("email", { message: msg });
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} noValidate className="space-y-4">
      <div className="space-y-1">
        <div className="relative group">
          <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-all" />
          <input {...register("fullName")} placeholder="FULL NAME" className={`w-full rounded-2xl bg-secondary focus:bg-background pl-11 pr-5 py-4 text-xs font-black uppercase tracking-tighter border-2 ${errors.fullName ? "border-destructive shake" : "border-transparent focus:border-primary/20"}`} />
        </div>
        {errors.fullName && <p className="text-[9px] text-destructive font-black uppercase tracking-widest ml-4">{String(errors.fullName.message)}</p>}
      </div>

      <div className="space-y-1">
        <div className="relative group">
          <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-all" />
          <input {...register("email")} type="email" placeholder="EMAIL ADDRESS" className={`w-full rounded-2xl bg-secondary focus:bg-background pl-11 pr-5 py-4 text-xs font-black uppercase tracking-tighter border-2 ${errors.email ? "border-destructive shake" : "border-transparent focus:border-primary/20"}`} />
        </div>
        {errors.email && <p className="text-[9px] text-destructive font-black uppercase tracking-widest ml-4">{String(errors.email.message)}</p>}
      </div>

      <div className="space-y-1">
        <div className="relative group">
          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-all" />
          <input {...register("password")} type="password" placeholder="PASSWORD" className={`w-full rounded-2xl bg-secondary focus:bg-background pl-11 pr-5 py-4 text-xs font-black uppercase tracking-tighter border-2 ${errors.password ? "border-destructive shake" : "border-transparent focus:border-primary/20"}`} />
        </div>
        {errors.password && <p className="text-[9px] text-destructive font-black uppercase tracking-widest ml-4">{String(errors.password.message)}</p>}
      </div>

      <div className="space-y-1">
        <div className="relative group">
          <KeyRound size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-all" />
          <input {...register("confirmPassword")} type="password" placeholder="CONFIRM PASSWORD" className={`w-full rounded-2xl bg-secondary focus:bg-background pl-11 pr-5 py-4 text-xs font-black uppercase tracking-tighter border-2 ${errors.confirmPassword ? "border-destructive shake" : "border-transparent focus:border-primary/20"}`} />
        </div>
        {errors.confirmPassword && <p className="text-[9px] text-destructive font-black uppercase tracking-widest ml-4">{String(errors.confirmPassword.message)}</p>}
      </div>

      <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground rounded-full py-5 text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-[1.01] active:scale-95 transition-all mt-4">
        {loading ? <Loader2 className="animate-spin inline mr-2" size={15} /> : "Create Account"}
      </button>

      <div className="mt-8 text-center pt-6 border-t font-black uppercase tracking-widest text-[9px]">
        <span className="opacity-40">Joined before?</span>
        <button type="button" onClick={() => setMode("login")} className="ml-2 text-primary hover:underline underline-offset-4">SIGN IN</button>
      </div>
    </form>
  );
}

function RecoveryForm({ setMode }: { setMode: (m: any) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.info("Recovery Initiated", { description: "Check your inbox for the reset link." });
    setMode("login");
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} noValidate className="py-16 text-center animate-in fade-in slide-in-from-bottom-4">
       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 border-b pb-4 border-primary/5">Security Checkpoint</p>
       <div className="space-y-1">
         <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-all" size={15}/>
            <input {...register("email")} type="email" placeholder="ENTER YOUR EMAIL" className={`w-full rounded-2xl bg-secondary focus:bg-background pl-11 pr-5 py-4 text-xs font-black uppercase tracking-tighter border-2 ${errors.email ? "border-destructive shake" : "border-transparent focus:border-primary/20"}`} />
         </div>
         {errors.email && <p className="text-[9px] text-destructive font-black uppercase tracking-widest ml-4">{String(errors.email.message)}</p>}
       </div>
       <button type="submit" className="w-full bg-primary text-primary-foreground rounded-full py-6 mt-6 uppercase font-black tracking-widest text-xs shadow-xl active:scale-95 transition-all">SEND RESET LINK</button>
       
       <button type="button" onClick={() => setMode("login")} className="mt-10 flex items-center justify-center gap-2 w-full text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all hover:text-primary group">
         <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
         BACK TO SIGN IN
       </button>
    </form>
  );
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearError());
  }, [mode, dispatch]);

  return (
    <div className="flex min-h-[90vh] items-center justify-center container-shop py-10 animate-fade-in text-foreground relative">
      <Link to="/" className="fixed top-8 left-8 z-[100] hidden lg:flex items-center gap-2 px-5 py-2.5 bg-card border rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group font-bold uppercase text-[9px] tracking-widest">
         <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
         Home
      </Link>

      <div className="w-full max-w-[820px] h-auto lg:min-h-[640px] bg-card rounded-[2rem] shadow-2xl overflow-hidden border flex flex-col lg:flex-row relative">
        <div className="hidden lg:flex w-[42%] relative bg-zinc-950 group overflow-hidden">
          <img src={authVibe} alt="Boutique vibe" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[4000ms]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="relative z-10 p-10 flex flex-col justify-end h-full text-white">
            <h2 className="text-4xl font-black italic tracking-tighter leading-[1] mb-5">SHOP.CO <br/> THE HUB</h2>
            <div className="h-0.5 w-12 bg-white mb-5 group-hover:w-20 transition-all duration-500" />
            <p className="text-[14px] font-medium opacity-70 leading-relaxed italic border-l-2 pl-4">Curated choice for your fashion appetite.</p>
          </div>
        </div>

        <div className="w-full lg:w-[58%] p-8 sm:p-12 flex flex-col h-full relative overflow-y-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 leading-none italic">
                {mode === "login" ? "SIGN IN" : mode === "signup" ? "REGISTER" : "RECOVERY"}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold opacity-30">SHOP.CO Workspace 0.1</p>
          </div>

          {mode === "login" ? (
             <SignInForm setMode={setMode} />
          ) : mode === "signup" ? (
             <SignUpForm setMode={setMode} />
          ) : (
             <RecoveryForm setMode={setMode} />
          )}
        </div>
      </div>
    </div>
  );
}
