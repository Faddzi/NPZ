import StudioHero from '@/components/studio/StudioHero';
import Intro from '@/components/home/Intro';
import FeaturedWork from '@/components/home/FeaturedWork';
import Clients from '@/components/home/Clients';
import ContactBlock from '@/components/home/ContactBlock';

export default function HomePage() {
  return (
    <>
      <StudioHero />
      <Intro />
      <FeaturedWork />
      <Clients />
      <ContactBlock />
    </>
  );
}
