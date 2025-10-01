const steps = [
  {
    title: "Campaigns",
    description:
      "Schedule realistic phishing simulations tailored to departments, roles, or current threats.",
  },
  {
    title: "Remediation",
    description:
      "Trigger just-in-time training with short videos, microcopy, and quick quizzes that reinforce safe behaviors.",
  },
  {
    title: "Analytics",
    description:
      "Monitor susceptibility trends, remediation speed, and long-term awareness improvements in one dashboard.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            How SecureLearning Works
          </h1>
          <p className="text-lg text-slate-600">
            Combine proactive simulations with empathetic education and
            measurable outcomes.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-sky-600">
                  {step.title}
                </span>
              </div>
              <p className="text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Ethics & Privacy</h2>
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-5 text-slate-700 shadow-inner">
          SecureLearning never stores real credentials and is designed for
          educational, defensive purposes only. All training data is kept
          minimal, encrypted, and deleted on request.
        </div>
      </section>
    </div>
  );
}

