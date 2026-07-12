import { BlockId } from "./blocks";
import { WORLD_HEIGHT, WORLD_SIZE } from "./coords";
import { hash2, valueNoise } from "./noise";

export const SEA_LEVEL = 20;
export const WORKSITE = { x: 64, z: 62, level: 29 } as const;
export const QUARRY = { x: 92, z: 86 } as const;
export type Biome = 'grassland' | 'forest' | 'highland' | 'scrub' | 'wetland';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const smoothstep = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const radial = (x: number, z: number, cx: number, cz: number, radius: number) =>
  clamp(1 - Math.hypot(x - cx, z - cz) / radius, 0, 1);

export function terrainHeight(x: number, z: number, seed: number): number {
  const edge = Math.min(x, z, WORLD_SIZE - 1 - x, WORLD_SIZE - 1 - z);
  const island = smoothstep(1, 18, edge);
  const broad = (valueNoise(x / 46, z / 46, seed) - .5) * 7;
  const secondary = (valueNoise(x / 24, z / 24, seed + 71) - .5) * 2;
  const rugged = Math.max(0, valueNoise(x / 115, z / 115, seed + 303) - .54);
  const ridge = radial(x, z, 91, 55, 24) * 5 + rugged * 13;
  const northRise = radial(x, z, 46, 35, 30) * 2;
  const quarry = radial(x, z, QUARRY.x, QUARRY.z, 19);
  let height = 20 + island * 8 + broad + secondary + ridge + northRise - quarry * quarry * 7;

  // The worksite is deliberately broad and nearly level. The procedural landform
  // still meets it softly at the edge instead of forming an obvious flat disc.
  const worksiteBlend = 1 - smoothstep(12, 24, Math.hypot(x - WORKSITE.x, z - WORKSITE.z));
  height = height * (1 - worksiteBlend) + WORKSITE.level * worksiteBlend;
  return clamp(Math.floor(height), 17, WORLD_HEIGHT - 10);
}

export function biomeAt(x: number, z: number, seed: number): Biome {
  const moisture = valueNoise(x / 95, z / 95, seed + 1207);
  const rugged = valueNoise(x / 115, z / 115, seed + 303);
  const height = terrainHeight(x, z, seed);
  if (height <= SEA_LEVEL + 2) return moisture > .62 ? 'wetland' : 'scrub';
  if (rugged > .66 || height > 33) return 'highland';
  if (moisture > .57) return 'forest';
  return 'grassland';
}

const quarrySurface = (x: number, z: number) => Math.hypot(x - QUARRY.x, z - QUARRY.z) < 16;
const ridgeSurface = (x: number, z: number) => x > 79 && x < 105 && z > 41 && z < 69;

function crystalVein(x: number, y: number, z: number, seed: number) {
  const distance = Math.hypot(x - QUARRY.x, z - QUARRY.z);
  if (distance > 13 || y < 17 || y > 27) return false;
  const seam = Math.abs((y - 20) - Math.sin((x + z) * .38) * 2);
  return seam < 1.25 && hash2(Math.floor(x / 2), Math.floor(z / 2), seed + 911) > .32;
}

function caveAt(x: number, y: number, z: number, seed: number) {
  if (y < 7 || y > 23 || Math.hypot(x - WORKSITE.x, z - WORKSITE.z) < 28) return false;
  const tunnel = valueNoise((x + y * .31) / 15, (z - y * .43) / 15, seed + 2501);
  const chamber = valueNoise(x / 37, z / 37, seed + 2549);
  return tunnel > .76 && chamber > .43;
}

function exposedCrystalSeam(x: number, y: number, z: number, height: number) {
  const localX = x - QUARRY.x, localZ = z - QUARRY.z;
  const seam = Math.abs(localZ - localX * .35);
  return y === height && Math.abs(localX) <= 7 && Math.abs(localZ) <= 4 && seam < 1.15 && (x + z) % 3 !== 0;
}

function quarryMouth(x: number, y: number, z: number, height: number) {
  const dx = x - QUARRY.x, dz = z - (QUARRY.z - 9);
  // A shallow, hand-cut entrance makes the quarry a readable destination
  // instead of asking the player to tunnel blindly into procedural stone.
  return Math.abs(dx) <= 2 && Math.abs(dz) <= 1 && y >= height - 3 && y <= height;
}

export function baseBlock(x: number, y: number, z: number, seed: number): BlockId {
  if (x < 0 || z < 0 || x >= WORLD_SIZE || z >= WORLD_SIZE || y < 0 || y >= WORLD_HEIGHT) {
    return y <= SEA_LEVEL ? BlockId.Water : BlockId.Air;
  }
  const height = terrainHeight(x, z, seed);
  if (y > height) return y <= SEA_LEVEL ? BlockId.Water : BlockId.Air;
  if (quarryMouth(x, y, z, height)) return BlockId.Air;
  if (caveAt(x, y, z, seed) && y < height - 2) return BlockId.Air;
  if (exposedCrystalSeam(x, y, z, height)) return BlockId.CrystalOre;
  if (crystalVein(x, y, z, seed)) return BlockId.CrystalOre;
  if (quarrySurface(x, z) || ridgeSurface(x, z)) return BlockId.Stone;
  const biome = biomeAt(x, z, seed);
  if (y === height) return height <= SEA_LEVEL + 1 || biome === 'scrub' ? BlockId.Sand : BlockId.Grass;
  if (y > height - 3) return height <= SEA_LEVEL + 1 || biome === 'scrub' ? BlockId.Sand : BlockId.Dirt;
  return BlockId.Stone;
}

function routeClearance(x: number, z: number) {
  const ax = WORKSITE.x + 7, az = WORKSITE.z + 5;
  const bx = QUARRY.x - 8, bz = QUARRY.z - 8;
  const dx = bx - ax, dz = bz - az;
  const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
  return Math.hypot(x - (ax + dx * t), z - (az + dz * t)) < 5;
}

export function shouldTree(x: number, z: number, seed: number): boolean {
  if (x < 6 || z < 6 || x >= WORLD_SIZE - 6 || z >= WORLD_SIZE - 6) return false;
  if (Math.hypot(x - WORKSITE.x, z - WORKSITE.z) < 21 || routeClearance(x, z)) return false;
  const forest = Math.max(
    radial(x, z, 38, 55, 27),
    radial(x, z, 46, 86, 22),
    radial(x, z, 70, 34, 19),
  );
  const biome = biomeAt(x, z, seed);
  if ((forest < .24 && biome !== 'forest') || terrainHeight(x, z, seed) <= SEA_LEVEL + 1) return false;

  // One candidate per five-block cell creates legible stands with open ground
  // between them instead of uniformly scattered individual trees.
  const cellX = Math.floor(x / 5), cellZ = Math.floor(z / 5);
  const offsetX = 1 + Math.floor(hash2(cellX, cellZ, seed + 421) * 3);
  const offsetZ = 1 + Math.floor(hash2(cellZ, cellX, seed + 733) * 3);
  const density = biome === 'forest' ? Math.max(.48, forest) : forest;
  return x === cellX * 5 + offsetX && z === cellZ * 5 + offsetZ && hash2(cellX, cellZ, seed + 109) < density;
}

export function findSpawn(seed: number) {
  const x = WORKSITE.x + .5;
  const z = WORKSITE.z + 10.5;
  return { x, y: terrainHeight(Math.floor(x), Math.floor(z), seed) + 1.01, z };
}
