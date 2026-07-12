import { Inventory } from "../inventory/Inventory";
import { BlockId, ItemId } from "../world/blocks";

export type Recipe = {
  id: string;
  name: string;
  output: { id: number; count: number; durability?: number };
  ingredients: Array<{ id: number; count: number }>;
  bench?: boolean;
};

export const RECIPES: Recipe[] = [
  { id: 'planks', name: 'Planks', output: { id: BlockId.Planks, count: 4 }, ingredients: [{ id: BlockId.Log, count: 1 }] },
  { id: 'sticks', name: 'Sticks', output: { id: ItemId.Stick, count: 4 }, ingredients: [{ id: BlockId.Planks, count: 2 }] },
  { id: 'wood-pick', name: 'Wooden Pickaxe', output: { id: ItemId.WoodPickaxe, count: 1, durability: 45 }, ingredients: [{ id: BlockId.Planks, count: 3 }, { id: ItemId.Stick, count: 2 }] },
  { id: 'stone-pick', name: 'Stone Pickaxe', output: { id: ItemId.StonePickaxe, count: 1, durability: 110 }, ingredients: [{ id: BlockId.Cobblestone, count: 3 }, { id: ItemId.Stick, count: 2 }], bench: true },
  { id: 'core', name: 'Voltaic Core', output: { id: BlockId.Beacon, count: 1 }, ingredients: [{ id: ItemId.Crystal, count: 3 }], bench: true },
];

export const canCraft = (inventory: Inventory, recipe: Recipe, nearBench = true) =>
  (!recipe.bench || nearBench) && recipe.ingredients.every(item => inventory.count(item.id) >= item.count);

export function craft(inventory: Inventory, recipe: Recipe, nearBench = true) {
  if (!canCraft(inventory, recipe, nearBench)) return false;
  for (const item of recipe.ingredients) inventory.remove(item.id, item.count);
  inventory.add(recipe.output.id, recipe.output.count, recipe.output.durability);
  return true;
}
