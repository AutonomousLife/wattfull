export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 64;
export const WORLD_CHUNKS = 8;
export const WORLD_SIZE = CHUNK_SIZE * WORLD_CHUNKS;

export const floorDiv = (n: number, d: number) => Math.floor(n / d);
export const mod = (n: number, d: number) => ((n % d) + d) % d;
export const worldToChunk = (n: number) => floorDiv(n, CHUNK_SIZE);
export const worldToLocal = (n: number) => mod(n, CHUNK_SIZE);
export const chunkKey = (cx: number, cz: number) => `${cx},${cz}`;
export const blockKey = (x: number, y: number, z: number) => `${x},${y},${z}`;
export const chunkIndex = (x: number, y: number, z: number) => x + CHUNK_SIZE * (z + CHUNK_SIZE * y);
