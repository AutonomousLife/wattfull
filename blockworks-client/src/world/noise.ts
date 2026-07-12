export function hash2(x: number, z: number, seed: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(z, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const fade = (t:number) => t*t*(3-2*t);
export function valueNoise(x:number,z:number,seed:number):number {
  const x0=Math.floor(x), z0=Math.floor(z), tx=fade(x-x0), tz=fade(z-z0);
  const a=hash2(x0,z0,seed), b=hash2(x0+1,z0,seed), c=hash2(x0,z0+1,seed), d=hash2(x0+1,z0+1,seed);
  return (a+(b-a)*tx) + ((c+(d-c)*tx)-(a+(b-a)*tx))*tz;
}
export function fbm(x:number,z:number,seed:number):number { let v=0,a=.55,f=.035; for(let i=0;i<4;i++){v+=valueNoise(x*f,z*f,seed+i*97)*a;f*=2;a*=.5;} return v; }
export function seedFrom(value:string|number):number { if(typeof value==='number') return value|0; let h=2166136261; for(const c of value) h=Math.imul(h^c.charCodeAt(0),16777619); return h|0; }
