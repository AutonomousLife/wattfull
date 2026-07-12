import { BlockId, ItemId } from "../world/blocks";
export const OBJECTIVES=[
  'Collect a wood log', 'Craft wood planks', 'Craft a wooden pickaxe', 'Mine cobblestone',
  'Craft a stone pickaxe', 'Find and mine 3 crystal', 'Craft the Blockworks Beacon', 'Place the beacon',
] as const;
export function objectiveSatisfied(index:number,event:{kind:string;id:number},count:(id:number)=>number){switch(index){case 0:return event.kind==='pickup'&&event.id===BlockId.Log;case 1:return event.kind==='craft'&&event.id===BlockId.Planks;case 2:return event.kind==='craft'&&event.id===ItemId.WoodPickaxe;case 3:return event.kind==='pickup'&&event.id===BlockId.Cobblestone;case 4:return event.kind==='craft'&&event.id===ItemId.StonePickaxe;case 5:return count(ItemId.Crystal)>=3;case 6:return event.kind==='craft'&&event.id===BlockId.Beacon;case 7:return event.kind==='place'&&event.id===BlockId.Beacon;default:return false;}}
