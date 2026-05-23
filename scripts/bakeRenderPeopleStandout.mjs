import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ASSET_ID = "rp_posedplus_00068_18";
const RENDERPEOPLE_ROOT = "/Users/rami/Downloads/rp_posedplus_00068_18/extracted";
const VARIANT = process.env.RENDERPEOPLE_VARIANT ?? "100k";
const TEXTURE_RESOLUTION = VARIANT === "300k" ? "8k" : "4k";
const DEFAULT_SOURCE =
  `${RENDERPEOPLE_ROOT}/${ASSET_ID}_${VARIANT}/${ASSET_ID}_${VARIANT}.glb`;
const DEFAULT_OUTPUT =
  `public/private-assets/renderpeople/${ASSET_ID}_${VARIANT}_standout.bin`;
const DEFAULT_BASECOLOR =
  `${RENDERPEOPLE_ROOT}/${ASSET_ID}_${VARIANT}/tex/${ASSET_ID}_${TEXTURE_RESOLUTION}_basecolor.jpg`;

const PARTICLE_COUNT = Number(process.env.RENDERPEOPLE_PARTICLE_COUNT ?? 65_536);
const TARGET_HEIGHT = Number(process.env.RENDERPEOPLE_TARGET_HEIGHT ?? 2.05);
const FOOT_Y = Number(process.env.RENDERPEOPLE_FOOT_Y ?? -1.12);
const CENTER_Z = Number(process.env.RENDERPEOPLE_CENTER_Z ?? 0.0);
const YAW_RADIANS = (Number(process.env.RENDERPEOPLE_YAW_DEGREES ?? 180) * Math.PI) / 180;
const SOURCE_PATH = process.env.RENDERPEOPLE_GLB ?? process.env.RENDERPEOPLE_SOURCE ?? DEFAULT_SOURCE;
const OUTPUT_PATH = process.env.RENDERPEOPLE_OUTPUT ?? DEFAULT_OUTPUT;
const BASECOLOR_PATH = process.env.RENDERPEOPLE_BASECOLOR ?? DEFAULT_BASECOLOR;
const COLOR_OUTPUT_PATH =
  process.env.RENDERPEOPLE_COLOR_OUTPUT ?? OUTPUT_PATH.replace(/\.bin$/, "_color.bin");
const FLIP_TEXTURE_V = process.env.RENDERPEOPLE_FLIP_V === "1";
const HEIGHT_BANDS = [
  { name: "feetAndLowerLegs", min: 0.0, max: 0.34, share: 0.30, importance: 1.25 },
  { name: "upperLegsAndHips", min: 0.34, max: 0.54, share: 0.28, importance: 1.05 },
  { name: "torsoAndArms", min: 0.54, max: 0.76, share: 0.30, importance: 0.85 },
  { name: "headAndShoulders", min: 0.76, max: 1.01, share: 0.12, importance: 0.55 },
];

const COMPONENT_BYTE_SIZE = new Map([
  [5120, 1],
  [5121, 1],
  [5122, 2],
  [5123, 2],
  [5125, 4],
  [5126, 4],
]);

const TYPE_COMPONENT_COUNT = new Map([
  ["SCALAR", 1],
  ["VEC2", 2],
  ["VEC3", 3],
  ["VEC4", 4],
  ["MAT2", 4],
  ["MAT3", 9],
  ["MAT4", 16],
]);

function parseGlb(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString("utf8", 0, 4) !== "glTF") {
    throw new Error(`Expected a binary glTF file: ${filePath}`);
  }

  let offset = 12;
  let json = null;
  let binaryStart = -1;

  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    offset += 4;
    const chunkType = buffer.toString("utf8", offset, offset + 4);
    offset += 4;

    if (chunkType === "JSON") {
      json = JSON.parse(buffer.toString("utf8", offset, offset + chunkLength));
    } else if (chunkType === "BIN\0") {
      binaryStart = offset;
    }

    offset += chunkLength;
  }

  if (!json || binaryStart < 0) {
    throw new Error("GLB is missing a JSON or binary chunk.");
  }

  return { buffer, json, binaryStart };
}

