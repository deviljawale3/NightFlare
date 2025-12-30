import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyClass } from '../types';
import RealisticEnemy from './RealisticEnemy';  // CHANGED: Using realistic enemy

/**
 * Premium Zombie Enemy Design - NOW USING REALISTIC ENEMY
 */

interface ZombieProps {
    position: [number, number, number];
    seed: number;
    type: EnemyClass;
    isAttacking?: boolean;
    isDying?: boolean;
    isStunned?: boolean;
    hitTime?: number;
}

export const PremiumZombie: React.FC<ZombieProps> = ({
    type,
    position,
    seed,
    isAttacking = false,
    isDying = false,
    isStunned = false,
    hitTime
}) => {
    // Simply pass through to RealisticEnemy
    return <RealisticEnemy
        type={type}
        position={position}
        seed={seed}
        isAttacking={isAttacking}
        isDying={isDying}
        isStunned={isStunned}
        hitTime={hitTime}
    />;
};

export default PremiumZombie;
