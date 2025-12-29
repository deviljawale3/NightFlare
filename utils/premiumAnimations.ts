/**
 * Premium Animation Utilities for NightFlare
 * Provides smooth, realistic animations with easing functions
 */

// Advanced Easing Functions
export const Easing = {
    // Smooth ease in/out (most natural)
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

    // Bounce effect (for UI elements)
    easeOutBounce: (t: number) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        else return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },

    // Elastic effect (for impacts)
    easeOutElastic: (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },

    // Back easing (overshoot)
    easeOutBack: (t: number) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },

    // Smooth start
    easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),

    // Smooth end
    easeInQuad: (t: number) => t * t,

    // Exponential (dramatic)
    easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

    // Circular (smooth arc)
    easeInOutCirc: (t: number) =>
        t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
};

// Spring Physics Simulation
export class SpringAnimation {
    private position: number = 0;
    private velocity: number = 0;
    private target: number = 0;

    constructor(
        private stiffness: number = 170,
        private damping: number = 26,
        private mass: number = 1
    ) { }

    setTarget(target: number) {
        this.target = target;
    }

    update(deltaTime: number): number {
        const springForce = -this.stiffness * (this.position - this.target);
        const dampingForce = -this.damping * this.velocity;
        const acceleration = (springForce + dampingForce) / this.mass;

        this.velocity += acceleration * deltaTime;
        this.position += this.velocity * deltaTime;

        return this.position;
    }

    getCurrentPosition(): number {
        return this.position;
    }

    reset(position: number = 0) {
        this.position = position;
        this.velocity = 0;
        this.target = position;
    }
}

// Smooth Value Interpolation
export class SmoothValue {
    private current: number;

    constructor(
        initialValue: number = 0,
        private smoothing: number = 0.1
    ) {
        this.current = initialValue;
    }

    update(target: number, deltaTime: number = 1): number {
        // Frame-rate independent smoothing
        const alpha = 1 - Math.exp(-this.smoothing * deltaTime * 60);
        this.current += (target - this.current) * alpha;
        return this.current;
    }

    set(value: number) {
        this.current = value;
    }

    get(): number {
        return this.current;
    }
}

// Camera Shake with Trauma System (realistic shake)
export class CameraShake {
    private trauma: number = 0;
    private traumaDecay: number = 1.5;

    addTrauma(amount: number) {
        this.trauma = Math.min(1, this.trauma + amount);
    }

    update(deltaTime: number): { x: number; y: number; rotation: number } {
        this.trauma = Math.max(0, this.trauma - this.traumaDecay * deltaTime);

        const shake = this.trauma * this.trauma; // Square for more dramatic effect
        const maxOffset = 0.5;
        const maxRotation = 0.05;

        return {
            x: (Math.random() * 2 - 1) * maxOffset * shake,
            y: (Math.random() * 2 - 1) * maxOffset * shake,
            rotation: (Math.random() * 2 - 1) * maxRotation * shake
        };
    }

    getTrauma(): number {
        return this.trauma;
    }
}

// Particle System for Premium Effects
export interface Particle {
    id: string;
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    life: number;
    maxLife: number;
    size: number;
    color: string;
    gravity: number;
}

export class ParticleEmitter {
    private particles: Particle[] = [];

    emit(config: {
        position: { x: number; y: number; z: number };
        count: number;
        spread: number;
        speed: number;
        life: number;
        size: number;
        color: string;
        gravity?: number;
    }) {
        for (let i = 0; i < config.count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spread = Math.random() * config.spread;

            this.particles.push({
                id: `particle-${Date.now()}-${i}`,
                position: { ...config.position },
                velocity: {
                    x: Math.cos(angle) * spread * config.speed,
                    y: Math.random() * config.speed * 2,
                    z: Math.sin(angle) * spread * config.speed
                },
                life: config.life,
                maxLife: config.life,
                size: config.size,
                color: config.color,
                gravity: config.gravity ?? 9.8
            });
        }
    }

    update(deltaTime: number): Particle[] {
        this.particles = this.particles.filter(p => {
            p.life -= deltaTime;
            if (p.life <= 0) return false;

            // Apply physics
            p.velocity.y -= p.gravity * deltaTime;
            p.position.x += p.velocity.x * deltaTime;
            p.position.y += p.velocity.y * deltaTime;
            p.position.z += p.velocity.z * deltaTime;

            // Air resistance
            p.velocity.x *= 0.98;
            p.velocity.z *= 0.98;

            return true;
        });

        return this.particles;
    }

