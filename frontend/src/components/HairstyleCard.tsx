import React from 'react';
import { Hairstyle } from '../types';

interface HairstyleCardProps {
  hairstyle: Hairstyle;
  onClick: () => void;
}

const HairstyleCard: React.FC<HairstyleCardProps> = ({ hairstyle, onClick }) => {
  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/90 border border-white/30 group"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={hairstyle.image_url}
          alt={hairstyle.name}
          className="w-full h-80 object-cover object-center transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x500/f3f4f6/9ca3af?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
            {hairstyle.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-purple-700 transition-colors duration-300">
          {hairstyle.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {hairstyle.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-medium px-3 py-1.5 rounded-full">
            {hairstyle.length}
          </span>
          <span className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
            {hairstyle.texture}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
          <span className="font-medium">Perfect for:</span> {hairstyle.face_shapes.join(', ')} faces
        </div>
      </div>
    </div>
  );
};

export default HairstyleCard;
