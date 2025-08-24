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
  // Filters state is managed by parent; local summary not needed here.

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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onFilterChange(filterType, [])}
        className={`px-4 py-2 rounded-full border-2 transition-colors text-sm font-medium ${
          activeValues.length === 0
            ? 'border-blue-400 bg-blue-500/10 text-blue-600'
            : 'border-gray-200 bg-white/90 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
        }`}
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
            className={`px-4 py-2 rounded-full border-2 transition-colors text-sm font-medium inline-flex items-center gap-2 ${
              isActive
                ? 'border-blue-400 bg-blue-500/12 text-blue-600'
                : 'border-gray-200 bg-white/90 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {renderIcon(iconType, item, isActive)}
            {item}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-6">
        {/* Face Shape Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Face Shape
          </label>
          {renderIconButtons(filters.face_shapes, activeFilters.face_shape, 'face_shape', 'face')}
        </div>

        {/* Length Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Length
          </label>
          {renderIconButtons(filters.lengths, activeFilters.length, 'length', 'length')}
        </div>

        {/* Texture Filter (exclude 'Any' option as redundant with All) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
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
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Type
          </label>
          {renderIconButtons(filters.style_types, activeFilters.style_type, 'style_type', 'style')}
        </div>

        {/* Pose Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
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
