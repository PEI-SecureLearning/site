"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import F3PhishingEmail, { F3PhishingEmailProps } from "./F3PhishingEmail";

gsap.registerPlugin(ScrollTrigger);

export type F3StateOneSceneProps = Readonly<{
    sceneHeightClassName?: string;
    releaseOnReviewActivity?: boolean;
    debugOverrides?: F3PhishingEmailProps["debugOverrides"];
}>;

export default function F3StateOneScene({
    sceneHeightClassName,
    releaseOnReviewActivity = false,
    debugOverrides,
}: F3StateOneSceneProps) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const entrySentinelRef = useRef<HTMLDivElement>(null);
    const [isSceneActive, setIsSceneActive] = useState(false);
    const [hasReleased, setHasReleased] = useState(false);

    useEffect(() => {
        if (!sceneRef.current || !entrySentinelRef.current) return;

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: entrySentinelRef.current,
                start: "top center",
                endTrigger: sceneRef.current,
                end: "bottom bottom",
                invalidateOnRefresh: true,
                onEnter: () => setIsSceneActive(true),
                onEnterBack: () => setIsSceneActive(true),
                onLeave: () => setIsSceneActive(false),
                onLeaveBack: () => setIsSceneActive(false),
            });
        }, sceneRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={sceneRef}
            className={`relative w-full ${sceneHeightClassName ?? "h-[220vh]"}`}
        >
            <div
                ref={entrySentinelRef}
                className="pointer-events-none absolute left-0 right-0 top-1/2 h-px"
                aria-hidden
            />
            <div className="sticky top-0 flex h-screen w-full items-center overflow-visible pt-10 md:pt-12">
                <F3PhishingEmail
                    isSceneActive={isSceneActive}
                    hasReleased={hasReleased}
                    onSequenceRelease={
                        releaseOnReviewActivity ? () => setHasReleased(true) : undefined
                    }
                    debugOverrides={debugOverrides}
                />
            </div>
        </div>
    );
}
