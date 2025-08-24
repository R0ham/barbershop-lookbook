import React, { useRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex items-stretch rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search hairstyles, tags, or descriptions…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search hairstyles"
            className="flex-1 px-2 md:px-3 py-3 md:py-4 text-base md:text-lg placeholder-gray-400 focus:outline-none focus:ring-0 border-0"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="px-5 md:px-6 text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-150"
          >
            <svg className="h-5 w-5 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
;

export default SearchBar;
