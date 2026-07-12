import type { SaveData, Settings } from "../shared/types";
export const DEFAULT_SETTINGS:Settings={renderDistance:6,fov:75,sensitivity:.0022,headBob:true,shadows:false,volume:.55,objectives:true};
export function validateSave(value:unknown):value is SaveData{if(!value||typeof value!=='object')return false;const s=value as Partial<SaveData>;return s.version===1&&typeof s.seed==='number'&&typeof s.name==='string'&&Array.isArray(s.edits)&&Array.isArray(s.inventory)&&typeof s.health==='number'&&!!s.player&&!!s.spawn;}
export function serializeSave(save:SaveData){return JSON.stringify(save);}
export function deserializeSave(text:string):SaveData|null{try{const v=JSON.parse(text);return validateSave(v)?v:null;}catch{return null;}}
