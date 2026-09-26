import type { SavedBlueprint } from "./blueprint";
import type { SavedBasket } from "./catalogue-tools";

export const MAX_PLAN_FILE_BYTES = 1_048_576;
export interface PlanBundle {basket:SavedBasket|null;blueprint:SavedBlueprint|null;}
interface Validators {basket:(raw:string)=>SavedBasket|null;blueprint:(raw:string)=>SavedBlueprint|null;}

export function decodePlanBundle(raw:string,validators:Validators):{plans:PlanBundle|null;error:string|null} {
  let value:unknown;
  try {value=JSON.parse(raw);} catch {return {plans:null,error:"This file is not valid JSON."};}
  if(typeof value!=="object" || value===null || Array.isArray(value)) return {plans:null,error:"Choose an exported GROUND plans file."};
  const data=value as Record<string,unknown>;
  if(data.product!=="GROUND" || data.kind!=="local-plans-not-holdings" || (data.schemaVersion!==undefined && data.schemaVersion!==1)) return {plans:null,error:"This file is not a supported GROUND plans export."};
  const basket=data.basket==null ? null : validators.basket(JSON.stringify(data.basket));
  const blueprint=data.blueprint==null ? null : validators.blueprint(JSON.stringify(data.blueprint));
  if(data.basket!=null && !basket) return {plans:null,error:"The basket is invalid or includes an unknown asset. No plans were imported."};
  if(data.blueprint!=null && !blueprint) return {plans:null,error:"The Blueprint is invalid or includes an unknown product. No plans were imported."};
  if(!basket && !blueprint) return {plans:null,error:"This export contains no saved plans."};
  return {plans:{basket,blueprint},error:null};
}

interface LocalStoragePort {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void;}
/** Only supplied, validated planning records are replaced; failed writes are rolled back. */
export function storePlanBundle(storage:LocalStoragePort,plans:PlanBundle,keys:{basket:string;blueprint:string}):{ok:boolean;partial:boolean} {
  const entries:Array<[string,string]|undefined> = [plans.basket ? [keys.basket,JSON.stringify(plans.basket)] : undefined,plans.blueprint ? [keys.blueprint,JSON.stringify(plans.blueprint)] : undefined];
  const updates=entries.filter((entry):entry is [string,string]=>entry!==undefined);
  const before=new Map<string,string|null>();
  try {
    for(const [key] of updates) before.set(key,storage.getItem(key));
    for(const [key,value] of updates) {storage.setItem(key,value);if(storage.getItem(key)!==value) throw new Error("Storage did not retain this plan");}
    return {ok:true,partial:false};
  } catch {
    let partial=false;
    for(const [key,value] of before) {
      try { if(value===null) storage.removeItem(key); else storage.setItem(key,value); if(storage.getItem(key)!==value) partial=true; } catch {partial=true;}
    }
    return {ok:false,partial};
  }
}
