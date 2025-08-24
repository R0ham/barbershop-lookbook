import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Hairstyle, Filters } from '../types';
import HairstyleCard from './HairstyleCard';
import FilterPanel from './FilterPanel';
import HairstyleModal from './HairstyleModal';

const API_BASE_URL = 'http://localhost:5001/api';

const HairstyleGallery: React.FC<{ headerSearch?: string }> = ({ headerSearch }) => {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [filteredHairstyles, setFilteredHairstyles] = useState<Hairstyle[]>([]);
  const [filters, setFilters] = useState<Filters>({
    lengths: [],
    textures: [],
    face_shapes: [],
    style_types: [],
    poses: []
  });
  const [activeFilters, setActiveFilters] = useState({
    length: [] as string[],
    texture: [] as string[],
    face_shape: [] as string[],
    style_type: [] as string[],
    pose: [] as string[],
    search: ''
  });
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const lastScrollYRef = useRef<number | null>(null);
  const lastAnchorIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetchFilters();
    fetchHairstyles();
  }, []);

  // Refetch when filters or search change (stable primitive deps)
  const lengthDep = activeFilters.length.join(',');
  const textureDep = activeFilters.texture.join(',');
  const faceDep = activeFilters.face_shape.join(',');
  const styleDep = activeFilters.style_type.join(',');
  const poseDep = activeFilters.pose.join(',');
  useEffect(() => {
    fetchHairstyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengthDep, textureDep, faceDep, styleDep, poseDep, activeFilters.search]);

  // Reset page to 1 when filters/search change or data changes
  useEffect(() => {
    setPage(1);
  }, [lengthDep, textureDep, faceDep, styleDep, poseDep, activeFilters.search]);

  // If headerSearch prop changes, run the existing search handler to sync filters
  useEffect(() => {
    if (typeof headerSearch === 'string') {
      handleSearch(headerSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerSearch]);

  // Pagination derived values
  const total = filteredHairstyles.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);
  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [clampedPage]);
  const start = (clampedPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = useMemo(() => filteredHairstyles.slice(start, end), [filteredHairstyles, start, end]);

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/filters`);
      if (!response.ok) throw new Error('Failed to fetch filters');
      const data = await response.json();
      // Ensure compatibility if backend still returns categories
      const { lengths, textures, face_shapes, style_types, poses } = data;
      setFilters({ lengths, textures, face_shapes, style_types, poses });
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const fetchHairstyles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(activeFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) queryParams.append(key, value.join(','));
        } else if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/hairstyles?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch hairstyles');
      
      const data = await response.json();
      setHairstyles(data);
      setFilteredHairstyles(data);
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

    const lengthMap = makeMap(lengths);
    const textureMap = makeMap(textures);
    const faceMap = makeMap(faces);
    const styleMap = makeMap(styles);
    const poseMap = makeMap(poses);

    const matched = {
      length: [] as string[],
      texture: [] as string[],
      face_shape: [] as string[],
      style_type: [] as string[],
      pose: [] as string[],
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
        { test: s => /\b(straight[-\s]*on|front\s*facing)\b/.test(s), apply: () => { if (poses.includes('Straight-on')) matched.pose.push('Straight-on'); }, consume: ['straight','on','front','facing'] },
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
        search: remaining.join(' ')
      };

      const noChange =
        shallowArrayEqual(prev.length, next.length) &&
        shallowArrayEqual(prev.texture, next.texture) &&
        shallowArrayEqual(prev.face_shape, next.face_shape) &&
        shallowArrayEqual(prev.style_type, next.style_type) &&
        shallowArrayEqual(prev.pose, next.pose) &&
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
      search: ''
    });
  };

  // Handler for clicks coming from cards to apply a single filter value
  const onApplyFilter = (
    type: 'length' | 'texture' | 'style_type' | 'pose' | 'face_shape',
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

  // When a load finishes after user-applied filters, restore scroll
  useEffect(() => {
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
  }, [loading]);

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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8 relative overflow-hidden">
        {/* Accent line - subtle blue */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-gray-200 to-blue-900" />
        <FilterPanel
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Results Count / Clear All */}
      <div className="text-center mb-8">
        <button
          onMouseDown={(e) => { e.preventDefault(); }}
          onClick={(e) => { e.preventDefault(); clearFilters(); (e.currentTarget as HTMLButtonElement)?.blur?.(); }}
          title="Clear all filters"
          className="text-gray-800 bg-gradient-to-tr from-blue-400/15 to-blue-900/12 rounded-full px-5 py-2.5 inline-flex items-center gap-2 shadow-md border border-gray-200 cursor-pointer transition-colors duration-150 hover:bg-blue-600 hover:text-white hover:border-blue-600 focus:bg-blue-600 focus:text-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          {(() => {
            const hasActive =
              activeFilters.length.length > 0 ||
              activeFilters.texture.length > 0 ||
              activeFilters.face_shape.length > 0 ||
              activeFilters.style_type.length > 0 ||
              activeFilters.pose.length > 0 ||
              (activeFilters.search?.trim() ?? '') !== '';
            return (
              <>
                <span>{filteredHairstyles.length} classic cut{filteredHairstyles.length !== 1 ? 's' : ''}</span>
                {hasActive && <span aria-hidden>•</span>}
                {hasActive && <span className="font-semibold">Clear all</span>}
              </>
            );
          })()}
        </button>
      </div>

      {/* Gallery Grid with client-side pagination */}
      {filteredHairstyles.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl p-12 max-w-md mx-auto">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-gray-600 text-lg mb-6">No hairstyles match your criteria</div>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg transition-transform duration-300 text-base font-medium hover:from-pink-600 hover:to-purple-700 hover:scale-105"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-8 max-w-7xl w-full">
              {pageItems.map((hairstyle) => (
                <HairstyleCard
                  key={hairstyle.id}
                  hairstyle={hairstyle}
                  onClick={() => setSelectedHairstyle(hairstyle)}
                  onApplyFilter={onApplyFilter}
                  activeFilters={activeFilters}
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

      {/* Modal */}
      {selectedHairstyle && (
        <HairstyleModal
          hairstyle={selectedHairstyle}
          onClose={() => setSelectedHairstyle(null)}
        />
      )}
    </div>
  );
};

export default HairstyleGallery;
