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
    <div style={{ marginBottom: '1.5rem' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: maxWidth ?? '42rem', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '9999px',
            border: '2px solid #e5e7eb',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '0.5rem 0.5rem 0.5rem 0.75rem',
          }}
        >
          <span aria-hidden style={{ display: 'inline-flex', color: '#64748b' }}>
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
            style={{
              flex: 1,
              padding: '0.6rem 0.5rem',
              fontSize: '1rem',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#111827'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear"
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                border: '2px solid #e5e7eb',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            aria-label="Submit search"
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '9999px',
              border: '2px solid #60a5fa',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#2563eb',
              fontWeight: 600,
              cursor: 'pointer'
            }}
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
