import { describe, expect, it } from "vitest";
import { blockKey, chunkIndex, worldToChunk, worldToLocal } from "../src/world/coords";
import { terrainHeight } from "../src/world/generator";
import { World } from "../src/world/World";
import { BlockId, ItemId } from "../src/world/blocks";
import { raycastVoxel } from "../src/world/raycast";
import { overlapsBlock } from "../src/player/collision";
import { Inventory } from "../src/inventory/Inventory";
import { craft, RECIPES } from "../src/crafting/recipes";
import { deserializeSave, serializeSave, validateSave } from "../src/persistence/schema";
import type { SaveData } from "../src/shared/types";

describe("voxel coordinates",()=>{
  it("converts world coordinates to chunks",()=>{expect(worldToChunk(31)).toBe(1);expect(worldToChunk(32)).toBe(2);});
  it("handles negative coordinates",()=>{expect(worldToChunk(-1)).toBe(-1);expect(worldToLocal(-1)).toBe(15);expect(worldToLocal(-17)).toBe(15);});
  it("indexes every chunk cell uniquely",()=>{const seen=new Set<number>();for(let y=0;y<4;y++)for(let z=0;z<16;z++)for(let x=0;x<16;x++)seen.add(chunkIndex(x,y,z));expect(seen.size).toBe(1024);});
});
describe("world generation",()=>{
  it("is deterministic",()=>{const a=Array.from({length:20},(_,i)=>terrainHeight(i*3,i*7,4412));const b=Array.from({length:20},(_,i)=>terrainHeight(i*3,i*7,4412));expect(a).toEqual(b);expect(a).not.toEqual(Array.from({length:20},(_,i)=>terrainHeight(i*3,i*7,9921)));});
  it("applies sparse edits",()=>{const world=new World(12);world.edit(20,30,20,BlockId.Planks);expect(world.get(20,30,20)).toBe(BlockId.Planks);const next=new World(12);next.applyEdits([[blockKey(20,30,20),BlockId.Planks]]);expect(next.get(20,30,20)).toBe(BlockId.Planks);});
});
describe("targeting and collision",()=>{
  it("uses 3D DDA and returns the placement face",()=>{const hit=raycastVoxel({x:.5,y:.5,z:.5},{x:1,y:0,z:0},5,(x)=>x===3);expect(hit?.block).toEqual({x:3,y:0,z:0});expect(hit?.normal).toEqual({x:-1,y:0,z:0});expect(hit?.adjacent).toEqual({x:2,y:0,z:0});});
  it("detects AABB overlap with a block",()=>{const box={min:{x:.2,y:1,z:.2},max:{x:.8,y:2.8,z:.8}};expect(overlapsBlock(box,0,2,0)).toBe(true);expect(overlapsBlock(box,1,2,0)).toBe(false);});
});
describe("inventory and crafting",()=>{
  it("stacks items and fills another slot at the cap",()=>{const inv=new Inventory();inv.add(BlockId.Dirt,70);expect(inv.count(BlockId.Dirt)).toBe(70);expect(inv.slots.filter(Boolean)).toHaveLength(2);});
  it("consumes ingredients atomically",()=>{const inv=new Inventory();inv.add(BlockId.Log,1);const recipe=RECIPES.find(r=>r.id==='planks')!;expect(craft(inv,recipe)).toBe(true);expect(inv.count(BlockId.Log)).toBe(0);expect(inv.count(BlockId.Planks)).toBe(4);expect(craft(inv,RECIPES.find(r=>r.id==='wood-pick')!)).toBe(false);expect(inv.count(ItemId.WoodPickaxe)).toBe(0);});
});
describe("save schema",()=>{
  const save:SaveData={version:1,name:'Test',seed:3,edits:[],player:{x:1,y:2,z:3},spawn:{x:1,y:2,z:3},health:20,inventory:Array(27).fill(null),objective:0,completed:false,savedAt:1};
  it("round trips and validates saves",()=>{expect(deserializeSave(serializeSave(save))).toEqual(save);expect(validateSave({...save,version:2})).toBe(false);expect(deserializeSave('{bad')).toBeNull();});
});
