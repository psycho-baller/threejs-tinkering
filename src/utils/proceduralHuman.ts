import { Joint, Bone } from "../types";

export interface FigureLayout {
  poseType: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  rotationY: number;
  scale: number;
  isStandout: boolean;
  bodyType: "average" | "volumetric" | "athletic" | "skinny";
  gender: "male" | "female";
  hairStyle: "short" | "long" | "bald";
  expression: "happy" | "sad" | "content" | "excited";
}

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

  // Extend forearm to find hand end point
  const lForearmDx = lWrist.x - lElbow.x;
  const lForearmDy = lWrist.y - lElbow.y;
  const lForearmDz = lWrist.z - lElbow.z;
  const lForearmLen = Math.sqrt(lForearmDx * lForearmDx + lForearmDy * lForearmDy + lForearmDz * lForearmDz) || 1.0;
  const lHandEnd = createJoint(
    lWrist.x + (lForearmDx / lForearmLen) * 0.24,
    lWrist.y + (lForearmDy / lForearmLen) * 0.24,
    lWrist.z + (lForearmDz / lForearmLen) * 0.24
  );

  const rForearmDx = rWrist.x - rElbow.x;
  const rForearmDy = rWrist.y - rElbow.y;
  const rForearmDz = rWrist.z - rElbow.z;
  const rForearmLen = Math.sqrt(rForearmDx * rForearmDx + rForearmDy * rForearmDy + rForearmDz * rForearmDz) || 1.0;
  const rHandEnd = createJoint(
    rWrist.x + (rForearmDx / rForearmLen) * 0.24,
    rWrist.y + (rForearmDy / rForearmLen) * 0.24,
    rWrist.z + (rForearmDz / rForearmLen) * 0.24
  );

  // Extend ankle (shin end) to find foot end point (toes)
  // Left foot points slightly outward (negative X) and right foot points slightly outward (positive X)
  // Both point forward (+Z) and slightly down (-Y) to form a natural foot posture
  const lFootEnd = createJoint(lShinE.x - 0.02, lShinE.y - 0.05, lShinE.z + 0.16);
  const rFootEnd = createJoint(rShinE.x + 0.02, rShinE.y - 0.05, rShinE.z + 0.16);

  // Push all bones of the skeleton
  bones.push({ id: "torso", start: torsoStart, end: torsoEnd, radius: 0.15, weight: 0.24 });
  bones.push({ id: "head", start: headStart, end: headEnd, radius: 0.13, weight: 0.22 });
  bones.push({ id: "neck", start: neckStart, end: neckEnd, radius: 0.05, weight: 0.02 });

  // Structural bridges to prevent skeletal gaps
  bones.push({ id: "shoulders", start: lShoulder, end: rShoulder, radius: 0.08, weight: 0.04 });
  bones.push({ id: "pelvis", start: lThighS, end: rThighS, radius: 0.10, weight: 0.04 });

  bones.push({ id: "l_upperarm", start: lShoulder, end: lElbow, radius: 0.05, weight: 0.06 });
  bones.push({ id: "l_lowerarm", start: lElbow, end: lWrist, radius: 0.04, weight: 0.06 });
  bones.push({ id: "r_upperarm", start: rShoulder, end: rElbow, radius: 0.05, weight: 0.06 });
  bones.push({ id: "r_lowerarm", start: rElbow, end: rWrist, radius: 0.04, weight: 0.06 });

  bones.push({ id: "l_hand", start: lWrist, end: lHandEnd, radius: 0.035, weight: 0.05 });
  bones.push({ id: "r_hand", start: rWrist, end: rHandEnd, radius: 0.035, weight: 0.05 });

  bones.push({ id: "l_thigh", start: lThighS, end: lThighE, radius: 0.075, weight: 0.06 });
  bones.push({ id: "l_shin", start: lShinS, end: lShinE, radius: 0.055, weight: 0.06 });
  bones.push({ id: "r_thigh", start: rThighS, end: rThighE, radius: 0.075, weight: 0.06 });
  bones.push({ id: "r_shin", start: rShinS, end: rShinE, radius: 0.055, weight: 0.06 });

  bones.push({ id: "l_foot", start: lShinE, end: lFootEnd, radius: 0.038, weight: 0.04 });
  bones.push({ id: "r_foot", start: rShinE, end: rFootEnd, radius: 0.038, weight: 0.04 });

  return bones;
}

