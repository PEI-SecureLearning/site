import F1Construction from "../../components/F1Construction";
import F2Construction from "../../components/F2Construction";

export default function ConstructionDemo() {
    return (
        <div className="min-h-[100dvh] bg-[#050308] text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
            <div className="max-w-6xl mx-auto space-y-24">
                <header className="text-center space-y-5 pt-16">
                    <div className="inline-block px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono tracking-widest uppercase mb-2">
                        Developer Preview
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 tracking-tight">
                        Construction Placeholders
                    </h1>
                    <p className="text-white/40 max-w-xl mx-auto text-lg">
                        These are out-of-the-box animated components built to drop directly into the <code className="text-purple-300 font-mono text-sm px-1 bg-white/5 rounded">FeatureShowcase.tsx</code> browser mockups while we build the real UI.
                    </p>
                </header>

                <section className="space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="h-px bg-gradient-to-r from-transparent to-white/10 flex-1"></div>
                        <h2 className="text-sm md:text-base font-mono text-purple-400 tracking-[0.2em] uppercase flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                            F1 — Phishing Simulation
                        </h2>
                        <div className="h-px bg-gradient-to-l from-transparent to-white/10 flex-1"></div>
                    </div>
                    
                    {/* Simulated Browser Container */}
                    <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-[24px] border border-[rgba(167,139,250,0.18)] bg-[#0e0b14]/85 shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_80px_rgba(124,58,237,0.1)]">
                         <div className="relative z-30 flex items-center gap-2 border-b border-[rgba(167,139,250,0.1)] bg-[linear-gradient(180deg,rgba(23,18,34,0.98)_0%,rgba(16,13,24,0.94)_100%)] px-5 py-4">
                            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                            <div className="mx-3 flex-1 rounded-md border border-white/[0.04] bg-[#181321]/95 px-4 py-1.5 text-center text-[0.7rem] tracking-[0.18em] text-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                app.securelearning.pt / threat-scanner
                            </div>
                        </div>
                        <F1Construction />
                    </div>
                </section>

                <section className="space-y-8 pb-32">
                    <div className="flex items-center gap-6">
                        <div className="h-px bg-gradient-to-r from-transparent to-white/10 flex-1"></div>
                        <h2 className="text-sm md:text-base font-mono text-fuchsia-400 tracking-[0.2em] uppercase flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                            F2 — Targeted Training
                        </h2>
                        <div className="h-px bg-gradient-to-l from-transparent to-white/10 flex-1"></div>
                    </div>
                    
                    {/* Simulated Browser Container */}
                    <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-[24px] border border-[rgba(167,139,250,0.18)] bg-[#0e0b14]/85 shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_80px_rgba(167,139,250,0.1)]">
                         <div className="relative z-30 flex items-center gap-2 border-b border-[rgba(167,139,250,0.1)] bg-[linear-gradient(180deg,rgba(23,18,34,0.98)_0%,rgba(16,13,24,0.94)_100%)] px-5 py-4">
                            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                            <div className="mx-3 flex-1 rounded-md border border-white/[0.04] bg-[#181321]/95 px-4 py-1.5 text-center text-[0.7rem] tracking-[0.18em] text-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                app.securelearning.pt / neural-routing
                            </div>
                        </div>
                        <F2Construction />
                    </div>
                </section>
            </div>
        </div>
    );
}
