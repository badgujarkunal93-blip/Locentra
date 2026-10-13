import React from 'react';
import { Hero3DCanvas } from './Hero3DCanvas';

interface HeroSectionProps {
  onLaunchEngine?: () => void;
  onExploreArchitecture?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchEngine,
  onExploreArchitecture,
}) => {
  return (
    <section id="hero" className="pt-24 pb-12 lg:pt-28 lg:pb-16 bg-[#F8F9FA] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Two-Column Grid: 3D Sandbox on the LEFT, Copy + CTAs on the RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Interactive 3D Sandbox (First thing visible upon opening) */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#171717] font-bold">
                  Interactive 3D Engine Sandbox
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#71717A] hidden sm:inline">
                Live Dual-Engine Simulation
              </span>
            </div>

            <Hero3DCanvas />
          </div>

          {/* Right Column: Clean Editorial Headline, Subheadline & Action Buttons */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-[11px] font-mono text-[#232124] font-bold">
              <span>●</span>
              <span>ENTERPRISE-GRADE RTLS ENGINE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#171717] tracking-tight leading-[1.15]">
              Sub-Meter Indoor Intelligence Where GPS Dies.
            </h1>

            <p className="text-sm sm:text-base text-[#52525B] leading-relaxed">
              An algorithmic positioning engine built for <strong className="text-[#171717] font-semibold">NLOS resilience</strong>, <strong className="text-[#171717] font-semibold">real-time outlier suppression</strong>, and <strong className="text-[#171717] font-semibold">zero-leakage trajectory tracking</strong> in high-interference industrial facilities.
            </p>

            {/* The Two Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onLaunchEngine || (() => window.open('https://locentra.app', '_blank'))}
                className="btn-lime px-6 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Launch Locentra Engine</span>
                <span className="font-bold">→</span>
              </button>

              <button
                onClick={onExploreArchitecture || (() => {
                  document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
                })}
                className="px-5 py-3 rounded-xl bg-white border border-[#EAEAEA] hover:border-slate-400 text-xs sm:text-sm font-bold text-[#171717] transition-all cursor-pointer shadow-2xs"
              >
                <span>Explore Architecture</span>
              </button>
            </div>

            {/* Metric Highlights Strip */}
            <div className="pt-4 grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#EAEAEA]">
                <div className="text-xl font-bold text-[#171717]">&lt; 0.28m</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Multipath RMSE</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAEAEA]">
                <div className="text-xl font-bold text-emerald-700">100%</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">NLOS Outlier Rejection</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAEAEA]">
                <div className="text-xl font-bold text-[#171717]">714 Hz</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">1.4ms Real-Time Rate</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAEAEA]">
                <div className="text-xl font-bold text-[#171717]">0-Leakage</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Spatial Validation</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