// Samples a single 3D point on or inside a capsule segment, incorporating body types and side depth fixes
function sampleBonePoint(bone: Bone, layout: FigureLayout, out: { x: number; y: number; z: number }) {
  const { start, end, radius } = bone;
  const bodyType = layout.bodyType;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const lengthSq = dx * dx + dy * dy + dz * dz;

  if (bone.id === "head") {
    // Generate head and facial features!
    const rPart = Math.random();
    
    // We shape the head dimensions based on body type
    let hx = 0.95;
    let hy = 1.25;
    let hz = 1.28; // Increased for more depth from the side!

    if (bodyType === "volumetric") {
      hx = 1.05;
      hy = 1.20;
      hz = 1.32;
    } else if (bodyType === "athletic") {
      hx = 0.98;
      hy = 1.22;
      hz = 1.30;
    } else if (bodyType === "skinny") {
      hx = 0.92;
      hy = 1.28;
      hz = 1.22;
    }

    if (rPart < 0.05) {
      // 1. EYES & EYEBROWS (5% of head particles)
      const isLeft = rPart < 0.025;
      const eyeSide = isLeft ? -1.0 : 1.0;
      
      const isEyebrow = Math.random() < 0.35; // 35% of this budget is for eyebrows
      
      if (isEyebrow) {
        // EYEBROWS
        const tBrow = (Math.random() - 0.5) * 2.0; // -1 (inner/nose) to +1 (outer/temple)
        
        // Splay the eyebrow laterally
        const browAngleX = eyeSide * (0.32 + tBrow * 0.12);
        
        // Base eyebrow height angle
        let browAngleY = 0.21;
        
        if (layout.expression === "excited") {
          // Arched and raised
          browAngleY = 0.24 + (1.0 - tBrow * tBrow) * 0.03;
        } else if (layout.expression === "happy") {
          // Normal raised curve
          browAngleY = 0.22 + (1.0 - tBrow * tBrow) * 0.015;
        } else if (layout.expression === "sad") {
          // Slanted: inner corner (tBrow = -1) is raised, outer corner (tBrow = 1) is lowered
          browAngleY = 0.22 - tBrow * 0.035;
        } else { // content
          // Relaxed
          browAngleY = 0.20 + (1.0 - tBrow * tBrow) * 0.01;
        }
        
        const bx = radius * Math.sin(browAngleX) * Math.cos(browAngleY) * hx;
        const by = radius * Math.sin(browAngleY) * hy;
        const bz = radius * Math.cos(browAngleX) * Math.cos(browAngleY) * hz;
        
        out.x = start.x + bx;
        out.y = start.y + by + (Math.random() - 0.5) * 0.002;
        out.z = start.z + bz * 1.02 + (Math.random() - 0.5) * 0.002;
        return;
      } else {
        // EYES
        const eyeAngleX = eyeSide * 0.32; // lateral offset angle
        const eyeAngleY = 0.15;           // height angle (above center)
        
        const ex = radius * Math.sin(eyeAngleX) * Math.cos(eyeAngleY) * hx;
        const ey = radius * Math.sin(eyeAngleY) * hy;
        const ez = radius * Math.cos(eyeAngleX) * Math.cos(eyeAngleY) * hz;
        
        const u = Math.random() * Math.PI * 2;
        
        // Expression modifiers for eyes
        let rEye = 0.012 * Math.sqrt(Math.random());
        let yScale = 0.6; // flat ellipse shape
        let tilt = 0.0;
        
        if (layout.expression === "excited") {
          rEye = 0.015 * Math.sqrt(Math.random());
          yScale = 0.95; // wide open eyes
        } else if (layout.expression === "happy") {
          yScale = 0.35; // squinting happy eyes
        } else if (layout.expression === "sad") {
          yScale = 0.55;
          // Tilt outer edges down
          const localX = Math.cos(u) * rEye;
          tilt = -0.2 * localX * eyeSide;
        }
        
        out.x = start.x + ex + Math.cos(u) * rEye;
        out.y = start.y + ey + Math.sin(u) * rEye * yScale + tilt + (Math.random() - 0.5) * 0.002;
        out.z = start.z + ez + (Math.random() - 0.5) * 0.003;
        return;
      }
      
    } else if (rPart < 0.09) {
      // 2. NOSE (4% of head particles)
      const tNose = Math.random(); // 0 (bridge) to 1 (tip)
      const noseY = 0.05 - tNose * 0.08; // starts at bridge height, down to tip height
      
      // Depth of surface at this height
      const zSurface = radius * Math.sqrt(1.0 - Math.pow(noseY / (radius * hy), 2)) * hz;
      const protrusion = tNose * 0.032; // nose sticks out forward
      
      out.x = start.x + (Math.random() - 0.5) * 0.012 * (tNose * 0.8 + 0.2); // nose width, tapers at top
      out.y = start.y + noseY * hy;
      out.z = start.z + zSurface + protrusion;
      return;
      
    } else if (rPart < 0.13) {
      // 3. MOUTH (4% of head particles)
      const isExcited = layout.expression === "excited";
      const mouthWidth = isExcited ? 0.042 : 0.035;
      const mouthY = -0.06;
      
      const zSurface = radius * Math.sqrt(1.0 - Math.pow(mouthY / (radius * hy), 2)) * hz;
      
      const tMouth = (Math.random() - 0.5) * 2.0; // -1 to +1
      const mx = tMouth * mouthWidth;
      
      let my = mouthY;
      let verticalSpread = 0.0;
      let zOffset = 0.0;
      
      if (layout.expression === "happy") {
        // Pronounced smile curve (corners at mouthY + 0.008, center at mouthY - 0.005)
        my = mouthY - 0.005 + tMouth * tMouth * 0.013;
        verticalSpread = (Math.random() - 0.5) * 0.003;
      } else if (layout.expression === "sad") {
        // Pronounced frown curve (corners at mouthY - 0.007, center at mouthY + 0.005)
        my = mouthY + 0.005 - tMouth * tMouth * 0.012;
        verticalSpread = (Math.random() - 0.5) * 0.003;
      } else if (layout.expression === "excited") {
        // Wide open mouth! Sample a 2D region bounded by upper and lower lips
        const yUpper = mouthY + 0.004 - 0.004 * tMouth * tMouth;
        const yLower = mouthY - 0.018 + 0.006 * tMouth * tMouth;
        const v = Math.random();
        my = yLower + v * (yUpper - yLower);
        
        // Push interior particles slightly back to create a 3D oral cavity depth!
        const centerFactor = 1.0 - Math.abs(tMouth); // 1.0 at center, 0.0 at corners
        zOffset = -centerFactor * Math.random() * 0.008;
        verticalSpread = (Math.random() - 0.5) * 0.001;
      } else { // content
        // Gentle smile curve
        my = mouthY - 0.001 + tMouth * tMouth * 0.004;
        verticalSpread = (Math.random() - 0.5) * 0.002;
      }
      
      out.x = start.x + mx;
      out.y = start.y + my * hy + verticalSpread;
      out.z = start.z + zSurface * 1.01 + zOffset + (Math.random() - 0.5) * 0.002;
      return;
      
    } else if (rPart < 0.19) {
      // 4. EARS (6% of head particles)
      const isLeft = rPart < 0.16;
      const earSide = isLeft ? -1.0 : 1.0;
      
      const tEar = Math.random() * Math.PI; // ear curve
      const earY = -0.05 + Math.random() * 0.09;
      
      out.x = start.x + earSide * (radius * hx * 0.98 + Math.sin(tEar) * 0.018);
      out.y = start.y + earY * hy + Math.cos(tEar) * 0.012;
      out.z = start.z - 0.01 - Math.cos(tEar) * 0.008 + (Math.random() - 0.5) * 0.004;
      return;
      
    } else if (rPart < 0.55 && layout.hairStyle !== "bald") {
      // 5. HAIR (36% of head particles, skip if bald)
      const isFemale = layout.gender === "female";
      const style = layout.hairStyle;
      
      if (style === "long") {
        if (isFemale) {
          // Female Long Hair: flowing long waves down to chest/shoulders
          if (Math.random() < 0.70) {
            const tHair = Math.random(); // 0 is shoulder-level, 1 is top of head
            const strandY = start.y + 0.08 - tHair * 0.42; // flows lower
            
            // Hair wraps around back/sides but also flows slightly forward on shoulders
            const angle = Math.PI * (0.55 + Math.random() * 0.9); // wrap around sides
            const side = Math.random() < 0.5 ? -1.0 : 1.0;
            const hairR = radius * (1.12 + (1.0 - tHair) * 0.06); 
            
            out.x = start.x + Math.sin(angle * side) * hairR * hx;
            out.y = strandY;
            // Let it flow slightly forward at the bottom
            const forwardFlow = (1.0 - tHair) * 0.03;
            out.z = start.z + Math.cos(angle * side) * hairR * hz + forwardFlow;
            
            // Add waves
            out.x += Math.sin(strandY * 25.0) * 0.008;
            out.z += Math.cos(strandY * 25.0) * 0.008;
            return;
          }
        } else {
          // Male Long Hair: rocker hair or man bun!
          if (Math.random() < 0.50) {
            // Rocker hair: shoulder length, less volume, straighter
            const tHair = Math.random();
            const strandY = start.y + 0.05 - tHair * 0.35;
            const angle = Math.PI * (0.6 + Math.random() * 0.8);
            const side = Math.random() < 0.5 ? -1.0 : 1.0;
            const hairR = radius * 1.10;
            out.x = start.x + Math.sin(angle * side) * hairR * hx;
            out.y = strandY;
            out.z = start.z + Math.cos(angle * side) * hairR * hz;
            return;
          } else {
            // Man Bun! A tight bun at the upper back of the head
            const bunRadius = 0.04 * radius;
            const uBun = Math.random() * Math.PI * 2;
            const vBun = Math.acos(2.0 * Math.random() - 1.0);
            const rBun = bunRadius * (0.8 + 0.25 * Math.random());
            
            out.x = start.x + Math.sin(vBun) * Math.cos(uBun) * rBun;
            out.y = start.y + 0.06 * hy + Math.sin(vBun) * Math.sin(uBun) * rBun;
            out.z = start.z - radius * hz * 1.08 - Math.abs(Math.cos(vBun)) * rBun;
            return;
          }
        }
      } else if (style === "short") {
        if (!isFemale) {
          // Male Short Hair: Spiky / textured crop!
          const theta = Math.random() * Math.PI * 2.0;
          const ySphere = -0.3 + 1.3 * Math.random(); // crop is higher than bob
          const rSphere = Math.sqrt(Math.max(0.0, 1.0 - ySphere * ySphere));
          
          let hairR = radius * 1.05;
          if (Math.random() < 0.35 && ySphere > 0.2) {
            // Add spikes on top
            hairR += radius * 0.07 * Math.pow(Math.random(), 1.5);
          }
          
          const hxVal = hairR * rSphere * Math.cos(theta) * hx;
          const hyVal = hairR * ySphere * hy;
          const hzVal = hairR * rSphere * Math.sin(theta) * hz;
          
          if (hzVal > 0.02 * hz && hyVal < 0.10 * hy) {
            out.x = start.x + hxVal;
            out.y = start.y + hyVal;
            out.z = start.z - Math.abs(hzVal);
          } else {
            out.x = start.x + hxVal;
            out.y = start.y + hyVal;
            out.z = start.z + hzVal;
          }
          return;
        } else {
          // Female Short Hair: Stylish Bob Cut
          const theta = Math.random() * Math.PI * 2.0;
          const ySphere = -0.22 + 1.22 * Math.random();
          const rSphere = Math.sqrt(Math.max(0.0, 1.0 - ySphere * ySphere));
          
          let hairR = radius * (1.08 + 0.03 * Math.random());
          // Flare the sides out slightly near the bottom (bob style)
          if (ySphere < 0.0) {
            hairR *= (1.0 - ySphere * 0.10);
          }
          
          const hxVal = hairR * rSphere * Math.cos(theta) * hx;
          const hyVal = hairR * ySphere * hy;
          const hzVal = hairR * rSphere * Math.sin(theta) * hz;
          
          // Face clearance: bob frames the face
          if (hzVal > 0.01 * hz && hyVal < 0.08 * hy && Math.abs(hxVal) < 0.7 * radius * hx) {
            out.x = start.x + hxVal;
            out.y = start.y + hyVal;
            out.z = start.z - Math.abs(hzVal);
          } else {
            out.x = start.x + hxVal;
            out.y = start.y + hyVal;
            out.z = start.z + hzVal;
          }
          return;
        }
      }
      
      // Fallback/Skull cap top section for long hair styles
      const theta = Math.random() * Math.PI * 2.0;
      const ySphere = -0.35 + 1.35 * Math.random();
      const rSphere = Math.sqrt(Math.max(0.0, 1.0 - ySphere * ySphere));
      const hairR = radius * (1.05 + 0.08 * Math.pow(Math.random(), 0.5));
      
      const hxVal = hairR * rSphere * Math.cos(theta) * hx;
      const hyVal = hairR * ySphere * hy;
      const hzVal = hairR * rSphere * Math.sin(theta) * hz;
      
      if (hzVal > 0.02 * hz && hyVal < 0.06 * hy) {
        out.x = start.x + hxVal;
        out.y = start.y + hyVal;
        out.z = start.z - Math.abs(hzVal);
      } else {
        out.x = start.x + hxVal;
        out.y = start.y + hyVal;
        out.z = start.z + hzVal;
      }
      return;
    }
    
    // 6. SKULL BASE (Fallback and remaining particles)
    const u1 = Math.random();
    const u2 = Math.random();
    const theta = u1 * Math.PI * 2.0;
    const phi = Math.acos(2.0 * u2 - 1.0);
    const r = radius * (0.85 + 0.15 * Math.pow(Math.random(), 0.3));

    let sx = r * Math.sin(phi) * Math.cos(theta) * hx;
    let sy = r * Math.sin(phi) * Math.sin(theta) * hy;
    let sz = r * Math.cos(phi) * hz;

    // Jaw/chin contouring: taper lower half of face
    if (sy < 0.0) {
      const taper = 1.0 + (sy / (radius * hy)) * 0.35;
      sx *= taper;
      sz *= taper;
    }

    // Facial plane flattening: slightly flatten front surface (subtle to preserve 3D depth from sides)
    if (sz > 0.04 * hz) {
      sz = 0.04 * hz + (sz - 0.04 * hz) * 0.88;
    }

    out.x = start.x + sx;
    out.y = start.y + sy;
    out.z = start.z + sz;
    return;
  }

  // Handle hand and fingers rendering
  if (bone.id === "l_hand" || bone.id === "r_hand") {
    const segmentLen = Math.sqrt(lengthSq);
    const ndx = dx / segmentLen;
    const ndy = dy / segmentLen;
    const ndz = dz / segmentLen;

    let refX = 1.0, refY = 0.0, refZ = 0.0;
    if (Math.abs(ndx) > 0.9) {
      refX = 0.0;
      refY = 1.0;
      refZ = 0.0;
    }
    
    // P = D x Ref
    let pxVal = ndy * refZ - ndz * refY;
    let pyVal = ndz * refX - ndx * refZ;
    let pzVal = ndx * refY - ndy * refX;
    let lenP = Math.sqrt(pxVal*pxVal + pyVal*pyVal + pzVal*pzVal);
    pxVal /= lenP;
    pyVal /= lenP;
    pzVal /= lenP;
    
    // Q = P x D
    let qxVal = pyVal * ndz - pzVal * ndy;
    let qyVal = pzVal * ndx - pxVal * ndz;
    let qzVal = pxVal * ndy - pyVal * ndx;
    
    // Adjust hand scale based on bodyType
    let handScale = 2.4;
    if (bodyType === "volumetric") handScale = 2.4 * 1.15;
    else if (bodyType === "skinny") handScale = 2.4 * 0.88;
    else if (bodyType === "athletic") handScale = 2.4 * 1.05;

    const t = Math.random();
    if (t < 0.35) {
      // Palm region
      const tNorm = t / 0.35;
      
      // Smooth wedge transition from circular wrist to flat palm
      let baseWristRadius = 0.026;
      if (bodyType === "volumetric") baseWristRadius *= 1.22;
      else if (bodyType === "skinny") baseWristRadius *= 0.85;
      
      const wristWidth = baseWristRadius;
      const targetPalmWidth = 0.046 * handScale;
      const palmWidth = wristWidth + (targetPalmWidth - wristWidth) * tNorm;
      
      const wristThickness = baseWristRadius;
      const targetPalmThickness = 0.012 * handScale;
      const palmThickness = wristThickness + (targetPalmThickness - wristThickness) * tNorm;
      
      const offsetP = (Math.random() - 0.5) * 2.0 * palmWidth;
      const offsetQ = (Math.random() - 0.5) * 2.0 * palmThickness;
      
      out.x = start.x + t * dx + pxVal * offsetP + qxVal * offsetQ;
      out.y = start.y + t * dy + pyVal * offsetP + qyVal * offsetQ;
      out.z = start.z + t * dz + pzVal * offsetP + qzVal * offsetQ;
    } else {
      // Fingers region
      const f = Math.floor(Math.random() * 5);
      
      // Define finger length limits
      const tEnd = [0.65, 0.92, 1.0, 0.94, 0.82];
      
      const fLimit = tEnd[f];
      let tNorm = 0.0;
      if (t < fLimit) {
        tNorm = (t - 0.35) / (fLimit - 0.35);
      } else {
        tNorm = Math.random();
      }
      
      const startP = [0.018, 0.010, 0.0, -0.010, -0.015];
      const endP =   [0.035, 0.016, 0.0, -0.014, -0.022];
      const startQ = [0.006, 0.0, 0.0, 0.0, 0.0];
      const endQ =   [0.014, 0.0, 0.0, 0.0, 0.0];
      
      const fingerP = (startP[f] * (1.0 - tNorm) + endP[f] * tNorm) * handScale;
      const fingerQ = (startQ[f] * (1.0 - tNorm) + endQ[f] * tNorm) * handScale;
      const fingerLengthProgress = 0.35 + tNorm * (fLimit - 0.35);
      
      const fingerRadius = 0.0065 * handScale * (1.0 - 0.3 * tNorm);
      const fAngle = Math.random() * Math.PI * 2.0;
      const rScale = fingerRadius * Math.sqrt(Math.random());
      
      const cosA = Math.cos(fAngle);
      const sinA = Math.sin(fAngle);
      
      const P_coord = fingerP + cosA * rScale;
      const Q_coord = fingerQ + sinA * rScale;
      
      out.x = start.x + fingerLengthProgress * dx + pxVal * P_coord + qxVal * Q_coord;
      out.y = start.y + fingerLengthProgress * dy + pyVal * P_coord + qyVal * Q_coord;
      out.z = start.z + fingerLengthProgress * dz + pzVal * P_coord + qzVal * Q_coord;
    }
    return;
  }

  // Parametric point along segment length
  const t = Math.random();
  const px = start.x + t * dx;
  const py = start.y + t * dy;
  const pz = start.z + t * dz;

  // Custom anatomical shape factor and directional scales based on bone type
  let shapeFactor = 1.0;
  let scaleX = 1.0;
  let scaleY = 1.0;
  let scaleZ = 1.0;

  if (bone.id === "torso") {
    if (t < 0.2) {
      const localT = t / 0.2;
      shapeFactor = 1.15 * (1 - localT) + 0.95 * localT;
    } else if (t < 0.45) {
      const localT = (t - 0.2) / 0.25;
      shapeFactor = 0.95 * (1 - localT) + 0.85 * localT;
    } else if (t < 0.8) {
      const localT = (t - 0.45) / 0.35;
      shapeFactor = 0.85 * (1 - localT) + 1.28 * localT;
    } else {
      const localT = (t - 0.8) / 0.2;
      shapeFactor = 1.28 * (1 - localT) + 0.8 * localT;
    }
    scaleX = 1.28;
    scaleZ = 1.12;
  } else if (bone.id === "shoulders") {
    scaleX = 1.0;
    scaleZ = 1.12;
  } else if (bone.id === "pelvis") {
    scaleX = 1.0;
    scaleZ = 1.12;
  } else if (bone.id === "l_thigh" || bone.id === "r_thigh") {
    shapeFactor = 1.2 - 0.4 * t;
    scaleZ = 1.05;
  } else if (bone.id === "l_shin" || bone.id === "r_shin") {
    if (t < 0.3) {
      const localT = t / 0.3;
      shapeFactor = 0.9 * (1 - localT) + 1.25 * localT;
    } else if (t < 0.7) {
      const localT = (t - 0.3) / 0.4;
      shapeFactor = 1.25 * (1 - localT) + 0.8 * localT;
    } else {
      const localT = (t - 0.7) / 0.3;
      shapeFactor = 0.8 * (1 - localT) + 0.58 * localT;
    }
    scaleZ = 1.05;
  } else if (bone.id === "l_foot" || bone.id === "r_foot") {
    // Foot shape: tapers slightly from ankle/heel (t=0) to toes (t=1)
    shapeFactor = 1.0 - 0.25 * t;
    scaleX = 1.35; // make it wider laterally
    scaleY = 0.65; // flatten it vertically
    scaleZ = 1.0;
  } else if (bone.id === "l_upperarm" || bone.id === "r_upperarm") {
    shapeFactor = 1.1 * (1 - t) + 0.85 * t + 0.15 * Math.sin(t * Math.PI);
  } else if (bone.id === "l_lowerarm" || bone.id === "r_lowerarm") {
    shapeFactor = 1.05 * (1 - t) + 0.65 * t;
  } else if (bone.id === "neck") {
    shapeFactor = 1.0 - 0.15 * t;
  }

  // Apply body type modifiers
  if (bodyType === "volumetric") {
    if (bone.id === "torso") {
      if (t < 0.2) {
        shapeFactor += 0.18;
      } else if (t < 0.45) {
        shapeFactor += 0.30;
      } else if (t < 0.8) {
        shapeFactor += 0.22;
      } else {
        shapeFactor += 0.12;
      }
      scaleX *= 1.35;
      scaleZ *= 1.10;
    } else if (bone.id === "shoulders" || bone.id === "pelvis") {
      shapeFactor *= 1.22;
      scaleZ *= 1.12;
    } else if (bone.id === "neck") {
      shapeFactor *= 1.18;
    } else {
      shapeFactor *= 1.22;
    }
  } else if (bodyType === "athletic") {
    if (bone.id === "torso") {
      if (t >= 0.45 && t < 0.8) {
        shapeFactor *= 1.18;
      } else if (t < 0.45) {
        shapeFactor *= 0.95;
      }
      scaleX *= 1.25;
      scaleZ *= 1.05;
    } else if (bone.id === "shoulders") {
      shapeFactor *= 1.25;
      scaleZ *= 1.1;
    } else if (bone.id === "l_upperarm" || bone.id === "r_upperarm") {
      shapeFactor *= 1.25;
    } else if (bone.id === "l_shin" || bone.id === "r_shin") {
      if (t >= 0.2 && t < 0.6) {
        shapeFactor *= 1.25;
      }
    } else if (bone.id === "l_thigh" || bone.id === "r_thigh") {
      shapeFactor *= 1.15;
    }
  } else if (bodyType === "skinny") {
    if (bone.id === "torso") {
      shapeFactor *= 0.90;
      scaleX *= 0.95;
      scaleZ *= 0.95;
    } else if (bone.id === "shoulders" || bone.id === "pelvis") {
      shapeFactor *= 0.92;
      scaleZ *= 0.94;
    } else if (bone.id === "neck") {
      shapeFactor *= 0.90;
    } else {
      shapeFactor *= 0.85;
    }
  }

  // Make a unit vector perpendicular to the segment (dx, dy, dz)
  let rx = Math.random() - 0.5;
  let ry = Math.random() - 0.5;
  let rz = Math.random() - 0.5;

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

  pxVal /= lengthP;
  pyVal /= lengthP;
  pzVal /= lengthP;

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

  const angle = Math.random() * Math.PI * 2.0;
  const baseRadius = radius * shapeFactor;
  const rScale = baseRadius * (0.65 + 0.35 * Math.sqrt(Math.random()));

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  const ox = (pxVal * cosAngle + qxVal * sinAngle) * rScale;
  const oy = (pyVal * cosAngle + qyVal * sinAngle) * rScale;
  const oz = (pzVal * cosAngle + qzVal * sinAngle) * rScale;

  out.x = px + ox * scaleX;
  out.y = py + oy * scaleY;
  out.z = pz + oz * scaleZ;
}

