
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    {/* Robot Head Body */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7] via-[#6366F1] to-[#3B82F6] rounded-[30%] shadow-lg overflow-hidden">
      {/* Glossy overlay */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
    </div>

    {/* Ears */}
    <div className="absolute -left-1 w-2 h-4 bg-[#A855F7] rounded-full" />
    <div className="absolute -right-1 w-2 h-4 bg-[#3B82F6] rounded-full" />

    {/* Face Area */}
    <div className="z-10 bg-white w-[75%] h-[60%] rounded-[25%] flex flex-col items-center justify-center gap-1.5 p-1">
      <div className="flex gap-3">
        <div className="w-2 h-4 bg-slate-900 rounded-full" />
        <div className="w-2 h-4 bg-slate-900 rounded-full" />
      </div>
      <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
        <path d="M4 2C4 2 8 6 12 6C16 6 20 2 20 2" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>

    {/* Antenna & Lightning Bolt */}
    <div className="absolute -top-6 flex flex-col items-center">
      <div className="w-1 h-3 bg-slate-800" />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#22D3EE" />
      </svg>
    </div>
  </div>
);
