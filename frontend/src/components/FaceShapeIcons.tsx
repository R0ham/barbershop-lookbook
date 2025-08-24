import React from 'react';

interface FaceShapeIconsProps {
  shape: string;
  size?: number;
  color?: string;
}

const FaceShapeIcons: React.FC<FaceShapeIconsProps> = ({ shape, size = 24, color = '#2563eb' }) => {
  const getIcon = () => {
    const barberGradientId = `barberGradient-${shape}`;
    
    switch (shape) {
      case 'Oval':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id={barberGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="33%" stopColor="#e2e8f0"/>
                <stop offset="66%" stopColor="#1e40af"/>
                <stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="25" ry="35" fill="#2d2d2d" stroke={color} strokeWidth="3"/>
            <circle cx="42" cy="43" r="2" fill="#ffffff"/>
            <circle cx="58" cy="43" r="2" fill="#ffffff"/>
            <ellipse cx="50" cy="50" rx="1.5" ry="3" fill="#6b7280"/>
            <path d="M45 57 Q50 60 55 57" stroke="#ffffff" strokeWidth="2" fill="none"/>
            <path d="M25 35 Q25 20 50 20 Q75 20 75 35 L75 40 Q70 25 50 25 Q30 25 25 40 Z" fill={color}/>
            <rect x="20" y="15" width="60" height="2" fill={`url(#${barberGradientId})`}/>
          </svg>
        );

      case 'Round':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id={barberGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="33%" stopColor="#e2e8f0"/>
                <stop offset="66%" stopColor="#1e40af"/>
                <stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" rx="30" ry="30" fill="#2d2d2d" stroke={color} strokeWidth="3"/>
            <circle cx="42" cy="43" r="2" fill="#ffffff"/>
            <circle cx="58" cy="43" r="2" fill="#ffffff"/>
            <ellipse cx="50" cy="50" rx="1.5" ry="3" fill="#6b7280"/>
            <path d="M45 57 Q50 60 55 57" stroke="#ffffff" strokeWidth="2" fill="none"/>
            <path d="M20 35 Q20 20 50 20 Q80 20 80 35 L80 40 Q75 25 50 25 Q25 25 20 40 Z" fill={color}/>
            <rect x="15" y="15" width="70" height="2" fill={`url(#${barberGradientId})`}/>
          </svg>
        );

      case 'Square':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id={barberGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="33%" stopColor="#e2e8f0"/>
                <stop offset="66%" stopColor="#1e40af"/>
                <stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <rect x="25" y="25" width="50" height="60" rx="5" fill="#2d2d2d" stroke={color} strokeWidth="3"/>
            <circle cx="40" cy="43" r="2" fill="#ffffff"/>
            <circle cx="60" cy="43" r="2" fill="#ffffff"/>
            <ellipse cx="50" cy="50" rx="1.5" ry="3" fill="#6b7280"/>
            <path d="M45 57 Q50 60 55 57" stroke="#ffffff" strokeWidth="2" fill="none"/>
            <rect x="25" y="25" width="50" height="15" fill={color}/>
            <rect x="20" y="15" width="60" height="2" fill={`url(#${barberGradientId})`}/>
          </svg>
        );

      case 'Heart':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id={barberGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="33%" stopColor="#e2e8f0"/>
                <stop offset="66%" stopColor="#1e40af"/>
                <stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <path d="M20 35 Q20 25 35 25 L65 25 Q80 25 80 35 L80 45 Q80 70 50 85 Q20 70 20 45 Z" 
                  fill="#2d2d2d" stroke={color} strokeWidth="3"/>
            <circle cx="40" cy="40" r="2" fill="#ffffff"/>
            <circle cx="60" cy="40" r="2" fill="#ffffff"/>
            <ellipse cx="50" cy="47" rx="1.5" ry="3" fill="#6b7280"/>
            <path d="M45 54 Q50 57 55 54" stroke="#ffffff" strokeWidth="2" fill="none"/>
            <path d="M20 35 Q20 20 50 20 Q80 20 80 35 L80 40 Q75 25 50 25 Q25 25 20 40 Z" fill={color}/>
            <rect x="15" y="15" width="70" height="2" fill={`url(#${barberGradientId})`}/>
          </svg>
        );

      case 'Long':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id={barberGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="33%" stopColor="#e2e8f0"/>
                <stop offset="66%" stopColor="#1e40af"/>
                <stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="20" ry="40" fill="#2d2d2d" stroke={color} strokeWidth="3"/>
            <circle cx="42" cy="40" r="2" fill="#ffffff"/>
            <circle cx="58" cy="40" r="2" fill="#ffffff"/>
            <ellipse cx="50" cy="47" rx="1.5" ry="3" fill="#6b7280"/>
            <path d="M45 54 Q50 57 55 54" stroke="#ffffff" strokeWidth="2" fill="none"/>
            <path d="M30 25 Q30 15 50 15 Q70 15 70 25 L70 30 Q65 20 50 20 Q35 20 30 30 Z" fill={color}/>
            <rect x="25" y="10" width="50" height="2" fill={`url(#${barberGradientId})`}/>
          </svg>
        );

      default:
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id={barberGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="33%" stopColor="#e2e8f0"/>
                <stop offset="66%" stopColor="#1e40af"/>
                <stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="30" fill="#2d2d2d" stroke={color} strokeWidth="3"/>
            <circle cx="42" cy="43" r="2" fill="#ffffff"/>
            <circle cx="58" cy="43" r="2" fill="#ffffff"/>
            <ellipse cx="50" cy="50" rx="1.5" ry="3" fill="#6b7280"/>
            <path d="M45 57 Q50 60 55 57" stroke="#ffffff" strokeWidth="2" fill="none"/>
            <path d="M20 35 Q20 20 50 20 Q80 20 80 35 L80 40 Q75 25 50 25 Q25 25 20 40 Z" fill={color}/>
            <rect x="15" y="15" width="70" height="2" fill={`url(#${barberGradientId})`}/>
          </svg>
        );
    }
  };

  return getIcon();
};

export default FaceShapeIcons;
