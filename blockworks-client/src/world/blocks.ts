export enum BlockId {
  Air, Grass, Dirt, Stone, Sand, Water, Log, Leaves, CoalOre, CrystalOre,
  Planks, Cobblestone, CraftingBench, Torch, Beacon,
}

export type ToolCategory = "none" | "pickaxe" | "axe";
export type Footstep = "grass" | "stone" | "wood" | "sand" | "water";

export type BlockDefinition = {
  id: BlockId;
  name: string;
  solid: boolean;
  transparent: boolean;
  hardness: number;
  tool: ToolCategory;
  tier: number;
  drop: number;
  texture: number | [number, number, number];
  footstep: Footstep;
  light: boolean;
  placeable: boolean;
};

const b = (id: BlockId, name: string, solid: boolean, transparent: boolean, hardness: number, tool: ToolCategory, tier: number, drop: number, texture: number | [number, number, number], footstep: Footstep, light=false, placeable=true): BlockDefinition => ({ id, name, solid, transparent, hardness, tool, tier, drop, texture, footstep, light, placeable });

export const BLOCKS: Record<number, BlockDefinition> = {
  [BlockId.Air]: b(BlockId.Air,"Air",false,true,0,"none",0,0,0,"grass",false,false),
  [BlockId.Grass]: b(BlockId.Grass,"Grass",true,false,.65,"none",0,BlockId.Dirt,[0,1,2],"grass"),
  [BlockId.Dirt]: b(BlockId.Dirt,"Dirt",true,false,.55,"none",0,BlockId.Dirt,2,"grass"),
  [BlockId.Stone]: b(BlockId.Stone,"Stone",true,false,2.8,"pickaxe",1,BlockId.Cobblestone,3,"stone"),
  [BlockId.Sand]: b(BlockId.Sand,"Sand",true,false,.5,"none",0,BlockId.Sand,4,"sand"),
  [BlockId.Water]: b(BlockId.Water,"Water",false,true,0,"none",0,0,5,"water",false,false),
  [BlockId.Log]: b(BlockId.Log,"Wood Log",true,false,1.25,"axe",0,BlockId.Log,[6,7,7],"wood"),
  [BlockId.Leaves]: b(BlockId.Leaves,"Leaves",true,true,.25,"none",0,0,8,"grass",false,false),
  [BlockId.CoalOre]: b(BlockId.CoalOre,"Coal Ore",true,false,3,"pickaxe",1,101,9,"stone"),
  [BlockId.CrystalOre]: b(BlockId.CrystalOre,"Crystal Ore",true,false,4,"pickaxe",2,102,10,"stone",true),
  [BlockId.Planks]: b(BlockId.Planks,"Wood Planks",true,false,1,"axe",0,BlockId.Planks,11,"wood"),
  [BlockId.Cobblestone]: b(BlockId.Cobblestone,"Cobblestone",true,false,2.2,"pickaxe",1,BlockId.Cobblestone,12,"stone"),
  [BlockId.CraftingBench]: b(BlockId.CraftingBench,"Crafting Bench",true,false,1.5,"axe",0,BlockId.CraftingBench,13,"wood"),
  [BlockId.Torch]: b(BlockId.Torch,"Torch",false,true,.1,"none",0,BlockId.Torch,14,"wood",true),
  [BlockId.Beacon]: b(BlockId.Beacon,"Blockworks Beacon",true,true,2,"pickaxe",1,BlockId.Beacon,15,"stone",true),
};

export enum ItemId { Stick=100, Coal=101, Crystal=102, WoodPickaxe=110, StonePickaxe=111 }
export const ITEM_NAMES: Record<number,string> = {
  ...Object.fromEntries(Object.values(BLOCKS).map(v => [v.id, v.name])),
  [ItemId.Stick]: "Stick", [ItemId.Coal]: "Coal", [ItemId.Crystal]: "Crystal",
  [ItemId.WoodPickaxe]: "Wooden Pickaxe", [ItemId.StonePickaxe]: "Stone Pickaxe",
};
export const MAX_STACK = 64;
export const isTool = (id: number) => id === ItemId.WoodPickaxe || id === ItemId.StonePickaxe;
export const toolTier = (id: number) => id === ItemId.StonePickaxe ? 2 : id === ItemId.WoodPickaxe ? 1 : 0;
