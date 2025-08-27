import React, { useEffect, useRef, useState } from 'react';
import { Hairstyle } from '../types';
import { getMinimalIcon } from './MinimalIcons';

interface HairstyleModalProps {
  hairstyle: Hairstyle;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onApplyFilter?: (
    type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape' | 'ethnicity',
    value: string
  ) => void;
  activeFilters?: {
    length: string[];
    texture: string[];
    face_shape: string[];
    style_type: string[];
    pose: string[];
    ethnicity: string[];
    search?: string;
  };
}

const HairstyleModal: React.FC<HairstyleModalProps> = ({ hairstyle, onClose, onPrev, onNext, isFavorite = false, onToggleFavorite, onApplyFilter, activeFilters }) => {
  const popRef = useRef<HTMLDivElement | null>(null);
  const popAnimRef = useRef<Animation | null>(null);
  // Swipe tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchMovedRef = useRef<boolean>(false);
  const [facesExpanded, setFacesExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image state when the hairstyle image changes
  useEffect(() => {
    setImageError(false);
  }, [hairstyle?.image_url]);

  const anyFiltersActive = !!activeFilters && (
    (activeFilters.length?.length ?? 0) > 0 ||
    (activeFilters.texture?.length ?? 0) > 0 ||
    (activeFilters.face_shape?.length ?? 0) > 0 ||
    (activeFilters.style_type?.length ?? 0) > 0 ||
    (activeFilters.pose?.length ?? 0) > 0 ||
    (activeFilters.ethnicity?.length ?? 0) > 0 ||
    !!activeFilters.search
  );

  const isSelected = React.useCallback((type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape' | 'ethnicity', value: string) => {
    if (!activeFilters) return false;
    const list = (activeFilters as any)[type] as string[] | undefined;
    return Array.isArray(list) ? list.includes(value) : false;
  }, [activeFilters]);

  const isAny = (v?: string) => typeof v === 'string' && v.trim().toLowerCase() === 'any';

  const pillStyles = (
    type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape' | 'ethnicity',
    selected: boolean
  ) => {
    // colored schemes identical to card
    const schemes: Record<string, { classes: string; icon: string }> = {
      length:     { classes: 'border-pink-200 bg-pink-50 text-rose-700', icon: '#be185d' },
      texture:    { classes: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: '#4f46e5' },
      style:      { classes: 'border-cyan-200 bg-cyan-50 text-cyan-700', icon: '#0891b2' },
      style_type: { classes: 'border-cyan-200 bg-cyan-50 text-cyan-700', icon: '#0891b2' },
      pose:       { classes: 'border-violet-200 bg-violet-50 text-violet-700', icon: '#7c3aed' },
      face_shape: { classes: 'border-blue-200 bg-blue-50 text-blue-700', icon: '#2563eb' },
      ethnicity:  { classes: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: '#059669' },
    };
    const gray = { classes: 'border-gray-200 bg-gray-50 text-gray-500', icon: '#6b7280' };
    const blue = { classes: 'border-blue-200 bg-blue-50 text-blue-700', icon: '#2563eb' };
    const sc = anyFiltersActive ? (selected ? blue : gray) : (schemes[type] || gray);
    const base = 'px-3 py-1.5 rounded-full border-2 inline-flex items-center gap-2 cursor-pointer select-none text-[0.8rem] font-medium';
    return { className: `${base} ${sc.classes}`, icon: sc.icon };
  };

  const animatePill = (el?: Element | null) => {
    if (!el || !(el as HTMLElement).animate) return;
    try {
      (el as HTMLElement).animate([
        { transform: 'scale(0.96)' },
        { transform: 'scale(1)' }
      ], { duration: 160, easing: 'ease-out' });
    } catch {}
  };

  // Prevent double-click on pills from triggering favorite logic
  const handlePillDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Build overflow items for faces/ethnicity like the card
  const extraItemsAll = React.useMemo<string[]>(() => {
    const arr: string[] = [...(hairstyle.face_shapes || [])].filter((v: string) => !isAny(v));
    if (hairstyle.ethnicity && !isAny(hairstyle.ethnicity)) arr.push(`__ETH__:${hairstyle.ethnicity}`);
    return arr;
  }, [hairstyle.face_shapes, hairstyle.ethnicity]);

  // Compute which extra items should be visible when collapsed: first two + any active hidden
  const visibleExtraItems = React.useMemo<string[]>(() => {
    if (facesExpanded) return extraItemsAll;
    const firstTwo = extraItemsAll.slice(0, 2);
    const set = new Set(firstTwo);
    // If an extra item is active, ensure it is visible even if beyond first two
    const ensureVisible: string[] = [];
    // Active face shapes
    (hairstyle.face_shapes || []).forEach((shape: string) => {
      if (!isAny(shape) && isSelected('face_shape', shape)) {
        const token = shape;
        if (!set.has(token)) { set.add(token); ensureVisible.push(token); }
      }
    });
    // Active ethnicity
    if (hairstyle.ethnicity && !isAny(hairstyle.ethnicity) && isSelected('ethnicity', hairstyle.ethnicity)) {
      const token = `__ETH__:${hairstyle.ethnicity}`;
      if (!set.has(token)) { set.add(token); ensureVisible.push(token); }
    }
    return [...firstTwo, ...ensureVisible];
  }, [facesExpanded, extraItemsAll, hairstyle.face_shapes, hairstyle.ethnicity, activeFilters, isSelected]);

  // Auto-expand if an active extra item would otherwise be hidden
  useEffect(() => {
    if (facesExpanded) return;
    const firstTwo = extraItemsAll.slice(0, 2);
    const isActiveFaceHidden = (hairstyle.face_shapes || []).some((shape: string) => {
      if (isAny(shape)) return false;
      if (!isSelected('face_shape', shape)) return false;
      return !firstTwo.includes(shape);
    });
    const isActiveEthHidden = !!(hairstyle.ethnicity && !isAny(hairstyle.ethnicity) && isSelected('ethnicity', hairstyle.ethnicity) && !firstTwo.includes(`__ETH__:${hairstyle.ethnicity}`));
    if (isActiveFaceHidden || isActiveEthHidden) {
      setFacesExpanded(true);
    }
  }, [facesExpanded, extraItemsAll, hairstyle.face_shapes, hairstyle.ethnicity, activeFilters, isSelected]);

  // Keyboard navigation for convenience
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  const playHeartPop = () => {
    const el = popRef.current as HTMLDivElement | null;
    if (!el || !('animate' in el)) return;
    try {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      const anim = el.animate([
        { transform: 'scale(0.7)', opacity: 0 },
        { transform: 'scale(1.15)', opacity: 1, offset: 0.5 },
        { transform: 'scale(1)', opacity: 0 }
      ], { duration: 600, easing: 'ease-out' });
      popAnimRef.current = anim as unknown as Animation;
      anim.onfinish = () => {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        popAnimRef.current = null;
      };
    } catch {}
  };

  const toggleFav = () => {
    // If quickly unfavoriting while pop is running, cancel it
    if (isFavorite && popAnimRef.current) {
      try { popAnimRef.current.cancel(); } catch {}
      popAnimRef.current = null;
      const el = popRef.current as HTMLDivElement | null;
      if (el) { el.style.opacity = '0'; el.style.visibility = 'hidden'; }
    }
    onToggleFavorite?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative bg-black h-[500px] md:h-[70vh] overflow-hidden flex items-center justify-center"
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isFavorite) playHeartPop();
              onToggleFavorite?.();
            }}
            onTouchStart={(e) => {
              if (e.touches.length !== 1) return;
              const t = e.touches[0];
              touchStartXRef.current = t.clientX;
              touchStartYRef.current = t.clientY;
              touchMovedRef.current = false;
            }}
            onTouchMove={(e) => {
              if (touchStartXRef.current == null || touchStartYRef.current == null) return;
              const t = e.touches[0];
              const dx = t.clientX - touchStartXRef.current;
              const dy = t.clientY - touchStartYRef.current;
              if (Math.abs(dx) > 10 || Math.abs(dy) > 10) touchMovedRef.current = true;
            }}
            onTouchEnd={(e) => {
              if (touchStartXRef.current == null || touchStartYRef.current == null) return;
              const t = e.changedTouches[0];
              const dx = t.clientX - touchStartXRef.current;
              const dy = t.clientY - touchStartYRef.current;
              const absX = Math.abs(dx);
              const absY = Math.abs(dy);
              // Only treat as swipe if horizontal and exceeds threshold
              const threshold = 40;
              if (absX > absY && absX > threshold) {
                // Swipe left -> next, swipe right -> prev
                if (dx < 0) onNext?.(); else onPrev?.();
                e.preventDefault();
                e.stopPropagation();
              }
              touchStartXRef.current = null;
              touchStartYRef.current = null;
              touchMovedRef.current = false;
            }}
          >
            {/* Image element always rendered to ensure next/prev loads fire */}
            <img
              key={hairstyle.image_url}
              src={hairstyle.image_url}
              alt={hairstyle.name}
              className={`max-w-full max-h-full w-auto h-full object-contain bg-black ${imageError ? 'opacity-0' : 'opacity-100'}`}
              onError={() => { setImageError(true); }}
              onLoad={() => { setImageError(false); }}
              draggable={false}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isFavorite) playHeartPop();
                onToggleFavorite?.();
              }}
            />

            {/* Skeleton/placeholder overlay while loading or on error */}
            {imageError && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center select-none">
                <div className="w-[400px] h-[500px] max-w-full max-h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-md flex items-center justify-center">
                  <div className="flex flex-col items-center text-gray-300">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" className="opacity-80 mb-3">
                      <path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l1-2h8l1 2h2a2 2 0 0 1 2 2v11zM7 13l2.5 3.01L12 13l3 4H6l1-1z" />
                    </svg>
                    <span className="text-sm">Image unavailable</span>
                  </div>
                </div>
              </div>
            )}

            {/* Center heart pop animation (modal). Hidden by default via inline style. */}
            <div ref={popRef} className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ opacity: 0, visibility: 'hidden' }}>
              <svg width="140" height="140" viewBox="0 0 24 24" fill="rgba(244,63,94,0.85)" stroke="rgba(244,63,94,0.95)" strokeWidth="0" style={{ filter: 'drop-shadow(0 8px 16px rgba(244,63,94,0.35))' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>

            {/* Bottom-right favorite button (only in modal) */}
            <button
              type="button"
              aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
              title={isFavorite ? 'Unfavorite' : 'Favorite'}
              onClick={toggleFav}
              className={`absolute bottom-3 right-3 z-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 p-3 shadow hover:bg-white transition ${isFavorite ? 'text-rose-600' : 'text-gray-600'}`}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Carousel arrows */}
            {onPrev && (
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                onMouseDown={(e) => { e.stopPropagation(); }}
                onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="absolute inset-y-0 left-0 my-auto h-12 w-12 m-3 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow flex items-center justify-center"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            {onNext && (
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                onMouseDown={(e) => { e.stopPropagation(); }}
                onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="absolute inset-y-0 right-0 my-auto h-12 w-12 m-3 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow flex items-center justify-center"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>
          {/* Filter pills under the image - match card order and content */}
          <div className="p-4 border-t bg-white">
            <div className="flex flex-wrap gap-2">
              {/* Length */}
              {!isAny(hairstyle.length) && (
                <span
                  onMouseDown={(e) => { e.preventDefault(); }}
                  onDoubleClick={handlePillDoubleClick}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('length', hairstyle.length); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('length', hairstyle.length); animatePill(e.currentTarget as HTMLElement); } }}
                  className={pillStyles('length', isSelected('length', hairstyle.length)).className}
                >
                  {getMinimalIcon('length', hairstyle.length, 20, pillStyles('length', isSelected('length', hairstyle.length)).icon)}
                  {hairstyle.length}
                </span>
              )}
              {/* Texture */}
              {!isAny(hairstyle.texture) && (
                <span
                  onMouseDown={(e) => { e.preventDefault(); }}
                  onDoubleClick={handlePillDoubleClick}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('texture', hairstyle.texture); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('texture', hairstyle.texture); animatePill(e.currentTarget as HTMLElement); } }}
                  className={pillStyles('texture', isSelected('texture', hairstyle.texture)).className}
                >
                  {getMinimalIcon('texture', hairstyle.texture, 20, pillStyles('texture', isSelected('texture', hairstyle.texture)).icon)}
                  {hairstyle.texture}
                </span>
              )}
              {/* Style Type */}
              {!isAny(hairstyle.style_type) && (
                <span
                  onMouseDown={(e) => { e.preventDefault(); }}
                  onDoubleClick={handlePillDoubleClick}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('style_type', hairstyle.style_type); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('style_type', hairstyle.style_type); animatePill(e.currentTarget as HTMLElement); } }}
                  className={pillStyles('style_type', isSelected('style_type', hairstyle.style_type)).className}
                >
                  {getMinimalIcon('style', hairstyle.style_type, 20, pillStyles('style_type', isSelected('style_type', hairstyle.style_type)).icon)}
                  {hairstyle.style_type}
                </span>
              )}
              {/* Pose */}
              {!isAny(hairstyle.pose) && hairstyle.pose && (
                <span
                  onMouseDown={(e) => { e.preventDefault(); }}
                  onDoubleClick={handlePillDoubleClick}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('pose', hairstyle.pose!); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('pose', hairstyle.pose!); animatePill(e.currentTarget as HTMLElement); } }}
                  className={pillStyles('pose', isSelected('pose', hairstyle.pose!)).className}
                >
                  {getMinimalIcon('pose', hairstyle.pose!, 20, pillStyles('pose', isSelected('pose', hairstyle.pose!)).icon)}
                  {hairstyle.pose}
                </span>
              )}
              {/* Face shapes + Ethnicity overflow with active surfacing */}
              {visibleExtraItems.map((item) => {
                const isEth = item.startsWith('__ETH__:');
                const val = isEth ? item.replace('__ETH__:', '') : item;
                return (
                  <span
                    key={(isEth ? 'eth-' : 'face-') + val}
                    onMouseDown={(e) => { e.preventDefault(); }}
                    onDoubleClick={handlePillDoubleClick}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter(isEth ? 'ethnicity' : 'face_shape', val); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter(isEth ? 'ethnicity' : 'face_shape', val); animatePill(e.currentTarget as HTMLElement); } }}
                    className={pillStyles(isEth ? 'ethnicity' : 'face_shape', isSelected(isEth ? 'ethnicity' : 'face_shape', val)).className}
                  >
                    {getMinimalIcon(isEth ? 'ethnicity' : 'face', val, 20, pillStyles(isEth ? 'ethnicity' : 'face_shape', isSelected(isEth ? 'ethnicity' : 'face_shape', val)).icon)}
                    {val}
                  </span>
                );
              })}
              {!facesExpanded && extraItemsAll.length > visibleExtraItems.length && (
                <span
                  onMouseDown={(e) => { e.preventDefault(); }}
                  onDoubleClick={handlePillDoubleClick}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFacesExpanded(true); (e.currentTarget as HTMLElement)?.blur?.(); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); setFacesExpanded(true); } }}
                  className="px-3 py-1.5 rounded-full border-2 border-gray-200 bg-white/90 text-gray-700 text-[0.8rem] font-medium cursor-pointer select-none"
                >
                  +{extraItemsAll.length - visibleExtraItems.length} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HairstyleModal;
