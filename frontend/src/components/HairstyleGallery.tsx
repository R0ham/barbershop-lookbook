import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Hairstyle, Filters } from '../types';
import HairstyleCard from './HairstyleCard';
import FilterPanel from './FilterPanel';
import HairstyleModal from './HairstyleModal';

// API base resolution:
// - If REACT_APP_API_BASE_URL is provided:
//    - Append '/api' if it doesn't already include '/api' at the end
//    - Preserve '/api' or '/.netlify/functions/api' if already present
// - Otherwise, default to same-origin '/api' (Netlify redirect handles it in prod)
const RAW_BASE = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '') || '';
const HAS_API_SEGMENT = /(^|\/)api(\b|\/)/.test(RAW_BASE);
const API_BASE = RAW_BASE
  ? (HAS_API_SEGMENT ? RAW_BASE : `${RAW_BASE}/api`)
  : '/api';

const HairstyleGallery: React.FC<{ headerSearch?: string }> = ({ headerSearch }) => {
  const [filteredHairstyles, setFilteredHairstyles] = useState<Hairstyle[]>([]);
  // Client-side dedupe: hide repeated images (same image_url) in the current list
  const uniqueFilteredHairstyles = useMemo(() => {
    const seen = new Set<string>();
    return filteredHairstyles.filter(h => {
      const key = String((h as any)?.image_url || '');
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredHairstyles]);
  const [filters, setFilters] = useState<Filters>({
    lengths: [],
    textures: [],
    face_shapes: [],
    style_types: [],
    poses: [],
    ethnicities: []
  });
  const [activeFilters, setActiveFilters] = useState({
    length: [] as string[],
    texture: [] as string[],
    face_shape: [] as string[],
    style_type: [] as string[],
    pose: [] as string[],
    ethnicity: [] as string[],
    search: ''
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Hairstyle | null>(null);
  const isAdmin = React.useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('admin') === '1';
    } catch { return false; }
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 100;
  const lastScrollYRef = useRef<number | null>(null);
  const lastAnchorIdRef = useRef<string | null>(null);
  const latestFetchIdRef = useRef(0);
  const [isCountHover, setIsCountHover] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  // Favorite IDs are stored locally in the browser
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('hs_favorites');
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as string[];
      return new Set(arr);
    } catch { return new Set(); }
  });
  const persistFavorites = (next: Set<string>) => {
    try { localStorage.setItem('hs_favorites', JSON.stringify(Array.from(next))); } catch {}
  };
  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      persistFavorites(n);
      return n;
    });
  };
  // Disable scroll restoration to avoid menu/popover clipping during filter changes
  const enableScrollRestore = false;

  useEffect(() => {
    fetchFilters();
    fetchHairstyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters or search change (stable primitive deps)
  const lengthDep = activeFilters.length.join(',');
  const textureDep = activeFilters.texture.join(',');
  const faceDep = activeFilters.face_shape.join(',');
  const styleDep = activeFilters.style_type.join(',');
  const poseDep = activeFilters.pose.join(',');
  const ethnicityDep = activeFilters.ethnicity.join(',');
  useEffect(() => {
    fetchHairstyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengthDep, textureDep, faceDep, styleDep, poseDep, ethnicityDep, activeFilters.search]);

  // Reset page to 1 when filters/search change or data changes
  useEffect(() => {
    setPage(1);
  }, [lengthDep, textureDep, faceDep, styleDep, poseDep, ethnicityDep, activeFilters.search]);

  // If headerSearch prop changes, run the existing search handler to sync filters
  useEffect(() => {
    if (typeof headerSearch === 'string') {
      handleSearch(headerSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerSearch]);

  // Initialize favoritesOnly from URL (?fav=1 or true)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const favParam = sp.get('fav');
      if (favParam && (favParam === '1' || favParam.toLowerCase() === 'true')) {
        setFavoritesOnly(true);
      }
    } catch {}
  }, []);

  // Persist favoritesOnly to URL (replaceState, keep other params)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (favoritesOnly) {
        url.searchParams.set('fav', '1');
      } else {
        url.searchParams.delete('fav');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [favoritesOnly]);

  // Optionally filter current list down to favorites only
  const viewHairstyles = useMemo(() => (
    favoritesOnly
      ? uniqueFilteredHairstyles.filter(h => favoriteIds.has(String(h.id)))
      : uniqueFilteredHairstyles
  ), [favoritesOnly, uniqueFilteredHairstyles, favoriteIds]);

  // Are there any active non-search filters?
  const hasActiveFilters = useMemo(() => {
    return (
      activeFilters.length.length > 0 ||
      activeFilters.texture.length > 0 ||
      activeFilters.face_shape.length > 0 ||
      activeFilters.style_type.length > 0 ||
      activeFilters.pose.length > 0 ||
      activeFilters.ethnicity.length > 0 ||
      (activeFilters.search?.trim() ?? '') !== ''
    );
  }, [activeFilters]);

  // Pagination derived values use the view list
  const total = viewHairstyles.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);
  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedPage]);
  const start = (clampedPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = useMemo(() => viewHairstyles.slice(start, end), [viewHairstyles, start, end]);

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_BASE}/filters`);
      if (!response.ok) throw new Error('Failed to fetch filters');
      const data = await response.json();
      // Ensure compatibility if backend still returns categories
      const { lengths, textures, face_shapes, style_types, poses, ethnicities } = data;
      // Normalize pose label: use 'Facing' instead of 'Straight-on' for UI/state
      const posesNorm = (poses || []).map((p: string) => p === 'Straight-on' ? 'Facing' : p);
      const defaultEth = ['Caucasian', 'Asian', 'Afro'];
      const eth = Array.isArray(ethnicities) && ethnicities.length > 0 ? ethnicities : defaultEth;
      setFilters({ lengths, textures, face_shapes, style_types, poses: posesNorm, ethnicities: eth });
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const updateEthnicity = async (id: string, ethnicity: string) => {
    try {
      const res = await fetch(`${API_BASE}/hairstyles/${id}/ethnicity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ethnicity })
      });
      if (!res.ok) throw new Error('Failed to update ethnicity');
      // Update local lists
      setFilteredHairstyles(prev => prev.map(h => h.id === id ? { ...h, ethnicity } : h));
      // If the modal is open on this item, ensure the in-modal view reflects the change
      if (selectedIndex != null) {
        setSelectedIndex((idx) => idx); // no-op to trigger re-render
      }
    } catch (e) {
      console.error('Error updating ethnicity:', e);
      alert('Failed to update ethnicity');
    }
  };

  const fetchHairstyles = async () => {
    try {
      setLoading(true);
      const myId = ++latestFetchIdRef.current;
      const queryParams = new URLSearchParams();

      Object.entries(activeFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Translate canonical 'Facing' back to backend's 'Straight-on'
            const mapped = key === 'pose' ? value.map(v => v === 'Facing' ? 'Straight-on' : v) : value;
            queryParams.append(key, mapped.join(','));
          }
        } else if (value) {
          const mapped = (key === 'pose' && value === 'Facing') ? 'Straight-on' : value;
          queryParams.append(key, mapped as string);
        }
      });

      const response = await fetch(`${API_BASE}/hairstyles?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch hairstyles');
      
      const data = await response.json();
      // If a newer request has started, ignore this result
      if (myId !== latestFetchIdRef.current) return;
      // Normalize any legacy pose values from backend to canonical 'Facing'
      const normalized = Array.isArray(data)
        ? data.map((h: any) => ({ ...h, pose: (h?.pose === 'Straight-on') ? 'Facing' : h?.pose }))
        : data;
      setFilteredHairstyles(normalized);
      setError(null);
    } catch (err) {
      setError('Failed to load hairstyles. Please try again.');
      console.error('Error fetching hairstyles:', err);
    } finally {
      setLoading(false);
    }
  };

  const shallowArrayEqual = (a: string[] | undefined, b: string[] | undefined) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const handleFilterChange = (filterType: string, value: string | string[]) => {
    // Preserve current scroll position when changing filters from the menu
    try { lastScrollYRef.current = window.scrollY; } catch {}
    setActiveFilters(prev => {
      const prevVal = (prev as any)[filterType];
      if (Array.isArray(value) && Array.isArray(prevVal)) {
        if (shallowArrayEqual(prevVal, value)) return prev; // no change
      } else if (!Array.isArray(value) && !Array.isArray(prevVal)) {
        if (prevVal === value) return prev; // no change
      }
      return { ...prev, [filterType]: value } as typeof prev;
    });
  };

  const handleSearch = (searchTerm: string) => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const rawTokens = searchTerm.split(/\s+/).map(t => t.trim()).filter(Boolean);
    const normTokens = rawTokens.map(normalize);

    // Build option maps for exact lookup and arrays for partial matching
    const makeMap = (opts: string[]) => {
      const m = new Map<string, string>();
      opts.forEach(o => m.set(normalize(o), o));
      return m;
    };
    const lengths = filters.lengths || [];
    const textures = (filters.textures || []).filter(t => t !== 'Any' && t !== 'any');
    const faces = filters.face_shapes || [];
    const styles = filters.style_types || [];
    const poses = filters.poses || [];
    const ethnics = filters.ethnicities || [];

    const lengthMap = makeMap(lengths);
    const textureMap = makeMap(textures);
    const faceMap = makeMap(faces);
    const styleMap = makeMap(styles);
    const poseMap = makeMap(poses);
    const ethnicMap = makeMap(ethnics);

    const matched = {
      length: [] as string[],
      texture: [] as string[],
      face_shape: [] as string[],
      style_type: [] as string[],
      pose: [] as string[],
      ethnicity: [] as string[],
    };

    // Phrase/alias rules (extendable)
    const phraseRules: Array<{ test: (s: string) => boolean; apply: () => void; consume?: string[] }>
      = [
        { test: s => /\bpixie\s*cut\b/.test(s), apply: () => { if (lengths.includes('Short')) matched.length.push('Short'); if (styles.includes('Feminine')) matched.style_type.push('Feminine'); }, consume: ['pixie','cut'] },
        { test: s => /\bbuzz\s*cut\b/.test(s), apply: () => { if (lengths.includes('Short')) matched.length.push('Short'); }, consume: ['buzz','cut'] },
        { test: s => /\bbob(\s*cut)?\b/.test(s), apply: () => { if (lengths.includes('Short')) matched.length.push('Short'); if (styles.includes('Feminine')) matched.style_type.push('Feminine'); }, consume: ['bob','cut'] },
        { test: s => /\bshoulder\s*length\b/.test(s), apply: () => { if (lengths.includes('Medium')) matched.length.push('Medium'); }, consume: ['shoulder','length'] },
        { test: s => /\blong\s*hair\b/.test(s), apply: () => { if (lengths.includes('Long')) matched.length.push('Long'); }, consume: ['long','hair'] },
        { test: s => /\bside\s*(profile|view)\b/.test(s), apply: () => { if (poses.includes('Side')) matched.pose.push('Side'); }, consume: ['side','profile','view'] },
        { test: s => /\b(straight[-\s]*on|front\s*facing)\b/.test(s), apply: () => { if (poses.includes('Facing')) matched.pose.push('Facing'); }, consume: ['straight','on','front','facing'] },
        { test: s => /\b(angled\s*view|three\s*quarter|3\/4)\b/.test(s), apply: () => { if (poses.includes('Angled')) matched.pose.push('Angled'); }, consume: ['angled','view','three','quarter'] },
      ];

    const lowerStr = ` ${rawTokens.join(' ').toLowerCase()} `;
    const consumed = new Set<string>();
    phraseRules.forEach(rule => {
      try {
        if (rule.test(lowerStr)) {
          rule.apply();
          (rule.consume || []).forEach(w => consumed.add(normalize(w)));
        }
      } catch {}
    });

    // Helper to try matching a token to an options list (exact then partial)
    const tryMatch = (tokenNorm: string, options: string[], map: Map<string,string>): string | null => {
      if (map.has(tokenNorm)) return map.get(tokenNorm)!;
      if (tokenNorm.length >= 3) {
        // startsWith (token -> option) or (option -> token)
        const hit = options.find(o => {
          const on = normalize(o);
          return on.startsWith(tokenNorm) || tokenNorm.startsWith(on);
        });
        if (hit) return hit;
      }
      return null;
    };

    const remaining: string[] = [];
    rawTokens.forEach((tok, idx) => {
      const n = normTokens[idx];
      if (consumed.has(n)) return; // consumed by a phrase
      // Try each category
      const l = tryMatch(n, lengths, lengthMap);
      if (l) { matched.length.push(l); return; }
      const t = tryMatch(n, textures, textureMap);
      if (t) { matched.texture.push(t); return; }
      const f = tryMatch(n, faces, faceMap);
      if (f) { matched.face_shape.push(f); return; }
      const s = tryMatch(n, styles, styleMap);
      if (s) { matched.style_type.push(s); return; }
      const p = tryMatch(n, poses, poseMap);
      if (p) { matched.pose.push(p); return; }
      const e = tryMatch(n, ethnics, ethnicMap);
      if (e) { matched.ethnicity.push(e); return; }
      remaining.push(tok);
    });

    // Deduplicate and merge with existing active filters
    setActiveFilters(prev => {
      const mergeUnique = (a: string[], b: string[]) => Array.from(new Set([...(a || []), ...b]));
      const next = {
        ...prev,
        length: mergeUnique(prev.length, matched.length),
        texture: mergeUnique(prev.texture, matched.texture),
        face_shape: mergeUnique(prev.face_shape, matched.face_shape),
        style_type: mergeUnique(prev.style_type, matched.style_type),
        pose: mergeUnique(prev.pose, matched.pose),
        ethnicity: mergeUnique(prev.ethnicity, matched.ethnicity),
        search: remaining.join(' ')
      };

      const noChange =
        shallowArrayEqual(prev.length, next.length) &&
        shallowArrayEqual(prev.texture, next.texture) &&
        shallowArrayEqual(prev.face_shape, next.face_shape) &&
        shallowArrayEqual(prev.style_type, next.style_type) &&
        shallowArrayEqual(prev.pose, next.pose) &&
        shallowArrayEqual(prev.ethnicity, next.ethnicity) &&
        prev.search === next.search;
      return noChange ? prev : next;
    });
  };

  const clearFilters = () => {
    // Preserve scroll on clear-all from menu or button
    try { lastScrollYRef.current = window.scrollY; } catch {}
    setActiveFilters({
      length: [],
      texture: [],
      face_shape: [],
      style_type: [],
      pose: [],
      ethnicity: [],
      search: ''
    });
  };

  // Handler for clicks coming from cards to apply a single filter value
  const onApplyFilter = (
    type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape' | 'ethnicity',
    value: string,
    anchorId?: string
  ) => {
    // Save current scroll position and clicked anchor id to restore after data reload
    try { lastScrollYRef.current = window.scrollY; } catch {}
    if (anchorId) lastAnchorIdRef.current = anchorId;
    setActiveFilters(prev => {
      const current = (prev as any)[type] as string[];
      if (Array.isArray(current)) {
        if (current.includes(value)) {
          const nextArr = current.filter(v => v !== value);
          return { ...prev, [type]: nextArr } as typeof prev;
        }
        return { ...prev, [type]: [...current, value] } as typeof prev;
      }
      // Fallback (schema uses arrays for these)
      return { ...prev, [type]: [value] } as typeof prev;
    });
  };

  // When a load finishes after user-applied filters, optionally restore scroll (disabled)
  useEffect(() => {
    if (!enableScrollRestore) return;
    if (!loading) {
      const anchorId = lastAnchorIdRef.current;
      lastAnchorIdRef.current = null;
      if (anchorId) {
        const el = document.getElementById(anchorId);
        if (el) {
          try {
            requestAnimationFrame(() => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }));
          } catch {
            try { el.scrollIntoView(); } catch {}
          }
          return; // don't also restore scrollY if we focused a specific element
        }
      }
      if (lastScrollYRef.current != null) {
        const y = lastScrollYRef.current;
        lastScrollYRef.current = null;
        try {
          requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
        } catch {
          try { window.scrollTo(0, y); } catch {}
        }
      }
    }
  }, [loading, enableScrollRestore]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchHairstyles}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Card (search moved to header in App) */}
      <div className="paper-card perforated-left p-6 mb-8">
        <FilterPanel
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Favorites filter toggle under filters, aligned right */}
      <div className="flex justify-end -mt-6 mb-6 px-1">
        <button
          onMouseDown={(e) => { e.preventDefault(); }}
          onClick={(e) => { e.preventDefault(); setFavoritesOnly(v => !v); (e.currentTarget as HTMLButtonElement)?.blur?.(); setPage(1); }}
          className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium inline-flex items-center gap-2 ${favoritesOnly ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'bg-white text-red-600 border-red-300 hover:bg-red-50'}`}
          title={favoritesOnly ? 'Show all results' : 'Show favorites only'}
          aria-pressed={favoritesOnly}
        >
          {/* Heart icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-4 h-4"
            aria-hidden
            fill={favoritesOnly ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.016-4.5-4.5-4.5-1.74 0-3.243.99-4 2.43-.757-1.44-2.26-2.43-4-2.43C6.016 3.75 4 5.765 4 8.25c0 7.22 8.5 12 8.5 12s8.5-4.78 8.5-12z" />
          </svg>
          <span>{favoritesOnly ? 'Favorites only' : 'Favorites only'}</span>
        </button>
      </div>

      {/* Results Count / Clear All (blue themed) */}
      <div className="text-center mb-8">
        <button
          onMouseDown={(e) => { e.preventDefault(); }}
          onClick={(e) => { e.preventDefault(); clearFilters(); (e.currentTarget as HTMLButtonElement)?.blur?.(); }}
          title="Clear all filters"
          className={`rounded-full px-5 py-2.5 inline-flex items-center gap-2 border-2 cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${hasActiveFilters ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700' : 'bg-white text-blue-700 border-blue-400 hover:bg-blue-50'}`}
          aria-busy={loading}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Updating…</span>
            </span>
          ) : (() => {
            const count = viewHairstyles.length;
            return (
              <>
                <span>{count} classic cut{count !== 1 ? 's' : ''}</span>
                {hasActiveFilters && <span aria-hidden>•</span>}
                {hasActiveFilters && <span className="font-semibold">Clear all</span>}
              </>
            );
          })()}
        </button>
      </div>

      {/* Gallery Grid with client-side pagination */}
      {filteredHairstyles.length === 0 ? (
        <div className="text-center py-16">
          <div className="paper-card p-10 max-w-md mx-auto">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-gray-600 text-lg mb-6">No hairstyles match your criteria</div>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full shadow-sm text-base font-medium hover:bg-blue-700"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="grid collage-grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-8 max-w-7xl w-full">
              {pageItems.map((hairstyle) => (
                <HairstyleCard
                  key={hairstyle.id}
                  hairstyle={hairstyle}
                  onClick={() => {
                    const idx = viewHairstyles.findIndex(h => String(h.id) === String(hairstyle.id));
                    if (idx >= 0) {
                      setSelectedIndex(idx);
                      setSelectedId(String(hairstyle.id));
                      setSelectedSnapshot(hairstyle);
                    }
                  }}
                  onApplyFilter={onApplyFilter}
                  activeFilters={activeFilters}
                  adminMode={isAdmin}
                  ethnicityOptions={filters.ethnicities}
                  onUpdateEthnicity={updateEthnicity}
                  isFavorite={favoriteIds.has(String(hairstyle.id))}
                  onToggleFavorite={() => toggleFavorite(String(hairstyle.id))}
                />
              ))}
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={clampedPage <= 1}
              className={`px-3 py-2 rounded-md transition-colors ${clampedPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Prev
            </button>
            <div className="text-gray-600 text-sm">
              <strong>{start + 1}</strong>–<strong>{end}</strong> of <strong>{total}</strong>
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={clampedPage >= totalPages}
              className={`px-3 py-2 rounded-md transition-colors ${clampedPage >= totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal with carousel */}
      {selectedIndex != null && selectedId != null && (
        (() => {
          // Realign selectedIndex to the same ID when the view list changes
          const byIdIdx = viewHairstyles.findIndex(h => String(h.id) === String(selectedId));
          const currentIdx = byIdIdx >= 0 ? byIdIdx : selectedIndex;
          const inList = byIdIdx >= 0;
          const currentHs = inList
            ? viewHairstyles[currentIdx]
            : (selectedSnapshot || viewHairstyles[selectedIndex] || null);
          if (!currentHs) return null;
          const canNavigate = inList && viewHairstyles.length > 0;
          if (byIdIdx !== selectedIndex && byIdIdx >= 0) {
            // Sync state if ID moved
            setSelectedIndex(byIdIdx);
          }
          return (
            <HairstyleModal
              hairstyle={currentHs}
              activeFilters={activeFilters}
              onClose={() => { setSelectedIndex(null); setSelectedId(null); setSelectedSnapshot(null); }}
              onPrev={canNavigate ? () => setSelectedIndex((idx) => {
                if (idx == null) return idx;
                const n = viewHairstyles.length;
                const next = (idx - 1 + n) % n;
                const nextId = viewHairstyles[next]?.id;
                if (nextId != null) setSelectedId(String(nextId));
                return next;
              }) : undefined}
              onNext={canNavigate ? () => setSelectedIndex((idx) => {
                if (idx == null) return idx;
                const n = viewHairstyles.length;
                const next = (idx + 1) % n;
                const nextId = viewHairstyles[next]?.id;
                if (nextId != null) setSelectedId(String(nextId));
                return next;
              }) : undefined}
              isFavorite={favoriteIds.has(String(currentHs.id))}
              onToggleFavorite={() => toggleFavorite(String(currentHs.id))}
              onApplyFilter={(type, value) => onApplyFilter(type, value)}
            />
          );
        })()
      )}
    </div>
  );
};

export default HairstyleGallery;
