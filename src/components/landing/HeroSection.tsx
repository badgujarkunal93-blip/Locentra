import React from 'react';
import { Hero3DCanvas } from './Hero3DCanvas';
import { FlaskConical, ArrowRight, BookOpen } from 'lucide-react';

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
        
        {/* Status Label Banner */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-[11px] font-mono text-[#232124] font-bold">
            <FlaskConical className="w-3.5 h-3.5 text-[#171717]" />
            <span>LOCENTRA · INDOOR LOCALISATION RESEARCH</span>
          </div>
          <div className="text-[11px] font-mono text-[#52525B] px-3 py-1 rounded-full bg-white border border-[#EAEAEA]">
            <span>Prototype Status: Synthetic Measurement Data · Python Positioning Engine · No Physical Sensor Feed Connected</span>
          </div>
        </div>

        {/* Two-Column Grid: 3D Sandbox on the LEFT, Copy + CTAs on the RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Interactive 3D Sandbox */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#171717] font-bold">
                  Interactive Conceptual Scene (14m × 10m)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#71717A] hidden sm:inline">
                Illustrative 3D Simulation · Not Live Sensor Feed
              </span>
            </div>

            <Hero3DCanvas />
          </div>

          {/* Right Column: Clean Editorial Headline, Subheadline & Action Buttons */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
            
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#171717] tracking-tight leading-[1.18]">
              What Happens When Indoor Positioning Signals Fail?
            </h1>

            <p className="text-sm sm:text-base text-[#27272A] font-medium leading-relaxed">
              Locentra is an interactive simulation platform that tests how accurately a moving object can be located when wireless distance measurements are noisy, missing, or distorted by obstacles.
            </p>

            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Create a virtual room, simulate unreliable measurements, run positioning algorithms, and compare the estimated path against the known path. Explore how noise, missing anchors, and obstacles affect indoor localisation accuracy.
            </p>

            {/* The Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onLaunchEngine || (() => window.open('https://locentra.app', '_blank'))}
                className="btn-lime px-6 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] transition-transform"
              >
                <span>Try the Simulator</span>
                <ArrowRight className="w-4 h-4 font-bold" />
              </button>

              <button
                onClick={() => {
                  if (onExploreArchitecture) {
                    onExploreArchitecture();
                  } else {
                    const el = document.getElementById('how-it-works') || document.getElementById('architecture');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-5 py-3 rounded-xl bg-white border border-[#EAEAEA] hover:border-slate-400 text-xs sm:text-sm font-bold text-[#171717] transition-all cursor-pointer shadow-2xs flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#52525B]" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Metric Highlights Strip — Clearly labelled as synthetic benchmark conditions */}
            <div className="pt-3 grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#EAEAEA]" title="Synthetic testbed RMSE with Huber loss and Kalman filtering under 10% NLOS in 6-anchor room">
                <div className="text-lg font-bold text-[#171717]">~0.28m</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Synthetic RMSE (Huber+KF)</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAEAEA]" title="Huber loss replaces squared errors with linear penalty for large residuals">
                <div className="text-lg font-bold text-emerald-700">Adaptive</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Huber Outlier Loss</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAEAEA]" title="Constant-velocity kinematic model bridges timesteps with missing range observations">
                <div className="text-lg font-bold text-[#171717]">Kinematic</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Kalman State Filter</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAEAEA]" title="Controlled random seeds and reproducible geometric scenarios">
                <div className="text-lg font-bold text-[#171717]">Controlled</div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Synthetic Testbed</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
