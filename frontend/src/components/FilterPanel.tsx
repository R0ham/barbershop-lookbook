import React from 'react';
import { Filters } from '../types';

interface FilterPanelProps {
  filters: Filters;
  activeFilters: {
    category: string;
    length: string;
    texture: string;
    face_shape: string;
    search: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  // Icon mappings for visual examples
  const faceShapeIcons: { [key: string]: string } = {
    'Oval': '⭕',
    'Round': '🔴', 
    'Square': '⬜',
    'Heart': '💖',
    'Long': '📏'
  };

  const lengthIcons: { [key: string]: string } = {
    'Short': '✂️',
    'Medium': '💇‍♀️',
    'Long': '👩‍🦱'
  };

  const textureIcons: { [key: string]: string } = {
    'Straight': '➖',
    'Wavy': '〰️',
    'Curly': '🌀',
    'Textured': '🔀',
    'Any': '✨'
  };

  const categoryIcons: { [key: string]: string } = {
    'Short': '✂️',
    'Medium': '💇‍♀️', 
    'Long': '👩‍🦱'
  };

  const renderIconButtons = (
    items: string[], 
    activeValue: string, 
    filterType: string, 
    iconMap: { [key: string]: string },
    borderColor: string
  ) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      <button
        onClick={() => onFilterChange(filterType, '')}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          border: `2px solid ${activeValue === '' ? '#ec4899' : '#e5e7eb'}`,
          background: activeValue === '' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: activeValue === '' ? '#be185d' : '#374151'
        }}
        onMouseOver={(e) => {
          if (activeValue !== '') {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseOut={(e) => {
          if (activeValue !== '') {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        All
      </button>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onFilterChange(filterType, item)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            border: `2px solid ${activeValue === item ? '#ec4899' : '#e5e7eb'}`,
            background: activeValue === item ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: activeValue === item ? '#be185d' : '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => {
            if (activeValue !== item) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseOut={(e) => {
            if (activeValue !== item) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <span style={{ fontSize: '1rem' }}>{iconMap[item] || '•'}</span>
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {/* Face Shape Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            👤 Face Shape
          </label>
          {renderIconButtons(filters.face_shapes, activeFilters.face_shape, 'face_shape', faceShapeIcons, '#f43f5e')}
        </div>

        {/* Length Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            📏 Length
          </label>
          {renderIconButtons(filters.lengths, activeFilters.length, 'length', lengthIcons, '#8b5cf6')}
        </div>

        {/* Texture Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            ✨ Texture
          </label>
          {renderIconButtons(filters.textures, activeFilters.texture, 'texture', textureIcons, '#3b82f6')}
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            💇‍♀️ Category
          </label>
          {renderIconButtons(filters.categories, activeFilters.category, 'category', categoryIcons, '#ec4899')}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClearFilters}
            style={{
              background: 'linear-gradient(to right, #f3f4f6, #e5e7eb)',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #e5e7eb, #d1d5db)';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
          >
            🗑️ Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
