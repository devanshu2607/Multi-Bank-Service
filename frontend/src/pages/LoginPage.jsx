import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Cpu } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrMessage("Please enter email and password");
      return;
    }
    setLoading(true);
    setErrMessage("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setErrMessage(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      
      {/* Animated Mesh Background */}
      <div className="mesh-bg" />
      <div className="mesh-circle-1" />
      <div className="mesh-circle-2" />

      {/* Main Luxury Glass Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl rounded-[32px] glass-panel grid md:grid-cols-12 overflow-hidden shadow-2xl border border-white/5 relative z-10"
      >
        
        {/* Left Side: Illustration / Brand Pitch */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-between p-12 bg-gradient-to-br from-[#7C5CFF]/15 via-transparent to-[#4F8CFF]/5 border-r border-white/5 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] rounded-full bg-brand-primary/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-brand-secondary/10 blur-[80px] pointer-events-none" />
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#4F8CFF] flex items-center justify-center shadow-lg glow-primary">
              <Cpu size={22} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white glow-text">AuraBank</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Experience the Future of Digital Banking
            </h1>
            <p className="text-brand-muted text-sm leading-relaxed">
              Managing wealth has never been this beautiful. Access instant transfers, UPI profiles, multi-bank accounts and real-time ledger records in one premium dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="text-brand-success" size={20} />
            </div>
            <span className="text-xs font-semibold tracking-wider text-brand-muted uppercase">PCI-DSS Compliant & Enforced encryption</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="col-span-12 md:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-brand-surface/40">
          <div className="space-y-2 mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
            <p className="text-brand-muted text-sm">Enter your credentials to access your financial dashboard.</p>
          </div>

          {errMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs font-medium">
              {errMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Password</label>
                <Link to="/help" className="text-xs font-semibold text-[#4F8CFF] hover:text-[#4F8CFF]/80 transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full h-12 pl-12 pr-12 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary focus:ring-opacity-25"
              />
              <label htmlFor="remember" className="ml-2 text-xs font-medium text-brand-muted select-none">Remember this device</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 text-white"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
              ) : (
                <>
                  Sign In to AuraBank
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-white/5 z-0" />
            <span className="relative z-10 px-3 bg-brand-surface/0 text-[10px] uppercase font-bold text-brand-muted tracking-widest bg-brand-bg/0 px-2 py-0.5 rounded">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <button className="h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-2 text-xs font-semibold text-brand-muted hover:bg-white/10 hover:text-white transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-2 text-xs font-semibold text-brand-muted hover:bg-white/10 hover:text-white transition-all">
              <svg className="w-4 h-4" viewBox="0 0 23 23" fill="currentColor">
                <path d="M0 0h11v11H0z" fill="#f25022"/>
                <path d="M12 0h11v11H12z" fill="#7fba00"/>
                <path d="M0 12h11v11H0z" fill="#00a4ef"/>
                <path d="M12 12h11v11H12z" fill="#ffb900"/>
              </svg>
              Microsoft
            </button>
          </div>

          <p className="text-center text-xs text-brand-muted font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-primary font-bold hover:underline transition-all">Create Account</Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
}
