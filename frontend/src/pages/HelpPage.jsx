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
    { sender: "agent", text: "Hello! Welcome to AuraBank Support. How can we help you with the simulation today?" }
  ]);
  const [newChatMsg, setNewChatMsg] = useState("");

  const faqs = [
    { q: "How many simulated bank accounts can I link?", a: "The simulator enforces a limit of up to 3 bank accounts total per user profile, and only 1 account per specific bank license (SBI, HDFC, ICICI, etc.)." },
    { q: "What is a Saga Coordinator?", a: "Saga coordinates multi-service transactions. In payments, it sends a debit event to Bank Service, a credit event to target, and monitors rollback events if anything fails." },
    { q: "Can I generate default UPI handles?", a: "Yes, once a bank account is linked, register a handle like name@aura. All phone-number routing queries will resolve to your default bank account." },
    { q: "What should I do if a payment fails?", a: "AuraBank automatically coordinates compensation rollbacks if a ledger credit fails, restoring the source balance instantly." },
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

    const userMessage = { sender: "user", text: newChatMsg };
    setChatMessages((prev) => [...prev, userMessage]);
    setNewChatMsg("");

    // Simulate Agent response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "agent", text: "Understood. The simulation environment is running on port 8000. Try debiting/crediting your account details to test." }
      ]);
    }, 1200);
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 bg-black/60 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none pointer-events-none">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="pointer-events-auto w-full max-w-sm rounded-3xl glass-panel p-4 shadow-2xl border border-white/10 flex flex-col h-96 relative bottom-6 right-6"
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
                    <div key={i} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
                      <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                        isAgent 
                          ? "bg-white/5 border border-white/5 text-white" 
                          : "gradient-primary text-white"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
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