export const CROWD_LAYOUTS: FigureLayout[] = [
  // 0. The Standout Figure (Centered, larger, facing camera!)
  { poseType: 0, offsetX: 0, offsetY: -1.0, offsetZ: 0.0, rotationY: 0.0, scale: 1.18, isStandout: true, bodyType: "athletic", gender: "male", hairStyle: "short", expression: "excited" },
  
  // 1. Inner Circle Background Left
  { poseType: 1, offsetX: -1.8, offsetY: -1.0, offsetZ: -1.5, rotationY: 0.35, scale: 1.1, isStandout: false, bodyType: "volumetric", gender: "female", hairStyle: "long", expression: "happy" },
  // 2. Inner Circle Background Right
  { poseType: 2, offsetX: 1.8, offsetY: -1.0, offsetZ: -1.5, rotationY: -0.35, scale: 1.1, isStandout: false, bodyType: "skinny", gender: "male", hairStyle: "short", expression: "content" },
  
  // 3. Middle Left Ground
  { poseType: 3, offsetX: -3.5, offsetY: -1.0, offsetZ: -2.0, rotationY: 0.55, scale: 1.08, isStandout: false, bodyType: "average", gender: "female", hairStyle: "long", expression: "happy" },
  // 4. Middle Right Ground
  { poseType: 4, offsetX: 3.5, offsetY: -1.0, offsetZ: -2.0, rotationY: -0.55, scale: 1.08, isStandout: false, bodyType: "athletic", gender: "male", hairStyle: "short", expression: "excited" },
  
  // 5. Deep Center Left
  { poseType: 5, offsetX: -1.0, offsetY: -1.0, offsetZ: -3.4, rotationY: 0.15, scale: 1.05, isStandout: false, bodyType: "volumetric", gender: "male", hairStyle: "short", expression: "sad" },
  // 6. Deep Center Right
  { poseType: 6, offsetX: 1.0, offsetY: -1.0, offsetZ: -3.4, rotationY: -0.15, scale: 1.05, isStandout: false, bodyType: "skinny", gender: "female", hairStyle: "long", expression: "content" },

  // 7. Middle Far Left
  { poseType: 7, offsetX: -5.0, offsetY: -1.0, offsetZ: -3.0, rotationY: 0.70, scale: 1.0, isStandout: false, bodyType: "average", gender: "male", hairStyle: "short", expression: "happy" },
  // 8. Middle Far Right
  { poseType: 0, offsetX: 5.0, offsetY: -1.0, offsetZ: -3.0, rotationY: -0.70, scale: 1.0, isStandout: false, bodyType: "athletic", gender: "female", hairStyle: "short", expression: "sad" },

  // 9. Deep Far Left
  { poseType: 1, offsetX: -2.8, offsetY: -1.0, offsetZ: -4.8, rotationY: 0.30, scale: 0.98, isStandout: false, bodyType: "volumetric", gender: "female", hairStyle: "long", expression: "excited" },
  // 10. Deep Far Right
  { poseType: 2, offsetX: 2.8, offsetY: -1.0, offsetZ: -4.8, rotationY: -0.30, scale: 0.98, isStandout: false, bodyType: "skinny", gender: "male", hairStyle: "bald", expression: "content" },

  // 11. Core Back Projection
  { poseType: 3, offsetX: 0.0, offsetY: -1.0, offsetZ: -5.5, rotationY: 0.0, scale: 0.95, isStandout: false, bodyType: "average", gender: "female", hairStyle: "long", expression: "happy" },
  
  // 12. Distant Deep Left
  { poseType: 4, offsetX: -4.5, offsetY: -1.0, offsetZ: -5.2, rotationY: 0.50, scale: 0.95, isStandout: false, bodyType: "athletic", gender: "male", hairStyle: "short", expression: "excited" },
  // 13. Distant Deep Right
  { poseType: 5, offsetX: 4.5, offsetY: -1.0, offsetZ: -5.2, rotationY: -0.50, scale: 0.95, isStandout: false, bodyType: "volumetric", gender: "female", hairStyle: "long", expression: "sad" },

  // 14. Outer Wing Background Left
  { poseType: 6, offsetX: -6.4, offsetY: -1.0, offsetZ: -4.5, rotationY: 0.85, scale: 0.9, isStandout: false, bodyType: "skinny", gender: "female", hairStyle: "long", expression: "content" },
];

