import React from 'react';

const ProductGraphic = ({ product, color = '#4A4A4A', isSelected = false, sashMechanisms = [] }) => {
  const frameColor = color || '#4A4A4A';
  const darkFrame = '#2d2d2d';
  const glassColor = 'rgba(230, 240, 255, 0.5)';
  const glassHighlight = 'rgba(255, 255, 255, 0.3)';
  const shadowColor = 'rgba(0, 0, 0, 0.15)';
  
  const productName = product?.name?.toLowerCase() || '';
  const category = product?.category || '';
  
  // Calculate proportions based on actual product dimensions
  const minWidth = product?.min_width || 1000;
  const minHeight = product?.min_height || 1400;
  const ratio = minWidth / minHeight;
  
  // Ușă de Intrare - Profesional
  if (category === 'usi' && !productName.includes('balcon') && !productName.includes('culisant')) {
    return (
      <svg viewBox="0 0 160 240" className="w-full h-full">
        <defs>
          <linearGradient id="doorGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glassColor} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={glassColor} stopOpacity="0.4"/>
          </linearGradient>
          <filter id="doorShadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor={shadowColor}/>
          </filter>
        </defs>
        
        {/* Outer Frame */}
        <rect x="15" y="15" width="130" height="210" fill={frameColor} rx="3" filter="url(#doorShadow)"/>
        
        {/* Inner Frame */}
        <rect x="20" y="20" width="120" height="200" fill={darkFrame} rx="2"/>
        
        {/* Glass Panel Top */}
        <rect x="28" y="28" width="104" height="80" fill="url(#doorGlass)" rx="1.5"/>
        <rect x="28" y="28" width="104" height="20" fill={glassHighlight} opacity="0.4" rx="1.5"/>
        
        {/* Middle Panel */}
        <rect x="28" y="115" width="104" height="45" fill={frameColor} rx="1.5"/>
        
        {/* Bottom Panel */}
        <rect x="28" y="167" width="104" height="45" fill={frameColor} rx="1.5"/>
        
        {/* Vertical Dividers */}
        <line x1="80" y1="115" x2="80" y2="212" stroke={darkFrame} strokeWidth="1.5"/>
        
        {/* Handle Assembly */}
        <rect x="122" y="115" width="8" height="30" fill="#C4A547" rx="2"/>
        <ellipse cx="126" cy="130" rx="3" ry="4" fill="#E5C76B"/>
        <rect x="124" y="128" width="4" height="8" fill="#9D8438" rx="1"/>
        
        {/* Lock Mechanism */}
        <circle cx="126" cy="150" r="4" fill="#5A5A5A" stroke="#3A3A3A" strokeWidth="0.5"/>
        
        {isSelected && (
          <circle cx="80" cy="120" r="22" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="2.5"/>
        )}
      </svg>
    );
  }
  
  // Ușă de Balcon - Profesional
  if (category === 'usi-balcon' || productName.includes('balcon')) {
    return (
      <svg viewBox="0 0 160 240" className="w-full h-full">
        <defs>
          <linearGradient id="balconGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glassColor} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={glassColor} stopOpacity="0.3"/>
          </linearGradient>
          <filter id="balconShadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor={shadowColor}/>
          </filter>
        </defs>
        
        {/* Outer Frame */}
        <rect x="15" y="15" width="130" height="210" fill={frameColor} rx="3" filter="url(#balconShadow)"/>
        
        {/* Inner Frame */}
        <rect x="20" y="20" width="120" height="200" fill={darkFrame} rx="2"/>
        
        {/* Upper Window Section */}
        <rect x="28" y="28" width="104" height="110" fill="url(#balconGlass)" rx="1.5"/>
        <rect x="28" y="28" width="104" height="25" fill={glassHighlight} opacity="0.5" rx="1.5"/>
        
        {/* Horizontal Divider (Mid Rail) */}
        <rect x="20" y="138" width="120" height="6" fill={frameColor}/>
        <rect x="22" y="139" width="116" height="4" fill={darkFrame}/>
        
        {/* Lower Door Section */}
        <rect x="28" y="148" width="104" height="64" fill="url(#balconGlass)" rx="1.5"/>
        <rect x="28" y="148" width="104" height="15" fill={glassHighlight} opacity="0.3" rx="1.5"/>
        
        {/* Vertical Muntins */}
        <line x1="80" y1="28" x2="80" y2="138" stroke={frameColor} strokeWidth="2"/>
        <line x1="80" y1="148" x2="80" y2="212" stroke={frameColor} strokeWidth="2"/>
        
        {/* Horizontal Muntin */}
        <line x1="28" y1="83" x2="132" y2="83" stroke={frameColor} strokeWidth="2"/>
        
        {/* Handle */}
        <rect x="122" y="175" width="7" height="25" fill="#C4A547" rx="2"/>
        <ellipse cx="125.5" cy="187" rx="2.5" ry="3.5" fill="#E5C76B"/>
        
        {isSelected && (
          <circle cx="80" cy="120" r="22" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="2.5"/>
        )}
      </svg>
    );
  }
  
  // Fereastră Triplă - Profesional
  if (productName.includes('tripl') || product?.sashes === 3) {
    const w = 240;
    const h = 160;
    const paneW = (w - 50) / 3;
    
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="tripleGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glassColor} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={glassColor} stopOpacity="0.4"/>
          </linearGradient>
        </defs>
        
        {/* Main Frame */}
        <rect x="15" y="15" width={w-30} height={h-30} fill={frameColor} rx="2"/>
        <rect x="18" y="18" width={w-36} height={h-36} fill={darkFrame} rx="1.5"/>
        
        {/* Left Pane */}
        <rect x="24" y="24" width={paneW} height={h-48} fill="url(#tripleGlass)" rx="1"/>
        <rect x="24" y="24" width={paneW} height="20" fill={glassHighlight} opacity="0.4"/>
        
        {/* Middle Pane */}
        <rect x={24 + paneW + 4} y="24" width={paneW} height={h-48} fill="url(#tripleGlass)" rx="1"/>
        <rect x={24 + paneW + 4} y="24" width={paneW} height="20" fill={glassHighlight} opacity="0.4"/>
        
        {/* Right Pane */}
        <rect x={24 + 2*paneW + 8} y="24" width={paneW} height={h-48} fill="url(#tripleGlass)" rx="1"/>
        <rect x={24 + 2*paneW + 8} y="24" width={paneW} height="20" fill={glassHighlight} opacity="0.4"/>
        
        {/* Mullions */}
        <rect x={24 + paneW} y="24" width="4" height={h-48} fill={frameColor} rx="1"/>
        <rect x={24 + 2*paneW + 4} y="24" width="4" height={h-48} fill={frameColor} rx="1"/>
        
        {/* Handle on middle pane */}
        <circle cx={24 + paneW + 4 + paneW - 8} cy={h/2} r="3.5" fill="#C4A547" stroke="#9D8438" strokeWidth="0.5"/>
        
        {isSelected && (
          <circle cx={w/2} cy={h/2} r="20" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="2.5"/>
        )}
      </svg>
    );
  }
  
  // Funcție helper pentru desenarea simbolului mecanismului (din configurator)
  const renderMechanismSymbol = (mechCode, cx, cy, size = 20, direction = 'dreapta') => {
    const code = mechCode?.toLowerCase() || '';
    
    const commonProps = {
      stroke: 'rgba(51, 65, 85, 0.7)',
      strokeWidth: "1.5",
      fill: 'none'
    };
    
    // Fix - cruce (+)
    if (code === 'fix') {
      return (
        <g>
          <line x1={cx - size/2} y1={cy} x2={cx + size/2} y2={cy} {...commonProps} />
          <line x1={cx} y1={cy - size/2} x2={cx} y2={cy + size/2} {...commonProps} />
        </g>
      );
    }
    
    // Batant - unghi care arată direcția deschiderii
    if (code === 'batant') {
      // Unghi ca în configurator: M 90 10 L 10 50 L 90 90 (stânga) sau M 10 10 L 90 50 L 10 90 (dreapta)
      const halfW = size * 0.8;
      const halfH = size * 0.8;
      const path = direction === 'stanga'
        ? `M ${cx + halfW} ${cy - halfH} L ${cx - halfW} ${cy} L ${cx + halfW} ${cy + halfH}`
        : `M ${cx - halfW} ${cy - halfH} L ${cx + halfW} ${cy} L ${cx - halfW} ${cy + halfH}`;
      return <path d={path} {...commonProps} />;
    }
    
    // Oscilo-batant - unghi + triunghi pentru basculare
    if (code === 'oscilo-batant') {
      const halfW = size * 0.8;
      const halfH = size * 0.8;
      // Primul unghi (batant)
      const path1 = direction === 'stanga'
        ? `M ${cx + halfW} ${cy - halfH} L ${cx - halfW} ${cy} L ${cx + halfW} ${cy + halfH}`
        : `M ${cx - halfW} ${cy - halfH} L ${cx + halfW} ${cy} L ${cx - halfW} ${cy + halfH}`;
      // Al doilea unghi (oscilo - triunghi de jos)
      const path2 = `M ${cx - halfW} ${cy + halfH} L ${cx} ${cy - halfH} L ${cx + halfW} ${cy + halfH}`;
      return (
        <g>
          <path d={path1} {...commonProps} />
          <path d={path2} {...commonProps} />
        </g>
      );
    }
    
    return null;
  };

  // Fereastră Dublă - Profesional
  if (productName.includes('dubl') || product?.sashes === 2) {
    const w = 240;
    const h = 160;
    const paneW = (w - 44) / 2;
    
    const mech0 = sashMechanisms[0];
    const mech1 = sashMechanisms[1];
    
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="doubleGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glassColor} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={glassColor} stopOpacity="0.4"/>
          </linearGradient>
        </defs>
        
        {/* Main Frame */}
        <rect x="15" y="15" width={w-30} height={h-30} fill={frameColor} rx="2"/>
        <rect x="18" y="18" width={w-36} height={h-36} fill={darkFrame} rx="1.5"/>
        
        {/* Left Pane */}
        <rect x="24" y="24" width={paneW} height={h-48} fill="url(#doubleGlass)" rx="1"/>
        <rect x="24" y="24" width={paneW} height="22" fill={glassHighlight} opacity="0.4"/>
        
        {/* Right Pane */}
        <rect x={24 + paneW + 4} y="24" width={paneW} height={h-48} fill="url(#doubleGlass)" rx="1"/>
        <rect x={24 + paneW + 4} y="24" width={paneW} height="22" fill={glassHighlight} opacity="0.4"/>
        
        {/* Center Mullion */}
        <rect x={24 + paneW} y="24" width="4" height={h-48} fill={frameColor} rx="1"/>
        
        {/* Handles */}
        <circle cx={24 + paneW - 8} cy={h/2} r="3.5" fill="#C4A547" stroke="#9D8438" strokeWidth="0.5"/>
        <circle cx={24 + paneW + 4 + 8} cy={h/2} r="3.5" fill="#C4A547" stroke="#9D8438" strokeWidth="0.5"/>
        
        {/* Mechanism Symbols */}
        {mech0 && renderMechanismSymbol(mech0, 24 + paneW/2, h/2 + 25, 10)}
        {mech1 && renderMechanismSymbol(mech1, 24 + paneW + 4 + paneW/2, h/2 + 25, 10)}
        
        {isSelected && (
          <circle cx={w/2} cy={h/2} r="20" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="2.5"/>
        )}
      </svg>
    );
  }
  
  // Ușă Culisantă - Profesional
  if (productName.includes('culisant') || product?.supports_sliding) {
    const w = 240;
    const h = 160;
    
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <linearGradient id="slidingGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glassColor} stopOpacity="0.7"/>
            <stop offset="100%" stopColor={glassColor} stopOpacity="0.3"/>
          </linearGradient>
        </defs>
        
        {/* Main Frame */}
        <rect x="15" y="15" width={w-30} height={h-30} fill={frameColor} rx="2"/>
        
        {/* Track */}
        <rect x="15" y={h-22} width={w-30} height="7" fill={darkFrame} rx="1"/>
        
        {/* Back Panel (Fixed) */}
        <rect x="30" y="28" width="85" height={h-52} fill="url(#slidingGlass)" opacity="0.5" rx="1"/>
        <rect x="30" y="28" width="85" height="18" fill={glassHighlight} opacity="0.3"/>
        <rect x="26" y="24" width="3" height={h-48} fill={frameColor} rx="0.5"/>
        <rect x="115" y="24" width="3" height={h-48} fill={frameColor} rx="0.5"/>
        
        {/* Front Panel (Sliding) */}
        <rect x="105" y="22" width="95" height={h-44} fill="url(#slidingGlass)" rx="1"/>
        <rect x="105" y="22" width="95" height="20" fill={glassHighlight} opacity="0.5"/>
        <rect x="102" y="20" width="3" height={h-40} fill={frameColor} rx="0.5"/>
        <rect x="200" y="20" width="3" height={h-40} fill={frameColor} rx="0.5"/>
        
        {/* Handle on sliding panel */}
        <rect x="112" y={h/2 - 12} width="4" height="24" fill="#C4A547" rx="1.5"/>
        <ellipse cx="114" cy={h/2} rx="2" ry="3" fill="#E5C76B"/>
        
        {/* Track indicator */}
        <line x1="25" y1={h-18} x2={w-25} y2={h-18} stroke={darkFrame} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="150" cy={h-18} r="3" fill="#C4A547"/>
        
        {isSelected && (
          <circle cx={w/2} cy={h/2} r="20" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="2.5"/>
        )}
      </svg>
    );
  }
  
  // Fereastră Standard (1 canat) - Profesional
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full">
      <defs>
        <linearGradient id="singleGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={glassColor} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={glassColor} stopOpacity="0.4"/>
        </linearGradient>
      </defs>
      
      {/* Main Frame */}
      <rect x="15" y="15" width="150" height="150" fill={frameColor} rx="2"/>
      <rect x="18" y="18" width="144" height="144" fill={darkFrame} rx="1.5"/>
      
      {/* Glass Pane */}
      <rect x="24" y="24" width="132" height="132" fill="url(#singleGlass)" rx="1"/>
      <rect x="24" y="24" width="132" height="28" fill={glassHighlight} opacity="0.5"/>
      
      {/* Handle */}
      <circle cx="145" cy="90" r="4" fill="#C4A547" stroke="#9D8438" strokeWidth="0.5"/>
      <rect x="143" y="87" width="4" height="12" fill="#C4A547" rx="1"/>
      
      {isSelected && (
        <circle cx="90" cy="90" r="22" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="2.5"/>
      )}
    </svg>
  );
};

export default ProductGraphic;