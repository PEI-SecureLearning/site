import { type Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About — SecureLearning",
  description: "Meet the SecureLearning team.",
};

export default function AboutPage() {
  return (
    <section className="full-bleed relative -mt-[clamp(3.5rem,9vh,6rem)] min-h-[calc(100vh-6rem)] w-full">
      <Image
        src="/assets/team.png"
        alt="The SecureLearning Team"
        fill
        className="object-contain"
        priority
      />
    </section>
  );
}

