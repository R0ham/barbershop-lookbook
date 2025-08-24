import React from 'react';
import HairstyleGallery from './components/HairstyleGallery';
import SearchBar from './components/SearchBar';

function App() {
  const [headerSearch, setHeaderSearch] = React.useState<string>('');
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-12 px-4 relative">
      {/* Subtle sun glow and interior hint behind the glass */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(255,220,180,0.25),rgba(255,220,180,0)_60%),radial-gradient(800px_500px_at_20%_110%,rgba(34,197,94,0.08),rgba(34,197,94,0)_55%)]" />
      
      {/* Header on translucent glass panel */}
      <header className="text-center mb-8 relative">
        <div className="inline-block px-6 py-3 rounded-xl bg-white/55 backdrop-blur-md border border-slate-300/35 shadow-xl">
          <h1 className="text-4xl font-extrabold text-slate-900 m-0 tracking-wide font-serif">
            Barbershop Lookbook
            <span aria-hidden className="ml-1">✂️</span>
          </h1>
        </div>
        <p className="text-[1.05rem] text-slate-700 font-medium mt-3">
          See through the glass into a clean, modern shop. Find your cut.
        </p>
        {/* Header Search - under subtitle */}
        <div className="mt-3">
          <SearchBar onSearch={setHeaderSearch} maxWidth="28rem" />
        </div>
      </header>
      
      {/* Glass storefront frame around content */}
      <div className="max-w-6xl mx-auto p-5 rounded-2xl bg-white/60 backdrop-blur-lg saturate-110 border border-slate-300/35 shadow-[0_10px_30px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_0_0_1px_rgba(255,255,255,0.3)] relative overflow-hidden">
        {/* Subtle diagonal glass reflection */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[160%] bg-[linear-gradient(60deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.08)_35%,rgba(255,255,255,0.02)_55%,rgba(255,255,255,0)_100%)] pointer-events-none" />
        {/* Thin window mullions */}
        <div className="rounded-xl p-4 bg-gradient-to-b from-slate-50/55 to-slate-50/35 border border-slate-300/50">
          <main className="max-w-[72rem] mx-auto">
            <HairstyleGallery headerSearch={headerSearch} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
