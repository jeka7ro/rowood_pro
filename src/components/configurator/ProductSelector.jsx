import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowLeft, LayoutGrid, DoorOpen, Maximize2, Home } from 'lucide-react';

// SVG realist pentru Fereastră Standard (1 canat)
const SingleWindowSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
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
      <filter id="inner-shadow-s">
        <feOffset dx="1" dy="1"/>
        <feGaussianBlur stdDeviation="1" result="offset-blur"/>
        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
        <feFlood floodColor="#000" floodOpacity="0.15" result="color"/>
        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
        <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
      </filter>
    </defs>
    
    {/* Rama exterioară */}
    <rect x="20" y="20" width="160" height="160" fill="url(#frame-single)" stroke="#c0c0c0" strokeWidth="1"/>
    
    {/* Rama interioară (canat) */}
    <rect x="28" y="28" width="144" height="144" fill="url(#frame-single)" stroke="#b0b0b0" strokeWidth="1"/>
    
    {/* Sticla */}
    <rect x="36" y="36" width="128" height="128" fill="url(#glass-single)"/>
    <rect x="36" y="36" width="128" height="128" fill="url(#sky-reflection)"/>
    
    {/* Reflexie pe sticlă */}
    <path d="M40 40 L80 40 L40 80 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="50" y1="155" x2="155" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="15"/>
    
    {/* Mâner oscilo-batant */}
    <rect x="155" y="95" width="6" height="20" rx="1" fill="#a0a0a0"/>
    <rect x="154" y="100" width="8" height="10" rx="1" fill="#808080"/>
    
    {/* Umbra interioară pentru adâncime */}
    <rect x="36" y="36" width="128" height="128" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2"/>
  </svg>
);

