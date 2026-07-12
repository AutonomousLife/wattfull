import type { SaveData, Settings } from "../shared/types";
import { DEFAULT_SETTINGS, validateSave } from "./schema";
const DB='blockworks',STORE='data';
const open=()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
async function get<T>(key:string):Promise<T|undefined>{const db=await open();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).get(key);r.onsuccess=()=>resolve(r.result as T|undefined);r.onerror=()=>reject(r.error);});}
async function put(key:string,value:unknown){const db=await open();return new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
export const loadSave=async()=>{const value=await get<unknown>('world');return validateSave(value)?value:null;};
export const saveWorld=(save:SaveData)=>put('world',save);
export const deleteWorld=async()=>{const db=await open();return new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete('world');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});};
export const loadSettings=async():Promise<Settings>=>({...DEFAULT_SETTINGS,...await get<Partial<Settings>>('settings')});
export const saveSettings=(settings:Settings)=>put('settings',settings);
