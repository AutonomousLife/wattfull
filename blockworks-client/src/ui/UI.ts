import type { Settings } from "../shared/types";
import type { Inventory } from "../inventory/Inventory";
import { ITEM_NAMES, isTool } from "../world/blocks";
import { RECIPES, canCraft } from "../crafting/recipes";
import { OBJECTIVES } from "../game/objectives";

const $=<T extends HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
export class UI{
  onNewWorld:(name:string,seed:string)=>void=()=>{};onContinue:()=>void=()=>{};onResume:()=>void=()=>{};onSave:()=>void=()=>{};onQuit:()=>void=()=>{};onCraft:(id:string)=>void=()=>{};onMoveSlot:(a:number,b:number)=>void=()=>{};onSettings:()=>void=()=>{};
  private active='title';private previous='title';private messageTimer=0;private moving:number|null=null;
  constructor(public settings:Settings){
    $('[id="new-world"]').onclick=()=>this.open('new-dialog');$('#continue').onclick=()=>this.onContinue();$('#resume').onclick=()=>this.onResume();$('#save').onclick=()=>this.onSave();$('#quit').onclick=()=>this.onQuit();
    document.querySelectorAll<HTMLElement>('[data-open]').forEach(b=>b.onclick=()=>this.open(b.dataset.open!));document.querySelectorAll<HTMLElement>('[data-close]').forEach(b=>b.onclick=()=>this.closeOverlay());
    $('form').onsubmit=e=>{e.preventDefault();this.onNewWorld($<HTMLInputElement>('#world-name').value||'Frontier',$<HTMLInputElement>('#world-seed').value);};
    this.bindSetting('render-distance','renderDistance',Number);this.bindSetting('fov','fov',Number);this.bindSetting('sensitivity','sensitivity',v=>Number(v)*.001);this.bindSetting('volume','volume',Number);this.bindCheck('head-bob','headBob');this.bindCheck('objectives','objectives');this.syncSettings();
  }
  private bindSetting(id:string,key:keyof Settings,parse:(v:string)=>number){const el=$<HTMLInputElement>(`#${id}`);el.oninput=()=>{(this.settings[key] as number)=parse(el.value);this.syncSettings();this.onSettings();};}
  private bindCheck(id:string,key:keyof Settings){const el=$<HTMLInputElement>(`#${id}`);el.onchange=()=>{(this.settings[key] as boolean)=el.checked;this.onSettings();};}
  syncSettings(){const s=this.settings;$<HTMLInputElement>('#render-distance').value=String(s.renderDistance);$<HTMLInputElement>('#fov').value=String(s.fov);$<HTMLInputElement>('#sensitivity').value=String(s.sensitivity*1000);$<HTMLInputElement>('#volume').value=String(s.volume);$<HTMLInputElement>('#head-bob').checked=s.headBob;$<HTMLInputElement>('#objectives').checked=s.objectives;$('#render-out').textContent=String(s.renderDistance);$('#fov-out').textContent=String(s.fov);$('#objective').style.display=s.objectives?'block':'none';}
  setContinue(enabled:boolean){$<HTMLButtonElement>('#continue').disabled=!enabled;$('#delete-world').hidden=!enabled;}
  showTitle(){this.hideAll();this.open('title');$('#hud').hidden=true;}
  showGame(){this.hideAll();$('#hud').hidden=false;this.active='game';}
  pause(){this.open('pause');}
  inventory(inventory:Inventory,nearBench:boolean){this.renderInventory(inventory,nearBench);this.open('inventory');}
  closeOverlay(){if(this.active==='completion'){this.onResume();return;}if(['settings','controls','new-dialog'].includes(this.active)){const target=this.previous==='pause'?'pause':'title';this.open(target);return;}this.onResume();}
  open(id:string){if(id!==this.active)this.previous=this.active;this.hideAll();const el=$(`#${id}`);el.classList.add('active');this.active=id;}
  hideAll(){document.querySelectorAll('.screen').forEach(e=>e.classList.remove('active'));}
  isMenu(){return this.active!=='game';}
  renderHUD(inventory:Inventory,health:number,objective:number,completed:boolean){
    $('#health').textContent=`${'◆'.repeat(Math.ceil(health/2))}${'◇'.repeat(10-Math.ceil(health/2))}`;$('#objective-text').textContent=completed?'Expedition complete · build freely':OBJECTIVES[objective]??'Explore freely';
    const bar=$('#hotbar');bar.innerHTML='';for(let i=0;i<9;i++)bar.append(this.slot(inventory,i,i===inventory.selected,false));
  }
  renderInventory(inventory:Inventory,nearBench:boolean){const grid=$('#inventory-grid');grid.innerHTML='';inventory.slots.forEach((_,i)=>{const el=this.slot(inventory,i,false,true);el.onclick=()=>{if(this.moving===null){this.moving=i;el.classList.add('selected');}else{this.onMoveSlot(this.moving,i);this.moving=null;this.renderInventory(inventory,nearBench);}};grid.append(el);});const recipes=$('#recipes');recipes.innerHTML='';for(const recipe of RECIPES){const button=document.createElement('button');button.className='recipe';button.disabled=!canCraft(inventory,recipe,nearBench);button.innerHTML=`<b>${recipe.name}</b><span>×${recipe.output.count}</span><small>${recipe.ingredients.map(i=>`${inventory.count(i.id)}/${i.count} ${ITEM_NAMES[i.id]}`).join(' · ')}${recipe.bench?' · BENCH':''}</small>`;button.onclick=()=>this.onCraft(recipe.id);recipes.append(button);}}
  private slot(inventory:Inventory,i:number,selected=false,title=false){const button=document.createElement('button'),s=inventory.slots[i];button.className='slot'+(selected?' selected':'');button.title=s?ITEM_NAMES[s.id]??'Unknown item':`Empty slot ${i+1}`;button.innerHTML=s?`<b>${(ITEM_NAMES[s.id]??'?').split(' ').map(w=>w[0]).join('').slice(0,3)}</b><span class="count">${s.count>1?s.count:''}</span>${isTool(s.id)?`<span class="durability"><i style="width:${Math.max(0,(s.durability??0)/(s.id===110?45:110)*100)}%"></i></span>`:''}`:'';if(title&&s)button.setAttribute('aria-label',`${ITEM_NAMES[s.id]} ${s.count}`);return button;}
  mining(progress:number){const el=$('#mine-progress');el.style.opacity=progress>0?'1':'0';el.querySelector<HTMLElement>('i')!.style.width=`${Math.min(100,progress*100)}%`;}
  message(text:string){const el=$('#message');el.textContent=text;el.style.opacity='1';clearTimeout(this.messageTimer);this.messageTimer=window.setTimeout(()=>el.style.opacity='0',1800);}
  damage(){const el=$('#damage');el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),140);}
  complete(){this.open('completion');}
  debug(text:string,show:boolean){const el=$('#debug');el.hidden=!show;el.textContent=text;}
}
