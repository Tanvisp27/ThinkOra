"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import EscrowJSON from "@/constants/Escrow.json";
import { ESCROW_ADDRESS } from "@/constants";
import { Wallet, CheckCircle, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface EscrowTx {
    id: number;
    buyer: string;
    seller: string;
    amount: string;
    deadline: number;
    isCompleted: boolean;
    role: 'buyer' | 'seller';
}

const HARDHAT_CHAIN_ID = "0x7A69"; // 31337

async function switchToHardhatNetwork() {
    const eth = window.ethereum!;
    try {
        await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: HARDHAT_CHAIN_ID }],
        });
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            await eth.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: HARDHAT_CHAIN_ID,
                    chainName: "Hardhat Local",
                    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                    rpcUrls: ["http://127.0.0.1:8545"],
                }],
            });
        } else {
            throw switchError;
        }
    }
}

export default function Dashboard() {
    const [account, setAccount] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [escrows, setEscrows] = useState<EscrowTx[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [releasingId, setReleasingId] = useState<number | null>(null);

    const fetchEscrows = useCallback(async (userAddress: string) => {
        setIsLoading(true);
        setFetchError(null);
        try {
            // Ensure we are on the correct network before reading from the contract
            await switchToHardhatNetwork();

            const provider = new ethers.BrowserProvider(window.ethereum!);
            const contract = new ethers.Contract(ESCROW_ADDRESS, EscrowJSON.abi, provider);

            // Read the total number of escrows created
            const nextId: bigint = await contract.nextTransactionId();
            const idCount = Number(nextId);

            console.log(`[Dashboard] ESCROW_ADDRESS: ${ESCROW_ADDRESS}`);
            console.log(`[Dashboard] Total escrows in contract: ${idCount}`);
            console.log(`[Dashboard] Fetching for user: ${userAddress}`);

            if (idCount === 0) {
                setEscrows([]);
                return;
            }

            const fetchedEscrows: EscrowTx[] = [];

            for (let i = 0; i < idCount; i++) {
                // Use named field access (safer with ethers v6 struct returns)
                const txData = await contract.transactions(i);

                const buyer: string = txData.buyer;
                const seller: string = txData.seller;
                const amount: bigint = txData.amount;
                const deadline: bigint = txData.deadline;
                const isCompleted: boolean = txData.isCompleted;

                console.log(`[Dashboard] Escrow #${i}:`, { buyer, seller, amount: amount.toString(), deadline: deadline.toString(), isCompleted });

                const isBuyer = buyer.toLowerCase() === userAddress.toLowerCase();
                const isSeller = seller.toLowerCase() === userAddress.toLowerCase();

                if (isBuyer || isSeller) {
                    fetchedEscrows.push({
                        id: i,
                        buyer,
                        seller,
                        amount: ethers.formatEther(amount),
                        deadline: Number(deadline),
                        isCompleted,
                        role: isBuyer ? 'buyer' : 'seller',
                    });
                }
            }

            console.log(`[Dashboard] Escrows belonging to user: ${fetchedEscrows.length}`);
            setEscrows(fetchedEscrows.reverse());

        } catch (error: any) {
            console.error("[Dashboard] Error fetching escrows:", error);
            setFetchError(error?.message || "Failed to fetch escrows. Make sure your Hardhat node is running.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('trustchain_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUserRole(parsed.role);
                // Redirect buyer to their new custom dashboard automatically
                if (parsed.role === 'buyer') {
                   window.location.href = '/buyer';
                }
            } catch (e) {
                console.error("Error parsing user role", e);
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.ethereum) {
            setIsLoading(false);
            return;
        }

        const init = async () => {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum!);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    const addr = accounts[0].address;
                    setAccount(addr);
                    fetchEscrows(addr);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("[Dashboard] Error initializing:", error);
                setIsLoading(false);
            }
        };

        init();

        // Re-fetch when user switches MetaMask account or network
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                fetchEscrows(accounts[0]);
            } else {
                setAccount(null);
                setEscrows([]);
                setIsLoading(false);
            }
        };

        const handleChainChanged = () => {
            // Re-initialize after network switch
            init();
        };

        window.ethereum!.on("accountsChanged", handleAccountsChanged);
        window.ethereum!.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum!.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum!.removeListener("chainChanged", handleChainChanged);
        };
    }, [fetchEscrows]);

    const handleRelease = async (id: number) => {
        if (!window.ethereum) return;
        try {
            setReleasingId(id);
            await switchToHardhatNetwork();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ESCROW_ADDRESS, EscrowJSON.abi, signer);

            const tx = await contract.releaseFunds(id);
            await tx.wait();

            setEscrows(prev => prev.map(e => e.id === id ? { ...e, isCompleted: true } : e));
        } catch (error: any) {
            console.error("[Dashboard] Error releasing funds:", error);
            alert(error?.reason || error?.message || "Failed to release funds. See console for details.");
        } finally {
            setReleasingId(null);
        }
    };

    const formatAddress = (addr: string) =>
        `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

    return (
        <div className="min-h-[calc(100vh-4rem)] pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Your Dashboard</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            {account ? `Connected as: ${formatAddress(account)}` : 'Connect your wallet to view active escrows.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {account && !isLoading && (
                            <button
                                onClick={() => fetchEscrows(account)}
                                className="inline-flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                            >
                                ↻ Refresh
                            </button>
                        )}
                        {userRole !== 'seller' && (
                            <Link href="/create" className="inline-flex items-center justify-center px-4 py-2 border border-blue-500/50 rounded-lg text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                                New Escrow
                            </Link>
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                {fetchError && (
                    <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Could not load escrows</p>
                            <p className="mt-1 text-red-400/70">{fetchError}</p>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                ) : !account ? (
                    <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-2xl">
                        <Wallet className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-300">Wallet Not Connected</h3>
                        <p className="mt-2 text-sm text-gray-500">Please connect your MetaMask wallet using the navigation bar.</p>
                    </div>
                ) : escrows.length === 0 && !fetchError ? (
                    <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-2xl">
                        <ShieldCheck className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-300">No Escrows Found</h3>
                        <p className="mt-2 text-sm text-gray-500">You don't have any active or past escrows yet.</p>
                        {userRole !== 'seller' && (
                            <Link href="/create" className="mt-6 inline-flex items-center px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors">
                                Create your first escrow
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {escrows.map((escrow) => (
                            <div key={escrow.id} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group relative overflow-hidden">
                                {/* Status stripe */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${escrow.isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/10 text-gray-300 uppercase tracking-wider">
                                            Role: {escrow.role}
                                        </span>
                                        {escrow.isCompleted ? (
                                            <span className="flex items-center text-xs font-medium text-emerald-400">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-xs font-medium text-blue-400">
                                                <Clock className="w-3 h-3 mr-1" /> Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                                            {escrow.amount} ETH
                                        </span>
                                        <span className="text-xs text-gray-500">ID: #{escrow.id}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {escrow.role === 'buyer' && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Buyer</span>
                                            <span className="font-mono text-gray-300">{formatAddress(escrow.buyer)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Seller</span>
                                        <span className="font-mono text-gray-300">{formatAddress(escrow.seller)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Deadline</span>
                                        <span className="text-gray-300">{new Date(escrow.deadline * 1000).toLocaleString()}</span>
                                    </div>
                                </div>

                                {!escrow.isCompleted && escrow.role === 'buyer' && (
                                    <button
                                        onClick={() => handleRelease(escrow.id)}
                                        disabled={releasingId === escrow.id}
                                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 focus:outline-none transition-colors disabled:opacity-50"
                                    >
                                        {releasingId === escrow.id ? "Releasing..." : "Release Funds"}
                                    </button>
                                )}

                                {!escrow.isCompleted && escrow.role === 'seller' && (
                                    <div className="w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium bg-white/5 text-gray-400">
                                        Waiting for buyer to release
                                    </div>
                                )}

                                {escrow.isCompleted && (
                                    <div className="w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        Funds Successfully Released
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
