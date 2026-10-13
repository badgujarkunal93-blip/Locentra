import React, { useState } from 'react';
import { 
  Mail, 
  Clock, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    deploymentSize: '50-250 AMRs / Assets',
    protocol: 'Ultra-Wideband (UWB)',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D9F56F', '#232124', '#10B981', '#F59E0B'],
      });
    }, 800);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#F8F9FA] relative overflow-hidden border-t border-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-xs font-mono text-[#232124] font-bold mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>ENTERPRISE ACCESS &amp; TRIAL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight">
            Deploy Locentra on Your{' '}
            <span className="text-[#232124] underline decoration-[#D9F56F] underline-offset-4 decoration-4">
              Existing Infrastructure
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#52525B] leading-relaxed">
            Schedule a technical deep dive with our algorithms engineering team or request immediate sandbox API credentials.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
            
            {/* Left Column: Info */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-[#F8F9FA]">
              <div className="space-y-8">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-bold">
                    Direct Engineering Access
                  </span>
                  <h3 className="text-2xl font-bold text-[#171717] mt-1">
                    Enterprise Technical Support
                  </h3>
                  <p className="text-sm text-[#52525B] mt-2 leading-relaxed">
                    Work directly with our Principal Localization Engineers to benchmark multipath performance in your specific facility layout.
                  </p>
                </div>

                <div className="space-y-5 text-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-[#71717A]">Direct Inquiries</div>
                      <a href="mailto:contact@locentra.ai" className="font-mono font-bold text-[#171717] hover:text-[#232124] transition-colors">
                        contact@locentra.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-[#71717A]">Enterprise SLA Details</div>
                      <div className="font-medium text-[#171717]">99.99% Availability • 1-Hour SLA</div>
                      <div className="text-xs text-[#52525B]">Dedicated 24/7 incident response hotline</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-[#71717A]">Global Engineering Centers</div>
                      <div className="font-medium text-[#171717]">Silicon Valley • Munich • Tokyo</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Booking Box */}
              <div className="mt-8 pt-6 border-t border-[#EAEAEA]">
                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#232124]" />
                    <div>
                      <div className="text-xs font-bold text-[#171717]">Book 30-min Architecture Call</div>
                      <div className="text-[11px] text-[#71717A]">Directly with our R&D lead</div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open('mailto:contact@locentra.ai?subject=Locentra%20Technical%20Demo%20Request', '_blank')}
                    className="px-3 py-1.5 rounded-lg bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] text-xs font-mono font-bold hover:bg-[#D9F56F] transition-all cursor-pointer"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#171717]">Access Request Received</h3>
                  <p className="text-sm text-[#52525B] max-w-md">
                    Thank you! An engineer has dispatched sandbox credentials for{' '}
                    <span className="font-mono text-[#232124] font-bold">{formData.email}</span>{' '}
                    along with the C++ and Python SDK onboarding bundle.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-[#F4F5F7] text-[#171717] text-xs font-mono hover:bg-[#EAEAEA] transition-colors border border-[#EAEAEA]"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[#171717]">Request Evaluation Access</h3>
                    <p className="text-xs text-[#71717A]">
                      Fill out the form below to receive API keys and test datasets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#52525B] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. Eleanor Vance"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-sm text-[#171717] placeholder-[#A0A0A8] focus:outline-none focus:border-[#D9F56F] focus:ring-1 focus:ring-[#D9F56F] transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#52525B] mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.vance@robotics-fleet.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-sm text-[#171717] placeholder-[#A0A0A8] focus:outline-none focus:border-[#D9F56F] focus:ring-1 focus:ring-[#D9F56F] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#52525B] mb-1.5">
                        Use Case / Hardware Scale
                      </label>
                      <select
                        value={formData.deploymentSize}
                        onChange={(e) => setFormData({ ...formData, deploymentSize: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-sm text-[#171717] focus:outline-none focus:border-[#D9F56F] transition-all font-mono"
                      >
                        <option value="10-50 AMRs">10 - 50 AMRs / Robots</option>
                        <option value="50-250 AMRs / Assets">50 - 250 Warehouse Assets</option>
                        <option value="500+ Large Facility">500+ Large Facility Fleet</option>
                        <option value="Research & PoC">Academic &amp; Research PoC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#52525B] mb-1.5">
                        Active Radio Protocol
                      </label>
                      <select
                        value={formData.protocol}
                        onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-sm text-[#171717] focus:outline-none focus:border-[#D9F56F] transition-all font-mono"
                      >
                        <option value="Ultra-Wideband (UWB)">Ultra-Wideband (UWB IEEE 802.15.4z)</option>
                        <option value="Time-of-Flight (ToF)">Time-of-Flight (ToF / Chirp SS)</option>
                        <option value="BLE RSSI & AoA">Bluetooth Low Energy RSSI / AoA</option>
                        <option value="Custom Simulation">Synthetic Simulation Pipeline</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#52525B] mb-1.5">
                      Requirements / Facility Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="e.g. 120,000 sq ft logistics facility with high metal rack multipath reflections..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-sm text-[#171717] placeholder-[#A0A0A8] focus:outline-none focus:border-[#D9F56F] focus:ring-1 focus:ring-[#D9F56F] transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer btn-lime hover:scale-[1.01] disabled:opacity-70"
                  >
                    {submitting ? (
                      <span className="animate-pulse">Generating Evaluation Keys...</span>
                    ) : (
                      <>
                        <span>Request Access &amp; Sandbox Keys</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-[#71717A] pt-2">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      SOC-2 Type II Certified
                    </span>
                    <span>•</span>
                    <span>Zero Credit Card Required</span>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
