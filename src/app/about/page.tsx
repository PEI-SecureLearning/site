import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "About — SecureLearning",
  description: "Meet the SecureLearning team.",
};

export default function AboutPage() {
  return (
    <section className="full-bleed relative -mt-[clamp(3.5rem,9vh,6rem)] min-h-[calc(100vh-6rem)] w-full">
      <iframe
        src="/Passadeira/passadeira.html"
        title="The SecureLearning Team"
        className="h-full w-full border-0"
        style={{ minHeight: "calc(100vh - 6rem)" }}
      />
    </section>
  );
}
