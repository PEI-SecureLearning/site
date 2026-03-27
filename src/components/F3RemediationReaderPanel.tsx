"use client";

import { useRef } from "react";
import F3EmailMessageStatic from "./F3EmailMessageStatic";
import { F3ForensicOverlay } from "./F3ForensicOverlay";

/**
 * Same reading column as State 1 — only the finished email plus forensic highlights/labels.
 * No banners, rails, recovery blocks, or other chrome on top of the message.
 */
export default function F3RemediationReaderPanel() {
    const forensicRootRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <p className="sr-only" aria-live="polite">
                Simulation complete. Review the highlighted areas in the email body.
            </p>
            <div ref={forensicRootRef} className="relative min-w-0 w-full overflow-visible">
                <F3EmailMessageStatic />
                <F3ForensicOverlay rootRef={forensicRootRef} active />
            </div>
        </>
    );
}
