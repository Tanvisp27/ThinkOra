"use client";

import { useState } from "react";
import { ArrowRight, Wallet, Clock, User, DollarSign } from "lucide-react";
import { ethers } from "ethers";
import EscrowJSON from "@/constants/Escrow.json";
import { ESCROW_ADDRESS } from "@/constants";

export default function CreateEscrow() {
    const [seller, setSeller] = useState("");
    const [amount, setAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMssg, setStatusMssg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const switchToHardhatNetwork = async () => {
        const HARDHAT_CHAIN_ID = "0x7A69"; // 31337 in hex
        const eth = window.ethereum!;
        try {
            await eth.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: HARDHAT_CHAIN_ID }],
            });
        } catch (switchError: any) {
            // 4902 = chain not added yet, so we add it
            if (switchError.code === 4902) {
                await eth.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: HARDHAT_CHAIN_ID,
                            chainName: "Hardhat Local",
                            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                            rpcUrls: ["http://127.0.0.1:8545"],
                        },
                    ],
                });
            } else {
                throw switchError;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMssg(null);

        if (!window.ethereum) {
            setStatusMssg({ type: 'error', text: "MetaMask not found. Please install MetaMask to use this app." });
            return;
        }

        try {
            setIsSubmitting(true);

            // Auto-switch to Hardhat local network
            setStatusMssg({ type: 'success', text: "Switching to Hardhat network..." });
            await switchToHardhatNetwork();

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(ESCROW_ADDRESS, EscrowJSON.abi, signer);

            // Calculate duration in seconds
            const deadlineDate = new Date(deadline);
            const now = new Date();
            const durationInSeconds = Math.floor((deadlineDate.getTime() - now.getTime()) / 1000);

            if (durationInSeconds <= 0) {
                setStatusMssg({ type: 'error', text: "Deadline must be in the future." });
                return;
            }

            const parsedAmount = ethers.parseEther(amount);

            const tx = await contract.createEscrow(seller, durationInSeconds, { value: parsedAmount, gasLimit: 1000000 });

            setStatusMssg({ type: 'success', text: "Transaction submitted! Waiting for confirmation..." });

            await tx.wait();

            setStatusMssg({ type: 'success', text: "Escrow created successfully!" });

            // Reset form
            setSeller("");
            setAmount("");
            setDeadline("");

        } catch (error: any) {
            console.error("Error creating escrow:", error);
            setStatusMssg({ type: 'error', text: error.reason || error.message || "Failed to create escrow." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-black overflow-hidden">
            {/* Background gradients */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-50"></div>

            <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in-up">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-white tracking-tight">
                        Create an Escrow
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Securely lock your funds until conditions are met.
                    </p>
                </div>

                {statusMssg && (
                    <div className={`p-4 rounded-lg text-sm font-medium ${statusMssg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                        {statusMssg.text}
                    </div>
                )}

                <form className="mt-8 space-y-6 bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl" onSubmit={handleSubmit}>
                    <div className="space-y-5 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="seller-address" className="block text-sm font-medium text-gray-300 mb-1">
                                Seller Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    id="seller-address"
                                    name="seller"
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg text-white bg-black/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="0x..."
                                    value={seller}
                                    onChange={(e) => setSeller(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                                Amount (MATIC)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg text-white bg-black/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">
                                Deadline
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Clock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    id="deadline"
                                    name="deadline"
                                    type="datetime-local"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg text-white bg-black/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm [color-scheme:dark]"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Funds auto-release to seller after this time if not resolved.</p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-gradient-to-r from-blue-400 to-emerald-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-400 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <Wallet className="h-5 w-5 text-black/50 group-hover:text-black/80 transition-colors" aria-hidden="true" />
                            </span>
                            {isSubmitting ? "Processing..." : "Lock Funds in Escrow"}
                            {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
