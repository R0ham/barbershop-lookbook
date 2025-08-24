import React from 'react';
import { Filters } from '../types';
import { getMinimalIcon } from './MinimalIcons';

interface FilterPanelProps {
  filters: Filters;
  activeFilters: {
    length: string[];
    texture: string[];
    face_shape: string[];
    style_type: string[];
    pose: string[];
    search: string;
  };
  onFilterChange: (filterType: string, value: string[] | string) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = (
    activeFilters.length.length > 0 ||
    activeFilters.texture.length > 0 ||
    activeFilters.face_shape.length > 0 ||
    activeFilters.style_type.length > 0 ||
    activeFilters.pose.length > 0 ||
    activeFilters.search !== ''
  );

  // Render minimal-stroke SVG icons for each filter type (not for 'All')
  const renderIcon = (
    type: 'face' | 'length' | 'texture' | 'style' | 'pose',
    value: string,
    isActive: boolean
  ) => {
    // Active: blue, Inactive: cool gray
    const iconColor = isActive ? '#2563eb' : '#64748b';
    return getMinimalIcon(type, value, 20, iconColor);
  };

  const renderIconButtons = (
    items: string[], 
    activeValues: string[], 
    filterType: string, 
    iconType: 'face' | 'length' | 'texture' | 'style' | 'pose'
  ) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      <button
        onClick={() => onFilterChange(filterType, [])}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          border: `2px solid ${activeValues.length === 0 ? '#60a5fa' : '#e5e7eb'}`,
          background: activeValues.length === 0 ? 'rgba(59, 130, 246, 0.10)' : 'rgba(255, 255, 255, 0.9)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: activeValues.length === 0 ? '#2563eb' : '#374151'
        }}
      >
        All
      </button>
      {items.map((item) => {
        const isActive = activeValues.includes(item);
        const next = isActive ? activeValues.filter(v => v !== item) : [...activeValues, item];
        return (
          <button
            key={item}
            onClick={() => onFilterChange(filterType, next)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: `2px solid ${isActive ? '#60a5fa' : '#e5e7eb'}`,
              background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: isActive ? '#2563eb' : '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {renderIcon(iconType, item, isActive)}
            {item}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {/* Face Shape Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Face Shape
          </label>
          {renderIconButtons(filters.face_shapes, activeFilters.face_shape, 'face_shape', 'face')}
        </div>

        {/* Length Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Length
          </label>
          {renderIconButtons(filters.lengths, activeFilters.length, 'length', 'length')}
        </div>

        {/* Texture Filter (exclude 'Any' option as redundant with All) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Texture
          </label>
          {renderIconButtons(
            filters.textures.filter(t => t !== 'Any' && t !== 'any'),
            activeFilters.texture,
            'texture',
            'texture'
          )}
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Type
          </label>
          {renderIconButtons(filters.style_types, activeFilters.style_type, 'style_type', 'style')}
        </div>

        {/* Pose Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Pose
          </label>
          {renderIconButtons(filters.poses, activeFilters.pose, 'pose', 'pose')}
        </div>
      </div>

      {/* Clear button removed; Clear is now part of results pill in gallery */}
    </div>
  );
};

export default FilterPanel;
