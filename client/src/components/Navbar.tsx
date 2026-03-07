"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Wallet, User, LogOut, ShieldCheck, Tag } from 'lucide-react';
import AuthModal from './AuthModal';
import { ethers } from 'ethers';

export default function Navbar() {
    const [account, setAccount] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // Simulated Auth State
    const [user, setUser] = useState<{ email: string; role: string; name: string; walletAddress?: string } | null>(null);

    useEffect(() => {
        checkIfWalletIsConnected();
        loadUserFromStorage();

        // Listen for login/logout events from other components
        window.addEventListener('auth_changed', loadUserFromStorage);
        return () => window.removeEventListener('auth_changed', loadUserFromStorage);
    }, []);

    const loadUserFromStorage = () => {
        const storedUser = localStorage.getItem('trustchain_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    };

    const checkIfWalletIsConnected = async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    setAccount(accounts[0].address);
                }
            } catch (error) {
                console.error("Error checking wallet connection", error);
            }
        }
    };

    const connectWallet = () => {
        window.location.href = '/auth';
    };

    const handleLogout = () => {
        localStorage.removeItem('trustchain_user');
        setUser(null);
        window.dispatchEvent(new Event("auth_changed"));
    };

    const formatAddress = (addr: string) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };
    return (
        <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/home" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-80 transition-opacity">
                            TrustChain
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user?.role !== 'seller' && (
                            <Link href="/create" className="text-gray-300 hover:text-white transition-colors text-sm font-medium mr-4">
                                Create Escrow
                            </Link>
                        )}
                        {account && user ? (
                            <Link href={`/${user.role}`} className="text-gray-300 hover:text-white transition-colors text-sm font-medium mr-4 flex items-center gap-1.5">
                                Dashboard
                            </Link>
                        ) : null}

                        {/* Simulated Application Auth Logic */}
                        {!user ? (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="text-gray-300 hover:text-white transition-colors text-sm font-medium mr-4 flex items-center gap-1.5"
                            >
                                <User className="w-4 h-4" />
                                Sign In / Up
                            </button>
                        ) : (
                            <div className="flex items-center gap-4 mr-4">
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                    {user.role === 'buyer' ? (
                                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                                    ) : (
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    )}
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                                        {user.role}
                                    </span>
                                </div>
                                {user.walletAddress && (
                                     <div className="hidden sm:block px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                                         <span className="text-xs font-mono text-gray-400">
                                            {formatAddress(user.walletAddress)}
                                         </span>
                                     </div>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-400 hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Wallet Connection Logic */}
                        {account ? (
                            <div className="inline-flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 transition-all cursor-default">
                                <Wallet className="w-4 h-4 mr-2 text-emerald-400" />
                                <span className="text-emerald-400 mr-2">●</span> {formatAddress(account)}
                            </div>
                        ) : (
                            <Link
                                href="/auth"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black focus:ring-white transition-all transform hover:scale-105 active:scale-95"
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </nav>
    );
}
