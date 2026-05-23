import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { simulationVertexShader, simulationFragmentShader } from "../shaders/simulationShader";
import { renderVertexShader, renderFragmentShader } from "../shaders/renderShader";

const TEXTURE_WIDTH = 512;
const TEXTURE_HEIGHT = 1024;
const PARTICLE_COUNT = TEXTURE_WIDTH * TEXTURE_HEIGHT;
const STANDOUT_PARTICLE_COUNT = 65_536;
const MAX_BASE_PARTICLE_SIZE = 0.05;

interface PositionTextureData {
  targetPositions: Float32Array;
  initialPositions: Float32Array;
  particleColors?: Float32Array;
}

interface GPGPUParticlesProps {
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
  renderPeopleMesh?: string;
}

interface GPGPUParticleSimulationProps extends GPGPUParticlesProps {
  textureData: PositionTextureData;
  textureType: THREE.TextureDataType;
}

function getSupportedGpgpuTextureType(gl: THREE.WebGLRenderer): THREE.TextureDataType | null {
  const supportsFloatTextures = gl.capabilities.isWebGL2 || Boolean(gl.extensions.get("OES_texture_float"));
  const supportsFloatRenderTargets = Boolean(gl.extensions.get("EXT_color_buffer_float"));
  const supportsHalfFloatRenderTargets = Boolean(gl.extensions.get("EXT_color_buffer_half_float"));

  if (supportsFloatTextures && supportsFloatRenderTargets) {
    return THREE.FloatType;
  }

  if (supportsFloatTextures && supportsHalfFloatRenderTargets) {
    return THREE.HalfFloatType;
  }

  return null;
}

function createPositionTexture(data: Float32Array) {
  const texture = new THREE.DataTexture(
    data,
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT,
    THREE.RGBAFormat,
    THREE.FloatType
  );

  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}

function GpuStatusMessage({ children }: { children: string }) {
  return (
    <Html center>
      <div className="max-w-xs rounded-lg border border-amber-500/40 bg-zinc-950/85 px-4 py-3 text-center text-xs font-mono text-amber-100 shadow-xl backdrop-blur-md">
        {children}
      </div>
    </Html>
  );
}

