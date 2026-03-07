import Link from 'next/link';
import { ShieldCheck, Clock, CheckCircle, ArrowRight, Zap, Lock, Coins, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full overflow-hidden bg-black text-white">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:px-8 mt-[-4rem]">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            TrustChain is live on Polygon Mainnet
            <ChevronRight className="ml-1 h-4 w-4 text-gray-500" />
          </div>

          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl animate-fade-in-up animation-delay-100 drop-shadow-sm">
            Trustless Escrow for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
              Web3 Economy
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400 animate-fade-in-up animation-delay-200">
            Secure your high-value transactions on the Polygon blockchain. Lock funds in smart contracts, release upon successful delivery, and eliminate counterparty risk forever.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-200">
            <Link
              href="/create"
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              Read Documentation
            </Link>
          </div>

          {/* Stats Mini Row */}
          <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4 border-t border-white/10 pt-8 animate-fade-in-up animation-delay-200 w-full max-w-4xl">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-white">$10M+</span>
              <span className="text-sm text-gray-500 mt-1">Total Value Locked</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-white">50k+</span>
              <span className="text-sm text-gray-500 mt-1">Transactions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-white">0.01s</span>
              <span className="text-sm text-gray-500 mt-1">Avg Finality</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-white">100%</span>
              <span className="text-sm text-gray-500 mt-1">Smart Contract Audited</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative w-full py-24 sm:py-32 bg-black/50 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-emerald-400 uppercase tracking-widest">Decentralized Trust</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for absolute security
            </p>
            <p className="mt-4 text-lg text-gray-400">
              Our smart contracts handle the complex logic, so you can focus on building your business with zero counterparty anxiety.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-colors backdrop-blur-sm group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30 mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6 text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Immutable Lockups</h3>
                <p className="text-gray-400 leading-relaxed">
                  Funds are cryptographically secured inside audited Polygon smart contracts. No human intervention can alter the terms once agreed upon.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-colors backdrop-blur-sm group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30 mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Instant Settlement</h3>
                <p className="text-gray-400 leading-relaxed">
                  The moment conditions are met, payments are instantly routed to the seller's wallet with negligible gas fees and zero intermediaries.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-colors backdrop-blur-sm group lg:col-span-1 sm:col-span-2">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 ring-1 ring-purple-500/30 mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-purple-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Time-locked Execution</h3>
                <p className="text-gray-400 leading-relaxed">
                  Automated dispute prevention. If the buyer goes silent after delivery, the smart contract automatically releases the funds upon the predefined deadline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how-it-works" className="relative w-full py-24 sm:py-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full mix-blend-screen -z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-16 sm:text-4xl">How TrustChain Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-500/50 via-emerald-500/50 to-purple-500/50 -z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-black border-4 border-blue-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <Coins className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Deposit Funds</h3>
              <p className="text-gray-400 text-center text-sm px-4">
                Buyer creates an agreement and deposits MATIC or stablecoins into the TrustChain smart contract.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center mt-8 md:mt-0">
              <div className="w-24 h-24 rounded-full bg-black border-4 border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. Verify Delivery</h3>
              <p className="text-gray-400 text-center text-sm px-4">
                Seller delivers the goods or services. The funds remain securely locked until the buyer approves.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center mt-8 md:mt-0">
              <div className="w-24 h-24 rounded-full bg-black border-4 border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <CheckCircle className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Release Pay</h3>
              <p className="text-gray-400 text-center text-sm px-4">
                Buyer approves, and funds are instantly transferred. If inactive, funds auto-release at deadline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full relative py-24 sm:py-32 bg-gradient-to-b from-black to-zinc-950 border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-6 sm:text-5xl">Ready to secure your transactions?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust our decentralized escrow protocol for their high-stakes deals on Polygon.
          </p>
          <Link
            href="/create"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] hover:bg-blue-500 transition-all duration-300 hover:-translate-y-1"
          >
            Launch App
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
      
      {/* Footer Minimal */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between px-8 bg-zinc-950">
        <p>© 2026 TrustChain Protocol. All rights reserved.</p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
          <Link href="#" className="hover:text-white transition-colors">Discord</Link>
          <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
        </div>
      </footer>
    </div>
  );
}
