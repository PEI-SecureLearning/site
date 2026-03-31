"use client";

import Image from "next/image";
import {
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type MutableRefObject,
} from "react";
import Reveal from "./Reveal";

type HowItWorksStep = {
    id: string;
    number: string;
    title: string;
    description: string;
    stageGlow: string;
    beamStyle: CSSProperties;
};

const STEPS: readonly HowItWorksStep[] = [
    {
        id: "import",
        number: "01",
        title: "Import your organization",
        description:
            "Connect LDAP/AD or upload CSV. Tag users by role, department, and risk profile.",
        stageGlow:
            "radial-gradient(38% 46% at 18% 20%, rgba(167,139,250,0.18) 0%, rgba(167,139,250,0.05) 34%, transparent 72%), radial-gradient(44% 54% at 84% 78%, rgba(124,58,237,0.14) 0%, transparent 76%)",
        beamStyle: {
            background:
                "linear-gradient(118deg, rgba(167,139,250,0.13) 0%, rgba(167,139,250,0.04) 42%, transparent 100%)",
            opacity: 0.54,
            transform: "translate3d(-8%, -10%, 0) rotate(-16deg)",
        },
    },
    {
        id: "build",
        number: "02",
        title: "Build your simulation",
        description:
            "Choose templates, set lure types, schedule waves, and segment by group.",
        stageGlow:
            "radial-gradient(34% 40% at 50% 18%, rgba(167,139,250,0.16) 0%, rgba(167,139,250,0.04) 32%, transparent 74%), radial-gradient(34% 42% at 80% 76%, rgba(124,58,237,0.16) 0%, transparent 72%)",
        beamStyle: {
            background:
                "linear-gradient(96deg, rgba(167,139,250,0.12) 0%, rgba(167,139,250,0.04) 36%, transparent 100%)",
            opacity: 0.48,
            transform: "translate3d(10%, -2%, 0) rotate(-8deg)",
        },
    },
    {
        id: "launch",
        number: "03",
        title: "Launch and monitor",
        description:
            "Real-time tracking of clicks, credentials submitted, and time-to-click.",
        stageGlow:
            "radial-gradient(34% 42% at 76% 24%, rgba(167,139,250,0.15) 0%, rgba(167,139,250,0.04) 32%, transparent 72%), radial-gradient(40% 50% at 20% 84%, rgba(124,58,237,0.18) 0%, transparent 76%)",
        beamStyle: {
            background:
                "linear-gradient(132deg, rgba(167,139,250,0.12) 0%, rgba(124,58,237,0.04) 38%, transparent 100%)",
            opacity: 0.58,
            transform: "translate3d(14%, 8%, 0) rotate(10deg)",
        },
    },
    {
        id: "train",
        number: "04",
        title: "Train and improve",
        description:
            "See susceptibility trends and auto-assign follow-up training.",
        stageGlow:
            "radial-gradient(36% 42% at 82% 20%, rgba(167,139,250,0.16) 0%, rgba(167,139,250,0.04) 30%, transparent 72%), radial-gradient(44% 50% at 18% 82%, rgba(124,58,237,0.18) 0%, transparent 76%)",
        beamStyle: {
            background:
                "linear-gradient(102deg, rgba(167,139,250,0.13) 0%, rgba(167,139,250,0.04) 36%, transparent 100%)",
            opacity: 0.52,
            transform: "translate3d(-2%, 12%, 0) rotate(18deg)",
        },
    },
] as const;

const AUTOPLAY_INTERVAL_MS = 1900;

