import React, { useRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  maxWidth?: string | number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, maxWidth }) => {
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
    <div className="mb-6">
      <form onSubmit={handleSubmit} style={{ maxWidth: maxWidth ?? '42rem', margin: '0 auto' }}>
        <div className="flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white/90 pl-3 pr-2 py-2">
          <span aria-hidden className="inline-flex text-slate-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search hairstyles, tags, or descriptions…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search hairstyles"
            className="flex-1 py-2 px-2 text-base border-none outline-none bg-transparent text-gray-900 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear"
              className="px-3 py-1.5 rounded-full border-2 border-gray-200 bg-white/90 text-gray-700 text-sm font-medium hover:border-blue-300 hover:bg-blue-50"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            aria-label="Submit search"
            className="px-3 py-2 rounded-full border-2 border-blue-400 bg-blue-500/12 text-blue-600 font-semibold hover:bg-blue-500/20"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
;

export default SearchBar;
