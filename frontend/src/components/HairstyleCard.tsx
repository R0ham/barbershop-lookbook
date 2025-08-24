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
    const schemes: Record<string, { classes: string; icon: string }> = {
      length:     { classes: 'border-pink-200 bg-pink-50 text-rose-700', icon: '#be185d' },
      texture:    { classes: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: '#4f46e5' },
      style:      { classes: 'border-cyan-200 bg-cyan-50 text-cyan-700', icon: '#0891b2' },
      style_type: { classes: 'border-cyan-200 bg-cyan-50 text-cyan-700', icon: '#0891b2' },
      pose:       { classes: 'border-amber-200 bg-amber-50 text-amber-800', icon: '#d97706' },
      face:       { classes: 'border-green-200 bg-green-50 text-green-700', icon: '#16a34a' },
      face_shape: { classes: 'border-green-200 bg-green-50 text-green-700', icon: '#16a34a' },
    };
    const gray = { classes: 'border-gray-200 bg-gray-50 text-gray-500', icon: '#6b7280' };
    const blue = { classes: 'border-blue-200 bg-blue-50 text-blue-700', icon: '#2563eb' };
    // Logic:
    // - If any filters are active: selected -> blue, not selected -> gray
    // - If no filters active: use category scheme
    const sc = anyFiltersActive ? (selected ? blue : gray) : (schemes[type] || gray);
    const base = 'px-3 py-1.5 rounded-full border-2 inline-flex items-center gap-2 cursor-pointer select-none text-[0.8rem] font-medium';
    return { className: `${base} ${sc.classes}`, icon: sc.icon };
  };

  // Don't render the card if image failed to load
  if (!imageLoaded) {
    return null;
  }

  return (
    <div
      id={cardId}
      className="relative bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          className="hs-card-img w-full h-80 object-cover object-center"
          src={hairstyle.image_url}
          alt={hairstyle.name}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300"></div>
      </div>
      {/* Small caption under image for attribution (source only) */}
      {sourceHost && (
        <div className="px-4 pt-2 text-xs text-gray-500 text-right">
          <span>{sourceHost}</span>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-3 transition-colors duration-300">
          {hairstyle.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 leading-6 line-clamp-2">
          {hairstyle.description}
        </p>

        {/* Attribute pills with minimal icons (colorized) - now clickable */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Length */}
          <span
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('length', hairstyle.length, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('length', hairstyle.length, cardId); animatePill(e.currentTarget as HTMLElement); } }}
            className={pillStyles('length', isSelected('length', hairstyle.length)).className}
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
            className={pillStyles('texture', isSelected('texture', hairstyle.texture)).className}
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
            className={pillStyles('style_type', isSelected('style_type', hairstyle.style_type)).className}
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
            className={pillStyles('pose', isSelected('pose', hairstyle.pose)).className}
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
              className={pillStyles('face_shape', isSelected('face_shape', fs)).className}
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
              className="px-3 py-1.5 rounded-full border-2 border-gray-200 bg-white/90 text-gray-700 text-[0.8rem] font-medium cursor-pointer select-none"
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
