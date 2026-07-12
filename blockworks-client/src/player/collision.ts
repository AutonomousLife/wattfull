import type { Vec3 } from "../shared/types";
export const PLAYER_WIDTH=.6,PLAYER_HEIGHT=1.8,EYE_HEIGHT=1.62;
export type AABB={min:Vec3;max:Vec3};
export const playerAABB=(p:Vec3):AABB=>({min:{x:p.x-PLAYER_WIDTH/2,y:p.y,z:p.z-PLAYER_WIDTH/2},max:{x:p.x+PLAYER_WIDTH/2,y:p.y+PLAYER_HEIGHT,z:p.z+PLAYER_WIDTH/2}});
export function overlapsBlock(box:AABB,x:number,y:number,z:number){return box.max.x>x&&box.min.x<x+1&&box.max.y>y&&box.min.y<y+1&&box.max.z>z&&box.min.z<z+1;}
export function collides(box:AABB,isSolid:(x:number,y:number,z:number)=>boolean){for(let y=Math.floor(box.min.y);y<=Math.floor(box.max.y-.0001);y++)for(let z=Math.floor(box.min.z);z<=Math.floor(box.max.z-.0001);z++)for(let x=Math.floor(box.min.x);x<=Math.floor(box.max.x-.0001);x++)if(isSolid(x,y,z))return true;return false;}
export function moveAxis(position:Vec3,axis:keyof Vec3,amount:number,isSolid:(x:number,y:number,z:number)=>boolean){
  if(!amount)return false;const steps=Math.max(1,Math.ceil(Math.abs(amount)/.08)),step=amount/steps;for(let i=0;i<steps;i++){position[axis]+=step;if(collides(playerAABB(position),isSolid)){position[axis]-=step;return true;}}return false;
}
