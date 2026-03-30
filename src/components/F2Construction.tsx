"use client";
type F2ConstructionProps = Readonly<{
    isAnimated?: boolean;
}>;

export default function F2Construction({ isAnimated = true }: F2ConstructionProps) {
    return (
        <div
            className="f2-construction-scene relative w-full h-[300px] md:h-[500px] lg:h-[700px] overflow-hidden bg-[#0A080F] flex items-center justify-center font-sans"
            data-animated={isAnimated}
        >
            <style dangerouslySetInnerHTML={{__html: `
                .f2-construction-scene[data-animated="false"] *,
                .f2-construction-scene[data-animated="false"] *::before,
                .f2-construction-scene[data-animated="false"] *::after {
                    animation-play-state: paused !important;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes dig-arm-1 {
                    0%, 10% { transform: rotate(-45deg); }   /* Deep in pile */
                    40%, 50% { transform: rotate(45deg); }   /* Deep in drop zone */
                    90%, 100% { transform: rotate(-45deg); } /* Back in pile */
                }
                @keyframes dig-arm-2 {
                    0%, 10% { transform: rotate(95deg); }    /* More open, reaching top of pile */
                    40%, 50% { transform: rotate(-45deg); }  /* Extended down into drop zone */
                    90%, 100% { transform: rotate(95deg); }  /* Back in pile */
                }
                @keyframes dig-bucket {
                    0% { transform: rotate(60deg); }   /* Curled under, scooping from top of pile */
                    25% { transform: rotate(0deg); }   /* Curled under, scooping from top of pile */
                    35% { transform: rotate(-30deg); }  /* Opened wide, dumping in drop zone */
                    45% { transform: rotate(40deg); }  /* Opened wide, dumping in drop zone */
                    95%, 100% { transform: rotate(60deg); } /* Back curled */
                }
                @keyframes bucket-block {
                    0%, 15% { opacity: 0; }
                    16%, 40% { opacity: 1; }
                    41%, 100% { opacity: 0; }
                }
                /* Reuse the EXACT 8s timing that was confirmed working */
                @keyframes pile-block-sync {
                    0%, 39% { opacity: 0; transform: translateY(6px) scale(0.9); }
                    42% { opacity: 1; transform: translateY(-4px) scale(1.06); }
                    45% { opacity: 1; transform: translateY(1px) scale(0.97); }
                    48%, 98% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-2px) scale(0.92); }
                }
                /* Visibility gates — each block active during a different 8s window */
                @keyframes pile-gate-a {
                    0%     { visibility: visible; }
                    33.33% { visibility: hidden; }
                }
                @keyframes pile-gate-b {
                    0%     { visibility: hidden; }
                    33.33% { visibility: visible; }
                    66.66% { visibility: hidden; }
                }
                @keyframes pile-gate-c {
                    0%     { visibility: hidden; }
                    66.66% { visibility: visible; }
                }
                @keyframes track-roll {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -20; }
                }
                @keyframes spark {
                    0%, 100% { opacity: 0; transform: scale(0.5) translateY(0); }
                    50% { opacity: 1; transform: scale(1.2) translateY(-10px); }
                }
                @keyframes cloud-drift {
                     0% { transform: translateX(-100%); opacity: 0; }
                     20% { opacity: 0.5; }
                     80% { opacity: 0.5; }
                     100% { transform: translateX(200%); opacity: 0; }
                }
                @keyframes worker-carry-f2 {
                    0%   { left: 62%; transform: scaleX(1); }
                    45%      { left: 102%; transform: scaleX(1); }
                    50%      { left: 102%; transform: scaleX(-1); }
                    97%      { left: 62%; transform: scaleX(-1); }
                    100% { left: 62%; transform: scaleX(1); }
                }
                @keyframes worker-block-carry {
                    0%, 1%   { opacity: 0; }
                    1%, 44%  { opacity: 1; }
                    46%, 100% { opacity: 0; }
                }
                @keyframes worker-walk-leg-1 {
                    0%, 100% { transform: rotate(-20deg); }
                    50% { transform: rotate(20deg); }
                }
                @keyframes worker-walk-leg-2 {
                    0%, 100% { transform: rotate(20deg); }
                    50% { transform: rotate(-20deg); }
                }
                
                .hex-bg {
                    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 10v20L20 40 0 30V10z' fill='none' stroke='rgba(255,255,255,0.02)' stroke-width='1'/%3E%3C/svg%3E");
                    background-size: 40px 40px;
                    opacity: 0.6;
                }
            `}} />

            {/* Hexagon Background */}
            <div className="absolute inset-0 hex-bg"></div>

            {/* Glowing background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] max-w-full mix-blend-screen bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.1)_0%,transparent_60%)] blur-[60px] pointer-events-none z-0"></div>

            {/* Subdued text in background */}
            <div className="absolute top-8 right-8 text-white/20 font-mono text-[10px] sm:text-xs tracking-widest hidden sm:block uppercase z-10 text-right">
                {"// Feature 2 Data Excavation"}<br/>
                <span className="text-white/10 text-[9px]">Sys_Active</span>
            </div>

            {/* Ground line */}
            <div className="absolute bottom-[20%] w-[120%] -left-[10%] h-px bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10"></div>
            
            {/* Background CSS Barricades - Hidden per user request */}
            <div className="hidden absolute top-[35%] right-[25%] w-12 h-6 flex-col items-center opacity-30 z-20 blur-[1px] rotate-[10deg] scale-75 origin-bottom">
                <div className="w-full h-2 overflow-hidden rounded-[1px] z-10 flex bg-gradient-to-b from-[#1A1A1A] to-black border border-white/20">
                    <div className="w-[150%] h-full flex gap-2 -translate-x-3">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-full bg-[#FFB800] skew-x-[-25deg] flex-shrink-0"></div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between w-[80%] mt-[-0.5px] z-0">
                    <div className="w-0.5 h-4 bg-[#111]"></div>
                    <div className="w-0.5 h-4 bg-[#111]"></div>
                </div>
            </div>
                       {/* --- Scene Shifter (ROI Shortcut for Mobile) --- */}
            <div className="absolute inset-0 -translate-x-[18%] sm:translate-x-0 transition-transform duration-700 ease-in-out">
                {/* The Excavator Assembly */}
                <div className="absolute z-20 w-80 h-80 bottom-[20%] left-[25%] md:left-[22%] flex items-end justify-center">
                    
                    {/* Main Body (Cab + Engine outline) */}
                    <div className="absolute left-[30%] bottom-[12%] w-28 h-24 border-2 border-white/20 bg-[#161220] rounded-tl-xl rounded-br-lg rounded-tr-md z-30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                        {/* Window */}
                        <div className="absolute top-2 left-2 w-12 h-14 border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent rounded-tl-lg backdrop-blur text-[8px] p-1 uppercase text-white/30 font-mono">
                            <div className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                            
                            {/* Little stickman pilot in cabin */}
                            <div className="absolute bottom-1 right-2 w-3 h-5 flex flex-col items-center opacity-80 z-20">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mb-0.5 shadow-[0_0_2px_rgba(255,255,255,0.5)]"></div> {/* Hardhat */}
                                <div className="w-[1.5px] h-3 bg-white/80"></div> {/* Body */}
                                <div className="absolute top-2 -right-1.5 w-[1.5px] h-2 bg-white/80 origin-left rotate-45"></div> {/* Arm on controls */}
                            </div>
                        </div>
                        {/* Grill lines */}
                        <div className="absolute right-2 top-4 flex flex-col gap-1.5">
                            <div className="w-8 h-px bg-white/10"></div>
                            <div className="w-8 h-px bg-white/10"></div>
                            <div className="w-8 h-px bg-white/10"></div>
                            <div className="w-8 h-px bg-white/10"></div>
                        </div>
                    </div>

                    {/* Tracks (Chassis) */}
                    <div className="absolute left-[26%] bottom-0 w-40 h-10 border-2 border-white/30 bg-[#111] rounded-full z-20 flex items-center px-1 overflow-hidden shadow-2xl">
                        <svg width="100%" height="100%" className="opacity-40">
                            <rect x="0" y="2" width="100%" height="32" rx="16" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="6 4" style={{ animation: "track-roll 1.5s linear infinite" }} />
                        </svg>
                        {/* Track wheels */}
                        <div className="absolute left-2 w-6 h-6 rounded-full border border-white/20 bg-[#222]"></div>
                        <div className="absolute left-10 w-4 h-4 rounded-full border border-white/20 bg-[#222]"></div>
                        <div className="absolute left-16 w-4 h-4 rounded-full border border-white/20 bg-[#222]"></div>
                        <div className="absolute left-22 w-4 h-4 rounded-full border border-white/20 bg-[#222]"></div>
                        <div className="absolute right-2 w-6 h-6 rounded-full border border-white/20 bg-[#222]"></div>
                    </div>

                    {/* Arm Base / Pivot */}
                    <div className="absolute left-[52%] bottom-[17%] w-6 h-6 rounded-full border-2 border-white/20 bg-[#333] z-40"></div>

                    {/* Boom (First Arm Segment) */}
                    <div className="absolute left-[55%] bottom-[20%] w-4 p-1 z-30 origin-bottom flex justify-center" style={{ animation: "dig-arm-1 8s ease-in-out infinite" }}>
                        <div className="w-8 h-40 -mt-36 -ml-4 border-2 border-white/20 bg-gradient-to-t from-[#222] to-[#1A1A1A] rounded-t-xl rounded-b-md shadow-lg relative flex justify-center">
                            <div className="w-px h-full bg-white/5 mx-auto"></div>
                            {/* Connecting joint for Stick */}
                            <div className="absolute -top-3 left-1/2 -ml-3 w-6 h-6 rounded-full border-2 border-white/20 bg-[#333] z-40 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                            </div>

                            {/* Stick (Second Arm Segment) */}
                            <div className="absolute top-[2px] left-[5px] origin-top z-20" style={{ animation: "dig-arm-2 8s ease-in-out infinite" }}>
                                <div className="w-6 h-32 mt-1 border-2 border-white/20 bg-[#1A1A1A] rounded-b-lg flex justify-center py-2">
                                    <div className="w-px h-full bg-white/5"></div>
                                    
                                    {/* Connecting joint for Bucket */}
                                    <div className="absolute bottom-[-10px] left-1/2 -ml-2.5 w-5 h-5 rounded-full border-2 border-white/20 bg-[#333] z-40 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                                    </div>

                                    {/* Bucket */}
                                    <div className="absolute bottom-[-40px] left-1 origin-top-left flex z-10" style={{ animation: "dig-bucket 8s ease-in-out infinite" }}>
                                        <svg width="45" height="40" viewBox="0 0 45 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.5 5 C 10 30, 30 35, 40 25 L 42 20 L 35 18 L 36 12 L 30 14 L 30 5 L 2 5 Z" fill="#111" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinejoin="round" />
                                            <circle cx="5" cy="8" r="3" fill="#333" stroke="rgba(255,255,255,0.4)" />
                                        </svg>
                                        
                                        <div className="absolute top-3 left-8 w-6 h-6 border border-purple-500/50 bg-purple-500/20 rounded shadow-[0_0_15px_rgba(167,139,250,0.4)] backdrop-blur rotate-12 flex items-center justify-center" style={{ animation: "bucket-block 8s ease-in-out infinite" }}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drop zone pile — 3 blocks, each gated to its 8s window */}
                <div className="absolute bottom-[20%] left-[55%] md:left-[58%] z-10 -translate-y-1" style={{ width: '80px', height: '30px' }}>
                    {/* Static base clutter */}
                    <div className="absolute left-0 bottom-0 w-6 h-5 border border-white/15 bg-[#1a1520] rounded-[3px] rotate-[22deg] shadow-lg"></div>
                    <div className="absolute left-5 bottom-1 w-5 h-5 border border-purple-500/20 bg-purple-900/25 rounded-[2px] -rotate-6 shadow-[0_0_8px_rgba(167,139,250,0.1)]"></div>
                    <div className="absolute left-11 bottom-0 w-6 h-4 border border-white/12 bg-[#161220] rounded-[2px] rotate-[15deg] shadow-lg"></div>
                    <div className="absolute left-3 bottom-3 w-5 h-4 border border-indigo-400/15 bg-indigo-900/20 rounded-[2px] rotate-[35deg]"></div>
                    <div className="absolute -left-3 bottom-2 w-5 h-5 border border-white/10 bg-[#14101c] rounded-[2px] -rotate-[25deg] shadow-lg"></div>
                    <div className="absolute left-8 bottom-3 w-4 h-5 border border-purple-500/15 bg-purple-900/15 rounded-[2px] rotate-[42deg]"></div>
                    <div className="absolute left-15 bottom-0 w-5 h-4 border border-fuchsia-400/15 bg-fuchsia-900/15 rounded-[2px] -rotate-[10deg]"></div>
                    <div className="absolute left-1 bottom-5 w-4 h-3 border border-white/8 bg-[#161220] rounded-[2px] rotate-[55deg]"></div>

                    {/* Dynamic block A — purple (gated to window 1) */}
                    <div className="absolute left-0 -top-3 w-6 h-6 border border-purple-500/40 bg-purple-900/35 rounded-[2px] rotate-6 shadow-[0_0_12px_rgba(167,139,250,0.3)]" style={{ animation: "pile-block-sync 8s ease-in-out infinite, pile-gate-a 24s step-end infinite" }}></div>
                    {/* Dynamic block B — indigo (gated to window 2) */}
                    <div className="absolute left-6 -top-2 w-5 h-5 border border-indigo-400/40 bg-indigo-900/35 rounded-[2px] -rotate-12 shadow-[0_0_10px_rgba(129,140,248,0.3)]" style={{ animation: "pile-block-sync 8s ease-in-out infinite, pile-gate-b 24s step-end infinite" }}></div>
                    {/* Dynamic block C — fuchsia (gated to window 3) */}
                    <div className="absolute left-12 -top-3 w-6 h-5 border border-fuchsia-400/40 bg-fuchsia-900/30 rounded-[2px] rotate-[18deg] shadow-[0_0_10px_rgba(232,121,249,0.3)]" style={{ animation: "pile-block-sync 8s ease-in-out infinite, pile-gate-c 24s step-end infinite" }}></div>
                </div>

                {/* Excavation Debris Pile */}
                <div className="absolute bottom-[20%] -left-[2%] md:left-[5%] w-48 h-16 bg-gradient-to-t from-[#0e0e0e] to-[#161616] rounded-t-full rounded-b-sm border-t border-white/10 flex items-center justify-center z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    {/* Synthetic dirt/data rocks */}
                    <div className="absolute -top-1 left-[20%] w-6 h-6 border border-white/20 bg-[#222] rotate-12 rounded-[3px] shadow-lg"></div>
                    <div className="absolute -top-3 left-[40%] w-8 h-8 border border-purple-500/30 bg-purple-900/40 rotate-[35deg] rounded shadow-[0_0_20px_rgba(167,139,250,0.2)]"></div>
                    <div className="absolute top-1 right-[25%] w-5 h-5 border border-white/10 bg-[#111] -rotate-12 rounded-[2px]"></div>
                    <div className="absolute -top-4 right-[40%] w-4 h-4 border border-indigo-400/20 bg-indigo-900/30 rotate-45 rounded"></div>
                </div>

                {/* Workers running around */}
                {[0, 8, 16].map((delay, idx) => (
                    <div key={idx} className="absolute bottom-[20%] w-6 h-10 flex flex-col items-center origin-bottom z-30" style={{ left: '55%', animation: `worker-carry-f2 24s linear infinite -${delay}s` }}>
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full mb-0.5 shadow-[0_0_3px_rgba(255,255,255,0.5)] z-10"></div> {/* Hardhat */}
                        <div className="w-2 h-3 bg-orange-500 rounded-[2px] mb-[-4px] z-0"></div> {/* Safety vest */}
                        
                        {/* Block being carried */}
                        <div className="absolute top-1 left-[6px] w-6 h-4 border border-fuchsia-500/50 bg-fuchsia-900/40 rounded-[2px] shadow-[0_0_10px_rgba(217,70,239,0.2)] z-20 flex justify-center items-center" style={{ animation: `worker-block-carry 24s linear infinite -${delay}s` }}>
                        </div>
                        
                        {/* Arms holding block */}
                        <div className="absolute top-[12px] left-1/2 w-[1.5px] h-3 bg-white/80 origin-top rotate-[-45deg] z-10"></div>
                        
                        {/* Walking Legs */}
                        <div className="absolute bottom-0 left-1/2 -ml-[1px] w-[1.5px] h-4 bg-white/80 origin-top" style={{ animation: "worker-walk-leg-1 0.6s infinite alternate" }}></div>
                        <div className="absolute bottom-0 left-1/2 -ml-[1px] w-[1.5px] h-4 bg-white/80 origin-top" style={{ animation: "worker-walk-leg-2 0.6s infinite alternate" }}></div>
                    </div>
                ))}
            </div>

            {/* Concrete Barrier 1 - Hidden per user request */}
            <div className="hidden absolute bottom-[12%] right-[10%] sm:right-[15%] w-28 h-12 border-t border-l border-[#444] bg-gradient-to-b from-[#252525] to-[#121212] rounded-tl-md z-30 flex-col justify-start overflow-hidden shadow-[-10px_10px_20px_rgba(0,0,0,0.6)] rotate-[4deg]">
                <div className="w-[150%] h-2.5 mt-2 bg-[repeating-linear-gradient(-45deg,#000,#000_8px,#ffb800_8px,#ffb800_16px)] opacity-90 ml-2"></div>
            </div>

            {/* Left side CSS barricade - Hidden per user request */}
            <div className="hidden absolute bottom-[25%] left-[12%] w-16 h-8 flex-col items-center opacity-60 z-20 rotate-[-5deg] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] scale-75 origin-bottom">
                <div className="w-full h-2.5 overflow-hidden rounded-[1px] z-10 flex bg-gradient-to-b from-[#1A1A1A] to-black border border-white/20">
                    <div className="w-[150%] h-full flex gap-2.5 -translate-x-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="w-2 h-full bg-[#FFB800] skew-x-[-25deg] flex-shrink-0"></div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between w-[80%] mt-[-0.5px] z-0">
                    <div className="w-1 h-6 bg-[#111] border-x border-white/5"></div>
                    <div className="w-1 h-6 bg-[#111] border-x border-white/5"></div>
                </div>
            </div>

            {/* Small floating rocks / data blocks in the ground */}
            <div className="absolute bottom-[5%] w-[80%] left-[10%] h-20 pointer-events-none z-10 opacity-40">
                <div className="absolute left-[20%] top-4 w-4 h-4 border border-white/20 rounded bg-white/5 rotate-12"></div>
                <div className="absolute left-[45%] top-10 w-6 h-3 border border-white/20 rounded-sm bg-white/5 -rotate-6"></div>
                <div className="absolute left-[70%] top-2 w-5 h-5 border border-purple-500/30 rounded bg-purple-500/10 rotate-45 flex justify-center items-center shadow-[0_0_10px_rgba(167,139,250,0.2)]">
                    <div className="w-2 h-px bg-purple-300/50"></div>
                </div>
            </div>

            {/* Sci-Fi Tape Overlay Top Left */}
            <div className="absolute top-6 -left-16 w-[14rem] md:top-12 lg:top-18 md:-left-20 lg:-left-24 md:w-[22rem] lg:w-[28rem] -rotate-45 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden bg-purple-600 border-y border-white/20">
                <div className="flex whitespace-nowrap text-white font-black text-[7px] md:text-[10px] lg:text-[12px] tracking-[0.2em] py-1 md:py-1.5 opacity-90 w-max" style={{ animation: 'marquee 6s linear infinite' }}>
                    <span className="pr-4">UPDATING ARCHITECTURE 🏗️ WORK IN PROGRESS 🏗️</span>
                    <span className="pr-4">UPDATING ARCHITECTURE 🏗️ WORK IN PROGRESS 🏗️</span>
                </div>
            </div>
            
            {/* Construction tape overlay Bottom Right */}
            <div className="absolute bottom-10 -right-24 w-[14rem] md:bottom-16 lg:bottom-22 md:-right-32 lg:-right-40 md:w-[22rem] lg:w-[32rem] -rotate-45 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden bg-[#FFB800] border-y border-[#E5A600]">
                <div className="flex whitespace-nowrap text-black font-black text-[7px] md:text-[10px] lg:text-[12px] tracking-[0.2em] py-1 md:py-1.5 opacity-90 w-max" style={{ animation: 'marquee 8s linear infinite' }}>
                    <span className="pr-4">HEAVY MACHINERY AREA 🚧 CAUTION 🚧</span>
                    <span className="pr-4">HEAVY MACHINERY AREA 🚧 CAUTION 🚧</span>
                </div>
            </div>
        </div>
    );
}
