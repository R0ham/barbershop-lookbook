import React from 'react';

interface BarbershopPoleProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { w: 14, h: 28, border: 1.5 },
  md: { w: 18, h: 36, border: 2 },
  lg: { w: 22, h: 48, border: 2 },
} as const;

function BarbershopPole({ size = 'md' }: BarbershopPoleProps) {
  const s = sizeMap[size];
  const style: React.CSSProperties = {
    width: s.w,
    height: s.h,
    borderWidth: s.border,
  };

  return (
    <span className="inline-flex items-center" aria-label="barbershop pole" role="img">
      <span className="barber-pole" style={style} aria-hidden />
      <span className="sr-only">Barbershop pole</span>
    </span>
  );
}

export default BarbershopPole;
