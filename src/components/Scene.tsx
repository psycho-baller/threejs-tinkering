import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import GPGPUParticles from "./GPGPUParticles";

interface SceneProps {
  chaos: number;
  noiseStrength: number;
  noiseFrequency: number;
  returnSpeed: number;
  baseSize: number;
  interactionRadius: number;
  mouseStrength: number;
  amberColor: string;
  goldColor: string;
  standoutColor: string;
  resetSignal: number;
  soloStandout?: boolean;
  debugView?: boolean;
  renderPeopleMesh?: string;
}

export default function Scene({
  chaos,
  noiseStrength,
  noiseFrequency,
  returnSpeed,
  baseSize,
  interactionRadius,
  mouseStrength,
  amberColor,
  goldColor,
  standoutColor,
  resetSignal,
  soloStandout = false,
  debugView = false,
  renderPeopleMesh = "100k"
}: SceneProps) {
  const debugCameraPosition: [number, number, number] = soloStandout ? [0, 0.05, 3.2] : [0, 0.25, 7.2];
  const debugCameraTarget: [number, number, number] = soloStandout ? [0, -0.1, 0] : [0, -0.25, -3.4];

  return (
    <div id="canvas-container" className="w-full h-full relative" style={{ background: "#050508" }}>
      <Canvas
        camera={{
          position: debugView ? debugCameraPosition : [0, 1.2, 5.0],
          fov: debugView ? 38 : 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          logarithmicDepthBuffer: false,
        }}
      >
        {/* Subtle Ambient Scene environment (mostly pitch black void as requested) */}
        <color attach="background" args={["#030305"]} />
        <ambientLight intensity={0.02} />

        {/* 1. Orchestrated Particle Crowd */}
        <GPGPUParticles
          chaos={chaos}
          noiseStrength={noiseStrength}
          noiseFrequency={noiseFrequency}
          returnSpeed={returnSpeed}
          baseSize={baseSize}
          interactionRadius={interactionRadius}
          mouseStrength={mouseStrength}
          amberColor={amberColor}
          goldColor={goldColor}
          standoutColor={standoutColor}
          resetSignal={resetSignal}
          soloStandout={soloStandout}
          renderPeopleMesh={renderPeopleMesh}
        />

        {/* 2. Elegant cinematic camera limits for deep orbital views */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1.5}
          maxDistance={15.0}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.15} // Let user look slightly upwards
          minPolarAngle={1.0}
          target={debugView ? debugCameraTarget : [0, 0.4, -0.6]} // Target center of gravity of the crowd
        />

        {/* 3. Epic Lusion bloom glow setup */}
        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={debugView ? 0.65 : 0.2} // Threshold to ensure background is slate-black
            luminanceSmoothing={0.9}
            intensity={debugView ? 0.06 : 1.8} // Rich, ambient golden glowing light leakage
          />
          <Noise opacity={debugView ? 0.006 : 0.02} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
