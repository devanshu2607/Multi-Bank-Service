import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Wallet, 
  Send, 
  RefreshCw, 
  QrCode, 
  Bell, 
  User, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Search, 
  ChevronLeft, 
  Menu,
  Settings,
  X,
  TrendingUp
} from "lucide-react";
import { notificationApi } from "../../services/api";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const showToast = (title, message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Poll notifications from service
  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = async () => {
        try {
          const list = await notificationApi.getNotifications(user.id);
          setNotifications(list);
          setUnreadNotifications(list.length);
        } catch (err) {
          console.error("Failed to load notifications", err);
        }
      };
      
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Accounts", path: "/accounts", icon: Wallet },
    { name: "Transfers", path: "/transfers", icon: Send },
    { name: "UPI Management", path: "/upi", icon: QrCode },
    { name: "Notifications", path: "/notifications", icon: Bell, badge: unreadNotifications },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Security", path: "/security", icon: Shield },
    { name: "Help & Support", path: "/help", icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen bg-brand-bg text-white flex flex-col relative overflow-hidden">
        
        {/* Glow circles in layout */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] height-[600px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] height-[600px] rounded-full bg-brand-secondary/5 blur-[120px] pointer-events-none z-0" />

        {/* 1. Sticky Glass Navbar */}
        <header className="sticky top-0 z-50 h-[72px] w-full glass-nav flex items-center justify-between px-6 z-40">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={20} />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
                <TrendingUp size={22} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-white to-brand-secondary bg-clip-text text-transparent hidden sm:inline">
                AuraBank
              </span>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex items-center w-96 relative">
            <Search size={18} className="absolute left-4 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Search transactions, accounts, bills..." 
              className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm placeholder-brand-muted focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 relative transition-colors hidden sm:block">
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-danger glow-primary" />
              )}
            </Link>

            <Link to="/help" className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors hidden sm:block">
              <HelpCircle size={18} />
            </Link>

            <Link to="/security" className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors hidden sm:block">
              <Settings size={18} />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium pr-1 hidden lg:inline max-w-[120px] truncate">
                  {user?.fullName || "User"}
                </span>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-56 rounded-2xl glass-panel p-2 shadow-2xl z-50"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                        <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                        <p className="text-xs text-brand-muted truncate">{user?.email}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-brand-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <User size={16} />
                        Profile Settings
                      </Link>
                      <Link 
                        to="/security" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-brand-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <Shield size={16} />
                        Security Center
                      </Link>
                      <button 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-danger hover:bg-brand-danger/10 rounded-xl transition-colors mt-1.5"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Outer Wrapper for Sidebar + Content */}
        <div className="flex flex-1 z-10">
          
          {/* 2. Left Sidebar (Desktop) */}
          <aside className={`hidden lg:flex flex-col glass-sidebar py-6 px-4 transition-all duration-300 relative z-30 ${sidebarCollapsed ? "w-20" : "w-64"}`}>
            
            {/* Collapse Trigger */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-brand-surface border border-white/15 flex items-center justify-center hover:bg-white/5 transition-colors z-40 text-brand-muted hover:text-white"
            >
              <ChevronLeft size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>

            {/* Nav Links */}
            <nav className="flex-1 flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name} 
                    to={item.path}
                    className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all group relative ${
                      isActive 
                        ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 glow-primary font-semibold" 
                        : "text-brand-muted hover:text-white border border-transparent hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-brand-primary" : "text-brand-muted group-hover:text-white transition-colors"} />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {item.badge > 0 && !sidebarCollapsed && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-[10px] text-brand-primary font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout button in sidebar */}
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium text-brand-danger border border-transparent hover:bg-brand-danger/10 transition-all mt-auto`}
            >
              <LogOut size={18} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </aside>

          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.aside 
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed top-0 bottom-0 left-0 w-64 glass-panel border-r border-white/10 z-50 p-6 flex flex-col gap-6 lg:hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-brand-primary glow-text">AuraBank</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                      <X size={20} />
                    </button>
                  </div>
                  <nav className="flex flex-col gap-1.5">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link 
                          key={item.name} 
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                            isActive 
                              ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 glow-primary font-semibold" 
                              : "text-brand-muted hover:text-white border border-transparent hover:bg-white/5"
                          }`}
                        >
                          <Icon size={18} />
                          <span className="flex-1">{item.name}</span>
                          {item.badge > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-[10px] text-brand-primary font-bold">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-brand-danger hover:bg-brand-danger/10 transition-colors mt-auto"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* 3. Main Content Area */}
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-y-auto relative z-20">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="max-w-[1440px] mx-auto space-y-6"
            >
              {children}
            </motion.div>
          </main>
        </div>

        {/* 4. Floating Notifications (Toast list) */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ type: "spring", damping: 18, stiffness: 220 }}
                className={`pointer-events-auto p-4 rounded-2xl glass-panel shadow-2xl border-l-4 flex gap-3.5 items-start ${
                  toast.type === "success" 
                    ? "border-l-brand-success" 
                    : toast.type === "danger" 
                    ? "border-l-brand-danger" 
                    : "border-l-brand-warning"
                }`}
              >
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
                  <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{toast.message}</p>
                </div>
                <button 
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-brand-muted hover:text-white p-0.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
