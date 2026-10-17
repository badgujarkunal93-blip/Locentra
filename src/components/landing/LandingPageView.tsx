import React, { useState } from 'react';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { ArchitectureSection } from './ArchitectureSection';
import { ScrollytellingSection } from './ScrollytellingSection';
import { UniquenessSection } from './UniquenessSection';
import { ContactSection } from './ContactSection';
import { LandingFooter } from './LandingFooter';
import { DocumentationModal } from './DocumentationModal';
import { UseCasesModal } from './UseCasesModal';
import { LegalModal } from './LegalModal';
import type { LegalTab } from './LegalModal';

interface LandingPageViewProps {
  onLaunchEngine?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onLaunchEngine }) => {
  const [docsOpen, setDocsOpen] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [useCaseModalOpen, setUseCaseModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<'huber' | 'kalman' | 'jacobian' | 'leakage'>('huber');
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');

  const handleOpenUseCase = (useCaseId: string) => {
    setSelectedUseCase(useCaseId);
    setUseCaseModalOpen(true);
  };

  const handleSelectTech = (techId: string) => {
    if (['huber', 'kalman', 'jacobian', 'leakage'].includes(techId)) {
      setSelectedTech(techId as 'huber' | 'kalman' | 'jacobian' | 'leakage');
    }
  };

  const handleOpenLegal = (tab?: LegalTab) => {
    setLegalTab(tab || 'privacy');
    setLegalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#171717] selection:bg-[#D9F56F] selection:text-[#171717] overflow-x-hidden font-sans">
      
      {/* Top Fixed Header */}
      <LandingHeader 
        onLaunchEngine={onLaunchEngine}
        onOpenDocs={() => setDocsOpen(true)}
        onOpenLegal={() => handleOpenLegal('privacy')}
        onSelectUseCase={handleOpenUseCase}
        onSelectTech={handleSelectTech}
      />

      <main>
        {/* Section 1: Hero – Interactive 3D Sandbox (Left) + Copy (Right) */}
        <HeroSection 
          onLaunchEngine={onLaunchEngine}
          onExploreArchitecture={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Section 2: How It Works & Problem Explanation */}
        <HowItWorksSection onLaunchSimulator={onLaunchEngine} />

        {/* Section 3: Tabbed Technical Architecture Deep Dive */}
        <ArchitectureSection initialTab={selectedTech} />

        {/* Section 3: 3D Scroll-Triggered Zone Showcase */}
        <ScrollytellingSection />

        {/* Section 4: Locentra Algorithmic Superpowers (replaces comparison table) */}
        <UniquenessSection onLaunchEngine={onLaunchEngine} />

        {/* Section 5: Contact & Request Access */}
        <ContactSection />
      </main>

      {/* Footer */}
      <LandingFooter 
        onOpenDocs={() => setDocsOpen(true)}
        onLaunchEngine={onLaunchEngine}
        onOpenLegal={handleOpenLegal}
      />

      {/* Documentation Modal */}
      <DocumentationModal 
        isOpen={docsOpen}
        onClose={() => setDocsOpen(false)}
      />

      {/* Use Cases Deep Dive Modal */}
      <UseCasesModal 
        isOpen={useCaseModalOpen}
        onClose={() => setUseCaseModalOpen(false)}
        selectedUseCase={selectedUseCase}
        onLaunchEngine={onLaunchEngine}
      />

      {/* Privacy / Terms / Cookies Modal */}
      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        defaultTab={legalTab}
      />

    </div>
  );
};

export default LandingPageView;
