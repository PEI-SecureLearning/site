"use client";

import Image from "next/image";
import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type MutableRefObject,
    Fragment,
} from "react";
import Reveal from "./Reveal";

type HowItWorksStep = {
    id: string;
    number: string;
    title: string;
    captionLines: readonly [string, string];
    stageGlow: string;
    beamStyle: CSSProperties;
};

const STEPS: readonly HowItWorksStep[] = [
    {
        id: "import",
        number: "01",
        title: "Import your org",
        captionLines: ["Connect via LDAP/AD or CSV.", "Tag users by role, department, and risk profile."],
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
        title: "Design your campaign",
        captionLines: ["Choose templates, set lure types, schedule waves, segment by group.", ""],
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
        title: "Launch & monitor",
        captionLines: ["Real-time tracking of clicks, credentials submitted, and time-to-click.", ""],
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
        title: "Review & improve",
        captionLines: [
            "Export KPIs, see susceptibility trends, and auto-assign follow-up training.",
            "",
        ],
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

const AUTOPLAY_INTERVAL_MS = 6000;

function StagePanels({
    activeIndex,
    idBase,
}: Readonly<{
    activeIndex: number;
    idBase: string;
}>) {
    return (
        <div className="relative w-full max-w-[1240px]">
            {/* The Frameless Media Stage */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-[#05060b] shadow-[0_32px_96px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]">
                
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
                            className={`absolute inset-0 transition-[opacity,transform,filter] duration-1000 ease-out ${isActive ? "scale-100 blur-none opacity-100 z-10" : "scale-[1.03] blur-[4px] opacity-0 z-0 pointer-events-none"}`}
                        >
                            <div
                                className="absolute inset-0 mix-blend-screen"
                                style={{ background: step.stageGlow }}
                            />
                            <div
                                className="absolute left-[10%] top-[20%] h-[60%] w-[50%] rounded-[999px] blur-[100px] mix-blend-screen"
                                style={{ ...step.beamStyle, transition: "none" }}
                            />
                            
                            <Image
                                src="/assets/placeholders/how-it-works-admin-console.png"
                                alt={step.title}
                                fill
                                sizes="(min-width: 1024px) 1024px, 92vw"
                                className="object-cover object-top opacity-90"
                                priority={index === 0}
                            />
                        </div>
                    );
                })}
            </div>
            
            {/* Optimized ambient ground glow for the 70% column */}
            <div className="pointer-events-none absolute -bottom-16 inset-x-[15%] h-32 rounded-[100%] bg-[rgba(167,139,250,0.12)] blur-[64px]" />
        </div>
    );
}

