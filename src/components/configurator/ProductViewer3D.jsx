import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- Material Helpers ---
const createPVCFrameMaterial = (hexColor) => {
  return new THREE.MeshStandardMaterial({
    color: hexColor,
    roughness: 0.2,
    metalness: 0.1,
    envMapIntensity: 1.5,
  });
};

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.1,
  roughness: 0.05,
  envMapIntensity: 1.5,
  transmission: 0.95, // High transmission for clear glass
  transparent: true,
  opacity: 1,
  ior: 1.52,
  thickness: 0.02,
  side: THREE.DoubleSide, // Ensure back is visible
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

const handleMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  roughness: 0.4,
  metalness: 0.8,
});

const hingeMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  roughness: 0.5,
  metalness: 0.6,
});

// Dinamic Handle Material
const createHandleMaterial = (hexColor) => {
  return new THREE.MeshStandardMaterial({
    color: hexColor,
    roughness: 0.3,
    metalness: 0.8,
  });
};


// --- Component: Frame Profile (Rădăcină) ---
// Renders the outer frame.
const OuterFrame = ({ width, height, depth, frameWidth, color }) => {
  const material = useMemo(() => createPVCFrameMaterial(color), [color]);
  
  // Creates a hollow rectangle shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, -height / 2);
    s.lineTo(width / 2, -height / 2);
    s.lineTo(width / 2, height / 2);
    s.lineTo(-width / 2, height / 2);
    s.lineTo(-width / 2, -height / 2);

    const hole = new THREE.Path();
    hole.moveTo(-width / 2 + frameWidth, -height / 2 + frameWidth);
    hole.lineTo(width / 2 - frameWidth, -height / 2 + frameWidth);
    hole.lineTo(width / 2 - frameWidth, height / 2 - frameWidth);
    hole.lineTo(-width / 2 + frameWidth, height / 2 - frameWidth);
    hole.lineTo(-width / 2 + frameWidth, -height / 2 + frameWidth);
    s.holes.push(hole);

    return s;
  }, [width, height, frameWidth]);

  const extrudeSettings = { depth: depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.002, bevelThickness: 0.002 };

  return (
    <mesh material={material} position={[0, height / 2, -depth / 2]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
    </mesh>
  );
};


// --- Component: Sash (Cercevea) ---
const Sash = ({ width, height, depth, frameWidth, x, y, z, color, type, direction, isOpen, onInteract, handleColor, handleType, hingeType }) => {
   const sashRef = useRef();
   const material = useMemo(() => createPVCFrameMaterial(color), [color]);
   const dynHandleMaterial = useMemo(() => createHandleMaterial(handleColor || '#FFFFFF'), [handleColor]);
   
   // Animation for opening
   useFrame((state, delta) => {
     if (!sashRef.current) return;
     const targetAngle = isOpen ? (direction === 'stanga' ? Math.PI / 3 : -Math.PI / 3) : 0;
     const currentAngle = sashRef.current.rotation.y;
     sashRef.current.rotation.y += (targetAngle - currentAngle) * delta * 5;
   });

   const isFixed = type === 'fix' || !type;
   const innerWidth = width - frameWidth * 2;
   const innerHeight = height - frameWidth * 2;

   // Hinge position logic
   const hingeX = direction === 'stanga' ? -width/2 : width/2;
   const localGroupX = x + hingeX;
   const sashMeshX = -hingeX;

   if (isFixed) {
        // Fixed glass directly in the outer frame space
        return (
            <group position={[x, y + height/2, z]}>
                 <mesh material={glassMaterial} position={[0, 0, depth/2]}>
                    <boxGeometry args={[width, height, 0.02]} />
                 </mesh>
            </group>
        );
   }

   // Handle Geometry
   const renderHandle = () => {
      if (handleType === 'hidden') {
          return (
             <group position={[direction === 'stanga' ? width/2 - 0.03 : -width/2 + 0.03, 0, depth/2 + 0.01]}>
                 <mesh material={dynHandleMaterial}>
                    <boxGeometry args={[0.02, 0.15, 0.005]} />
                 </mesh>
             </group>
          );
      }
      
      const isDesign = handleType === 'design';
      return (
         <group position={[direction === 'stanga' ? width/2 - 0.05 : -width/2 + 0.05, 0, depth/2 + 0.02]} onClick={(e) => { e.stopPropagation(); onInteract(); }} style={{cursor: 'pointer'}}>
              {/* Base */}
              <mesh material={dynHandleMaterial} position={[0, 0, 0]}>
                  <boxGeometry args={[0.03, 0.12, 0.01]} />
              </mesh>
              {/* Grip */}
              <mesh material={dynHandleMaterial} position={[direction==='stanga'? (isDesign?-0.03:-0.04) : (isDesign?0.03:0.04), 0, 0.02]} rotation={isDesign ? [0,0,0] : [0, 0, Math.PI/2]}>
                  {isDesign 
                     ? <boxGeometry args={[0.08, 0.015, 0.015]} />
                     : <cylinderGeometry args={[0.01, 0.01, 0.1]} />
                  }
              </mesh>
         </group>
      );
   };

   // Movable sash
   return (
      <group position={[localGroupX, y + height/2, z]} ref={sashRef}>
         <group position={[sashMeshX, 0, 0]}>
            {/* Sash Frame */}
            <mesh material={material} castShadow receiveShadow>
                <boxGeometry args={[width, height, depth * 0.9]} />
            </mesh>
            
             <mesh position={[0, 0, depth * 0.9 / 2]} material={glassMaterial}>
                <boxGeometry args={[innerWidth, innerHeight, 0.02]} />
             </mesh>
             
             {/* Handle */}
             {renderHandle()}

             {/* Hinges */}
             {hingeType !== 'hidden' && (
                 <>
                    <mesh material={hingeMaterial} position={[hingeX, height/2 - 0.1, depth/2]} rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.05]} />
                    </mesh>
                    <mesh material={hingeMaterial} position={[hingeX, -height/2 + 0.1, depth/2]} rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.05]} />
                    </mesh>
                 </>
             )}
         </group>
      </group>
   );
};

