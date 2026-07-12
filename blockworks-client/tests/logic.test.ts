import { describe, expect, it } from "vitest";
import { blockKey, chunkIndex, worldToChunk, worldToLocal } from "../src/world/coords";
import { biomeAt, findSpawn, QUARRY, shouldTree, terrainHeight, WORKSITE } from "../src/world/generator";
import { seedFrom } from "../src/world/noise";
import { World } from "../src/world/World";
import { BlockId, ItemId } from "../src/world/blocks";
import { raycastVoxel } from "../src/world/raycast";
import { moveAxis, overlapsBlock } from "../src/player/collision";
import { Inventory } from "../src/inventory/Inventory";
import { craft, RECIPES } from "../src/crafting/recipes";
import { deserializeSave, serializeSave, validateSave } from "../src/persistence/schema";
import type { SaveData } from "../src/shared/types";
import { completeTowerRepair } from "../src/game/repair";

const DEFAULT_SEED = seedFrom('worksite');

describe("voxel coordinates",()=>{
  it("converts world coordinates to chunks",()=>{expect(worldToChunk(31)).toBe(1);expect(worldToChunk(32)).toBe(2);});
  it("handles negative coordinates",()=>{expect(worldToChunk(-1)).toBe(-1);expect(worldToLocal(-1)).toBe(15);expect(worldToLocal(-17)).toBe(15);});
  it("indexes every chunk cell uniquely",()=>{const seen=new Set<number>();for(let y=0;y<4;y++)for(let z=0;z<16;z++)for(let x=0;x<16;x++)seen.add(chunkIndex(x,y,z));expect(seen.size).toBe(1024);});
});
describe("world generation",()=>{
  it("is deterministic",()=>{const a=Array.from({length:20},(_,i)=>terrainHeight(i*3,i*7,4412));const b=Array.from({length:20},(_,i)=>terrainHeight(i*3,i*7,4412));expect(a).toEqual(b);expect(a).not.toEqual(Array.from({length:20},(_,i)=>terrainHeight(i*3,i*7,9921)));});
  it("applies sparse edits",()=>{const world=new World(12);world.edit(20,30,20,BlockId.Planks);expect(world.get(20,30,20)).toBe(BlockId.Planks);const next=new World(12);next.applyEdits([[blockKey(20,30,20),BlockId.Planks]]);expect(next.get(20,30,20)).toBe(BlockId.Planks);});
  it("keeps the inner worksite level and free of trees",()=>{
    const heights=new Set<number>();
    for(let z=WORKSITE.z-12;z<=WORKSITE.z+12;z++)for(let x=WORKSITE.x-12;x<=WORKSITE.x+12;x++)if(Math.hypot(x-WORKSITE.x,z-WORKSITE.z)<=12){heights.add(terrainHeight(x,z,DEFAULT_SEED));expect(shouldTree(x,z,DEFAULT_SEED)).toBe(false);}
    expect([...heights]).toEqual([WORKSITE.level]);
    const spawn=findSpawn(DEFAULT_SEED);expect(spawn.z).toBeGreaterThan(WORKSITE.z);expect(spawn.y).toBeCloseTo(WORKSITE.level+1.01);
  });
  it("groups trees away from the clearing and exposes a usable crystal seam",()=>{
    const world=new World(DEFAULT_SEED);let trees=0,crystals=0,exposedCrystals=0;
    for(let z=0;z<128;z++)for(let x=0;x<128;x++){if(shouldTree(x,z,DEFAULT_SEED))trees++;for(let y=0;y<64;y++)if(world.get(x,y,z)===BlockId.CrystalOre){crystals++;if(world.get(x,y+1,z)===BlockId.Air)exposedCrystals++;}}
    expect(trees).toBeGreaterThan(20);expect(trees).toBeLessThan(120);expect(crystals).toBeGreaterThan(20);expect(exposedCrystals).toBeGreaterThanOrEqual(3);
    expect(terrainHeight(QUARRY.x,QUARRY.z,DEFAULT_SEED)).toBeLessThan(terrainHeight(QUARRY.x-18,QUARRY.z-18,DEFAULT_SEED));
  });
  it("starts with visible tower damage and records the physical repair",()=>{
    const world=new World(DEFAULT_SEED),{x,z,ground}=world.tower;
    expect(world.get(x+2,ground+6,z+2)).toBe(BlockId.Air);expect(world.get(x,ground+6,z)).toBe(BlockId.Air);
    world.repairTower();expect(world.get(x+2,ground+6,z+2)).toBe(BlockId.Cobblestone);expect(world.get(x,ground+6,z)).toBe(BlockId.Beacon);expect(world.edits.size).toBeGreaterThan(1);
  });
  it("marks both sides of a chunk-boundary edit dirty",()=>{
    const world=new World(DEFAULT_SEED);for(const chunk of world.chunks.values())chunk.dirty=false;
    world.edit(15,35,15,BlockId.Planks);expect(world.getChunk(15,15)?.dirty).toBe(true);expect(world.getChunk(16,15)?.dirty).toBe(true);expect(world.getChunk(15,16)?.dirty).toBe(true);
  });
  it("streams deterministic chunks instead of building the full world at startup",()=>{
    const world=new World(DEFAULT_SEED),initial=world.chunks.size;
    expect(initial).toBeLessThan(16);expect(biomeAt(240,180,DEFAULT_SEED)).toBe(biomeAt(240,180,DEFAULT_SEED));
    world.queueAround(240,180,1);expect(world.pendingGeneration()).toBeGreaterThan(0);world.processGeneration(1);
    expect(world.chunks.size).toBeGreaterThan(initial);expect(world.get(240,terrainHeight(240,180,DEFAULT_SEED),180)).not.toBe(BlockId.Air);
    world.ensureChunk(30,30);world.unloadFar(WORKSITE.x,WORKSITE.z,2);expect(world.getChunk(480,480)).toBeUndefined();
  });
});
describe("targeting and collision",()=>{
  it("uses 3D DDA and returns the placement face",()=>{const hit=raycastVoxel({x:.5,y:.5,z:.5},{x:1,y:0,z:0},5,(x)=>x===3);expect(hit?.block).toEqual({x:3,y:0,z:0});expect(hit?.normal).toEqual({x:-1,y:0,z:0});expect(hit?.adjacent).toEqual({x:2,y:0,z:0});});
  it("detects AABB overlap with a block",()=>{const box={min:{x:.2,y:1,z:.2},max:{x:.8,y:2.8,z:.8}};expect(overlapsBlock(box,0,2,0)).toBe(true);expect(overlapsBlock(box,1,2,0)).toBe(false);});
  it("stops cleanly at a wall without crossing it",()=>{const position={x:.5,y:1,z:.5};expect(moveAxis(position,'x',1,(x)=>x===1)).toBe(true);expect(position.x).toBeLessThan(.71);});
});
describe("inventory and crafting",()=>{
  it("stacks items and fills another slot at the cap",()=>{const inv=new Inventory();inv.add(BlockId.Dirt,70);expect(inv.count(BlockId.Dirt)).toBe(70);expect(inv.slots.filter(Boolean)).toHaveLength(2);});
  it("consumes ingredients atomically",()=>{const inv=new Inventory();inv.add(BlockId.Log,1);const recipe=RECIPES.find(r=>r.id==='planks')!;expect(craft(inv,recipe)).toBe(true);expect(inv.count(BlockId.Log)).toBe(0);expect(inv.count(BlockId.Planks)).toBe(4);expect(craft(inv,RECIPES.find(r=>r.id==='wood-pick')!)).toBe(false);expect(inv.count(ItemId.WoodPickaxe)).toBe(0);});
  it("completes the full tool, crystal, and tower repair progression",()=>{
    const inv=new Inventory(),world=new World(DEFAULT_SEED);inv.add(BlockId.Log,3);
    const recipe=(id:string)=>RECIPES.find(value=>value.id===id)!;
    expect(craft(inv,recipe('planks'))).toBe(true);expect(craft(inv,recipe('planks'))).toBe(true);expect(craft(inv,recipe('planks'))).toBe(true);
    expect(craft(inv,recipe('sticks'))).toBe(true);expect(craft(inv,recipe('wood-pick'))).toBe(true);
    inv.add(BlockId.Cobblestone,9);expect(craft(inv,recipe('stone-pick'),true)).toBe(true);
    inv.add(ItemId.Crystal,3);expect(craft(inv,recipe('core'),true)).toBe(true);
    expect(completeTowerRepair(inv,world)).toBe(true);expect(inv.count(BlockId.Planks)).toBe(3);expect(inv.count(BlockId.Cobblestone)).toBe(0);expect(world.get(world.tower.x,world.tower.ground+6,world.tower.z)).toBe(BlockId.Beacon);
  });
});
describe("save schema",()=>{
  const save:SaveData={version:1,name:'Test',seed:3,edits:[],player:{x:1,y:2,z:3},spawn:{x:1,y:2,z:3},health:20,inventory:Array(27).fill(null),objective:0,completed:false,savedAt:1};
  it("round trips and validates saves",()=>{expect(deserializeSave(serializeSave(save))).toEqual(save);expect(validateSave({...save,version:2})).toBe(false);expect(deserializeSave('{bad')).toBeNull();});
  it("reloads tower progress before and after completion",()=>{
    const world=new World(DEFAULT_SEED);world.edit(70,WORKSITE.level+1,70,BlockId.Planks);
    const progress={...save,seed:DEFAULT_SEED,edits:[...world.edits],objective:4};const progressReload=new World(DEFAULT_SEED);progressReload.applyEdits(deserializeSave(serializeSave(progress))!.edits);expect(progressReload.get(70,WORKSITE.level+1,70)).toBe(BlockId.Planks);
    world.repairTower();const complete={...progress,edits:[...world.edits],objective:8,completed:true};const completeReload=new World(DEFAULT_SEED);completeReload.applyEdits(deserializeSave(serializeSave(complete))!.edits);expect(completeReload.get(completeReload.tower.x,completeReload.tower.ground+6,completeReload.tower.z)).toBe(BlockId.Beacon);
  });
});
