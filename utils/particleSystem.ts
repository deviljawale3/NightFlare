import * as THREE from 'three';

// Particle Effect Types
export type ParticleEffectType =
    | 'explosion' | 'sparkle' | 'fire_burst' | 'confetti'
    | 'blood' | 'dust' | 'flame' | 'trail' | 'impact' | 'heal';

interface ParticleConfig {
    count: number;
    size: number;
    color: THREE.Color;
    lifetime: number;
    speed: number;
    spread: number;
    gravity: number;
}

class Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    size: number;
    color: THREE.Color;
    alpha: number;

    constructor(pos: THREE.Vector3, vel: THREE.Vector3, life: number, size: number, color: THREE.Color) {
        this.position = pos.clone();
        this.velocity = vel.clone();
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.color = color;
        this.alpha = 1;
    }

    update(delta: number, gravity: number): boolean {
        this.life -= delta;
        if (this.life <= 0) return false;

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(delta));

        // Apply gravity
        this.velocity.y -= gravity * delta;

        // Fade out
        this.alpha = this.life / this.maxLife;

        // Slow down
        this.velocity.multiplyScalar(0.98);

        return true;
    }
}

export class ParticleSystem {
    private particles: Particle[] = [];
    private scene: THREE.Scene;
    private particleGeometry: THREE.BufferGeometry;
    private particleMaterial: THREE.PointsMaterial;
    private particleMesh: THREE.Points;
    private maxParticles: number = 1000;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.initializeParticleSystem();
    }

    private initializeParticleSystem(): void {
        // Create geometry for particles
        this.particleGeometry = new THREE.BufferGeometry();

        // Create material
        this.particleMaterial = new THREE.PointsMaterial({
            size: 0.2,
            transparent: true,
            opacity: 1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Create mesh
        this.particleMesh = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.scene.add(this.particleMesh);
    }

    /**
     * Emit particles with specific configuration
     */
    emit(type: ParticleEffectType, position: THREE.Vector3): void {
        const config = this.getConfig(type);

        for (let i = 0; i < config.count; i++) {
            const angle = (Math.PI * 2 * i) / config.count + Math.random() * 0.5;
            const speed = config.speed * (0.5 + Math.random() * 0.5);

            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed * config.spread,
                Math.random() * speed * 2,
                Math.sin(angle) * speed * config.spread
            );

            const particle = new Particle(
                position,
                velocity,
                config.lifetime,
                config.size,
                config.color
            );

            this.particles.push(particle);
        }

        // Limit total particles
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
    }

    /**
     * Get configuration for particle type
     */
    private getConfig(type: ParticleEffectType): ParticleConfig {
        switch (type) {
            case 'explosion':
                return {
                    count: 30,
                    size: 0.3,
                    color: new THREE.Color(0xff6600),
                    lifetime: 1.0,
                    speed: 5,
                    spread: 1,
                    gravity: 2
                };

            case 'sparkle':
                return {
                    count: 15,
                    size: 0.15,
                    color: new THREE.Color(0xffff00),
                    lifetime: 0.8,
                    speed: 3,
                    spread: 0.5,
                    gravity: 0.5
                };

            case 'fire_burst':
                return {
                    count: 50,
                    size: 0.4,
                    color: new THREE.Color(0xff4400),
                    lifetime: 1.5,
                    speed: 8,
                    spread: 1.5,
                    gravity: 1
                };

            case 'confetti':
                return {
                    count: 40,
                    size: 0.2,
                    color: new THREE.Color(Math.random() * 0xffffff),
                    lifetime: 2.0,
                    speed: 6,
                    spread: 1.2,
                    gravity: 3
                };

            case 'blood':
                return {
                    count: 20,
                    size: 0.15,
                    color: new THREE.Color(0x880000),
                    lifetime: 0.6,
                    speed: 4,
                    spread: 0.8,
                    gravity: 5
                };

            case 'dust':
                return {
                    count: 10,
                    size: 0.1,
                    color: new THREE.Color(0xcccccc),
                    lifetime: 0.5,
                    speed: 1,
                    spread: 0.3,
                    gravity: 0.1
                };

            case 'flame':
                return {
                    count: 20,
                    size: 0.25,
                    color: new THREE.Color(0xff8800),
                    lifetime: 1.0,
                    speed: 2,
                    spread: 0.4,
                    gravity: -1 // Rises up
                };

            case 'trail':
                return {
                    count: 5,
                    size: 0.1,
                    color: new THREE.Color(0x00ffff),
                    lifetime: 0.3,
                    speed: 0.5,
                    spread: 0.1,
                    gravity: 0
                };

            case 'impact':
                return {
                    count: 15,
                    size: 0.2,
                    color: new THREE.Color(0xffffff),
                    lifetime: 0.4,
                    speed: 4,
                    spread: 0.6,
                    gravity: 2
                };

            case 'heal':
                return {
                    count: 20,
                    size: 0.2,
                    color: new THREE.Color(0x00ff00),
                    lifetime: 1.2,
                    speed: 3,
                    spread: 0.5,
                    gravity: -2 // Rises up
                };

            default:
                return {
                    count: 10,
                    size: 0.2,
                    color: new THREE.Color(0xffffff),
                    lifetime: 1.0,
                    speed: 3,
                    spread: 1,
                    gravity: 1
                };
        }
    }

    /**
     * Update all particles
     */
    update(delta: number): void {
        // Update particles
        this.particles = this.particles.filter(particle => {
            const config = this.getConfig('explosion'); // Get gravity from config
            return particle.update(delta, config.gravity);
        });

        // Update geometry
        this.updateGeometry();
    }

    /**
     * Update particle geometry for rendering
     */
    private updateGeometry(): void {
        const positions: number[] = [];
        const colors: number[] = [];
        const sizes: number[] = [];

        this.particles.forEach(particle => {
            positions.push(particle.position.x, particle.position.y, particle.position.z);
            colors.push(particle.color.r, particle.color.g, particle.color.b);
            sizes.push(particle.size * particle.alpha);
        });

        this.particleGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );
        this.particleGeometry.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 3)
        );

        // Update material opacity based on average alpha
        const avgAlpha = this.particles.reduce((sum, p) => sum + p.alpha, 0) / Math.max(this.particles.length, 1);
        this.particleMaterial.opacity = avgAlpha;
    }

    /**
     * Clear all particles
     */
    clear(): void {
        this.particles = [];
        this.updateGeometry();
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        this.particleGeometry.dispose();
        this.particleMaterial.dispose();
        this.scene.remove(this.particleMesh);
    }
}

// Singleton instance
let particleSystemInstance: ParticleSystem | null = null;

export const initializeParticleSystem = (scene: THREE.Scene): ParticleSystem => {
    if (!particleSystemInstance) {
        particleSystemInstance = new ParticleSystem(scene);
    }
    return particleSystemInstance;
};

export const getParticleSystem = (): ParticleSystem | null => {
    return particleSystemInstance;
};

export default ParticleSystem;
