import React, { useState, memo, useRef, useEffect } from 'react';
import { Hairstyle } from '../types';
import { getMinimalIcon } from './MinimalIcons';

interface HairstyleCardProps {
  hairstyle: Hairstyle;
  onClick: () => void;
  onApplyFilter?: (
    type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape' | 'ethnicity',
    value: string,
    anchorId?: string
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
  adminMode?: boolean;
  ethnicityOptions?: string[];
  onUpdateEthnicity?: (id: string, ethnicity: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const HairstyleCard: React.FC<HairstyleCardProps> = ({ hairstyle, onClick, onApplyFilter, activeFilters, adminMode, ethnicityOptions = [], onUpdateEthnicity, isFavorite = false, onToggleFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(true);
  const [facesExpanded, setFacesExpanded] = useState(false);
  const [pendingEth, setPendingEth] = useState<string>(hairstyle.ethnicity || '');
  const [savedTick, setSavedTick] = useState(false);
  const cardId = React.useMemo(() => `hs-card-${hairstyle.id}`, [hairstyle.id]);
  const popRef = useRef<HTMLDivElement | null>(null);
  const clickTimeoutRef = useRef<number | undefined>(undefined);
  const badgeRevealTimeoutRef = useRef<number | undefined>(undefined);
  const badgeAppearResetRef = useRef<number | undefined>(undefined);
  const popAnimRef = useRef<Animation | null>(null);
  const [hideBadgeUntilPopDone, setHideBadgeUntilPopDone] = useState(false);
  const [badgeAppearing, setBadgeAppearing] = useState(false);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = undefined;
      }
      if (badgeRevealTimeoutRef.current) {
        window.clearTimeout(badgeRevealTimeoutRef.current);
        badgeRevealTimeoutRef.current = undefined;
      }
      if (badgeAppearResetRef.current) {
        window.clearTimeout(badgeAppearResetRef.current);
        badgeAppearResetRef.current = undefined;
      }
    };
  }, []);

