"use client";

import Image from "next/image";
import { ArrowRightIcon, CpuChipIcon, ShieldCheckIcon, UsersIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Resources", href: "#resources" },
  { label: "Plans & Pricing", href: "#pricing" },
  { label: "About us", href: "#about" },
];

// Custom Connect Button Component
const CustomConnectButton = ({ size = "medium" }: { size?: "small" | "medium" | "large" }) => {
  const sizeClasses = {
    small: "px-6 py-2 text-sm",
    medium: "px-6 xl:px-7 2xl:px-10 py-2 2xl:py-3 text-sm xl:text-base 2xl:text-lg",
    large: "px-6 sm:px-8 lg:px-10 2xl:px-14 py-2.5 sm:py-3 lg:py-4 2xl:py-6 text-sm sm:text-base lg:text-lg 2xl:text-xl"
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={`${sizeClasses[size]} rounded-md bg-emerald-600 text-white font-medium tracking-wide uppercase shadow-lg hover:bg-emerald-500 hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out ${size === 'large' ? 'flex items-center gap-2 2xl:gap-3 group' : ''}`}
                  >
                    Connect Wallet
                    {size === 'large' && (
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6 text-emerald-100 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                    )}
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={`${sizeClasses[size]} rounded-md bg-red-600 text-white font-medium tracking-wide uppercase shadow-lg hover:bg-red-500 hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out`}
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={`${sizeClasses[size]} rounded-md bg-emerald-600 text-white font-medium tracking-wide uppercase shadow-lg hover:bg-emerald-500 hover:scale-105 hover:shadow-xl transition-all duration-300 ease-out`}
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Layered green gradients for web3 effect */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-20%] top-[-10%] w-[60vw] h-[60vw] bg-green-700/20 rounded-full blur-[120px]" />
        <div className="absolute right-[-15%] top-[30%] w-[50vw] h-[40vw] bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute left-[30%] bottom-[-20%] w-[40vw] h-[30vw] bg-green-400/10 rounded-full blur-[90px]" />
      </div>

      {/* Navigation Bar */}
      <nav className="w-full max-w-[1920px] mx-auto flex items-center justify-between py-4 lg:py-6 2xl:py-8 px-4 sm:px-6 lg:px-8 2xl:px-16 mt-2 sm:mt-4 2xl:mt-6 bg-white/5 backdrop-blur-md rounded-xl lg:rounded-2xl border border-green-900/30 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 2xl:gap-4">
          <span className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-emerald-300 tracking-tight">GreenGrid</span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-6 xl:gap-8 2xl:gap-12">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-emerald-100/80 hover:text-emerald-200 text-base 2xl:text-lg font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Connect Button */}
        <div className="hidden lg:block">
          <CustomConnectButton size="medium" />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-emerald-300 hover:text-emerald-200 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-black/90 backdrop-blur-md rounded-xl border border-green-900/30 shadow-lg lg:hidden z-50">
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-emerald-100/80 hover:text-emerald-200 text-base font-medium transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4">
                <CustomConnectButton size="small" />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative w-full max-w-[1920px] mx-auto flex flex-col items-center justify-center text-center mt-8 sm:mt-16 lg:mt-20 xl:mt-28 2xl:mt-40 mb-12 sm:mb-16 lg:mb-20 xl:mb-24 2xl:mb-32 px-4 sm:px-6 lg:px-8 2xl:px-16">
        {/* Subtle background for better readability */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-72 h-32 sm:w-96 sm:h-40 lg:w-[36rem] lg:h-60 xl:w-[42rem] xl:h-72 2xl:w-[56rem] 2xl:h-96 rounded-full bg-emerald-500/10 blur-3xl opacity-60" />
        </div>
        
        <h1 className="relative z-10 font-extrabold leading-tight mb-4 sm:mb-6 2xl:mb-8">
          {/* Monad Testnet Indicator */}
          <div className="flex items-center justify-center mb-3 sm:mb-4 2xl:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Network Status */}
              <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-emerald-300 font-medium tracking-wide uppercase">
                    Monad Testnet
                  </span>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px h-4 sm:h-5 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

              {/* Finality Time */}
              <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-xs sm:text-sm text-blue-300 font-medium tracking-wide">
                    ~1s Finality
                  </span>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px h-4 sm:h-5 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

              {/* Block Time */}
              <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-xs sm:text-sm text-purple-300 font-medium tracking-wide">
                    ~250ms Blocks
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-9xl mb-2 2xl:mb-4 text-emerald-200 font-black">
            Cleaning The World
          </span>
          <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-6xl text-emerald-100/90 font-bold tracking-wide">
            One Hash at a Time
          </span>
        </h1>
        
        <p className="relative z-10 text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-emerald-100/90 mb-6 sm:mb-8 2xl:mb-12 max-w-sm sm:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-5xl mx-auto leading-relaxed">
          Build a cleaner world with GreenGrid&apos;s decentralized, transparent, and community-driven garbage
          collection platform. Track, verify, and incentivize positive action—powered by Monad blockchain.
        </p>
        
        <div className="relative z-10">
          <CustomConnectButton size="large" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 mb-16 sm:mb-20 lg:mb-24 2xl:mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 2xl:gap-16">
          {/* Feature 1 */}
          <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl 2xl:rounded-3xl p-6 sm:p-8 lg:p-10 2xl:p-14 flex flex-col items-center shadow-lg backdrop-blur-md hover:border-emerald-500 hover:bg-white/10 transition-all duration-300 group">
            <CpuChipIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16 text-emerald-400 mb-4 sm:mb-6 2xl:mb-8 group-hover:text-emerald-300 transition-colors" />
            <h3 className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold text-emerald-100 mb-3 sm:mb-4 2xl:mb-6 text-center">
              Proof-Based Collection
            </h3>
            <p className="text-emerald-100/70 text-center text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed">
              Every garbage collection event is logged with cryptographic proof and image validation, ensuring
              transparency and trust for all participants.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl 2xl:rounded-3xl p-6 sm:p-8 lg:p-10 2xl:p-14 flex flex-col items-center shadow-lg backdrop-blur-md hover:border-emerald-500 hover:bg-white/10 transition-all duration-300 group">
            <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16 text-emerald-400 mb-4 sm:mb-6 2xl:mb-8 group-hover:text-emerald-300 transition-colors" />
            <h3 className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold text-emerald-100 mb-3 sm:mb-4 2xl:mb-6 text-center">
              Community Incentives
            </h3>
            <p className="text-emerald-100/70 text-center text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed">
              Households, cleaners, and validators earn points and reputation for their contributions, fostering a cleaner
              and more engaged neighborhood.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 border border-green-900/30 rounded-xl lg:rounded-2xl 2xl:rounded-3xl p-6 sm:p-8 lg:p-10 2xl:p-14 flex flex-col items-center shadow-lg backdrop-blur-md hover:border-emerald-500 hover:bg-white/10 transition-all duration-300 group md:col-span-2 xl:col-span-1">
            <ShieldCheckIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16 text-emerald-400 mb-4 sm:mb-6 2xl:mb-8 group-hover:text-emerald-300 transition-colors" />
            <h3 className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold text-emerald-100 mb-3 sm:mb-4 2xl:mb-6 text-center">
              Decentralized Validation
            </h3>
            <p className="text-emerald-100/70 text-center text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed">
              Community validators help report and confirm collection events, ensuring accountability and rapid response
              to public needs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
