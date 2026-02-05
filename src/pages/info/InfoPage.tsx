import { HeroSection } from './components/HeroSection';
import { ManifestSection } from './components/ManifestSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { TeamSection } from './components/TeamSection';
import { CTASection } from './components/CTASection';
import { FloatingLanguageSelector } from '@/components/FloatingLanguageSelector';

export function InfoPage() {
  return (
    <div className="min-h-screen">
      <FloatingLanguageSelector />
      <HeroSection />
      <ManifestSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TeamSection />
      <CTASection />
    </div>
  );
}
