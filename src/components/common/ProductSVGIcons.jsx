import React from 'react';

// SVG realist pentru Fereastră Standard (1 canat)
export const SingleWindowSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 200" className={className}>
    <defs>
      <linearGradient id="frame-single" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="50%" stopColor="#f8f8f8"/>
        <stop offset="100%" stopColor="#e8e8e8"/>
      </linearGradient>
      <linearGradient id="glass-single" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8f4fc"/>
        <stop offset="30%" stopColor="#d4ebf7"/>
        <stop offset="100%" stopColor="#b8dff0"/>
      </linearGradient>
      <linearGradient id="sky-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#87ceeb" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    
    <rect x="20" y="20" width="160" height="160" fill="url(#frame-single)" stroke="#c0c0c0" strokeWidth="1"/>
    <rect x="28" y="28" width="144" height="144" fill="url(#frame-single)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="36" y="36" width="128" height="128" fill="url(#glass-single)"/>
    <rect x="36" y="36" width="128" height="128" fill="url(#sky-reflection)"/>
    <path d="M40 40 L80 40 L40 80 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="50" y1="155" x2="155" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="15"/>
    <rect x="155" y="95" width="6" height="20" rx="1" fill="#a0a0a0"/>
    <rect x="154" y="100" width="8" height="10" rx="1" fill="#808080"/>
    <rect x="36" y="36" width="128" height="128" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
  </svg>
);

// SVG realist pentru Fereastră Dublă (2 canaturi)
export const DoubleWindowSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 280 200" className={className}>
    <defs>
      <linearGradient id="frame-double" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="50%" stopColor="#f8f8f8"/>
        <stop offset="100%" stopColor="#e8e8e8"/>
      </linearGradient>
      <linearGradient id="glass-double" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8f4fc"/>
        <stop offset="30%" stopColor="#d4ebf7"/>
        <stop offset="100%" stopColor="#b8dff0"/>
      </linearGradient>
      <linearGradient id="sky-d" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#87ceeb" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    
    <rect x="20" y="20" width="240" height="160" fill="url(#frame-double)" stroke="#c0c0c0" strokeWidth="1"/>
    <rect x="134" y="20" width="12" height="160" fill="url(#frame-double)" stroke="#b0b0b0" strokeWidth="0.5"/>
    <rect x="28" y="28" width="106" height="144" fill="url(#frame-double)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="36" y="36" width="90" height="128" fill="url(#glass-double)"/>
    <rect x="36" y="36" width="90" height="128" fill="url(#sky-d)"/>
    <path d="M40 40 L70 40 L40 70 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="45" y1="155" x2="120" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="10"/>
    <rect x="146" y="28" width="106" height="144" fill="url(#frame-double)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="154" y="36" width="90" height="128" fill="url(#glass-double)"/>
    <rect x="154" y="36" width="90" height="128" fill="url(#sky-d)"/>
    <path d="M158 40 L188 40 L158 70 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="163" y1="155" x2="238" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="10"/>
    <rect x="118" y="95" width="6" height="18" rx="1" fill="#a0a0a0"/>
    <rect x="156" y="95" width="6" height="18" rx="1" fill="#a0a0a0"/>
  </svg>
);

// SVG realist pentru Fereastră Triplă (3 canaturi)
export const TripleWindowSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 360 200" className={className}>
    <defs>
      <linearGradient id="frame-triple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="50%" stopColor="#f8f8f8"/>
        <stop offset="100%" stopColor="#e8e8e8"/>
      </linearGradient>
      <linearGradient id="glass-triple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8f4fc"/>
        <stop offset="30%" stopColor="#d4ebf7"/>
        <stop offset="100%" stopColor="#b8dff0"/>
      </linearGradient>
      <linearGradient id="sky-t" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#87ceeb" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    
    <rect x="15" y="20" width="330" height="160" fill="url(#frame-triple)" stroke="#c0c0c0" strokeWidth="1"/>
    <rect x="120" y="20" width="10" height="160" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="0.5"/>
    <rect x="230" y="20" width="10" height="160" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="0.5"/>
    <rect x="23" y="28" width="97" height="144" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="30" y="35" width="83" height="130" fill="url(#glass-triple)"/>
    <rect x="30" y="35" width="83" height="130" fill="url(#sky-t)"/>
    <path d="M33 38 L58 38 L33 63 Z" fill="rgba(255,255,255,0.4)"/>
    <rect x="130" y="28" width="100" height="144" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="137" y="35" width="86" height="130" fill="url(#glass-triple)"/>
    <rect x="137" y="35" width="86" height="130" fill="url(#sky-t)"/>
    <path d="M140 38 L165 38 L140 63 Z" fill="rgba(255,255,255,0.4)"/>
    <rect x="240" y="28" width="97" height="144" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="247" y="35" width="83" height="130" fill="url(#glass-triple)"/>
    <rect x="247" y="35" width="83" height="130" fill="url(#sky-t)"/>
    <path d="M250 38 L275 38 L250 63 Z" fill="rgba(255,255,255,0.4)"/>
    <rect x="107" y="95" width="5" height="16" rx="1" fill="#a0a0a0"/>
    <rect x="215" y="95" width="5" height="16" rx="1" fill="#a0a0a0"/>
  </svg>
);

