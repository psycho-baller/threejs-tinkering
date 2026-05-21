import { Joint, Bone } from "../types";

// Helper to define joint coordinates in 3D
function createJoint(x: number, y: number, z: number): Joint {
  return { x, y, z };
}

// Generates 8 standard poses as bone lists
function getPoseBones(poseType: number): Bone[] {
  const bones: Bone[] = [];

  // Define bone indices
  const torsoStart = createJoint(0, 0.4, 0);
  const torsoEnd = createJoint(0, 1.15, 0);
  const neckStart = createJoint(0, 1.15, 0);
  const neckEnd = createJoint(0, 1.25, 0);
  // Sphere centered at (0, 1.38, 0)
  const headStart = createJoint(0, 1.38, 0);
  const headEnd = createJoint(0, 1.38, 0);

  // Default Leg Joints
  let lThighS = createJoint(-0.11, 0.4, 0);
  let lThighE = createJoint(-0.13, 0.0, 0);
  let lShinS = createJoint(-0.13, 0.0, 0);
  let lShinE = createJoint(-0.13, -0.45, 0.05);

  let rThighS = createJoint(0.11, 0.4, 0);
  let rThighE = createJoint(0.13, 0.0, 0);
  let rShinS = createJoint(0.13, 0.0, 0);
  let rShinE = createJoint(0.13, -0.45, 0.05);

  // Default Arm Joints
  let lShoulder = createJoint(-0.18, 1.1, 0);
  let lElbow = createJoint(-0.28, 0.75, -0.05);
  let lWrist = createJoint(-0.24, 0.40, 0.05);

  let rShoulder = createJoint(0.18, 1.1, 0);
  let rElbow = createJoint(0.28, 0.75, -0.05);
  let rWrist = createJoint(0.24, 0.40, 0.05);

  // Customize poses depending on poseType
  switch (poseType) {
    case 0: // Idle Standing
      // Hand resting slightly down-forward
      lElbow = createJoint(-0.25, 0.7, -0.05);
      lWrist = createJoint(-0.2, 0.35, 0.05);
      rElbow = createJoint(0.25, 0.7, -0.05);
      rWrist = createJoint(0.2, 0.35, 0.05);
      break;

    case 1: // Welcoming / Hand Raised High
      // Raise Right Arm
      rElbow = createJoint(0.32, 1.35, 0.1);
      rWrist = createJoint(0.42, 1.75, 0.2);
      // Left arm slightly bent at side
      lElbow = createJoint(-0.28, 0.75, 0.1);
      lWrist = createJoint(-0.2, 0.45, 0.2);
      break;

    case 2: // Thinking / Right Hand on Chin
      // Right arm curves in front of body up to chin
      rElbow = createJoint(0.18, 0.8, 0.15);
      rWrist = createJoint(0.04, 1.25, 0.22);
      // Left arm supports right elbow
      lElbow = createJoint(-0.25, 0.7, 0.12);
      lWrist = createJoint(0.12, 0.72, 0.2);
      break;

    case 3: // Cross-Armed
      // Arms folded in front of chest
      lElbow = createJoint(-0.26, 0.85, 0.15);
      lWrist = createJoint(0.18, 0.85, 0.2);
      rElbow = createJoint(0.26, 0.81, 0.17);
      rWrist = createJoint(-0.18, 0.81, 0.2);
      break;

    case 4: // Dynamic Shifting / Dancer Pose
      // Body curved
      lShoulder = createJoint(-0.16, 1.08, -0.05);
      lElbow = createJoint(-0.35, 0.9, 0.15);
      lWrist = createJoint(-0.42, 1.2, 0.25); // raised left arm
      rShoulder = createJoint(0.18, 1.12, 0.05);
      rElbow = createJoint(0.34, 0.8, -0.1);
      rWrist = createJoint(0.25, 0.45, -0.15);
      // Leg shifted
      lThighE = createJoint(-0.18, 0.05, 0.1);
      lShinS = createJoint(-0.18, 0.05, 0.1);
      lShinE = createJoint(-0.2, -0.45, 0.2);
      break;

    case 5: // Hands on Hips (Hero Stand)
      // Elbows flared out
      lElbow = createJoint(-0.38, 0.8, -0.05);
      lWrist = createJoint(-0.18, 0.58, 0.1); // resting on hip
      rElbow = createJoint(0.38, 0.8, -0.05);
      rWrist = createJoint(0.18, 0.58, 0.1); // resting on hip
      // Legs split wider apart
      lThighE = createJoint(-0.2, 0.0, 0.0);
      lShinS = createJoint(-0.2, 0.0, 0.0);
      lShinE = createJoint(-0.28, -0.45, 0.0);
      rThighE = createJoint(0.2, 0.0, 0.0);
      rShinS = createJoint(0.2, 0.0, 0.0);
      rShinE = createJoint(0.28, -0.45, 0.0);
      break;

    case 6: // Looking Up / Hopeful Reach
      // Left arm reaching high up-forward
      lElbow = createJoint(-0.22, 1.4, 0.1);
      lWrist = createJoint(-0.18, 1.85, 0.25);
      // Right arm down and back
      rElbow = createJoint(0.26, 0.7, -0.1);
      rWrist = createJoint(0.2, 0.35, -0.15);
      break;

    case 7: // Walking / Striding Motion
      // Alternating stride
      lThighE = createJoint(-0.15, 0.02, 0.15);
      lShinS = createJoint(-0.15, 0.02, 0.15);
      lShinE = createJoint(-0.12, -0.42, 0.3); // left foot forward
      rThighE = createJoint(0.12, 0.02, -0.15);
      rShinS = createJoint(0.12, 0.02, -0.15);
      rShinE = createJoint(0.14, -0.42, -0.3); // right foot backward
      // Arm swing opposite legs
      lElbow = createJoint(-0.22, 0.75, -0.15);
      lWrist = createJoint(-0.15, 0.45, -0.2); // left arm back
      rElbow = createJoint(0.24, 0.75, 0.15);
      rWrist = createJoint(0.18, 0.48, 0.25); // right arm forward
      break;
  }

  // Push all bones of the skeleton
  bones.push({ id: "torso", start: torsoStart, end: torsoEnd, radius: 0.15, weight: 0.28 });
  bones.push({ id: "head", start: headStart, end: headEnd, radius: 0.11, weight: 0.18 });
  bones.push({ id: "neck", start: neckStart, end: neckEnd, radius: 0.05, weight: 0.02 });

  bones.push({ id: "l_upperarm", start: lShoulder, end: lElbow, radius: 0.045, weight: 0.06 });
  bones.push({ id: "l_lowerarm", start: lElbow, end: lWrist, radius: 0.035, weight: 0.06 });
  bones.push({ id: "r_upperarm", start: rShoulder, end: rElbow, radius: 0.045, weight: 0.06 });
  bones.push({ id: "r_lowerarm", start: rElbow, end: rWrist, radius: 0.035, weight: 0.06 });

  bones.push({ id: "l_thigh", start: lThighS, end: lThighE, radius: 0.065, weight: 0.07 });
  bones.push({ id: "l_shin", start: lShinS, end: lShinE, radius: 0.05, weight: 0.07 });
  bones.push({ id: "r_thigh", start: rThighS, end: rThighE, radius: 0.065, weight: 0.07 });
  bones.push({ id: "r_shin", start: rShinS, end: rShinE, radius: 0.05, weight: 0.07 });

  return bones;
}