function StagePanels({
    activeIndex,
    idBase,
}: Readonly<{
    activeIndex: number;
    idBase: string;
}>) {
    return (
        <div className="relative mx-auto aspect-[1919/928] w-full max-w-[1024px] overflow-hidden rounded-[30px] border border-[rgba(167,139,250,0.14)] bg-[#04050a] shadow-[0_24px_70px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025)_0%,rgba(255,255,255,0.006)_18%,rgba(0,0,0,0.18)_64%,rgba(0,0,0,0.38)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_110%_at_50%_0%,rgba(31,25,49,0.18)_0%,rgba(4,5,10,0)_52%),linear-gradient(180deg,rgba(8,8,13,0.3)_0%,rgba(3,4,7,0.92)_100%)]" />

            {STEPS.map((step, index) => {
                const isActive = index === activeIndex;

                return (
                    <div
                        key={step.id}
                        id={`${idBase}-panel-${step.id}`}
                        role="tabpanel"
                        aria-labelledby={`${idBase}-tab-${step.id}`}
                        aria-hidden={!isActive}
                        tabIndex={isActive ? 0 : -1}
                        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                        <div
                            className="absolute inset-0"
                            style={{ background: step.stageGlow }}
                        />
                        <div
                            className="absolute left-[7%] top-[18%] h-[54%] w-[44%] rounded-[999px] blur-[88px]"
                            style={step.beamStyle}
                        />
                        <Image
                            src="/assets/placeholders/how-it-works-admin-console.png"
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 1024px, 92vw"
                            className="object-cover object-top"
                            priority={index === 0}
                        />
                    </div>
                );
            })}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(180deg,rgba(3,4,8,0)_0%,rgba(3,4,8,0.3)_34%,rgba(3,4,8,0.82)_78%,rgba(3,4,8,0.96)_100%)]" />

            <div className="absolute inset-x-0 bottom-0 px-8 pb-8 pt-20 md:px-10 md:pb-9">
                <div className="relative min-h-[7.5rem] max-w-[28rem]">
                    {STEPS.map((step, index) => {
                        const isActive = index === activeIndex;

                        return (
                            <div
                                key={step.id}
                                className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-out ${isActive ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
                                aria-hidden={!isActive}
                            >
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-secondary)]">
                                    {step.number}
                                </p>
                                <h3 className="mt-3 text-[1.8rem] font-semibold leading-[1.02] tracking-[-0.045em] text-white md:text-[2.05rem]">
                                    {step.title}
                                </h3>
                                <p className="mt-3 max-w-[26ch] text-[1rem] leading-[1.7] text-white/60 md:text-[1.02rem]">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function StepTimeline({
    activeIndex,
    idBase,
    tabRefs,
    onSelectStep,
    onTabKeyDown,
}: Readonly<{
    activeIndex: number;
    idBase: string;
    tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
    onSelectStep: (index: number) => void;
    onTabKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
}>) {
    const progress =
        STEPS.length > 1 ? activeIndex / (STEPS.length - 1) : 0;

    return (
        <div className="mx-auto mt-8 w-full max-w-[560px]">
            <div
                role="tablist"
                aria-label="How SecureLearning works"
                className="relative grid grid-cols-4 items-start"
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-5 h-px bg-[rgba(167,139,250,0.12)]"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-[12.5%] top-5 h-px bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#7c3aed] transition-[width,opacity] duration-500 ease-out"
                    style={{
                        width: `${progress * 75}%`,
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-[12.5%] top-[1.125rem] h-[0.35rem] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#7c3aed] blur-[8px] transition-[width,opacity] duration-500 ease-out"
                    style={{
                        width: `${progress * 75}%`,
                        opacity: progress > 0 ? 0.55 : 0,
                    }}
                />

                {STEPS.map((step, index) => {
                    const isActive = index === activeIndex;
                    const isReached = index <= activeIndex;

                    return (
                        <button
                            key={step.id}
                            ref={(button) => {
                                tabRefs.current[index] = button;
                            }}
                            id={`${idBase}-tab-${step.id}`}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`${idBase}-panel-${step.id}`}
                            aria-label={step.title}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => onSelectStep(index)}
                            onKeyDown={(event) => onTabKeyDown(event, index)}
                            className="group relative flex h-10 items-start justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(167,139,250,0.45)]"
                        >
                            <span
                                aria-hidden
                                className={`absolute top-[0.08rem] h-10 w-10 rounded-full bg-[rgba(167,139,250,0.45)] blur-[14px] transition-[opacity,transform] duration-300 ${isReached ? "opacity-100" : "opacity-0"} ${isActive ? "scale-110" : "scale-100"}`}
                            />
                            <span
                                className={`relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border text-[0.78rem] font-semibold tracking-[0.12em] transition-[background-color,border-color,box-shadow,color,transform] duration-300 ${isReached
                                    ? "border-[#a78bfa] bg-[rgba(12,10,15,0.92)] text-white shadow-[0_0_12px_rgba(167,139,250,0.3)]"
                                    : "border-[rgba(167,139,250,0.18)] bg-[rgba(12,10,15,0.92)] text-white/38 group-hover:border-[rgba(167,139,250,0.3)] group-hover:text-white/55"
                                    } ${isActive ? "scale-105 shadow-[0_0_0_4px_rgba(124,58,237,0.14),0_0_18px_rgba(167,139,250,0.45)]" : ""}`}
                            >
                                {step.number}
                            </span>
                            <span className="sr-only">
                                {step.number} {step.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function HowItWorks() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const idBase = useId().replace(/:/g, "");
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasEntered, setHasEntered] = useState(false);
    const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
    const [userHasInteracted, setUserHasInteracted] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

        updatePreference();

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", updatePreference);
            return () => mediaQuery.removeEventListener("change", updatePreference);
        }

        mediaQuery.addListener(updatePreference);
        return () => mediaQuery.removeListener(updatePreference);
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        if (typeof IntersectionObserver === "undefined") {
            setHasEntered(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setHasEntered(true);
                observer.disconnect();
            },
            {
                threshold: 0.3,
                rootMargin: "0px 0px -12% 0px",
            }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (prefersReducedMotion || userHasInteracted || hasAutoPlayed || !hasEntered) {
            return;
        }

        const timeoutIds: number[] = [];

        for (let index = 1; index < STEPS.length; index += 1) {
            timeoutIds.push(
                window.setTimeout(() => {
                    setActiveIndex(index);

                    if (index === STEPS.length - 1) {
                        setHasAutoPlayed(true);
                    }
                }, AUTOPLAY_INTERVAL_MS * index)
            );
        }

        timeoutIds.push(
            window.setTimeout(() => {
                setHasAutoPlayed(true);
            }, AUTOPLAY_INTERVAL_MS * (STEPS.length - 1) + 120)
        );

        return () => timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    }, [hasAutoPlayed, hasEntered, prefersReducedMotion, userHasInteracted]);

    const handleStepSelection = (index: number) => {
        setUserHasInteracted(true);
        setHasAutoPlayed(true);
        setActiveIndex(index);
    };

    const moveFocusToStep = (index: number) => {
        const normalizedIndex = (index + STEPS.length) % STEPS.length;
        tabRefs.current[normalizedIndex]?.focus();
        handleStepSelection(normalizedIndex);
    };

    const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                event.preventDefault();
                moveFocusToStep(index + 1);
                break;
            case "ArrowLeft":
            case "ArrowUp":
                event.preventDefault();
                moveFocusToStep(index - 1);
                break;
            case "Home":
                event.preventDefault();
                moveFocusToStep(0);
                break;
            case "End":
                event.preventDefault();
                moveFocusToStep(STEPS.length - 1);
                break;
            default:
                break;
        }
    };

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className="full-bleed relative py-24 md:py-30"
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-12 h-[28rem] opacity-80"
                aria-hidden
                style={{
                    background:
                        "radial-gradient(54% 58% at 50% 0%, rgba(124,58,237,0.1) 0%, rgba(124,58,237,0.03) 34%, rgba(12,10,15,0) 78%)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-[1240px] px-6">
                <Reveal>
                    <h2 className="text-center text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl md:text-[4rem]">
                        How It Works
                    </h2>
                </Reveal>

                <Reveal delay={0.06}>
                    <div className="mt-12">
                        <StagePanels
                            activeIndex={activeIndex}
                            idBase={idBase}
                        />
                        <StepTimeline
                            activeIndex={activeIndex}
                            idBase={idBase}
                            tabRefs={tabRefs}
                            onSelectStep={handleStepSelection}
                            onTabKeyDown={handleTabKeyDown}
                        />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