// SVG realist pentru Ușă Culisantă
export const SlidingDoorSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 320 220" className={className}>
    <defs>
      <linearGradient id="frame-slide" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="50%" stopColor="#f5f5f5"/>
        <stop offset="100%" stopColor="#e0e0e0"/>
      </linearGradient>
      <linearGradient id="glass-slide" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e0f0f8"/>
        <stop offset="50%" stopColor="#cce8f4"/>
        <stop offset="100%" stopColor="#b0d8ec"/>
      </linearGradient>
      <linearGradient id="track-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#606060"/>
        <stop offset="100%" stopColor="#404040"/>
      </linearGradient>
    </defs>
    
    <rect x="15" y="15" width="290" height="190" fill="url(#frame-slide)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="15" y="195" width="290" height="10" fill="url(#track-grad)"/>
    <line x1="20" y1="200" x2="300" y2="200" stroke="#505050" strokeWidth="2"/>
    <rect x="25" y="25" width="130" height="165" fill="url(#frame-slide)" stroke="#a0a0a0" strokeWidth="1" opacity="0.9"/>
    <rect x="33" y="33" width="114" height="149" fill="url(#glass-slide)" opacity="0.7"/>
    <path d="M37 37 L77 37 L37 77 Z" fill="rgba(255,255,255,0.3)"/>
    <rect x="145" y="22" width="140" height="170" fill="url(#frame-slide)" stroke="#909090" strokeWidth="1.5"/>
    <rect x="155" y="32" width="120" height="150" fill="url(#glass-slide)"/>
    <path d="M160 37 L210 37 L160 87 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="170" y1="170" x2="265" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="15"/>
    <rect x="160" y="95" width="8" height="35" rx="2" fill="#707070"/>
    <rect x="162" y="100" width="4" height="25" rx="1" fill="#505050"/>
    <path d="M240 200 L250 195 L250 205 Z" fill="#606060"/>
    <path d="M80 200 L70 195 L70 205 Z" fill="#606060"/>
  </svg>
);

// SVG realist pentru Ușă de Intrare
export const EntryDoorSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 240" className={className}>
    <defs>
      <linearGradient id="door-frame" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="50%" stopColor="#f5f5f5"/>
        <stop offset="100%" stopColor="#e8e8e8"/>
      </linearGradient>
      <linearGradient id="door-panel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4a4a4a"/>
        <stop offset="50%" stopColor="#3a3a3a"/>
        <stop offset="100%" stopColor="#2a2a2a"/>
      </linearGradient>
      <linearGradient id="door-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d0e8f4"/>
        <stop offset="100%" stopColor="#a8d0e4"/>
      </linearGradient>
      <linearGradient id="handle-metal" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#c0c0c0"/>
        <stop offset="50%" stopColor="#e0e0e0"/>
        <stop offset="100%" stopColor="#a0a0a0"/>
      </linearGradient>
    </defs>
    
    <rect x="15" y="10" width="130" height="220" fill="url(#door-frame)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="25" y="20" width="110" height="200" fill="url(#door-panel)" rx="1"/>
    <rect x="35" y="30" width="90" height="70" fill="url(#door-glass)" rx="1"/>
    <path d="M40 35 L75 35 L40 70 Z" fill="rgba(255,255,255,0.3)"/>
    <line x1="45" y1="95" x2="120" y2="35" stroke="rgba(255,255,255,0.15)" strokeWidth="8"/>
    <rect x="35" y="105" width="90" height="4" fill="#2a2a2a"/>
    <rect x="35" y="115" width="90" height="45" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1"/>
    <rect x="40" y="120" width="80" height="35" fill="#4a4a4a" rx="1"/>
    <rect x="35" y="168" width="90" height="45" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1"/>
    <rect x="40" y="173" width="80" height="35" fill="#4a4a4a" rx="1"/>
    <ellipse cx="120" cy="135" rx="8" ry="6" fill="url(#handle-metal)"/>
    <rect x="115" y="140" width="10" height="25" rx="2" fill="url(#handle-metal)"/>
    <ellipse cx="120" cy="167" rx="6" ry="4" fill="#909090"/>
    <circle cx="120" cy="155" r="5" fill="#808080" stroke="#606060" strokeWidth="1"/>
    <rect x="118" y="153" width="4" height="4" fill="#404040"/>
  </svg>
);

