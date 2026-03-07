"use client";

import { useState, useEffect } from "react";
import { Wallet, Shield, Hexagon, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect if already connected
        checkConnection();
    }, []);

    const checkConnection = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum as any);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    router.push("/dashboard");
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleConnect = async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            setStatus("error");
            setErrorMessage("MetaMask not found. Please install a Web3 wallet.");
            return;
        }

        try {
            setStatus("connecting");
            setIsConnecting(true);
            const provider = new ethers.BrowserProvider(window.ethereum as any);
            await provider.send("eth_requestAccounts", []);
            
            setStatus("success");
            
            // Short delay to show success state before redirecting
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
            
        } catch (error: any) {
            console.error("Wallet connection failed:", error);
            setStatus("error");
            setErrorMessage(error?.message || "Failed to connect wallet.");
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-black text-white selection:bg-blue-500/30">
            {/* Left side - Decorative & Brand */}
            <div className="hidden flex-1 lg:flex flex-col justify-between relative overflow-hidden bg-zinc-950 p-12 border-r border-white/5">
                {/* Background effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none"></div>
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen opacity-60 animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen opacity-60 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-blue-500/30">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            TrustChain
                        </span>
                    </div>
                </div>

                <div className="relative z-10 mb-20 max-w-lg">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
                        The new standard for secure Web3 transactions.
                    </h1>
                    <p className="text-lg text-gray-400 mb-8 animate-fade-in-up animation-delay-100">
                        Connect your wallet to access your dashboard, create new escrows, and manage your high-stakes payments with zero counterparty risk.
                    </p>
                    
                    <div className="space-y-4 animate-fade-in-up animation-delay-200">
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                            <span>100% decentralized on Polygon</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                            <span>Automated dispute resolution</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                            <span>Zero hidden fees</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Auth component */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                {/* Mobile branding */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-400" />
                    <span className="text-xl font-bold text-white">TrustChain</span>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-20 w-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-white/10">
                            <Wallet className="h-10 w-10 text-gray-300" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">
                            Connect your Web3 wallet to continue to TrustChain / ThinkOra.
                        </p>
                    </div>

                    <div className="mt-10 bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                        {status === "success" && (
                            <div className="absolute inset-0 bg-emerald-500/10 z-0 flex items-center justify-center animate-pulse">
                                <div className="absolute w-full h-full bg-gradient-to-t from-emerald-500/20 to-transparent bottom-0"></div>
                            </div>
                        )}
                        
                        <div className="relative z-10 space-y-4">
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting || status === "success"}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                                    ${status === "success" 
                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Hexagon className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">MetaMask</div>
                                        <div className="text-xs text-gray-400">Connect using browser extension</div>
                                    </div>
                                </div>

                                {status === "connecting" ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                                ) : status === "success" ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                ) : (
                                    <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
                                )}
                            </button>

                            {/* Additional wallet options can go here */}
                            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 opacity-50 cursor-not-allowed">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-300">WalletConnect</div>
                                        <div className="text-xs text-gray-500">Coming soon</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {status === "error" && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center animate-fade-in-up">
                            {errorMessage}
                        </div>
                    )}
                    
                    <p className="text-center text-sm text-gray-500 mt-8">
                        By connecting your wallet, you agree to our <br />
                        <a href="#" className="text-gray-400 hover:text-white underline underline-offset-4 decoration-white/20">Terms of Service</a> and <a href="#" className="text-gray-400 hover:text-white underline underline-offset-4 decoration-white/20">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
