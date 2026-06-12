import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/layouts/DashboardLayout";
import { bankApi, upiApi, paymentApi, ledgerApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import PinModal from "../components/PinModal";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Send, 
  QrCode, 
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Calendar,
  Sparkles,
  Wifi,
  FileText
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [upiProfiles, setUpiProfiles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Pay Form
  const [fromAccount, setFromAccount] = useState("");
  const [payTo, setPayTo] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payNarration, setPayNarration] = useState("");
  const [payType, setPayType] = useState("UPI"); // UPI, INTER_BANK
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [sagaLogs, setSagaLogs] = useState([]);
  const [showSagaModal, setShowSagaModal] = useState(false);

  // Manage UPI Default selector
  const [selectedUpiProfile, setSelectedUpiProfile] = useState(null);
  const [newDefaultAccount, setNewDefaultAccount] = useState("");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinAction, setPinAction] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch user accounts
      const accountsList = await bankApi.getAccounts(user.id);
      setAccounts(accountsList);
      if (accountsList.length > 0) {
        setFromAccount(accountsList[0].accountNumber);
        
        // Fetch recent ledger for the first account
        const ledger = await ledgerApi.getLedger(accountsList[0].accountNumber);
        setTransactions(ledger.slice(0, 5)); // show top 5
      }

      // Fetch UPI Profiles
      const upiList = await upiApi.getProfiles(user.id);
      setUpiProfiles(upiList);
      if (upiList.length > 0) {
        setSelectedUpiProfile(upiList[0]);
        setNewDefaultAccount(upiList[0].defaultAccountNumber);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      showToast("Error loading", "Could not synchronize dashboard state", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Quick payment handler
  const handleQuickPay = async (e) => {
    e.preventDefault();
    if (!fromAccount || !payTo || !payAmount) {
      showToast("Validation Error", "Please fill in all quick payment fields", "warning");
      return;
    }

    let finalSource = fromAccount;
    let finalDest = payTo;
    let finalType = payType; // UPI or INTER_BANK

    if (payType === "UPI") {
      const sourceProfile = upiProfiles.find(p => p.defaultAccountNumber === fromAccount);
      if (!sourceProfile) {
        showToast("UPI Not Linked", "Please register a UPI ID for this bank account first in the UPI Management page", "warning");
        return;
      }
      
      const isPhone = /^[0-9]{10}$/.test(payTo);
      if (isPhone) {
        finalType = "PHONE";
        finalSource = sourceProfile.phoneNumber;
      } else {
        finalType = "UPI";
        finalSource = sourceProfile.upiId;
      }
    } else {
      finalType = "INTER_BANK";
    }

    const triggerPayment = async () => {
      setPaymentLoading(true);
      setShowSagaModal(true);
      setSagaLogs(["[Saga Coordinator] Initializing payment request...", `[Saga] Source: ${finalSource}`, `[Saga] Destination: ${finalDest}`, `[Saga] Amount: ₹${payAmount}`]);

      try {
        // Simulate saga updates
        setTimeout(() => {
          setSagaLogs(prev => [...prev, "[Saga Coordinator] Contacting NPCI Routing Service..."]);
        }, 800);
        
        setTimeout(() => {
          setSagaLogs(prev => [...prev, "[Saga Coordinator] NPCI routing successful. Routing state published to Kafka topic: payment-events"]);
        }, 1600);

        setTimeout(() => {
          setSagaLogs(prev => [...prev, "[Saga Coordinator] Triggering DEBIT_REQUESTED in Bank Service..."]);
        }, 2400);

        const res = await paymentApi.initiate(
          finalSource,
          finalDest,
          payAmount,
          finalType,
          payNarration || "Quick Payment"
        );

        setTimeout(() => {
          setSagaLogs(prev => [
            ...prev, 
            `[Saga Coordinator] DB Transaction recorded. Ref: ${res.reference}`,
            `[Saga Coordinator] CREDIT_REQUESTED completed in Bank Service.`,
            `[Saga Coordinator] Transaction completed successfully! State: ${res.status}`
          ]);
          setPaymentLoading(false);
          showToast("Payment Successful", `Transferred ₹${payAmount} to ${payTo}`, "success");
          // Reload dashboard
          loadDashboardData();
          // Reset fields
          setPayTo("");
          setPayAmount("");
          setPayNarration("");
        }, 3200);

      } catch (err) {
        setPaymentLoading(false);
        const errMsg = err.response?.data?.message || err.message || "Transaction failed";
        setSagaLogs(prev => [
          ...prev, 
          `[Saga Coordinator] ERROR: ${errMsg}`,
          `[Saga Coordinator] Saga Rollback triggered! Publishing REFUND_REQUESTED/ROLLBACK...`,
          `[Saga Coordinator] Account balance restored. State: FAILED`
        ]);
        showToast("Payment Failed", errMsg, "danger");
      }
    };

    setPinAction(() => triggerPayment);
    setIsPinModalOpen(true);
  };

  const handleUpdateDefaultAccount = async () => {
    if (!selectedUpiProfile || !newDefaultAccount) return;
    try {
      await upiApi.updateDefaultAccount(selectedUpiProfile.upiId, newDefaultAccount, user.id);
      showToast("UPI Default Updated", `Default account for ${selectedUpiProfile.upiId} changed to ${newDefaultAccount}`, "success");
      loadDashboardData();
    } catch (err) {
      showToast("Update Failed", "Could not change default UPI account", "danger");
    }
  };

  // Compute stats
  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalAccounts = accounts.length;

  // Chart data
  const spendingData = [
    { name: "Week 1", amount: 1200 },
    { name: "Week 2", amount: 4500 },
    { name: "Week 3", amount: 2100 },
    { name: "Week 4", amount: 6700 },
  ];

  const distributionData = accounts.map((acc, index) => ({
    name: `${acc.bankCode} (${acc.accountNumber.slice(-4)})`,
    value: acc.balance || 0
  }));

  const COLORS = ["#7C5CFF", "#4F8CFF", "#06B6D4", "#F59E0B", "#22C55E"];

  // Mock Bills
  const bills = [
    { id: 1, name: "Vercel Cloud Host", due: "June 18, 2026", amount: 2490, category: "Web Services" },
    { id: 2, name: "ACT Fiber Internet", due: "June 20, 2026", amount: 1049, category: "Utilities" },
    { id: 3, name: "Apple One Family", due: "June 25, 2026", amount: 369, category: "Subscriptions" }
  ];

  const payBill = async (bill) => {
    if (accounts.length === 0) {
      showToast("No Account", "Create a bank account first", "warning");
      return;
    }
    try {
      await bankApi.debit(accounts[0].accountNumber, bill.amount, `Bill: ${bill.name}`, "INTER_BANK");
      showToast("Bill Paid", `Paid ₹${bill.amount} for ${bill.name}`, "success");
      loadDashboardData();
    } catch (err) {
      showToast("Payment Failed", "Failed to debit account", "danger");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-white/5 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white/5 rounded-3xl lg:col-span-2" />
          <div className="h-80 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="text-sm font-semibold tracking-wider text-brand-primary uppercase">Executive Dashboard</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">
            Welcome back, {user?.fullName || "User"}
          </h2>
          <p className="text-brand-muted text-xs font-medium flex items-center gap-1.5 mt-1">
            <Calendar size={14} />
            {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link to="/accounts" className="h-11 px-4 rounded-xl glass-panel text-xs font-semibold flex items-center gap-2 hover:bg-white/5 transition-colors border border-white/5">
            <Plus size={16} />
            New Account
          </Link>
          <Link to="/transfers" className="h-11 px-4 rounded-xl gradient-primary text-xs font-semibold flex items-center gap-2 hover:brightness-110 shadow-lg glow-primary transition-all text-white">
            <Send size={16} />
            Transfer Funds
          </Link>
        </div>
      </div>

      {/* Statistics Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Total Combined Balance</p>
          <p className="text-2xl font-extrabold mt-2.5 text-white tracking-tight">₹{totalBalance.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-3 text-brand-success text-xs font-semibold">
            <TrendingUp size={14} />
            <span>+4.2% from last week</span>
          </div>
        </div>

        {/* Total Accounts */}
        <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/5 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Active Bank Accounts</p>
          <p className="text-2xl font-extrabold mt-2.5 text-white tracking-tight">{totalAccounts}</p>
          <p className="text-brand-muted text-xs mt-3 flex items-center gap-1.5">
            <Building size={14} className="text-brand-secondary" />
            <span>Across {new Set(accounts.map(a => a.bankCode)).size} bank licenses</span>
          </p>
        </div>

        {/* Monthly Activity */}
        <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Recent Transactions</p>
          <p className="text-2xl font-extrabold mt-2.5 text-white tracking-tight">{transactions.length}</p>
          <div className="flex items-center gap-1.5 mt-3 text-brand-secondary text-xs font-semibold">
            <ArrowUpRight size={14} />
            <span>All records audited</span>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Pending settlements</p>
          <p className="text-2xl font-extrabold mt-2.5 text-white tracking-tight">0</p>
          <p className="text-brand-muted text-xs mt-3 flex items-center gap-1.5">
            <CheckCircle size={14} className="text-brand-success" />
            <span>All transactions cleared</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Linked Accounts & Quick Pay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Linked Accounts Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-brand-primary" />
              <h3 className="font-bold text-lg text-white">Linked Banking Cards</h3>
            </div>
            <Link to="/accounts" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
              Manage accounts <ChevronRight size={14} />
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-3">
              <Building size={32} className="text-brand-muted" />
              <p className="text-brand-muted text-sm font-medium">No active accounts linked. Open a simulated bank account to start.</p>
              <Link to="/accounts" className="mt-2 h-9 px-4 rounded-xl gradient-primary text-xs font-semibold flex items-center justify-center text-white">
                Create Account
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accounts.map((acc, index) => (
                <div 
                  key={acc.accountNumber}
                  className="p-6 rounded-3xl glass-panel border border-white/5 relative overflow-hidden flex flex-col justify-between h-52 glass-panel-hover"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Top: Bank & Chip */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase text-brand-muted tracking-widest">{acc.bankCode} Global</span>
                      <p className="text-xs font-mono text-white/40">•••• {acc.accountNumber.slice(-4)}</p>
                    </div>
                    <div className="w-10 h-8 rounded-lg bg-yellow-600/20 border border-yellow-500/20 flex items-center justify-center relative">
                      <span className="w-3.5 h-4 bg-yellow-500/30 rounded-sm" />
                    </div>
                  </div>

                  {/* Mid: Balance */}
                  <div className="my-auto py-2">
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Available Balance</p>
                    <p className="text-2xl font-extrabold text-white tracking-tight">₹{acc.balance.toLocaleString()}</p>
                  </div>

                  {/* Bottom: Badges & Actions */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex gap-1.5">
                      {index === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-success/15 border border-brand-success/25 text-[8px] text-brand-success font-bold uppercase tracking-wider">Primary</span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[8px] text-brand-primary font-bold uppercase tracking-wider">UPI Active</span>
                    </div>
                    <Link 
                      to={`/accounts/${acc.accountNumber}`}
                      className="text-xs font-bold text-[#4F8CFF] hover:underline"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Default UPI Manager Card */}
          {upiProfiles.length > 0 && selectedUpiProfile && (
            <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-success/10 border border-brand-success/20 text-brand-success flex items-center justify-center mt-0.5">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">Default UPI Account</h4>
                      <span className="px-2 py-0.5 rounded-full bg-brand-success/20 text-[9px] text-brand-success font-semibold">Verified</span>
                    </div>
                    <p className="text-brand-muted text-xs mt-1">UPI ID: <span className="text-white font-mono">{selectedUpiProfile.upiId}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select 
                    value={newDefaultAccount}
                    onChange={(e) => setNewDefaultAccount(e.target.value)}
                    className="h-10 px-3 bg-white/5 border border-white/5 rounded-xl text-xs focus:outline-none text-white focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  >
                    {accounts.map(acc => (
                      <option key={acc.accountNumber} value={acc.accountNumber}>
                        {acc.bankCode} (•••• {acc.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={handleUpdateDefaultAccount}
                    className="h-10 px-3.5 rounded-xl bg-brand-primary text-xs font-semibold hover:brightness-110 active:scale-95 transition-all text-white"
                  >
                    Update
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-brand-muted leading-relaxed border-t border-white/5 pt-3">
                This account will be used automatically for all UPI payments initiated using your linked mobile number <span className="text-white font-semibold">{selectedUpiProfile.phoneNumber}</span>.
              </p>
            </div>
          )}

        </div>

        {/* Quick Payment Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-brand-secondary" />
            <h3 className="font-bold text-lg text-white">Quick Payment</h3>
          </div>

          <form onSubmit={handleQuickPay} className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
            
            {/* From Account */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Debiting Account</label>
              <select 
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full h-11 px-3 bg-white/5 border border-white/5 rounded-2xl text-xs focus:outline-none text-white focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                required
              >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.bankCode} - Bal: ₹{acc.balance.toLocaleString()} (•••• {acc.accountNumber.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayType("UPI")}
                className={`h-10 rounded-xl text-xs font-semibold border transition-all ${
                  payType === "UPI" 
                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" 
                    : "bg-white/5 border-transparent text-brand-muted hover:text-white"
                }`}
              >
                UPI Pay
              </button>
              <button
                type="button"
                onClick={() => setPayType("INTER_BANK")}
                className={`h-10 rounded-xl text-xs font-semibold border transition-all ${
                  payType === "INTER_BANK" 
                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" 
                    : "bg-white/5 border-transparent text-brand-muted hover:text-white"
                }`}
              >
                Bank Transfer
              </button>
            </div>

            {/* Pay To */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                {payType === "UPI" ? "Destination UPI ID or Phone" : "Receiver Account Number"}
              </label>
              <input 
                type="text" 
                value={payTo}
                onChange={(e) => setPayTo(e.target.value)}
                placeholder={payType === "UPI" ? "username@pay or 10-digit number" : "Enter account number"}
                className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Amount (₹)</label>
              <input 
                type="number" 
                min={1}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="₹0.00"
                className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                required
              />
            </div>

            {/* Narration */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Narration / Memo</label>
              <input 
                type="text" 
                value={payNarration}
                onChange={(e) => setPayNarration(e.target.value)}
                placeholder="e.g. rent, lunch"
                className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
              />
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={paymentLoading || accounts.length === 0}
              className="w-full h-11 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 transition-all text-white disabled:opacity-50"
            >
              <Send size={14} />
              Confirm Payment
            </button>
          </form>
        </div>

      </div>

      {/* Analytics & Bills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Analytics Charts */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Spend & Balance Analysis</h3>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Realtime charts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Area Chart - Spending */}
            <div className="md:col-span-8 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(17,24,39,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    labelStyle={{ color: "#94A3B8", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#7C5CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Asset Allocation */}
            <div className="md:col-span-4 h-60 flex flex-col justify-center items-center">
              {accounts.length > 0 ? (
                <>
                  <div className="w-full h-44 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "rgba(17,24,39,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                          itemStyle={{ color: "#fff", fontSize: "10px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center text-[9px] text-brand-muted">
                    {distributionData.map((d, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {d.name}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-brand-muted text-center">No distribution data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Bills & Payables */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Wifi size={18} className="text-brand-warning" />
            <h3 className="font-bold text-lg text-white">Upcoming Payables</h3>
          </div>

          <div className="space-y-3.5">
            {bills.map((bill) => (
              <div 
                key={bill.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{bill.name}</h4>
                  <p className="text-[10px] text-brand-muted mt-0.5">Due {bill.due} • {bill.category}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-xs font-bold text-white">₹{bill.amount}</span>
                  <button 
                    onClick={() => payBill(bill)}
                    className="h-7 px-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold transition-all text-white"
                  >
                    Pay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-brand-primary" />
            <h3 className="font-bold text-lg text-white">Recent Transactions ({fromAccount})</h3>
          </div>
          {accounts.length > 0 && (
            <select 
              value={fromAccount}
              onChange={async (e) => {
                setFromAccount(e.target.value);
                if (e.target.value) {
                  const ledger = await ledgerApi.getLedger(e.target.value);
                  setTransactions(ledger.slice(0, 5));
                }
              }}
              className="h-9 px-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
            >
              {accounts.map(acc => (
                <option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.bankCode} - {acc.accountNumber}
                </option>
              ))}
            </select>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-brand-muted">
            No transactions found for this account. Make a quick pay transfer to verify!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-brand-muted text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {transactions.map((t, index) => {
                  const isDebit = t.entryType === "DEBIT";
                  return (
                    <tr key={index} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-white">{t.reference}</td>
                      <td className="py-3.5 px-4 text-xs text-brand-muted">
                        {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isDebit 
                            ? "bg-brand-danger/10 text-brand-danger border border-brand-danger/25" 
                            : "bg-brand-success/10 text-brand-success border border-brand-success/25"
                        }`}>
                          {t.entryType}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-bold ${isDebit ? "text-brand-danger" : "text-brand-success"}`}>
                        {isDebit ? "-" : "+"}₹{t.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-white">₹{t.balanceAfter.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SAGA FLOW VISUALIZATION MODAL */}
      <AnimatePresence>
        {showSagaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl glass-panel p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-primary" />
                  <h4 className="font-bold text-white text-base">Saga Transaction Coordinator</h4>
                </div>
                {!paymentLoading && (
                  <button 
                    onClick={() => setShowSagaModal(false)}
                    className="p-1 rounded-lg hover:bg-white/5 text-brand-muted hover:text-white"
                  >
                    Close
                  </button>
                )}
              </div>

              {/* Coordinator Console Output */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/5 h-64 overflow-y-auto font-mono text-[10px] space-y-2.5 text-brand-muted">
                {sagaLogs.map((log, i) => {
                  let colorClass = "text-brand-muted";
                  if (log.includes("ERROR")) colorClass = "text-brand-danger";
                  if (log.includes("successful") || log.includes("completed")) colorClass = "text-brand-success";
                  if (log.includes("Coordinator")) colorClass = "text-brand-primary";
                  return (
                    <div key={i} className={`leading-relaxed ${colorClass}`}>
                      {log}
                    </div>
                  );
                })}
                {paymentLoading && (
                  <div className="flex items-center gap-2 text-brand-primary animate-pulse py-1">
                    <Clock size={12} className="animate-spin" />
                    <span>Processing orchestration steps...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowSagaModal(false)}
                  disabled={paymentLoading}
                  className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PinModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          if (pinAction) pinAction();
        }}
        userId={user.id}
      />

    </div>
  );
}
