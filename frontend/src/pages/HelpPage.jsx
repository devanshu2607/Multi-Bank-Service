import React, { useState } from "react";
import { useToast } from "../components/layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Search, Mail, MessageSquare, ChevronDown, Check, X, ShieldAlert } from "lucide-react";

export default function HelpPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Contact Form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Live Chat Simulator
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "agent", text: "Hello! Welcome to Zero Support. How can we help you with the simulation today?" }
  ]);
  const [newChatMsg, setNewChatMsg] = useState("");

  const faqs = [
    { q: "How many simulated bank accounts can I link?", a: "The simulator enforces a limit of up to 3 bank accounts total per user profile, and only 1 account per specific bank license (SBI, HDFC, ICICI, etc.)." },
    { q: "What is a Saga Coordinator?", a: "Saga coordinates multi-service transactions. In payments, it sends a debit event to Bank Service, a credit event to target, and monitors rollback events if anything fails." },
    { q: "Can I generate default UPI handles?", a: "Yes, once a bank account is linked, register a handle like name@aura. All phone-number routing queries will resolve to your default bank account." },
    { q: "What should I do if a payment fails?", a: "Zero automatically coordinates compensation rollbacks if a ledger credit fails, restoring the source balance instantly." },
  ];

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [activeFaq, setActiveFaq] = useState(null);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    
    setSubmitting(true);
    setTimeout(() => {
      showToast("Ticket Raised", `Raised ticket: ${ticketSubject}. Support will reach out soon.`, "success");
      setTicketSubject("");
      setTicketMsg("");
      setSubmitting(false);
    }, 1200);
  };

  const handleSendChatMsg = (e) => {
    e.preventDefault();
    if (!newChatMsg.trim()) return;

    const userText = newChatMsg.trim();
    const userMessage = { sender: "user", text: userText };
    setChatMessages((prev) => [...prev, userMessage]);
    setNewChatMsg("");

    // Identify response based on specific allowed questions
    let responseText = "Sorry, I can only answer specific questions. Please click one of the quick option pills above or ask about: Link Accounts, Setup UPI PIN, Saga Workflows, VPA Mappings, or Bank Status.";
    let bankOptions = null;
    const lower = userText.toLowerCase();

    // Check if user specified a bank status singly
    const bankMatch = ["sbi", "hdfc", "icici", "axis", "pnb", "kotak", "bob"].find(b => lower.includes(b));

    if (lower.includes("status") && bankMatch) {
      const bankUpper = bankMatch.toUpperCase();
      const bankStatuses = {
        SBI: "State Bank of India Simulator is online. Status: Operational (100% SLA). Clearing routes are stable.",
        HDFC: "HDFC Bank Simulator is online. Status: Operational (99.98% SLA). Direct settlement routes active.",
        ICICI: "ICICI Bank Simulator is online. Status: Operational (100% SLA). Instant UPI settlement is active.",
        AXIS: "Axis Bank Simulator is online. Status: Operational (99.95% SLA). Clearing queue latency is nominal.",
        PNB: "Punjab National Bank Simulator is online. Status: Operational (99.91% SLA). Regional routers active.",
        KOTAK: "Kotak Mahindra Bank Simulator is online. Status: Operational (99.99% SLA). Settlement services active.",
        BOB: "Bank of Baroda Simulator is online. Status: Operational (99.88% SLA). Secondary routers operational."
      };
      const base = bankStatuses[bankUpper] || "Simulator is online and operational.";
      const latency = Math.floor(Math.random() * 15) + 10;
      responseText = `${base} Latency: ${latency}ms. Connection status: Healthy.`;
    } else if (lower.includes("status") && (lower.includes("bank") || lower.includes("all"))) {
      responseText = "Select a bank to check its current simulation status singly:";
      bankOptions = ["SBI", "HDFC", "ICICI", "AXIS", "PNB", "KOTAK", "BOB"];
    } else if (lower.includes("account") || lower.includes("link")) {
      responseText = "To link a bank account, go to the 'Accounts' page, click 'Link Bank Account', choose a bank (SBI, HDFC, etc.) and enter an opening balance.";
    } else if (lower.includes("pin") || lower.includes("security")) {
      responseText = "To set or reset your 4-digit UPI PIN, navigate to the 'Security' page and locate the 'Transaction UPI PIN' card. It is required to authorize money transfers.";
    } else if (lower.includes("saga") || lower.includes("rollback")) {
      responseText = "A Saga coordinates distributed transactions. It debits the source account, credits the target, and triggers compensations (refunds) if a step fails.";
    } else if (lower.includes("upi") || lower.includes("vpa") || lower.includes("handle")) {
      responseText = "A UPI VPA (Virtual Payment Address) resolves handles like username@aura. Register VPAs in 'UPI Management' and assign a default clearing account.";
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "agent", text: responseText, bankOptions }
      ]);
    }, 800);
  };

  const triggerBotAnswer = (questionText, topicKey) => {
    setChatMessages((prev) => [...prev, { sender: "user", text: questionText }]);
    
    const responses = {
      accounts: "To link a bank account, go to the 'Accounts' page, click 'Link Bank Account', choose a bank (SBI, HDFC, etc.) and enter an opening balance.",
      pin: "To set or reset your 4-digit UPI PIN, navigate to the 'Security' page and locate the 'Transaction UPI PIN' card. It is required to authorize money transfers.",
      saga: "A Saga coordinates distributed transactions. It debits the source account, credits the target, and triggers compensations (refunds) if a step fails.",
      upi: "A UPI VPA (Virtual Payment Address) resolves handles like username@aura. Register VPAs in 'UPI Management' and assign a default clearing account.",
      status: "Select a bank to check its current simulation status singly:"
    };

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { 
          sender: "agent", 
          text: responses[topicKey], 
          bankOptions: topicKey === "status" ? ["SBI", "HDFC", "ICICI", "AXIS", "PNB", "KOTAK", "BOB"] : null 
        }
      ]);
    }, 800);
  };

  const checkSingleBankStatus = (bank) => {
    setChatMessages((prev) => [...prev, { sender: "user", text: `Check ${bank} Status` }]);
    
    setTimeout(() => {
      const bankStatuses = {
        SBI: "State Bank of India Simulator is online. Status: Operational (100% SLA). Clearing routes are stable.",
        HDFC: "HDFC Bank Simulator is online. Status: Operational (99.98% SLA). Direct settlement routes active.",
        ICICI: "ICICI Bank Simulator is online. Status: Operational (100% SLA). Instant UPI settlement is active.",
        AXIS: "Axis Bank Simulator is online. Status: Operational (99.95% SLA). Clearing queue latency is nominal.",
        PNB: "Punjab National Bank Simulator is online. Status: Operational (99.91% SLA). Regional routers active.",
        KOTAK: "Kotak Mahindra Bank Simulator is online. Status: Operational (99.99% SLA). Settlement services active.",
        BOB: "Bank of Baroda Simulator is online. Status: Operational (99.88% SLA). Secondary routers operational."
      };
      const base = bankStatuses[bank] || "Simulator is online and operational.";
      const latency = Math.floor(Math.random() * 15) + 10;
      const responseText = `${base} Latency: ${latency}ms. Connection status: Healthy.`;

      setChatMessages((prev) => [
        ...prev,
        { sender: "agent", text: responseText }
      ]);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-brand-primary" />
          <span className="text-sm font-semibold tracking-wider text-brand-primary uppercase">Help Center</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">Support & Knowledge base</h2>
        <p className="text-brand-muted text-xs mt-1">Search mock FAQs, raise help tickets, or start simulated live chats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: FAQs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-lg text-white">Frequently Asked Questions</h3>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries..."
                className="w-full h-9 pl-9 pr-4 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
              />
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredFaqs.length === 0 ? (
              <p className="text-xs text-brand-muted p-4">No matching questions found</p>
            ) : (
              filteredFaqs.map((faq, i) => {
                const isOpen = activeFaq === i;
                return (
                  <div 
                    key={i}
                    className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : i)}
                      className="w-full p-4 flex items-center justify-between gap-4 text-xs font-bold text-white text-left"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={16} className={`text-brand-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 text-xs text-brand-muted leading-relaxed"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Support Tickets */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-bold text-lg text-white">Contact support</h3>
          
          <form onSubmit={handleTicketSubmit} className="p-6 rounded-[32px] glass-panel border border-white/5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Subject</label>
              <input 
                type="text" 
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Brief subject"
                className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Message Details</label>
              <textarea 
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                placeholder="Explain details of transaction logs or clearing issues..."
                className="w-full h-24 p-3 bg-white/5 border border-white/5 rounded-2xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-2xl gradient-primary font-semibold flex items-center justify-center gap-2 shadow-lg glow-primary hover:brightness-110 active:scale-95 transition-all text-white disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
              ) : (
                <>
                  <Mail size={16} />
                  Submit Ticket
                </>
              )}
            </button>
          </form>

          {/* Live Chat trigger button */}
          <button 
            onClick={() => setChatOpen(true)}
            className="w-full h-12 rounded-3xl bg-brand-secondary/15 border border-brand-secondary/35 hover:bg-brand-secondary text-brand-secondary hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <MessageSquare size={16} />
            Start live chat simulation
          </button>
        </div>

      </div>

      {/* LIVE CHAT SIMULATOR MODAL */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none pointer-events-none">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="pointer-events-auto w-full max-w-sm rounded-3xl glass-panel p-4 shadow-2xl border border-white/10 flex flex-col h-96"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-success animate-ping" />
                  <h4 className="font-bold text-white text-xs">Simulated Support Agent</h4>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-brand-muted hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
                {chatMessages.map((msg, i) => {
                  const isAgent = msg.sender === "agent";
                  return (
                    <div key={i} className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}>
                      <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                        isAgent 
                          ? "bg-white/5 border border-white/5 text-white" 
                          : "gradient-primary text-white"
                      }`}>
                        <div>{msg.text}</div>
                        
                        {/* Inline Bank Status Pills */}
                        {isAgent && msg.bankOptions && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-white/5">
                            {msg.bankOptions.map((bank) => (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => checkSingleBankStatus(bank)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-brand-primary border border-white/10 hover:border-brand-primary text-[9px] text-white font-semibold transition-all active:scale-95"
                              >
                                {bank}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Questions Pills */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-t border-white/5 pt-2 px-1">
                <button 
                  type="button" 
                  onClick={() => triggerBotAnswer("How to link a bank account?", "accounts")}
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-brand-primary/10 hover:border-brand-primary/30 text-[9px] text-brand-muted hover:text-white transition-all"
                >
                  Link Account?
                </button>
                <button 
                  type="button" 
                  onClick={() => triggerBotAnswer("How to setup UPI PIN?", "pin")}
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-brand-primary/10 hover:border-brand-primary/30 text-[9px] text-brand-muted hover:text-white transition-all"
                >
                  Setup UPI PIN?
                </button>
                <button 
                  type="button" 
                  onClick={() => triggerBotAnswer("What is a Saga?", "saga")}
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-brand-primary/10 hover:border-brand-primary/30 text-[9px] text-brand-muted hover:text-white transition-all"
                >
                  What is Saga?
                </button>
                <button 
                  type="button" 
                  onClick={() => triggerBotAnswer("What is a VPA/UPI ID?", "upi")}
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-brand-primary/10 hover:border-brand-primary/30 text-[9px] text-brand-muted hover:text-white transition-all"
                >
                  What is VPA?
                </button>
                <button 
                  type="button" 
                  onClick={() => triggerBotAnswer("Check Bank Statuses", "status")}
                  className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-brand-primary/10 hover:border-brand-primary/30 text-[9px] text-brand-muted hover:text-white transition-all"
                >
                  Bank Status?
                </button>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMsg} className="flex gap-2 border-t border-white/5 pt-2.5">
                <input 
                  type="text" 
                  value={newChatMsg}
                  onChange={(e) => setNewChatMsg(e.target.value)}
                  placeholder="Type simulation request..."
                  className="flex-1 h-9 px-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary/40"
                  required
                />
                <button 
                  type="submit"
                  className="h-9 px-3.5 rounded-xl bg-brand-primary text-xs font-semibold text-white hover:brightness-110 active:scale-95 transition-all"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