  const playHeartPop = (onDone?: () => void) => {
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
        onDone && onDone();
        popAnimRef.current = null;
      };
    } catch {}
  };

  const cancelPendingOpen = () => {
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = undefined;
    }
  };

  const toggleFavWithPop = () => {
    if (!isFavorite) {
      // Delay the badge until pop completes
      setHideBadgeUntilPopDone(true);
      playHeartPop();
      // Reveal badge slightly before pop ends to feel continuous
      if (badgeRevealTimeoutRef.current) window.clearTimeout(badgeRevealTimeoutRef.current);
      badgeRevealTimeoutRef.current = window.setTimeout(() => {
        setHideBadgeUntilPopDone(false);
        setBadgeAppearing(true);
        if (badgeAppearResetRef.current) window.clearTimeout(badgeAppearResetRef.current);
        badgeAppearResetRef.current = window.setTimeout(() => {
          setBadgeAppearing(false);
          badgeAppearResetRef.current = undefined;
        }, 220);
        badgeRevealTimeoutRef.current = undefined;
      }, 520); // pop duration 600ms -> reveal 80ms before end
    } else {
      // If unfavoriting, ensure no pending delay keeps badge hidden later
      setHideBadgeUntilPopDone(false);
      setBadgeAppearing(false);
      if (badgeRevealTimeoutRef.current) { window.clearTimeout(badgeRevealTimeoutRef.current); badgeRevealTimeoutRef.current = undefined; }
      if (badgeAppearResetRef.current) { window.clearTimeout(badgeAppearResetRef.current); badgeAppearResetRef.current = undefined; }
      // Cancel any ongoing pop animation and hide overlay immediately
      const el = popRef.current as HTMLDivElement | null;
      if (popAnimRef.current) { try { popAnimRef.current.cancel(); } catch {} popAnimRef.current = null; }
      if (el) { el.style.opacity = '0'; el.style.visibility = 'hidden'; }
    }
    onToggleFavorite && onToggleFavorite();
  };

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Cancel pending single-click open
    cancelPendingOpen();
    toggleFavWithPop();
    try {
      (e.currentTarget as HTMLElement)?.animate?.([
        { transform: 'scale(0.985)' },
        { transform: 'scale(1)' },
      ], { duration: 140, easing: 'ease-out' });
    } catch {}
  };

  const handleCardClick = (_e: React.MouseEvent) => {
    // Delay opening to allow time for a potential double-click
    if (clickTimeoutRef.current) window.clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = window.setTimeout(() => {
      clickTimeoutRef.current = undefined;
      onClick();
    }, 250);
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
    (activeFilters.pose?.length ?? 0) > 0 ||
    (activeFilters.ethnicity?.length ?? 0) > 0
  );

  const isSelected = (type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape' | 'ethnicity', value: string) => {
    if (!activeFilters) return false;
    const list = (activeFilters as any)[type] as string[] | undefined;
    return Array.isArray(list) ? list.includes(value) : false;
  };

  const isAny = (v?: string) => typeof v === 'string' && v.trim().toLowerCase() === 'any';

  const pillStyles = (
    type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape' | 'ethnicity',
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
      // Use purple for ethnicity so it doesn't look like the app's blue accent when inactive
      ethnicity:  { classes: 'border-purple-200 bg-purple-50 text-purple-700', icon: '#7c3aed' },
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

  // Build overflow items: face shapes + ethnicity as a last item if present
  const extraItemsAll = React.useMemo(() => {
    const arr: string[] = [...(hairstyle.face_shapes || [])].filter(v => !isAny(v));
    if (hairstyle.ethnicity && !isAny(hairstyle.ethnicity)) arr.push(`__ETH__:${hairstyle.ethnicity}`);
    return arr;
  }, [hairstyle.face_shapes, hairstyle.ethnicity]);

  // Always render the card, even if image failed to load. We no longer hide the card on image error
  // to keep result counts consistent with the rendered grid.

  return (
    <div
      id={cardId}
      className="relative collage-card hs-card cursor-pointer bg-transparent group"
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
    >
      {/* Admin toolbar */}
      {adminMode && (
        <div
          className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur rounded-md border border-gray-200 shadow px-2 py-1 flex items-center gap-2 cursor-default"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <label className="text-xs text-gray-600">Ethnicity</label>
          <select
            className="text-xs border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={pendingEth}
            onClick={(e) => { e.stopPropagation(); }}
            onMouseDown={(e) => { e.stopPropagation(); }}
            onChange={(e) => { setPendingEth(e.target.value); setSavedTick(false); }}
          >
            <option value="">—</option>
            {ethnicityOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={(pendingEth || '') === (hairstyle.ethnicity || '')}
            onClick={(e) => {
              e.stopPropagation();
              if (onUpdateEthnicity) {
                onUpdateEthnicity(String(hairstyle.id), pendingEth);
                setSavedTick(true);
                setTimeout(() => setSavedTick(false), 1200);
              }
            }}
            title="Save ethnicity"
          >
            Save
          </button>
          {savedTick && <span className="text-green-600 text-xs">✓</span>}
        </div>
      )}
      <div className="flex flex-col gap-2 md:gap-3 p-0 bg-transparent">
        {/* Image */}
        <div className="photo-frame">
          <div
            className="photo-image-wrap select-none"
            onDoubleClick={(e) => {
              // Double-clicking the image toggles favorite and should not open the modal
              e.preventDefault();
              e.stopPropagation();
              cancelPendingOpen();
              toggleFavWithPop();
              try {
                // little pop animation on the wrapper
                (e.currentTarget as HTMLElement)?.animate?.([
                  { transform: 'scale(0.98)' },
                  { transform: 'scale(1)' },
                ], { duration: 160, easing: 'ease-out' });
              } catch {}
            }}
          >
            {imageLoaded ? (
              <>
                <img
                  className="hs-card-img w-full object-cover object-center select-none"
                  src={hairstyle.image_url}
                  alt={hairstyle.name}
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  draggable={false}
                  onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); cancelPendingOpen(); toggleFavWithPop(); }}
                />
                {/* Small bottom-right heart when favorited (delayed until pop completes) */}
                {isFavorite && !hideBadgeUntilPopDone && (
                  <div className={`absolute bottom-2 right-2 z-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 p-1.5 shadow text-rose-600 transition-all duration-200 ${badgeAppearing ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                )}
                {/* Bottom-right heart toggle when favorited */}
                {isFavorite && (
                  <button
                    type="button"
                    aria-label="Unfavorite"
                    title="Remove from favorites"
                    className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur rounded-full border border-gray-200 shadow p-2 hover:bg-white"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite && onToggleFavorite(); }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(244,63,94,0.9)" stroke="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                )}
                {/* Center heart pop animation (grid only). Hidden by default via inline style. */}
                <div ref={popRef} className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ opacity: 0, visibility: 'hidden' }}>
                  <svg width="110" height="110" viewBox="0 0 24 24" fill="rgba(244,63,94,0.85)" stroke="rgba(244,63,94,0.95)" strokeWidth="0" style={{ filter: 'drop-shadow(0 6px 12px rgba(244,63,94,0.35))' }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
              </>
            ) : (
              <div className="relative w-[300px] h-[500px] md:h-[40vh] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 rounded-md animate-pulse flex items-center justify-center select-none mx-auto">
                <div className="flex flex-col items-center text-gray-500">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 mb-2">
                    <path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l1-2h8l1 2h2a2 2 0 0 1 2 2v11zM7 13l2.5 3.01L12 13l3 4H6l1-1z" />
                  </svg>
                  <span className="text-sm">Image unavailable</span>
                </div>
              </div>
            )}
            {sourceHost && (
              <a
                href={hairstyle.image_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.stopPropagation(); }}
                className="img-attrib opacity-80 group-hover:opacity-35 transition-opacity duration-200"
                title={`Open source: ${sourceHost}`}
              >
                {sourceHost}
              </a>
            )}
          </div>
          {/* Polaroid-style handwritten caption (only if a title exists) */}
          {((hairstyle.name || '').trim().length > 0) && (
            <div className="polaroid-caption text-center select-none">
              {hairstyle.name}
            </div>
          )}
        </div>
        {/* Description */}
        <div className="paper-sheet p-4 md:p-5">
          <p className="text-gray-600 text-sm mb-4 leading-6 line-clamp-2 select-none">{hairstyle.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Length */}
            {!isAny(hairstyle.length) && (
              <span
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('length', hairstyle.length, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('length', hairstyle.length, cardId); animatePill(e.currentTarget as HTMLElement); } }}
                className={pillStyles('length', isSelected('length', hairstyle.length)).className}
                onDoubleClick={handlePillDoubleClick}
              >
                {getMinimalIcon('length', hairstyle.length, 20, pillStyles('length', isSelected('length', hairstyle.length)).icon)}
                {hairstyle.length}
              </span>
            )}
            {/* Texture */}
            {!isAny(hairstyle.texture) && (
              <span
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('texture', hairstyle.texture, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('texture', hairstyle.texture, cardId); animatePill(e.currentTarget as HTMLElement); } }}
                className={pillStyles('texture', isSelected('texture', hairstyle.texture)).className}
                onDoubleClick={handlePillDoubleClick}
              >
                {getMinimalIcon('texture', hairstyle.texture, 20, pillStyles('texture', isSelected('texture', hairstyle.texture)).icon)}
                {hairstyle.texture}
              </span>
            )}
            {/* Type */}
            {!isAny(hairstyle.style_type) && (
              <span
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('style_type', hairstyle.style_type, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('style_type', hairstyle.style_type, cardId); animatePill(e.currentTarget as HTMLElement); } }}
                className={pillStyles('style_type', isSelected('style_type', hairstyle.style_type)).className}
                onDoubleClick={handlePillDoubleClick}
              >
                {getMinimalIcon('style', hairstyle.style_type, 20, pillStyles('style_type', isSelected('style_type', hairstyle.style_type)).icon)}
                {hairstyle.style_type}
              </span>
            )}
            {/* Pose */}
            {!isAny(hairstyle.pose) && (
              <span
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter('pose', hairstyle.pose, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter('pose', hairstyle.pose, cardId); animatePill(e.currentTarget as HTMLElement); } }}
                className={pillStyles('pose', isSelected('pose', hairstyle.pose)).className}
                onDoubleClick={handlePillDoubleClick}
              >
                {getMinimalIcon('pose', hairstyle.pose, 20, pillStyles('pose', isSelected('pose', hairstyle.pose)).icon)}
                {hairstyle.pose}
              </span>
            )}
            {/* Face shapes + Ethnicity overflow: show up to 2, fold rest into +N more */}
            {(facesExpanded ? extraItemsAll : extraItemsAll.slice(0, 2)).map((item) => {
              const isEth = item.startsWith('__ETH__:');
              const val = isEth ? item.replace('__ETH__:', '') : item;
              return (
                <span
                  key={(isEth ? 'eth-' : 'face-') + val}
                  onMouseDown={(e) => { e.preventDefault(); }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApplyFilter && onApplyFilter(isEth ? 'ethnicity' : 'face_shape', val, cardId); animatePill(e.currentTarget); (e.currentTarget as HTMLElement)?.blur?.(); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); onApplyFilter && onApplyFilter(isEth ? 'ethnicity' : 'face_shape', val, cardId); animatePill(e.currentTarget as HTMLElement); } }}
                  className={pillStyles(isEth ? 'ethnicity' : 'face_shape', isSelected(isEth ? 'ethnicity' : 'face_shape', val)).className}
                  onDoubleClick={handlePillDoubleClick}
                >
                  {getMinimalIcon(isEth ? 'ethnicity' : 'face', val, 20, pillStyles(isEth ? 'ethnicity' : 'face_shape', isSelected(isEth ? 'ethnicity' : 'face_shape', val)).icon)}
                  {val}
                </span>
              );
            })}
            {!facesExpanded && extraItemsAll.length > 2 && (
              <span
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFacesExpanded(true); (e.currentTarget as HTMLElement)?.blur?.(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e as any).stopPropagation?.(); setFacesExpanded(true); } }}
                className="px-3 py-1.5 rounded-full border-2 border-gray-200 bg-white/90 text-gray-700 text-[0.8rem] font-medium cursor-pointer select-none"
              >
                +{extraItemsAll.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(HairstyleCard);