function CrowdTextureLoader(props: GPGPUParticlesProps & { textureType: THREE.TextureDataType }) {
  const [textureData, setTextureData] = useState<PositionTextureData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const renderPeopleMesh = props.renderPeopleMesh ?? "100k";

  useEffect(() => {
    let cancelled = false;
    setTextureData(null);
    setLoadError(null);
    const worker = new Worker(new URL("../workers/crowdTextureWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<PositionTextureData>) => {
      if (!cancelled) {
        setTextureData(event.data);
      }
    };

    worker.onerror = () => {
      if (!cancelled) {
        setLoadError("Unable to prepare the particle texture data.");
      }
      worker.terminate();
    };

    worker.postMessage({ width: TEXTURE_WIDTH, height: TEXTURE_HEIGHT, renderPeopleMesh });

    return () => {
      cancelled = true;
      worker.terminate();
    };
  }, [renderPeopleMesh]);

  if (loadError) {
    return <GpuStatusMessage>{loadError}</GpuStatusMessage>;
  }

  if (!textureData) {
    return <GpuStatusMessage>Preparing particle field...</GpuStatusMessage>;
  }

  return <GPGPUParticleSimulation {...props} textureData={textureData} />;
}

function GPGPUParticleSimulation({
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
  textureData,
  textureType,
}: GPGPUParticleSimulationProps) {
  const { gl } = useThree();
  const clampedBaseSize = Math.min(baseSize, MAX_BASE_PARTICLE_SIZE);

  const { targetTexture, initialTexture } = useMemo(() => {
    return {
      targetTexture: createPositionTexture(textureData.targetPositions),
      initialTexture: createPositionTexture(textureData.initialPositions),
    };
  }, [textureData]);

  const fbo = useMemo(() => {
    const options: THREE.RenderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: textureType,
      depthBuffer: false,
      stencilBuffer: false,
    };

    const rt0 = new THREE.WebGLRenderTarget(TEXTURE_WIDTH, TEXTURE_HEIGHT, options);
    const rt1 = new THREE.WebGLRenderTarget(TEXTURE_WIDTH, TEXTURE_HEIGHT, options);

    return { rt0, rt1 };
  }, [textureType]);

  const sim = useMemo(() => {
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
      uniforms: {
        uCurrentPosition: { value: null },
        uTargetPosition: { value: targetTexture },
        uTime: { value: 0 },
        uDeltaTime: { value: 0.016 },
        uNoiseStrength: { value: noiseStrength },
        uNoiseFrequency: { value: noiseFrequency },
        uReturnSpeed: { value: returnSpeed },
        uInteractionRadius: { value: interactionRadius },
        uMousePos: { value: new THREE.Vector3(999, 999, 999) },
        uMouseStrength: { value: mouseStrength },
        uChaos: { value: chaos },
        uStandoutRatio: { value: STANDOUT_PARTICLE_COUNT / PARTICLE_COUNT },
      },
      depthWrite: false,
      depthTest: false,
    });

    const simPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial);
    simScene.add(simPlane);

    return { simScene, simCamera, simMaterial, simPlane };
  }, [targetTexture]);

  const resetPass = useMemo(() => {
    const resetScene = new THREE.Scene();
    const resetMaterial = new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: `
        uniform sampler2D uInitTexture;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(uInitTexture, vUv);
        }
      `,
      uniforms: {
        uInitTexture: { value: initialTexture },
      },
      depthWrite: false,
      depthTest: false,
    });
    const resetMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), resetMaterial);
    resetScene.add(resetMesh);

    return { resetScene, resetMaterial, resetMesh };
  }, [initialTexture]);

  const currentRT = useRef<THREE.WebGLRenderTarget>(fbo.rt0);
  const nextRT = useRef<THREE.WebGLRenderTarget>(fbo.rt1);
  const initialized = useRef(false);
  const forceReset = useRef(false);

  const pointerVector = useMemo(() => new THREE.Vector3(), []);
  const mouseDirection = useMemo(() => new THREE.Vector3(), []);
  const projectedMousePosition = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const backupTarget = gl.getRenderTarget();

    gl.setRenderTarget(fbo.rt0);
    gl.render(resetPass.resetScene, sim.simCamera);

    gl.setRenderTarget(fbo.rt1);
    gl.render(resetPass.resetScene, sim.simCamera);

    gl.setRenderTarget(backupTarget);
    initialized.current = true;
  }, [fbo, gl, resetPass, sim]);

  const pointsGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const dummyPositions = new Float32Array(PARTICLE_COUNT * 3);
    const references = new Float32Array(PARTICLE_COUNT * 2);
    const randomSizes = new Float32Array(PARTICLE_COUNT);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      references[i * 2] = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
      references[i * 2 + 1] = Math.floor(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
      randomSizes[i] = 0.4 + Math.random() * 1.2;

      if (textureData.particleColors && i < STANDOUT_PARTICLE_COUNT) {
        particleColors[i * 3] = textureData.particleColors[i * 3];
        particleColors[i * 3 + 1] = textureData.particleColors[i * 3 + 1];
        particleColors[i * 3 + 2] = textureData.particleColors[i * 3 + 2];
      }
    }

    geom.setAttribute("position", new THREE.BufferAttribute(dummyPositions, 3));
    geom.setAttribute("reference", new THREE.BufferAttribute(references, 2));
    geom.setAttribute("aRandomSize", new THREE.BufferAttribute(randomSizes, 1));
    geom.setAttribute("aParticleColor", new THREE.BufferAttribute(particleColors, 3));

    return geom;
  }, [textureData.particleColors]);

  const useParticleColor = Boolean(textureData.particleColors);

  const pointsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      uniforms: {
        uPositionTexture: { value: null },
        uBaseSize: { value: clampedBaseSize },
        uPulseTime: { value: 0 },
        uAmberColor: { value: new THREE.Color(amberColor) },
        uGoldColor: { value: new THREE.Color(goldColor) },
        uStandoutColor: { value: new THREE.Color(standoutColor) },
        uSoloStandout: { value: soloStandout },
        uUseParticleColor: { value: useParticleColor },
      },
      blending: soloStandout ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      transparent: true,
    });
  }, [clampedBaseSize, soloStandout, useParticleColor]);

  useEffect(() => {
    sim.simMaterial.uniforms.uNoiseStrength.value = noiseStrength;
    sim.simMaterial.uniforms.uNoiseFrequency.value = noiseFrequency;
    sim.simMaterial.uniforms.uReturnSpeed.value = returnSpeed;
    sim.simMaterial.uniforms.uChaos.value = chaos;
    sim.simMaterial.uniforms.uInteractionRadius.value = interactionRadius;
    sim.simMaterial.uniforms.uMouseStrength.value = mouseStrength;
  }, [chaos, interactionRadius, mouseStrength, noiseFrequency, noiseStrength, returnSpeed, sim]);

  useEffect(() => {
    pointsMaterial.uniforms.uBaseSize.value = clampedBaseSize;
    pointsMaterial.uniforms.uAmberColor.value.set(amberColor);
    pointsMaterial.uniforms.uGoldColor.value.set(goldColor);
    pointsMaterial.uniforms.uStandoutColor.value.set(standoutColor);
    pointsMaterial.uniforms.uSoloStandout.value = soloStandout;
    pointsMaterial.uniforms.uUseParticleColor.value = useParticleColor;
  }, [amberColor, clampedBaseSize, goldColor, pointsMaterial, soloStandout, standoutColor, useParticleColor]);

  useEffect(() => {
    if (resetSignal > 0) {
      forceReset.current = true;
    }
  }, [resetSignal]);

  useFrame((state, delta) => {
    if (!initialized.current) return;

    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);
    const { pointer, camera } = state;

    pointerVector.set(pointer.x, pointer.y, 0.5).unproject(camera);
    mouseDirection.copy(pointerVector).sub(camera.position).normalize();

    const targetZ = -1.5;
    let distance = (targetZ - camera.position.z) / mouseDirection.z;
    if (Math.abs(mouseDirection.z) < 0.001) distance = 4.0;
    projectedMousePosition.copy(camera.position).addScaledVector(mouseDirection, distance);

    const backupTarget = gl.getRenderTarget();

    sim.simMaterial.uniforms.uTime.value = time;
    sim.simMaterial.uniforms.uDeltaTime.value = dt;
    sim.simMaterial.uniforms.uCurrentPosition.value = currentRT.current.texture;
    sim.simMaterial.uniforms.uMousePos.value.copy(projectedMousePosition);

    if (forceReset.current) {
      gl.setRenderTarget(currentRT.current);
      gl.render(resetPass.resetScene, sim.simCamera);
      gl.setRenderTarget(nextRT.current);
      gl.render(resetPass.resetScene, sim.simCamera);
      forceReset.current = false;
    }

    gl.setRenderTarget(nextRT.current);
    gl.render(sim.simScene, sim.simCamera);
    gl.setRenderTarget(backupTarget);

    const temp = currentRT.current;
    currentRT.current = nextRT.current;
    nextRT.current = temp;

    pointsMaterial.uniforms.uPositionTexture.value = currentRT.current.texture;
    pointsMaterial.uniforms.uPulseTime.value = time;
  });

  useEffect(() => {
    return () => {
      fbo.rt0.dispose();
      fbo.rt1.dispose();
      targetTexture.dispose();
      initialTexture.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      sim.simMaterial.dispose();
      sim.simPlane.geometry.dispose();
      resetPass.resetMaterial.dispose();
      resetPass.resetMesh.geometry.dispose();
    };
  }, [fbo, initialTexture, pointsGeometry, pointsMaterial, resetPass, sim, targetTexture]);

  return <points geometry={pointsGeometry} material={pointsMaterial} />;
}

export default function GPGPUParticles(props: GPGPUParticlesProps) {
  const { gl } = useThree();
  const textureType = useMemo(() => getSupportedGpgpuTextureType(gl), [gl]);

  if (!textureType) {
    return (
      <GpuStatusMessage>
        This GPU/browser does not support renderable floating-point textures required by the simulation.
      </GpuStatusMessage>
    );
  }

  return <CrowdTextureLoader {...props} textureType={textureType} />;
}
