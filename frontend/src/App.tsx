import React from 'react';
import HairstyleGallery from './components/HairstyleGallery';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #fdf2f8, #faf5ff, #eef2ff)' }}>
      <header style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #fce7f3' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                background: 'linear-gradient(to right, #db2777, #9333ea, #4f46e5)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                Hair Style Gallery
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#4b5563', fontWeight: '500' }}>
                Discover your perfect hairstyle ✨
              </p>
            </div>
          </div>
        </div>
      </header>
      
      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1rem' }}>
        <HairstyleGallery />
      </main>
    </div>
  );
}

export default App;
