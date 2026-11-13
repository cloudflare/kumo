import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { PNG } from "pngjs";
import { MAX_NOISE_PIXELS, compareImages } from "./image-comparison";

let directory: string;
let imageNumber = 0;

function makeImage(
  width: number,
  height: number,
  colorAt: (x: number, y: number) => [number, number, number, number],
): PNG {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      png.data.set(colorAt(x, y), offset);
    }
  }
  return png;
}

function writeImage(
  png: PNG,
  options?: Parameters<typeof PNG.sync.write>[1],
): string {
  const path = join(directory, `${imageNumber++}.png`);
  writeFileSync(path, PNG.sync.write(png, options));
  return path;
}

function patternedImage(width = 100, height = 100): PNG {
  return makeImage(width, height, (x, y) => [
    (x * 17 + y * 3) % 256,
    (x * 5 + y * 29) % 256,
    (x * 11 + y * 7) % 256,
    255,
  ]);
}

function translatedImage(source: PNG, offsetX: number, offsetY: number): PNG {
  return makeImage(source.width, source.height, (x, y) => {
    const sourceX = x - offsetX;
    const sourceY = y - offsetY;
    if (
      sourceX < 0 ||
      sourceX >= source.width ||
      sourceY < 0 ||
      sourceY >= source.height
    ) {
      return [255, 255, 255, 255];
    }
    const offset = (sourceY * source.width + sourceX) * 4;
    return Array.from(source.data.subarray(offset, offset + 4)) as [
      number,
      number,
      number,
      number,
    ];
  });
}

function changePixels(source: PNG, count: number): PNG {
  const changed = PNG.sync.read(PNG.sync.write(source));
  for (let index = 0; index < count; index++) {
    const offset = index * 4;
    changed.data.set([255, 0, 255, 255], offset);
  }
  return changed;
}

before(() => {
  directory = mkdtempSync(join(tmpdir(), "kumo-image-comparison-"));
});

after(() => {
  rmSync(directory, { recursive: true, force: true });
});

describe("compareImages", () => {
  it("uses the byte-identical fast path", () => {
    const image = writeImage(patternedImage());
    assert.deepEqual(compareImages(image, image), {
      changed: false,
      diffPixels: 0,
      diffPercent: 0,
      diffImage: null,
    });
  });

  it("treats decoded differences below pixelmatch's threshold as unchanged", () => {
    const beforeImage = makeImage(20, 20, () => [100, 100, 100, 255]);
    const afterImage = makeImage(20, 20, () => [101, 100, 100, 255]);
    const result = compareImages(
      writeImage(beforeImage),
      writeImage(afterImage),
    );
    assert.equal(result.changed, false);
    assert.equal(result.diffPixels, 0);
    assert.equal(result.diffPercent, 0);
    assert.equal(result.diffImage, null);
  });

  it("allows the fixed pixel noise budget", () => {
    const source = patternedImage(100, 100);
    const result = compareImages(
      writeImage(source),
      writeImage(changePixels(source, MAX_NOISE_PIXELS)),
    );
    assert.equal(result.changed, false);
    assert.equal(result.diffPixels, MAX_NOISE_PIXELS);
    assert.equal(result.diffImage, null);
    assert.ok(result.diffPercent > 0);
  });

  it("keeps a precise percentage for allowed noise on a large image", () => {
    const source = patternedImage(500, 500);
    const result = compareImages(
      writeImage(source),
      writeImage(changePixels(source, MAX_NOISE_PIXELS)),
    );
    assert.equal(result.changed, false);
    assert.equal(result.diffPixels, MAX_NOISE_PIXELS);
    assert.ok(result.diffPercent > 0 && result.diffPercent < 0.01);
  });

  it("reports meaningful changes and includes a diff image", () => {
    const source = patternedImage(100, 100);
    const result = compareImages(
      writeImage(source),
      writeImage(changePixels(source, 100)),
    );
    assert.equal(result.changed, true);
    assert.ok(result.diffPixels > MAX_NOISE_PIXELS);
    assert.ok(result.diffPercent >= 0.01);
    assert.ok(result.diffImage);
    assert.doesNotThrow(() => PNG.sync.read(result.diffImage!));
  });

  it("reports a coherent thin line on a large image", () => {
    const source = makeImage(1000, 800, () => [255, 255, 255, 255]);
    const changed = makeImage(1000, 800, (x, y) =>
      y === 400 && x >= 100 && x < 900 ? [0, 0, 0, 255] : [255, 255, 255, 255],
    );
    const result = compareImages(writeImage(source), writeImage(changed));
    assert.equal(result.changed, true);
    assert.equal(result.diffPixels, 800);
    assert.ok(result.diffPercent > 0);
    assert.ok(result.diffImage);
  });

  it("reports a change confined to the image edge", () => {
    const source = makeImage(800, 600, () => [255, 255, 255, 255]);
    const changed = makeImage(800, 600, (x) =>
      x === 799 ? [0, 0, 0, 255] : [255, 255, 255, 255],
    );
    const result = compareImages(writeImage(source), writeImage(changed));
    assert.equal(result.changed, true);
    assert.equal(result.diffPixels, 600);
    assert.ok(result.diffImage);
  });

  for (const offset of [1, 2, 3]) {
    it(`tolerates a ${offset}px whole-image translation`, () => {
      const source = patternedImage();
      const result = compareImages(
        writeImage(source),
        writeImage(translatedImage(source, offset, -offset)),
      );
      assert.equal(result.changed, false);
      assert.equal(result.diffPixels, 0);
      assert.equal(result.diffImage, null);
    });
  }

  it("reports translations beyond 3px as changed", () => {
    const source = patternedImage();
    const result = compareImages(
      writeImage(source),
      writeImage(translatedImage(source, 4, 0)),
    );
    assert.equal(result.changed, true);
    assert.ok(result.diffPixels > MAX_NOISE_PIXELS);
    assert.ok(result.diffImage);
  });

  it("reports dimension mismatches as changed", () => {
    const result = compareImages(
      writeImage(patternedImage(100, 100)),
      writeImage(patternedImage(101, 100)),
    );
    assert.equal(result.changed, true);
    assert.ok(result.diffImage);
  });
});