// --- Component: Mullion (Zar) ---
// Vertical separator between sashes
const Mullion = ({ height, depth, width, x, y, z, color }) => {
    const material = useMemo(() => createPVCFrameMaterial(color), [color]);
    return (
        <mesh position={[x, y + height/2, z]} material={material}>
            <boxGeometry args={[width, height, depth]} />
        </mesh>
    );
}

// --- Main 3D Viewer Component ---
export default function ProductViewer3D({ 
    product, 
    width = 1000, 
    height = 1000, 
    color = { hex_code: '#ffffff' }, 
    individualSashWidths = [], 
    sashConfigs = [],
    useIndividualWidths = false,
    hardware = {}
}) {
    const [openSashes, setOpenSashes] = useState({});

    if (!product) return null;

    // Convert mm to meters for 3D engine (factor 1000)
    const scale = 0.001; 
    const w = width * scale;
    const h = height * scale;

    // Calculate dynamic camera distance (closer for a larger model)
    const maxDim = Math.max(w, h);
    const cameraZ = Math.max(0.6, maxDim * 0.85);
    
    // Physical dimensions
    const outerFrameDepth = 0.07; // 70mm
    const outerFrameThickness = 0.06; // 60mm face width
    const mullionWidth = 0.08; // 80mm

    const baseColor = color?.hex_code || '#ffffff';

    const toggleSash = (index) => {
        setOpenSashes(prev => ({...prev, [index]: !prev[index]}));
    };

    // Calculate sash positions and dimensions
    const numSashes = sashConfigs.length || 1;
    let sashes = [];
    let mullions = [];

    if (useIndividualWidths && individualSashWidths.length === numSashes) {
        let currentX = -w / 2 + outerFrameThickness;
        for (let i = 0; i < numSashes; i++) {
            const sashW = (individualSashWidths[i] * scale);
            // Sash
            sashes.push({
                idx: i,
                w: sashW,
                h: h - outerFrameThickness * 2,
                x: currentX + sashW / 2,
                y: outerFrameThickness,
                pattern: sashConfigs[i]
            });
            currentX += sashW;
            
            // Mullion (if not last)
            if (i < numSashes - 1) {
                mullions.push({
                    x: currentX + mullionWidth / 2,
                    y: outerFrameThickness,
                    h: h - outerFrameThickness * 2
                });
                currentX += mullionWidth;
            }
        }
    } else {
        // Even split
        const totalInnerW = w - (outerFrameThickness * 2) - (mullionWidth * (numSashes - 1));
        const sashW = totalInnerW / numSashes;
        let currentX = -w / 2 + outerFrameThickness;
        
        for (let i = 0; i < numSashes; i++) {
            sashes.push({
                 idx: i,
                w: sashW,
                h: h - outerFrameThickness * 2,
                x: currentX + sashW / 2,
                y: outerFrameThickness,
                 pattern: sashConfigs[i]
            });
            currentX += sashW;
             if (i < numSashes - 1) {
                mullions.push({
                    x: currentX + mullionWidth / 2,
                    y: outerFrameThickness,
                    h: h - outerFrameThickness * 2
                });
                currentX += mullionWidth;
            }
        }
    }

    return (
        <div className="w-full h-[500px] relative bg-slate-50 dark:bg-slate-900 overflow-hidden rounded-b-[32px] shadow-inner">
             
            <Canvas shadows camera={{ position: [0, 0, cameraZ], fov: 45 }}>
                <color attach="background" args={['#f8fafc']} />
                {/* Enhanced Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight 
                    castShadow 
                    position={[5, 5, 5]} 
                    intensity={1.5} 
                    shadow-mapSize={[2048, 2048]} 
                />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                <Environment preset="apartment" background={false} blur={0.5} />

                <group position={[0, -h/2, 0]}>
                    <OuterFrame 
                        width={w} 
                        height={h} 
                        depth={outerFrameDepth} 
                        frameWidth={outerFrameThickness} 
                        color={baseColor} 
                    />

                    {mullions.map((m, i) => (
                        <Mullion 
                            key={`m-${i}`} 
                            width={mullionWidth}
                            height={m.h}
                            depth={outerFrameDepth}
                            x={m.x}
                            y={m.y}
                            z={0}
                            color={baseColor}
                        />
                    ))}

                    {sashes.map((s, i) => (
                        <Sash
                            key={`s-${i}`}
                            width={s.w}
                            height={s.h}
                            depth={outerFrameDepth * 0.9}
                            frameWidth={0.06}
                            x={s.x}
                            y={s.y}
                            z={-outerFrameDepth * 0.05}
                            color={baseColor}
                            type={s.pattern?.type}
                            direction={s.pattern?.direction}
                            isOpen={openSashes[i]}
                            onInteract={() => toggleSash(i)}
                            handleColor={hardware.handleColor}
                            handleType={hardware.handleType}
                            hingeType={hardware.hingeType}
                        />
                    ))}
                </group>

                <ContactShadows position={[0, -h/2 - 0.01, 0]} opacity={0.4} scale={5} blur={2} far={2} />
                <OrbitControls 
                    makeDefault 
                    minPolarAngle={Math.PI / 4} 
                    maxPolarAngle={Math.PI / 1.5} 
                    autoRotate={true}
                    autoRotateSpeed={1.0}
                    enableZoom={true}
                    enablePan={true}
                />
            </Canvas>
        </div>
    );
}

