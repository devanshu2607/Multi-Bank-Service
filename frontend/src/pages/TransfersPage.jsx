import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/layouts/DashboardLayout";
import { bankApi, upiApi, paymentApi } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Send, QrCode, ArrowRight, ShieldCheck, CheckCircle, Clock, Info, Building } from "lucide-react";
import PinModal from "../components/PinModal";

export default function TransfersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [accounts, setAccounts] = useState([]);
  const [upiProfiles, setUpiProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bank Transfer Form
  const [bankSource, setBankSource] = useState("");
  const [bankDest, setBankDest] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [bankNarration, setBankNarration] = useState("");
  
  // UPI Transfer Form
  const [upiSource, setUpiSource] = useState("");
  const [upiDest, setUpiDest] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [upiNarration, setUpiNarration] = useState("");

  // Common payment status states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [sagaLogs, setSagaLogs] = useState([]);
  const [showSagaModal, setShowSagaModal] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinAction, setPinAction] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadTransfersData();
    }
  }, [user]);

  const loadTransfersData = async () => {
    try {
      setLoading(true);
      const accountsList = await bankApi.getAccounts(user.id);
      setAccounts(accountsList);
      if (accountsList.length > 0) {
        setBankSource(accountsList[0].accountNumber);
      }

      const upiList = await upiApi.getProfiles(user.id);
      setUpiProfiles(upiList);

      const registered = accountsList.filter(acc =>
        upiList.some(p => p.defaultAccountNumber === acc.accountNumber)
      );
      if (registered.length > 0) {
        setUpiSource(registered[0].accountNumber);
      } else {
        setUpiSource("");
      }
    } catch (err) {
      showToast("Error loading", "Could not synchronize accounts for transfers", "danger");
    } finally {
      setLoading(false);
    }
  };

  const getAccountBalance = (accountNum) => {
    const found = accounts.find(a => a.accountNumber === accountNum);
    return found ? found.balance : 0;
  };

  const getAccountBank = (accountNum) => {
    const found = accounts.find(a => a.accountNumber === accountNum);
    return found ? found.bankCode : "UNKNOWN";
  };

  const executeSagaPayment = async (source, dest, amount, type, narration) => {
    setPaymentLoading(true);
    setShowSagaModal(true);
    setSagaLogs([
      `[Saga Coordinator] Init payment Saga...`,
      `[Saga] Type: ${type}`,
      `[Saga] Amount: ₹${amount}`,
      `[Saga] Source: ${source}`,
      `[Saga] Destination: ${dest}`
    ]);

    try {
      setTimeout(() => {
        setSagaLogs(prev => [...prev, "[Saga Coordinator] Sending routing request to NPCI..."]);
      }, 700);

      setTimeout(() => {
        setSagaLogs(prev => [...prev, "[Saga Coordinator] NPCI routing mapping resolved. Event published: PAYMENT_REQUESTED"]);
      }, 1400);

      setTimeout(() => {
        setSagaLogs(prev => [...prev, "[Saga Coordinator] Bank Service consuming DEBIT_REQUESTED..."]);
      }, 2100);

      const res = await paymentApi.initiate(source, dest, amount, type, narration);

      setTimeout(() => {
        setSagaLogs(prev => [
          ...prev,
          `[Saga Coordinator] DEBIT_COMPLETED. Transmitting CREDIT_REQUESTED...`,
          `[Saga Coordinator] CREDIT_COMPLETED. Ledger row generated.`,
          `[Saga Coordinator] Notification row generated. Saga Completed. Ref: ${res.reference}`
        ]);
        setPaymentLoading(false);
        showToast("Transfer Successful", `Transferred ₹${amount} successfully!`, "success");
        loadTransfersData();
      }, 2800);

    } catch (err) {
      setPaymentLoading(false);
      const errMsg = err.response?.data?.message || err.message || "Transaction failed";
      setSagaLogs(prev => [
        ...prev,
        `[Saga Coordinator] ERROR: ${errMsg}`,
        `[Saga Coordinator] Saga Compensating transaction triggered...`,
        `[Saga Coordinator] Compensated! Restored balance. State: FAILED`
      ]);
      showToast("Transfer Failed", errMsg, "danger");
    }
  };

  const handleBankTransfer = (e) => {
    e.preventDefault();
    if (!bankSource || !bankDest || !bankAmount) {
      showToast("Fields Missing", "Please input source, destination, and amount", "warning");
      return;
    }
    if (Number(bankAmount) > getAccountBalance(bankSource)) {
      showToast("Insufficient Balance", "Selected account balance is too low", "warning");
      return;
    }
    
    setPinAction(() => () => {
      executeSagaPayment(bankSource, bankDest, Number(bankAmount), "INTER_BANK", bankNarration || "Bank Account Transfer");
      // Reset inputs
      setBankDest("");
      setBankAmount("");
      setBankNarration("");
    });
    setIsPinModalOpen(true);
  };

  const handleUpiTransfer = (e) => {
    e.preventDefault();
    if (!upiSource || !upiDest || !upiAmount) {
      showToast("Fields Missing", "Please input source, destination, and amount", "warning");
      return;
    }
    if (Number(upiAmount) > getAccountBalance(upiSource)) {
      showToast("Insufficient Balance", "Selected account balance is too low", "warning");
      return;
    }

    const sourceProfile = upiProfiles.find(p => p.defaultAccountNumber === upiSource);
    if (!sourceProfile) {
      showToast("UPI Not Linked", "Please register a UPI ID for this bank account first in the UPI Management page", "warning");
      return;
    }

    let finalSource = sourceProfile.upiId;
    let finalType = "UPI";
    const isPhone = /^[0-9]{10}$/.test(upiDest);
    if (isPhone) {
      finalType = "PHONE";
      finalSource = sourceProfile.phoneNumber;
    }

    setPinAction(() => () => {
      executeSagaPayment(finalSource, upiDest, Number(upiAmount), finalType, upiNarration || "UPI Instant Transfer");
      // Reset inputs
      setUpiDest("");
      setUpiAmount("");
      setUpiNarration("");
    });
    setIsPinModalOpen(true);
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
          <Send size={18} className="text-brand-secondary animate-bounce" />
          <span className="text-sm font-semibold tracking-wider text-brand-secondary uppercase">Funds Routing</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">Simulation Money Transfers</h2>
        <p className="text-brand-muted text-xs mt-1">Initiate Saga transactions and monitor compensatory rollbacks</p>
      </div>

      {accounts.length === 0 ? (
        <div className="p-16 text-center rounded-[32px] border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto">
          <Info size={36} className="text-brand-muted animate-spin" />
          <h3 className="text-lg font-bold text-white">Create a simulated bank account</h3>
          <p className="text-brand-muted text-xs max-w-sm">
            You need at least one linked account with balance to initiate transfers. Click below to add an account.
          </p>
          <Link to="/accounts" className="h-10 px-6 rounded-xl gradient-primary text-xs font-semibold flex items-center justify-center text-white">
            Link Bank Account
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. Left: Bank Transfer */}
          <div className="p-6 sm:p-8 rounded-[32px] glass-panel border border-white/5 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Building size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Standard Bank Routing</h3>
                <p className="text-brand-muted text-[10px]">Inter-bank clearing transfer</p>
              </div>
            </div>

            <form onSubmit={handleBankTransfer} className="space-y-4">
              {/* Source Account */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Source account</label>
                <select 
                  value={bankSource}
                  onChange={(e) => setBankSource(e.target.value)}
                  className="w-full h-11 px-3 bg-white/5 border border-white/5 rounded-2xl text-xs focus:outline-none text-white focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.bankCode} - Bal: ₹{acc.balance.toLocaleString()} (•••• {acc.accountNumber.slice(-4)})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-brand-muted block pl-1">
                  Source Balance: <span className="text-white font-semibold">₹{getAccountBalance(bankSource).toLocaleString()}</span> • Bank: <span className="text-brand-primary font-bold">{getAccountBank(bankSource)}</span>
                </span>
              </div>

              {/* Destination Account */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Destination account number</label>
                <input 
                  type="text" 
                  value={bankDest}
                  onChange={(e) => setBankDest(e.target.value)}
                  placeholder="Enter receiver's account number"
                  className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Amount (₹)</label>
                <input 
                  type="number" 
                  min={1}
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  placeholder="₹0.00"
                  className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  required
                />
              </div>

              {/* Narration */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Narration / Memo</label>
                <input 
                  type="text" 
                  value={bankNarration}
                  onChange={(e) => setBankNarration(e.target.value)}
                  placeholder="e.g. rent, split bills"
                  className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-95 transition-all text-white"
              >
                Send Inter-Bank Funds
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* 2. Right: UPI Transfer */}
          <div className="p-6 sm:p-8 rounded-[32px] glass-panel border border-white/5 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Instant UPI Routing</h3>
                <p className="text-brand-muted text-[10px]">Resolve default bank profiles using UPI Handles / Phone</p>
              </div>
            </div>

            <form onSubmit={handleUpiTransfer} className="space-y-4">
              {/* Source Account */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Source account (Debiting)</label>
                {accounts.filter(acc => upiProfiles.some(p => p.defaultAccountNumber === acc.accountNumber)).length === 0 ? (
                  <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-2xl text-[11px] text-brand-muted flex flex-col gap-1">
                    <span>No bank accounts are registered for UPI.</span>
                    <Link to="/upi" className="text-brand-secondary hover:underline font-bold">
                      Link UPI ID first →
                    </Link>
                  </div>
                ) : (
                  <>
                    <select 
                      value={upiSource}
                      onChange={(e) => setUpiSource(e.target.value)}
                      className="w-full h-11 px-3 bg-white/5 border border-white/5 rounded-2xl text-xs focus:outline-none text-white focus:border-brand-primary/40 focus:bg-white/[0.08]"
                      required
                    >
                      {accounts
                        .filter(acc => upiProfiles.some(p => p.defaultAccountNumber === acc.accountNumber))
                        .map(acc => (
                          <option key={acc.accountNumber} value={acc.accountNumber}>
                            {acc.bankCode} - Bal: ₹{acc.balance.toLocaleString()} (•••• {acc.accountNumber.slice(-4)})
                          </option>
                        ))
                      }
                    </select>
                    <span className="text-[10px] text-brand-muted block pl-1">
                      Source Balance: <span className="text-white font-semibold">₹{getAccountBalance(upiSource).toLocaleString()}</span> • Bank: <span className="text-brand-secondary font-bold">{getAccountBank(upiSource)}</span>
                    </span>
                  </>
                )}
              </div>

              {/* Destination UPI ID */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Recipient UPI ID or Phone</label>
                <input 
                  type="text" 
                  value={upiDest}
                  onChange={(e) => setUpiDest(e.target.value)}
                  placeholder="e.g. user@pay or 10-digit phone number"
                  className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Amount (₹)</label>
                <input 
                  type="number" 
                  min={1}
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  placeholder="₹0.00"
                  className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                  required
                />
              </div>

              {/* Narration */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Narration / Memo</label>
                <input 
                  type="text" 
                  value={upiNarration}
                  onChange={(e) => setUpiNarration(e.target.value)}
                  placeholder="e.g. food, transfer"
                  className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-2xl gradient-secondary font-semibold flex items-center justify-center gap-2 shadow-lg glow-secondary hover:brightness-110 active:scale-95 transition-all text-white"
              >
                Send UPI Instant Transfer
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>
      )}

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
                  <ShieldCheck size={18} className="text-brand-primary animate-pulse" />
                  <h4 className="font-bold text-white text-base">Saga Orchestrator Workflow Log</h4>
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
                  if (log.includes("successful") || log.includes("Completed")) colorClass = "text-brand-success";
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
                    <span>Orchestrating Kafka saga transactions...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowSagaModal(false)}
                  disabled={paymentLoading}
                  className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  Dismiss Coordinator
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
