import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/layouts/DashboardLayout";
import { bankApi, ledgerApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  Building,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function AccountDetailsPage() {
  const { accountNumber } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulation Modals
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [simAmount, setSimAmount] = useState("");
  const [simNarration, setSimNarration] = useState("");
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (accountNumber) {
      loadAccountDetails();
    }
  }, [accountNumber]);

  const loadAccountDetails = async () => {
    try {
      setLoading(true);
      // Fetch details
      const details = await bankApi.getAccountDetails(accountNumber);
      setAccount(details);

      // Fetch ledger
      const ledger = await ledgerApi.getLedger(accountNumber);
      setTransactions(ledger);
    } catch (err) {
      showToast("Sync Error", "Could not load bank account details", "danger");
      navigate("/accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleDebitSim = async (e) => {
    e.preventDefault();
    if (!simAmount || Number(simAmount) <= 0) return;
    
    setSimulating(true);
    try {
      await bankApi.debit(accountNumber, Number(simAmount), simNarration || "Simulated Debit", "INTER_BANK");
      showToast("Debit Completed", `Debited ₹${simAmount} from account`, "success");
      setShowDebitModal(false);
      setSimAmount("");
      setSimNarration("");
      loadAccountDetails();
    } catch (err) {
      showToast("Debit Failed", err.response?.data?.message || err.message || "Failed to debit", "danger");
    } finally {
      setSimulating(false);
    }
  };

  const handleCreditSim = async (e) => {
    e.preventDefault();
    if (!simAmount || Number(simAmount) <= 0) return;
    
    setSimulating(true);
    try {
      await bankApi.credit(accountNumber, Number(simAmount), simNarration || "Simulated Credit", "INTER_BANK");
      showToast("Credit Completed", `Credited ₹${simAmount} to account`, "success");
      setShowCreditModal(false);
      setSimAmount("");
      setSimNarration("");
      loadAccountDetails();
    } catch (err) {
      showToast("Credit Failed", err.response?.data?.message || err.message || "Failed to credit", "danger");
    } finally {
      setSimulating(false);
    }
  };

  const handleUnlink = async () => {
    if (window.confirm("Are you sure you want to unlink and delete this account?")) {
      try {
        await bankApi.deleteAccount(accountNumber, user.id);
        showToast("Account Deleted", "Simulated bank account removed", "success");
        navigate("/accounts");
      } catch (err) {
        showToast("Error", "Could not unlink account", "danger");
      }
    }
  };

  // Prepare chart analytics data
  const chartData = transactions.slice(0, 10).reverse().map((t, idx) => ({
    name: `Txn ${idx + 1}`,
    Amount: t.amount,
    type: t.entryType
  }));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded-2xl w-1/4" />
        <div className="h-48 bg-white/5 rounded-3xl" />
        <div className="h-64 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="space-y-6">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <Link to="/accounts" className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-brand-muted hover:text-white">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-xs font-semibold text-brand-primary uppercase tracking-widest">{account.bankCode} Clearing node</span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Account details</h2>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="rounded-[32px] glass-panel border border-white/5 p-8 relative overflow-hidden grid md:grid-cols-12 gap-8">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Left Side: Balance & Meta */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏦</span>
            <div>
              <span className="text-xs font-extrabold uppercase text-brand-muted tracking-widest">{account.bankCode} Global Network</span>
              <p className="text-xl font-bold text-white">{account.accountHolderName}</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Audited Available Balance</span>
            <p className="text-4xl font-extrabold text-white tracking-tight">₹{account.balance.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2 text-xs font-medium border-t border-white/5">
            <div>
              <span className="text-[9px] text-brand-muted uppercase block">Account Number</span>
              <span className="font-mono text-white text-xs">{account.accountNumber}</span>
            </div>
            <div>
              <span className="text-[9px] text-brand-muted uppercase block">IFSC Code</span>
              <span className="font-mono text-white text-xs">AURA0{account.bankCode}09</span>
            </div>
            <div>
              <span className="text-[9px] text-brand-muted uppercase block">Clearing Status</span>
              <span className="text-brand-success font-semibold text-xs flex items-center gap-1">
                <CheckCircle2 size={12} />
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Simulation Actions */}
        <div className="md:col-span-4 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
          <h4 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 text-center md:text-left">Simulator Operations</h4>
          
          <button 
            onClick={() => setShowCreditModal(true)}
            className="h-11 rounded-xl bg-brand-success/10 border border-brand-success/25 hover:bg-brand-success text-brand-success hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <ArrowDownLeft size={16} />
            Simulate Credit Deposit
          </button>

          <button 
            onClick={() => setShowDebitModal(true)}
            className="h-11 rounded-xl bg-brand-danger/10 border border-brand-danger/25 hover:bg-brand-danger text-brand-danger hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <ArrowUpRight size={16} />
            Simulate Debit Withdrawal
          </button>

          <button 
            onClick={handleUnlink}
            className="h-11 rounded-xl bg-white/5 border border-white/5 hover:bg-brand-danger/10 text-brand-muted hover:text-brand-danger font-semibold text-xs flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Trash2 size={16} />
            Unlink clearing account
          </button>
        </div>
      </div>

      {/* Analytics & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-white/5 space-y-6">
          <h3 className="font-bold text-lg text-white">Recent Transaction Volatility</h3>
          
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(17,24,39,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff", fontSize: "11px" }}
                  />
                  <Bar dataKey="Amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.type === "DEBIT" ? "#EF4444" : "#22C55E"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-brand-muted">
                No transactions recorded yet to plot.
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 text-[10px] text-brand-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-success" />
              Credits
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-danger" />
              Debits
            </span>
          </div>
        </div>

        {/* Passbook/Ledger List */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <h3 className="font-bold text-lg text-white">Audited Passbook Ledger</h3>

          {transactions.length === 0 ? (
            <div className="p-10 text-center text-xs text-brand-muted">
              No simulation logs found. Trigger a debit or credit to write simulated ledger rows.
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-3.5 pr-2">
              {transactions.map((t, idx) => {
                const isDebit = t.entryType === "DEBIT";
                return (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{t.reference}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          isDebit ? "bg-brand-danger/10 text-brand-danger" : "bg-brand-success/10 text-brand-success"
                        }`}>{t.entryType}</span>
                      </div>
                      <p className="text-[10px] text-brand-muted">
                        {new Date(t.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-bold ${isDebit ? "text-brand-danger" : "text-brand-success"}`}>
                        {isDebit ? "-" : "+"}₹{t.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-brand-muted mt-0.5">Bal: ₹{t.balanceAfter.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* CREDIT MODAL */}
      <AnimatePresence>
        {showCreditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl glass-panel p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-success" />
                  <h4 className="font-bold text-white text-base">Simulate Deposit (Credit)</h4>
                </div>
                <button onClick={() => setShowCreditModal(false)} className="text-brand-muted hover:text-white">Cancel</button>
              </div>

              <form onSubmit={handleCreditSim} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Credit Amount (₹)</label>
                  <input 
                    type="number" 
                    min={1}
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    placeholder="₹5,000"
                    className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Narration / Memo</label>
                  <input 
                    type="text" 
                    value={simNarration}
                    onChange={(e) => setSimNarration(e.target.value)}
                    placeholder="Simulation Credit Deposit"
                    className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={simulating}
                  className="w-full h-11 rounded-2xl bg-brand-success font-semibold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 text-white disabled:opacity-50"
                >
                  {simulating ? <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" /> : "Initiate Credit"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEBIT MODAL */}
      <AnimatePresence>
        {showDebitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl glass-panel p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-danger" />
                  <h4 className="font-bold text-white text-base">Simulate Withdrawal (Debit)</h4>
                </div>
                <button onClick={() => setShowDebitModal(false)} className="text-brand-muted hover:text-white">Cancel</button>
              </div>

              <form onSubmit={handleDebitSim} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Debit Amount (₹)</label>
                  <input 
                    type="number" 
                    min={1}
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    placeholder="₹2,000"
                    className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Narration / Memo</label>
                  <input 
                    type="text" 
                    value={simNarration}
                    onChange={(e) => setSimNarration(e.target.value)}
                    placeholder="Simulation Debit Withdrawal"
                    className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={simulating}
                  className="w-full h-11 rounded-2xl bg-brand-danger font-semibold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 text-white disabled:opacity-50"
                >
                  {simulating ? <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" /> : "Initiate Debit"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
