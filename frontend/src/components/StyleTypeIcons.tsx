import React from 'react';

interface StyleTypeIconProps {
  type: 'Masculine' | 'Feminine' | 'Unisex';
  isActive: boolean;
  onClick: () => void;
}

export const StyleTypeIcon: React.FC<StyleTypeIconProps> = ({ type, isActive, onClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'Masculine':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Face outline */}
            <ellipse cx="50" cy="45" rx="25" ry="30" fill="#f3f4f6" stroke="#374151" strokeWidth="2"/>
            {/* Eyes */}
            <circle cx="42" cy="38" r="2" fill="#374151"/>
            <circle cx="58" cy="38" r="2" fill="#374151"/>
            {/* Nose */}
            <path d="M50 42 L48 48 L52 48 Z" fill="#d1d5db"/>
            {/* Mouth */}
            <path d="M45 52 Q50 55 55 52" stroke="#374151" strokeWidth="1.5" fill="none"/>
            {/* Short hair */}
            <path d="M25 35 Q25 20 50 20 Q75 20 75 35 L75 40 Q70 25 50 25 Q30 25 25 40 Z" fill="#8b5cf6"/>
            {/* Eyebrows */}
            <path d="M38 33 L46 33" stroke="#374151" strokeWidth="2"/>
            <path d="M54 33 L62 33" stroke="#374151" strokeWidth="2"/>
          </svg>
        );
      case 'Feminine':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Face outline */}
            <ellipse cx="50" cy="45" rx="25" ry="30" fill="#f3f4f6" stroke="#374151" strokeWidth="2"/>
            {/* Eyes */}
            <circle cx="42" cy="38" r="2" fill="#374151"/>
            <circle cx="58" cy="38" r="2" fill="#374151"/>
            {/* Eyelashes */}
            <path d="M40 35 L40 33" stroke="#374151" strokeWidth="1"/>
            <path d="M44 35 L44 33" stroke="#374151" strokeWidth="1"/>
            <path d="M56 35 L56 33" stroke="#374151" strokeWidth="1"/>
            <path d="M60 35 L60 33" stroke="#374151" strokeWidth="1"/>
            {/* Nose */}
            <path d="M50 42 L48 48 L52 48 Z" fill="#d1d5db"/>
            {/* Lips */}
            <path d="M45 52 Q50 56 55 52" stroke="#ec4899" strokeWidth="2" fill="none"/>
            {/* Long hair */}
            <path d="M25 35 Q25 15 50 15 Q75 15 75 35 L75 75 Q70 70 65 75 L60 70 Q55 75 50 70 Q45 75 40 70 L35 75 Q30 70 25 75 Z" fill="#8b5cf6"/>
            {/* Curved eyebrows */}
            <path d="M38 33 Q42 31 46 33" stroke="#374151" strokeWidth="1.5" fill="none"/>
            <path d="M54 33 Q58 31 62 33" stroke="#374151" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case 'Unisex':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Face outline */}
            <ellipse cx="50" cy="45" rx="25" ry="30" fill="#f3f4f6" stroke="#374151" strokeWidth="2"/>
            {/* Eyes */}
            <circle cx="42" cy="38" r="2" fill="#374151"/>
            <circle cx="58" cy="38" r="2" fill="#374151"/>
            {/* Nose */}
            <path d="M50 42 L48 48 L52 48 Z" fill="#d1d5db"/>
            {/* Mouth */}
            <path d="M45 52 Q50 54 55 52" stroke="#374151" strokeWidth="1.5" fill="none"/>
            {/* Medium length hair */}
            <path d="M25 35 Q25 18 50 18 Q75 18 75 35 L75 55 Q70 50 65 55 Q60 50 50 50 Q40 50 35 55 Q30 50 25 55 Z" fill="#8b5cf6"/>
            {/* Neutral eyebrows */}
            <path d="M38 33 L46 33" stroke="#374151" strokeWidth="1.5"/>
            <path d="M54 33 L62 33" stroke="#374151" strokeWidth="1.5"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        width: '4rem',
        height: '4rem',
        borderRadius: '0.75rem',
        border: isActive ? '2px solid #8b5cf6' : '2px solid transparent',
        background: isActive 
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))'
          : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        boxShadow: isActive 
          ? '0 10px 25px -5px rgba(139, 92, 246, 0.3)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div style={{ width: '2rem', height: '2rem' }}>
        {getIcon()}
      </div>
      <span style={{ 
        fontSize: '0.625rem', 
        fontWeight: '600', 
        color: isActive ? '#8b5cf6' : '#6b7280',
        textAlign: 'center'
      }}>
        {type}
      </span>
    </button>
  );
};
