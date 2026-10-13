import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Cpu, 
  Activity, 
  Grid3X3, 
  Target, 
  Building2, 
  Bot, 
  HeartPulse, 
  ShieldAlert, 
  Menu, 
  X, 
  Sparkles,
  Box,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { LocentraLogo } from '../ui/LocentraLogo';

interface LandingHeaderProps {
  onLaunchEngine?: () => void;
  onOpenDocs?: () => void;
  onOpenLegal?: () => void;
  onSelectUseCase?: (useCaseId: string) => void;
  onSelectTech?: (techId: string) => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onLaunchEngine,
  onOpenDocs,
  onOpenLegal,
  onSelectUseCase,
  onSelectTech,
}) => {
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const techDropdownRef = useRef<HTMLDivElement>(null);
  const solutionsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target as Node)) {
        setTechDropdownOpen(false);
      }
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(event.target as Node)) {
        setSolutionsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    setTechDropdownOpen(false);
    setSolutionsDropdownOpen(false);
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchClick = (e: React.MouseEvent) => {
    if (onLaunchEngine) {
      e.preventDefault();
      onLaunchEngine();
    } else {
      window.open('https://locentra.app', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.03)]' 
          : 'bg-white/80 backdrop-blur-sm border-b border-[#EAEAEA]/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left Side: Brand Logo (No AI live status pill) */}
        <div className="flex items-center gap-3">
          <a 
            href="#hero" 
            onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <LocentraLogo size={36} variant="badge" className="transition-transform duration-200 group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-lg font-bold tracking-tight text-[#171717]">LOCENTRA</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] font-bold tracking-wider">
                  RTLS
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#71717A] tracking-tight hidden sm:inline">
                Spatial Intelligence
              </span>
            </div>
          </a>
        </div>

        {/* Center Navigation Options (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          
          {/* Dropdown 1: Platform & Tech */}
          <div className="relative" ref={techDropdownRef}>
            <button
              onClick={() => {
                setTechDropdownOpen(!techDropdownOpen);
                setSolutionsDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors cursor-pointer text-xs font-semibold ${
                techDropdownOpen 
                  ? 'text-[#171717] bg-[#F4F5F7] border border-[#EAEAEA]' 
                  : 'text-[#52525B] hover:text-[#171717] hover:bg-slate-100/70'
              }`}
              aria-expanded={techDropdownOpen}
            >
              <span>Platform & Tech</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${techDropdownOpen ? 'rotate-180 text-[#171717]' : 'text-[#71717A]'}`} />
            </button>

            {techDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-white border border-[#EAEAEA] shadow-xl p-2 z-50 animate-in fade-in duration-150">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] px-3 py-1 font-bold">
                  Core Algorithmic Architecture
                </div>
                
                <button
                  onClick={() => {
                    scrollToSection('architecture');
                    onSelectTech?.('huber');
                    setTechDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-[#F8FDE8] text-[#232124] border border-[#D9F56F]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] group-hover:text-black">
                      Algorithmic Solver (Huber Loss)
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      NLOS multipath suppression & L1 robust penalty
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    scrollToSection('architecture');
                    onSelectTech?.('kalman');
                    setTechDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-[#F4F5F7] text-[#232124] border border-[#EAEAEA]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] group-hover:text-black">
                      Kinematic State Propagation
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      EKF velocity extrapolation across blackout gaps
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    scrollToSection('architecture');
                    onSelectTech?.('jacobian');
                    setTechDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    <Grid3X3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] group-hover:text-black">
                      Matrix Condition Monitoring
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      Real-time Jacobian DOP & geometric singularity check
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    scrollToSection('architecture');
                    onSelectTech?.('leakage');
                    setTechDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-[#E0E7FF] text-[#3730A3] border border-[#C7D2FE]">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] group-hover:text-black">
                      Trajectory Benchmarking
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      Zero-leakage CDF evaluation against ground truth
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Dropdown 2: Solutions & Use Cases */}
          <div className="relative" ref={solutionsDropdownRef}>
            <button
              onClick={() => {
                setSolutionsDropdownOpen(!solutionsDropdownOpen);
                setTechDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors cursor-pointer text-xs font-semibold ${
                solutionsDropdownOpen 
                  ? 'text-[#171717] bg-[#F4F5F7] border border-[#EAEAEA]' 
                  : 'text-[#52525B] hover:text-[#171717] hover:bg-slate-100/70'
              }`}
              aria-expanded={solutionsDropdownOpen}
            >
              <span>Solutions & Use Cases</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${solutionsDropdownOpen ? 'rotate-180 text-[#171717]' : 'text-[#71717A]'}`} />
            </button>

            {solutionsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-white border border-[#EAEAEA] shadow-xl p-2 z-50 animate-in fade-in duration-150">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] px-3 py-1 font-bold">
                  Target Deployments
                </div>

                <button
                  onClick={() => {
                    onSelectUseCase?.('warehouse');
                    setSolutionsDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-[#F8FDE8] text-[#232124] border border-[#D9F56F]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717]">
                      Industrial Warehouses
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      Pallet, forklift & rack tracking in metal clutter
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectUseCase?.('amr');
                    setSolutionsDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-[#F4F5F7] text-[#232124] border border-[#EAEAEA]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717]">
                      Autonomous Mobile Robots (AMR)
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      High-frequency 700Hz pose feedback for navigation
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectUseCase?.('healthcare');
                    setSolutionsDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-[#F4F5F7] text-[#232124] border border-[#EAEAEA]">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717]">
                      Healthcare & Hospitals
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      Critical telemetry for mobile clinical equipment
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectUseCase?.('geofencing');
                    setSolutionsDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717]">
                      Hazardous Geofencing
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      Zero-latency exclusionary safety zones in industrial sites
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Direct Nav Link: Capabilities */}
          <button
            onClick={() => scrollToSection('uniqueness')}
            className="px-3 py-2 text-[#52525B] hover:text-[#171717] hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#232124]" />
            <span>Capabilities</span>
          </button>

          {/* Direct Nav Link: Interactive Sandbox */}
          <button
            onClick={() => scrollToSection('hero')}
            className="px-3 py-2 text-[#52525B] hover:text-[#171717] hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
          >
            <Box className="w-3.5 h-3.5 text-[#232124]" />
            <span>3D Sandbox</span>
          </button>

          {/* Direct Nav Link: Privacy & Legal */}
          <button
            onClick={onOpenLegal}
            className="px-3 py-2 text-[#52525B] hover:text-[#171717] hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#232124]" />
            <span>Privacy & Legal</span>
          </button>

          {/* Direct Nav Link: Documentation */}
          <button
            onClick={onOpenDocs || (() => scrollToSection('architecture'))}
            className="px-3 py-2 text-[#52525B] hover:text-[#171717] hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Docs</span>
          </button>
        </nav>

        {/* Right Side: Clean Locentra Lime CTA Button */}
        <div className="flex items-center gap-3">
          <a
            href="https://locentra.app"
            onClick={handleLaunchClick}
            className="btn-lime px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Launch Locentra Engine</span>
            <span className="font-bold">→</span>
          </a>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white border border-[#EAEAEA] text-[#171717] hover:bg-slate-50"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EAEAEA] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-1 gap-1 text-sm font-medium text-[#171717]">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
            >
              <span>3D Engine Sandbox</span>
              <span className="text-[10px] font-mono bg-[#F8FDE8] text-[#232124] px-2 py-0.5 rounded border border-[#D9F56F]">3D</span>
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Platform & Architecture (Huber / Kalman / Jacobian)
            </button>
            <button
              onClick={() => scrollToSection('scrollytelling')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              3D Zone Inspection
            </button>
            <button
              onClick={() => scrollToSection('uniqueness')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Locentra Core Capabilities
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLegal?.();
              }}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Privacy, Terms & Cookies</span>
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Request Access & Book Demo
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleLaunchClick(e as any);
              }}
              className="btn-lime w-full py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Locentra Engine →</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
