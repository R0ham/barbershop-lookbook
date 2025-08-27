import React from 'react';
import HairstyleGallery from './components/HairstyleGallery';
import SearchBar from './components/SearchBar';
import BarbershopPole from './components/BarbershopPole';

function App() {
  const [headerSearch, setHeaderSearch] = React.useState<string>('');
  return (
    <div className="min-h-screen py-12 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 m-0 tracking-wide font-serif inline-flex items-center gap-2">
          Barbershop Lookbook <BarbershopPole size="md" />
        </h1>
        <p className="text-[1.05rem] text-slate-700 font-medium mt-2">
          A clean, modern scrapbook of classic cuts.
        </p>
        <div className="mt-3">
          <SearchBar onSearch={setHeaderSearch} maxWidth="28rem" />
        </div>
      </header>

      <main className="max-w-[72rem] mx-auto">
        <HairstyleGallery headerSearch={headerSearch} />
      </main>
    </div>
  );
}

export default App;
