import Hero from "@/components/Hero";
import LogoMarquee from "@/components/LogoMarquee";
import ProblemStatement from "@/components/ProblemStatement";
import FeatureShowcase from "@/components/FeatureShowcase";
import HowItWorks from "@/components/HowItWorks";
import MetricsStrip from "@/components/MetricsStrip";
import TrustSection from "@/components/TrustSection";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ① Hero */}
      <Hero />

      {/* ② Social Proof Marquee */}
      <LogoMarquee />

      {/* ③ Problem Statement */}
      <ProblemStatement />

      {/* ④ Feature Showcase */}
      <FeatureShowcase />

      {/* ⑤ How It Works */}
      <HowItWorks />

      {/* ⑥ Metrics Strip */}
      <MetricsStrip />

      {/* ⑦ Built With Trust */}
      <TrustSection />

      {/* ⑧ Final CTA */}
      <FinalCTA />
    </div>
  );
}
