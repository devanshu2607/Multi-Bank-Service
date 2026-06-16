import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import DashboardLayout from "./components/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import Logo from "./components/Logo";

// Lazy/Direct Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AccountsPage from "./pages/AccountsPage";
import AccountDetailsPage from "./pages/AccountDetailsPage";
import TransfersPage from "./pages/TransfersPage";
import UpiPage from "./pages/UpiPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SecurityPage from "./pages/SecurityPage";
import HelpPage from "./pages/HelpPage";

const LoadingScreen = ({ isDark }) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-6 font-sans transition-colors duration-300 relative overflow-hidden ${
      isDark ? "bg-[#000000] text-white" : "bg-[#F3F4F6] text-gray-900"
    }`}>
      {/* Dynamic backdrop glow dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none" />
      
      {/* Pulsing bank logo container */}
      <motion.div 
        animate={{ 
          scale: [1, 1.06, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 rounded-2xl border-2 border-green-600 dark:border-brand-primary flex items-center justify-center bg-transparent z-10"
      >
        <Logo size={30} className="text-green-600 dark:text-brand-primary" />
      </motion.div>

      {/* Loading metadata */}
      <div className="flex flex-col items-center gap-3 relative z-10">
        <motion.span 
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs font-bold tracking-[0.2em] text-green-600 dark:text-brand-primary uppercase"
        >
          Loading Zero...
        </motion.span>
        
        {/* Shimmering progress bar */}
        <div className="w-36 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-16 gradient-primary rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return <LoadingScreen isDark={isDark} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return <LoadingScreen isDark={isDark} />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

            {/* User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
            <Route path="/accounts/:accountNumber" element={<ProtectedRoute><AccountDetailsPage /></ProtectedRoute>} />
            <Route path="/transfers" element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} />
            <Route path="/upi" element={<ProtectedRoute><UpiPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
