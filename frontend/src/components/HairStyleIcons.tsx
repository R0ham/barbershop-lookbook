import React from 'react';

interface HairStyleIconProps {
  type: 'length' | 'texture';
  style: string;
  size?: number;
  color?: string;
}

const HairStyleIcons: React.FC<HairStyleIconProps> = ({ 
  type, 
  style, 
  size = 24, 
  color = '#2563eb' 
}) => {
  const iconStyle = {
    width: size,
    height: size,
    display: 'inline-block'
  };

  if (type === 'length') {
    switch (style.toLowerCase()) {
      case 'short':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
            {/* Face outline */}
            <ellipse cx="12" cy="13" rx="6" ry="8" fill="none" stroke={color} strokeWidth="1.5"/>
            {/* Short hair - pixie cut style */}
            <path d="M6 8 Q8 4 12 4 Q16 4 18 8 Q18 10 16 11 Q14 10 12 10 Q10 10 8 11 Q6 10 6 8" 
                  fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5"/>
            {/* Eyes */}
            <circle cx="9.5" cy="11" r="0.8" fill={color}/>
            <circle cx="14.5" cy="11" r="0.8" fill={color}/>
          </svg>
        );

      case 'medium':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
            {/* Face outline */}
            <ellipse cx="12" cy="13" rx="6" ry="8" fill="none" stroke={color} strokeWidth="1.5"/>
            {/* Medium hair - shoulder length */}
            <path d="M5 8 Q7 3 12 3 Q17 3 19 8 Q19 12 17 16 Q15 18 12 18 Q9 18 7 16 Q5 12 5 8" 
                  fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5"/>
            {/* Eyes */}
            <circle cx="9.5" cy="11" r="0.8" fill={color}/>
            <circle cx="14.5" cy="11" r="0.8" fill={color}/>
          </svg>
        );

      case 'long':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
            {/* Face outline */}
            <ellipse cx="12" cy="13" rx="6" ry="8" fill="none" stroke={color} strokeWidth="1.5"/>
            {/* Long hair - flowing down */}
            <path d="M4 8 Q6 2 12 2 Q18 2 20 8 Q20 15 18 20 Q15 22 12 22 Q9 22 6 20 Q4 15 4 8" 
                  fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5"/>
            {/* Eyes */}
            <circle cx="9.5" cy="11" r="0.8" fill={color}/>
            <circle cx="14.5" cy="11" r="0.8" fill={color}/>
          </svg>
        );

      default:
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2"/>
          </svg>
        );
    }
  }

  if (type === 'texture') {
    // Minimal hair follicle icon: bulb with a single strand path
    const bulb = <circle cx="12" cy="18" r="2.2" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5"/>;
    const root = <line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>;
    const common = (strand: React.ReactNode) => (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
        {strand}
        {bulb}
        {root}
      </svg>
    );

    switch (style.toLowerCase()) {
      case 'straight': {
        const strand = <path d="M12 3 L12 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>;
        return common(strand);
      }
      case 'wavy': {
        const strand = <path d="M12 3 C13 6, 11 9, 12 12 C13 15, 11 16.5, 12 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>;
        return common(strand);
      }
      case 'curly': {
        const strand = <path d="M12 4 c2 -2, 2 2, 0 0 c-2 -2, -2 2, 0 0 c2 -2, 2 2, 0 0 c-2 -2, -2 2, 0 0" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>;
        return common(strand);
      }
      case 'textured': {
        const strand = <path d="M12 3 L12 6 L11 8 L13 10 L12 12 L11 14 L12 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>;
        return common(strand);
      }
      default:
        return common(<path d="M12 3 L12 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>);
    }
  }

  return null;
};

export default HairStyleIcons;
