"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { ShieldCheck, Lock, Clock, CheckCircle2, AlertTriangle, AlertCircle, FileText } from "lucide-react";
import { ethers } from "ethers";
import EscrowJSON from "@/constants/Escrow.json";
import { ESCROW_ADDRESS } from "@/constants";

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
    if (!window.ethereum) return;
    const eth = window.ethereum;
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
        }
    }
}

export default function SellerDashboard() {
  const [userName, setUserName] = useState("Seller");
  const [account, setAccount] = useState<string | null>(null);
  const [escrows, setEscrows] = useState<EscrowTx[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<number | null>(null);

  const fetchEscrows = useCallback(async (userAddress: string) => {
      setIsLoading(true);
      setFetchError(null);
      try {
          await switchToHardhatNetwork();

          const provider = new ethers.BrowserProvider(window.ethereum!);
          const contract = new ethers.Contract(ESCROW_ADDRESS, EscrowJSON.abi, provider);

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

              const isSeller = seller.toLowerCase() === userAddress.toLowerCase();
              
              if (isSeller) {
                  fetchedEscrows.push({
                      id: i,
                      buyer,
                      seller,
                      amount: ethers.formatEther(amount),
                      deadline: Number(deadline),
                      isCompleted,
                      isRefunded,
                      role: 'seller',
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
    const data = localStorage.getItem("trustchain_user");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.name) setUserName(parsed.name);
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

      const eth = window.ethereum as any;
      eth.on("accountsChanged", handleAccountsChanged);
      eth.on("chainChanged", handleChainChanged);

      return () => {
          eth.removeListener("accountsChanged", handleAccountsChanged);
          eth.removeListener("chainChanged", handleChainChanged);
      };
  }, [fetchEscrows]);

  const handleRefund = async (id: number) => {
      if (!window.ethereum) return;
      try {
          setRefundingId(id);
          await switchToHardhatNetwork();
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(ESCROW_ADDRESS, EscrowJSON.abi, signer);

          const tx = await contract.refundBuyer(id);
          await tx.wait();

          setEscrows(prev => prev.map(e => e.id === id ? { ...e, isCompleted: true, isRefunded: true } : e));
      } catch (error: any) {
          console.error("Error refunding funds:", error);
          alert(error?.reason || error?.message || "Failed to issue refund.");
      } finally {
          setRefundingId(null);
      }
  };

  const totalReceived = escrows
    .filter(e => e.isCompleted && !e.isRefunded)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
              Seller Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, {userName}. Here are your active contracts.</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
             {account && !isLoading && (
                 <button
                     onClick={() => fetchEscrows(account)}
                     className="inline-flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                 >
                     ↻ Refresh
                 </button>
             )}
            <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
               <span className="text-xs font-medium text-emerald-400">System Secure & Active</span>
            </div>
          </div>
        </div>

        {/* Overview Stats: Only showing Funds Received as requested */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden group max-w-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="w-24 h-24 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-2">Total Funds Received</p>
            <p className="text-5xl font-bold font-mono text-emerald-400">{totalReceived.toFixed(2)} ETH</p>
            <p className="text-sm text-emerald-400/80 mt-4 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Successfully released to your wallet
            </p>
          </div>
        </div>

        {fetchError && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">Could not load escrows</p>
                    <p className="mt-1 text-red-400/70">{fetchError}</p>
                </div>
            </div>
        )}

        {/* Active Transactions List */}
        <h2 className="text-xl font-bold mb-6 text-white flex items-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <FileText className="w-5 h-5 mr-2 text-gray-400" /> Your Escrow Contracts
        </h2>
        
        {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        ) : !account ? (
            <div className="text-center py-20 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl">
                <Lock className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">Wallet Not Connected</h3>
                <p className="mt-2 text-sm text-gray-500">Please connect your MetaMask wallet to view your active escrows.</p>
            </div>
        ) : escrows.length === 0 && !fetchError ? (
            <div className="text-center py-20 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl">
                <ShieldCheck className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300">No Active Contracts</h3>
                <p className="mt-2 text-sm text-gray-500">Buyers have not initiated any escrows directed towards your wallet address yet.</p>
            </div>
        ) : (
            <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="grid grid-cols-1 divide-y divide-white/5">
                {escrows.map(escrow => (
                    <div key={escrow.id} className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                       <div className={`absolute left-0 top-0 bottom-0 w-1 ${escrow.isCompleted && !escrow.isRefunded ? 'bg-gradient-to-b from-blue-500 to-cyan-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : escrow.isRefunded ? 'bg-gradient-to-b from-gray-500 to-zinc-500 shadow-[0_0_10px_rgba(156,163,175,0.5)]' : 'bg-gradient-to-b from-emerald-500 to-green-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`}></div>
                       
                       <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-lg font-bold text-white">Escrow Contract #{escrow.id}</h3>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${escrow.isCompleted && !escrow.isRefunded ? 'bg-blue-500/10 text-cyan-400 border-blue-500/20' : escrow.isRefunded ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                             {escrow.isCompleted && !escrow.isRefunded ? "Completed & Funds Released" : escrow.isRefunded ? "Refunded to Buyer" : "Funds Locked By Buyer"}
                           </span>
                         </div>
                         <p className="text-sm text-gray-400 mb-4 leading-relaxed max-w-2xl">
                           {escrow.isRefunded
                              ? "You have refunded this escrow. The funds have been returned to the buyer and this contract is now closed."
                              : escrow.isCompleted 
                              ? "The buyer has verified delivery and released the funds from this smart contract. The ETH is now available in your wallet."
                              : "Buyer has successfully deposited the agreed amount into the smart contract. Funds are securely locked and mathematically guaranteed. You may confidently begin work."
                           }
                         </p>
                         
                         <div className="flex flex-wrap items-center gap-4 text-xs">
                           <div className="flex items-center text-gray-400">
                             <span className="text-gray-500 mr-1">Deadline:</span> {new Date(escrow.deadline * 1000).toLocaleString()}
                           </div>
                         </div>
                       </div>
        
                       <div className="w-full lg:w-auto bg-black/50 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center min-w-[240px]">
                         <div className="text-sm text-gray-400 mb-1">{escrow.isCompleted && !escrow.isRefunded ? "Released Funds" : escrow.isRefunded ? "Refunded Amount" : "Locked Funds"}</div>
                         <div className={`text-3xl font-mono font-bold bg-clip-text text-transparent mb-3 ${escrow.isCompleted && !escrow.isRefunded ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : escrow.isRefunded ? 'text-gray-500' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'}`}>
                           {escrow.amount} ETH
                         </div>
                         
                         {!escrow.isCompleted && (
                             <div className="flex flex-col gap-2 w-full">
                               <div className="w-full flex items-center justify-center py-2 px-3 border border-emerald-500/20 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 mb-2">
                                 <Lock className="w-4 h-4 mr-2" /> Verified In Escrow
                               </div>
                               <button 
                                   onClick={() => handleRefund(escrow.id)}
                                   disabled={refundingId === escrow.id}
                                   className="w-full text-xs py-1.5 px-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                               >
                                   {refundingId === escrow.id ? "Refunding..." : "Refund Buyer"}
                               </button>
                             </div>
                         )}
                         {escrow.isCompleted && !escrow.isRefunded && (
                             <div className="w-full flex items-center justify-center py-2 px-3 border rounded-lg text-xs font-medium bg-blue-500/10 border-blue-500/20 text-blue-400">
                               <CheckCircle2 className="w-4 h-4 mr-2" /> Released to You
                             </div>
                         )}
                         {escrow.isRefunded && (
                             <div className="w-full flex items-center justify-center py-2 px-3 border rounded-lg text-xs font-medium bg-gray-500/10 border-gray-500/20 text-gray-400">
                               <CheckCircle2 className="w-4 h-4 mr-2" /> Refunded
                             </div>
                         )}
                       </div>
                    </div>
                ))}
              </div>
            </div>
        )}
      </main>
    </div>
  );
}
