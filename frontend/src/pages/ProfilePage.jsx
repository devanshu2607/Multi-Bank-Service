import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/layouts/DashboardLayout";
import { authApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Calendar, Landmark, ShieldCheck, Save, Clock, Lock, Eye, EyeOff, X } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [updating, setUpdating] = useState(false);

  // Password verification states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) {
      showToast("Validation Error", "All profile fields must be filled", "warning");
      return;
    }
    setConfirmPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handleVerifyAndPasswordUpdate = async (e) => {
    e.preventDefault();
    if (!confirmPassword) return;
    
    setVerifyingPassword(true);
    setPasswordError("");
    try {
      // Verify password by attempting to login with current email
      await authApi.login(user.email, confirmPassword);
      
      // If correct, proceed to update profile
      setUpdating(true);
      setShowPasswordModal(false);
      try {
        await updateProfile(fullName, phoneNumber);
        showToast("Profile Updated", "Your profile details have been synchronized", "success");
      } catch (err) {
        showToast("Update Failed", err.message || "Failed to update profile", "danger");
      } finally {
        setUpdating(false);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Incorrect password. Verification failed.";
      setPasswordError(errMsg);
    } finally {
      setVerifyingPassword(false);
    }
  };

  const activityList = [
    { action: "Profile update synchronized", time: "Just now", desc: "Modified name and phone credentials" },
    { action: "New bank account linked", time: "1 hour ago", desc: "Linked a mock HDFC clearings account" },
    { action: "UPI ID created", time: "Yesterday", desc: "Registered new handle: user@pay" },
    { action: "Initial Registration completed", time: "3 days ago", desc: "AuraBank digital vault initialized" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <User size={18} className="text-brand-primary" />
          <span className="text-sm font-semibold tracking-wider text-brand-primary uppercase">User Vault</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">My Profile Details</h2>
        <p className="text-brand-muted text-xs mt-1">Review contact information, account metrics, and security integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar & Meta */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 text-center rounded-[32px] glass-panel border border-white/5 relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Avatar Big */}
            <div className="w-24 h-24 rounded-3xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-4xl shadow-xl mb-4 relative z-10 glow-primary">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">{user?.fullName || "User Profile"}</h3>
            <p className="text-brand-muted text-xs font-mono mt-1 select-all">{user?.email}</p>

            <div className="w-full grid grid-cols-2 gap-4 text-xs font-medium border-t border-white/5 pt-4 mt-6">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <Landmark className="text-brand-secondary mx-auto mb-1.5" size={16} />
                <span className="text-[9px] text-brand-muted uppercase block">Linked Accounts</span>
                <span className="text-white text-xs font-bold mt-1 block">Active Simulator</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                <ShieldCheck className="text-brand-success mx-auto mb-1.5" size={16} />
                <span className="text-[9px] text-brand-muted uppercase block">Security Score</span>
                <span className="text-brand-success text-xs font-bold mt-1 block">94% SECURE</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[32px] glass-panel border border-white/5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock size={16} className="text-brand-primary" />
              Recent Vault Activity
            </h4>
            <div className="space-y-4 pr-1">
              {activityList.map((act, i) => (
                <div key={i} className="flex gap-3 text-xs leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-white">{act.action}</h5>
                    <p className="text-[10px] text-brand-muted mt-0.5">{act.desc}</p>
                    <span className="text-[9px] text-brand-muted/70 block mt-0.5">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Update Profile Form */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-[32px] glass-panel border border-white/5">
          <h3 className="font-bold text-lg text-white mb-6">Update Profile Information</h3>
          
          <form onSubmit={handleUpdateClick} className="space-y-5">
            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Email Address (Primary Identity)</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="email" 
                  value={user?.email || ""}
                  disabled
                  className="w-full h-11 pl-12 pr-4 bg-white/5 border border-transparent rounded-2xl text-xs text-brand-muted select-all cursor-not-allowed"
                />
              </div>
              <span className="text-[9px] text-brand-muted pl-1">Contact administrator to modify primary authentication email.</span>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Mobile Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="text" 
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10-digit number"
                  className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  required
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={updating}
              className="h-11 px-6 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-95 transition-all text-white disabled:opacity-50"
            >
              {updating ? (
                <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Password Verification Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[32px] glass-panel p-6 shadow-2xl border border-white/5 space-y-4 relative overflow-hidden"
            >
              {/* Close button */}
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/5 text-brand-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Lock size={18} className="text-brand-primary" />
                <h4 className="font-bold text-white text-base">Verify Your Password</h4>
              </div>

              <p className="text-brand-muted text-xs leading-relaxed">
                To keep your account secure, please verify your credentials to confirm these profile changes.
              </p>

              <form onSubmit={handleVerifyAndPasswordUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Account Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full h-11 pl-12 pr-12 bg-white/5 border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <span className="text-brand-danger text-[10px] font-semibold block pl-1">
                      {passwordError}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingPassword}
                    className="flex-1 h-11 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-95 transition-all text-white disabled:opacity-50"
                  >
                    {verifyingPassword ? (
                      <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
                    ) : (
                      "Confirm & Save"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
