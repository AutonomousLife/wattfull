import type { Inventory } from "../inventory/Inventory";
import type { World } from "../world/World";
import { BlockId } from "../world/blocks";

export const TOWER_REPAIR = {
  planks: 4,
  cobblestone: 6,
  cores: 1,
} as const;

export function canRepairTower(inventory: Inventory) {
  return inventory.count(BlockId.Planks) >= TOWER_REPAIR.planks
    && inventory.count(BlockId.Cobblestone) >= TOWER_REPAIR.cobblestone
    && inventory.count(BlockId.Beacon) >= TOWER_REPAIR.cores;
}

export function completeTowerRepair(inventory: Inventory, world: World) {
  if (!canRepairTower(inventory)) return false;
  inventory.remove(BlockId.Planks, TOWER_REPAIR.planks);
  inventory.remove(BlockId.Cobblestone, TOWER_REPAIR.cobblestone);
  inventory.remove(BlockId.Beacon, TOWER_REPAIR.cores);
  world.repairTower();
  return true;
}