// Samples a single 3D point on or inside a capsule segment
function sampleBonePoint(bone: Bone, out: { x: number; y: number; z: number }) {
  const { start, end, radius } = bone;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const lengthSq = dx * dx + dy * dy + dz * dz;

  if (lengthSq < 0.0001) {
    // It's a sphere (like the head)
    const u1 = Math.random();
    const u2 = Math.random();
    const theta = u1 * Math.PI * 2.0;
    const phi = Math.acos(2.0 * u2 - 1.0);
    // Uniform volumetric sphere packing
    const r = radius * (0.8 + 0.2 * Math.pow(Math.random(), 0.3));

    out.x = start.x + r * Math.sin(phi) * Math.cos(theta);
    out.y = start.y + r * Math.sin(phi) * Math.sin(theta);
    out.z = start.z + r * Math.cos(phi);
    return;
  }

  // Parametric point along segment length
  // We prefer points packed a bit around the center for volume, but fairly uniform
  const t = Math.random();
  const px = start.x + t * dx;
  const py = start.y + t * dy;
  const pz = start.z + t * dz;

  // Make a unit vector perpendicular to the segment (dx, dy, dz)
  let rx = Math.random() - 0.5;
  let ry = Math.random() - 0.5;
  let rz = Math.random() - 0.5;

  // Cross product of (dx,dy,dz) and random (rx,ry,rz)
  let pxVal = dy * rz - dz * ry;
  let pyVal = dz * rx - dx * rz;
  let pzVal = dx * ry - dy * rx;

  let lengthP = Math.sqrt(pxVal * pxVal + pyVal * pyVal + pzVal * pzVal);
  if (lengthP < 0.0001) {
    rx += 0.5;
    pxVal = dy * rz - dz * ry;
    pyVal = dz * rx - dx * rz;
    pzVal = dx * ry - dy * rx;
    lengthP = Math.sqrt(pxVal * pxVal + pyVal * pyVal + pzVal * pzVal);
  }

  // Normalize perpendicular axis P
  pxVal /= lengthP;
  pyVal /= lengthP;
  pzVal /= lengthP;

  // Compute second perpendicular Axis Q via cross product of Segment D and axis P
  const segmentLen = Math.sqrt(lengthSq);
  const ndx = dx / segmentLen;
  const ndy = dy / segmentLen;
  const ndz = dz / segmentLen;

  let qxVal = ndy * pzVal - ndz * pyVal;
  let qyVal = ndz * pxVal - ndx * pzVal;
  let qzVal = ndx * pyVal - ndy * pxVal;

  const lengthQ = Math.sqrt(qxVal * qxVal + qyVal * qyVal + qzVal * qzVal);
  qxVal /= lengthQ;
  qyVal /= lengthQ;
  qzVal /= lengthQ;

  // Generate random radial angle and radial radius
  const angle = Math.random() * Math.PI * 2.0;
  // Dynamic thickness - slightly thinner in limbs, volumetric
  // Radial scaling: (0.7 + 0.3 * rand) gives a nice solid shell and glowing inner vapor
  const rScale = radius * (0.65 + 0.35 * Math.sqrt(Math.random()));

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  out.x = px + (pxVal * cosAngle + qxVal * sinAngle) * rScale;
  out.y = py + (pyVal * cosAngle + qyVal * sinAngle) * rScale;
  out.z = pz + (pzVal * cosAngle + qzVal * sinAngle) * rScale;
}

