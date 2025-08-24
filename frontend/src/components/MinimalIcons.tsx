import React from 'react';

export type MinimalIconKind = 'face' | 'length' | 'texture' | 'style' | 'pose' | 'ethnicity';

interface IconProps {
  size?: number;
  color?: string;
}

const svgStyle = (size?: number) => ({ width: size ?? 20, height: size ?? 20, display: 'inline-block' });
// Base props valid for all shapes
const baseStroke = (color?: string) => ({ stroke: color ?? '#2563eb', strokeWidth: 1.8, fill: 'none' });
// Extra props only for path/line where TS allows these
const capJoin = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

// Ethnicity icons: minimal metaphors
//  - Caucasian: hairclip (arched clip with small teeth)
//  - Asian: hairstick (diagonal stick through a small bun)
//  - Afro: plastic hairbead (bead with string)
export const MinimalEthnicityIcon: React.FC<{ ethnicity: string } & IconProps> = ({ ethnicity, size, color }) => {
  const e = (ethnicity || '').toLowerCase();
  const baseColor = color ?? '#2563eb';
  const base = baseStroke(color);
  const softFill = { fill: baseColor, opacity: 0.15 } as const;
  const solidFill = { fill: baseColor, opacity: 0.9 } as const;

  return (
    <svg style={svgStyle(size)} viewBox="0 0 24 24">
      {/* Caucasian -> single-outline jaw clip silhouette (stroke-only) */}
      {e === 'caucasian' && (
        <>
          <g transform="translate(12,12) scale(1.25) translate(-12,-12)">
          <path
            d="M4 16
               C3.4 11.5, 5.2 6.2, 12 6.2
               C18.8 6.2, 20.6 11.5, 20 16 Z"
            {...base}
            {...capJoin}
          />
          {/* Bottom teeth (5) */}
          <path d="M7.3 13 v2" {...base} strokeLinecap="round" />
          <path d="M10.3 12 v4" {...base} strokeLinecap="round" />
          {/* <path d="M11.8 12 v4" {...base} strokeLinecap="round" /> */}
          <path d="M13.3 12 v4" {...base} strokeLinecap="round" />
          <path d="M16.3 13 v2" {...base} strokeLinecap="round" />
          {/* Cross bar over teeth connecting sides */}
          <path d="M4 16 H19.8" {...base} strokeLinecap="round" />
          </g>
        </>
      )}

      {/* Asian -> simplified stick with cube on top (stroke-only), scaled 1.5x */}
      {e === 'asian' && (
        <>
          <g transform="translate(12,12) scale(1.5) translate(-12,-12)">
            {/* Diagonal stick */}
            <path d="M6 17 L12.8 13.06" {...base} strokeLinecap="round" strokeLinejoin="round" />
            {/* Cube (square) attached to stick top */}
            <rect x={13.2} y={7.7} width={5.0} height={5.0} {...base} />
            {/* Short connector to touch the cube */}
            {/* <path d="M11.2 13.8 L13.2 12.2" {...base} strokeLinecap="round" /> */}
          </g>
        </>
      )}

      {/* Afro -> stroke-only plastic hair bead with angled inner hole, scaled 1.125x and clearer donut (smaller center) */}
      {e === 'afro' && (
        <>
          <g transform="translate(12,12.5) scale(1.125) translate(-12,-12.5)">
            {/* Bead outer silhouette (slightly squashed circle) */}
            <ellipse cx={12} cy={12.5} rx={7.6} ry={6.4} {...base} {...capJoin} />
            {/* Inner hole (angled ellipse to suggest bore) */}
            <ellipse cx={11.0} cy={12.2} rx={3.45} ry={2.25} {...base} transform="rotate(-8 13.0 13.1)" />
          </g>
        </>
      )}

      {!['caucasian','asian','afro'].includes(e) && (
        <circle cx={12} cy={12} r={6.5} {...softFill} />
      )}
    </svg>
  );
};

