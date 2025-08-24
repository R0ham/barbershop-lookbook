import React, { useState, memo } from 'react';
import { Hairstyle } from '../types';
import { getMinimalIcon } from './MinimalIcons';

interface HairstyleCardProps {
  hairstyle: Hairstyle;
  onClick: () => void;
  onApplyFilter?: (
    type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape',
    value: string,
    anchorId?: string
  ) => void;
  activeFilters?: {
    length: string[];
    texture: string[];
    face_shape: string[];
    style_type: string[];
    pose: string[];
    search?: string;
  };
}

const HairstyleCard: React.FC<HairstyleCardProps> = ({ hairstyle, onClick, onApplyFilter, activeFilters }) => {
  const [imageLoaded, setImageLoaded] = useState(true);
  const [facesExpanded, setFacesExpanded] = useState(false);
  const cardId = React.useMemo(() => `hs-card-${hairstyle.id}`, [hairstyle.id]);

  const animatePill = (el?: Element | null) => {
    if (!el || !(el as HTMLElement).animate) return;
    try {
      (el as HTMLElement).animate([
        { transform: 'scale(0.96)' },
        { transform: 'scale(1)' }
      ], { duration: 160, easing: 'ease-out' });
    } catch {}
  };

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

  // Determine active/selected filter state
  const anyFiltersActive = !!activeFilters && (
    (activeFilters.length?.length ?? 0) > 0 ||
    (activeFilters.texture?.length ?? 0) > 0 ||
    (activeFilters.face_shape?.length ?? 0) > 0 ||
    (activeFilters.style_type?.length ?? 0) > 0 ||
    (activeFilters.pose?.length ?? 0) > 0
  );

  const isSelected = (type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape', value: string) => {
    if (!activeFilters) return false;
    const list = (activeFilters as any)[type] as string[] | undefined;
    return Array.isArray(list) ? list.includes(value) : false;
  };

  const pillStyles = (
    type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape',
    selected: boolean
  ) => {
    // colored schemes
    const schemes: Record<string, { border: string; bg: string; text: string; icon: string }> = {
      length:   { border: '#fbcfe8', bg: '#fdf2f8', text: '#9d174d', icon: '#be185d' },
      texture:  { border: '#c7d2fe', bg: '#eef2ff', text: '#3730a3', icon: '#4f46e5' },
      style:    { border: '#a5f3fc', bg: '#ecfeff', text: '#0e7490', icon: '#0891b2' },
      style_type:{ border: '#a5f3fc', bg: '#ecfeff', text: '#0e7490', icon: '#0891b2' },
      pose:     { border: '#fde68a', bg: '#fffbeb', text: '#92400e', icon: '#d97706' },
      face:     { border: '#bbf7d0', bg: '#f0fdf4', text: '#166534', icon: '#16a34a' },
      face_shape:{ border: '#bbf7d0', bg: '#f0fdf4', text: '#166534', icon: '#16a34a' },
    };
    const gray = { border: '#e5e7eb', bg: '#f9fafb', text: '#6b7280', icon: '#6b7280' };
    const blue = { border: '#bfdbfe', bg: '#eff6ff', text: '#1d4ed8', icon: '#2563eb' };
    // Logic:
    // - If any filters are active: selected -> blue, not selected -> gray
    // - If no filters active: use category scheme
    const sc = anyFiltersActive ? (selected ? blue : gray) : (schemes[type] || gray);
    return {
      style: {
        padding: '0.375rem 0.75rem',
        borderRadius: '9999px',
        border: `2px solid ${sc.border}`,
        background: sc.bg,
        color: sc.text,
        fontSize: '0.8rem',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer' as const,
        userSelect: 'none' as const
      },
      icon: sc.icon
    };
  };

  // Don't render the card if image failed to load
  if (!imageLoaded) {
    return null;
  }

  return (
    <div
      id={cardId}
      className="hs-card"
      style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow:
          '0 1px 0 rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.04), 0 10px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #e5e7eb'
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

        {/* Attribute pills with minimal icons (colorized) - now clickable */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {/* Length */}
          <span
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('length', hairstyle.length, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('length', hairstyle.length, cardId); animatePill(e.currentTarget as HTMLElement); } }}
            style={pillStyles('length', isSelected('length', hairstyle.length)).style}
          >
            {getMinimalIcon('length', hairstyle.length, 20, pillStyles('length', isSelected('length', hairstyle.length)).icon)}
            {hairstyle.length}
          </span>
          {/* Texture */}
          <span
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('texture', hairstyle.texture, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('texture', hairstyle.texture, cardId); animatePill(e.currentTarget as HTMLElement); } }}
            style={pillStyles('texture', isSelected('texture', hairstyle.texture)).style}
          >
            {getMinimalIcon('texture', hairstyle.texture, 20, pillStyles('texture', isSelected('texture', hairstyle.texture)).icon)}
            {hairstyle.texture}
          </span>
          {/* Type */}
          <span
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('style_type', hairstyle.style_type, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('style_type', hairstyle.style_type, cardId); animatePill(e.currentTarget as HTMLElement); } }}
            style={pillStyles('style_type', isSelected('style_type', hairstyle.style_type)).style}
          >
            {getMinimalIcon('style', hairstyle.style_type, 20, pillStyles('style_type', isSelected('style_type', hairstyle.style_type)).icon)}
            {hairstyle.style_type}
          </span>
          {/* Pose */}
          <span
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('pose', hairstyle.pose, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('pose', hairstyle.pose, cardId); animatePill(e.currentTarget as HTMLElement); } }}
            style={pillStyles('pose', isSelected('pose', hairstyle.pose)).style}
          >
            {getMinimalIcon('pose', hairstyle.pose, 20, pillStyles('pose', isSelected('pose', hairstyle.pose)).icon)}
            {hairstyle.pose}
          </span>
          {/* Face shapes - green accents - show up to 2 explicitly */}
          {(
            facesExpanded ? (hairstyle.face_shapes || []) : (hairstyle.face_shapes || []).slice(0, 2)
          ).map((fs) => (
            <span key={fs}
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('face_shape', fs, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('face_shape', fs, cardId); animatePill(e.currentTarget as HTMLElement); } }}
              style={pillStyles('face_shape', isSelected('face_shape', fs)).style}
            >
              {getMinimalIcon('face', fs, 20, pillStyles('face_shape', isSelected('face_shape', fs)).icon)}
              {fs}
            </span>
          ))}
          {(!facesExpanded && hairstyle.face_shapes && hairstyle.face_shapes.length > 2) && (
            <span
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFacesExpanded(true); (e.currentTarget as HTMLElement)?.blur?.(); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); setFacesExpanded(true); } }}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                border: '2px solid #e5e7eb',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#374151',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              +{hairstyle.face_shapes.length - 2} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(HairstyleCard);
