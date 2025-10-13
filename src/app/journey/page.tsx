import { JourneyTimeline } from "./JourneyTimeline";
import { docs } from "@/lib/docs";
import { SiGoogledrive } from "react-icons/si";

const orderedDocs = docs.slice().sort((a, b) => a.order - b.order);

export const metadata = {
  title: "SecureLearning Journey",
  description:
    "Chronological timeline of SecureLearning documentation and milestones.",
};

export default function JourneyPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Journey & Documentation
        </h1>
        <div className="flex items-center justify-center">
          <a
            href="https://drive.google.com/drive/folders/16fEmhrUOej-AyEkDoonmscDeMmI5PvvR?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-100"
          >
            <SiGoogledrive className="text-lg" aria-hidden="true" />
            SecureLearning Drive ↗
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-3xl">
        <JourneyTimeline items={orderedDocs} />
      </section>

    </div>
  );
}

