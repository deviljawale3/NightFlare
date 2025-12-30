import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stage, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { soundEffects } from '../utils/soundEffects';

interface NexusShopProps {
    onClose: () => void;
}

type SkinType = 'DEFAULT' | 'CYBER_NINJA' | 'VOID_WALKER' | 'SOLAR_KNIGHT';

const PlayerPreview: React.FC<{ skin: SkinType }> = ({ skin }) => {
    const groupRef = useRef<THREE.Group>(null);

    // Colors based on skin
    const colors = useMemo(() => {
        switch (skin) {
            case 'CYBER_NINJA': return { shirt: '#000000', pants: '#111111', accent: '#00ff00', emissive: 2 };
            case 'VOID_WALKER': return { shirt: '#1a0b2e', pants: '#0f0518', accent: '#8b5cf6', emissive: 3 };
            case 'SOLAR_KNIGHT': return { shirt: '#fef3c7', pants: '#78350f', accent: '#fbbf24', emissive: 1 };
            default: return { shirt: '#2d5a27', pants: '#1a1a1a', accent: '#00ffff', emissive: 0 };
        }
    }, [skin]);

    useFrame((state) => {
        if (groupRef.current) {
            // Idle Animation
            const t = state.clock.elapsedTime;
            groupRef.current.position.y = Math.sin(t) * 0.1 - 1; // Center height
            groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Main Body Reuse from RealisticPlayer structure roughly */}
            <group>
                {/* Torso */}
                <mesh position={[0, 1.15, 0]} castShadow>
                    <capsuleGeometry args={[0.18, 0.4, 8, 16]} />
                    <meshStandardMaterial color={colors.shirt} roughness={0.7} />
                </mesh>
                {/* Head */}
                <group position={[0, 1.6, 0]}>
                    <mesh castShadow>
                        <capsuleGeometry args={[0.12, 0.12, 8, 16]} />
                        <meshStandardMaterial color="#fddba3" roughness={0.6} />
                    </mesh>
                    {/* Visor */}
                    <mesh position={[0, 0.02, 0.08]}>
                        <boxGeometry args={[0.18, 0.04, 0.06]} />
                        <meshStandardMaterial color="#081b24" emissive={colors.accent} emissiveIntensity={colors.emissive} />
                    </mesh>
                </group>
                {/* Legs */}
                <mesh position={[-0.1, 0.45, 0]} castShadow>
                    <capsuleGeometry args={[0.09, 0.5, 8, 16]} />
                    <meshStandardMaterial color={colors.pants} />
                </mesh>
                <mesh position={[0.1, 0.45, 0]} castShadow>
                    <capsuleGeometry args={[0.09, 0.5, 8, 16]} />
                    <meshStandardMaterial color={colors.pants} />
                </mesh>
                {/* Arms */}
                <mesh position={[-0.22, 1.2, 0]} rotation={[0, 0, -0.1]} castShadow>
                    <capsuleGeometry args={[0.06, 0.28, 8, 16]} />
                    <meshStandardMaterial color={colors.shirt} />
                </mesh>
                <mesh position={[0.22, 1.2, 0]} rotation={[0, 0, 0.1]} castShadow>
                    <capsuleGeometry args={[0.06, 0.28, 8, 16]} />
                    <meshStandardMaterial color={colors.shirt} />
                </mesh>
            </group>
        </group>
    );
};

const NexusShop: React.FC<NexusShopProps> = ({ onClose }) => {
    const [shopTab, setShopTab] = useState<'SKINS' | 'WEAPONS' | 'DRONES'>('SKINS');
    const [selectedSkin, setSelectedSkin] = useState<SkinType>('DEFAULT');
    const [selectedWeapon, setSelectedWeapon] = useState<string>('STAFF');
    const [selectedDrone, setSelectedDrone] = useState<import('../types').DroneType>('VORTEX');
    const {
        stardust, ownedSkins, activeSkin, purchaseSkin, equipSkin,
        playerStats, upgradeWeapon, equipWeapon, purchaseWeapon, purchaseDrone
    } = useGameStore();

    const skins: { id: SkinType; name: string; cost: number; desc: string; icon: string }[] = [
        { id: 'DEFAULT', name: 'Tactical Operative', cost: 0, desc: 'Standard issue gear for NightFlare operations.', icon: '🛡️' },
        { id: 'CYBER_NINJA', name: 'Cyber Ninja', cost: 1000, desc: 'Stealth composite armor with neon accents.', icon: '🥷' },
        { id: 'VOID_WALKER', name: 'Void Walker', cost: 2500, desc: 'Infused with the essence of the abyss.', icon: '🌌' },
        { id: 'SOLAR_KNIGHT', name: 'Solar Knight', cost: 5000, desc: 'Radiant armor forged in a dying star.', icon: '☀️' }
    ];

    const drones: { id: import('../types').DroneType; name: string; cost: number; desc: string; icon: string }[] = [
        { id: 'VORTEX', name: 'Vortex Collector', cost: 500, desc: 'Automated resource vacuum.', icon: '🧲' },
        { id: 'STINGER', name: 'Stinger Sentry', cost: 1000, desc: 'Aggressive air-to-ground defense.', icon: '🔫' },
        { id: 'AEGIS', name: 'Aegis Shield', cost: 1500, desc: 'Personal protection drone.', icon: '🛡️' }
    ];

    const currentItem = shopTab === 'SKINS'
        ? skins.find(s => s.id === selectedSkin)
        : (shopTab === 'WEAPONS' ? weapons.find(w => w.id === selectedWeapon) : drones.find(d => d.id === selectedDrone));

    const isOwned = shopTab === 'SKINS'
        ? ownedSkins.includes(selectedSkin)
        : (shopTab === 'WEAPONS'
            ? (playerStats.weaponLevels[selectedWeapon as any] > 0)
            : playerStats.activeDrones.includes(selectedDrone));

    const isActive = shopTab === 'SKINS'
        ? activeSkin === selectedSkin
        : (shopTab === 'WEAPONS' ? playerStats.currentWeapon === selectedWeapon : true);

    const handleAction = () => {
        if (!currentItem) return;

        if (isOwned) {
            // Equip
            if (shopTab === 'SKINS') {
                equipSkin(selectedSkin);
            } else {
                equipWeapon(selectedWeapon as any);
            }
            soundEffects.play('success' as any);
        } else {
            // Purchase
            if (shopTab === 'DRONES') {
                if (playerStats.titanCredits >= currentItem!.cost) {
                    purchaseDrone(selectedDrone, currentItem!.cost);
                    soundEffects.levelUp();
                } else { soundEffects.playError(); }
            } else if (stardust >= currentItem!.cost) {
                if (shopTab === 'SKINS') {
                    purchaseSkin(selectedSkin, currentItem!.cost);
                } else {
                    purchaseWeapon(selectedWeapon, currentItem!.cost);
                }
                soundEffects.levelUp();
            } else {
                soundEffects.playError();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#050505] animate-in fade-in duration-500 font-['Outfit']">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(20,20,40,1)_0%,_rgba(0,0,0,1)_100%)]" />
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#4f4f4f 1px, transparent 1px), linear-gradient(90deg, #4f4f4f 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-8 flex justify-between z-10 pointer-events-none">
                <div>
                    <h1 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 font-orbitron italic tracking-tighter drop-shadow-lg">
                        NEXUS
                    </h1>
                    <p className="text-white/40 tracking-[0.3em] sm:tracking-[0.5em] text-[10px] sm:text-sm font-bold uppercase pl-1">Armory & Requisitions</p>

                    {/* Tab Switcher */}
                    <div className="mt-4 sm:mt-8 flex gap-2 pointer-events-auto">
                        <button
                            onClick={() => setShopTab('SKINS')}
                            className={`px-4 py-1.5 sm:px-8 sm:py-2.5 rounded-xl font-black tracking-widest text-[10px] sm:text-xs transition-all border
                                ${shopTab === 'SKINS'
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}
                            `}
                        >
                            SKINS
                        </button>
                        <button
                            onClick={() => setShopTab('WEAPONS')}
                            className={`px-4 py-1.5 sm:px-8 sm:py-2.5 rounded-xl font-black tracking-widest text-[10px] sm:text-xs transition-all border
                                ${shopTab === 'WEAPONS'
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}
                            `}
                        >
                            WEAPONS
                        </button>
                        <button
                            onClick={() => setShopTab('DRONES')}
                            className={`px-4 py-1.5 sm:px-8 sm:py-2.5 rounded-xl font-black tracking-widest text-[10px] sm:text-xs transition-all border
                                ${shopTab === 'DRONES'
                                    ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}
                            `}
                        >
                            DRONES
                        </button>
                    </div>
                </div>
                <div className="pointer-events-auto flex flex-col items-end gap-2 sm:gap-4">
                    <button onClick={onClose} className="px-4 py-1.5 sm:px-6 sm:py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all text-xs sm:text-sm">
                        EXIT NEXUS
                    </button>
                    <div className="bg-slate-900/80 p-2 sm:p-4 rounded-2xl border border-yellow-500/30 flex items-center gap-2 sm:gap-3 backdrop-blur-xl">
                        <span className="text-lg sm:text-2xl">✨</span>
                        <span className="text-lg sm:text-2xl font-black text-white">{stardust.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 sm:p-4 rounded-2xl border border-orange-500/30 flex items-center gap-2 sm:gap-3 backdrop-blur-xl">
                        <span className="text-lg sm:text-2xl">🛡️</span>
                        <span className="text-lg sm:text-2xl font-black text-white">{playerStats.titanCredits.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* 3D Viewport - Only for Skins or weapon preview eventually */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${shopTab === 'WEAPONS' ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                <Canvas shadows camera={{ position: [3, 2, 5], fov: 40 }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

                    <Stage environment="city" intensity={0.6} adjustCamera={false}>
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <PlayerPreview skin={selectedSkin} />
                        </Float>
                    </Stage>

                    <Sparkles count={50} scale={5} size={4} speed={0.4} opacity={0.5} color="#ffffff" />
                    <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} autoRotate autoRotateSpeed={2} />
                </Canvas>
            </div>

            {/* Selection Panel */}
            <div className="absolute bottom-4 sm:bottom-10 left-4 sm:left-10 right-4 sm:right-10 flex justify-center z-10 pointer-events-none">
                <div className="flex gap-2 sm:gap-4 p-2 sm:p-4 bg-black/80 backdrop-blur-md rounded-3xl border border-white/10 pointer-events-auto overflow-x-auto max-w-full custom-scrollbar">
                    {(shopTab === 'SKINS' ? skins : (shopTab === 'WEAPONS' ? weapons : drones)).map(item => {
                        const isItemSelected = shopTab === 'SKINS' ? selectedSkin === item.id : (shopTab === 'WEAPONS' ? selectedWeapon === item.id : selectedDrone === item.id);
                        const owned = shopTab === 'SKINS' ? ownedSkins.includes(item.id) : (shopTab === 'WEAPONS' ? (playerStats.weaponLevels[item.id as any] > 0) : playerStats.activeDrones.includes(item.id as any));
                        const active = shopTab === 'SKINS' ? activeSkin === item.id : playerStats.currentWeapon === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (shopTab === 'SKINS') setSelectedSkin(item.id as SkinType);
                                    else if (shopTab === 'WEAPONS') setSelectedWeapon(item.id);
                                    else setSelectedDrone(item.id as any);
                                }}
                                className={`flex flex-col items-center p-2 sm:p-4 rounded-2xl min-w-[120px] sm:min-w-[160px] transition-all border
                                   ${isItemSelected
                                        ? 'bg-gradient-to-br from-indigo-900/80 to-slate-900/80 border-indigo-500 scale-105 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                                    }
                               `}
                            >
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-2 sm:mb-3 flex items-center justify-center text-lg sm:text-xl shadow-inner
                                     ${isItemSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}
                                `}>
                                    {item.icon}
                                </div>
                                <div className="font-bold text-white text-xs sm:text-sm mb-1">{item.name}</div>
                                {owned ? (
                                    <div className={`text-[10px] sm:text-xs font-bold ${active ? 'text-cyan-400' : 'text-green-400'}`}>
                                        {active ? 'EQUIPPED' : 'OWNED'}
                                    </div>
                                ) : (
                                    <div className="text-[10px] sm:text-xs text-orange-400">{item.cost.toLocaleString()} {shopTab === 'DRONES' ? '🛡️' : '✨'}</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Info Panel */}
            <div className="absolute top-24 sm:top-1/2 sm:-translate-y-1/2 left-4 sm:left-auto right-4 sm:right-10 sm:w-80 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border-l-4 border-indigo-500 animate-slide-in-from-right">
                    <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase">{currentItem?.name}</h3>
                    <p className="text-white/60 text-xs sm:text-sm mt-2 leading-relaxed hidden sm:block">{currentItem?.desc}</p>
                    <p className="text-white/60 text-xs mt-1 leading-relaxed sm:hidden line-clamp-2">{currentItem?.desc}</p>

                    <div className="mt-3 sm:mt-6 flex gap-2">
                        <div className="text-[8px] sm:text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-white/40">{shopTab === 'SKINS' ? 'ARMOR CLASS IV' : (shopTab === 'WEAPONS' ? 'TIER III WEAPON' : 'SENTINEL V')}</div>
                        <div className="text-[8px] sm:text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-white/40">{shopTab === 'SKINS' ? 'KINETIC SHIELD' : (shopTab === 'WEAPONS' ? 'IONIZED ROUNDS' : 'AUTO-FOLLOW')}</div>
                    </div>

                    <div className="mt-4 sm:mt-8 pointer-events-auto">
                        {!isOwned ? (
                            <button
                                onClick={handleAction}
                                disabled={shopTab === 'DRONES' ? playerStats.titanCredits < (currentItem?.cost || 0) : stardust < (currentItem?.cost || 0)}
                                className={`w-full py-3 rounded-xl font-black tracking-widest transition-all
                                    ${(shopTab === 'DRONES' ? playerStats.titanCredits >= (currentItem?.cost || 0) : stardust >= (currentItem?.cost || 0))
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/20 text-black'
                                        : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}
                                `}
                            >
                                PURCHASE FOR {(currentItem?.cost || 0).toLocaleString()} {shopTab === 'DRONES' ? '🛡️' : '✨'}
                            </button>
                        ) : (
                            <button
                                onClick={handleAction}
                                disabled={isActive}
                                className={`w-full py-3 rounded-xl font-black tracking-widest transition-all
                                    ${isActive
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20'}
                                `}
                            >
                                {isActive ? 'EQUIPPED' : 'EQUIP ITEM'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NexusShop;
