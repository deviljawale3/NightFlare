import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import { useSettingsStore } from './SettingsPanel';

const PostProcessing: React.FC = () => {
    const quality = useSettingsStore(s => s.quality);

    if (quality === 'low') return null; // Disable on low quality

    return (
        <EffectComposer disableNormalPass multisampling={quality === 'high' ? 4 : 0}>
            {/* Bloom for the Neon/Cyberpunk look */}
            <Bloom
                luminanceThreshold={0.6}
                luminanceSmoothing={0.9}
                height={300}
                intensity={quality === 'high' ? 1.5 : 0.8}
            />

            {/* Vignette - Cheap, keep it */}
            <Vignette
                eskil={false}
                offset={0.1}
                darkness={0.5}
            />

            {/* Noise - Skip on medium to save fill rate */}
            {quality === 'high' && (
                <Noise
                    opacity={0.02}
                    blendFunction={BlendFunction.OVERLAY}
                />
            )}
        </EffectComposer>
    );
};

export default PostProcessing;
