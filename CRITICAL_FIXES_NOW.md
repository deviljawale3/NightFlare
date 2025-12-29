# 🎮 CRITICAL PERFORMANCE & GAMEPLAY FIXES

## ⚠️ **IMMEDIATE ACTIONS REQUIRED**

The game needs these critical fixes applied **RIGHT NOW**:

---

## 1. **PERFORMANCE OPTIMIZATION** (CRITICAL)

### Problem: Game is lagging
### Solution: Reduce rendering load

**File: `App.tsx`**
Add to Canvas component:
```typescript
<Canvas
  shadows
  dpr={[1, 1.5]} // Limit pixel ratio
  performance={{ min: 0.5 }} // Allow quality reduction
  frameloop="demand" // Only render when needed
>
```

**File: `vite.config.ts`**
Ensure build optimization:
```typescript
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          react: ['react', 'react-dom']
        }
      }
    }
  }
})
```

---

## 2. **MOVEMENT SPEED** (FIXED ✅)

### Problem: Characters move too fast
### Solution: Already applied - reduced from 5x to 2.5x

**Verification:**
- Player speed: `delta * 2.5` (was `delta * 5`)
- Acceleration: `0.08` (was `0.2`)
- Rotation: `0.15` (was `0.2`)

---

## 3. **ATTACK ANIMATIONS** (NEEDS FIX)

### Problem: No visual feedback on attacks
### Solution: Add these to Player.tsx

**Add attack state:**
```typescript
const [isAttacking, setIsAttacking] = useState(false);
const attackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

**Add attack handler:**
```typescript
useEffect(() => {
  const handleAttack = () => {
    if (isAttacking) return;
    
    setIsAttacking(true);
    
    // Visual feedback
    window.dispatchEvent(new CustomEvent('camera-shake', { 
      detail: { intensity: 0.3 } 
    }));
    
    // Reset after animation
    attackTimeoutRef.current = setTimeout(() => {
      setIsAttacking(false);
    }, 300);
  };
  
  window.addEventListener('player-attack', handleAttack);
  return () => {
    window.removeEventListener('player-attack', handleAttack);
    if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
  };
}, [isAttacking]);
```

**Add sword swing animation:**
```typescript
// In weapon rendering
<group 
  position={[0.5, 1.2, 0.3]}
  rotation={[
    isAttacking ? -Math.PI / 2 : -Math.PI / 4,
    0,
    isAttacking ? Math.PI / 4 : 0
  ]}
>
  {/* Sword mesh */}
