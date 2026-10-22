const test=require('node:test'),assert=require('node:assert/strict');
const {D,E,prepared,event}=require('./helpers.cjs');
test('every item has a retail reference, unit basis, and stable 110% price',()=>{
 assert.equal(D.ITEMS.length,32);
 for(const i of D.ITEMS){assert.equal(i.price,D.PRICES.ITEMS[i.id].gamePrice);assert.ok(i.market.basis);assert.ok(i.market.sources.length);for(const r of i.market.sources){assert.ok(r.price>0);assert.match(r.url,/^https:\/\//);assert.ok(r.product&&r.pack&&r.note);}}
 const s=E.newGame('catDudung');assert.equal(s.prices.food,10600);assert.equal(E.price(s,'food',true),11660);assert.equal(s.prices.pads,2600);assert.equal(s.prices.catTower,64800);
 const original=E.item('food').price;try{E.item('food').price=99999;assert.equal(E.price(s,'food'),10600);assert.ok(E.purchase(s,'food').ok);assert.equal(s.balance,189400);E.removeCart(s,'food');assert.equal(s.balance,200000);}finally{E.item('food').price=original;}
});
test('legacy shopping retains paid prices, refunds, ledger and replenishment',()=>{
 let s=E.newGame('catDudung');delete s.prices;delete s.pricingRevision;s.cart={food:2,bowl:1};s.balance=171000;
 s=E.deserialize(JSON.stringify(s));assert.ok(s);assert.equal(s.pricingRevision,'legacy');assert.equal(E.price(s,'food'),12000);E.removeCart(s,'food');assert.equal(s.balance,183000);E.finishShopping(s);assert.equal(E.expenses(s).initial,17000);assert.equal(s.inventory.food,12);E.purchase(s,'food');assert.equal(s.ledger.at(-1).amount,13200);assert.equal(s.balance,169800);assert.deepEqual(E.deserialize(E.serialize(s)),s);
});
test('legacy care retains accounting and bad price snapshots are rejected',()=>{
 let s=prepared();const paid=E.expenses(s).total;delete s.prices;delete s.pricingRevision;s=E.deserialize(E.serialize(s));assert.ok(s);assert.equal(E.expenses(s).total,paid);assert.equal(E.price(s,'food'),13200);
 for(const v of [0,-1,1.5,null]){const invalid=E.newGame('catDudung');invalid.prices.food=v;assert.equal(E.deserialize(E.serialize(invalid)),null);}
});
test('two actions are enforced for each period and free observation cannot refill them',()=>{
 const s=prepared('catShy',{actionsPerPeriod:4});assert.equal(s.settings.actionsPerPeriod,2);E.feed(s);assert.equal(s.remainingActions,2);E.act(s,'water');E.act(s,'clean');assert.equal(s.remainingActions,0);E.observe(s);const before=E.serialize(s);assert.equal(E.act(s,'rest').ok,false);assert.equal(E.serialize(s),before);E.endPeriod(s);E.feed(s);event(s);assert.equal(s.remainingActions,2);E.act(s,'rest');E.act(s,'rest');assert.equal(s.remainingActions,0);assert.equal(E.act(s,'rest').ok,false);
});
test('legacy 3/4 action saves retain expenditure, not extra actions, across reloads',()=>{
 for(const phase of [1,3])for(const cap of [3,4])for(let left=0;left<=cap;left++){
  const s=prepared();E.feed(s);s.phase=phase;s.settings.actionsPerPeriod=cap;s.remainingActions=left;
  const t=E.deserialize(E.serialize(s));assert.ok(t);assert.equal(t.settings.actionsPerPeriod,2);assert.equal(t.remainingActions,Math.max(0,2-(cap-left)));assert.deepEqual(E.deserialize(E.serialize(t)),t);
 }
});
