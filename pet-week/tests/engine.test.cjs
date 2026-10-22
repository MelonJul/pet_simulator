const test=require('node:test'),assert=require('node:assert/strict');
const {D,E,prepared,event,play}=require('./helpers.cjs'),B=require('../dist/behavior.js');
const clone=s=>JSON.parse(JSON.stringify(s));
for(const id of Object.keys(D.PETS))test(`${id}: 7 days, inventory, ledger and save/restore every step`,()=>{
 const s=play(prepared(id)),r=E.score(s);assert.equal(s.stage,'final');assert.equal(s.history.length,7);assert.equal(s.history.flatMap(d=>d.meals).length,21);assert.ok(r.total>=90&&r.total<=100,'score '+r.total);
 assert.equal(r.parts.basic.score,35);assert.equal(r.parts.budget.score,10);assert.equal(r.expenses.total,s.settings.startingBudget-s.balance);assert.equal(s.inventory[E.pet(s).species==='dog'?'pads':'litter'],3);assert.equal(s.inventory.hygiene,1);
 assert.equal(s.history.filter(d=>d.drinks>0).length,7);assert.ok(s.history.every(d=>d.events.length<=1));assert.equal(s.journal.filter(e=>e.type==='summary').length,7);assert.ok(s.history.every(d=>d.summary.observations>0));assert.ok(Object.values(s.inventory).every(n=>n>=0));
});
test('17 distinct profiles cover both species, three life stages and individual needs',()=>{
 assert.equal(D.PETS.catDudung.name,'두둥이');assert.equal(D.PETS.catDudung.breed,'코리안 숏헤어');assert.equal(D.PETS.catDudung.ageYears,6);
 const p=Object.values(D.PETS);assert.equal(p.length,17);for(const species of ['dog','cat']){const set=p.filter(p=>p.species===species);assert.equal(set.length,species==='cat'?9:8);assert.equal(new Set(set.map(p=>p.lifeStage)).size,3);}assert.equal(new Set(p.map(p=>p.habit)).size,17);assert.ok(new Set(p.map(p=>p.activityNeed)).size>8);for(const p of Object.values(D.PETS))for(const k of ['healthNotes','careNotes','appearance','favoriteItems','toyAffinity','startStats'])assert.ok(p[k]);
});
test('fixed 110% replenishment never compounds and reusable equipment is not repurchased',()=>{
 const s=prepared(),n=s.inventory.food,b=s.balance;for(let i=0;i<3;i++)assert.ok(E.purchase(s,'food').ok);assert.equal(s.balance,b-34980);assert.equal(s.inventory.food,n+36);assert.deepEqual(s.ledger.filter(e=>e.category==='additional').map(e=>e.amount),[11660,11660,11660]);const before=E.serialize(s);assert.equal(E.purchase(s,'bowl').ok,false);assert.equal(E.serialize(s),before);
});
test('shopping refunds, expiry and budget cap preserve purchases',()=>{
 const s=E.newGame('catCurious',{startingBudget:50000});E.purchase(s,'carrier');E.purchase(s,'food');E.removeCart(s,'food');assert.equal(s.balance,33800);E.purchase(s,'litterBox');E.purchase(s,'litter');assert.equal(E.purchase(s,'bed').ok,false);assert.equal(s.balance,9200);E.tickShopping(s,60000);assert.equal(s.stage,'care');assert.equal(s.inventory.carrier,1);assert.ok(E.validate(s));
});
for(const key of ['nutrition','hydration'])test(`${key} alone ends immediately; no mutation can revive the terminal state`,()=>{
 const s=prepared();E.feed(s);s.stats[key]=2;const other=key==='nutrition'?'hydration':'nutrition';s.stats[other]=70;E.act(s,'water');assert.equal(s.stage,'ended');assert.deepEqual(s.ending.causes,[key]);assert.ok(s.stats[other]>0);assert.equal(s.ending.slot,'오전 돌봄');
 const saved=E.serialize(s);for(const fn of [()=>E.feed(s),()=>E.feed(s,1,true),()=>E.drink(s),()=>E.observe(s),()=>E.act(s,'rest'),()=>E.purchase(s,'food'),()=>E.endPeriod(s),()=>E.nextDay(s),()=>E.resolveEvent(s,'quiet'),()=>E.placeItem(s,'bed',20,60)]){assert.equal(fn().ok,false);assert.equal(E.serialize(s),saved);}E.change(s,{[key]:100},'revival');assert.equal(E.serialize(s),saved);assert.deepEqual(E.deserialize(saved),s);
});
test('every time/action path checks zero before proceeding to its next operation',()=>{
 let s=prepared();s.stats.nutrition=12;s.stats.hydration=6;E.feed(s,0);assert.equal(s.stage,'ended');assert.deepEqual(s.ending.causes,['nutrition']);assert.equal(s.stats.hydration,6);
 s=prepared();E.feed(s);s.stats.nutrition=10;s.stats.hydration=9;E.endPeriod(s);assert.deepEqual(s.ending.causes,['nutrition','hydration']);assert.equal(s.phase,1);
 s=prepared();s.stats.hydration=6;E.feed(s);assert.equal(s.stage,'ended');assert.equal(s.phase,0);
 s=play(prepared(),1);s.stats.hydration=16;E.nextDay(s);assert.equal(s.stage,'ended');assert.equal(s.day,2);assert.equal(s.phase,0);
 s=prepared();E.change(s,{nutrition:-100},'event effect');assert.equal(s.stage,'ended');assert.equal(E.act(s,'rest').ok,false);assert.ok(s.ending.recorded);
});
test('neglect ends early with warnings and recent records despite saved money',()=>{
 const s=E.newGame('catShy');E.finishShopping(s);let warnings=0,steps=0;while(s.stage!=='ended'){assert.ok(++steps<50);if(E.warn(s).length)warnings++;if(s.pendingEvent){E.closeEventImage(s);event(s);}else if(s.stage==='summary')E.nextDay(s);else if([0,2,4].includes(s.phase))E.feed(s,0);else E.endPeriod(s);}assert.ok(warnings>0);assert.ok(s.day<7);assert.equal(s.balance,200000);assert.ok(E.score(s).total<50);assert.ok(s.ending.recent.length);
});
test('urgent food warning permits recovery without extra scheduled-meal credit',()=>{
 const s=prepared();E.feed(s);s.stats.nutrition=15;const n=s.inventory.food;assert.ok(E.warn(s).some(w=>w.severe));assert.equal(E.mood(s).key,'hungry');assert.ok(E.feed(s,1,true).ok);assert.equal(s.stats.nutrition,41);assert.equal(s.inventory.food,n-1);assert.equal(s.phase,1);assert.equal(s.today.meals.length,1);assert.match(E.observe(s).observation.lines.join(' '),/가장 최근 급여/);
});
test('water replacement automatically drinks once; refusal never claims actual drinking',()=>{
 const s=prepared('catShy');E.feed(s);s.stats.hydration=40;const ap=s.remainingActions;s.stats.stress=90;E.act(s,'water');assert.equal(s.stats.hydration,37);assert.equal(s.today.drinks,0);assert.equal(s.water.amount,3);assert.equal(s.remainingActions,ap-1);
 s.stats.stress=90;const before=s.stats.hydration;assert.equal(E.drink(s).drank,false);assert.equal(s.stats.hydration,before);assert.equal(s.water.amount,3);assert.equal(s.journal.filter(e=>e.type==='drink').length,0);
 s.stats.stress=50;assert.equal(E.drink(s).drank,true);assert.equal(s.stats.hydration,before+E.pet(s).drinkAmount);assert.equal(s.water.amount,2);assert.equal(s.today.drinks,1);assert.equal(s.remainingActions,ap-1);assert.match(E.observe(s).observation.lines.join(' '),/1회 확인/);
});
test('autonomous drinking consumes only fresh available water and records it',()=>{
 const s=prepared();E.feed(s);E.act(s,'water');assert.equal(s.today.drinks,1);E.act(s,'clean');assert.equal(s.today.drinks,1);assert.equal(s.water.amount,2);assert.equal(s.journal.filter(e=>e.type==='drink').at(-1).automatic,true);s.water.freshDay=0;assert.match(E.drinkReason(s),/새 물/);
});
test('observation is free, deduplicated and records overlapping health/age/trait signals',()=>{
 const s=prepared('catSenior'),stats=clone(s.stats),ap=s.remainingActions,balance=s.balance;E.observe(s);const len=s.journal.length;for(let i=0;i<10;i++)assert.ok(E.observe(s).reused);assert.equal(s.journal.length,len);assert.deepEqual(s.stats,stats);assert.equal(s.remainingActions,ap);assert.equal(s.balance,balance);assert.match(s.observation.lines.join(' '),/나이만으로/);
 E.change(s,{nutrition:-65,hydration:-64,health:-30,stress:50,fatigue:75},'test');const o=E.observe(s).observation;for(const k of ['hungry','thirsty','uncomfortable','anxious','sleepy'])assert.ok(o.signals.some(x=>x.key===k),k);s.lastInteraction={attitude:'like'};assert.equal(E.mood(s).key,'thirsty');assert.ok(E.mood(s).locked);assert.equal(E.mood(s).pose,2);
});
test('eight visual states have distinct poses; severity and species change expression',()=>{
 const s=prepared('catCurious');s.stats={nutrition:90,hydration:90,health:92,activity:90,stress:20,fatigue:0,cleanliness:90,bond:30};assert.equal(E.mood(s).key,'calm');const poses=new Set([0,4]);for(const [f,v,k] of [['nutrition',40,'hungry'],['hydration',40,'thirsty'],['activity',25,'playful'],['fatigue',70,'sleepy'],['stress',70,'anxious'],['health',30,'uncomfortable']]){const t=clone(s);t.stats[f]=v;assert.equal(E.mood(t).key,k);poses.add(E.mood(t).pose);}s.lastInteraction={attitude:'like'};assert.equal(E.mood(s).key,'joyful');assert.equal(poses.size,8);s.stats.nutrition=40;assert.equal(E.mood(s).severity,1);s.stats.nutrition=10;assert.equal(E.mood(s).severity,2);
 const dog=prepared();dog.stats.stress=70;const cat=prepared('catShy');cat.stats.stress=70;assert.notEqual(E.signals(dog).find(x=>x.key==='anxious').text,E.signals(cat).find(x=>x.key==='anxious').text);
});
test('toy-specific motion and reactions reflect personality, age, health, fatigue and repetition',()=>{
 for(const [id,item,animation] of [['dogSocial','ball','fetch'],['dogSocial','tug','tug'],['dogSocial','squeaker','listen'],['catCurious','wand','pounce'],['catSenior','plush','cuddle'],['dogIndependent','puzzle','sniff']]){const s=prepared(id),rng=s.rng,r=E.toyResponse(s,item);assert.equal(r.animation,animation);assert.deepEqual(E.toyResponse(s,item),r);assert.equal(s.rng,rng);}
 assert.ok(['wary','dislike'].includes(E.toyResponse(prepared('dogCalm'),'squeaker').attitude));assert.notEqual(E.toyResponse(prepared('catCurious'),'ball').reaction,E.toyResponse(prepared('dogSocial'),'ball').reaction);
 const old=prepared('catSenior');assert.ok(E.toyResponse(old,'plush','gentle').effects.activity>E.toyResponse(old,'plush','active').effects.activity);const s=prepared('catCurious'),normal=E.toyResponse(s,'wand');s.stats.health-=20;assert.notDeepEqual(E.toyResponse(s,'wand'),normal);s.stats.fatigue=90;assert.ok(E.toyResponse(s,'wand').fit<normal.fit);
 const repeat=prepared('catCurious');repeat.today.actions=Array.from({length:6},()=>({id:'play',itemId:'wand'}));assert.ok(E.toyResponse(repeat,'wand').fit<normal.fit);
});
test('preferences are discovered from real play; reusable equipment and money remain',()=>{
 const s=prepared('catCurious');assert.match(E.knownPreference(s,'mouse'),/아직/);E.feed(s);const b=s.balance,r=E.act(s,'play','mouse');assert.equal(r.response.attitude,'like');assert.equal(s.inventory.mouse,1);assert.equal(s.balance,b);assert.equal(s.discoveries.mouse.attempts,1);assert.equal(s.journal.at(-1).response.kind,'mouse');assert.match(E.knownPreference(s,'mouse'),/더 관찰/);const before=E.serialize(s);assert.equal(E.act(s,'play','food').ok,false);assert.equal(E.serialize(s),before);
});
test('daily diary never invents unseen changes and compares observed days',()=>{
 const s=prepared();E.feed(s);assert.match(E.daySummary(s).changes.join(' '),/미확인/);E.observe(s);assert.equal(E.daySummary(s).observations,1);const t=play(prepared('catShy'),2);assert.ok(t.history[1].summary.changes.some(x=>/이전 관찰/.test(x)));assert.ok(t.journal.every(e=>e.action&&e.reaction&&Array.isArray(e.changes)));
});
test('different snacks share repetition penalty and consume only selected stock',()=>{
 const s=prepared('catCurious');E.purchase(s,'freezeFish');E.purchase(s,'creamTreat');E.feed(s);const food=s.inventory.food;E.act(s,'treat','freezeFish');E.act(s,'treat','creamTreat');assert.equal(s.inventory.freezeFish,5);assert.equal(s.inventory.creamTreat,4);assert.equal(s.inventory.food,food);assert.equal(s.today.counts.treat,2);assert.equal(s.today.activityFit,0);assert.match(s.lastMessage,/종류를 바꿔도 반복 간식/);
});
test('action limits and missing consumables are atomic; overfeeding is not proper',()=>{
 const s=prepared(),before=E.serialize(s);assert.equal(E.act(s,'walk').ok,false);assert.equal(E.serialize(s),before);E.feed(s,2);assert.equal(s.today.meals[0].proper,false);E.act(s,'water');E.act(s,'clean');const after=E.serialize(s);assert.equal(E.act(s,'rest').ok,false);assert.equal(E.serialize(s),after);const c=E.newGame('catShy');E.purchase(c,'litterBox');E.purchase(c,'cleaner');E.finishShopping(c);E.feed(c,0);const snap=E.serialize(c);assert.equal(E.act(c,'clean').ok,false);assert.equal(E.serialize(c),snap);
});
test('hospital expenses are separate, once-only and action-free with diary entry',()=>{
 const s=prepared();E.feed(s);E.startEvent(s,'health');E.closeEventImage(s);const b=s.balance,ap=s.remainingActions;assert.ok(E.resolveEvent(s,'visit').ok);assert.equal(s.balance,b-35000);assert.equal(s.remainingActions,ap);assert.equal(E.expenses(s).special,35000);assert.equal(s.journal.at(-1).type,'hospital');assert.equal(E.resolveEvent(s,'visit').ok,false);
});
test('legacy saves migrate without inventing observations or drinking',()=>{
 const s=play(prepared(),1);s.version=1;delete s.journal;delete s.water;delete s.discoveries;delete s.observation;delete s.stats.fatigue;const t=E.deserialize(E.serialize(s));assert.ok(t);assert.equal(t.version,3);assert.equal(t.history[0].drinks,0);assert.equal(t.observation,null);assert.ok(t.journal.every(e=>!['observation','drink'].includes(e.type)));
});
test('broken saves rejected, depleted save ends, room positioning stays free',()=>{
 for(const raw of ['{broken','{}'])assert.equal(E.deserialize(raw),null);for(const mutate of [s=>s.balance=-1,s=>s.inventory.food=-1,s=>delete s.settings.timeDecay,s=>s.discoveries.fake={},s=>s.version=99]){const s=prepared();mutate(s);assert.equal(E.deserialize(E.serialize(s)),null);}const s=prepared();s.stats.hydration=0;const ended=E.deserialize(E.serialize(s));assert.equal(ended.stage,'ended');assert.ok(ended.ending.recorded);const t=prepared(),before=[t.balance,t.remainingActions,t.revision];E.placeItem(t,'bed',200,-2);assert.deepEqual(t.room.layout.bed,{x:96,y:45});assert.deepEqual([t.balance,t.remainingActions,t.revision],before);assert.deepEqual(E.deserialize(E.serialize(t)),t);
});
test('scoring is profile-relative and configurable; event RNG survives reload',()=>{
 const a=play(prepared('dogCalm',{seed:82})),b=play(prepared('dogCalm',{seed:82}));assert.deepEqual(a.history,b.history);assert.ok(a.history.every(d=>d.events.length<=1));const ids=a.history.flatMap(d=>d.events.map(e=>e.id));for(let i=1;i<a.incidents.length;i++){assert.notEqual(a.incidents[i].eventId,a.incidents[i-1].eventId);const prev=a.incidents.slice(0,i).filter(e=>e.eventId===a.incidents[i].eventId).at(-1);if(prev)assert.ok(a.incidents[i].day-prev.day>=3);}a.settings.weights={basic:70,emotion:50,events:40,preparation:20,budget:20};assert.equal(Object.values(E.score(a).parts).reduce((n,p)=>n+p.max,0),100);const senior=play(prepared('dogSenior'));assert.equal(E.score(senior).metrics.activity,1);assert.equal(E.score(senior).parts.emotion.score,25);
});