function getAccessorReader(glb, accessorIndex) {
  const accessor = glb.json.accessors[accessorIndex];
  const bufferView = glb.json.bufferViews[accessor.bufferView];
  const componentSize = COMPONENT_BYTE_SIZE.get(accessor.componentType);
  const componentCount = TYPE_COMPONENT_COUNT.get(accessor.type);

  if (!componentSize || !componentCount) {
    throw new Error(`Unsupported accessor format at index ${accessorIndex}.`);
  }

  const stride = bufferView.byteStride ?? componentSize * componentCount;
  const start =
    glb.binaryStart +
    (bufferView.byteOffset ?? 0) +
    (accessor.byteOffset ?? 0);

  const readComponent = (byteOffset) => {
    switch (accessor.componentType) {
      case 5120:
        return glb.buffer.readInt8(byteOffset);
      case 5121:
        return glb.buffer.readUInt8(byteOffset);
      case 5122:
        return glb.buffer.readInt16LE(byteOffset);
      case 5123:
        return glb.buffer.readUInt16LE(byteOffset);
      case 5125:
        return glb.buffer.readUInt32LE(byteOffset);
      case 5126:
        return glb.buffer.readFloatLE(byteOffset);
      default:
        throw new Error(`Unsupported component type ${accessor.componentType}.`);
    }
  };

  return {
    count: accessor.count,
    read(index, component = 0) {
      return readComponent(start + index * stride + component * componentSize);
    },
  };
}

function transformPoint(point, node) {
  const scale = node.scale ?? [1, 1, 1];
  const rotation = node.rotation ?? [0, 0, 0, 1];
  const translation = node.translation ?? [0, 0, 0];

  let x = point[0] * scale[0];
  let y = point[1] * scale[1];
  let z = point[2] * scale[2];

  const qx = rotation[0];
  const qy = rotation[1];
  const qz = rotation[2];
  const qw = rotation[3];
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;

  x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

  return [x + translation[0], y + translation[1], z + translation[2]];
}

function normalizeToScene(point, sourceBounds) {
  const sourceHeight = sourceBounds.max[1] - sourceBounds.min[1];
  const sourceCenterX = (sourceBounds.min[0] + sourceBounds.max[0]) * 0.5;
  const sourceCenterZ = (sourceBounds.min[2] + sourceBounds.max[2]) * 0.5;
  const scale = TARGET_HEIGHT / sourceHeight;

  const x = (point[0] - sourceCenterX) * scale;
  const y = (point[1] - sourceBounds.min[1]) * scale + FOOT_Y;
  const z = (point[2] - sourceCenterZ) * scale;

  const cosYaw = Math.cos(YAW_RADIANS);
  const sinYaw = Math.sin(YAW_RADIANS);

  return [
    x * cosYaw - z * sinYaw,
    y,
    x * sinYaw + z * cosYaw + CENTER_Z,
  ];
}

function vectorSub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function length(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

function mulberry32(seed) {
  return function next() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function getImageInfo(filePath) {
  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "json",
      filePath,
    ],
    { encoding: "utf8" }
  );

  if (probe.status !== 0) {
    throw new Error(`Unable to inspect texture with ffprobe: ${probe.stderr}`);
  }

  const parsed = JSON.parse(probe.stdout);
  const stream = parsed.streams?.[0];
  if (!stream?.width || !stream?.height) {
    throw new Error(`Unable to read texture dimensions: ${filePath}`);
  }

  return { width: stream.width, height: stream.height };
}

function decodeRgbImage(filePath) {
  const info = getImageInfo(filePath);
  const expectedBytes = info.width * info.height * 3;
  const decode = spawnSync(
    "ffmpeg",
    ["-v", "error", "-i", filePath, "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"],
    { encoding: "buffer", maxBuffer: expectedBytes + 1024 * 1024 }
  );

  if (decode.status !== 0) {
    throw new Error(`Unable to decode texture with ffmpeg: ${decode.stderr.toString("utf8")}`);
  }

  if (decode.stdout.length !== expectedBytes) {
    throw new Error(
      `Decoded texture byte count mismatch. Expected ${expectedBytes}, got ${decode.stdout.length}.`
    );
  }

  return { ...info, pixels: decode.stdout };
}

function sampleRgb(texture, uv) {
  let u = uv[0] % 1;
  let v = uv[1] % 1;
  if (u < 0) u += 1;
  if (v < 0) v += 1;
  if (FLIP_TEXTURE_V) v = 1 - v;

  const x = Math.max(0, Math.min(texture.width - 1, Math.floor(u * (texture.width - 1))));
  const y = Math.max(0, Math.min(texture.height - 1, Math.floor(v * (texture.height - 1))));
  const offset = (y * texture.width + x) * 3;

  return [
    texture.pixels[offset] / 255,
    texture.pixels[offset + 1] / 255,
    texture.pixels[offset + 2] / 255,
  ];
}

