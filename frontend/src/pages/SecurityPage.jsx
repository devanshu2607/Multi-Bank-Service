import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, Check, AlertTriangle, Monitor, Key } from "lucide-react";
import PinModal from "../components/PinModal";

export default function SecurityPage() {
  const { user, changePassword } = useAuth();
  const { showToast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Security Simulator state
  const [twoFactor, setTwoFactor] = useState(true);
  const [recoveryEmail, setRecoveryEmail] = useState("dkoth@gemini.com");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Validation Error", "All password fields are required", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Validation Error", "Passwords do not match", "warning");
      return;
    }
    setUpdating(true);
    try {
      await changePassword(oldPassword, newPassword);
      showToast("Password Changed", "Security credentials modified successfully", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast("Change Failed", err.message || "Failed to update password", "danger");
    } finally {
      setUpdating(false);
    }
  };

  const handle2FAToggle = () => {
    const newState = !twoFactor;
    setTwoFactor(newState);
    showToast(
      newState ? "2FA Enabled" : "2FA Disabled", 
      newState ? "Two-Factor authentication is now active on login" : "Warning: Two-factor authentication disabled", 
      newState ? "success" : "warning"
    );
  };

  const loginLog = [
    { device: "Chrome / Windows 11", location: "Mumbai, IN", ip: "103.45.10.82", time: "Just now", status: "Successful" },
    { device: "Safari / iOS 17.4", location: "Indore, IN", ip: "192.168.1.12", time: "Yesterday, 14:23", status: "Successful" },
    { device: "Firefox / macOS Sonoma", location: "Pune, IN", ip: "172.16.82.9", time: "3 days ago", status: "Successful" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-brand-primary animate-pulse" />
          <span className="text-sm font-semibold tracking-wider text-brand-primary uppercase">Security Center</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">Aura Vault Security</h2>
        <p className="text-brand-muted text-xs mt-1">Configure credentials, monitor logins, and activate multi-factor validations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters / logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Security Score */}
          <div className="p-6 rounded-[32px] glass-panel border border-white/5 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Security Score</span>
              <p className="text-3xl font-extrabold text-white tracking-tight mt-1">85% Secure</p>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-brand-success w-[85%]" />
            </div>
            <p className="text-[10px] text-brand-muted leading-relaxed">
              Enable two-factor authentication and update passwords regularly to achieve 100% security rating.
            </p>
          </div>

          {/* 2FA Toggle Card */}
          <div className="p-6 rounded-[32px] glass-panel border border-white/5 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-sm">Two-Factor Authentication</h4>
              <p className="text-brand-muted text-[10px] mt-0.5">Enforce mobile verification</p>
            </div>
            <button 
              onClick={handle2FAToggle}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors relative ${
                twoFactor ? "bg-brand-success" : "bg-white/10"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${
                twoFactor ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Transaction UPI PIN Card */}
          <div className="p-6 rounded-[32px] glass-panel border border-white/5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm">Transaction UPI PIN</h4>
                <p className="text-brand-muted text-[10px] mt-0.5">Used for UPI payments & transfers</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                localStorage.getItem(`upiPin_${user?.id}`) 
                  ? "bg-brand-success/15 border border-brand-success/25 text-brand-success" 
                  : "bg-brand-warning/15 border border-brand-warning/25 text-brand-warning"
              }`}>
                {localStorage.getItem(`upiPin_${user?.id}`) ? "ACTIVE" : "NOT SET"}
              </span>
            </div>
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="w-full h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-all active:scale-95"
            >
              {localStorage.getItem(`upiPin_${user?.id}`) ? "Reset / Modify UPI PIN" : "Setup 4-Digit UPI PIN"}
            </button>
          </div>

          {/* Login History */}
          <div className="p-6 rounded-[32px] glass-panel border border-white/5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Monitor size={16} className="text-brand-primary" />
              Device Login History
            </h4>
            <div className="space-y-3.5">
              {loginLog.map((log, i) => (
                <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between gap-4 text-xs font-semibold">
                  <div>
                    <h5 className="font-bold text-white">{log.device}</h5>
                    <p className="text-[9px] text-brand-muted mt-0.5">{log.location} • {log.ip}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-brand-success text-[9px] block">{log.status}</span>
                    <span className="text-[9px] text-brand-muted/70 block mt-0.5">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Change Password Form */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-[32px] glass-panel border border-white/5 space-y-6">
          <h3 className="font-bold text-lg text-white">Modify Vault Password</h3>
          
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Current Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type={showOld ? "text" : "password"} 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-11 pl-12 pr-12 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type={showNew ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full h-11 pl-12 pr-12 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Confirm New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify password"
                    className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-2.5 text-[10px] text-brand-muted leading-relaxed">
              <Key size={16} className="text-brand-secondary flex-shrink-0 mt-0.5" />
              <span>Password changes will revoke existing session tokens on all other trusted devices.</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={updating}
              className="h-11 px-5 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-95 transition-all text-white disabled:opacity-50"
            >
              {updating ? (
                <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
              ) : (
                <>
                  Update Security Credentials
                  <Check size={16} />
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      <PinModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          showToast("UPI PIN Configured", "Your transaction credentials have been updated", "success");
        }}
        userId={user?.id}
      />

    </div>
  );
}
