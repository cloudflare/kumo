import { existsSync, readFileSync } from "node:fs";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export const MAX_TRANSLATION_PIXELS = 3;
export const TRANSLATION_SAMPLE_SIZE = 384;
export const MAX_NOISE_PIXELS = 22;

export interface DiffResult {
  changed: boolean;
  diffPixels: number;
  diffPercent: number;
  diffImage: Buffer | null;
}

interface Comparison {
  diffPixels: number;
  totalPixels: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  diffData: Uint8Array | null;
}

const pixelmatchOptions = {
  threshold: 0.1,
  diffColor: [255, 0, 0] as [number, number, number],
  alpha: 0.3,
};

function compareAtOffset(
  before: PNG,
  after: PNG,
  offsetX: number,
  offsetY: number,
  sample: boolean,
  includeDiff: boolean,
): Comparison {
  let beforeX = Math.max(0, -offsetX);
  let beforeY = Math.max(0, -offsetY);
  let afterX = Math.max(0, offsetX);
  let afterY = Math.max(0, offsetY);
  let width = before.width - Math.abs(offsetX);
  let height = before.height - Math.abs(offsetY);

  if (sample) {
    width = Math.min(TRANSLATION_SAMPLE_SIZE, width);
    height = Math.min(TRANSLATION_SAMPLE_SIZE, height);
    const horizontalInset = Math.floor(
      (before.width - Math.abs(offsetX) - width) / 2,
    );
    const verticalInset = Math.floor(
      (before.height - Math.abs(offsetY) - height) / 2,
    );
    beforeX += horizontalInset;
    afterX += horizontalInset;
    beforeY += verticalInset;
    afterY += verticalInset;
  }
  const beforeData = new Uint8Array(width * height * 4);
  const afterData = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const rowLength = width * 4;
    const beforeStart = ((beforeY + y) * before.width + beforeX) * 4;
    const afterStart = ((afterY + y) * after.width + afterX) * 4;
    beforeData.set(
      before.data.subarray(beforeStart, beforeStart + rowLength),
      y * rowLength,
    );
    afterData.set(
      after.data.subarray(afterStart, afterStart + rowLength),
      y * rowLength,
    );
  }

  const diffData = includeDiff ? new Uint8Array(width * height * 4) : null;
  const diffPixels = pixelmatch(
    beforeData,
    afterData,
    diffData ?? undefined,
    width,
    height,
    pixelmatchOptions,
  );

  return {
    diffPixels,
    totalPixels: width * height,
    offsetX,
    offsetY,
    width,
    height,
    diffData,
  };
}

function isBetterComparison(
  candidate: Comparison,
  current: Comparison,
): boolean {
  const normalizedDifference =
    candidate.diffPixels * current.totalPixels -
    current.diffPixels * candidate.totalPixels;
  if (normalizedDifference !== 0) {
    return normalizedDifference < 0;
  }

  const candidateDistance = candidate.offsetX ** 2 + candidate.offsetY ** 2;
  const currentDistance = current.offsetX ** 2 + current.offsetY ** 2;
  return candidateDistance < currentDistance;
}

function encodeDiff(
  comparison: Comparison,
  width: number,
  height: number,
): Buffer {
  if (!comparison.diffData) {
    throw new Error("Diff data is required to encode a comparison");
  }

  const png = new PNG({ width, height });
  const destinationX = Math.max(0, comparison.offsetX);
  const destinationY = Math.max(0, comparison.offsetY);

  for (let y = 0; y < comparison.height; y++) {
    const rowLength = comparison.width * 4;
    const sourceStart = y * rowLength;
    const destinationStart = ((destinationY + y) * width + destinationX) * 4;
    png.data.set(
      comparison.diffData.subarray(sourceStart, sourceStart + rowLength),
      destinationStart,
    );
  }

  return PNG.sync.write(png);
}

function compareDifferentSizes(before: PNG, after: PNG): DiffResult {
  const width = Math.max(before.width, after.width);
  const height = Math.max(before.height, after.height);
  const beforeData = new Uint8Array(width * height * 4);
  const afterData = new Uint8Array(width * height * 4);

  for (let y = 0; y < before.height; y++) {
    const rowLength = before.width * 4;
    const sourceStart = y * rowLength;
    beforeData.set(
      before.data.subarray(sourceStart, sourceStart + rowLength),
      y * width * 4,
    );
  }
  for (let y = 0; y < after.height; y++) {
    const rowLength = after.width * 4;
    const sourceStart = y * rowLength;
    afterData.set(
      after.data.subarray(sourceStart, sourceStart + rowLength),
      y * width * 4,
    );
  }

  const diffData = new Uint8Array(width * height * 4);
  const diffPixels = pixelmatch(
    beforeData,
    afterData,
    diffData,
    width,
    height,
    pixelmatchOptions,
  );
  const diffPng = new PNG({ width, height });
  diffPng.data = Buffer.from(diffData);

  return {
    changed: true,
    diffPixels,
    diffPercent: (diffPixels / (width * height)) * 100,
    diffImage: PNG.sync.write(diffPng),
  };
}

export function compareImages(
  beforePath: string,
  afterPath: string,
): DiffResult {
  if (!existsSync(beforePath) || !existsSync(afterPath)) {
    return { changed: true, diffPixels: 0, diffPercent: 100, diffImage: null };
  }

  const beforeBuffer = readFileSync(beforePath);
  const afterBuffer = readFileSync(afterPath);
  if (beforeBuffer.equals(afterBuffer)) {
    return { changed: false, diffPixels: 0, diffPercent: 0, diffImage: null };
  }

  const before = PNG.sync.read(beforeBuffer);
  const after = PNG.sync.read(afterBuffer);
  if (before.width !== after.width || before.height !== after.height) {
    return compareDifferentSizes(before, after);
  }

  let best = compareAtOffset(before, after, 0, 0, true, false);
  for (
    let offsetY = -MAX_TRANSLATION_PIXELS;
    offsetY <= MAX_TRANSLATION_PIXELS;
    offsetY++
  ) {
    for (
      let offsetX = -MAX_TRANSLATION_PIXELS;
      offsetX <= MAX_TRANSLATION_PIXELS;
      offsetX++
    ) {
      if (offsetX === 0 && offsetY === 0) continue;
      const candidate = compareAtOffset(
        before,
        after,
        offsetX,
        offsetY,
        true,
        false,
      );
      if (isBetterComparison(candidate, best)) best = candidate;
    }
  }

  const fullComparison = compareAtOffset(
    before,
    after,
    best.offsetX,
    best.offsetY,
    false,
    true,
  );
  const diffPercent =
    (fullComparison.diffPixels / fullComparison.totalPixels) * 100;
  const changed = fullComparison.diffPixels > MAX_NOISE_PIXELS;

  return {
    changed,
    diffPixels: fullComparison.diffPixels,
    diffPercent,
    diffImage: changed
      ? encodeDiff(fullComparison, before.width, before.height)
      : null,
  };
}
