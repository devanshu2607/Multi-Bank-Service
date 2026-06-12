import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/layouts/DashboardLayout";
import { notificationApi } from "../services/api";
import { motion } from "framer-motion";
import { Bell, ArrowDownLeft, ArrowUpRight, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications(user.id);
      // Sort: newest first
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      showToast("Sync Error", "Could not fetch notifications history", "danger");
    } finally {
      setLoading(false);
    }
  };

  const categorizeNotification = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes("credit") || msg.includes("received")) {
      return { icon: ArrowDownLeft, color: "text-brand-success bg-brand-success/10 border-brand-success/20" };
    }
    if (msg.includes("debit") || msg.includes("withdrawn") || msg.includes("sent")) {
      return { icon: ArrowUpRight, color: "text-brand-danger bg-brand-danger/10 border-brand-danger/20" };
    }
    if (msg.includes("security") || msg.includes("password") || msg.includes("login")) {
      return { icon: Shield, color: "text-brand-warning bg-brand-warning/10 border-brand-warning/20" };
    }
    if (msg.includes("fail") || msg.includes("error") || msg.includes("rollback")) {
      return { icon: AlertTriangle, color: "text-brand-danger bg-brand-danger/10 border-brand-danger/20" };
    }
    return { icon: Bell, color: "text-brand-primary bg-brand-primary/10 border-brand-primary/20" };
  };

  const getTimelineGroup = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return "Earlier";
    }
  };

  // Group notifications
  const grouped = notifications.reduce((groups, item) => {
    const groupKey = getTimelineGroup(item.createdAt);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, { Today: [], Yesterday: [], Earlier: [] });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-2xl w-1/4" />
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-brand-primary" />
            <span className="text-sm font-semibold tracking-wider text-brand-primary uppercase">Alert center</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1.5">Notification History</h2>
          <p className="text-brand-muted text-xs mt-1">Review live clearings, credit credits, and account updates</p>
        </div>

        <button 
          onClick={loadNotifications}
          className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
        >
          Refresh Feed
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="p-16 text-center rounded-[32px] border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
          <CheckCircle className="text-brand-success animate-bounce" size={48} />
          <h4 className="text-base font-bold text-white">All caught up!</h4>
          <p className="text-brand-muted text-xs leading-relaxed">
            No notification logs generated for this account. Create simulation debits/credits to view activity logs here.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-8">
          {["Today", "Yesterday", "Earlier"].map((groupName) => {
            const list = grouped[groupName];
            if (!list || list.length === 0) return null;
            return (
              <div key={groupName} className="space-y-4">
                <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest pl-2 border-l-2 border-brand-primary">
                  {groupName}
                </h3>
                
                <div className="space-y-3">
                  {list.map((n, idx) => {
                    const category = categorizeNotification(n.message);
                    const CategoryIcon = category.icon;
                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="p-4 rounded-2xl glass-panel border border-white/5 flex gap-4 items-center hover:border-white/15 transition-all"
                      >
                        <div className={`p-2.5 rounded-xl border flex items-center justify-center flex-shrink-0 ${category.color}`}>
                          <CategoryIcon size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-sm font-bold text-white truncate">{n.title}</h4>
                            <span className="text-[10px] text-brand-muted font-medium whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-xs text-brand-muted mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
