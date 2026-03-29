"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import F3EmailMessageStatic from "./F3EmailMessageStatic";
import { F3ForensicOverlay, type F3ForensicLayoutSet, type F3ForensicOverlayEditor } from "./F3ForensicOverlay";
import {
    F3_INTERVENTION_SLAB_REVIEW_LINE,
    F3_INTERVENTION_SLAB_SIMULATION_LINE,
    F3_REFRESHER_CTA,
    F3_REFRESHER_EYEBROW,
    F3_REFRESHER_META,
    F3_REFRESHER_TITLE,
} from "./f3PhishingCopy";

/**
 * Same reading column as State 1, now with the slim intervention rail anchored in the top-left gutter.
 * The email remains the dominant object; the rail should frame the state, not compete with it.
 */
export default function F3RemediationReaderPanel({
    forensicLayouts,
    forensicEditor,
}: Readonly<{
    forensicLayouts?: F3ForensicLayoutSet;
    forensicEditor?: F3ForensicOverlayEditor;
}>) {
    const overlayRootRef = useRef<HTMLDivElement>(null);
    const senderDomainRef = useRef<HTMLSpanElement>(null);
    const pressureRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLSpanElement>(null);

    return (
        <>
            <p className="sr-only" aria-live="polite">
                Simulation complete. Review the highlighted areas in the email body.
            </p>
            <div ref={overlayRootRef} className="relative min-h-full min-w-0 w-full overflow-visible">
                <div className="pointer-events-none absolute left-0 top-[-3.45rem] z-[2] flex max-w-[30rem] items-start gap-3">
                    <Image
                        src="/assets/branding/logo-icon.png"
                        alt=""
                        width={55}
                        height={55}
                        className="-mt-3 h-[3.5rem] w-[3.5rem] shrink-0 object-contain opacity-[0.84]"
                        aria-hidden
                    />
                    <div className="pt-0.5">
                        <p className="text-[0.78rem] font-semibold leading-none tracking-[-0.01em] text-white/[0.62]">
                            {F3_INTERVENTION_SLAB_SIMULATION_LINE}
                        </p>
                        <p className="mt-1.5 max-w-[24rem] text-[0.7rem] leading-[1.46] tracking-[-0.005em] text-white/[0.4]">
                            {F3_INTERVENTION_SLAB_REVIEW_LINE}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="group absolute bottom-[-6.1rem] right-[-0.85rem] z-[3] flex w-[min(15.8rem,41vw)] min-w-[13.5rem] max-w-[16.4rem] flex-col rounded-[20px] border border-white/[0.08] px-4 py-4 text-left transition duration-300 hover:-translate-y-[1px] hover:border-white/[0.14] hover:bg-white/[0.04] md:bottom-[-6.6rem] md:right-[-1rem] md:px-4.5 md:py-4.5"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(25,22,31,0.88) 0%, rgba(14,12,18,0.94) 100%)",
                        boxShadow:
                            "0 20px 40px -24px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.045)",
                    }}
                        aria-label={`${F3_REFRESHER_CTA}: ${F3_REFRESHER_TITLE}`}
                >
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                        {F3_REFRESHER_EYEBROW}
                    </span>
                    <span className="mt-2 text-[0.94rem] font-semibold leading-[1.16] tracking-[-0.02em] text-white/[0.84]">
                        {F3_REFRESHER_TITLE}
                    </span>
                    <span className="mt-2 text-[0.7rem] font-medium leading-none tracking-[0.01em] text-white/[0.42]">
                        {F3_REFRESHER_META}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-2 text-[0.76rem] font-semibold tracking-[-0.01em] text-white/[0.72] transition group-hover:text-white/[0.92]">
                        {F3_REFRESHER_CTA}
                        <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" strokeWidth={1.9} />
                    </span>
                </button>
                <div className="relative min-w-0 w-full max-w-[44rem] overflow-visible">
                    <F3EmailMessageStatic
                        senderDomainRef={senderDomainRef}
                        pressureRef={pressureRef}
                        ctaRef={ctaRef}
                    />
                    <F3ForensicOverlay
                        overlayRootRef={overlayRootRef}
                        targetRefs={{ senderDomainRef, pressureRef, ctaRef }}
                        active
                        layouts={forensicLayouts}
                        editor={forensicEditor}
                    />
                </div>
            </div>
        </>
    );
}
