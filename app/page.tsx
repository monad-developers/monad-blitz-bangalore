import { MarketingFeaturesSection } from '@/src/components/homepage/features';
import { MarketingFooter } from '@/src/components/homepage/footer';
import { MarketingHeader } from '@/src/components/homepage/header';
import { MarketingHero } from '@/src/components/homepage/hero';

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <MarketingHero />
      <MarketingFeaturesSection />
      <MarketingFooter />
    </>
  );
}
