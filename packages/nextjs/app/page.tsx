"use client";

import Image from "next/image";
import { ArrowRightIcon, CpuChipIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Resources", href: "#resources" },
  { label: "Plans & Pricing", href: "#pricing" },
  { label: "About us", href: "#about" },
];

export default function Home() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start px-4 overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Layered green gradients for web3 effect */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-20%] top-[-10%] w-[60vw] h-[60vw] bg-green-700/20 rounded-full blur-[120px]" />
        <div className="absolute right-[-15%] top-[30%] w-[50vw] h-[40vw] bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute left-[30%] bottom-[-20%] w-[40vw] h-[30vw] bg-green-400/10 rounded-full blur-[90px]" />
      </div>
      {/* Navigation Bar */}
      <nav className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 px-4 mt-4 bg-white/5 backdrop-blur-md rounded-2xl border border-green-900/30 shadow-lg">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="CleanChain Logo" width={40} height={40} />
          <span className="text-2xl font-bold text-emerald-300 tracking-tight">CleanChain</span>
        </div>
        <div className="hidden md:flex gap-8">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <button className="ml-6 px-7 py-2 rounded-md bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium tracking-wide uppercase shadow-lg border-2 border-green-400/60 hover:from-emerald-500 hover:to-green-600 hover:border-emerald-400 transition-all text-base">
          Sign Up
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center mt-28 mb-20 min-h-[340px]">
        {/* Glowing radial background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-96 h-40 md:w-[36rem] md:h-60 rounded-full bg-emerald-500/20 blur-3xl opacity-70" />
        </div>
        <h1 className="relative z-10 font-extrabold leading-tight drop-shadow-lg mb-3">
          <span
            className="block text-5xl md:text-6xl lg:text-7xl mb-2 text-emerald-200"
            style={{ textShadow: "0 0 32px #34d399, 0 2px 8px #052e16" }}
          >
            Cleaning The World
          </span>
          <span
            className="block text-2xl md:text-3xl text-emerald-100/80 font-semibold mt-2 tracking-wider"
            style={{ letterSpacing: "0.06em" }}
          >
            One Hash at a Time
          </span>
        </h1>
        <p className="relative z-10 text-base md:text-lg text-emerald-100/90 mb-8 max-w-xl mx-auto mt-2">
          Build a cleaner world with CleanChain&apos;s decentralized, transparent, and community-driven garbage
          collection platform.
          <br className="hidden md:block" /> Track, verify, and incentivize positive action—powered by Monad blockchain.
        </p>
        <button className="relative z-10 px-10 py-3 rounded-md bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium tracking-wide uppercase shadow-xl border-2 border-green-400/60 hover:from-emerald-500 hover:to-green-600 hover:border-emerald-400 transition-all text-lg flex items-center gap-2 mx-auto">
          Get Started <ArrowRightIcon className="w-5 h-5 text-emerald-100" />
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {/* Feature 1 */}
        <div className="bg-white/5 border border-green-900/30 rounded-2xl p-8 flex flex-col items-center shadow-lg backdrop-blur-md hover:border-emerald-500 transition-all">
          <CpuChipIcon className="w-10 h-10 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-emerald-100 mb-2">Proof-Based Collection</h3>
          <p className="text-emerald-100/70 mb-0 text-center text-sm">
            Every garbage collection event is logged with cryptographic proof and image validation, ensuring
            transparency and trust for all participants.
          </p>
        </div>
        {/* Feature 2 */}
        <div className="bg-white/5 border border-green-900/30 rounded-2xl p-8 flex flex-col items-center shadow-lg backdrop-blur-md hover:border-emerald-500 transition-all">
          <UsersIcon className="w-10 h-10 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-emerald-100 mb-2">Community Incentives</h3>
          <p className="text-emerald-100/70 mb-0 text-center text-sm">
            Households, cleaners, and validators earn points and reputation for their contributions, fostering a cleaner
            and more engaged neighborhood.
          </p>
        </div>
        {/* Feature 3 */}
        <div className="bg-white/5 border border-green-900/30 rounded-2xl p-8 flex flex-col items-center shadow-lg backdrop-blur-md hover:border-emerald-500 transition-all">
          <ShieldCheckIcon className="w-10 h-10 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-emerald-100 mb-2">Decentralized Validation</h3>
          <p className="text-emerald-100/70 mb-0 text-center text-sm">
            Community validators help report and confirm collection events, ensuring accountability and rapid response
            to public needs.
          </p>
        </div>
      </section>
    </div>
  );
}
