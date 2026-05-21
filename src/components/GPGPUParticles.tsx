import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { generateCrowdTextures } from "../utils/proceduralHuman";
import { simulationVertexShader, simulationFragmentShader } from "../shaders/simulationShader";
import { renderVertexShader, renderFragmentShader } from "../shaders/renderShader";

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
}

export default function GPGPUParticles({
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
  resetSignal
}: GPGPUParticlesProps) {
  const { gl } = useThree();

  const width = 512;
  const height = 1024;
  const size = width * height; // 524,288 particles

  // 1. Generate Coordinates & Textures
  const { targetPositions, initialPositions, targetTexture, initialTexture } = useMemo(() => {
    const { targetPositions, initialPositions } = generateCrowdTextures(width, height);

    // Convert arrays into Float32 DataTextures
    const targetTex = new THREE.DataTexture(
      targetPositions,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    targetTex.minFilter = THREE.NearestFilter;
    targetTex.magFilter = THREE.NearestFilter;
    targetTex.wrapS = THREE.ClampToEdgeWrapping;
    targetTex.wrapT = THREE.ClampToEdgeWrapping;
    targetTex.needsUpdate = true;

    const initialTex = new THREE.DataTexture(
      initialPositions,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    initialTex.minFilter = THREE.NearestFilter;
    initialTex.magFilter = THREE.NearestFilter;
    initialTex.wrapS = THREE.ClampToEdgeWrapping;
    initialTex.wrapT = THREE.ClampToEdgeWrapping;
    initialTex.needsUpdate = true;

    return {
      targetPositions,
      initialPositions,
      targetTexture: targetTex,
      initialTexture: initialTex
    };
  }, []);

  // 2. Initialize GPGPU RenderTargets (Ping-Pong buffers)
  const fbo = useMemo(() => {
    const options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.FloatType, // Full-float precision for GPGPU equations
      depthBuffer: false,
      stencilBuffer: false,
    };

    const rt0 = new THREE.WebGLRenderTarget(width, height, options);
    const rt1 = new THREE.WebGLRenderTarget(width, height, options);

    return { rt0, rt1 };
  }, []);

  // 3. Create the GPGPU Simulation Rig
  const sim = useMemo(() => {
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Simulation Material containing custom GLSL curl noise and target attraction
    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
      uniforms: {
        uCurrentPosition: { value: null },
        uTargetPosition: { value: targetTexture },
        uInitialPosition: { value: initialTexture },
        uTime: { value: 0 },
        uDeltaTime: { value: 0.016 },
        uSpeed: { value: 1.0 },
        uNoiseStrength: { value: noiseStrength },
        uNoiseFrequency: { value: noiseFrequency },
        uReturnSpeed: { value: returnSpeed },
        uInteractionRadius: { value: interactionRadius },
        uMousePos: { value: new THREE.Vector3(999, 999, 999) },
        uMouseStrength: { value: mouseStrength },
        uChaos: { value: chaos },
        uStandoutRatio: { value: 65536.0 / size } // Figure 0 consists of first 65,536 particles
      },
      depthWrite: false,
      depthTest: false
    });

    const simPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial);
    simScene.add(simPlane);

    return { simScene, simCamera, simMaterial, simPlane };
  }, [targetTexture, initialTexture]);

  // Helper variables to maintain ping-pong state
  const currentRT = useRef<THREE.WebGLRenderTarget>(fbo.rt0);
  const nextRT = useRef<THREE.WebGLRenderTarget>(fbo.rt1);

  // 4. Double render the initial coordinates into our Ping-Pong FBOs on mount
  const initialized = useRef(false);
  useEffect(() => {
    const backupTarget = gl.getRenderTarget();

    // Create a temporary layout mesh containing the raw coordinates data
    const initMaterial = new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: `
        uniform sampler2D uInitTexture;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(uInitTexture, vUv);
        }
      `,
      uniforms: {
        uInitTexture: { value: initialTexture }
      },
      depthWrite: false,
      depthTest: false
    });

    const initMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), initMaterial);
    const tempScene = new THREE.Scene();
    tempScene.add(initMesh);

    // Initial render into rt0
    gl.setRenderTarget(fbo.rt0);
    gl.render(tempScene, sim.simCamera);

    // Initial render into rt1
    gl.setRenderTarget(fbo.rt1);
    gl.render(tempScene, sim.simCamera);

    // Restore standard rendering destination
    gl.setRenderTarget(backupTarget);

    // Cleanup resources
    initMesh.geometry.dispose();
    initMaterial.dispose();

    initialized.current = true;
  }, [gl, fbo, sim, initialTexture]);

  // 5. Create Points Rendering Buffer Geometry
  const pointsGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();

    const dummyPositions = new Float32Array(size * 3); // empty since shaders overwrite position
    const references = new Float32Array(size * 2);
    const randomSizes = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      const u = (i % width) / width;
      const v = Math.floor(i / width) / height;

      references[i * 2 + 0] = u;
      references[i * 2 + 1] = v;

      // Random sizes between 0.4 and 1.6
      randomSizes[i] = 0.4 + Math.random() * 1.2;
    }

    geom.setAttribute("position", new THREE.BufferAttribute(dummyPositions, 3));
    geom.setAttribute("reference", new THREE.BufferAttribute(references, 2));
    geom.setAttribute("aRandomSize", new THREE.BufferAttribute(randomSizes, 1));

    return geom;
  }, []);

  // 6. Create Points Rendering Material
  const pointsMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      uniforms: {
        uPositionTexture: { value: null },
        uBaseSize: { value: baseSize },
        uPulseTime: { value: 0 },
        uAmberColor: { value: new THREE.Color(amberColor) },
        uGoldColor: { value: new THREE.Color(goldColor) },
        uStandoutColor: { value: new THREE.Color(standoutColor) }
      },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      transparent: true
    });

    return mat;
  }, []);

  // Sync props to uniforms immediately on prop adjustments
  useEffect(() => {
    sim.simMaterial.uniforms.uNoiseStrength.value = noiseStrength;
    sim.simMaterial.uniforms.uNoiseFrequency.value = noiseFrequency;
    sim.simMaterial.uniforms.uReturnSpeed.value = returnSpeed;
    sim.simMaterial.uniforms.uChaos.value = chaos;
    sim.simMaterial.uniforms.uInteractionRadius.value = interactionRadius;
    sim.simMaterial.uniforms.uMouseStrength.value = mouseStrength;
  }, [chaos, noiseStrength, noiseFrequency, returnSpeed, interactionRadius, mouseStrength]);

  useEffect(() => {
    pointsMaterial.uniforms.uBaseSize.value = baseSize;
    pointsMaterial.uniforms.uAmberColor.value.set(amberColor);
    pointsMaterial.uniforms.uGoldColor.value.set(goldColor);
    pointsMaterial.uniforms.uStandoutColor.value.set(standoutColor);
  }, [baseSize, amberColor, goldColor, standoutColor]);

  // Hook into re-triggering simulation resets (e.g. initial explosion blast)
  const forceReset = useRef(false);
  useEffect(() => {
    if (resetSignal > 0) {
      forceReset.current = true;
    }
  }, [resetSignal]);

  // Main Render Loop logic using Framerate-Independent clock delta
  useFrame((state, delta) => {
    if (!initialized.current) return;

    const time = state.clock.getElapsedTime();
    // Clamp delta time to maximum of 0.05s to prevent massive coordinates teleportation when page lags
    const dt = Math.min(delta, 0.05);

    // Track mouse projection onto focal depth plane
    const { pointer, camera } = state;
    const tempV = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    tempV.unproject(camera);
    const dir = tempV.sub(camera.position).normalize();
    // Project mouse cursor onto depth coordinate z=-1.5 (center depth of crowd)
    const targetZ = -1.5;
    let distance = (targetZ - camera.position.z) / dir.z;
    if (Math.abs(dir.z) < 0.001) distance = 4.0;
    const projectedMousePos = camera.position.clone().add(dir.multiplyScalar(distance));

    // A. Run GPGPU Simulation Step
    const backupTarget = gl.getRenderTarget();

    // Bind uniforms
    sim.simMaterial.uniforms.uTime.value = time;
    sim.simMaterial.uniforms.uDeltaTime.value = dt;
    sim.simMaterial.uniforms.uCurrentPosition.value = currentRT.current.texture;
    sim.simMaterial.uniforms.uMousePos.value.copy(projectedMousePos);

    // If a manual reset is requested, override positions back to initial textures
    if (forceReset.current) {
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
          uInitTexture: { value: initialTexture }
        },
        depthWrite: false,
        depthTest: false
      });
      const resetMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), resetMaterial);
      const resetScene = new THREE.Scene();
      resetScene.add(resetMesh);

      gl.setRenderTarget(currentRT.current);
      gl.render(resetScene, sim.simCamera);
      gl.setRenderTarget(nextRT.current);
      gl.render(resetScene, sim.simCamera);

      resetMesh.geometry.dispose();
      resetMaterial.dispose();
      forceReset.current = false;
    }

    // Render texture updates on the GPGPU Render Target
    gl.setRenderTarget(nextRT.current);
    gl.render(sim.simScene, sim.simCamera);

    // Restore standard rendering destination
    gl.setRenderTarget(backupTarget);

    // Swap Render Targets to complete GPGPU Ping-Pong
    const temp = currentRT.current;
    currentRT.current = nextRT.current;
    nextRT.current = temp;

    // B. Link current position texture to points render material
    pointsMaterial.uniforms.uPositionTexture.value = currentRT.current.texture;
    pointsMaterial.uniforms.uPulseTime.value = time;
  });

  // Clean up WebGL resources when component unmounts to prevent GPU leaks
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
    };
  }, []);

  return <points geometry={pointsGeometry} material={pointsMaterial} />;
}
