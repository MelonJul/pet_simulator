const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {D,E,prepared,play}=require('./helpers.cjs'),ED=require('../dist/event-data.js');
const clone=x=>JSON.parse(JSON.stringify(x));
function ready(id='catDudung',options={}){const s=prepared(id,{startingBudget:300000,...options});E.purchase(s,'plush');E.feed(s);return s;}
function begin(s,id){assert.ok(E.startEvent(s,id).ok,id);const n=s.activeEvent;assert.equal(E.eventView(s).incident.screen,'image');return n;}

test('30 local event scenes have complete educational content, explicit effects and viable free responses',()=>{
 const keys=[];assert.equal(ED.EVENTS.length,30);
 for(const e of ED.EVENTS){keys.push(e.image.atlas+':'+(e.image.room?e.id:e.image.cell));const png=fs.readFileSync(path.join(__dirname,'../dist',e.image.atlas));assert.ok(png.readUInt32BE(16)>1000);assert.ok(png.readUInt32BE(20)>700);assert.ok(D.GUIDE.some(g=>g.id===e.guide));for(const key of ['description','causes','response','prevention','consequence','choices'])assert.ok(e[key].length,key+' '+e.id);assert.ok(e.choices.some(c=>!c.money&&!c.cost&&!c.require&&!c.consume),e.id);for(const key of e.sources)assert.ok(ED.SOURCES[key][1].startsWith('https://'));}
 assert.equal(new Set(keys).size,30);
});
for(const e of ED.EVENTS)test(`${e.id}: image → education → response → journal, atomic persistence`,()=>{
 let s=ready(e.species==='dog'?'dogSunny':'catDudung'),n=begin(s,e.id);const pending=E.serialize(s),balance=s.balance,ap=s.remainingActions,stats=clone(s.stats),journal=s.journal.length;
 assert.equal(E.resolveEvent(s,e.choices[0].id,n).ok,false);assert.equal(E.serialize(s),pending);
 for(const fn of [()=>E.feed(s),()=>E.endPeriod(s),()=>E.observe(s),()=>E.drink(s),()=>E.act(s,'rest'),()=>E.placeItem(s,'bed',20,50),()=>E.purchase(s,'food'),()=>E.startEvent(s,e.id)])assert.equal(fn().ok,false);
 assert.equal(E.serialize(s),pending);assert.deepEqual(E.deserialize(pending),s);
 s=E.deserialize(pending);assert.ok(E.closeEventImage(s,n).ok);assert.equal(s.balance,balance);assert.equal(s.remainingActions,ap);assert.deepEqual(s.stats,stats);assert.equal(s.journal.length,journal);
 assert.equal(E.closeEventImage(s,n).ok,false);s=E.deserialize(E.serialize(s));assert.equal(E.eventView(s).incident.screen,'education');
 const c=e.choices.find(c=>!E.eventReason(s,c.id));assert.ok(c);assert.ok(E.resolveEvent(s,c.id,n).ok);assert.equal(s.pendingEvent,null);assert.equal(s.activeEvent,null);assert.equal(s.remainingActions,ap-(c.cost||0));assert.equal(s.balance,balance-c.money);assert.equal(s.today.events.length,1);assert.equal(s.journal.filter(r=>r.type==='situation'&&r.eventInstance===n).length,1);assert.equal(s.journal.filter(r=>['hospital','event'].includes(r.type)&&r.eventInstance===n).length,1);
 const done=E.serialize(s);assert.equal(E.resolveEvent(s,c.id,n).ok,false);assert.equal(E.serialize(s),done);assert.ok(E.eventView(s,n).incident.result);assert.equal(E.serialize(s),done);assert.deepEqual(E.deserialize(done),s);
});
test('situation consequence is applied once and plastic, glass, injury, toy loss stay distinct',()=>{
 let s=ready(),before=s.stats.cleanliness;begin(s,'catCup');assert.equal(s.stats.cleanliness,before-6);assert.ok(E.eventView(s).incident.consequences.join().includes('컵 파손·부상·금전 손실은 발생하지'));assert.equal(E.expenses(s).special,0);E.closeEventImage(s);E.resolveEvent(s,'tidy');assert.equal(s.environment.cupsSecured,true);
 s=ready();begin(s,'catGlass');assert.match(E.eventView(s).incident.consequences.join(),/컵 1개 파손/);assert.match(E.eventView(s).incident.consequences.join(),/부상은 확인되지/);E.closeEventImage(s);E.resolveEvent(s,'replace');assert.equal(E.expenses(s).special,4000);assert.equal(s.ledger.at(-1).type,'replacement');
 s=ready();begin(s,'missingToy');assert.equal(s.inventory.plush,0);assert.equal(E.eventView(s).incident.losses.length,1);s=E.deserialize(E.serialize(s));assert.equal(s.inventory.plush,0);E.closeEventImage(s);E.resolveEvent(s,'contact');assert.match(s.incidents.at(-1).result,/치료 완료로 기록하지/);assert.match(s.incidents.at(-1).followup,/진료/);assert.ok(ED.EVENTS.find(e=>e.id==='missingToy').choices.every(c=>c.hospital));
});
test('event shop is 110%, consumables and hospital costs are separately recorded exactly once',()=>{
 const s=ready();begin(s,'catCup');E.closeEventImage(s);const b=s.balance,n=s.inventory.cleaner;assert.ok(E.purchase(s,'cleaner').ok);assert.equal(s.balance,b-E.item('cleaner').price*1.1);const n2=s.inventory.cleaner;E.resolveEvent(s,'kit');assert.equal(s.inventory.cleaner,n2-1);assert.ok(n2>n);assert.equal(E.expenses(s).special,0);
 begin(s,'health');E.closeEventImage(s);const id=s.activeEvent;E.resolveEvent(s,'visit',id);assert.equal(s.ledger.at(-1).category,'special');assert.equal(s.ledger.at(-1).type,'vet');assert.equal(E.expenses(s).special,35000);const after=E.serialize(s);E.resolveEvent(s,'visit',id);assert.equal(E.serialize(s),after);
});
test('paid response obeys AP, applies time cost and still checks absorbing zero condition',()=>{
 const s=ready('dogSunny');begin(s,'dogBell');E.closeEventImage(s);s.remainingActions=0;const before=E.serialize(s);assert.match(E.eventReason(s,'practice'),/행동/);assert.equal(E.resolveEvent(s,'practice').ok,false);assert.equal(E.serialize(s),before);assert.ok(E.resolveEvent(s,'distance').ok);
 s.remainingActions=1;begin(s,'dogPull');E.closeEventImage(s);s.stats.hydration=3;const id=s.activeEvent;assert.ok(E.resolveEvent(s,'practice',id).ended);assert.equal(s.stage,'ended');assert.equal(s.stats.hydration,0);assert.equal(s.pendingEvent,null);assert.equal(s.incidents.at(-1).status,'resolved');const ended=E.serialize(s);assert.equal(E.resolveEvent(s,'practice',id).ok,false);assert.equal(E.nextDay(s).ok,false);assert.equal(E.serialize(s),ended);assert.ok(E.validate(s));
});
test('stale instance cannot resolve a different event using the same choice id',()=>{
 const s=ready(),first=begin(s,'catCup');E.closeEventImage(s);E.resolveEvent(s,'tidy',first);const second=begin(s,'catPlant');E.closeEventImage(s);const before=E.serialize(s);assert.equal(E.resolveEvent(s,'tidy',first).ok,false);assert.equal(E.serialize(s),before);assert.ok(E.resolveEvent(s,'tidy',second).ok);
});
test('weighted eligibility uses species, age, inventory, placement, records, prevention and cooldown',()=>{
 const s=ready();s.day=4;const pool=()=>E.eventCandidates(s),weight=id=>pool().find(c=>c.event.id===id)?.weight||0;
 assert.ok(pool().every(c=>c.event.species!=='dog'));assert.equal(weight('dogPull'),0);assert.equal(weight('health'),0);assert.equal(weight('vetExpense'),0);assert.equal(weight('missingToy'),0);
 s.today.actions.push({id:'play',itemId:'plush'},{id:'play',itemId:'plush'});assert.ok(weight('missingToy')>0);assert.ok(weight('catBox')>0);
 s.room.layout.scratch={x:90,y:90};const far=weight('catScratch');s.room.layout.scratch={x:30,y:69};assert.ok(weight('catScratch')<far);const cup=weight('catCup');s.environment.cupsSecured=true;assert.ok(weight('catCup')<cup);assert.equal(weight('catGlass'),0);
 begin(s,'catHide');E.closeEventImage(s);E.resolveEvent(s,'space');assert.equal(weight('catHide'),0);s.day=6;assert.equal(weight('catHide'),0);
 const young=ready('dogPuppy'),adult=ready('dogSunny');for(const t of [young,adult]){t.day=4;t.stats.activity=60;}assert.ok(E.eventCandidates(young).find(c=>c.event.id==='dogChew').weight>E.eventCandidates(adult).find(c=>c.event.id==='dogChew').weight);
 young.history=[{actions:[],endStats:{health:30,fatigue:80}},{actions:[],endStats:{health:30,fatigue:80}}];assert.ok(E.eventCandidates(young).some(c=>c.event.id==='health'));
});
test('healthy contextual scheduling reaches 2–3 ordinary events per day without compulsory illness across 100 seeds',()=>{
 const F=require('../dist/runtime.js');let all=0;
 for(let seed=1;seed<=100;seed++){const s=ready(seed%2?'catDudung':'dogSunny',{seed});for(let day=1;day<=7;day++){s.day=day;for(let n=0;n<8;n++){F.schedule(s);while(F.current(s)){F.advance(s);if(s.pendingEvent){E.closeEventImage(s);const e=E.eventView(s).event;assert.ok(!e.serious);assert.ok(!['health','vetExpense'].includes(e.id));E.resolveEvent(s,e.choices.find(c=>!E.eventReason(s,c.id)).id);all++;}}}assert.ok(s.eventSchedule.count>=2&&s.eventSchedule.count<=3);}}
 assert.ok(all>=1400);
});

