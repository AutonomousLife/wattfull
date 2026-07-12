import { BlockId, BLOCKS } from "./blocks";
import { baseBlock, shouldTree, terrainHeight, WORKSITE } from "./generator";
import { blockKey, chunkIndex, chunkKey, CHUNK_SIZE, WORLD_HEIGHT, WORLD_SIZE } from "./coords";

export type Chunk = { cx: number; cz: number; data: Uint8Array; dirty: boolean };

export class World {
  readonly chunks = new Map<string, Chunk>();
  readonly edits = new Map<string, number>();
  readonly tower = { x: WORKSITE.x, z: WORKSITE.z, ground: WORKSITE.level };

  constructor(public readonly seed: number) { this.generate(); }

  private generate() {
    for (let cz = 0; cz < WORLD_SIZE / CHUNK_SIZE; cz++) for (let cx = 0; cx < WORLD_SIZE / CHUNK_SIZE; cx++) {
      const data = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);
      for (let y = 0; y < WORLD_HEIGHT; y++) for (let z = 0; z < CHUNK_SIZE; z++) for (let x = 0; x < CHUNK_SIZE; x++) {
        data[chunkIndex(x, y, z)] = baseBlock(cx * CHUNK_SIZE + x, y, cz * CHUNK_SIZE + z, this.seed);
      }
      this.chunks.set(chunkKey(cx, cz), { cx, cz, data, dirty: true });
    }
    for (let z = 3; z < WORLD_SIZE - 3; z++) for (let x = 3; x < WORLD_SIZE - 3; x++) {
      if (shouldTree(x, z, this.seed)) this.addTree(x, terrainHeight(x, z, this.seed) + 1, z);
    }
    this.addWorksite();
  }

  private addTree(x: number, y: number, z: number) {
    const height = 4 + Math.floor((x * 17 + z * 13) % 2);
    for (let i = 0; i < height; i++) this.setRaw(x, y + i, z, BlockId.Log);
    for (let dy = height - 2; dy <= height + 1; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dz) + (dy === height + 1 ? 1 : 0) <= 3) this.setRaw(x + dx, y + dy, z + dz, BlockId.Leaves);
    }
  }

  private addWorksite() {
    const { x, z, ground } = this.tower;
    for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) this.setRaw(x + dx, ground + 1, z + dz, BlockId.Cobblestone);
    const legs = [
      { x: x - 2, z: z - 2, height: 6 },
      { x: x + 2, z: z - 2, height: 6 },
      { x: x - 2, z: z + 2, height: 4 },
      { x: x + 2, z: z + 2, height: 2 },
    ];
    for (const leg of legs) for (let y = 2; y <= leg.height; y++) this.setRaw(leg.x, ground + y, leg.z, BlockId.Cobblestone);
    for (let dx = -1; dx <= 1; dx++) this.setRaw(x + dx, ground + 6, z - 2, BlockId.Planks);
    this.setRaw(x - 2, ground + 5, z - 1, BlockId.Planks);

    // A usable bench and a small amount of readable debris make the clearing a
    // worksite, not a prop field.
    this.setRaw(x - 7, ground + 1, z + 4, BlockId.CraftingBench);
    for (let dx = 0; dx < 3; dx++) this.setRaw(x - 8 + dx, ground + 1, z - 5, BlockId.Log);
    this.setRaw(x + 7, ground + 1, z + 2, BlockId.Cobblestone);
    this.setRaw(x + 8, ground + 1, z + 2, BlockId.Cobblestone);
    this.setRaw(x + 8, ground + 1, z + 3, BlockId.Cobblestone);
  }

  repairTower() {
    const { x, z, ground } = this.tower;
    for (let y = 3; y <= 6; y++) this.edit(x + 2, ground + y, z + 2, BlockId.Cobblestone);
    for (let dx = -1; dx <= 1; dx++) this.edit(x + dx, ground + 6, z + 2, BlockId.Planks);
    for (let dz = -1; dz <= 1; dz++) {
      this.edit(x - 2, ground + 6, z + dz, BlockId.Planks);
      this.edit(x + 2, ground + 6, z + dz, BlockId.Planks);
    }
    this.edit(x, ground + 6, z, BlockId.Beacon);
  }

  isTowerBlock(x: number, y: number, z: number) {
    return Math.abs(x - this.tower.x) <= 2 && Math.abs(z - this.tower.z) <= 2 && y > this.tower.ground && y <= this.tower.ground + 7;
  }

  isTowerTarget(x: number, y: number, z: number) {
    return Math.abs(x - this.tower.x) <= 3 && Math.abs(z - this.tower.z) <= 3 && y >= this.tower.ground + 1;
  }

  private setRaw(x: number, y: number, z: number, id: number) {
    const chunk = this.getChunk(x, z);
    if (chunk && y >= 0 && y < WORLD_HEIGHT) chunk.data[chunkIndex(((x % 16) + 16) % 16, y, ((z % 16) + 16) % 16)] = id;
  }

  getChunk(x: number, z: number) { return this.chunks.get(chunkKey(Math.floor(x / CHUNK_SIZE), Math.floor(z / CHUNK_SIZE))); }
  get(x: number, y: number, z: number): number {
    if (y < 0) return BlockId.Stone;
    if (y >= WORLD_HEIGHT) return BlockId.Air;
    const chunk = this.getChunk(x, z);
    return chunk ? chunk.data[chunkIndex(((x % 16) + 16) % 16, y, ((z % 16) + 16) % 16)] ?? BlockId.Air : BlockId.Water;
  }
  isSolid(x: number, y: number, z: number) { return BLOCKS[this.get(x, y, z)]?.solid ?? false; }
  edit(x: number, y: number, z: number, id: number) {
    if (y < 0 || y >= WORLD_HEIGHT) return;
    const chunk = this.getChunk(x, z);
    if (!chunk) return;
    chunk.data[chunkIndex(((x % 16) + 16) % 16, y, ((z % 16) + 16) % 16)] = id;
    chunk.dirty = true;
    this.edits.set(blockKey(x, y, z), id);
    const lx = ((x % 16) + 16) % 16, lz = ((z % 16) + 16) % 16;
    const mark = (value: Chunk | undefined) => { if (value) value.dirty = true; };
    if (lx === 0) mark(this.getChunk(x - 1, z));
    if (lx === 15) mark(this.getChunk(x + 1, z));
    if (lz === 0) mark(this.getChunk(x, z - 1));
    if (lz === 15) mark(this.getChunk(x, z + 1));
  }
  applyEdits(edits: Iterable<[string, number]>) {
    for (const [key, id] of edits) {
      const [x, y, z] = key.split(',').map(Number);
      if (x !== undefined && y !== undefined && z !== undefined) this.edit(x, y, z, id);
    }
  }
}
