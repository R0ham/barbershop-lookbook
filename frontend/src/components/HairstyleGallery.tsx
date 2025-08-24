import React, { useState, useEffect, useMemo } from 'react';
import { Hairstyle, Filters } from '../types';
import HairstyleCard from './HairstyleCard';
import FilterPanel from './FilterPanel';
import SearchBar from './SearchBar';
import HairstyleModal from './HairstyleModal';

const API_BASE_URL = 'http://localhost:5001/api';

const HairstyleGallery: React.FC = () => {
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
    setActiveFilters({
      length: [],
      texture: [],
      face_shape: [],
      style_type: [],
      pose: [],
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search and Filters */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        padding: '2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden' // clip accent to follow rounded corners
      }}>
        {/* Accent line - subtle blue */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #60a5fa, #e5e7eb, #1e40af, #60a5fa)'
        }} />

        <SearchBar onSearch={handleSearch} />
        <FilterPanel
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Results Count / Clear All */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={clearFilters}
          title="Clear all filters"
          style={{ 
            fontSize: '1.0rem', 
            fontWeight: 600, 
            color: '#1f2937',
            background: 'linear-gradient(45deg, rgba(96, 165, 250, 0.15), rgba(30, 64, 175, 0.12))',
            borderRadius: '9999px',
            padding: '0.6rem 1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.border = '1px solid #2563eb';
            e.currentTarget.style.boxShadow = '0 10px 16px rgba(37, 99, 235, 0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'linear-gradient(45deg, rgba(96, 165, 250, 0.15), rgba(30, 64, 175, 0.12))';
            e.currentTarget.style.color = '#1f2937';
            e.currentTarget.style.border = '1px solid #e5e7eb';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.06)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.border = '1px solid #2563eb';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.35)';
            e.currentTarget.style.outline = 'none';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = 'linear-gradient(45deg, rgba(96, 165, 250, 0.15), rgba(30, 64, 175, 0.12))';
            e.currentTarget.style.color = '#1f2937';
            e.currentTarget.style.border = '1px solid #e5e7eb';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.06)';
            e.currentTarget.style.outline = '';
          }}
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
                {hasActive && <span style={{ color: 'inherit', fontWeight: 600 }}>Clear all</span>}
                <span aria-hidden>✂️</span>
              </>
            );
          })()}
        </button>
      </div>

      {/* Gallery Grid with client-side pagination */}
      {filteredHairstyles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(8px)', 
            borderRadius: '1rem', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            padding: '3rem', 
            maxWidth: '28rem', 
            margin: '0 auto' 
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ color: '#4b5563', fontSize: '1.125rem', marginBottom: '1.5rem' }}>No hairstyles match your criteria</div>
            <button
              onClick={clearFilters}
              style={{ 
                background: 'linear-gradient(to right, #ec4899, #9333ea)', 
                color: 'white', 
                padding: '0.75rem 2rem', 
                borderRadius: '9999px', 
                border: 'none', 
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                fontSize: '1rem',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #db2777, #7c3aed)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #ec4899, #9333ea)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem', 
              maxWidth: '80rem',
              width: '100%'
            }}>
              {pageItems.map((hairstyle) => (
                <HairstyleCard
                  key={hairstyle.id}
                  hairstyle={hairstyle}
                  onClick={() => setSelectedHairstyle(hairstyle)}
                />
              ))}
            </div>
          </div>

          {/* Pagination controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={clampedPage <= 1}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '0.5rem',
                background: clampedPage <= 1 ? '#e5e7eb' : '#2563eb',
                color: clampedPage <= 1 ? '#6b7280' : '#ffffff',
                border: 'none',
                cursor: clampedPage <= 1 ? 'not-allowed' : 'pointer',
                transition: 'background 150ms ease'
              }}
            >
              Prev
            </button>
            <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>
              <strong>{start + 1}</strong>–<strong>{end}</strong> of <strong>{total}</strong>
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={clampedPage >= totalPages}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '0.5rem',
                background: clampedPage >= totalPages ? '#e5e7eb' : '#2563eb',
                color: clampedPage >= totalPages ? '#6b7280' : '#ffffff',
                border: 'none',
                cursor: clampedPage >= totalPages ? 'not-allowed' : 'pointer',
                transition: 'background 150ms ease'
              }}
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