function findHeightBand(height01) {
  return HEIGHT_BANDS.findIndex((band) => height01 >= band.min && height01 < band.max);
}

function bandImportance(bandIndex, normal) {
  const band = HEIGHT_BANDS[bandIndex];
  let weight = band.importance;

  if (band.name === "headAndShoulders") {
    weight *= 1.0 + Math.max(0, normal[2]) * 0.35;
  }

  return weight;
}

function lowerBound(values, target) {
  let low = 0;
  let high = values.length - 1;

  while (low < high) {
    const mid = (low + high) >> 1;
    if (values[mid] < target) low = mid + 1;
    else high = mid;
  }

  return low;
}

function chooseBand(bandTargets, bandCounts, particleIndex) {
  let selectedIndex = 0;
  let largestDeficit = -Infinity;

  for (let i = 0; i < bandTargets.length; i++) {
    const expected = bandTargets[i] * (particleIndex + 1);
    const deficit = expected - bandCounts[i];
    if (deficit > largestDeficit) {
      selectedIndex = i;
      largestDeficit = deficit;
    }
  }

  return selectedIndex;
}

function main() {
  const glb = parseGlb(SOURCE_PATH);
  const meshNode = glb.json.nodes.find((node) => node.mesh !== undefined);
  if (!meshNode) {
    throw new Error("No mesh node found in GLB.");
  }

  const mesh = glb.json.meshes[meshNode.mesh];
  const primitive = mesh.primitives[0];
  const positions = getAccessorReader(glb, primitive.attributes.POSITION);
  const indices = getAccessorReader(glb, primitive.indices);
  const hasBaseColor = fs.existsSync(BASECOLOR_PATH) && primitive.attributes.TEXCOORD_0 !== undefined;
  const uvs = hasBaseColor ? getAccessorReader(glb, primitive.attributes.TEXCOORD_0) : null;
  const texture = hasBaseColor ? decodeRgbImage(BASECOLOR_PATH) : null;

  const sourcePositions = new Array(positions.count);
  const sourceBounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };

  for (let i = 0; i < positions.count; i++) {
    const transformed = transformPoint(
      [positions.read(i, 0), positions.read(i, 1), positions.read(i, 2)],
      meshNode
    );
    sourcePositions[i] = transformed;

    for (let axis = 0; axis < 3; axis++) {
      sourceBounds.min[axis] = Math.min(sourceBounds.min[axis], transformed[axis]);
      sourceBounds.max[axis] = Math.max(sourceBounds.max[axis], transformed[axis]);
    }
  }

  const scenePositions = sourcePositions.map((point) => normalizeToScene(point, sourceBounds));
  const sceneBounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };

  for (const point of scenePositions) {
    for (let axis = 0; axis < 3; axis++) {
      sceneBounds.min[axis] = Math.min(sceneBounds.min[axis], point[axis]);
      sceneBounds.max[axis] = Math.max(sceneBounds.max[axis], point[axis]);
    }
  }

  const sourceHeight = sourceBounds.max[1] - sourceBounds.min[1];
  const bandSamplers = HEIGHT_BANDS.map((band) => ({
    ...band,
    cumulativeWeights: [],
    triangles: [],
    totalWeight: 0,
  }));

  for (let i = 0; i < indices.count; i += 3) {
    const ia = indices.read(i);
    const ib = indices.read(i + 1);
    const ic = indices.read(i + 2);
    const a = scenePositions[ia];
    const b = scenePositions[ib];
    const c = scenePositions[ic];
    const normal = cross(vectorSub(b, a), vectorSub(c, a));
    const doubleArea = length(normal);

    if (doubleArea < 1e-10) continue;

    const normalLength = length(normal);
    const unitNormal = [
      normal[0] / normalLength,
      normal[1] / normalLength,
      normal[2] / normalLength,
    ];
    const sourceCentroidY =
      (sourcePositions[ia][1] + sourcePositions[ib][1] + sourcePositions[ic][1]) / 3;
    const height01 = (sourceCentroidY - sourceBounds.min[1]) / sourceHeight;
    const bandIndex = findHeightBand(height01);

    if (bandIndex < 0) continue;

    const sampler = bandSamplers[bandIndex];
    const weight = doubleArea * bandImportance(bandIndex, unitNormal);

    sampler.totalWeight += weight;
    sampler.cumulativeWeights.push(sampler.totalWeight);
    sampler.triangles.push({
      a,
      b,
      c,
      uvA: uvs ? [uvs.read(ia, 0), uvs.read(ia, 1)] : null,
      uvB: uvs ? [uvs.read(ib, 0), uvs.read(ib, 1)] : null,
      uvC: uvs ? [uvs.read(ic, 0), uvs.read(ic, 1)] : null,
    });
  }

  const random = mulberry32(Number(process.env.RENDERPEOPLE_SEED ?? 68018));
  const output = new Float32Array(PARTICLE_COUNT * 3);
  const colorOutput = texture ? new Float32Array(PARTICLE_COUNT * 3) : null;
  const bandTargets = HEIGHT_BANDS.map((band) => band.share);
  const bandCounts = HEIGHT_BANDS.map(() => 0);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const bandIndex = chooseBand(bandTargets, bandCounts, i);
    const sampler = bandSamplers[bandIndex];
    const triangle =
      sampler.triangles[lowerBound(sampler.cumulativeWeights, random() * sampler.totalWeight)];
    bandCounts[bandIndex]++;

    const r1 = Math.sqrt(random());
    const r2 = random();
    const wa = 1 - r1;
    const wb = r1 * (1 - r2);
    const wc = r1 * r2;

    output[i * 3] = triangle.a[0] * wa + triangle.b[0] * wb + triangle.c[0] * wc;
    output[i * 3 + 1] = triangle.a[1] * wa + triangle.b[1] * wb + triangle.c[1] * wc;
    output[i * 3 + 2] = triangle.a[2] * wa + triangle.b[2] * wb + triangle.c[2] * wc;

    if (texture && colorOutput) {
      const uv = [
        triangle.uvA[0] * wa + triangle.uvB[0] * wb + triangle.uvC[0] * wc,
        triangle.uvA[1] * wa + triangle.uvB[1] * wb + triangle.uvC[1] * wc,
      ];
      const color = sampleRgb(texture, uv);
      colorOutput[i * 3] = color[0];
      colorOutput[i * 3 + 1] = color[1];
      colorOutput[i * 3 + 2] = color[2];
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, Buffer.from(output.buffer));
  if (colorOutput) {
    fs.writeFileSync(COLOR_OUTPUT_PATH, Buffer.from(colorOutput.buffer));
  }

  const metadataPath = OUTPUT_PATH.replace(/\.bin$/, ".metadata.json");
  fs.writeFileSync(
    metadataPath,
    `${JSON.stringify(
      {
        source: SOURCE_PATH,
        output: OUTPUT_PATH,
        colorOutput: colorOutput ? COLOR_OUTPUT_PATH : null,
        basecolor: texture ? BASECOLOR_PATH : null,
        particles: PARTICLE_COUNT,
        vertices: positions.count,
        triangles: indices.count / 3,
        targetHeight: TARGET_HEIGHT,
        footY: FOOT_Y,
        centerZ: CENTER_Z,
        yawDegrees: Number(process.env.RENDERPEOPLE_YAW_DEGREES ?? 180),
        flipTextureV: FLIP_TEXTURE_V,
        sceneBounds,
        heightBands: HEIGHT_BANDS.map((band, index) => ({
          ...band,
          particles: bandCounts[index],
          triangleCandidates: bandSamplers[index].triangles.length,
        })),
      },
      null,
      2
    )}\n`
  );

  console.log(`Wrote ${PARTICLE_COUNT.toLocaleString()} standout particles to ${OUTPUT_PATH}`);
  if (colorOutput) {
    console.log(`Wrote ${PARTICLE_COUNT.toLocaleString()} standout colors to ${COLOR_OUTPUT_PATH}`);
  } else {
    console.log("Skipped color output because no external basecolor texture was available.");
  }
  console.log(`Wrote metadata to ${metadataPath}`);
  console.log(
    `Scene bounds min=${sceneBounds.min.map((value) => value.toFixed(3)).join(", ")} max=${sceneBounds.max
      .map((value) => value.toFixed(3))
      .join(", ")}`
  );
}

main();