// Length icons: short/medium/long as hair arcs of increasing length
export const MinimalLengthIcon: React.FC<{ styleName: string } & IconProps> = ({ styleName, size, color }) => {
  const s = styleName.toLowerCase();
  const base = baseStroke(color);
  return (
    <svg style={svgStyle(size)} viewBox="0 0 24 24">
      {s === 'short' && (<path {...base} {...capJoin} d="M6 9 C9 6, 15 6, 18 9" />)}
      {s === 'medium' && (
        <>
          <path {...base} {...capJoin} d="M4 9 C8 5.5, 16 5.5, 20 9" />
          <path {...base} {...capJoin} d="M6 12 C9 9.5, 15 9.5, 18 12" />
        </>
      )}
      {s === 'long' && (
        <>
          {/* Even vertical spacing (y=8,12,16) and consistent width */}
          <path {...base} {...capJoin} d="M4 8 C8 4.5, 16 4.5, 20 8" />
          <path {...base} {...capJoin} d="M4 12 C8 8.5, 16 8.5, 20 12" />
          <path {...base} {...capJoin} d="M4 16 C8 12.5, 16 12.5, 20 16" />
        </>
      )}
      {!['short','medium','long'].includes(s) && (<circle {...base} cx={12} cy={12} r={7.5} />)}
    </svg>
  );
};

// Texture icons: straight/wavy/curly/textured
export const MinimalTextureIcon: React.FC<{ texture: string } & IconProps> = ({ texture, size, color }) => {
  const t = texture.toLowerCase();
  const base = baseStroke(color);
  return (
    <svg style={svgStyle(size)} viewBox="0 0 24 24">
      {t === 'straight' && (<line {...base} {...capJoin} x1={6} y1={5} x2={18} y2={19} />)}
      {t === 'wavy' && (<path {...base} {...capJoin} d="M4 12 C6 8, 8 16, 10 12 C12 8, 14 16, 16 12 C18 8, 20 16, 22 12" />)}
      {t === 'curly' && (<path {...base} {...capJoin} d="M6 8 c2 -2, 4 2, 2 4 c-2 2, 0 6, 2 4 c2 -2, 4 2, 2 4" />)}
      {t === 'textured' && (<path {...base} {...capJoin} d="M4 7 L7 10 L10 7 L13 10 L16 7 L19 10" />)}
      {!['straight','wavy','curly','textured'].includes(t) && (<circle {...base} cx={12} cy={12} r={7.5} />)}
    </svg>
  );
};

// Face shape icons: minimal outlines per shape
export const MinimalFaceIcon: React.FC<{ shape: string } & IconProps> = ({ shape, size, color }) => {
  const s = shape.toLowerCase();
  const base = baseStroke(color);
  return (
    <svg style={svgStyle(size)} viewBox="0 0 24 24">
      {s === 'oval' && (<ellipse {...base} cx={12} cy={12} rx={7} ry={9} />)}
      {s === 'round' && (<circle {...base} cx={12} cy={12} r={8} />)}
      {s === 'square' && (<rect {...base} x={5.5} y={5.5} width={13} height={13} rx={2.5} ry={2.5} />)}
      {s === 'heart' && (
        // Max width heart with minimal margins
        <path
          {...base}
          {...capJoin}
          d="M12 19.6 C3.8 14.6, 3.8 6.6, 9 5.1 C11 4.9, 12 8.0, 12 8.0 C12 8.0, 13 4.9, 15 5.1 C20.2 6.6, 20.2 14.6, 12 19.6 Z"
        />
      )}
      {s === 'diamond' && (<path {...base} {...capJoin} d="M12 4 L18 12 L12 20 L6 12 Z" />)}
      {s === 'oblong' && (<rect {...base} x={6} y={3.5} width={12} height={17} rx={6} ry={6} />)}
      {!['oval','round','square','heart','diamond','oblong'].includes(s) && (<ellipse {...base} cx={12} cy={12} rx={7} ry={9} />)}
    </svg>
  );
};

