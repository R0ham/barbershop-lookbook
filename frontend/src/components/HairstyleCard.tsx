import React, { useState } from 'react';
import { Hairstyle } from '../types';

interface HairstyleCardProps {
  hairstyle: Hairstyle;
  onClick: () => void;
}

const HairstyleCard: React.FC<HairstyleCardProps> = ({ hairstyle, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  const handleImageError = () => {
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Don't render the card if image failed to load
  if (!imageLoaded) {
    return null;
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
      onClick={onClick}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.4)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={hairstyle.image_url}
          alt={hairstyle.name}
          style={{
            width: '100%',
            height: '20rem',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'transform 0.3s ease'
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <div style={{ 
          position: 'absolute', 
          inset: '0', 
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent, transparent)', 
          opacity: '0', 
          transition: 'opacity 0.3s ease' 
        }}></div>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <span style={{ 
            background: 'linear-gradient(to right, #ec4899, #9333ea)', 
            color: 'white', 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            padding: '0.375rem 0.75rem', 
            borderRadius: '9999px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
          }}>
            {hairstyle.category}
          </span>
        </div>
      </div>
      
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          fontSize: '1.25rem', 
          color: '#111827', 
          marginBottom: '0.75rem', 
          transition: 'color 0.3s ease' 
        }}>
          {hairstyle.name}
        </h3>
        
        <p style={{ 
          color: '#4b5563', 
          fontSize: '0.875rem', 
          marginBottom: '1rem', 
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {hairstyle.description}
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ 
            background: 'linear-gradient(to right, #fce7f3, #f3e8ff)', 
            color: '#be185d', 
            fontSize: '0.75rem', 
            fontWeight: '500', 
            padding: '0.375rem 0.75rem', 
            borderRadius: '9999px' 
          }}>
            {hairstyle.length}
          </span>
          <span style={{ 
            background: 'linear-gradient(to right, #e0e7ff, #dbeafe)', 
            color: '#3730a3', 
            fontSize: '0.75rem', 
            fontWeight: '500', 
            padding: '0.375rem 0.75rem', 
            borderRadius: '9999px' 
          }}>
            {hairstyle.texture}
          </span>
        </div>
        
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280', 
          background: '#f9fafb', 
          borderRadius: '0.5rem', 
          padding: '0.5rem' 
        }}>
          <span style={{ fontWeight: '500' }}>Perfect for:</span> {hairstyle.face_shapes.join(', ')} faces
        </div>
      </div>
    </div>
  );
};

export default HairstyleCard;