// SVG realist pentru Fereastră Dublă (2 canaturi)
const DoubleWindowSVG = () => (
  <svg viewBox="0 0 280 200" className="w-full h-full">
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
    
    {/* Rama exterioară */}
    <rect x="20" y="20" width="240" height="160" fill="url(#frame-double)" stroke="#c0c0c0" strokeWidth="1"/>
    
    {/* Montantul central */}
    <rect x="134" y="20" width="12" height="160" fill="url(#frame-double)" stroke="#b0b0b0" strokeWidth="0.5"/>
    
    {/* Canat stânga */}
    <rect x="28" y="28" width="106" height="144" fill="url(#frame-double)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="36" y="36" width="90" height="128" fill="url(#glass-double)"/>
    <rect x="36" y="36" width="90" height="128" fill="url(#sky-d)"/>
    <path d="M40 40 L70 40 L40 70 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="45" y1="155" x2="120" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="10"/>
    
    {/* Canat dreapta */}
    <rect x="146" y="28" width="106" height="144" fill="url(#frame-double)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="154" y="36" width="90" height="128" fill="url(#glass-double)"/>
    <rect x="154" y="36" width="90" height="128" fill="url(#sky-d)"/>
    <path d="M158 40 L188 40 L158 70 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="163" y1="155" x2="238" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="10"/>
    
    {/* Mânere */}
    <rect x="118" y="95" width="6" height="18" rx="1" fill="#a0a0a0"/>
    <rect x="156" y="95" width="6" height="18" rx="1" fill="#a0a0a0"/>
  </svg>
);

// SVG realist pentru Fereastră Triplă (3 canaturi)
const TripleWindowSVG = () => (
  <svg viewBox="0 0 360 200" className="w-full h-full">
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
    
    {/* Rama exterioară */}
    <rect x="15" y="20" width="330" height="160" fill="url(#frame-triple)" stroke="#c0c0c0" strokeWidth="1"/>
    
    {/* Montanți */}
    <rect x="120" y="20" width="10" height="160" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="0.5"/>
    <rect x="230" y="20" width="10" height="160" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="0.5"/>
    
    {/* Canat 1 */}
    <rect x="23" y="28" width="97" height="144" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="30" y="35" width="83" height="130" fill="url(#glass-triple)"/>
    <rect x="30" y="35" width="83" height="130" fill="url(#sky-t)"/>
    <path d="M33 38 L58 38 L33 63 Z" fill="rgba(255,255,255,0.4)"/>
    
    {/* Canat 2 */}
    <rect x="130" y="28" width="100" height="144" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="137" y="35" width="86" height="130" fill="url(#glass-triple)"/>
    <rect x="137" y="35" width="86" height="130" fill="url(#sky-t)"/>
    <path d="M140 38 L165 38 L140 63 Z" fill="rgba(255,255,255,0.4)"/>
    
    {/* Canat 3 */}
    <rect x="240" y="28" width="97" height="144" fill="url(#frame-triple)" stroke="#b0b0b0" strokeWidth="1"/>
    <rect x="247" y="35" width="83" height="130" fill="url(#glass-triple)"/>
    <rect x="247" y="35" width="83" height="130" fill="url(#sky-t)"/>
    <path d="M250 38 L275 38 L250 63 Z" fill="rgba(255,255,255,0.4)"/>
    
    {/* Mânere */}
    <rect x="107" y="95" width="5" height="16" rx="1" fill="#a0a0a0"/>
    <rect x="215" y="95" width="5" height="16" rx="1" fill="#a0a0a0"/>
  </svg>
);

// SVG realist pentru Ușă Culisantă
const SlidingDoorSVG = () => (
  <svg viewBox="0 0 320 220" className="w-full h-full">
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
    
    {/* Rama exterioară */}
    <rect x="15" y="15" width="290" height="190" fill="url(#frame-slide)" stroke="#b0b0b0" strokeWidth="1"/>
    
    {/* Șina jos */}
    <rect x="15" y="195" width="290" height="10" fill="url(#track-grad)"/>
    <line x1="20" y1="200" x2="300" y2="200" stroke="#505050" strokeWidth="2"/>
    
    {/* Panou fix (stânga, în spate) */}
    <rect x="25" y="25" width="130" height="165" fill="url(#frame-slide)" stroke="#a0a0a0" strokeWidth="1" opacity="0.9"/>
    <rect x="33" y="33" width="114" height="149" fill="url(#glass-slide)" opacity="0.7"/>
    <path d="M37 37 L77 37 L37 77 Z" fill="rgba(255,255,255,0.3)"/>
    
    {/* Panou culisant (dreapta, în față) */}
    <rect x="145" y="22" width="140" height="170" fill="url(#frame-slide)" stroke="#909090" strokeWidth="1.5"/>
    <rect x="155" y="32" width="120" height="150" fill="url(#glass-slide)"/>
    <path d="M160 37 L210 37 L160 87 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="170" y1="170" x2="265" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="15"/>
    
    {/* Mâner culisant */}
    <rect x="160" y="95" width="8" height="35" rx="2" fill="#707070"/>
    <rect x="162" y="100" width="4" height="25" rx="1" fill="#505050"/>
    
    {/* Indicator de glisare */}
    <path d="M240 200 L250 195 L250 205 Z" fill="#606060"/>
    <path d="M80 200 L70 195 L70 205 Z" fill="#606060"/>
  </svg>
);

// SVG realist pentru Ușă de Intrare
const EntryDoorSVG = () => (
  <svg viewBox="0 0 160 240" className="w-full h-full">
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
    
    {/* Rama ușii */}
    <rect x="15" y="10" width="130" height="220" fill="url(#door-frame)" stroke="#b0b0b0" strokeWidth="1"/>
    
    {/* Panoul ușii */}
    <rect x="25" y="20" width="110" height="200" fill="url(#door-panel)" rx="1"/>
    
    {/* Geam decorativ sus */}
    <rect x="35" y="30" width="90" height="70" fill="url(#door-glass)" rx="1"/>
    <path d="M40 35 L75 35 L40 70 Z" fill="rgba(255,255,255,0.3)"/>
    <line x1="45" y1="95" x2="120" y2="35" stroke="rgba(255,255,255,0.15)" strokeWidth="8"/>
    
    {/* Separator orizontal */}
    <rect x="35" y="105" width="90" height="4" fill="#2a2a2a"/>
    
    {/* Panou mijloc */}
    <rect x="35" y="115" width="90" height="45" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1"/>
    <rect x="40" y="120" width="80" height="35" fill="#4a4a4a" rx="1"/>
    
    {/* Panou jos */}
    <rect x="35" y="168" width="90" height="45" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1"/>
    <rect x="40" y="173" width="80" height="35" fill="#4a4a4a" rx="1"/>
    
    {/* Mâner */}
    <ellipse cx="120" cy="135" rx="8" ry="6" fill="url(#handle-metal)"/>
    <rect x="115" y="140" width="10" height="25" rx="2" fill="url(#handle-metal)"/>
    <ellipse cx="120" cy="167" rx="6" ry="4" fill="#909090"/>
    
    {/* Yală */}
    <circle cx="120" cy="155" r="5" fill="#808080" stroke="#606060" strokeWidth="1"/>
    <rect x="118" y="153" width="4" height="4" fill="#404040"/>
  </svg>
);

// SVG realist pentru Ușă de Balcon
const BalconyDoorSVG = () => (
  <svg viewBox="0 0 160 240" className="w-full h-full">
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
    
    {/* Rama exterioară */}
    <rect x="15" y="10" width="130" height="220" fill="url(#balc-frame)" stroke="#b0b0b0" strokeWidth="1"/>
    
    {/* Canat superior (fix sau oscilo) */}
    <rect x="23" y="18" width="114" height="95" fill="url(#balc-frame)" stroke="#a0a0a0" strokeWidth="1"/>
    <rect x="30" y="25" width="100" height="81" fill="url(#balc-glass)"/>
    <rect x="30" y="25" width="100" height="81" fill="url(#sky-balc)"/>
    <path d="M34 29 L69 29 L34 64 Z" fill="rgba(255,255,255,0.4)"/>
    <line x1="40" y1="100" x2="125" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="10"/>
    
    {/* Traversă orizontală */}
    <rect x="15" y="113" width="130" height="10" fill="url(#balc-frame)" stroke="#a0a0a0" strokeWidth="0.5"/>
    
    {/* Canat inferior (ușă) */}
    <rect x="23" y="123" width="114" height="100" fill="url(#balc-frame)" stroke="#a0a0a0" strokeWidth="1"/>
    <rect x="30" y="130" width="100" height="86" fill="url(#balc-glass)"/>
    <rect x="30" y="130" width="100" height="86" fill="url(#sky-balc)"/>
    <path d="M34 134 L64 134 L34 164 Z" fill="rgba(255,255,255,0.35)"/>
    <line x1="38" y1="210" x2="125" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="10"/>
    
    {/* Mâner */}
    <rect x="123" y="165" width="6" height="28" rx="1.5" fill="#909090"/>
    <rect x="121" y="172" width="10" height="14" rx="1" fill="#707070"/>
  </svg>
);

// Funcție pentru a alege SVG-ul corect
const getProductSVG = (product) => {
  const name = product?.name?.toLowerCase() || '';
  const category = product?.category || '';
  
  // Ușă de intrare
  if (category === 'usi' && !name.includes('balcon') && !name.includes('culisant')) {
    if (name.includes('culisant')) return <SlidingDoorSVG />;
    return <EntryDoorSVG />;
  }
  
  // Ușă de balcon
  if (category === 'usi-balcon' || name.includes('balcon')) {
    return <BalconyDoorSVG />;
  }
  
  // Culisante
  if (name.includes('culisant') || product?.supports_sliding) {
    return <SlidingDoorSVG />;
  }
  
  // Fereastră triplă
  if (name.includes('tripl') || product?.sashes === 3) {
    return <TripleWindowSVG />;
  }
  
  // Fereastră dublă
  if (name.includes('dubl') || product?.sashes === 2) {
    return <DoubleWindowSVG />;
  }
  
  // Fereastră standard
  return <SingleWindowSVG />;
};

export default function ProductSelector({ products, config, updateConfig }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Initialize category if a product is already selected (e.g., from Home Page)
  useEffect(() => {
    if (config.product_id && !selectedCategory) {
      const prod = products.find(p => p.id === config.product_id);
      if (prod) {
        if (prod.category === 'usi-balcon' || prod.name?.toLowerCase().includes('balcon')) setSelectedCategory('usi-balcon');
        else if (prod.category === 'usi' && !prod.name?.toLowerCase().includes('culisant')) setSelectedCategory('usi-intrare');
        else if (prod.name?.toLowerCase().includes('culisant') || prod.supports_sliding) setSelectedCategory('culisant');
        else setSelectedCategory('ferestre');
      }
    }
  }, [config.product_id, products, selectedCategory]);

  const categories = [
    { id: 'ferestre', title: 'Ferestre', desc: 'Sisteme clasice de la 1 la 3 canaturi', icon: LayoutGrid, svg: <SingleWindowSVG /> },
    { id: 'usi-balcon', title: 'Uși de Balcon', desc: 'Pentru terase și balcoane', icon: DoorOpen, svg: <BalconyDoorSVG /> },
    { id: 'culisant', title: 'Culisante / Terasă', desc: 'Uși duble sau glisante mari', icon: Maximize2, svg: <SlidingDoorSVG /> },
    { id: 'usi-intrare', title: 'Uși de Intrare', desc: 'Design elegant și securitate', icon: Home, svg: <EntryDoorSVG /> }
  ];

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    // Optional: reset product if switching category
    // updateConfig('product_id', null);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const filteredProducts = products.filter(product => {
    const name = product?.name?.toLowerCase() || '';
    const cat = product?.category || '';
    
    if (selectedCategory === 'usi-intrare') return cat === 'usi' && !name.includes('balcon') && !name.includes('culisant');
    if (selectedCategory === 'usi-balcon') return cat === 'usi-balcon' || name.includes('balcon');
    if (selectedCategory === 'culisant') return name.includes('culisant') || product?.supports_sliding;
    if (selectedCategory === 'ferestre') return cat !== 'usi' && cat !== 'usi-balcon' && !name.includes('culisant') && !product?.supports_sliding;
    
    return true; // fallback
  });

  return (
    <div className="max-w-7xl mx-auto">
      {!selectedCategory ? (
        <>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">Pasul 1. Alege Categoria</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-3xl mx-auto">
            Selectează o categorie principală de tâmplărie pentru a vedea variantele și formele disponibile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className="cursor-pointer group flex flex-col liquid-glass bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-2 border-transparent hover:border-green-500 rounded-[24px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 flex items-center justify-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110">
                    {cat.svg}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col border-t border-slate-100 dark:border-slate-700/50 text-center">
                  <div className="w-10 h-10 mx-auto rounded-[14px] bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                    <cat.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">{cat.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <button 
              onClick={handleBack}
              className="group flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Înapoi
            </button>
            <div className="text-center sm:text-right">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Alege Forma</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Variante pentru {categories.find(c => c.id === selectedCategory)?.title}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-5">
            {filteredProducts.length === 0 ? (
               <div className="w-full text-center py-12 px-4 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                 <p className="text-slate-500 dark:text-slate-400">Nu am găsit produse active în această categorie.</p>
               </div>
            ) : filteredProducts.map((product) => {
              const isSelected = product.id === config.product_id;

              return (
            <div
              key={product.id}
              onClick={() => updateConfig('product_id', product.id)}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white dark:bg-slate-800 w-[200px] flex-shrink-0 overflow-hidden ${
                isSelected 
                  ? 'ring-4 ring-green-500 dark:ring-green-400 shadow-xl shadow-green-500/30' 
                  : 'ring-1 ring-slate-200 dark:ring-slate-600 hover:ring-green-300 dark:hover:ring-green-600'
              }`}
              style={{ borderRadius: 0 }}
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden flex items-center justify-center p-3">
                {getProductSVG(product)}
                
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1.5 shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                {product.is_featured && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-green-600 text-white text-xs px-2 py-1 rounded-none">Top</Badge>
                  </div>
                )}
                {product.is_on_promotion && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="destructive" className="bg-red-600 text-white text-xs px-2 py-1 rounded-none">Promoție</Badge>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 text-center leading-tight">{product.name}</h4>
              </div>
            </div>
          );
        })}
          </div>
        </>
      )}
    </div>
  );
}