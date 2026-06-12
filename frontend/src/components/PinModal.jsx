import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, AlertCircle, RefreshCw } from "lucide-react";

export default function PinModal({ isOpen, onClose, onSuccess, userId }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirmMode, setIsConfirmMode] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("ENTER"); // ENTER, CREATE
  const [shake, setShake] = useState(false);

  const savedPinKey = `upiPin_${userId}`;

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(savedPinKey);
      if (!saved) {
        setMode("CREATE");
      } else {
        setMode("ENTER");
      }
      setPin("");
      setConfirmPin("");
      setIsConfirmMode(false);
      setError("");
    }
  }, [isOpen, savedPinKey]);

  const handleKeyPress = (num) => {
    setError("");
    if (isConfirmMode) {
      if (confirmPin.length < 4) {
        const newConfirm = confirmPin + num;
        setConfirmPin(newConfirm);
        if (newConfirm.length === 4) {
          handleVerifyConfirm(newConfirm);
        }
      }
    } else {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          if (mode === "CREATE") {
            setIsConfirmMode(true);
          } else {
            handleVerifyEnter(newPin);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setError("");
    if (isConfirmMode) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleVerifyEnter = (enteredPin) => {
    const saved = localStorage.getItem(savedPinKey);
    if (enteredPin === saved) {
      onSuccess();
      onClose();
    } else {
      setShake(true);
      setError("Incorrect UPI PIN");
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleVerifyConfirm = (finalConfirm) => {
    if (finalConfirm === pin) {
      localStorage.setItem(savedPinKey, pin);
      onSuccess();
      onClose();
    } else {
      setShake(true);
      setError("PINs do not match. Try again.");
      setConfirmPin("");
      setIsConfirmMode(false);
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your UPI PIN?")) {
      localStorage.removeItem(savedPinKey);
      setMode("CREATE");
      setPin("");
      setConfirmPin("");
      setIsConfirmMode(false);
      setError("");
    }
  };

  if (!isOpen) return null;

  const currentInputLength = isConfirmMode ? confirmPin.length : pin.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm rounded-[32px] glass-panel p-6 shadow-2xl border border-white/10 flex flex-col items-center relative overflow-hidden"
        >
          {/* Top Banner decoration */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/5 text-brand-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Icon Header */}
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-4 glow-primary mt-4">
            <Lock size={20} />
          </div>

          {/* Heading Instructions */}
          <h4 className="font-bold text-white text-base text-center">
            {mode === "CREATE" 
              ? (isConfirmMode ? "Confirm UPI PIN" : "Setup UPI PIN") 
              : "Enter UPI PIN"
            }
          </h4>
          <p className="text-brand-muted text-xs text-center mt-1.5 px-4 leading-relaxed">
            {mode === "CREATE"
              ? (isConfirmMode 
                  ? "Retype your 4-digit transaction PIN to confirm" 
                  : "Choose a secure 4-digit PIN for authorization"
                )
              : "Confirm the transaction using your 4-digit secure code"
            }
          </p>

          {/* Dot Indicators */}
          <motion.div 
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex gap-4 my-6"
          >
            {[0, 1, 2, 3].map((idx) => {
              const isActive = idx < currentInputLength;
              return (
                <div 
                  key={idx} 
                  className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                    isActive 
                      ? "bg-brand-primary border-brand-primary scale-110 shadow-[0_0_12px_rgba(124,92,255,0.6)]" 
                      : "border-white/20 bg-white/5"
                  }`}
                />
              );
            })}
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="text-brand-danger text-[11px] font-semibold flex items-center gap-1 mb-4">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          {/* Numerical Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="h-12 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 active:scale-95 text-white font-bold text-lg transition-all flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            
            {/* Reset / Forgot PIN */}
            {mode === "ENTER" ? (
              <button
                onClick={handleReset}
                className="h-12 text-[10px] font-bold text-brand-muted hover:text-white transition-colors flex items-center justify-center gap-1 active:scale-95"
              >
                <RefreshCw size={10} />
                Reset
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={() => handleKeyPress("0")}
              className="h-12 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 active:scale-95 text-white font-bold text-lg transition-all flex items-center justify-center"
            >
              0
            </button>

            <button
              onClick={handleDelete}
              className="h-12 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 active:scale-95 text-brand-muted hover:text-white transition-all flex items-center justify-center font-bold text-sm"
            >
              ⌫
            </button>
          </div>

          {/* Subtext info */}
          <div className="text-[9px] text-brand-muted/70 text-center uppercase tracking-wider mt-2">
            Secure simulation sandbox
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
