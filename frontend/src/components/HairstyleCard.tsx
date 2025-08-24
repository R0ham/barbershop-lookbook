import React, { useState, memo } from 'react';
import { Hairstyle } from '../types';
import { getMinimalIcon } from './MinimalIcons';

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

  // Derive a source hostname from the image URL for lightweight attribution
  let sourceHost = '';
  try {
    const u = new URL(hairstyle.image_url);
    sourceHost = (u.hostname || '').replace(/^www\./, '');
  } catch {}

  // Don't render the card if image failed to load
  if (!imageLoaded) {
    return null;
  }

  return (
    <div
      className="hs-card"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
      onClick={onClick}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          className="hs-card-img"
          src={hairstyle.image_url}
          alt={hairstyle.name}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '20rem',
            objectFit: 'cover',
            objectPosition: 'center'
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
      </div>
      {/* Small caption under image for attribution (source only) */}
      {sourceHost && (
        <div style={{
          padding: '0.5rem 1rem 0',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'right'
        }}>
          <span>{sourceHost}</span>
        </div>
      )}
      
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

        {/* Attribute pills with minimal icons (colorized) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {/* Length - pink accents */}
          <span style={{
            padding: '0.375rem 0.75rem',
            borderRadius: '9999px',
            border: '2px solid #fbcfe8',
            background: '#fdf2f8',
            color: '#9d174d',
            fontSize: '0.8rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {getMinimalIcon('length', hairstyle.length, 20, '#be185d')}
            {hairstyle.length}
          </span>
          {/* Texture - indigo accents */}
          <span style={{
            padding: '0.375rem 0.75rem',
            borderRadius: '9999px',
            border: '2px solid #c7d2fe',
            background: '#eef2ff',
            color: '#3730a3',
            fontSize: '0.8rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {getMinimalIcon('texture', hairstyle.texture, 20, '#4f46e5')}
            {hairstyle.texture}
          </span>
          {/* Type - cyan accents */}
          <span style={{
            padding: '0.375rem 0.75rem',
            borderRadius: '9999px',
            border: '2px solid #a5f3fc',
            background: '#ecfeff',
            color: '#0e7490',
            fontSize: '0.8rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {getMinimalIcon('style', hairstyle.style_type, 20, '#0891b2')}
            {hairstyle.style_type}
          </span>
          {/* Pose - amber accents */}
          <span style={{
            padding: '0.375rem 0.75rem',
            borderRadius: '9999px',
            border: '2px solid #fde68a',
            background: '#fffbeb',
            color: '#92400e',
            fontSize: '0.8rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {getMinimalIcon('pose', hairstyle.pose, 20, '#d97706')}
            {hairstyle.pose}
          </span>
          {/* Face shapes - green accents - show up to 2 explicitly */}
          {(hairstyle.face_shapes || []).slice(0, 2).map((fs) => (
            <span key={fs} style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '9999px',
              border: '2px solid #bbf7d0',
              background: '#f0fdf4',
              color: '#166534',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {getMinimalIcon('face', fs, 20, '#16a34a')}
              {fs}
            </span>
          ))}
          {hairstyle.face_shapes && hairstyle.face_shapes.length > 2 && (
            <span style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '9999px',
              border: '2px solid #e5e7eb',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#374151',
              fontSize: '0.8rem',
              fontWeight: 500
            }}>
              +{hairstyle.face_shapes.length - 2} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(HairstyleCard);