function SingleLineTimeline({
    activeIndex,
    idBase,
    tabRefs,
    onSelectStep,
    onTabKeyDown,
    progressKey
}: Readonly<{
    activeIndex: number;
    idBase: string;
    tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
    onSelectStep: (index: number) => void;
    onTabKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
    progressKey: number;
}>) {
    return (
        <div className="w-full flex-col items-center space-y-4">
            <div
                role="tablist"
                aria-orientation="vertical"
                aria-label="How SecureLearning works timeline"
                className="flex flex-col w-full items-center"
            >
                {STEPS.map((step, index) => {
                    const isActive = index === activeIndex;
                    const isPast = index < activeIndex;

                    return (
                        <Fragment key={step.id}>
                            <button
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
                                className={`
                                    group relative flex items-center justify-center transition-[width,height,background-color,border-radius,box-shadow,margin] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                                    overflow-hidden focus-visible:outline-none z-10 mx-auto
                                    ${isActive 
                                        ? 'w-full min-h-[175px] md:min-h-[185px] h-auto rounded-[48px] bg-[#0d071b] shadow-[0_48px_80px_rgba(0,0,0,0.6),0_0_0_1.5px_rgba(255,255,255,0.04),inset_0_0_32px_rgba(167,139,250,0.12)] px-4 mb-4 pb-8' 
                                        : isPast
                                            ? 'w-[44px] h-[44px] md:w-[50px] md:h-[50px] rounded-[999px] bg-[#05060b] shadow-[0_0_24px_rgba(167,139,250,0.25)] mb-4'
                                            : 'w-[44px] h-[44px] md:w-[50px] md:h-[50px] rounded-[999px] bg-[#05060b] hover:bg-white/[0.05] mb-4'
                                    }
                                `}
                            >
                                {/* Base Border Layer (Layout-neutral inset shadows) */}
                                <div className={`absolute inset-0 rounded-[inherit] transition-shadow pointer-events-none z-0
                                    ${isActive 
                                      ? 'duration-0' 
                                      : isPast 
                                        ? 'duration-[800ms] shadow-[inset_0_0_0_1.5px_#a78bfa]' 
                                        : 'duration-[800ms] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.15)]'}
                                `} />

                                {/* Progress Fill Indicator (Border Fill) */}
                                {isActive && (
                                    <div 
                                        key={`progress-${progressKey}`}
                                        className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_2px_#a78bfa] pointer-events-none z-20" 
                                        style={{ animation: `fill-border-v ${AUTOPLAY_INTERVAL_MS}ms linear forwards` }} 
                                    />
                                )}

                                {/* Conformal Narrative Layout (Ultra-Compact) */}
                                <div className={`
                                    flex flex-col items-center justify-start transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-10 w-full px-2
                                    ${isActive ? 'opacity-100 pt-5' : 'opacity-100 pt-0'}
                                `}>
                                    {/* Number Circle (High-precision minimalist orientation label) */}
                                    <div className={`
                                        shrink-0 flex items-center justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                                        ${isActive 
                                            ? 'w-[32px] h-[32px] rounded-[999px] border-[1px] border-white/10 bg-white/[0.03] mb-1' 
                                            : 'w-[44px] h-[44px] md:w-[50px] md:h-[50px]'
                                        }
                                    `}>
                                        <span className={`transition-all duration-[800ms] font-bold tracking-widest ${
                                            isActive ? 'text-white/30 text-[0.7rem]' : 'text-white/40 text-[0.95rem] md:text-[1.1rem]'
                                        } ${isPast && !isActive ? 'text-white/90' : ''}`}>
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Typography Stack */}
                                    <div className={`
                                        flex flex-col items-center text-center transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] 
                                        overflow-hidden
                                        ${isActive ? 'opacity-100 max-h-[400px] visible' : 'opacity-0 max-h-0 invisible'}
                                    `}>
                                        <h3 className="text-[1.5rem] md:text-[1.85rem] font-bold text-white tracking-tight leading-tight max-w-[350px]">{step.title}</h3>
                                        <div className="flex flex-col space-y-1 mt-3">
                                            <p className="text-[0.9rem] md:text-[0.95rem] text-white/50 leading-relaxed font-medium max-w-[350px]">{step.captionLines[0]} {step.captionLines[1]}</p>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Center-aligned Seamless Vertical Connecting Line */}
                            {index !== STEPS.length - 1 && (
                                <div className="relative h-[48px] flex items-center justify-center -mt-4 mb-0">
                                    <div className={`
                                        w-[2px] h-full transition-all duration-[1000ms] ease-in-out relative z-0
                                        ${isPast ? 'bg-[#a78bfa] shadow-[0_0_12px_#a78bfa]' : 'bg-white/10'}
                                    `} />
                                </div>
                            )}
                        </Fragment>
                    );
                })}
            </div>
            <style jsx>{`
                @keyframes fill-border-v {
                    0% { clip-path: inset(0 0 100% 0); }
                    100% { clip-path: inset(0 0 0 0); }
                }
            `}</style>
        </div>
    );
}

export default function HowItWorks() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const consoleRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
    const idBase = useId().replace(/:/g, "");
    
    const [activeIndex, setActiveIndex] = useState(0);
    const [progressKey, setProgressKey] = useState(0); 
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    // Track active index based on scroll with IntersectionObserver
    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") return;

        const options = {
            root: null,
            threshold: 0.6,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute("data-index") || "0");
                    setActiveIndex(index);
                    setProgressKey((prev) => prev + 1);
                }
            });
        }, options);

        itemRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Also keep the auto-play timer, but it resets on scroll index change
    useEffect(() => {
        if (userHasInteracted) return;

        const intervalId = window.setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % STEPS.length);
            setProgressKey((prev) => prev + 1);
        }, AUTOPLAY_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [activeIndex, userHasInteracted]);

    const handleStepSelection = (index: number) => {
        setUserHasInteracted(true);
        setActiveIndex(index);
        setProgressKey((prev) => prev + 1);
        
        // Scroll to the respective anchor
        itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
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
            className="relative h-[400vh] full-bleed"
        >
            {/* Scroll Anchors (invisible sensors) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {STEPS.map((_, i) => (
                    <div 
                        key={i} 
                        ref={(el) => { itemRefs.current[i] = el; }}
                        data-index={i}
                        className="h-screen w-full" 
                    />
                ))}
            </div>

            {/* Sticky Container */}
            <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
                <div className="relative z-10 mx-auto max-w-[1440px] w-full px-6 md:px-12">
                    
                    {/* Header */}
                    <Reveal>
                        <div className="mb-12 lg:mb-16">
                            <h2 className="text-[2.6rem] font-semibold tracking-[-0.05em] text-white sm:text-[3rem] md:text-[3.25rem]">
                                How It Works
                            </h2>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-x-16 items-center">
                        
                        {/* Left: Vertical Timeline */}
                        <div className="hidden lg:block">
                            <SingleLineTimeline
                                activeIndex={activeIndex}
                                idBase={idBase}
                                tabRefs={tabRefs}
                                onSelectStep={handleStepSelection}
                                onTabKeyDown={handleTabKeyDown}
                                progressKey={progressKey}
                            />
                        </div>

                        {/* Right: Media Stage */}
                        <div className="w-full">
                            <StagePanels
                                activeIndex={activeIndex}
                                idBase={idBase}
                            />
                        </div>
                        
                    </div>
                </div>
            </div>
        </section>
    );
}
