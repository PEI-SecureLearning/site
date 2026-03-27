/** Shared strings for F3 State 1 email and State 3 analyzed email — single source of truth. */
export const F3_SUBJECT_LINE = "Unusual sign-in attempt detected";
export const F3_EVENT_SENTENCE =
    "We detected a sign-in attempt from a new device on your account.";
export const F3_ACTION_SENTENCE =
    "If you don't recognize this activity, secure your account now!";
export const F3_SENDER_DISPLAY = "Security Operations";
export const F3_SENDER_EMAIL = "noreply@secure-yourorg.com";
export const F3_CTA_LABEL = "Secure account";

export const F3_DETAIL_LOCATION = "Location: Soroca, Moldavia";
export const F3_DETAIL_DEVICE = "Device: Windows 11 · Chrome";
export const F3_DETAIL_TIME = "Time: Today, 9:14 AM";

/** State 3 forensic callouts — order matches sender-domain → pressure → cta targets. */
export const F3_FORENSIC_LABELS = [
    "Always verify the sender domain, not just the display name.",
    "Urgent language is meant to rush your decision.",
    "Buttons hide their destination, so inspect the URL first.",
] as const;

/** State 3 intervention slab (brief §3) — verbatim. */
export const F3_INTERVENTION_SLAB_SIMULATION_LINE = "This was a simulation.";
export const F3_INTERVENTION_SLAB_REVIEW_LINE =
    "Review what you missed, then complete the 90-second recovery step.";