// Style type icons: masculine, feminine, unisex (simple geometric symbols)
export const MinimalStyleTypeIcon: React.FC<{ type: string } & IconProps> = ({ type, size, color }) => {
  const t = type.toLowerCase();
  const base = baseStroke(color);
  return (
    <svg style={svgStyle(size)} viewBox="0 0 24 24">
      {/* Masculine: Sun (circle with short rays) */}
      {t === 'masculine' && (
        <>
          <circle {...base} cx={12} cy={12} r={5.5} />
          <line {...base} {...capJoin} x1={12} y1={3.5} x2={12} y2={6} />
          <line {...base} {...capJoin} x1={12} y1={18} x2={12} y2={20.5} />
          <line {...base} {...capJoin} x1={3.5} y1={12} x2={6} y2={12} />
          <line {...base} {...capJoin} x1={18} y1={12} x2={20.5} y2={12} />
          <line {...base} {...capJoin} x1={6.5} y1={6.5} x2={8.2} y2={8.2} />
          <line {...base} {...capJoin} x1={15.8} y1={15.8} x2={17.5} y2={17.5} />
          <line {...base} {...capJoin} x1={17.5} y1={6.5} x2={15.8} y2={8.2} />
          <line {...base} {...capJoin} x1={8.2} y1={15.8} x2={6.5} y2={17.5} />
        </>
      )}
      {/* Feminine: Moon (crescent) */}
      {t === 'feminine' && (
        <>
          {/* Crescent path */}
          <path {...base} {...capJoin} d="M14 7 A5.5 5.5 0 1 0 14 17 A7.5 7.5 0 1 1 14 7" />
        </>
      )}
      {/* Unisex: Even larger circle split in half, rays start outside the circle */}
      {t === 'unisex' && (
        <>
          {/* Larger circle */}
          <circle {...base} cx={12} cy={12} r={7.2} />
          {/* Split line (vertical across circle) */}
          <line {...base} {...capJoin} x1={12} y1={4.8} x2={12} y2={19.2} />
          {/* Rays on right half (start outside circle edge) */}
          {/* Right (east) - longer */}
          <line {...base} {...capJoin} x1={20.0} y1={12} x2={22.8} y2={12} />
          {/* Northeast - longer */}
          <line {...base} {...capJoin} x1={18.2} y1={8.4} x2={21.0} y2={6.6} />
          {/* Southeast - longer */}
          <line {...base} {...capJoin} x1={18.2} y1={15.6} x2={21.0} y2={17.4} />
        </>
      )}
      {!['masculine','feminine','unisex'].includes(t) && (<circle {...base} cx={12} cy={12} r={6.5} />)}
    </svg>
  );
};

// Pose icons: straight-on, side, angled (minimal heads)
export const MinimalPoseIcon: React.FC<{ pose: string } & IconProps> = ({ pose, size, color }) => {
  const p = pose.toLowerCase();
  const base = baseStroke(color);
  return (
    <svg style={svgStyle(size)} viewBox="0 0 24 24">
      {p === 'straight-on' && (
        <>
          <circle {...base} cx={12} cy={12} r={7} />
          <circle cx={10} cy={11} r={0.9} fill={color ?? '#2563eb'} />
          <circle cx={14} cy={11} r={0.9} fill={color ?? '#2563eb'} />
        </>
      )}
      {p === 'side' && (
        <>
          {/* Enlarged profile curve */}
          <path {...base} {...capJoin} d="M7 8 C7 6, 12 5, 16 7 C19 9.5, 19 14.5, 16 16.5 C12.5 18.7, 9 17.7, 7.5 15.5" />
          <circle cx={15} cy={11} r={1.1} fill={color ?? '#2563eb'} />
        </>
      )}
      {p === 'angled' && (
        <>
          <ellipse {...base} cx={12} cy={12} rx={6.5} ry={7.5} transform="rotate(15 12 12)" />
          <circle cx={11} cy={11} r={0.8} fill={color ?? '#2563eb'} />
          <circle cx={14} cy={12} r={0.9} fill={color ?? '#2563eb'} />
        </>
      )}
      {!['straight-on','side','angled'].includes(p) && (<circle {...base} cx={12} cy={12} r={7} />)}
    </svg>
  );
};

export const getMinimalIcon = (
  kind: MinimalIconKind,
  value: string,
  size?: number,
  color?: string
): React.ReactNode => {
  switch (kind) {
    case 'length':
      return <MinimalLengthIcon styleName={value} size={size} color={color} />;
    case 'texture':
      return <MinimalTextureIcon texture={value} size={size} color={color} />;
    case 'face':
      return <MinimalFaceIcon shape={value} size={size} color={color} />;
    case 'style':
      return <MinimalStyleTypeIcon type={value} size={size} color={color} />;
    case 'pose':
      return <MinimalPoseIcon pose={value} size={size} color={color} />;
    case 'ethnicity':
      return <MinimalEthnicityIcon ethnicity={value} size={size} color={color} />;
    default:
      return null;
  }
};
