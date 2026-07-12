import { isTool, MAX_STACK } from "../world/blocks";
import type { ItemStack } from "../shared/types";
export class Inventory{
  readonly slots:ItemStack[];
  selected=0;
  constructor(size=27,slots?:ItemStack[]){this.slots=Array.from({length:size},(_,i)=>slots?.[i]?{...slots[i]!}:null);}
  count(id:number){return this.slots.reduce((n,s)=>n+(s?.id===id?s.count:0),0);}
  add(id:number,count=1,durability?:number){let left=count;if(!isTool(id))for(const s of this.slots)if(s?.id===id&&s.count<MAX_STACK){const n=Math.min(left,MAX_STACK-s.count);s.count+=n;left-=n;if(!left)return 0;}for(let i=0;i<this.slots.length&&left;i++)if(!this.slots[i]){const n=isTool(id)?1:Math.min(left,MAX_STACK);this.slots[i]={id,count:n,durability};left-=n;}return left;}
  remove(id:number,count:number){if(this.count(id)<count)return false;let left=count;for(let i=this.slots.length-1;i>=0&&left;i--){const s=this.slots[i];if(s?.id===id){const n=Math.min(left,s.count);s.count-=n;left-=n;if(!s.count)this.slots[i]=null;}}return true;}
  consumeSelected(){const s=this.slots[this.selected];if(!s)return false;s.count--;if(!s.count)this.slots[this.selected]=null;return true;}
  damageSelected(amount=1){const s=this.slots[this.selected];if(!s||!isTool(s.id))return;s.durability=(s.durability??1)-amount;if(s.durability<=0)this.slots[this.selected]=null;}
  move(from:number,to:number){if(from===to)return;const a=this.slots[from]??null,b=this.slots[to]??null;if(a&&b&&a.id===b.id&&!isTool(a.id)){const n=Math.min(a.count,MAX_STACK-b.count);b.count+=n;a.count-=n;if(!a.count)this.slots[from]=null;}else{this.slots[from]=b;this.slots[to]=a;}}
  serialize(){return this.slots.map(s=>s?{...s}:null);}
}
