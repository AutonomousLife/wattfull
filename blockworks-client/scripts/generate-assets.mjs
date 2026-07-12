import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(root,'public/assets');mkdirSync(out,{recursive:true});
const S=16,C=4,png=new PNG({width:S*C,height:S*C});
const palettes=[['#789e58','#96bd6a','#56753f'],['#648d49','#7dac55','#775137'],['#765239','#8d6545','#5f402d'],['#677477','#879396','#4f5b60'],['#c5a866','#dbc27b','#a88d52'],['#2d7587','#3e96a8','#235b69'],['#875a31','#a9773f','#684226'],['#9a6b3b','#c18a4d','#6d4729'],['#3f754c','#57905e','#2f5c3b'],['#59666a','#6f7b7c','#252a2c'],['#53666d','#4dc4d1','#b9fbff'],['#8a5e38','#b47b45','#67432b'],['#616d70','#7c898a','#475255'],['#765137','#a77245','#4c3325'],['#8c6636','#f0bb61','#4b3420'],['#385e67','#71d9de','#d6ffff']];
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5),16),255];
let state=1337;const rand=()=>((state=Math.imul(state^state>>>15,1|state))>>>0)/4294967296;
for(let t=0;t<16;t++){const pal=palettes[t];for(let y=0;y<S;y++)for(let x=0;x<S;x++){let pick=rand()>.78?1:rand()<.14?2:0;if(t===1&&y<4)pick=1;if(t===6&&x%5===0)pick=1;if(t===7&&(x-8)**2+(y-8)**2<20)pick=1;if(t===9&&rand()>.86)pick=2;if(t===10&&((x+y*2)%11<2))pick=1;if(t===11&&y%5===0)pick=1;if(t===12&&((x+y)%7===0))pick=1;if(t===13&&(x%7===0||y%7===0))pick=2;if(t===14&&x>6&&x<10)pick=1;if(t===15&&(x===7||x===8||y===7||y===8))pick=2;const c=hex(pal[pick]);const p=((t%C*S+x)+(Math.floor(t/C)*S+y)*png.width)*4;for(let i=0;i<4;i++)png.data[p+i]=c[i];}}
writeFileSync(resolve(out,'atlas.png'),PNG.sync.write(png));
