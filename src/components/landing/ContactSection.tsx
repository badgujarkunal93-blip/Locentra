import React, { useState } from 'react';
import { 
  Mail, 
  Code2, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    deploymentSize: 'Academic & Research PoC',
    protocol: 'Synthetic Simulation Pipeline',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Compose genuine mailto link with form details
    const subject = encodeURIComponent(`Locentra Research Inquiry - ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Topic/Scale: ${formData.deploymentSize}\n` +
      `Channel/Protocol: ${formData.protocol}\n\n` +
      `Notes/Question:\n${formData.message}\n`
    );
    const mailtoUrl = `mailto:contact@locentra.ai?subject=${subject}&body=${body}`;

    // Small delay to provide interactive feedback before opening mailto
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      window.location.href = mailtoUrl;
    }, 400);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#F8F9FA] relative overflow-hidden border-t border-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-xs font-mono text-[#232124] font-bold mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>RESEARCH INQUIRIES &amp; COLLABORATION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight">
            Connect with the{' '}
            <span className="text-[#232124] underline decoration-[#D9F56F] underline-offset-4 decoration-4">
              Locentra Research Project
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#52525B] leading-relaxed">
            Have questions about the positioning algorithms, numerical simulation engine, or reproducing benchmark results? Reach out directly or open an issue on GitHub.
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
                    Research & Development
                  </span>
                  <h3 className="text-2xl font-bold text-[#171717] mt-1">
                    Academic &amp; Engineering Inquiries
                  </h3>
                  <p className="text-sm text-[#52525B] mt-2 leading-relaxed">
                    Locentra is an open research platform. We welcome inquiries regarding algorithm benchmarks, sensor model extensions, and collaborative indoor positioning studies.
                  </p>
                </div>

                <div className="space-y-5 text-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-[#71717A]">Direct Email</div>
                      <a href="mailto:contact@locentra.ai" className="font-mono font-bold text-[#171717] hover:text-[#232124] transition-colors">
                        contact@locentra.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-[#71717A]">Source Code &amp; Issues</div>
                      <a 
                        href="https://github.com/badgujarkunal93-blip/Locentra" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-[#171717] hover:text-[#232124] transition-colors inline-flex items-center gap-1"
                      >
                        <span>github.com/badgujarkunal93-blip/Locentra</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="text-xs text-[#52525B] mt-0.5">Submit bug reports, feature requests, or algorithm contributions</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-[#71717A]">Project Status</div>
                      <div className="font-medium text-[#171717]">Research Prototype · Python Backend Online</div>
                      <div className="text-xs text-[#52525B]">Synthetic data testbed (no physical hardware feed connected)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Resources Box */}
              <div className="mt-8 pt-6 border-t border-[#EAEAEA]">
                <div className="p-4 rounded-xl bg-white border border-[#EAEAEA] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#232124]" />
                    <div>
                      <div className="text-xs font-bold text-[#171717]">View Technical Documentation</div>
                      <div className="text-[11px] text-[#71717A]">Inspect API schemas &amp; algorithm derivations</div>
                    </div>
                  </div>
                  <a
                    href="https://github.com/badgujarkunal93-blip/Locentra/blob/main/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#F8FDE8] text-[#232124] border border-[#D9F56F] text-xs font-mono font-bold hover:bg-[#D9F56F] transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Read Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
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
                  <h3 className="text-2xl font-bold text-[#171717]">Email Inquiry Composed</h3>
                  <p className="text-sm text-[#52525B] max-w-md">
                    Your email client should open with your inquiry details addressed to{' '}
                    <span className="font-mono text-[#232124] font-bold">contact@locentra.ai</span>.
                    You can also track updates and open research discussions directly on GitHub.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={`mailto:contact@locentra.ai?subject=Locentra%20Inquiry%20from%20${encodeURIComponent(formData.name)}`}
                      className="px-4 py-2 rounded-xl bg-[#232124] text-white text-xs font-mono hover:bg-black transition-colors"
                    >
                      Open Email Again
                    </a>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 rounded-xl bg-[#F4F5F7] text-[#171717] text-xs font-mono hover:bg-[#EAEAEA] transition-colors border border-[#EAEAEA]"
                    >
                      Reset Form
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[#171717]">Send a Research Inquiry</h3>
                    <p className="text-xs text-[#71717A]">
                      Submit your research question, algorithm evaluation inquiry, or collaboration proposal.
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
                        Email Address *
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
                        Inquiry Topic / Area
                      </label>
                      <select
                        value={formData.deploymentSize}
                        onChange={(e) => setFormData({ ...formData, deploymentSize: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-sm text-[#171717] focus:outline-none focus:border-[#D9F56F] transition-all font-mono"
                      >
                        <option value="Academic & Research PoC">Academic &amp; Research PoC</option>
                        <option value="Positioning Solvers (NLS/Huber)">Positioning Solvers (NLS / Huber)</option>
                        <option value="Kinematic Kalman Tracking">Kinematic Kalman Tracking</option>
                        <option value="Synthetic Data Generator">Synthetic Data &amp; Noise Models</option>
                        <option value="Hardware Integration Roadmap">Physical Hardware Integration Roadmap</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#52525B] mb-1.5">
                        Relevant Technology / Interest
                      </label>
                      <select
                        value={formData.protocol}
                        onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-sm text-[#171717] focus:outline-none focus:border-[#D9F56F] transition-all font-mono"
                      >
                        <option value="Synthetic Simulation Pipeline">Synthetic Simulation Pipeline</option>
                        <option value="Ultra-Wideband (UWB)">Ultra-Wideband (UWB Simulation)</option>
                        <option value="BLE RSSI & AoA">Bluetooth Low Energy (BLE)</option>
                        <option value="Numerical Optimization (SciPy)">Numerical Optimization (SciPy)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#52525B] mb-1.5">
                      Inquiry Details / Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="e.g. Inquiring about evaluating the Huber estimator on collinear anchor layouts..."
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
                    <span className="text-slate-600">
                      Open Source Research Project · Synthetic Simulation Platform
                    </span>
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
