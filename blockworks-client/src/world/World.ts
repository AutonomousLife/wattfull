import { BlockId, BLOCKS } from "./blocks";
import { baseBlock, shouldTree, terrainHeight } from "./generator";
import { blockKey, chunkIndex, chunkKey, CHUNK_SIZE, WORLD_HEIGHT, WORLD_SIZE } from "./coords";

export type Chunk = { cx:number; cz:number; data:Uint8Array; dirty:boolean };
export class World {
  readonly chunks=new Map<string,Chunk>(); readonly edits=new Map<string,number>();
  constructor(public readonly seed:number){ this.generate(); }
  private generate(){
    for(let cz=0;cz<WORLD_SIZE/CHUNK_SIZE;cz++) for(let cx=0;cx<WORLD_SIZE/CHUNK_SIZE;cx++){
      const data=new Uint8Array(CHUNK_SIZE*CHUNK_SIZE*WORLD_HEIGHT);
      for(let y=0;y<WORLD_HEIGHT;y++) for(let z=0;z<CHUNK_SIZE;z++) for(let x=0;x<CHUNK_SIZE;x++) data[chunkIndex(x,y,z)]=baseBlock(cx*CHUNK_SIZE+x,y,cz*CHUNK_SIZE+z,this.seed);
      this.chunks.set(chunkKey(cx,cz),{cx,cz,data,dirty:true});
    }
    for(let z=3;z<WORLD_SIZE-3;z++) for(let x=3;x<WORLD_SIZE-3;x++) if(shouldTree(x,z,this.seed)) this.addTree(x,terrainHeight(x,z,this.seed)+1,z);
  }
  private addTree(x:number,y:number,z:number){ for(let i=0;i<4;i++)this.setRaw(x,y+i,z,BlockId.Log); for(let dy=2;dy<6;dy++)for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dz)+(dy===5?1:0)<=3)this.setRaw(x+dx,y+dy,z+dz,BlockId.Leaves); }
  private setRaw(x:number,y:number,z:number,id:number){ const c=this.getChunk(x,z);if(c&&y>=0&&y<WORLD_HEIGHT)c.data[chunkIndex(((x%16)+16)%16,y,((z%16)+16)%16)]=id; }
  getChunk(x:number,z:number){return this.chunks.get(chunkKey(Math.floor(x/CHUNK_SIZE),Math.floor(z/CHUNK_SIZE)));}
  get(x:number,y:number,z:number):number { if(y<0)return BlockId.Stone;if(y>=WORLD_HEIGHT)return BlockId.Air;const c=this.getChunk(x,z);return c?c.data[chunkIndex(((x%16)+16)%16,y,((z%16)+16)%16) ]??BlockId.Air:BlockId.Water; }
  isSolid(x:number,y:number,z:number){return BLOCKS[this.get(x,y,z)]?.solid??false;}
  edit(x:number,y:number,z:number,id:number){ if(y<0||y>=WORLD_HEIGHT)return;const c=this.getChunk(x,z);if(!c)return;c.data[chunkIndex(((x%16)+16)%16,y,((z%16)+16)%16)]=id;c.dirty=true;this.edits.set(blockKey(x,y,z),id);const lx=((x%16)+16)%16,lz=((z%16)+16)%16;const mark=(chunk:Chunk|undefined)=>{if(chunk)chunk.dirty=true;};if(lx===0)mark(this.getChunk(x-1,z));if(lx===15)mark(this.getChunk(x+1,z));if(lz===0)mark(this.getChunk(x,z-1));if(lz===15)mark(this.getChunk(x,z+1));}
  applyEdits(edits:Iterable<[string,number]>){for(const [key,id]of edits){const [x,y,z]=key.split(',').map(Number);if(x!==undefined&&y!==undefined&&z!==undefined)this.edit(x,y,z,id);}}
}
