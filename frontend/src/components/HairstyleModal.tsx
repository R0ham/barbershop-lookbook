import React from 'react';
import { Hairstyle } from '../types';

interface HairstyleModalProps {
  hairstyle: Hairstyle;
  onClose: () => void;
}

const HairstyleModal: React.FC<HairstyleModalProps> = ({ hairstyle, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="aspect-w-16 aspect-h-12">
            <img
              src={hairstyle.image_url}
              alt={hairstyle.name}
              className="w-full h-96 object-cover rounded-t-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=No+Image';
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {hairstyle.name}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
                    {hairstyle.category}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {hairstyle.length}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {hairstyle.texture}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {hairstyle.description}
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Best For Face Shapes
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {hairstyle.face_shapes.map((shape) => (
                    <span
                      key={shape}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {shape}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Style Tags
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {hairstyle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Hair Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{hairstyle.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Length:</span>
                    <span className="font-medium">{hairstyle.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Texture:</span>
                    <span className="font-medium">{hairstyle.texture}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t">
              <button className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors">
                Save to Favorites
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
                Share Style
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HairstyleModal;
