import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sun, Moon, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import Logo from "../components/Logo";

// Clean illustration panel showing only the background image (dynamic theme artwork)
const AuthIllustration = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 w-full h-full bg-white dark:bg-black select-none">
      <img 
        src={isDark ? "/auth-art-dark.jpg" : "/auth-art.jpg"} 
        alt="Auth Illustration" 
        className="absolute inset-0 w-full h-full object-cover select-none z-0"
      />
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35 pointer-events-none z-10" />
      )}
    </div>
  );
};

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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const { theme, setTheme } = useTheme();

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-transparent", width: "w-0" };
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-brand-danger", width: "w-1/3" };
    if (score === 2 || score === 3) return { label: "Medium", color: "bg-brand-warning", width: "w-2/3" };
    return { label: "Strong", color: "bg-brand-success", width: "w-full" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      setErrMessage("Please fill in all details");
      return;
    }
    if (!agreeTerms) {
      setErrMessage("Please agree to the terms & policy");
      return;
    }
    if (password !== confirmPassword) {
      setErrMessage("Passwords do not match");
      return;
    }
    setLoading(true);
    setErrMessage("");
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
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden select-none font-sans transition-colors duration-300 bg-transparent">
      
      {/* Animated Mesh Background (only in Dark Mode) */}
      {isDark && (
        <>
          <div className="mesh-bg" />
          <div className="mesh-circle-1" />
          <div className="mesh-circle-2" />
        </>
      )}

      {/* Main Split Glass Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-4xl rounded-[40px] overflow-hidden transition-all duration-300 grid md:grid-cols-12 items-stretch relative z-10 p-3.5 gap-4 border ${
          isDark 
            ? "border-white/10 bg-[#0D0D12] text-white shadow-[0_0_50px_rgba(124,92,255,0.07)]" 
            : "bg-white border-gray-200 text-gray-900 shadow-2xl"
        }`}
      >
        
        {/* Left Side: Auth Illustration Panel (Edge-to-Edge inside the card grid) */}
        <div className="hidden md:flex md:col-span-6 relative overflow-hidden min-w-0">
          <div className="relative rounded-[32px] overflow-hidden w-full h-full min-h-[500px]">
            <AuthIllustration />
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="col-span-12 md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6 relative">
          
          {/* Header Actions (Theme Toggle Switch) */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`absolute top-6 right-6 p-2 rounded-xl border transition-all ${
              isDark 
                ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
            }`}
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <div className="w-8 h-8 rounded-lg border border-green-600 dark:border-brand-primary flex items-center justify-center bg-transparent">
                <Logo size={16} className="text-green-600 dark:text-brand-primary" />
              </div>
              <span className={`font-bold text-sm tracking-widest uppercase ${
                isDark ? "text-white glow-text" : "text-gray-900"
              }`}>Zero</span>
            </div>

            {/* Header Text */}
            <div className="space-y-1 mb-2 text-center md:text-left">
              <h2 className="text-2xl font-extrabold tracking-tight">Hi User</h2>
              <p className={`text-xs ${isDark ? "text-brand-muted" : "text-gray-500"}`}>
                Create your Zero simulated banking account.
              </p>
            </div>

            {/* Warning Banner */}
            {errMessage && (
              <div className={`p-2.5 rounded-xl border text-xs font-medium ${
                errMessage.includes("simulated")
                  ? (isDark ? "bg-[#4F8CFF]/10 border-[#4F8CFF]/20 text-[#4F8CFF]" : "bg-blue-50 border-blue-200 text-blue-800")
                  : (isDark ? "bg-brand-danger/10 border-brand-danger/20 text-brand-danger" : "bg-red-50 border-red-200 text-red-800")
              }`}>
                {errMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              
              {/* Name */}
              <div className="space-y-1">
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Name"
                  className={`w-full h-10 px-4 border rounded-xl text-xs transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:border-white/20 focus:border-brand-primary focus:bg-white/[0.08] text-white placeholder-white/30"
                      : "bg-white border-gray-300 hover:border-gray-400 focus:border-brand-primary text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-brand-primary/20"
                  }`}
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={`w-full h-10 px-4 border rounded-xl text-xs transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:border-white/20 focus:border-brand-primary focus:bg-white/[0.08] text-white placeholder-white/30"
                      : "bg-white border-gray-300 hover:border-gray-400 focus:border-brand-primary text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-brand-primary/20"
                  }`}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number"
                  className={`w-full h-10 px-4 border rounded-xl text-xs transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:border-white/20 focus:border-brand-primary focus:bg-white/[0.08] text-white placeholder-white/30"
                      : "bg-white border-gray-300 hover:border-gray-400 focus:border-brand-primary text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-brand-primary/20"
                  }`}
                  required
                />
              </div>

              {/* Passwords Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className={`w-full h-10 pl-4 pr-10 border rounded-xl text-xs transition-all ${
                        isDark
                          ? "bg-white/5 border-white/10 hover:border-white/20 focus:border-brand-primary focus:bg-white/[0.08] text-white placeholder-white/30"
                          : "bg-white border-gray-300 hover:border-gray-400 focus:border-brand-primary text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-brand-primary/20"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className={`w-full h-10 pl-4 pr-10 border rounded-xl text-xs transition-all ${
                        isDark
                          ? "bg-white/5 border-white/10 hover:border-white/20 focus:border-brand-primary focus:bg-white/[0.08] text-white placeholder-white/30"
                          : "bg-white border-gray-300 hover:border-gray-400 focus:border-brand-primary text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-brand-primary/20"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="space-y-1 px-1 py-0.5">
                  <div className="flex justify-between items-center text-[8px] font-bold text-brand-muted uppercase">
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

              {/* Terms Checkbox */}
              <div className="flex items-center pt-0.5">
                <input 
                  id="agree" 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className={`w-4 h-4 rounded transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary/20"
                      : "border-gray-300 bg-white text-brand-primary focus:ring-brand-primary/20"
                  }`}
                  required
                />
                <label htmlFor="agree" className={`ml-2 text-[10px] font-semibold select-none ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>I agree to the terms & policy</label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs mt-3 btn-interactive-accent"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
                ) : (
                  "Signup"
                )}
              </button>
            </form>
          </div>

          {/* Footer details */}
          <div className="space-y-4 text-center mt-2">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 font-semibold">
              Already have an account?{" "}
              <Link to="/login" className="font-bold hover:underline transition-all text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-brand-primary">Sign In</Link>
            </p>

            <div className="flex justify-center gap-4 text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-white/5">
              <a href="#" className="hover:text-green-600 dark:hover:text-brand-primary transition-colors"><Facebook size={16} /></a>
              <a href="#" className="hover:text-green-600 dark:hover:text-brand-primary transition-colors"><Twitter size={16} /></a>
              <a href="#" className="hover:text-green-600 dark:hover:text-brand-primary transition-colors"><Linkedin size={16} /></a>
              <a href="#" className="hover:text-green-600 dark:hover:text-brand-primary transition-colors"><Instagram size={16} /></a>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
