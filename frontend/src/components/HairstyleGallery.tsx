import React, { useState, useEffect } from 'react';
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
    length: '',
    texture: '',
    face_shape: '',
    style_type: '',
    pose: '',
    search: ''
  });
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilters();
    fetchHairstyles();
  }, []);

  useEffect(() => {
    fetchHairstyles();
  }, [activeFilters]);

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
        if (value) queryParams.append(key, value);
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

  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearch = (searchTerm: string) => {
    setActiveFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      length: '',
      texture: '',
      face_shape: '',
      style_type: '',
      pose: '',
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
        background: 'linear-gradient(135deg, rgba(45, 45, 45, 0.95), rgba(26, 26, 26, 0.95))', 
        backdropFilter: 'blur(12px)', 
        borderRadius: '1rem', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
        border: '2px solid rgba(220, 38, 38, 0.3)', 
        padding: '2rem',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        {/* Barbershop accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #dc2626, #ffffff, #1e40af, #dc2626)',
          borderRadius: '1rem 1rem 0 0'
        }} />
        
        <SearchBar onSearch={handleSearch} />
        <FilterPanel
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Results Count */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#ffffff', 
          background: 'linear-gradient(45deg, rgba(220, 38, 38, 0.8), rgba(30, 64, 175, 0.8))', 
          backdropFilter: 'blur(8px)', 
          borderRadius: '9999px', 
          padding: '0.75rem 1.5rem', 
          display: 'inline-block', 
          boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
        }}>
          {filteredHairstyles.length} classic cut{filteredHairstyles.length !== 1 ? 's' : ''} ✂️
        </p>
      </div>

      {/* Gallery Grid */}
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
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem', 
            maxWidth: '80rem',
            width: '100%'
          }}>
            {filteredHairstyles.map((hairstyle) => (
              <HairstyleCard
                key={hairstyle.id}
                hairstyle={hairstyle}
                onClick={() => setSelectedHairstyle(hairstyle)}
              />
            ))}
          </div>
        </div>
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
