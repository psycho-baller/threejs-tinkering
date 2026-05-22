import { generateCrowdTextures } from "../utils/proceduralHuman";

interface CrowdTextureWorkerRequest {
  width: number;
  height: number;
}

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<CrowdTextureWorkerRequest>) => void) | null;
  postMessage: (message: unknown, transfer: Transferable[]) => void;
};

workerScope.onmessage = (event: MessageEvent<CrowdTextureWorkerRequest>) => {
  const { width, height } = event.data;
  const { targetPositions, initialPositions } = generateCrowdTextures(width, height);

  workerScope.postMessage(
    { targetPositions, initialPositions },
    [targetPositions.buffer, initialPositions.buffer] as Transferable[]
  );
};

export {};
