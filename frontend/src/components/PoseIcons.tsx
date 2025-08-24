import React from 'react';

interface PoseIconProps {
  pose: 'Straight-on' | 'Side' | 'Angled';
  isActive: boolean;
  onClick: () => void;
}

export const PoseIcon: React.FC<PoseIconProps> = ({ pose, isActive, onClick }) => {
  const getIcon = () => {
    switch (pose) {
      case 'Straight-on':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Face outline - front view */}
            <ellipse cx="50" cy="50" rx="25" ry="30" fill="#f3f4f6" stroke="#374151" strokeWidth="2"/>
            {/* Eyes - symmetrical */}
            <circle cx="42" cy="43" r="2" fill="#374151"/>
            <circle cx="58" cy="43" r="2" fill="#374151"/>
            {/* Nose - centered */}
            <ellipse cx="50" cy="50" rx="2" ry="4" fill="#d1d5db"/>
            {/* Mouth - centered */}
            <path d="M45 57 Q50 60 55 57" stroke="#374151" strokeWidth="1.5" fill="none"/>
            {/* Hair - symmetrical */}
            <path d="M25 40 Q25 25 50 25 Q75 25 75 40 L75 45 Q70 30 50 30 Q30 30 25 45 Z" fill="#2563eb"/>
            {/* Eyebrows - symmetrical */}
            <path d="M38 38 L46 38" stroke="#374151" strokeWidth="1.5"/>
            <path d="M54 38 L62 38" stroke="#374151" strokeWidth="1.5"/>
          </svg>
        );
      case 'Side':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Face outline - profile view */}
            <path d="M30 35 Q30 25 40 25 Q60 25 70 35 Q75 45 70 55 Q65 65 55 70 Q45 65 40 55 Q35 45 30 35 Z" fill="#f3f4f6" stroke="#374151" strokeWidth="2"/>
            {/* Eye - single visible */}
            <circle cx="55" cy="43" r="2" fill="#374151"/>
            {/* Nose - profile */}
            <path d="M65 45 L68 50 L65 55" stroke="#374151" strokeWidth="1.5" fill="none"/>
            {/* Mouth - profile */}
            <path d="M60 57 Q65 59 68 57" stroke="#374151" strokeWidth="1.5" fill="none"/>
            {/* Hair - side view */}
            <path d="M30 35 Q25 20 45 20 Q65 20 70 35 L70 40 Q65 25 45 25 Q35 25 30 40 Z" fill="#2563eb"/>
            {/* Eyebrow - single visible */}
            <path d="M52 38 L58 38" stroke="#374151" strokeWidth="1.5"/>
          </svg>
        );
      case 'Angled':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Face outline - three-quarter view */}
            <ellipse cx="52" cy="50" rx="22" ry="28" fill="#f3f4f6" stroke="#374151" strokeWidth="2" transform="rotate(15 52 50)"/>
            {/* Eyes - asymmetrical perspective */}
            <circle cx="45" cy="43" r="1.5" fill="#374151"/>
            <circle cx="58" cy="45" r="2" fill="#374151"/>
            {/* Nose - angled */}
            <path d="M52 48 L50 52 L54 53" fill="#d1d5db"/>
            {/* Mouth - angled */}
            <path d="M47 58 Q52 61 57 58" stroke="#374151" strokeWidth="1.5" fill="none"/>
            {/* Hair - angled view */}
            <path d="M30 38 Q28 23 48 23 Q68 23 72 38 L72 43 Q67 28 48 28 Q33 28 30 43 Z" fill="#2563eb"/>
            {/* Eyebrows - asymmetrical */}
            <path d="M42 38 L48 38" stroke="#374151" strokeWidth="1.5"/>
            <path d="M55 40 L61 40" stroke="#374151" strokeWidth="1.5"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-16 h-16 rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-lg 
        ${isActive 
          ? 'border-blue-400 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(147,197,253,0.18))] shadow-[0_10px_25px_-5px_rgba(59,130,246,0.28)]' 
          : 'border-transparent bg-white/70 shadow-md'}`}
    >
      <div className="w-8 h-8">
        {getIcon()}
      </div>
      <span className={`text-[0.625rem] font-semibold text-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
        {pose}
      </span>
    </button>
  );
};
