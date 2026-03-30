"use client";
import React, { useEffect, useState } from "react";

type F1ConstructionProps = Readonly<{
    isAnimated?: boolean;
}>;

export default function F1Construction({ isAnimated = true }: F1ConstructionProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div
            className="f1-construction-scene relative w-full h-[300px] md:h-[500px] lg:h-[700px] overflow-hidden bg-[#0A0A0A] flex items-center justify-center font-sans"
            data-animated={isAnimated}
        >
            <style dangerouslySetInnerHTML={{__html: `
                .f1-construction-scene[data-animated="false"] *,
                .f1-construction-scene[data-animated="false"] *::before,
                .f1-construction-scene[data-animated="false"] *::after {
                    animation-play-state: paused !important;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes crane-arm-swing {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(15deg); }
                }
                @keyframes hook-lower {
                    0%, 100% { transform: translateY(0); }
                    25% { transform: translateY(40px); }
                    75% { transform: translateY(-20px); }
                }
                @keyframes block-glow {
                    0%, 100% { box-shadow: 0 0 10px rgba(124, 58, 237, 0.4); }
                    50% { box-shadow: 0 0 25px rgba(167, 139, 250, 0.8); }
                }
                @keyframes cloud-drift {
                     0% { transform: translateX(-100%); opacity: 0; }
                     20% { opacity: 0.5; }
                     80% { opacity: 0.5; }
                     100% { transform: translateX(200%); opacity: 0; }
                }
                @keyframes flash-beacon {
                    0%, 100% { opacity: 0.2; box-shadow: 0 0 0px rgba(255, 184, 0, 0); }
                    50% { opacity: 1; box-shadow: 0 0 20px rgba(255, 184, 0, 0.8); }
                }
                @keyframes worker-carry-f1 {
                    0% { transform: translateX(80px); }
                    49% { transform: translateX(550px); }
                    50% { transform: translateX(550px) scaleX(-1); }
                    99% { transform: translateX(80px) scaleX(-1); }
                    100% { transform: translateX(80px); }
                }
                @keyframes worker-walk-leg-1 {
                    0%, 100% { transform: rotate(-20deg); }
                    50% { transform: rotate(20deg); }
                }
                @keyframes worker-walk-leg-2 {
                    0%, 100% { transform: rotate(20deg); }
                    50% { transform: rotate(-20deg); }
                }
                @keyframes worker-walk-arm {
                    0%, 100% { transform: rotate(15deg); }
                    50% { transform: rotate(-15deg); }
                }
                @keyframes worker-direct {
                    0%, 100% { transform: rotate(-50deg); }
                    50% { transform: rotate(-95deg); }
                }
                @keyframes worker-dangle {
                    0%, 100% { transform: rotate(10deg); }
                    50% { transform: rotate(-10deg); }
                }
                @keyframes leg-flail-1 {
                    0%, 100% { transform: rotate(10deg); }
                    50% { transform: rotate(40deg); }
                }
                @keyframes leg-flail-2 {
                    0%, 100% { transform: rotate(-10deg); }
                    50% { transform: rotate(-40deg); }
                }
                @keyframes arm-flail {
                    0%, 100% { transform: rotate(15deg); }
                    50% { transform: rotate(-45deg); }
                }
                
                .bg-grid {
                    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 32px 32px;
                }
            `}} />
            
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid"></div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>

            {/* Clouds / Dust passing by */}
            {mounted && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-0 w-64 h-16 bg-white/5 blur-2xl rounded-full" style={{ animation: "cloud-drift 20s linear infinite" }}></div>
                    <div className="absolute bottom-1/4 left-0 w-96 h-24 bg-purple-500/5 blur-3xl rounded-full" style={{ animation: "cloud-drift 25s linear infinite reverse" }}></div>
                </div>
            )}

            {/* Subdued text in background */}
            <div className="absolute top-8 left-8 text-white/20 font-mono text-[10px] sm:text-xs tracking-widest hidden sm:block uppercase">
                {"// Feature 1 Structural Assembly"}
            </div>

            {/* --- Scenery: Ground & Structural Layers --- */}

            {/* Foreground Ground Line */}
            <div className="absolute bottom-[24px] w-[120%] -left-[10%] h-px bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10"></div>
            {/* Sub-floor structural data lines */}
            <div className="absolute bottom-[10px] w-full h-px bg-purple-500/20 z-0"></div>
            <div className="absolute bottom-[2px] w-full h-px bg-purple-500/10 z-0"></div>

            {/* Background Scenery: Warning Light / Beacon */}
            <div className="absolute top-[20%] right-[15%] flex flex-col items-center opacity-60 pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-[#ffb800] blur-md" style={{ animation: "flash-beacon 2s infinite" }}></div>
                <div className="w-1 h-32 bg-gradient-to-b from-white/10 to-transparent"></div>
            </div>

            {/* --- Scene Shifter (ROI Shortcut for Mobile) --- */}
            <div className="absolute inset-0 -translate-x-[25%] sm:translate-x-0 flex items-center justify-center transition-transform duration-700 ease-in-out">
                {/* Centerpiece: Sleek Minimalist Crane */}
                <div className="relative z-10 w-full max-w-sm aspect-square flex items-end justify-center pb-20 sm:pb-32">
                    
                    {/* The Crane Structure */}
                    <div className="relative w-[280px] h-[340px] flex items-end justify-center">
                        
                        {/* Mast / Tower */}
                        <div className="absolute bottom-0 w-8 h-[240px] border-x border-t border-white/20 bg-gradient-to-t from-black to-[#1A1A1A] flex flex-col justify-end overflow-hidden z-20">
                            {/* Lattice pattern approximation */}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="w-full h-px bg-white/10 my-[8px]"></div>
                            ))}
                            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.05)_49%,rgba(255,255,255,0.05)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
                            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(-45deg,transparent_48%,rgba(255,255,255,0.05)_49%,rgba(255,255,255,0.05)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
                        </div>

                        {/* Operator Cabin */}
                        <div className="absolute bottom-[200px] left-[50%] ml-4 w-10 h-12 border border-white/20 bg-[#111] rounded-tr-xl z-30 shadow-[0_0_15px_rgba(124,58,237,0.15)] flex items-center justify-center">
                            <div className="w-6 h-6 border border-white/10 bg-purple-900/30 rounded-sm"></div>
                            
                            {/* Little stickman in cabin */}
                            <div className="absolute bottom-1 right-2 w-3 h-5 flex flex-col items-center opacity-80">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mb-0.5 shadow-[0_0_2px_rgba(255,255,255,0.5)]"></div> {/* Hardhat */}
                                <div className="w-[1.5px] h-2 bg-white/80"></div> {/* Body */}
                            </div>
                        </div>

                        {/* Crane Arm (Jib) - animates pivoting slightly */}
                        <div className="absolute bottom-[230px] left-[50%] -ml-4 w-[240px] h-0 z-30 flex items-start origin-left" style={{ animation: "crane-arm-swing 6s ease-in-out infinite" }}>
                            
                            {/* Main Arm Lattice */}
                            <div className="relative w-full h-6 border-y border-r border-white/20 bg-[#1A1A1A] overflow-hidden rounded-r-sm">
                                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.05)_49%,rgba(255,255,255,0.05)_51%,transparent_52%)] bg-[length:16px_16px]"></div>
                                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(-45deg,transparent_48%,rgba(255,255,255,0.05)_49%,rgba(255,255,255,0.05)_51%,transparent_52%)] bg-[length:16px_16px]"></div>
                            </div>

                            {/* Counter-jib (back part) */}
                            <div className="absolute top-0 right-full w-24 h-6 border-y border-l border-white/20 bg-[#151515] rounded-l-sm">
                                {/* Counter-weight block */}
                                <div className="absolute -bottom-6 right-2 w-16 h-12 bg-[#222] border border-white/10 flex flex-col items-center justify-center gap-1 shadow-lg">
                                    <span className="text-[8px] text-white/30 font-mono">10t</span>
                                    <span className="text-[8px] text-white/30 font-mono">10t</span>
                                </div>
                            </div>

                            {/* Trolley and Hook Assembly - animates moving up/down slightly */}
                            <div className="absolute top-6 right-8 flex flex-col items-center" style={{ animation: "hook-lower 8s ease-in-out infinite" }}>
                                {/* Cable */}
                                <div className="w-px h-24 bg-white/30"></div>
                                {/* Hook Block */}
                                <div className="w-4 h-6 bg-[#333] border border-white/20 rounded-sm relative">
                                    <div className="absolute -bottom-3 left-1/2 -ml-1.5 w-3 h-4 border-2 border-t-0 border-white/40 rounded-b-full"></div>
                                </div>
                                
                                {/* The UI module being hoisted */}
                                <div className="absolute top-[110px] w-28 h-12 bg-[#1A1425] border border-purple-500/30 rounded-md backdrop-blur-md flex items-center justify-center -translate-x-1/2" style={{ animation: "block-glow 4s infinite" }}>
                                    <div className="flex gap-2 items-center opacity-80">
                                        <div className="w-6 h-6 rounded border border-purple-400/50 bg-purple-500/20 flex items-center justify-center text-[10px]">🎣</div>
                                        <div className="flex flex-col gap-1">
                                            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                                            <div className="w-8 h-1 bg-white/10 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stickman holding on for dear life at the tip of the crane */}
                            <div className="absolute top-[28px] right-[-14px] w-4 h-12 flex flex-col items-center origin-top-left rotate-12 z-40" style={{ animation: "worker-dangle 3s ease-in-out infinite" }}>
                                
                                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full mb-0.5 shadow-[0_0_3px_rgba(255,255,255,0.5)] z-10 relative"></div> {/* Hardhat */}
                                <div className="w-2 h-3 bg-orange-500 rounded-[2px] mb-[-4px] z-10 relative"></div> {/* Safety vest */}
                                
                                {/* Hand grabbing the lattice arm */}
                                <div className="w-[1.5px] h-5 bg-white/80 absolute top-[12px] left-1/2 -ml-[2px] origin-top rotate-[150deg] z-0"></div>
                                
                                {/* Panic arm flailing */}
                                <div className="w-[1.5px] h-4 bg-white/80 absolute top-[12px] left-1/2 ml-[1px] origin-top rotate-[-100deg] z-0" style={{ animation: "arm-flail 0.3s infinite alternate" }}></div>
                                
                                {/* Dangling legs */}
                                <div className="absolute top-[24px] left-1/2 -ml-[2px] w-[1.5px] h-4 bg-white/80 origin-top rotate-[15deg]" style={{ animation: "leg-flail-1 0.4s infinite alternate" }}></div>
                                <div className="absolute top-[24px] left-1/2  ml-[1px] w-[1.5px] h-4 bg-white/80 origin-top rotate-[-10deg]" style={{ animation: "leg-flail-2 0.5s infinite alternate" }}></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Foundation base */}
                    <div className="absolute bottom-[4.5rem] w-64 h-8 bg-[#111] border-t border-white/10 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10">
                        <div className="w-1/2 h-1 bg-[#ffb800]/20 rounded-full"></div>

                        {/* Crane base pillars connecting to Ground Floor */}
                        <div className="absolute -bottom-[2.5rem] left-8 w-6 h-[2.5rem] bg-[#0a0a0a] border-x border-white/10 flex flex-col justify-evenly">
                            <div className="w-full h-px bg-white/5 mt-1 rotate-45"></div>
                            <div className="w-full h-px bg-white/5 -mb-1 -rotate-45"></div>
                        </div>
                        <div className="absolute -bottom-[2.5rem] right-8 w-6 h-[2.5rem] bg-[#0a0a0a] border-x border-white/10 flex flex-col justify-evenly">
                            <div className="w-full h-px bg-white/5 mt-1 rotate-45"></div>
                            <div className="w-full h-px bg-white/5 -mb-1 -rotate-45"></div>
                        </div>

                        {/* Ground level 'Foreman' Stickman giving directions */}
                        <div className="absolute bottom-8 right-16 w-4 h-10 flex flex-col items-center origin-bottom scale-90 -scale-x-100 opacity-90">
                            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full mb-0.5 shadow-[0_0_3px_rgba(255,255,255,0.5)] z-10 block"></div> {/* Hardhat */}
                            <div className="w-2 h-2.5 bg-orange-500 rounded-[2px] mb-[1px] z-0 block"></div> {/* Safety vest */}
                            {/* Arms directing the crane - container is -scale-x-100 so rotations are visually inverted */}
                            <div className="absolute top-[11px] left-1/2 -ml-[3px] w-[1.5px] h-4 bg-white/80 origin-top rotate-[-130deg]" style={{ animation: "worker-direct 3s ease-in-out infinite" }}></div>
                            <div className="absolute top-[11px] left-1/2 ml-[1.5px] w-[1.5px] h-4 bg-white/80 origin-top rotate-[-25deg]" ></div>
                            {/* Legs planted */}
                            <div className="absolute bottom-0 left-1/2 -ml-[4px] w-[1.5px] h-4 bg-white/80 origin-top rotate-[20deg]"></div>
                            <div className="absolute bottom-0 left-1/2 ml-[2px] w-[1.5px] h-4 bg-white/80 origin-top rotate-[-15deg]"></div>
                        </div>
                    </div>
                </div>

                {/* Walking Stickman Carrying a Block (Ground Floor) */}
                <div className="absolute bottom-[24px] left-[15%] w-6 h-10 flex flex-col items-center origin-bottom z-30" style={{ animation: "worker-carry-f1 20s linear infinite" }}>
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full mb-0.5 shadow-[0_0_3px_rgba(255,255,255,0.5)] z-10"></div> {/* Hardhat */}
                    <div className="w-2 h-3 bg-orange-500 rounded-[2px] mb-[-4px] z-0"></div> {/* Safety vest */}
                    
                    {/* Block being carried */}
                    <div className="absolute top-1 left-[6px] w-6 h-4 border border-purple-500/50 bg-purple-900/40 rounded-[2px] shadow-[0_0_10px_rgba(167,139,250,0.2)] z-20 flex justify-center items-center">
                        <div className="w-3 h-0.5 bg-purple-300/50"></div>
                    </div>
                    
                    {/* Arms holding block */}
                    <div className="absolute top-[12px] left-1/2 w-[1.5px] h-3 bg-white/80 origin-top rotate-[-45deg] z-10"></div>
                    
                    {/* Walking Legs */}
                    <div className="absolute bottom-0 left-1/2 -ml-[1px] w-[1.5px] h-4 bg-white/80 origin-top" style={{ animation: "worker-walk-leg-1 0.6s infinite alternate" }}></div>
                    <div className="absolute bottom-0 left-1/2 -ml-[1px] w-[1.5px] h-4 bg-white/80 origin-top" style={{ animation: "worker-walk-leg-2 0.6s infinite alternate" }}></div>
                </div>
                
                {/* Movable CSS Barricade sitting on ground floor */}
                {/* ADJUST POSITION HERE: change `left-[30%]` or `right-[...]` to move it horizontally */}
                <div className="absolute bottom-[24px] left-[15%] w-20 h-10 flex flex-col items-center z-20 drop-shadow-[0_8px_15px_rgba(0,0,0,0.8)] scale-80 origin-bottom">
                    <div className="w-full h-3 overflow-hidden rounded-[1px] z-10 flex bg-gradient-to-b from-[#1A1A1A] to-black border border-white/20">
                        <div className="w-[150%] h-full flex gap-3 -translate-x-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="w-2.5 h-full bg-[#ff5500] skew-x-[-25deg] flex-shrink-0"></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between w-[80%] mt-[-0.5px] z-0">
                        <div className="w-1 h-6 bg-[#111] border-x border-white/10"></div>
                        <div className="w-1 h-6 bg-[#111] border-x border-white/10"></div>
                    </div>
                </div>

                {/* Traffic cones standing on ground floor */}
                <div className="absolute bottom-[24px] right-12 sm:right-24 flex gap-6 z-20 scale-90">
                    <div className="relative w-5 h-8">
                        <div className="absolute bottom-0 w-7 -ml-1 h-1 bg-[#d04500] rounded-full"></div>
                        <div className="absolute bottom-0.5 w-5 h-8 bg-[#ff5500] rounded-t-[2px]" style={{ clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)' }}></div>
                        <div className="absolute bottom-2.5 w-[1.1rem] ml-[1px] h-2 bg-white/90" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }}></div>
                    </div>
                    <div className="relative w-5 h-8 opacity-80">
                        <div className="absolute bottom-0 w-7 -ml-1 h-1 bg-[#d04500] rounded-full"></div>
                        <div className="absolute bottom-0.5 w-5 h-8 bg-[#ff5500] rounded-t-[2px]" style={{ clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)' }}></div>
                        <div className="absolute bottom-2.5 w-[1.1rem] ml-[1px] h-2 bg-white/90" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }}></div>
                    </div>
                </div>
            </div>

            {/* Construction Tape Corner - Top Right */}
            <div className="absolute top-8 -right-16 w-[14rem] md:top-10 lg:top-18 md:-right-24 lg:-right-32 md:w-80 lg:w-[28rem] rotate-45 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden bg-[#FFB800] border-y border-[#E5A600]">
                <div className="flex whitespace-nowrap text-black font-black text-[7px] md:text-[11px] lg:text-[13px] tracking-[0.2em] py-1 md:py-1.5 opacity-90 w-max" style={{ animation: 'marquee 6s linear infinite' }}>
                    <span className="pr-4">UNDER CONSTRUCTION 🚧 UNDER CONSTRUCTION 🚧 UNDER CONSTRUCTION 🚧</span>
                    <span className="pr-4">UNDER CONSTRUCTION 🚧 UNDER CONSTRUCTION 🚧 UNDER CONSTRUCTION 🚧</span>
                </div>
            </div>
            
            {/* Construction Tape Corner - Bottom Left */}
            <div className="absolute bottom-6 -left-16 w-[14rem] md:bottom-10 lg:bottom-18 md:-left-28 lg:-left-36 md:w-[22rem] lg:w-[30rem] rotate-45 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden bg-purple-600 border-y border-purple-400/50">
                <div className="flex whitespace-nowrap text-white font-black text-[7px] md:text-[10px] lg:text-[12px] tracking-[0.2em] py-1 md:py-1.5 opacity-90 w-max" style={{ animation: 'marquee 8s linear infinite reverse' }}>
                    <span className="pr-4">ASSEMBLING SCENE 🏗️ ASSEMBLING SCENE 🏗️ ASSEMBLING SCENE 🏗️</span>
                    <span className="pr-4">ASSEMBLING SCENE 🏗️ ASSEMBLING SCENE 🏗️ ASSEMBLING SCENE 🏗️</span>
                </div>
            </div>
        </div>
    );
}