/**
 * Generates initial and target coordinate datasets for the massive 524,288 GPGPU particle grid.
 * We pack positions into the 512 x 1024 Float32Array texture structure.
 * Target contains the beautiful Amber human crowds.
 * Initial contains a dispersed dark-gold starry vacuum so particles visually fly matching the "breath of life" to form the bodies.
 */
export function generateCrowdTextures(
  width: number,
  height: number,
  options: { standoutPositions?: Float32Array | null } = {}
): {
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
    const standoutPositions =
      figIdx === 0 && options.standoutPositions?.length === count * 3
        ? options.standoutPositions
        : null;

    // Generate coordinates
    for (let i = 0; i < count; i++) {
      const idx = particleStart + i;
      let worldX: number;
      let worldY: number;
      let worldZ: number;

      if (standoutPositions) {
        worldX = standoutPositions[i * 3 + 0];
        worldY = standoutPositions[i * 3 + 1];
        worldZ = standoutPositions[i * 3 + 2];
      } else {
        // Select segment based on bone weight, using currentSum to support arbitrary total weight
        const randValue = Math.random() * currentSum;
        let chosenBone = bonesList[bonesList.length - 1];
        for (let b = 0; b < bonesList.length; b++) {
          if (randValue <= cumulativeWeights[b]) {
            chosenBone = bonesList[b];
            break;
          }
        }

        // Sample raw point inside body structure, passing the specific figure's layout
        sampleBonePoint(chosenBone, layout, tempPt);

        // Apply scale, rotation around Y (yaw angles), and spatial position offset
        const angle = layout.rotationY;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Local Rotations
        const rx = tempPt.x * cosA - tempPt.z * sinA;
        const rz = tempPt.x * sinA + tempPt.z * cosA;

        // Apply height & placement shifts
        worldX = rx * layout.scale + layout.offsetX;
        worldY = tempPt.y * layout.scale + layout.offsetY;
        worldZ = rz * layout.scale + layout.offsetZ;
      }

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
