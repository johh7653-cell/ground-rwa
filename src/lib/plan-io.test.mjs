import test from "node:test";
import assert from "node:assert/strict";
import {decodePlanBundle,storePlanBundle} from "./plan-io.ts";
import {decodeBasket,prepareBasket,createBasketDraft} from "./catalogue-tools.ts";
import {decodeSavedBlueprint,prepareSavedBlueprint,createDefaultDraft} from "./blueprint.ts";

const exists=slug=>["spyx","nvdax","usdy"].includes(slug);
const validators={basket:raw=>decodeBasket(raw,exists),blueprint:raw=>decodeSavedBlueprint(raw,()=>false)};
const basket=prepareBasket(createBasketDraft(),exists,"2026-09-26T12:00:00Z");
const blueprint=prepareSavedBlueprint(createDefaultDraft(),()=>false);
const bundle={product:"GROUND",schemaVersion:1,kind:"local-plans-not-holdings",basket,blueprint};

test("exported plans validate with real schemas and reject bad weights, unknown assets and other JSON files",()=>{
  assert.deepEqual(decodePlanBundle(JSON.stringify(bundle),validators).plans,{basket,blueprint});
  for(const data of [{assets:[]},{...bundle,schemaVersion:2},{...bundle,basket:{...basket,items:[{slug:"unknown",weightBps:10000}]}},{...bundle,blueprint:{...blueprint,weights:{indices:0,companies:0,gold:0,treasuries:0}}},{...bundle,basket:null,blueprint:null}]) assert.equal(decodePlanBundle(JSON.stringify(data),validators).plans,null);
  assert.equal(decodePlanBundle("not JSON",validators).plans,null);
  assert.deepEqual(decodePlanBundle(JSON.stringify({...bundle,schemaVersion:undefined}),validators).plans,{basket,blueprint});
});

function storage(initial={},failAt=null) {
  const data=new Map(Object.entries(initial));let writes=0;
  return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>{writes++;if(writes===failAt)throw new Error("quota");data.set(key,value);},removeItem:key=>data.delete(key)};
}
const keys={basket:"ground:basket:v1",blueprint:"ground:blueprint:v1"};

test("import only replaces included validated plans and leaves unrelated browser records alone",()=>{
  const port=storage({[keys.blueprint]:"existing-blueprint",unrelated:"keep"});
  assert.deepEqual(storePlanBundle(port,{basket,blueprint:null},keys),{ok:true,partial:false});
  assert.equal(port.getItem(keys.basket),JSON.stringify(basket));
  assert.equal(port.getItem(keys.blueprint),"existing-blueprint");
  assert.equal(port.getItem("unrelated"),"keep");
});

test("failed second import write restores both previous records instead of reporting success",()=>{
  const port=storage({[keys.basket]:"previous-basket",[keys.blueprint]:"previous-blueprint"},2);
  assert.deepEqual(storePlanBundle(port,{basket,blueprint},keys),{ok:false,partial:false});
  assert.equal(port.getItem(keys.basket),"previous-basket");
  assert.equal(port.getItem(keys.blueprint),"previous-blueprint");
});

test("storage that never retains writes is reported as failed without deleting existing plans",()=>{
  const port=storage({[keys.basket]:"previous"});port.setItem=()=>{};
  assert.deepEqual(storePlanBundle(port,{basket,blueprint:null},keys),{ok:false,partial:false});
  assert.equal(port.getItem(keys.basket),"previous");
});
