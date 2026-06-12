import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-transparent", width: "w-0" };
    if (password.length < 6) return { label: "Weak", color: "bg-brand-danger", width: "w-1/3" };
    
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasLetters && hasNumbers && hasSpecial && password.length >= 8) {
      return { label: "Strong", color: "bg-brand-success", width: "w-full" };
    }
    return { label: "Medium", color: "bg-brand-warning", width: "w-2/3" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMessage("");

    if (!fullName || !email || !phoneNumber || !password) {
      setErrMessage("All fields are required");
      return;
    }

    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      setErrMessage("Phone number must be exactly 10 digits");
      return;
    }

    if (password !== confirmPassword) {
      setErrMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, phoneNumber, password);
      navigate("/dashboard");
    } catch (err) {
      setErrMessage(err.message || "Failed to create account. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

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
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-[#7C5CFF]/15 via-transparent to-[#4F8CFF]/5 border-r border-white/5 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] rounded-full bg-brand-primary/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-brand-secondary/10 blur-[80px] pointer-events-none" />
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#4F8CFF] flex items-center justify-center shadow-lg glow-primary">
              <span className="font-bold text-white text-lg">A</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white glow-text">AuraBank</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-snug">
              Unlock the Aura Account benefits
            </h1>
            <ul className="space-y-4">
              {[
                "Connect up to 3 bank accounts in one place",
                "Instant UPI address generation and resolution",
                "Real-time audited transaction history passbook",
                "Advanced Saga rollback transaction protection"
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-brand-muted">
                  <CheckCircle2 size={18} className="text-brand-primary flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="text-brand-success" size={20} />
            </div>
            <span className="text-xs font-semibold tracking-wider text-brand-muted uppercase">Secure Sandbox Infrastructure</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="col-span-12 md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-brand-surface/40">
          <div className="space-y-2 mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
            <p className="text-brand-muted text-sm">Join millions of users managing wealth securely.</p>
          </div>

          {errMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs font-medium">
              {errMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Address & Phone Number Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type="text" 
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-11 pl-12 pr-10 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm"
                    className="w-full h-11 pl-12 pr-10 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1 px-1 py-0.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-brand-muted uppercase">
                  <span>Password Strength</span>
                  <span className={
                    strength.label === "Weak" 
                      ? "text-brand-danger" 
                      : strength.label === "Medium" 
                      ? "text-brand-warning" 
                      : "text-brand-success"
                  }>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
              </div>
            )}

            {/* Terms and conditions */}
            <p className="text-[10px] text-brand-muted leading-relaxed select-none py-1">
              By creating an account, you agree to AuraBank's terms of service, sandbox conditions, and simulation routing rules.
            </p>

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
                  Register Aura Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-white/5 my-6" />

          <p className="text-center text-xs text-brand-muted font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-primary font-bold hover:underline transition-all">Sign In</Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
}