// Sets up layout and parameters of the 15 figures in our crowd simulation
interface FigureLayout {
  poseType: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  rotationY: number;
  scale: number;
  isStandout: boolean;
}

export const CROWD_LAYOUTS: FigureLayout[] = [
  // 0. The Standout Figure (Centered, larger, facing camera!)
  { poseType: 0, offsetX: 0, offsetY: -1.0, offsetZ: 0.0, rotationY: 0.0, scale: 1.18, isStandout: true },
  
  // 1. Inner Circle Background Left
  { poseType: 1, offsetX: -1.8, offsetY: -1.0, offsetZ: -1.5, rotationY: 0.35, scale: 1.1, isStandout: false },
  // 2. Inner Circle Background Right
  { poseType: 2, offsetX: 1.8, offsetY: -1.0, offsetZ: -1.5, rotationY: -0.35, scale: 1.1, isStandout: false },
  
  // 3. Middle Left Ground
  { poseType: 3, offsetX: -3.5, offsetY: -1.0, offsetZ: -2.0, rotationY: 0.55, scale: 1.08, isStandout: false },
  // 4. Middle Right Ground
  { poseType: 4, offsetX: 3.5, offsetY: -1.0, offsetZ: -2.0, rotationY: -0.55, scale: 1.08, isStandout: false },
  
  // 5. Deep Center Left
  { poseType: 5, offsetX: -1.0, offsetY: -1.0, offsetZ: -3.4, rotationY: 0.15, scale: 1.05, isStandout: false },
  // 6. Deep Center Right
  { poseType: 6, offsetX: 1.0, offsetY: -1.0, offsetZ: -3.4, rotationY: -0.15, scale: 1.05, isStandout: false },

  // 7. Middle Far Left
  { poseType: 7, offsetX: -5.0, offsetY: -1.0, offsetZ: -3.0, rotationY: 0.70, scale: 1.0, isStandout: false },
  // 8. Middle Far Right
  { poseType: 0, offsetX: 5.0, offsetY: -1.0, offsetZ: -3.0, rotationY: -0.70, scale: 1.0, isStandout: false },

  // 9. Deep Far Left
  { poseType: 1, offsetX: -2.8, offsetY: -1.0, offsetZ: -4.8, rotationY: 0.30, scale: 0.98, isStandout: false },
  // 10. Deep Far Right
  { poseType: 2, offsetX: 2.8, offsetY: -1.0, offsetZ: -4.8, rotationY: -0.30, scale: 0.98, isStandout: false },

  // 11. Core Back Projection
  { poseType: 3, offsetX: 0.0, offsetY: -1.0, offsetZ: -5.5, rotationY: 0.0, scale: 0.95, isStandout: false },
  
  // 12. Distant Deep Left
  { poseType: 4, offsetX: -4.5, offsetY: -1.0, offsetZ: -5.2, rotationY: 0.50, scale: 0.95, isStandout: false },
  // 13. Distant Deep Right
  { poseType: 5, offsetX: 4.5, offsetY: -1.0, offsetZ: -5.2, rotationY: -0.50, scale: 0.95, isStandout: false },

  // 14. Outer Wing Background Left
  { poseType: 6, offsetX: -6.4, offsetY: -1.0, offsetZ: -4.5, rotationY: 0.85, scale: 0.9, isStandout: false },
];

