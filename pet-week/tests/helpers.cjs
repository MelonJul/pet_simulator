const assert=require('node:assert/strict');
const D=require('../dist/data.js'),E=require('../dist/engine.js');
function prepared(id='dogSunny',options={}){
 const s=E.newGame(id,{seed:42,...options});for(const i of E.essentialItems(s))assert.ok(E.purchase(s,i.id).ok,i.id);E.purchase(s,'food');
 // Keep a consultation reserve; an expensive favourite is not mandatory care.
 for(const id of E.pet(s).favoriteItems)if(!s.cart[id]&&s.balance-E.price(s,id)>=35000)assert.ok(E.purchase(s,id).ok,id);
 const balance=s.balance,cart={...s.cart};E.finishShopping(s);assert.equal(s.balance,balance);for(const [id,q] of Object.entries(cart))assert.equal(s.inventory[id],E.item(id).qty*q);return s;
}
function event(s){if(!s.pendingEvent)return;if(E.eventView(s).incident.screen==='image')E.closeEventImage(s);const c=D.EVENTS.find(e=>e.id===s.pendingEvent).choices.filter(c=>!E.eventReason(s,c.id)).sort((a,b)=>b.quality-a.quality)[0];const ap=s.remainingActions;assert.ok(E.resolveEvent(s,c.id).ok);assert.equal(s.remainingActions,ap-(c.cost||0));}
function play(s,limit=7){let turns=0;while(!['ended','final'].includes(s.stage)){
 assert.ok(++turns<200);if(s.stage==='summary'){if(s.day===limit&&limit<7)return s;E.nextDay(s);continue;}event(s);E.observe(s);
 if([0,2,4].includes(s.phase)){if(!E.have(s,'food'))assert.ok(E.purchase(s,'food').ok);assert.ok(E.feed(s,1).ok);}
 else {if(s.phase===1){assert.ok(E.act(s,'water').ok);assert.ok(E.act(s,'clean').ok);}else{
 if(E.pet(s).species==='dog')assert.ok(E.act(s,'walk').ok);else {const toys=E.actionItems(s,'play').sort((a,b)=>E.toyResponse(s,b.id).fit-E.toyResponse(s,a.id).fit||E.toyResponse(s,b.id).effects.activity-E.toyResponse(s,a.id).effects.activity);assert.ok(E.act(s,'play',toys[0].id).ok);}
 assert.ok(E.act(s,[1,3,5].includes(s.day)?'hygiene':'rest').ok);}E.observe(s);assert.ok(E.endPeriod(s).ok);}
 assert.ok(E.validate(s),s.petId+' '+s.stage+' '+s.day);assert.deepEqual(E.deserialize(E.serialize(s)),s);
 }return s;}
module.exports={D,E,prepared,event,play};
