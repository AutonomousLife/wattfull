import * as THREE from "three";
import { BLOCKS, BlockId } from "./blocks";
import type { Chunk, World } from "./World";
import { CHUNK_SIZE, WORLD_HEIGHT } from "./coords";

const faces=[
  {n:[1,0,0],v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],shade:.82,side:1},
  {n:[-1,0,0],v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],shade:.7,side:1},
  {n:[0,1,0],v:[[0,1,0],[0,1,1],[1,1,1],[1,1,0]],shade:1,side:0},
  {n:[0,-1,0],v:[[0,0,1],[0,0,0],[1,0,0],[1,0,1]],shade:.55,side:2},
  {n:[0,0,1],v:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]],shade:.78,side:1},
  {n:[0,0,-1],v:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]],shade:.66,side:1},
] as const;
function textureFor(id:number,side:number){const t=BLOCKS[id]!.texture;return Array.isArray(t)?t[side]!:t;}
function uvFor(tile:number){const col=tile%4,row=Math.floor(tile/4),e=.5/64;return [[col/4+e,1-(row+1)/4+e],[col/4+e,1-row/4-e],[(col+1)/4-e,1-row/4-e],[(col+1)/4-e,1-(row+1)/4+e]];}
function geometry(world:World,chunk:Chunk,transparent:boolean){const pos:number[]=[],nor:number[]=[],uv:number[]=[],colors:number[]=[],idx:number[]=[];let vi=0;
  for(let y=0;y<WORLD_HEIGHT;y++)for(let z=0;z<CHUNK_SIZE;z++)for(let x=0;x<CHUNK_SIZE;x++){const wx=chunk.cx*16+x,wz=chunk.cz*16+z,id=world.get(wx,y,wz),def=BLOCKS[id];if(!def||id===BlockId.Air||def.transparent!==transparent)continue;
    for(const f of faces){const nx=wx+f.n[0],ny=y+f.n[1],nz=wz+f.n[2],neighbor=BLOCKS[world.get(nx,ny,nz)]!;if(neighbor.solid&&!neighbor.transparent)continue;if(transparent&&neighbor.id===id)continue;const tile=textureFor(id,f.side),tuv=uvFor(tile);for(let i=0;i<4;i++){const v=f.v[i]!;pos.push(x+v[0],y+v[1],z+v[2]);nor.push(...f.n);uv.push(...tuv[i]!);colors.push(f.shade,f.shade,f.shade);}idx.push(vi,vi+1,vi+2,vi,vi+2,vi+3);vi+=4;}
  }const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(idx);g.computeBoundingSphere();return g;}
export const meshChunk=(world:World,chunk:Chunk,opaqueMat:THREE.Material,transparentMat:THREE.Material)=>({opaque:new THREE.Mesh(geometry(world,chunk,false),opaqueMat),transparent:new THREE.Mesh(geometry(world,chunk,true),transparentMat)});
