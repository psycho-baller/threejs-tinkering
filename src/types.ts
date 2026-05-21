export interface Joint {
  x: number;
  y: number;
  z: number;
}

export interface Bone {
  id: string;
  start: Joint;
  end: Joint;
  radius: number;
  weight: number;
}

export interface CrowdPreset {
  name: string;
  chaos: number; // 0 for strict crowd, 1 for vortex, intermediate values
  noiseStrength: number;
  noiseFrequency: number;
  returnSpeed: number;
  cameraPosition: [number, number, number];
  description: string;
}
