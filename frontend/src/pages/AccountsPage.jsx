import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/layouts/DashboardLayout";
import { bankApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Wallet, ShieldAlert, Sparkles, Building, Trash2, ArrowUpRight, Check } from "lucide-react";

export default function AccountsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Account Form
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [openingBalance, setOpeningBalance] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await bankApi.getAccounts(user.id);
      setAccounts(data);
    } catch (err) {
      showToast("Sync Error", "Could not fetch user bank accounts", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!openingBalance || Number(openingBalance) < 0) {
      showToast("Validation Error", "Please provide a valid starting balance", "warning");
      return;
    }

    setCreating(true);
    try {
      await bankApi.createAccount(
        user.id,
        selectedBank,
        user.fullName,
        Number(openingBalance)
      );
      showToast("Account Linked", `Created new simulator account with ${selectedBank}`, "success");
      setShowModal(false);
      setOpeningBalance("");
      loadAccounts();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to create account";
      showToast("Error", errMsg, "danger");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAccount = async (accountNumber) => {
    if (window.confirm(`Are you sure you want to unlink and delete account ${accountNumber}?`)) {
      try {
        await bankApi.deleteAccount(accountNumber, user.id);
        showToast("Account Unlinked", "Removed banking link successfully", "success");
        loadAccounts();
      } catch (err) {
        showToast("Error", "Could not unlink account", "danger");
      }
    }
  };

  const getIfsc = (bankCode) => {
    return `AURA0${bankCode}09`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-2xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-brand-primary animate-pulse" />
            <span className="text-sm font-semibold tracking-wider text-brand-primary uppercase">My Accounts</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">Manage Bank Accounts</h2>
          <p className="text-brand-muted text-xs mt-1">Configure, debit/credit and resolve mock clearing accounts</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="h-11 px-5 rounded-xl gradient-primary text-xs font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-95 transition-all text-white"
        >
          <Plus size={16} />
          Link New Bank Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="p-16 text-center rounded-[32px] border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto">
          <Building size={48} className="text-brand-muted animate-bounce" />
          <h3 className="text-lg font-bold text-white">No bank accounts linked</h3>
          <p className="text-brand-muted text-xs leading-relaxed max-w-sm">
            Zero simulates real bank clearings. To transfer funds or register UPI IDs, you must first link an account with starting balances.
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="mt-3 h-10 px-6 rounded-xl gradient-primary text-xs font-semibold flex items-center justify-center text-white"
          >
            Create Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc, index) => (
            <motion.div 
              key={acc.accountNumber}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl glass-panel p-6 border border-white/5 flex flex-col justify-between h-64 relative overflow-hidden glass-panel-hover"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Top Details */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold uppercase text-brand-muted tracking-widest">{acc.bankCode} Global</span>
                    <p className="text-sm font-bold text-white">{acc.accountHolderName}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    acc.status === "ACTIVE" 
                      ? "bg-brand-success/10 text-brand-success border border-brand-success/20" 
                      : "bg-brand-warning/10 text-brand-warning border border-brand-warning/20"
                  }`}>
                    {acc.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <span className="text-[9px] text-brand-muted uppercase block">Account Number</span>
                    <span className="font-mono text-white text-xs">{acc.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-muted uppercase block">IFSC Code</span>
                    <span className="font-mono text-white text-xs">{getIfsc(acc.bankCode)}</span>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="my-3">
                <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block">Total Available Balance</span>
                <span className="text-2xl font-extrabold text-white tracking-tight">₹{acc.balance.toLocaleString()}</span>
              </div>

              {/* Badges and Actions */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex gap-1.5">
                  {index === 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-success/15 border border-brand-success/25 text-[8px] text-brand-success font-bold uppercase tracking-wider">Primary</span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[8px] text-brand-primary font-bold uppercase tracking-wider">UPI Active</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDeleteAccount(acc.accountNumber)}
                    className="p-2 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger hover:bg-brand-danger hover:text-white transition-all"
                    title="Unlink Account"
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link 
                    to={`/accounts/${acc.accountNumber}`}
                    className="h-8 px-3.5 rounded-xl bg-brand-primary/10 border border-brand-primary/25 hover:bg-brand-primary text-xs font-semibold text-brand-primary hover:text-white flex items-center justify-center gap-1.5 transition-all"
                  >
                    Details
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE ACCOUNT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl glass-panel p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-primary animate-pulse" />
                  <h4 className="font-bold text-white text-base">Open Simulation Account</h4>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-brand-muted hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                
                {/* Bank Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Select Bank license</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["SBI", "HDFC", "ICICI", "AXIS", "PNB", "KOTAK", "BOB"].map(code => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedBank(code)}
                        className={`h-9 rounded-xl text-xs font-bold border transition-all ${
                          selectedBank === code 
                            ? "bg-brand-primary/20 border-brand-primary text-brand-primary glow-primary" 
                            : "bg-white/5 border-transparent text-brand-muted hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Starting Funds */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Opening Balance (₹)</label>
                  <input 
                    type="number" 
                    min={0}
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="₹10,000"
                    className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3 text-[10px] text-brand-muted leading-relaxed">
                  <ShieldAlert size={20} className="text-brand-warning flex-shrink-0 mt-0.5" />
                  <span>Enforces a maximum of 3 accounts total, and only one account per bank licence.</span>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full h-11 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-95 transition-all text-white disabled:opacity-50"
                >
                  {creating ? (
                    <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
                  ) : (
                    <>
                      Link and Generate Account
                      <Check size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
