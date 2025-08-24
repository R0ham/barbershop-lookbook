import React from 'react';
import HairstyleGallery from './components/HairstyleGallery';

function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        // Bright, airy backdrop like daylight outside the storefront
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 55%, #f1f5f9 100%)',
        padding: '3rem 1rem',
        position: 'relative'
      }}
    >
      {/* Subtle sun glow and interior hint behind the glass */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1200px 600px at 80% -10%, rgba(255, 220, 180, 0.25), rgba(255, 220, 180, 0) 60%),\
             radial-gradient(800px 500px at 20% 110%, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0) 55%)',
          pointerEvents: 'none'
        }}
      />
      
      {/* Header on translucent glass panel */}
      <header style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(148, 163, 184, 0.35)',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '0.02em',
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
            }}
          >
            Barbershop Lookbook
          </h1>
        </div>
        <p
          style={{
            fontSize: '1.05rem',
            color: '#334155',
            fontWeight: 500,
            marginTop: '0.75rem'
          }}
        >
          See through the glass into a clean, modern shop. Find your cut.
        </p>
      </header>
      
      {/* Glass storefront frame around content */}
      <div
        style={{
          maxWidth: '76rem',
          margin: '0 auto',
          padding: '1.25rem',
          borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(14px) saturate(110%)',
          WebkitBackdropFilter: 'blur(14px) saturate(110%)',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          boxShadow:
            '0 10px 30px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(255,255,255,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle diagonal glass reflection */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '70%',
            height: '160%',
            background:
              'linear-gradient(60deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0) 100%)',
            transform: 'rotate(0.0001deg)',
            pointerEvents: 'none'
          }}
        />
        {/* Thin window mullions */}
        <div
          style={{
            borderRadius: '12px',
            padding: '1rem',
            background:
              'linear-gradient(180deg, rgba(248, 250, 252, 0.55), rgba(248, 250, 252, 0.35))',
            border: '1px solid rgba(203, 213, 225, 0.5)'
          }}
        >
          <main style={{ maxWidth: '72rem', margin: '0 auto' }}>
            <HairstyleGallery />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
