import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { ManifestSection } from './components/ManifestSection';
import { FeaturesSection } from './components/FeaturesSection';
import { TeamSection } from './components/TeamSection';
import { CTASection } from './components/CTASection';

export function InfoPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <ManifestSection />
      <FeaturesSection />
      <TeamSection />
      <CTASection />
    </div>
  );
}