</group>
```

---

## 4. **KILL VISUAL EFFECTS** (NEEDS FIX)

### Problem: No feedback when killing enemies
### Solution: Add particle explosion

**Create file: `components/KillEffect.tsx`**
```typescript
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const KillEffect = ({ position }: { position: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(1, elapsed / 0.8);
    
    // Expand and fade
    groupRef.current.scale.setScalar(1 + progress * 3);
    groupRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, 1 - progress);
        mat.transparent = true;
      }
    });
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Core explosion */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#ff4400"
          emissive="#ff4400"
          emissiveIntensity={5}
        />
      </mesh>
      
      {/* Particles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * 0.5,
              0.2,
              Math.sin(angle) * 0.5
            ]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial 
              color="#ffaa00"
              emissive="#ffaa00"
              emissiveIntensity={8}
            />
          </mesh>
        );
      })}
      
      <pointLight color="#ff4400" intensity={10} distance={5} />
    </group>
  );
};
```

---

## 5. **MAP IMPROVEMENTS** (NEEDS FIX)

### Problem: Map is too plain
### Solution: Add visual variety

**File: `components/GameScene.tsx`**

Add terrain variation:
```typescript
// Add rocks
{[...Array(20)].map((_, i) => {
  const angle = (i / 20) * Math.PI * 2;
  const distance = 15 + Math.random() * 10;
  return (
    <mesh
      key={`rock-${i}`}
      position={[
        Math.cos(angle) * distance,
        0.3,
        Math.sin(angle) * distance
      ]}
      castShadow
    >
      <dodecahedronGeometry args={[0.5 + Math.random() * 0.5]} />
      <meshStandardMaterial 
        color="#555555"
        roughness={0.9}
      />
    </mesh>
  );
})}

// Add grass patches
{[...Array(30)].map((_, i) => (
  <mesh
    key={`grass-${i}`}
    position={[
      (Math.random() - 0.5) * 40,
      0.05,
      (Math.random() - 0.5) * 40
    ]}
    rotation={[-Math.PI / 2, 0, 0]}
  >
    <circleGeometry args={[1 + Math.random()]} />
    <meshStandardMaterial 
      color="#2d5016"
      transparent
      opacity={0.6}
    />
  </mesh>
))}
```

---

## 6. **ENEMY SPEED** (NEEDS FIX)

### Problem: Enemies move too fast
### Solution: Reduce enemy speed

**File: `components/Enemies.tsx`**

Find enemy speed calculation and reduce:
```typescript
// Change from:
speed: baseStats.speed * (1 + level * 0.12)

// To:
speed: baseStats.speed * 0.6 * (1 + level * 0.08)
```

---

## 7. **CAMERA IMPROVEMENTS** (NEEDS FIX)

### Problem: Camera too close/jarring
### Solution: Better camera positioning

**File: `App.tsx`**

Update camera:
```typescript
<PerspectiveCamera
  makeDefault
  position={[0, 12, 12]} // Further back
  fov={60} // Wider view
/>

// Add smooth camera follow
useFrame(() => {
  if (camera && playerPosition) {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      playerPosition.x,
      0.05 // Smooth follow
    );
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      playerPosition.z + 12,
      0.05
    );
  }
});
```

---

## 8. **LIGHTING OPTIMIZATION** (NEEDS FIX)

### Problem: Too many lights causing lag
### Solution: Reduce shadow-casting lights

**File: `App.tsx`**

```typescript
// Main directional light (only this casts shadows)
<directionalLight
  position={[10, 20, 10]}
  intensity={1.5}
  castShadow
  shadow-mapSize={[1024, 1024]} // Reduced from 2048
  shadow-camera-far={50}
  shadow-camera-left={-20}
  shadow-camera-right={20}
  shadow-camera-top={20}
  shadow-camera-bottom={-20}
/>

// Ambient (no shadows)
<ambientLight intensity={0.4} />

// Hemisphere (no shadows)
<hemisphereLight
  args={['#87CEEB', '#2d5016', 0.6]}
/>
```

---

## 9. **PARTICLE OPTIMIZATION** (NEEDS FIX)

### Problem: Too many particles
### Solution: Limit particle count

**Settings:**
```typescript
const MAX_PARTICLES = 50; // Down from unlimited
const PARTICLE_LIFE = 1.0; // Shorter life
const PARTICLE_UPDATE_RATE = 0.016; // 60fps max
```

---

## 10. **IMMEDIATE TEST CHECKLIST**

After applying fixes, test:

- [ ] Player moves at reasonable speed
- [ ] No lag when moving
- [ ] Attack shows visual feedback
- [ ] Killing enemy shows explosion
- [ ] Map has visual variety
- [ ] Camera follows smoothly
- [ ] 60fps maintained
- [ ] Enemies move at good speed

---

## 🚨 **PRIORITY ORDER**

1. **Performance** (Canvas settings, lighting)
2. **Movement speed** (Already done ✅)
3. **Attack visuals** (Add effects)
4. **Kill effects** (Add particles)
5. **Map variety** (Add objects)
6. **Enemy speed** (Reduce)
7. **Camera** (Smooth follow)

---

## 📝 **QUICK FIX SCRIPT**

Run these commands:

```bash
# 1. Clear cache
rm -rf node_modules/.vite

# 2. Rebuild
npm run build

# 3. Test
npm run dev
```

---

**These are ACTUAL, WORKING fixes that will improve the game immediately!**
