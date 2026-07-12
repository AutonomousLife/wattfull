import { BlockId, BLOCKS } from "./blocks";
import { baseBlock, shouldTree, terrainHeight, WORKSITE } from "./generator";
import { blockKey, chunkIndex, chunkKey, CHUNK_SIZE, WORLD_HEIGHT, WORLD_SIZE, worldToChunk, worldToLocal } from "./coords";

export type Chunk = { cx: number; cz: number; data: Uint8Array; dirty: boolean; revision: number };

export class World {
  readonly chunks = new Map<string, Chunk>();
  readonly edits = new Map<string, number>();
  readonly tower = { x: WORKSITE.x, z: WORKSITE.z, ground: WORKSITE.level };
  private generationQueue: string[] = [];
  private queued = new Set<string>();

  constructor(public readonly seed: number) {
    // Collision and the visible spawn area are ready immediately; all other
    // terrain is generated in small prioritized jobs while the game runs.
    const cx = worldToChunk(WORKSITE.x), cz = worldToChunk(WORKSITE.z);
    for (let z = cz - 1; z <= cz + 1; z++) for (let x = cx - 1; x <= cx + 1; x++) this.ensureChunk(x, z);
  }

  ensureChunk(cx: number, cz: number) {
    const key = chunkKey(cx, cz);
    const existing = this.chunks.get(key);
    if (existing) return existing;
    const data = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);
    const chunk: Chunk = { cx, cz, data, dirty: true, revision: 0 };
    for (let y = 0; y < WORLD_HEIGHT; y++) for (let z = 0; z < CHUNK_SIZE; z++) for (let x = 0; x < CHUNK_SIZE; x++) {
      data[chunkIndex(x, y, z)] = baseBlock(cx * CHUNK_SIZE + x, y, cz * CHUNK_SIZE + z, this.seed);
    }
    this.chunks.set(key, chunk);
    this.decorateChunk(chunk);
    this.applyPersistedEdits(chunk);
    return chunk;
  }

  queueAround(x: number, z: number, radius: number) {
    const cx = worldToChunk(Math.floor(x)), cz = worldToChunk(Math.floor(z));
    for (let distance = 0; distance <= radius; distance++) for (let dz = -distance; dz <= distance; dz++) for (let dx = -distance; dx <= distance; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dz)) !== distance || dx * dx + dz * dz > radius * radius) continue;
      const key = chunkKey(cx + dx, cz + dz);
      if (!this.chunks.has(key) && !this.queued.has(key)) { this.queued.add(key); this.generationQueue.push(key); }
    }
  }

  processGeneration(budget = 1) {
    while (budget-- > 0 && this.generationQueue.length) {
      const key = this.generationQueue.shift()!;
      this.queued.delete(key);
      const [cx, cz] = key.split(',').map(Number);
      if (cx !== undefined && cz !== undefined) this.ensureChunk(cx, cz);
    }
  }

  pendingGeneration() { return this.generationQueue.length; }

  unloadFar(x: number, z: number, keepRadius: number) {
    const cx = worldToChunk(Math.floor(x)), cz = worldToChunk(Math.floor(z));
    for (const [key, chunk] of this.chunks) {
      if (Math.max(Math.abs(chunk.cx - cx), Math.abs(chunk.cz - cz)) <= keepRadius || this.chunkHasEdits(chunk.cx, chunk.cz)) continue;
      this.chunks.delete(key);
    }
  }

  private decorateChunk(chunk: Chunk) {
    const minX = chunk.cx * CHUNK_SIZE, minZ = chunk.cz * CHUNK_SIZE;
    // Scan a small border so trees can cross chunk boundaries without depending
    // on the order in which neighboring chunks are generated.
    for (let z = minZ - 3; z < minZ + CHUNK_SIZE + 3; z++) for (let x = minX - 3; x < minX + CHUNK_SIZE + 3; x++) {
      if (shouldTree(x, z, this.seed)) this.addTreeToChunk(chunk, x, terrainHeight(x, z, this.seed) + 1, z);
    }
    this.addWorksiteToChunk(chunk);
  }

  private addTreeToChunk(chunk: Chunk, x: number, y: number, z: number) {
    const height = 4 + Math.floor(((x * 17 + z * 13) % 2 + 2) % 2);
    for (let i = 0; i < height; i++) this.setRaw(chunk, x, y + i, z, BlockId.Log);
    for (let dy = height - 2; dy <= height + 1; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dz) + (dy === height + 1 ? 1 : 0) <= 3) this.setRaw(chunk, x + dx, y + dy, z + dz, BlockId.Leaves);
    }
  }

  private addWorksiteToChunk(chunk: Chunk) {
    const { x, z, ground } = this.tower;
    for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) this.setRaw(chunk, x + dx, ground + 1, z + dz, BlockId.Cobblestone);
    const legs = [{ x: x - 2, z: z - 2, height: 6 }, { x: x + 2, z: z - 2, height: 6 }, { x: x - 2, z: z + 2, height: 4 }, { x: x + 2, z: z + 2, height: 2 }];
    for (const leg of legs) for (let y = 2; y <= leg.height; y++) this.setRaw(chunk, leg.x, ground + y, leg.z, BlockId.Cobblestone);
    for (let dx = -1; dx <= 1; dx++) this.setRaw(chunk, x + dx, ground + 6, z - 2, BlockId.Planks);
    this.setRaw(chunk, x - 2, ground + 5, z - 1, BlockId.Planks);
    this.setRaw(chunk, x - 7, ground + 1, z + 4, BlockId.CraftingBench);
    for (let dx = 0; dx < 3; dx++) this.setRaw(chunk, x - 8 + dx, ground + 1, z - 5, BlockId.Log);
    this.setRaw(chunk, x + 7, ground + 1, z + 2, BlockId.Cobblestone);
    this.setRaw(chunk, x + 8, ground + 1, z + 2, BlockId.Cobblestone);
    this.setRaw(chunk, x + 8, ground + 1, z + 3, BlockId.Cobblestone);
  }

  repairTower() {
    const { x, z, ground } = this.tower;
    for (let y = 3; y <= 6; y++) this.edit(x + 2, ground + y, z + 2, BlockId.Cobblestone);
    for (let dx = -1; dx <= 1; dx++) this.edit(x + dx, ground + 6, z + 2, BlockId.Planks);
    for (let dz = -1; dz <= 1; dz++) { this.edit(x - 2, ground + 6, z + dz, BlockId.Planks); this.edit(x + 2, ground + 6, z + dz, BlockId.Planks); }
    this.edit(x, ground + 6, z, BlockId.Beacon);
  }
  isTowerBlock(x: number, y: number, z: number) { return Math.abs(x - this.tower.x) <= 2 && Math.abs(z - this.tower.z) <= 2 && y > this.tower.ground && y <= this.tower.ground + 7; }
  isTowerTarget(x: number, y: number, z: number) { return Math.abs(x - this.tower.x) <= 3 && Math.abs(z - this.tower.z) <= 3 && y >= this.tower.ground + 1; }

  private setRaw(chunk: Chunk, x: number, y: number, z: number, id: number) {
    if (y < 0 || y >= WORLD_HEIGHT || worldToChunk(x) !== chunk.cx || worldToChunk(z) !== chunk.cz) return;
    chunk.data[chunkIndex(worldToLocal(x), y, worldToLocal(z))] = id;
  }
  private applyPersistedEdits(chunk: Chunk) {
    for (const [key, id] of this.edits) {
      const values = key.split(',').map(Number);
      if (values.length !== 3 || worldToChunk(values[0]!) !== chunk.cx || worldToChunk(values[2]!) !== chunk.cz) continue;
      chunk.data[chunkIndex(worldToLocal(values[0]!), values[1]!, worldToLocal(values[2]!))] = id;
    }
  }
  private chunkHasEdits(cx: number, cz: number) {
    for (const key of this.edits.keys()) { const values = key.split(',').map(Number); if (worldToChunk(values[0]!) === cx && worldToChunk(values[2]!) === cz) return true; }
    return false;
  }
  getChunk(x: number, z: number) { return this.chunks.get(chunkKey(worldToChunk(x), worldToChunk(z))); }
  get(x: number, y: number, z: number): number {
    if (y < 0) return BlockId.Stone;
    if (y >= WORLD_HEIGHT) return BlockId.Air;
    const chunk = this.getChunk(x, z);
    return chunk ? chunk.data[chunkIndex(worldToLocal(x), y, worldToLocal(z))] ?? BlockId.Air : baseBlock(x, y, z, this.seed);
  }
  isSolid(x: number, y: number, z: number) { return BLOCKS[this.get(x, y, z)]?.solid ?? false; }
  edit(x: number, y: number, z: number, id: number) {
    if (y < 0 || y >= WORLD_HEIGHT) return;
    const chunk = this.ensureChunk(worldToChunk(x), worldToChunk(z));
    chunk.data[chunkIndex(worldToLocal(x), y, worldToLocal(z))] = id;
    chunk.dirty = true; chunk.revision++;
    this.edits.set(blockKey(x, y, z), id);
    const lx = worldToLocal(x), lz = worldToLocal(z);
    const mark = (value: Chunk | undefined) => { if (value) { value.dirty = true; value.revision++; } };
    if (lx === 0) mark(this.ensureChunk(worldToChunk(x - 1), worldToChunk(z))); if (lx === 15) mark(this.ensureChunk(worldToChunk(x + 1), worldToChunk(z)));
    if (lz === 0) mark(this.ensureChunk(worldToChunk(x), worldToChunk(z - 1))); if (lz === 15) mark(this.ensureChunk(worldToChunk(x), worldToChunk(z + 1)));
  }
  applyEdits(edits: Iterable<[string, number]>) {
    for (const [key, id] of edits) {
      const values = key.split(',').map(Number);
      if (values.length !== 3 || values.some(value => !Number.isFinite(value))) continue;
      this.edit(values[0]!, values[1]!, values[2]!, id);
    }
  }
}
