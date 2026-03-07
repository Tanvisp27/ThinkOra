"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import EscrowJSON from "@/constants/Escrow.json";
import { ESCROW_ADDRESS } from "@/constants";
import { CheckCircle, Clock, ShieldCheck, Lock, Wallet, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface EscrowTx {
    id: number;
    buyer: string;
    seller: string;
    amount: string;
    deadline: number;
    isCompleted: boolean;
    isRefunded: boolean;
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

export default function BuyerDashboard() {
  const [userName, setUserName] = useState("Buyer");
  const [account, setAccount] = useState<string | null>(null);
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

          if (idCount === 0) {
              setEscrows([]);
              return;
          }

          const fetchedEscrows: EscrowTx[] = [];

          for (let i = 0; i < idCount; i++) {
              const txData = await contract.transactions(i);
              const buyer: string = txData.buyer;
              const seller: string = txData.seller;
              const amount: bigint = txData.amount;
              const deadline: bigint = txData.deadline;
              const isCompleted: boolean = txData.isCompleted;
              const isRefunded: boolean = txData.isRefunded;

              const isBuyer = buyer.toLowerCase() === userAddress.toLowerCase();
              
              // We only want to populate the BUYER dashboard with escrows they are funding
              if (isBuyer) {
                  fetchedEscrows.push({
                      id: i,
                      buyer,
                      seller,
                      amount: ethers.formatEther(amount),
                      deadline: Number(deadline),
                      isCompleted,
                      isRefunded,
                      role: 'buyer',
                  });
              }
          }

          setEscrows(fetchedEscrows.reverse());

      } catch (error: any) {
          console.error("Error fetching escrows:", error);
          setFetchError(error?.message || "Failed to fetch active smart contracts from Hardhat.");
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('trustchain_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserName(parsed.name || "Buyer");
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
              console.error("Error initializing:", error);
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
          console.error("Error releasing funds:", error);
          alert(error?.reason || error?.message || "Failed to release funds.");
      } finally {
          setReleasingId(null);
      }
  };

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const totalEscrowed = escrows.reduce((sum, e) => sum + Number(e.amount), 0);
  const activeCount = escrows.filter(e => !e.isCompleted).length;
  const completedCount = escrows.filter(e => e.isCompleted && !e.isRefunded).length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-black text-white selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
              Buyer Dashboard
            </h1>
            <p className="mt-3 text-gray-400 text-lg">
              Welcome back, <span className="text-white font-medium">{userName}</span>. Here is your escrow history.
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
             <Link href="/create" className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl text-sm font-semibold text-black bg-white hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                Create New Escrow
             </Link>
             <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>System Secure</span>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Lock className="w-16 h-16 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Escrowed Value</p>
            <h3 className="text-3xl font-bold text-white mb-2">{totalEscrowed.toFixed(2)} ETH</h3>
            <p className="text-xs text-blue-400 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Fully Secured by Smart Contracts
            </p>
          </div>
          
          <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-16 h-16 text-yellow-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Awaiting Delivery</p>
            <h3 className="text-3xl font-bold text-white mb-2">{activeCount} <span className="text-lg text-gray-400 font-normal">Active</span></h3>
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Completed Escrows</p>
            <h3 className="text-3xl font-bold text-white mb-2">{completedCount} <span className="text-lg text-gray-400 font-normal">Successful</span></h3>
          </div>
        </div>

        {/* Dynamic Active Escrows Section */}
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
                <p className="mt-2 text-sm text-gray-500">Please connect your MetaMask wallet to view your active escrows.</p>
            </div>
        ) : escrows.length === 0 && !fetchError ? (
            <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-2xl">
                <ShieldCheck className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Funded Escrows</h3>
                <p className="mt-2 text-sm text-gray-500">You haven't funded any escrows yet.</p>
                <Link href="/create" className="mt-6 inline-flex items-center px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors">
                    Create an Escrow
                </Link>
            </div>
        ) : (
            <div>
               <div className="flex items-center gap-2 mb-6">
                 <Wallet className="w-5 h-5 text-gray-400" />
                 <h2 className="text-xl font-semibold text-white">Your Funded Escrows History</h2>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                 {escrows.map(escrow => (
                     <div key={escrow.id} className="bg-zinc-950 border border-white/5 rounded-3xl p-1 overflow-hidden group hover:border-white/10 transition-colors relative">
                       <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${escrow.isCompleted && !escrow.isRefunded ? 'from-emerald-500 to-emerald-400' : escrow.isRefunded ? 'from-gray-500 to-zinc-500' : 'from-blue-500 to-cyan-500'}`}></div>
                       <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8 justify-between">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-3">
                             <h3 className="text-xl font-bold text-white">Escrow Contract #{escrow.id}</h3>
                             <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${escrow.isCompleted && !escrow.isRefunded ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : escrow.isRefunded ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                               {escrow.isCompleted && !escrow.isRefunded ? "Completed" : escrow.isRefunded ? "Refunded" : "Active"}
                             </span>
                           </div>
                           <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-2xl">
                             {escrow.isRefunded
                                ? "The seller was unable to fulfill this contract and has refunded the escrow. The ETH has been securely returned to your wallet front the smart contract."
                                : escrow.isCompleted 
                                ? "You have successfully released the funds for this contract. The transaction is complete and verifiable on the blockchain."
                                : `You have successfully deposited ETH into the smart contract. The funds are mathematically locked. Ensure you are satisfied with the delivery before releasing the funds to the seller.`
                             }
                           </p>
                           
                           <div className="flex flex-wrap items-center gap-4 text-xs">
                             <div className="flex items-center text-gray-400">
                               <span className="text-gray-500 mr-1">Seller:</span> <span className="font-mono text-gray-300">{formatAddress(escrow.seller)}</span>
                             </div>
                             <div className="flex items-center text-gray-400">
                               <span className="text-gray-500 mr-1">Deadline:</span> {new Date(escrow.deadline * 1000).toLocaleString()}
                             </div>
                           </div>
                         </div>
        
                         <div className="flex flex-col justify-center items-start lg:items-end min-w-[200px] border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                            <span className="text-xs text-gray-500 mb-1">{escrow.isCompleted && !escrow.isRefunded ? "Released Funds" : escrow.isRefunded ? "Refunded Amount" : "Locked Funds"}</span>
                            <span className={`text-3xl font-bold mb-4 ${escrow.isCompleted && !escrow.isRefunded ? "text-emerald-400" : escrow.isRefunded ? "text-gray-500" : "text-cyan-400"}`}>{escrow.amount} ETH</span>
                            {!escrow.isCompleted ? (
                                <button 
                                    onClick={() => handleRelease(escrow.id)}
                                    disabled={releasingId === escrow.id}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-semibold disabled:opacity-50"
                                >
                                    {releasingId === escrow.id ? "Releasing..." : "Release Funds"}
                                </button>
                            ) : escrow.isRefunded ? (
                                <div className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-400 text-sm font-medium">
                                    Refunded by Seller
                                </div>
                            ) : (
                                <div className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium">
                                    Funds Released
                                </div>
                            )}
                         </div>
                       </div>
                     </div>
                 ))}
               </div>
            </div>
        )}

      </div>
    </div>
  );
}
