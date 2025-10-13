import Image from "next/image";
import Link from "next/link";

const benefits = [
  "Run scheduled phishing simulations safely",
  "Deliver just-in-time training (video + quiz)",
  "Measure susceptibility and remediation rates",
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm md:px-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl md:text-5xl">
            SecureLearning — phishing simulations that teach, not punish.
          </h1>
          <p className="text-lg text-slate-600 md:text-xl">
            Run safe simulations, deliver just-in-time training, and prove that
            awareness improves.
          </p>
          <Link
            href="/journey"
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Explore the journey
          </Link>
          <ul className="grid gap-3 pt-4 text-left text-base text-slate-600 md:grid-cols-3 md:text-center">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="rounded-xl bg-slate-50 px-5 py-4 text-left shadow-inner md:text-center"
              >
                <span className="text-sky-600">• </span>
                {benefit}
              </li>
            ))}
          </ul>
          <div className="relative mt-6 flex justify-center">
            <Image
              src="/diagram-placeholder.svg"
              alt="Diagram showing Simulate to Remediate to Measure"
              width={520}
              height={160}
              className="w-full max-w-lg"
              priority
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white px-6 py-4 text-base font-medium text-slate-700 shadow-inner">
            <span className="rounded-lg bg-slate-900/5 px-4 py-2 text-slate-800">
              Simulate
            </span>
            <span className="text-xl text-sky-500">→</span>
            <span className="rounded-lg bg-slate-900/5 px-4 py-2 text-slate-800">
              Remediate
            </span>
            <span className="text-xl text-sky-500">→</span>
            <span className="rounded-lg bg-slate-900/5 px-4 py-2 text-slate-800">
              Measure
            </span>
          </div>
        </div>
      </section>
      <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-3">
        {["Campaign simulations", "Just-in-time learning", "Awareness analytics"].map(
          (title, index) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-6 text-left shadow-inner"
            >
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600">
                {index === 0
                  ? "Launch tailored campaigns that mimic real-world threats without exposing anyone to harm."
                  : index === 1
                    ? "Send microlearning videos and short quizzes the moment risky behavior is detected."
                    : "Track team resilience with dashboards that highlight susceptibility, remediation and long-term impact."}
              </p>
            </div>
          )
        )}
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            Follow the SecureLearning journey
          </h2>
          <p className="text-base text-slate-600 md:text-lg">
            Track our personas, requirements, architecture, and more as we
            build an empathetic security awareness platform.
          </p>
          <Link
            href="/journey"
            className="mx-auto inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            View the journey timeline
          </Link>
        </div>
      </section>
    </div>
  );
}
