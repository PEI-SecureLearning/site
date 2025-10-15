import { SiGoogledrive } from "react-icons/si";

import { JourneyTimeline } from "./JourneyTimeline";
import { docs } from "@/lib/docs";
import Reveal from "@/components/Reveal";

const orderedDocs = docs.slice().sort((a, b) => a.order - b.order);

export const metadata = {
  title: "SecureLearning Journey",
  description:
    "Chronological timeline of SecureLearning documentation and milestones.",
};

export default function JourneyPage() {
  return (
    <div className="flex flex-col gap-24">
      <section className="radial-hero flex flex-col items-center justify-center text-center">
        <Reveal>
          <div className="space-y-8">
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl">
              Journey & Documentation
            </h1>
            <a
              href="https://drive.google.com/drive/folders/16fEmhrUOej-AyEkDoonmscDeMmI5PvvR?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <span className="inline-flex items-center gap-2">
                <SiGoogledrive className="text-lg" aria-hidden="true" />
                SecureLearning Drive ↗
              </span>
            </a>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <JourneyTimeline items={orderedDocs} />
        </Reveal>
      </section>
    </div>
  );
}

