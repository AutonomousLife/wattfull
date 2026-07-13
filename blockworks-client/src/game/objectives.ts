import { BlockId, ItemId } from "../world/blocks";

export const OBJECTIVES = [
  'Salvage a log from the worksite',
  'Process the log into planks',
  'Build a wooden pickaxe',
  'Break into the quarry stone',
  'Craft a stone pickaxe at the bench',
  'Extract 3 voltaic crystals from the quarry',
  'Assemble a voltaic core at the bench',
  'Install the core and repair the signal tower',
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