// SVG realist pentru Ușă de Balcon
export const BalconyDoorSVG = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 240" className={className}>
    <defs>
      <linearGradient id="balc-frame" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="50%" stopColor="#f8f8f8"/>
        <stop offset="100%" stopColor="#e8e8e8"/>
      </linearGradient>
      <linearGradient id="balc-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e0f0f8"/>
        <stop offset="30%" stopColor="#d0e8f4"/>
        <stop offset="100%" stopColor="#b8dce8"/>
      </linearGradient>
      <linearGradient id="sky-balc" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#87ceeb" stopOpacity="0.25"/>
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05"/>
      </linearGradient>
    </defs>
    
    <rect x="15" y="10" width="130" height="220" fill="url(#balc-frame)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="23" y="18" width="114" height="95" fill="url(#balc-frame)" stroke="#a0a0a0" strokeWidth="1"/>
    <rect x="30" y="25" width="100" height="81" fill="url(#balc-glass)"/>
    <rect x="30" y="25" width="100" height="81" fill="url(#sky-balc)"/>
    <path d="M34 29 L69 29 L34 64 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="40" y1="100" x2="125" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="10"/>
    <rect x="15" y="113" width="130" height="10" fill="url(#balc-frame)" stroke="#a0a0a0" strokeWidth="0.5"/>
    <rect x="23" y="123" width="114" height="100" fill="url(#balc-frame)" stroke="#a0a0a0" strokeWidth="1"/>
    <rect x="30" y="130" width="100" height="86" fill="url(#balc-glass)"/>
    <rect x="30" y="130" width="100" height="86" fill="url(#sky-balc)"/>
    <path d="M34 134 L64 134 L34 164 Z" fill="rgba(255,255,255,0.35)"/>
    <line x1="38" y1="210" x2="125" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="10"/>
    <rect x="123" y="165" width="6" height="28" rx="1.5" fill="#909090"/>
    <rect x="121" y="172" width="10" height="14" rx="1" fill="#707070"/>
  </svg>
);

// Funcție pentru a alege SVG-ul corect bazat pe produs
export const getProductSVGComponent = (product) => {
  const name = product?.name?.toLowerCase() || '';
  const category = product?.category || '';
  
  // Ușă de intrare
  if (category === 'usi' && !name.includes('balcon') && !name.includes('culisant')) {
    if (name.includes('culisant')) return SlidingDoorSVG;
    return EntryDoorSVG;
  }
  
  // Ușă de balcon
  if (category === 'usi-balcon' || name.includes('balcon')) {
    return BalconyDoorSVG;
  }
  
  // Culisante
  if (name.includes('culisant') || product?.supports_sliding) {
    return SlidingDoorSVG;
  }
  
  // Fereastră triplă
  if (name.includes('tripl') || product?.sashes === 3) {
    return TripleWindowSVG;
  }
  
  // Fereastră dublă
  if (name.includes('dubl') || product?.sashes === 2) {
    return DoubleWindowSVG;
  }
  
  // Fereastră standard
  return SingleWindowSVG;
};

// Component wrapper pentru a renderiza SVG-ul corect
export default function ProductSVGIcon({ product, className = "w-12 h-12" }) {
  const SVGComponent = getProductSVGComponent(product);
  return <SVGComponent className={className} />;
}