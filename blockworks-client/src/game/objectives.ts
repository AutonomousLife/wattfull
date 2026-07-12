import { BlockId, ItemId } from "../world/blocks";

export const OBJECTIVES = [
  'Gather a log',
  'Make planks',
  'Make a wooden pickaxe',
  'Mine cobblestone',
  'Make a stone pickaxe',
  'Mine 3 voltaic crystal',
  'Craft the voltaic core',
  'Repair the tower',
] as const;

export function objectiveSatisfied(index: number, event: { kind: string; id: number }, count: (id: number) => number) {
  switch (index) {
    case 0: return event.kind === 'pickup' && event.id === BlockId.Log;
    case 1: return event.kind === 'craft' && event.id === BlockId.Planks;
    case 2: return event.kind === 'craft' && event.id === ItemId.WoodPickaxe;
    case 3: return event.kind === 'pickup' && event.id === BlockId.Cobblestone;
    case 4: return event.kind === 'craft' && event.id === ItemId.StonePickaxe;
    case 5: return count(ItemId.Crystal) >= 3;
    case 6: return event.kind === 'craft' && event.id === BlockId.Beacon;
    case 7: return event.kind === 'repair';
    default: return false;
  }
}
