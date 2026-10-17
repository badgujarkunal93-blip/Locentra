import React from 'react';
import { LocentraLogo } from '../ui/LocentraLogo';
import type { LegalTab } from './LegalModal';

interface LandingFooterProps {
  onOpenDocs?: () => void;
  onLaunchEngine?: () => void;
  onOpenLegal?: (tab?: LegalTab) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenDocs,
  onLaunchEngine,
  onOpenLegal,
}) => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#EAEAEA] text-[#71717A] text-xs font-mono relative overflow-hidden">
      {/* Subtle top lime line accent */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D9F56F] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* Top Section: Brand Statement & Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-[#EAEAEA]">
          
          {/* Brand Column (2 Spans) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <LocentraLogo size={36} variant="badge" />
              <div>
                <span className="font-mono text-base font-bold tracking-wider text-[#171717]">LOCENTRA</span>
                <span className="block text-[10px] text-[#71717A]">
                  Spatial Intelligence & Precision RTLS
                </span>
              </div>
            </div>

            <p className="text-[#52525B] text-xs leading-relaxed max-w-sm">
              Algorithmic positioning research platform evaluating NLOS resilience, robust Huber M-estimation, and kinematic trajectory tracking in GPS-denied environments.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/badgujarkunal93-blip/Locentra"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#F4F5F7] border border-[#EAEAEA] text-[#52525B] hover:text-[#171717] hover:border-[#D9F56F] transition-colors"
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#F4F5F7] border border-[#EAEAEA] text-[#52525B] hover:text-[#171717] hover:border-[#D9F56F] transition-colors"
                aria-label="X / Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#F4F5F7] border border-[#EAEAEA] text-[#52525B] hover:text-[#171717] hover:border-[#D9F56F] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Product
            </div>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={onLaunchEngine}
                  className="hover:text-[#171717] transition-colors text-left cursor-pointer"
                >
                  Locentra Simulator
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenDocs} 
                  className="hover:text-[#171717] transition-colors text-left cursor-pointer"
                >
                  Python Numerical Engine
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenDocs} 
                  className="hover:text-[#171717] transition-colors text-left cursor-pointer"
                >
                  FastAPI REST Engine
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#171717] transition-colors">
                  Simulation Workflow
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-[#171717] transition-colors">
                  Solver Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Solutions
            </div>
            <ul className="space-y-2">
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Industrial Warehouses</a></li>
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Autonomous Robots (AMR)</a></li>
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Healthcare &amp; Hospitals</a></li>
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Hazardous Geofencing</a></li>
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Construction Safety</a></li>
            </ul>
          </div>

          {/* Column 3: Research */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Research &amp; Papers
            </div>
            <ul className="space-y-2">
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Zero-Leakage Benchmark</a></li>
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Huber Loss vs. OLS Proof</a></li>
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Kalman State Propagation</a></li>
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">Jacobian Condition κ Proof</a></li>
              <li><a href="#architecture" className="hover:text-[#171717] transition-colors">UWB Multipath Modeling</a></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Company &amp; Trust
            </div>
            <ul className="space-y-2">
              <li><a href="#contact" className="hover:text-[#171717] transition-colors">About Locentra</a></li>
              <li><a href="#contact" className="hover:text-[#171717] transition-colors">Open Source &amp; Code</a></li>
              <li><a href="#contact" className="hover:text-[#171717] transition-colors">Research Transparency</a></li>
              <li><a href="#contact" className="hover:text-[#171717] transition-colors">Project Status</a></li>
              <li>
                <a href="mailto:contact@locentra.ai" className="hover:text-[#171717] transition-colors">
                  Contact Research Team
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Legal & System Status */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71717A]">
          <div className="text-[#52525B]">
            © 2026 Locentra Technologies Inc. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#71717A]">
            <a 
              href="https://github.com/badgujarkunal93-blip/Locentra/blob/main/LICENSE" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-[#171717] transition-colors"
            >
              MIT License (Core SDK)
            </a>
            <span className="text-[#EAEAEA]">•</span>
            <button 
              onClick={() => onOpenLegal?.('terms')}
              className="hover:text-[#171717] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-[#EAEAEA]">•</span>
            <button 
              onClick={() => onOpenLegal?.('privacy')}
              className="hover:text-[#171717] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-[#EAEAEA]">•</span>
            <button 
              onClick={() => onOpenLegal?.('cookies')}
              className="hover:text-[#171717] transition-colors cursor-pointer"
            >
              Cookie Preferences
            </button>
            <span className="text-[#EAEAEA]">•</span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Status: 100% Operational</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
