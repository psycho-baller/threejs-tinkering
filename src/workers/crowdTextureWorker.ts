import { generateCrowdTextures } from "../utils/proceduralHuman";

interface CrowdTextureWorkerRequest {
  width: number;
  height: number;
}

const STANDOUT_ASSET_PATH =
  "/private-assets/renderpeople/rp_posedplus_00068_18_100k_standout.bin";
const STANDOUT_COLOR_ASSET_PATH =
  "/private-assets/renderpeople/rp_posedplus_00068_18_100k_standout_color.bin";

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
  const { width, height } = event.data;
  const standoutParticleCount = width * 128;
  const [standoutPositions, particleColors] = await Promise.all([
    loadFloatAsset(STANDOUT_ASSET_PATH, standoutParticleCount * 3),
    loadFloatAsset(STANDOUT_COLOR_ASSET_PATH, standoutParticleCount * 3),
  ]);
  const { targetPositions, initialPositions } = generateCrowdTextures(width, height, {
    standoutPositions,
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
