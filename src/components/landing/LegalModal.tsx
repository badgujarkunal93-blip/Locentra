import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Cookie } from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(defaultTab);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [telemetryCookies, setTelemetryCookies] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAEAEA] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F8FDE8] border border-[#D9F56F] text-[#171717]">
              {activeTab === 'privacy' && <ShieldCheck className="w-5 h-5 text-[#232124]" />}
              {activeTab === 'terms' && <FileText className="w-5 h-5 text-[#232124]" />}
              {activeTab === 'cookies' && <Cookie className="w-5 h-5 text-[#232124]" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171717] font-mono">
                LOCENTRA LEGAL & COMPLIANCE
              </h3>
              <p className="text-xs text-[#52525B]">
                Enterprise Governance, SOC-2 Controls & Data Integrity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white border border-[#EAEAEA] text-[#71717A] hover:text-[#171717] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#EAEAEA] bg-white font-mono text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#232124] text-[#171717]'
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#232124] text-[#171717]'
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-3.5 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'cookies'
                ? 'border-[#232124] text-[#171717]'
                : 'border-transparent text-[#71717A] hover:text-[#171717]'
            }`}
          >
            Cookie Preferences
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#3F3F46] leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8FDE8] border border-[#D9F56F] text-[#232124] font-medium">
                Locentra enforces a zero-knowledge architectural stance: raw positioning telemetry is processed edge-first with zero permanent storage of biometric or personal identifiers.
              </div>

              <div>
                <h4 className="font-bold text-[#171717] text-sm mb-1">1. Scope & Telemetry Collection</h4>
                <p>
                  Our positioning engine processes raw Time-of-Flight (ToF), Ultra-Wideband (UWB), and RSSI range tuples strictly for coordinate trilateration and state estimation. Customer facility coordinate models remain exclusively within dedicated tenant workspaces.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#171717] text-sm mb-1">2. Encryption & Transport Security</h4>
                <p>
                  All WebSocket and REST streams are protected via TLS 1.3 with AES-256-GCM encryption in transit. Cryptographic token authorization regulates tag telemetry streams.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#171717] text-sm mb-1">3. Compliance & Audits</h4>
                <p>
                  Locentra systems undergo annual SOC-2 Type II audits and comply with GDPR cross-border processing standards.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[#171717] text-sm mb-1">1. Engine Licensing & Use Rights</h4>
                <p>
                  Locentra Core SDK libraries are licensed under open MIT licensing. The cloud-hosted simulation endpoints, high-frequency solver APIs, and enterprise dashboard suites are provided under enterprise subscription agreements.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#171717] text-sm mb-1">2. Service Level Agreement (SLA)</h4>
                <p>
                  Enterprise production deployments are backed by a 99.99% uptime guarantee for cloud calculation services, with a maximum 1-hour critical response SLA for production-halting incidents.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#171717] text-sm mb-1">3. Operational Integrity & Limits</h4>
                <p>
                  Users must not intentionally flood or reverse-engineer proprietary Huber residual loss weights outside agreed API volume quotas.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <p>
                We use strictly necessary cookies to ensure the positioning dashboard operates smoothly and authenticate telemetry requests. You can adjust your preferences below.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-[#EAEAEA] bg-[#F8F9FA] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#171717]">Strictly Necessary Cookies</div>
                    <div className="text-[11px] text-[#71717A]">Session tokens, CSRF protection, and engine routing.</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Always Active
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#EAEAEA] bg-white flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#171717]">Performance & Diagnostic Telemetry</div>
                    <div className="text-[11px] text-[#71717A]">Calculates 3D frame rendering rates and solver latency.</div>
                  </div>
                  <button
                    onClick={() => setTelemetryCookies(!telemetryCookies)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      telemetryCookies ? 'bg-[#232124]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        telemetryCookies ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-[#EAEAEA] bg-white flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#171717]">Product Analytics</div>
                    <div className="text-[11px] text-[#71717A]">Helps our engineering team understand navigation patterns.</div>
                  </div>
                  <button
                    onClick={() => setAnalyticsCookies(!analyticsCookies)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      analyticsCookies ? 'bg-[#232124]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        analyticsCookies ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAEAEA] bg-[#F8F9FA] flex items-center justify-between">
          <span className="text-[11px] text-[#71717A] font-mono">
            Locentra Technologies Inc. • Compliance v2.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#232124] text-white font-bold font-mono text-xs hover:bg-[#171717] transition-all cursor-pointer"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};
