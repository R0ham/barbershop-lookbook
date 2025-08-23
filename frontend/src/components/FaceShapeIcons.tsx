import React from 'react';

interface FaceShapeIconProps {
  shape: string;
  size?: number;
  color?: string;
}

const FaceShapeIcons: React.FC<FaceShapeIconProps> = ({ 
  shape, 
  size = 24, 
  color = '#ec4899' 
}) => {
  const iconStyle = {
    width: size,
    height: size,
    display: 'inline-block'
  };

  switch (shape.toLowerCase()) {
    case 'oval':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          {/* Oval face shape - classic proportions */}
          <ellipse cx="12" cy="13" rx="7" ry="9" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2"/>
          {/* Eyes */}
          <circle cx="9" cy="10" r="1" fill={color}/>
          <circle cx="15" cy="10" r="1" fill={color}/>
          {/* Nose */}
          <path d="M12 12 L12 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Mouth */}
          <path d="M10 16 Q12 17.5 14 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      );

    case 'round':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          {/* Round face shape - wider and shorter */}
          <circle cx="12" cy="13" r="8" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2"/>
          {/* Eyes */}
          <circle cx="9" cy="11" r="1" fill={color}/>
          <circle cx="15" cy="11" r="1" fill={color}/>
          {/* Nose */}
          <path d="M12 13 L12 15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Mouth */}
          <path d="M10 17 Q12 18.5 14 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      );

    case 'square':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          {/* Square face shape - angular jawline */}
          <rect x="6" y="5" width="12" height="16" rx="2" ry="2" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2"/>
          {/* Eyes */}
          <circle cx="9.5" cy="10" r="1" fill={color}/>
          <circle cx="14.5" cy="10" r="1" fill={color}/>
          {/* Nose */}
          <path d="M12 12 L12 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Mouth */}
          <path d="M10 16.5 Q12 18 14 16.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      );

    case 'heart':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          {/* Heart face shape - wide forehead, narrow chin */}
          <path d="M6 8 Q6 5 9 5 L15 5 Q18 5 18 8 L18 12 Q18 18 12 21 Q6 18 6 12 Z" 
                fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2"/>
          {/* Eyes */}
          <circle cx="9.5" cy="9.5" r="1" fill={color}/>
          <circle cx="14.5" cy="9.5" r="1" fill={color}/>
          {/* Nose */}
          <path d="M12 11.5 L12 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Mouth */}
          <path d="M10.5 15.5 Q12 17 13.5 15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      );

    case 'long':
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          {/* Long face shape - narrow and elongated */}
          <ellipse cx="12" cy="13" rx="5.5" ry="10" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2"/>
          {/* Eyes */}
          <circle cx="9.5" cy="10" r="1" fill={color}/>
          <circle cx="14.5" cy="10" r="1" fill={color}/>
          {/* Nose */}
          <path d="M12 12 L12 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Mouth */}
          <path d="M10.5 17 Q12 18.5 13.5 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      );

    default:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none">
          {/* Default face */}
          <circle cx="12" cy="12" r="8" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2"/>
          <circle cx="9" cy="10" r="1" fill={color}/>
          <circle cx="15" cy="10" r="1" fill={color}/>
          <path d="M12 12 L12 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 16 Q12 17.5 14 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      );
  }
};

export default FaceShapeIcons;
