import { BlockId } from "./blocks";
import { WORLD_HEIGHT, WORLD_SIZE } from "./coords";
import { fbm, hash2 } from "./noise";

export const SEA_LEVEL = 24;
export function terrainHeight(x:number,z:number,seed:number):number {
  const edge=Math.min(x,z,WORLD_SIZE-1-x,WORLD_SIZE-1-z);
  const island=Math.max(0,Math.min(1,edge/14));
  return Math.floor(19 + island*5 + fbm(x,z,seed)*12);
}
export function baseBlock(x:number,y:number,z:number,seed:number):BlockId {
  if(x<0||z<0||x>=WORLD_SIZE||z>=WORLD_SIZE||y<0||y>=WORLD_HEIGHT) return y<=SEA_LEVEL?BlockId.Water:BlockId.Air;
  const h=terrainHeight(x,z,seed);
  if(y>h) return y<=SEA_LEVEL?BlockId.Water:BlockId.Air;
  if(y===h) return h<=SEA_LEVEL+1?BlockId.Sand:BlockId.Grass;
  if(y>h-3) return h<=SEA_LEVEL+1?BlockId.Sand:BlockId.Dirt;
  const ore=hash2(x*3+y,z*5-y,seed);
  if(y<20&&ore>.992) return BlockId.CrystalOre;
  if(y<30&&ore>.965) return BlockId.CoalOre;
  return BlockId.Stone;
}
export function shouldTree(x:number,z:number,seed:number):boolean {
  if(x<4||z<4||x>=WORLD_SIZE-4||z>=WORLD_SIZE-4) return false;
  const h=terrainHeight(x,z,seed); return h>SEA_LEVEL+1 && hash2(x,z,seed+420)>.982;
}
export function findSpawn(seed:number){
  const c=Math.floor(WORLD_SIZE/2);
  for(let r=0;r<22;r++) for(let x=c-r;x<=c+r;x++) for(const z of [c-r,c+r]) { const y=terrainHeight(x,z,seed); if(y>SEA_LEVEL+1&&!shouldTree(x,z,seed)) return {x:x+.5,y:y+1.01,z:z+.5}; }
  return {x:c+.5,y:terrainHeight(c,c,seed)+1.01,z:c+.5};
}