    getParticles(): Particle[] {
        return this.particles;
    }

    clear() {
        this.particles = [];
    }
}

// Tween Animation System
export class Tween {
    private startTime: number = 0;
    private isRunning: boolean = false;

    constructor(
        private duration: number,
        private easing: (t: number) => number = Easing.easeInOutCubic,
        private onUpdate?: (progress: number) => void,
        private onComplete?: () => void
    ) { }

    start() {
        this.startTime = performance.now();
        this.isRunning = true;
    }

    update(): boolean {
        if (!this.isRunning) return false;

        const elapsed = performance.now() - this.startTime;
        const progress = Math.min(1, elapsed / this.duration);
        const easedProgress = this.easing(progress);

        if (this.onUpdate) {
            this.onUpdate(easedProgress);
        }

        if (progress >= 1) {
            this.isRunning = false;
            if (this.onComplete) {
                this.onComplete();
            }
            return false;
        }

        return true;
    }

    stop() {
        this.isRunning = false;
    }
}

// Sequence multiple animations
export class AnimationSequence {
    private currentIndex: number = 0;
    private animations: Tween[] = [];

    add(animation: Tween): AnimationSequence {
        this.animations.push(animation);
        return this;
    }

    start() {
        this.currentIndex = 0;
        if (this.animations.length > 0) {
            this.animations[0].start();
        }
    }

    update(): boolean {
        if (this.currentIndex >= this.animations.length) return false;

        const current = this.animations[this.currentIndex];
        const isRunning = current.update();

        if (!isRunning) {
            this.currentIndex++;
            if (this.currentIndex < this.animations.length) {
                this.animations[this.currentIndex].start();
                return true;
            }
            return false;
        }

        return true;
    }
}

// Realistic Motion Blur Effect (for fast movements)
export class MotionBlur {
    private previousPositions: Array<{ x: number; y: number; z: number }> = [];
    private maxSamples: number = 5;

    addPosition(position: { x: number; y: number; z: number }) {
        this.previousPositions.push({ ...position });
        if (this.previousPositions.length > this.maxSamples) {
            this.previousPositions.shift();
        }
    }

    getBlurTrail(): Array<{ x: number; y: number; z: number; opacity: number }> {
        return this.previousPositions.map((pos, index) => ({
            ...pos,
            opacity: (index + 1) / this.previousPositions.length * 0.3
        }));
    }

    clear() {
        this.previousPositions = [];
    }
}

// Screen Space Effects
export const ScreenEffects = {
    // Chromatic Aberration (for impacts)
    chromaticAberration: (intensity: number) => ({
        rOffset: { x: intensity * 2, y: 0 },
        gOffset: { x: 0, y: 0 },
        bOffset: { x: -intensity * 2, y: 0 }
    }),

    // Vignette (for focus)
    vignette: (intensity: number) => ({
        darkness: 0.3 + intensity * 0.5,
        offset: 0.5
    }),

    // Radial Blur (for speed)
    radialBlur: (intensity: number, center: { x: number; y: number }) => ({
        strength: intensity,
        center
    })
};

// Procedural Animation Helpers
export const ProceduralAnimation = {
    // Breathing effect
    breathe: (time: number, intensity: number = 0.05) => {
        return 1 + Math.sin(time * 2) * intensity;
    },

    // Idle sway
    sway: (time: number, frequency: number = 1, amplitude: number = 0.1) => {
        return Math.sin(time * frequency) * amplitude;
    },

    // Footstep bob
    bob: (time: number, speed: number = 5) => {
        return Math.abs(Math.sin(time * speed)) * 0.1;
    },

    // Head look (smooth tracking)
    smoothLook: (current: number, target: number, speed: number = 5, deltaTime: number) => {
        const diff = target - current;
        return current + diff * (1 - Math.exp(-speed * deltaTime));
    }
};

export default {
    Easing,
    SpringAnimation,
    SmoothValue,
    CameraShake,
    ParticleEmitter,
    Tween,
    AnimationSequence,
    MotionBlur,
    ScreenEffects,
    ProceduralAnimation
};
