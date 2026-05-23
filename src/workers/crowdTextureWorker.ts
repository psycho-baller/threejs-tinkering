import { generateCrowdTextures } from "../utils/proceduralHuman";

interface CrowdTextureWorkerRequest {
  width: number;
  height: number;
  renderPeopleMesh: string;
}

const ASSET_ID = "rp_posedplus_00068_18";
const CROWD_ASSET_IDS = [
  "rp_carla_rigged_001_yup_a",
  "rp_claudia_rigged_002_yup_a",
  "rp_dennis_posed_004_30k",
  "rp_eric_rigged_001_yup_a",
  "rp_fabienne_percy_posed_001_60k",
  "rp_mei_posed_001_30k",
  "rp_posed_00178_29",
];

function getRenderPeopleAssetPaths(meshVariant: string) {
  const variant = meshVariant === "300k" ? "300k" : "100k";
  const basePath = `/private-assets/renderpeople/${ASSET_ID}_${variant}_standout`;

  return {
    positionPath: `${basePath}.bin`,
    colorPath: `${basePath}_color.bin`,
  };
}

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<CrowdTextureWorkerRequest>) => void) | null;
  postMessage: (message: unknown, transfer: Transferable[]) => void;
};

async function loadFloatAsset(path: string, expectedFloatCount: number): Promise<Float32Array | null> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    const values = new Float32Array(buffer);
    return values.length === expectedFloatCount ? values : null;
  } catch {
    return null;
  }
}

workerScope.onmessage = async (event: MessageEvent<CrowdTextureWorkerRequest>) => {
  const { width, height, renderPeopleMesh } = event.data;
  const standoutParticleCount = width * 128;
  const crowdFigureParticleCount = width * 64;
  const { positionPath, colorPath } = getRenderPeopleAssetPaths(renderPeopleMesh);
  const crowdPositionPromises = CROWD_ASSET_IDS.map((assetId) =>
    loadFloatAsset(`/private-assets/renderpeople-crowd/${assetId}.bin`, crowdFigureParticleCount * 3)
  );
  const [standoutPositions, particleColors, ...crowdPositions] = await Promise.all([
    loadFloatAsset(positionPath, standoutParticleCount * 3),
    loadFloatAsset(colorPath, standoutParticleCount * 3),
    ...crowdPositionPromises,
  ]);
  const scannedCrowdPositions = crowdPositions.filter(
    (positions): positions is Float32Array => Boolean(positions)
  );
  const { targetPositions, initialPositions } = generateCrowdTextures(width, height, {
    standoutPositions,
    scannedCrowdPositions,
  });

  const message = {
    targetPositions,
    initialPositions,
    particleColors: particleColors ?? undefined,
    usedScannedStandout: Boolean(standoutPositions),
  };
  const transfer = [targetPositions.buffer, initialPositions.buffer] as Transferable[];
  if (particleColors) {
    transfer.push(particleColors.buffer);
  }

  workerScope.postMessage(
    message,
    transfer
  );
};

export {};