test('eligible serious events can actually occur but stay rare in seeded scheduling',()=>{
 let serious=0,ordinary=0;const base=ready('dogSunny');for(let seed=1;seed<=1500;seed++){
  const s=clone(base);s.rng=Math.imul(seed,2654435761)>>>0;s.day=4;s.phase=2;s.today.actions=[{id:'play',itemId:'plush'},{id:'play',itemId:'plush'}];require('../dist/runtime.js').schedule(s);const id=s.flow.queue[0]?.eventId;if(id==='missingToy')serious++;else if(id)ordinary++;
 }assert.ok(serious>0&&serious<75,serious+' serious / 1500');assert.ok(ordinary>500);assert.ok(serious<ordinary/10);
});
test('danger signals defer interruptions and zero state wins over pending image',()=>{
 const s=ready();E.endPeriod(s);s.stats.hydration=35;E.feed(s);assert.equal(s.pendingEvent,null);assert.equal(s.stats.hydration,29);
 const t=ready();begin(t,'catCup');E.change(t,{nutrition:-100},'종료 검사');assert.equal(t.stage,'ended');assert.equal(t.pendingEvent,null);assert.equal(t.activeEvent,null);assert.equal(t.incidents.at(-1).status,'interrupted');assert.equal(E.closeEventImage(t).ok,false);
});
test('pre-event v3 pending saves migrate without replaying losses or inventing old consequences',()=>{
 const s=ready();delete s.incidents;delete s.activeEvent;delete s.environment;delete s.eventSequence;s.pendingEvent='spill';s.usedEvents.push('spill');const food=s.inventory.food,loaded=E.deserialize(E.serialize(s));assert.ok(loaded);assert.equal(loaded.inventory.food,food);assert.equal(loaded.pendingEvent,'spill');assert.equal(E.eventView(loaded).incident.screen,'image');E.closeEventImage(loaded);assert.ok(E.resolveEvent(loaded,'check').ok);assert.equal(loaded.inventory.food,food);
});
test('event scoring rewards appropriate response regardless of incurred damage and necessary spending',()=>{
 const s=play(prepared('catDudung'));const copy=clone(s),day=copy.history[0];day.events=[{id:'catGlass',quality:1,money:4000},{id:'health',quality:1,money:35000}];const a=E.score(s),b=E.score(copy);assert.equal(a.parts.events.score,20);assert.equal(b.parts.events.score,20);assert.equal(a.parts.budget.score,b.parts.budget.score);day.events[0].quality=0;assert.ok(E.score(copy).parts.events.score<20);
});