/**
 * Generates initial and target coordinate datasets for the massive 524,288 GPGPU particle grid.
 * We pack positions into the 512 x 1024 Float32Array texture structure.
 * Target contains the beautiful Amber human crowds.
 * Initial contains a dispersed dark-gold starry vacuum so particles visually fly matching the "breath of life" to form the bodies.
 */
export function generateCrowdTextures(width: number, height: number): {
  targetPositions: Float32Array;
  initialPositions: Float32Array;
} {
  const size = width * height; // 512 * 1024 = 524,288 particles
  const targetPositions = new Float32Array(size * 4);
  const initialPositions = new Float32Array(size * 4);

  // We have 15 figures mapped in groups of rows
  // Figure 0: 128 rows (65,536 particles) - The Standout Figure
  // Figure 1 to 14: 64 rows each (32,768 particles each)
  // TotalRows = 128 + 14 * 64 = 1024 rows.
  // ColWidth = 512.

  const tempPt = { x: 0, y: 0, z: 0 };

  for (let figIdx = 0; figIdx < CROWD_LAYOUTS.length; figIdx++) {
    const layout = CROWD_LAYOUTS[figIdx];
    const bonesList = getPoseBones(layout.poseType);

    // Compute cumulative sum of weights for choosing bone
    const cumulativeWeights: number[] = [];
    let currentSum = 0;
    for (const bone of bonesList) {
      currentSum += bone.weight;
      cumulativeWeights.push(currentSum);
    }

    // Determine particle count and start index in pixel array
    const startRow = figIdx === 0 ? 0 : 128 + (figIdx - 1) * 64;
    const numRows = figIdx === 0 ? 128 : 64;
    const particleStart = startRow * width;
    const count = numRows * width;

    // Generate coordinates
    for (let i = 0; i < count; i++) {
      const idx = particleStart + i;

      // Select segment based on bone weight
      const randValue = Math.random();
      let chosenBone = bonesList[bonesList.length - 1];
      for (let b = 0; b < bonesList.length; b++) {
        if (randValue <= cumulativeWeights[b]) {
          chosenBone = bonesList[b];
          break;
        }
      }

      // Sample raw point inside body structure
      sampleBonePoint(chosenBone, tempPt);

      // Apply scale, rotation around Y (yaw angles), and spatial position offset
      const angle = layout.rotationY;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Local Rotations
      const rx = tempPt.x * cosA - tempPt.z * sinA;
      const rz = tempPt.x * sinA + tempPt.z * cosA;

      // Apply height & placement shifts
      const worldX = rx * layout.scale + layout.offsetX;
      const worldY = tempPt.y * layout.scale + layout.offsetY;
      const worldZ = rz * layout.scale + layout.offsetZ;

      // Pack into target Float32Array (RGBA texture channel configuration)
      // We pass the layout rotation or speed seed in Alpha
      targetPositions[idx * 4 + 0] = worldX;
      targetPositions[idx * 4 + 1] = worldY;
      targetPositions[idx * 4 + 2] = worldZ;
      // Store standout flag in Alpha
      targetPositions[idx * 4 + 3] = layout.isStandout ? 1.0 : 0.0;

      // Initial coordinates: We pack the initial positions scattered around in a wide sphere
      // with a soft vortex shape to allow beautiful initial explosion-to-silhouette morph
      const initRadius = 4.0 + Math.random() * 8.0;
      const initAngle = Math.random() * Math.PI * 2.0;
      const initHeight = (Math.random() - 0.5) * 6.0;

      initialPositions[idx * 4 + 0] = Math.cos(initAngle) * initRadius;
      initialPositions[idx * 4 + 1] = initHeight;
      initialPositions[idx * 4 + 2] = Math.sin(initAngle) * initRadius;
      // Also tag standout
      initialPositions[idx * 4 + 3] = layout.isStandout ? 1.0 : 0.0;
    }
  }

  return { targetPositions, initialPositions };
}
