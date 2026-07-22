'use client';

import { useState, useEffect } from 'react';

export function ForgeLoader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'lines' | 'spark' | 'done'>('lines');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('spark'), 800);
    const t2 = setTimeout(() => setPhase('done'), 1200);
    const t3 = setTimeout(() => onComplete(), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#111111] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Logo text */}
        <div className="font-display text-2xl font-bold tracking-widest text-[#111111] dark:text-white opacity-0 animate-fade-in">
          <span className="text-[#F9733E]">TWIN</span>
          <span className="mx-2">·</span>
          <span>FORGE</span>
        </div>

        {/* Two lines converging */}
        <div className="relative w-48 h-8 flex flex-col gap-2 justify-center items-center overflow-hidden">
          <div
            className="w-full h-[2px] bg-[#F9733E] rounded-full"
            style={{
              animation: 'forgeLineLeft 1.2s ease-in-out forwards',
              transformOrigin: 'left center',
            }}
          />
          <div
            className="w-full h-[2px] bg-[#F9733E] rounded-full"
            style={{
              animation: 'forgeLineRight 1.2s ease-in-out forwards',
              transformOrigin: 'right center',
              animationDelay: '0.05s',
            }}
          />
          {/* Spark at convergence */}
          {phase === 'spark' && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#F9733E] forge-spark" />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes forgeLineLeft {
          0% { transform: scaleX(0); opacity: 0; }
          20% { opacity: 1; }
          60% { transform: scaleX(1); }
          100% { transform: scaleX(0.5); }
        }
        @keyframes forgeLineRight {
          0% { transform: scaleX(0); opacity: 0; }
          20% { opacity: 1; }
          60% { transform: scaleX(1); }
          100% { transform: scaleX(0.5); }
        }
      `}</style>
    </div>
  );
}
