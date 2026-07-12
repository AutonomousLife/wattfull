export class Input{
  readonly keys=new Set<string>();yaw=0;pitch=0;mine=false;placeRequested=false;jumpQueued=false;wheel=0;
  constructor(private canvas:HTMLCanvasElement,private sensitivity:()=>number){
    addEventListener('keydown',e=>{if(e.repeat&&e.code==='Space')return;this.keys.add(e.code);if(e.code==='Space')this.jumpQueued=true;});
    addEventListener('keyup',e=>this.keys.delete(e.code));
    addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas)return;this.yaw-=e.movementX*this.sensitivity();this.pitch=Math.max(-1.54,Math.min(1.54,this.pitch-e.movementY*this.sensitivity()));});
    addEventListener('mousedown',e=>{if(document.pointerLockElement!==canvas)return;if(e.button===0)this.mine=true;if(e.button===2)this.placeRequested=true;});
    addEventListener('mouseup',e=>{if(e.button===0)this.mine=false;});
    addEventListener('wheel',e=>{if(document.pointerLockElement===canvas)this.wheel+=Math.sign(e.deltaY);},{passive:true});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
  }
  axis(){return{x:Number(this.keys.has('KeyD'))-Number(this.keys.has('KeyA')),z:Number(this.keys.has('KeyW'))-Number(this.keys.has('KeyS'))};}
  consumeJump(){const v=this.jumpQueued;this.jumpQueued=false;return v;}
  consumePlace(){const v=this.placeRequested;this.placeRequested=false;return v;}
  consumeWheel(){const v=this.wheel;this.wheel=0;return v;}
  clear(){this.keys.clear();this.mine=false;this.placeRequested=false;this.jumpQueued=false;}
}
