import type { Vec3 } from "../shared/types";

export type VoxelHit={block:Vec3;normal:Vec3;adjacent:Vec3;distance:number};
export function raycastVoxel(origin:Vec3,direction:Vec3,maxDistance:number,isSolid:(x:number,y:number,z:number)=>boolean):VoxelHit|null{
  let x=Math.floor(origin.x),y=Math.floor(origin.y),z=Math.floor(origin.z);
  const sx=Math.sign(direction.x),sy=Math.sign(direction.y),sz=Math.sign(direction.z);
  const dx=direction.x===0?Infinity:Math.abs(1/direction.x),dy=direction.y===0?Infinity:Math.abs(1/direction.y),dz=direction.z===0?Infinity:Math.abs(1/direction.z);
  let tx=direction.x===0?Infinity:((sx>0?x+1-origin.x:origin.x-x)*dx);
  let ty=direction.y===0?Infinity:((sy>0?y+1-origin.y:origin.y-y)*dy);
  let tz=direction.z===0?Infinity:((sz>0?z+1-origin.z:origin.z-z)*dz);
  let distance=0,normal={x:0,y:0,z:0};
  while(distance<=maxDistance){
    if(isSolid(x,y,z)){const block={x,y,z};return{block,normal,adjacent:{x:x+normal.x,y:y+normal.y,z:z+normal.z},distance};}
    if(tx<ty&&tx<tz){x+=sx;distance=tx;tx+=dx;normal={x:-sx,y:0,z:0};}
    else if(ty<tz){y+=sy;distance=ty;ty+=dy;normal={x:0,y:-sy,z:0};}
    else{z+=sz;distance=tz;tz+=dz;normal={x:0,y:0,z:-sz};}
  }return null;
}
