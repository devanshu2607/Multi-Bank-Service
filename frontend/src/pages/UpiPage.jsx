import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/layouts/DashboardLayout";
import { upiApi, bankApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Building, Info, Smartphone, Plus, Check, CheckCircle2 } from "lucide-react";

export default function UpiPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [upiProfiles, setUpiProfiles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New UPI Handle Form
  const [newHandle, setNewHandle] = useState("");
  const [newLinkAccount, setNewLinkAccount] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUpiData();
    }
  }, [user]);

  const loadUpiData = async () => {
    try {
      setLoading(true);
      const profiles = await upiApi.getProfiles(user.id);
      setUpiProfiles(profiles);

      const accountsList = await bankApi.getAccounts(user.id);
      setAccounts(accountsList);
      if (accountsList.length > 0) {
        setNewLinkAccount(accountsList[0].accountNumber);
      }
    } catch (err) {
      showToast("Error loading", "Could not fetch UPI profile settings", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpi = async (e) => {
    e.preventDefault();
    if (!newHandle || !newLinkAccount) {
      showToast("Validation Error", "Please provide a handle name and link an account", "warning");
      return;
    }

    const cleanHandle = newHandle.includes("@") ? newHandle : `${newHandle}@aura`;
    setCreating(true);
    try {
      await upiApi.createProfile(
        user.id,
        cleanHandle,
        user.phoneNumber || "0000000000",
        newLinkAccount
      );
      showToast("UPI Handle Linked", `Registered new address: ${cleanHandle}`, "success");
      setNewHandle("");
      loadUpiData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to create UPI ID";
      showToast("Registration Failed", errMsg, "danger");
    } finally {
      setCreating(false);
    }
  };

  const handleDefaultAccountChange = async (upiId, defaultAccountNum) => {
    try {
      await upiApi.updateDefaultAccount(upiId, defaultAccountNum, user.id);
      showToast("Default Account Changed", `Updated linked account for ${upiId}`, "success");
      loadUpiData();
    } catch (err) {
      showToast("Update Failed", "Could not modify default account mapping", "danger");
    }
  };

  // Mock SVG QR Code
  const renderQrCode = (upiId) => {
    return (
      <svg className="w-40 h-40 bg-white p-2.5 rounded-2xl shadow-xl" viewBox="0 0 100 100">
        {/* Border / alignment patterns mock */}
        <rect x="0" y="0" width="25" height="25" fill="#090E1A" />
        <rect x="3" y="3" width="19" height="19" fill="#fff" />
        <rect x="6" y="6" width="13" height="13" fill="#090E1A" />

        <rect x="75" y="0" width="25" height="25" fill="#090E1A" />
        <rect x="78" y="3" width="19" height="19" fill="#fff" />
        <rect x="81" y="6" width="13" height="13" fill="#090E1A" />

        <rect x="0" y="75" width="25" height="25" fill="#090E1A" />
        <rect x="3" y="78" width="19" height="19" fill="#fff" />
        <rect x="6" y="81" width="13" height="13" fill="#090E1A" />

        {/* Center Aura Icon */}
        <rect x="42" y="42" width="16" height="16" rx="4" fill="#7C5CFF" />

        {/* Random dots mock */}
        <rect x="35" y="5" width="5" height="15" fill="#090E1A" />
        <rect x="45" y="15" width="15" height="5" fill="#090E1A" />
        <rect x="65" y="20" width="5" height="10" fill="#090E1A" />
        <rect x="5" y="35" width="15" height="5" fill="#090E1A" />
        <rect x="25" y="45" width="10" height="10" fill="#090E1A" />
        <rect x="5" y="55" width="5" height="15" fill="#090E1A" />
        <rect x="70" y="35" width="15" height="5" fill="#090E1A" />
        <rect x="85" y="45" width="10" height="10" fill="#090E1A" />
        <rect x="35" y="65" width="15" height="5" fill="#090E1A" />
        <rect x="55" y="75" width="5" height="15" fill="#090E1A" />
        <rect x="75" y="65" width="5" height="10" fill="#090E1A" />
        <rect x="25" y="85" width="15" height="5" fill="#090E1A" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-2xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-white/5 rounded-3xl" />
          <div className="h-96 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <QrCode size={18} className="text-brand-primary animate-bounce" />
          <span className="text-sm font-semibold tracking-wider text-brand-primary uppercase">Simulated UPI</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">UPI Profiles & Addresses</h2>
        <p className="text-brand-muted text-xs mt-1">Configure virtual transaction handles and mock instant QR mappings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Linked Profiles */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-bold text-lg text-white">Registered UPI Addresses</h3>
          
          {upiProfiles.length === 0 ? (
            <div className="p-10 text-center rounded-[32px] border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-3">
              <QrCode size={36} className="text-brand-muted animate-spin" />
              <p className="text-brand-muted text-xs font-semibold">No UPI handles active. Create one to enable instant phone transfers.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upiProfiles.map((profile) => (
                <div 
                  key={profile.upiId}
                  className="p-6 rounded-[32px] glass-panel border border-white/5 grid md:grid-cols-12 gap-6 items-center"
                >
                  {/* Left Column: Details */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase text-brand-muted tracking-widest">{profile.bankCode} Clearing link</span>
                        <span className="px-2 py-0.5 rounded-full bg-brand-success/15 border border-brand-success/25 text-[8px] text-brand-success font-bold uppercase tracking-wider">Default</span>
                      </div>
                      <h4 className="text-lg font-bold text-white tracking-tight font-mono">{profile.upiId}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <span className="text-[9px] text-brand-muted uppercase block">Linked Account</span>
                        <span className="text-white text-xs">{profile.defaultAccountNumber}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-brand-muted uppercase block">Mobile Number</span>
                        <span className="text-white text-xs">{profile.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block">Update Default account</label>
                      <select 
                        value={profile.defaultAccountNumber}
                        onChange={(e) => handleDefaultAccountChange(profile.upiId, e.target.value)}
                        className="h-10 px-3 bg-white/5 border border-white/5 rounded-xl text-xs focus:outline-none text-white focus:bg-white/[0.08]"
                      >
                        {accounts.map(acc => (
                          <option key={acc.accountNumber} value={acc.accountNumber}>
                            {acc.bankCode} (•••• {acc.accountNumber.slice(-4)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column: QR Mappings */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center gap-2 py-2 border-t md:border-t-0 md:border-l border-white/5 md:pl-6">
                    {renderQrCode(profile.upiId)}
                    <span className="text-[10px] text-brand-muted tracking-wider uppercase mt-1 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-brand-success" />
                      Scan QR to request funds
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Register Form */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-bold text-lg text-white">Create Handle</h3>
          
          <form onSubmit={handleCreateUpi} className="p-6 sm:p-8 rounded-[32px] glass-panel border border-white/5 space-y-4">
            
            {/* Handle Suffix Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Choose Handle Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  placeholder="e.g. user"
                  className="w-full h-11 pl-4 pr-16 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-muted">@aura</span>
              </div>
            </div>

            {/* Default Account Link */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Link Bank Account</label>
              <select 
                value={newLinkAccount}
                onChange={(e) => setNewLinkAccount(e.target.value)}
                className="w-full h-11 px-3 bg-white/5 border border-white/5 rounded-2xl text-xs focus:outline-none text-white focus:border-brand-primary/40 focus:bg-white/[0.08]"
                required
              >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.bankCode} - {acc.accountNumber} (Bal: ₹{acc.balance})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile info */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Mobile Number link</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="text" 
                  value={user?.phoneNumber || ""} 
                  disabled 
                  className="w-full h-11 pl-10 pr-4 bg-white/5 border border-transparent rounded-2xl text-xs text-brand-muted select-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-2.5 text-[10px] text-brand-muted leading-relaxed">
              <Info size={16} className="text-brand-secondary flex-shrink-0 mt-0.5" />
              <span>UPI resolution allows phone number queries. Only one default bank can be linked per UPI ID.</span>
            </div>

            <button
              type="submit"
              disabled={creating || accounts.length === 0}
              className="w-full h-11 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-95 transition-all text-white disabled:opacity-50"
            >
              {creating ? (
                <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
              ) : (
                <>
                  Register UPI Profile
                  <Plus size={16} />
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
