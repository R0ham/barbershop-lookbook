import React from 'react';
import { Filters } from '../types';
import FaceShapeIcons from './FaceShapeIcons';
import HairStyleIcons from './HairStyleIcons';
import { StyleTypeIcon } from './StyleTypeIcons';
import { PoseIcon } from './PoseIcons';

interface FilterPanelProps {
  filters: Filters;
  activeFilters: {
    length: string;
    texture: string;
    face_shape: string;
    style_type: string;
    pose: string;
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

  // Render SVG icons for different filter types (category removed)
  const renderIcon = (type: 'face' | 'length' | 'texture', value: string, isActive: boolean) => {
    // Cooler blue for active, slightly cooler gray for inactive
    const iconColor = isActive ? '#2563eb' : '#64748b';
    
    if (type === 'face') {
      return <FaceShapeIcons shape={value} size={20} color={iconColor} />;
    }
    
    if (type === 'length') {
      return <HairStyleIcons type="length" style={value} size={20} color={iconColor} />;
    }
    
    if (type === 'texture') {
      return <HairStyleIcons type="texture" style={value} size={20} color={iconColor} />;
    }
    
    return null;
  };

  const renderIconButtons = (
    items: string[], 
    activeValue: string, 
    filterType: string, 
    iconType: 'face' | 'length' | 'texture'
  ) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      <button
        onClick={() => onFilterChange(filterType, '')}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          border: `2px solid ${activeValue === '' ? '#60a5fa' : '#e5e7eb'}`,
          background: activeValue === '' ? 'rgba(59, 130, 246, 0.10)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: activeValue === '' ? '#2563eb' : '#374151'
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
            border: `2px solid ${activeValue === item ? '#60a5fa' : '#e5e7eb'}`,
            background: activeValue === item ? 'rgba(59, 130, 246, 0.10)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: activeValue === item ? '#2563eb' : '#374151',
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
          {renderIcon(iconType, item, activeValue === item)}
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
          {renderIconButtons(filters.face_shapes, activeFilters.face_shape, 'face_shape', 'face')}
        </div>

        {/* Length Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            📏 Length
          </label>
          {renderIconButtons(filters.lengths, activeFilters.length, 'length', 'length')}
        </div>

        {/* Texture Filter (exclude 'Any' option as redundant with All) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            ✨ Texture
          </label>
          {renderIconButtons(
            filters.textures.filter(t => t !== 'Any' && t !== 'any'),
            activeFilters.texture,
            'texture',
            'texture'
          )}
        </div>

        {/* Style Type Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            ⚧ Style Type
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {filters.style_types.map((styleType) => (
              <StyleTypeIcon
                key={styleType}
                type={styleType as 'Masculine' | 'Feminine' | 'Unisex'}
                isActive={activeFilters.style_type === styleType}
                onClick={() => onFilterChange('style_type', activeFilters.style_type === styleType ? '' : styleType)}
              />
            ))}
          </div>
        </div>

        {/* Pose Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            📸 Pose
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {filters.poses.map((pose) => (
              <PoseIcon
                key={pose}
                pose={pose as 'Straight-on' | 'Side' | 'Angled'}
                isActive={activeFilters.pose === pose}
                onClick={() => onFilterChange('pose', activeFilters.pose === pose ? '' : pose)}
              />
            ))}
          </div>
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
