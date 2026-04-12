"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import F3PhishingEmail, { F3PhishingEmailProps } from "./F3PhishingEmail";

gsap.registerPlugin(ScrollTrigger);

export type F3StateOneSceneProps = Readonly<{
    sceneHeightClassName?: string;
    labRange?: F3PhishingEmailProps["labRange"];
    debugOverrides?: F3PhishingEmailProps["debugOverrides"];
    forensicLayouts?: F3PhishingEmailProps["forensicLayouts"];
    forensicEditor?: F3PhishingEmailProps["forensicEditor"];
}>;

export default function F3StateOneScene({
    sceneHeightClassName,
    labRange,
    debugOverrides,
    forensicLayouts,
    forensicEditor,
}: F3StateOneSceneProps) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const [isSceneActive, setIsSceneActive] = useState(false);
    const [hasReleased, setHasReleased] = useState(false);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [releasedScrollOffset, setReleasedScrollOffset] = useState(0);
    const [releasedSceneHeight, setReleasedSceneHeight] = useState<number | null>(null);
    const [releasedStageHeight, setReleasedStageHeight] = useState<number | null>(null);

    useEffect(() => {
        if (globalThis.window === undefined || typeof globalThis.window.matchMedia !== "function") {
            return;
        }

        const mediaQuery = globalThis.window.matchMedia("(max-width: 767px)");
        const update = () => setIsMobileViewport(mediaQuery.matches);

        update();
        mediaQuery.addEventListener("change", update);

        return () => mediaQuery.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene || hasReleased) {
            setIsSceneActive(false);
            return;
        }

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: scene,
                start: "top top",
                end: "bottom bottom",
                invalidateOnRefresh: true,
                onEnter: () => setIsSceneActive(true),
                onEnterBack: () => setIsSceneActive(true),
                onLeave: () => setIsSceneActive(false),
                onLeaveBack: () => setIsSceneActive(false),
            });
        }, sceneRef);

        return () => ctx.revert();
    }, [hasReleased]);

    const handleSequenceRelease = useCallback(() => {
        const scene = sceneRef.current;
        const stage = stageRef.current;
        if (scene) {
            const sceneTop = scene.getBoundingClientRect().top + globalThis.window.scrollY;
            const maxStickyOffset = Math.max(0, scene.offsetHeight - globalThis.window.innerHeight);
            const stickyOffset = Math.min(
                Math.max(0, globalThis.window.scrollY - sceneTop),
                maxStickyOffset
            );
            const measuredStageHeight =
                stage?.getBoundingClientRect().height ?? globalThis.window.innerHeight;
            const resolvedReleaseHeight =
                isMobileViewport ? measuredStageHeight : globalThis.window.innerHeight;

            setReleasedScrollOffset(stickyOffset);
            setReleasedSceneHeight(resolvedReleaseHeight + stickyOffset);
            setReleasedStageHeight(resolvedReleaseHeight);
        }
        setHasReleased(true);
    }, [isMobileViewport]);

    const tallRunwayClass = sceneHeightClassName ?? "h-[220vh]";
    const sceneLayoutClass = hasReleased
        ? "relative w-full"
        : `relative w-full ${tallRunwayClass}`;
    const stageLayoutClass = hasReleased
        ? "relative flex min-h-screen w-full flex-col items-stretch overflow-visible pt-10 md:pt-12"
        : "sticky top-0 flex h-screen w-full flex-col items-stretch overflow-visible pt-10 md:pt-12";
    const releasedSceneStyle =
        hasReleased && releasedSceneHeight != null
            ? { height: `${releasedSceneHeight}px` }
            : undefined;
    const releasedStageStyle =
        hasReleased
            ? {
                  ...(releasedScrollOffset > 0
                      ? { transform: `translateY(${releasedScrollOffset}px)` }
                      : {}),
                  ...(isMobileViewport && releasedStageHeight != null
                      ? {
                            height: `${releasedStageHeight}px`,
                            minHeight: `${releasedStageHeight}px`,
                        }
                      : {}),
              }
            : undefined;

    return (
        <div ref={sceneRef} className={sceneLayoutClass} style={releasedSceneStyle}>
            <div
                ref={stageRef}
                className={`${stageLayoutClass} bg-[var(--background)]`}
                style={releasedStageStyle}
            >
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <F3PhishingEmail
                        isSceneActive={isSceneActive}
                        hasReleased={hasReleased}
                        onSequenceRelease={handleSequenceRelease}
                        labRange={labRange}
                        debugOverrides={debugOverrides}
                        forensicLayouts={forensicLayouts}
                        forensicEditor={forensicEditor}
                    />
                </div>
            </div>
        </div>
    );
}
