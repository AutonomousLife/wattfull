import type { Footstep } from "../world/blocks";
export class AudioSystem{
  private ctx?:AudioContext;private gain?:GainNode;
  constructor(private volume:()=>number){}
  start(){if(this.ctx)return;this.ctx=new AudioContext();this.gain=this.ctx.createGain();this.gain.gain.value=this.volume();this.gain.connect(this.ctx.destination);}
  updateVolume(){if(this.gain)this.gain.gain.value=this.volume();}
  private tone(freq:number,duration=.08,type:OscillatorType='triangle',gain=.07,slide=0){this.start();const c=this.ctx!,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq*(.96+Math.random()*.08),c.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),c.currentTime+duration);g.gain.setValueAtTime(gain,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);o.connect(g);g.connect(this.gain!);o.start();o.stop(c.currentTime+duration);}
  footstep(type:Footstep){const f={grass:120,stone:190,wood:150,sand:85,water:70}[type];this.tone(f,.055,'triangle',.025,-25);}
  jump(){this.tone(180,.1,'sine',.04,80);}land(){this.tone(90,.12,'triangle',.055,-40);}mine(){this.tone(210,.05,'square',.025,-60);}break(){this.tone(105,.14,'sawtooth',.05,-60);}place(){this.tone(140,.08,'triangle',.04,-25);}pickup(){this.tone(430,.09,'sine',.04,280);}craft(){this.tone(340,.12,'triangle',.04,220);}click(){this.tone(280,.035,'sine',.02,50);}damage(){this.tone(110,.16,'sawtooth',.07,-55);}beacon(){this.tone(220,.7,'sine',.07,660);setTimeout(()=>this.tone(440,.7,'sine',.05,440),180);}
}
