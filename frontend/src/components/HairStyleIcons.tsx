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
  color = '#ec4899' 
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
    switch (style.toLowerCase()) {
      case 'straight':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
            {/* Face outline */}
            <ellipse cx="12" cy="14" rx="5" ry="7" fill="none" stroke={color} strokeWidth="1.5"/>
            {/* Straight hair strands */}
            <path d="M7 6 L7 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 5 L9 17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 4 L12 16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 5 L15 17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 6 L17 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
            {/* Eyes */}
            <circle cx="10" cy="12" r="0.7" fill={color}/>
            <circle cx="14" cy="12" r="0.7" fill={color}/>
          </svg>
        );

      case 'wavy':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
            {/* Face outline */}
            <ellipse cx="12" cy="14" rx="5" ry="7" fill="none" stroke={color} strokeWidth="1.5"/>
            {/* Wavy hair strands */}
            <path d="M7 6 Q8 8 7 10 Q6 12 7 14 Q8 16 7 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M9 5 Q10 7 9 9 Q8 11 9 13 Q10 15 9 17" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M12 4 Q13 6 12 8 Q11 10 12 12 Q13 14 12 16" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M15 5 Q16 7 15 9 Q14 11 15 13 Q16 15 15 17" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M17 6 Q18 8 17 10 Q16 12 17 14 Q18 16 17 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* Eyes */}
            <circle cx="10" cy="12" r="0.7" fill={color}/>
            <circle cx="14" cy="12" r="0.7" fill={color}/>
          </svg>
        );

      case 'curly':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
            {/* Face outline */}
            <ellipse cx="12" cy="14" rx="5" ry="7" fill="none" stroke={color} strokeWidth="1.5"/>
            {/* Curly hair - spiral patterns */}
            <circle cx="8" cy="7" r="1.5" fill="none" stroke={color} strokeWidth="2"/>
            <circle cx="10" cy="5" r="1.2" fill="none" stroke={color} strokeWidth="2"/>
            <circle cx="12" cy="4" r="1.5" fill="none" stroke={color} strokeWidth="2"/>
            <circle cx="14" cy="5" r="1.2" fill="none" stroke={color} strokeWidth="2"/>
            <circle cx="16" cy="7" r="1.5" fill="none" stroke={color} strokeWidth="2"/>
            <circle cx="7" cy="10" r="1" fill="none" stroke={color} strokeWidth="1.5"/>
            <circle cx="17" cy="10" r="1" fill="none" stroke={color} strokeWidth="1.5"/>
            {/* Eyes */}
            <circle cx="10" cy="12" r="0.7" fill={color}/>
            <circle cx="14" cy="12" r="0.7" fill={color}/>
          </svg>
        );

      case 'textured':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
            {/* Face outline */}
            <ellipse cx="12" cy="14" rx="5" ry="7" fill="none" stroke={color} strokeWidth="1.5"/>
            {/* Textured hair - jagged, layered look */}
            <path d="M7 6 L8 8 L7 10 L9 12 L7 14 L8 16 L7 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M9 5 L10 7 L9 9 L11 11 L9 13 L10 15 L9 17" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M12 4 L13 6 L12 8 L14 10 L12 12 L13 14 L12 16" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M15 5 L16 7 L15 9 L17 11 L15 13 L16 15 L15 17" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M17 6 L18 8 L17 10 L19 12 L17 14 L18 16 L17 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* Eyes */}
            <circle cx="10" cy="12" r="0.7" fill={color}/>
            <circle cx="14" cy="12" r="0.7" fill={color}/>
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

  return null;
};

export default HairStyleIcons;
