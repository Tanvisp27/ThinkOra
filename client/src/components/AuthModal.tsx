"use client";

import { useState, useEffect } from "react";
import { X, Mail, Lock, ArrowRight, User, Shield, Wallet, ShoppingCart, Store } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectOnSuccess?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, redirectOnSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"buyer" | "seller" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let savedRole = role;
      let finalName = name;
      let finalWalletAddress = walletAddress;

      if (mode === "signup" && role) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role, walletAddress }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to sign up. Make sure MongoDB is running.");
          setIsSubmitting(false);
          return;
        }
      } else if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Invalid credentials.");
          setIsSubmitting(false);
          return;
        }
        
        // Update local variables with true verified data from MongoDB
        savedRole = data.user.role;
        finalName = data.user.name;
        finalWalletAddress = data.user.walletAddress || "";
      }

      const userData = {
        email,
        name: mode === "login" ? finalName : finalName || email.split("@")[0],
        walletAddress: finalWalletAddress,
        role: savedRole,
        isAuthenticated: true,
      };

      localStorage.setItem("trustchain_user", JSON.stringify(userData));
      
      // Dispatch custom event to notify Navbar cross-tree
      window.dispatchEvent(new Event("auth_changed"));

      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      
      if (redirectOnSuccess === "dynamic") {
        window.location.href = `/${savedRole}`;
      } else if (redirectOnSuccess) {
        window.location.href = redirectOnSuccess;
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Network error. Make sure your local MongoDB instance is running.");
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setEmail("");
    setPassword("");
    setWalletAddress("");
    setName("");
    setRole(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 h-screen w-screen overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm transition-opacity ${redirectOnSuccess ? 'bg-black/90' : 'bg-black/60'}`}
        onClick={redirectOnSuccess ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        {/* Close Button - Hide if it's the root page (has redirectOnSuccess) */}
        {!redirectOnSuccess && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-8 relative z-10">
          <div className="flex items-center justify-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 ring-1 ring-white/10 shadow-inner">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            {mode === "login" 
              ? "Enter your details to access your dashboard." 
              : "Sign up to start creating secure escrows."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("buyer")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        role === "buyer" 
                          ? "bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                          : "bg-black/50 border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${role === "buyer" ? "bg-blue-500/30" : "bg-white/5"}`}>
                        <ShoppingCart className={`w-5 h-5 ${role === "buyer" ? "text-blue-400" : "text-gray-500"}`} />
                      </div>
                      <span className="text-sm font-semibold">Buyer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("seller")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        role === "seller" 
                          ? "bg-emerald-500/20 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                          : "bg-black/50 border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${role === "seller" ? "bg-emerald-500/30" : "bg-white/5"}`}>
                        <Store className={`w-5 h-5 ${role === "seller" ? "text-emerald-400" : "text-gray-500"}`} />
                      </div>
                      <span className="text-sm font-semibold">Seller</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-white/5 rounded-xl text-white bg-transparent placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/5 transition-all sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Wallet Address (Polygon)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Wallet className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-white/5 rounded-xl text-white bg-transparent placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/5 transition-all sm:text-sm font-mono"
                      placeholder="0x..."
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-white/5 rounded-xl text-white bg-transparent placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/5 transition-all sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-xs font-medium text-gray-400">Password</label>
                {mode === "login" && (
                  <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-white/5 rounded-xl text-white bg-transparent placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/5 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (mode === "signup" && role === null)}
              className="w-full relative group flex items-center justify-center py-3.5 px-4 mt-6 border border-transparent text-sm font-bold rounded-xl text-black bg-gradient-to-r from-blue-400 to-emerald-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-400 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(52,211,153,0.15)]"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <div className="flex items-center">
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-all" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-zinc-950 text-gray-500 font-medium">Web3 Alternative</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl shadow-sm bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
            >
              <Wallet className="h-5 w-5 mr-3 text-blue-400" />
              Continue with Wallet
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            {mode === "login" ? "New user? " : "Already registered? "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {mode === "login" ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
