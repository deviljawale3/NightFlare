import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnhancedCameraProps {
    playerPosition?: THREE.Vector3;
}

const EnhancedCamera: React.FC<EnhancedCameraProps> = ({ playerPosition }) => {
    const { camera } = useThree();
    const targetPosition = useRef(new THREE.Vector3());
    const targetLookAt = useRef(new THREE.Vector3());
    const currentLookAt = useRef(new THREE.Vector3());

    useEffect(() => {
        // Set initial camera position - TACTICAL ANGLE for better visibility
        camera.position.set(0, 22, 28); // Higher and further back
        camera.lookAt(0, 0, 0);

        // Optimize camera settings for tactical gameplay
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = 60; // Wider FOV for better situational awareness
            camera.near = 0.1;
            camera.far = 1000;
            camera.updateProjectionMatrix();
        }
    }, [camera]);

    useFrame((state, delta) => {
        if (!playerPosition) return;

        // TACTICAL CAMERA POSITION - Higher and angled for better visibility
        const idealOffset = new THREE.Vector3(0, 22, 28); // Elevated tactical view
        targetPosition.current.copy(playerPosition).add(idealOffset);

        // Smooth camera movement with adaptive lerp
        const lerpFactor = Math.min(delta * 4, 1); // Slightly faster for responsiveness
        camera.position.lerp(targetPosition.current, lerpFactor);

        // Look-at point - Focus on play area ahead of player
        targetLookAt.current.copy(playerPosition);
        targetLookAt.current.y += 1.5; // Look at player center
        targetLookAt.current.z -= 2; // Look slightly ahead for better anticipation

        // Smooth look-at transition
        currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
        camera.lookAt(currentLookAt.current);

        // Subtle dynamic camera tilt based on movement (optional enhancement)
        const movementSpeed = playerPosition.length();
        if (movementSpeed > 0.1) {
            const tiltAmount = Math.sin(state.clock.elapsedTime * 2) * 0.02;
            camera.rotation.z = tiltAmount;
        }
    });

    return null;
};

export default EnhancedCamera;
