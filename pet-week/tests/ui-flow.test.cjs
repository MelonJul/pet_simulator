// DOM-adapter integration tests. These exercise real UI handlers and persisted
// state without a browser; they do not verify CSS layout or rendered pixels.
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../dist/engine.js');
const D=require('../dist/data.js');

function harness(storage=new Map(),withRoom=false){
  const events={},intervals=[],nodes={},timers=new Map();let now=0,timerId=0;
  const node=()=>({innerHTML:'',textContent:'',inert:false,dataset:{},style:{setProperty(k,v){this[k]=v;}},classList:{add(){},remove(){},toggle(){}},focus(){},querySelector(){return null;},querySelectorAll(){return[];},getBoundingClientRect(){return {left:0,top:0,width:800,height:600};}});
  for(const id of ['#app','#modal-root','#toast','#timer','#timer-progress','.modal','.timer-box'])nodes[id]=node();
  if(withRoom){for(const id of ['#room-stage','#pet-mover','#pet-mover .pet-actor','#pet-mover .plush-sprite','#pet-bubble','#pet-particles'])nodes[id]=node();nodes['#pet-mover .pet-actor'].querySelector=()=>nodes['#pet-mover .plush-sprite'];}
  const document={hidden:false,body:node(),addEventListener(name,fn){events[name]=fn;},querySelector(sel){
    if(sel==='.modal'&&!nodes['#modal-root'].innerHTML)return null;return nodes[sel]||null;
  }};
  const context={document,console,Date,Math,Intl,JSON,Map,Set,Number,String,Object,Array,
    performance:{now:()=>now},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    setInterval:fn=>{intervals.push(fn);return intervals.length;},setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId;},clearTimeout:id=>timers.delete(id),scrollTo(){},addEventListener(){}};
  context.window=context;vm.createContext(context);
  for(const name of ['profiles.js','event-data.js','price-data.js','scenarios.js','data.js','behavior.js','engine.js','scene.js','cat-event-frames.js','event-ui.js','runtime.js','motions.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',name),'utf8'),context,{filename:name});
  const html=()=>nodes['#app'].innerHTML,modal=()=>nodes['#modal-root'].innerHTML;
  function click(action,id){
    const markup=modal()||html();
    const buttons=[...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    const match=buttons.find(m=>m[1].includes(`data-do="${action}"`)&&(id===undefined||m[1].includes(`data-id="${id}"`)));
    assert.ok(match,`UI button ${action} ${id||''} must be present`);
    assert.ok(!/\bdisabled\b/.test(match[1]),`UI button ${action} ${id||''} must be enabled`);
    const dataset={};for(const m of match[1].matchAll(/data-([\w-]+)="([^"]*)"/g))dataset[m[1]]=m[2];
    events.click({preventDefault(){},target:{closest(){return{dataset,disabled:false};}}});
  }
  return {storage,html,modal,click,nodes,flush(ms){for(const [id,t] of [...timers])if(t.ms<=ms){timers.delete(id);t.fn();}},experience:()=>JSON.parse(storage.get('first-together-experience-v1')||'null'),state:()=>JSON.parse(storage.get(D.CONFIG.saveKey)||'null'),advance(ms){now+=ms;for(const fn of intervals)fn();}};
}


function settle(ui,experience=false){let n=0,s;while((s=experience?ui.experience()?.current:ui.state())?.pendingEvent){assert.ok(++n<10);if(E.eventView(s).incident.screen==='image')ui.click('event-image-close');else{const c=D.EVENTS.find(e=>e.id===s.pendingEvent).choices.filter(c=>!E.eventReason(s,c.id)).sort((a,b)=>b.quality-a.quality||(a.cost||0)-(b.cost||0))[0];ui.click('event',c.id);}}}

test('clicking the pet opens eight live status meters for free and continues into inventory care',()=>{
 const s=require('./helpers.cjs').prepared('catDudung');E.feed(s);s.stats.stress=10;s.stats.fatigue=0;
 const ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(s)]]));ui.click('continue');
 assert.match(ui.html(),/class="pet-actor"[^>]*data-do="pet-info"/);assert.match(ui.html(),/class="pet-name-tag"[^>]*data-do="pet-info"/);
 const initial=ui.state();ui.click('pet-info');assert.match(ui.modal(),/두둥이의 상태/);assert.equal((ui.modal().match(/role="meter"/g)||[]).length,8);assert.match(ui.modal(),/aria-label="피로"[^>]*aria-valuenow="0"/);assert.match(ui.modal(),/낮을수록 편안해요/);assert.match(ui.modal(),/지금 관찰한 행동과 표정/);
 assert.equal(ui.state().remainingActions,initial.remainingActions);assert.equal(ui.state().balance,initial.balance);assert.deepEqual(ui.state().stats,initial.stats);assert.equal(ui.state().journal.at(-1).type,'observation');
 ui.advance(120000);assert.deepEqual(ui.state().stats,initial.stats);ui.click('inventory');ui.click('inventory-select','waterBowl');ui.click('use-inventory','waterBowl');assert.equal(ui.state().remainingActions,1);
 settle(ui);ui.click('pet-info');assert.match(ui.modal(),/오늘 물 교체함/);assert.equal(ui.state().remainingActions,1);
});

test('retail references pause shopping, show actual packs, and return to the same shop',()=>{
 const ui=harness();ui.click('start');ui.advance(1000);ui.click('prices','food');const remaining=ui.state().remainingMs;
 assert.equal(remaining,59000);assert.match(ui.modal(),/사료.*가격 근거/);assert.match(ui.modal(),/2026-10-21/);assert.match(ui.modal(),/1.5kg/);assert.match(ui.modal(),/10,600원/);assert.match(ui.modal(),/11,660원/);assert.match(ui.modal(),/https:\/\/jspet.co.kr/);ui.advance(90000);assert.equal(ui.state().remainingMs,remaining);ui.click('close-modal');assert.equal(ui.modal(),'');
 ui.click('buy','food');ui.click('finish-shopping');ui.click('shop');ui.click('prices','creamTreat');assert.match(ui.modal(),/1,890원/);assert.match(ui.modal(),/14g × 4개/);ui.click('close-modal');assert.match(ui.modal(),/우리 집 추가 주문/);ui.click('close-modal');assert.equal(ui.modal(),'');
});

test('settings expose two fixed actions and care shows remaining out of two',()=>{
 const ui=harness();ui.click('settings');assert.doesNotMatch(ui.modal(),/name="actionsPerPeriod"/);assert.match(ui.modal(),/오전 돌봄 2회 \+ 오후 돌봄 2회로 고정/);ui.click('close-modal');ui.click('start');ui.click('buy','bowl');ui.click('buy','food');ui.click('finish-shopping');ui.click('feed');settle(ui);assert.match(ui.html(),/2 \/ 2회 남음/);ui.click('act','rest');settle(ui);assert.match(ui.html(),/1 \/ 2회 남음/);ui.click('act','rest');settle(ui);assert.match(ui.html(),/0 \/ 2회 남음/);ui.click('end-period');settle(ui);ui.click('feed');settle(ui);assert.match(ui.html(),/2 \/ 2회 남음/);
});

for(const id of ['dogSunny','catShy','catDudung'])test(`UI handlers: ${id} shopping → 7 days → final → replay`,()=>{
  const ui=harness();ui.click('roster-tab',D.PETS[id].species);ui.click('select',id);assert.ok(ui.html().includes(`${D.PETS[id].name}와 첫 일주일을 시작해요`));ui.click('start');
  const initial=ui.state();for(const item of E.essentialItems(initial))ui.click('buy',item.id);ui.click('buy','food');for(const id of D.PETS[initial.petId].favoriteItems)if(!ui.state().cart[id])ui.click('buy',id);
  const balance=ui.state().balance;ui.click('finish-shopping');assert.equal(ui.state().balance,balance);
  let turns=0;
  while(ui.state().stage!=='final'){
    assert.ok(++turns<280,'UI must reach final');const s=ui.state();
    if(s.pendingEvent){
      if(E.eventView(s).incident.screen==='image'){ui.click('event-image-close');continue;}
      const event=D.EVENTS.find(e=>e.id===s.pendingEvent),choice=event.choices.filter(c=>!E.eventReason(s,c.id)).sort((a,b)=>b.quality-a.quality)[0];
      assert.ok(ui.modal().includes(event.title));ui.click('event',choice.id);continue;
    }
    if(s.stage==='summary'){assert.ok(ui.html().includes('오늘의 돌봄 기록'));ui.click('next-day');continue;}
    ui.click('observe');ui.click('close-modal');if([0,2,4].includes(s.phase)){if(!E.have(s,'food')){ui.click('shop');ui.click('buy','food');ui.click('close-modal');}ui.click('feed');continue;}
    const ids=s.phase===1?['water','clean']:[E.pet(s).species==='dog'?'walk':'play',[1,3,5].includes(s.day)?'hygiene':'rest'];
    if(!s.remainingActions){ui.click('end-period');continue;}for(const action of [ids[2-s.remainingActions]]){if(action==='play'){ui.click('act',action);const toys=E.actionItems(ui.state(),'play').sort((a,b)=>E.toyResponse(ui.state(),b.id).fit-E.toyResponse(ui.state(),a.id).fit);ui.click('use-choice',toys[0].id);}else ui.click('act',action);}
  }
  assert.ok(ui.html().includes('100점 만점'));assert.ok(ui.html().includes('총지출'));
  assert.equal(ui.state().history.length,7);assert.ok(E.score(ui.state()).total>=90);
  ui.click('restart');assert.ok(ui.modal().includes('이전 저장을 바꿔요'));ui.click('confirm-new');assert.equal(ui.state(),null);
  assert.ok(ui.html().includes('어떤 친구와 함께할까요?'));
});
test('UI guide pauses shopping time and restores correct timer on close',()=>{
  const ui=harness();ui.click('start');ui.advance(4000);const left=ui.state().remainingMs;
  ui.click('guide');assert.ok(ui.modal().includes('쇼핑 타이머 일시 정지 중'));ui.advance(120000);assert.equal(ui.state().remainingMs,left);
  ui.click('close-modal');ui.advance(2000);assert.equal(ui.state().remainingMs,left-2000);
  ui.advance(60000);assert.equal(ui.state().stage,'care');assert.ok(ui.html().includes('정량 급여하기'));
});
test('UI actual save reload, continuation and species changes after returning home',()=>{
  let ui=harness();ui.click('start');ui.click('buy','food');ui.advance(3000);const previous=ui.state();
  ui=harness(ui.storage);assert.ok(ui.html().includes('이어 쓸 이야기가 있어요'));ui.click('continue');assert.deepEqual(ui.state(),previous);
  ui.click('home');ui.click('select','catShy');assert.ok(ui.html().includes('모카와 첫 일주일을 시작해요'));
  ui.click('start');assert.ok(ui.modal().includes('이전 저장을 바꿔요'));ui.click('confirm-new');assert.equal(ui.state().petId,'catShy');
});
test('UI shop, guide and unresolved event return to the same pending decision',()=>{
  const seed=require('./helpers.cjs').prepared('catDudung');E.feed(seed);E.startEvent(seed,'newHome');const ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(seed)]]));ui.click('continue');ui.click('event-image-close');
  ui.click('guide','personality');assert.ok(ui.modal().includes('성향과 행동 신호'));ui.click('close-modal');assert.ok(ui.modal().includes('아직은 낯선 우리 집'));
  ui.click('shop');const previous=ui.state().balance;ui.click('buy','food');assert.equal(ui.state().balance,previous-11660);
  ui.click('close-modal');assert.ok(ui.modal().includes('아직은 낯선 우리 집'));ui.click('event','space');assert.equal(ui.state().pendingEvent,null);
  assert.equal(ui.state().remainingActions,2);assert.ok(ui.html().includes('오늘의 작은 순간'));
});
test('room items render only owned stock; object controls perform real actions',()=>{
  const seed=E.newGame('catDudung',{startingBudget:250000});const ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(seed)]]));ui.click('continue');for(const i of E.essentialItems(ui.state()))ui.click('buy',i.id);
  ui.click('buy','catTower');ui.click('buy','freezeFish');ui.click('buy','creamTreat');ui.click('finish-shopping');
  assert.match(ui.html(),/data-room-id="catTower"/);assert.doesNotMatch(ui.html(),/data-room-id="tunnel"/);
  ui.click('room-item','bowl');assert.match(ui.modal(),/밥그릇에 사료 담기/);ui.click('use-room-item','bowl');
  assert.equal(ui.state().inventory.food,11);assert.equal(ui.state().phase,1);settle(ui);
  ui.click('room-item','waterBowl');ui.click('use-room-item','waterBowl');assert.equal(ui.state().remainingActions,1);settle(ui);
  ui.click('act','treat');assert.match(ui.modal(),/오늘은 어떤 간식/);ui.click('use-choice','freezeFish');
  assert.equal(ui.state().inventory.freezeFish,5);assert.equal(ui.state().inventory.creamTreat,5);
  assert.equal(ui.state().today.actions[1].itemId,'freezeFish');
  settle(ui);ui.click('toggle-labels');assert.match(ui.html(),/이름표 꺼짐/);ui.click('decorate');assert.match(ui.html(),/배치 완료/);
});
test('observation → inventory use → response → diary forms a free-to-view care loop',()=>{
  const seed=E.newGame('catDudung',{startingBudget:250000});const ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(seed)]]));ui.click('continue');for(const i of E.essentialItems(ui.state()))ui.click('buy',i.id);ui.click('buy','mouse');ui.click('finish-shopping');
  assert.doesNotMatch(ui.html(),/class="room-supplies/);assert.match(ui.html(),/data-do="inventory"/);
  const initial=ui.state();ui.click('observe');assert.match(ui.modal(),/관찰했어요/);assert.equal(ui.state().remainingActions,initial.remainingActions);assert.equal(ui.state().balance,initial.balance);assert.equal(ui.state().journal.at(-1).type,'observation');
  ui.click('inventory');assert.match(ui.modal(),/inventory-slots/);ui.click('inventory-select','food');ui.click('use-inventory','food');assert.equal(ui.state().inventory.food,11);assert.equal(ui.state().phase,1);settle(ui);
  ui.click('inventory');ui.click('inventory-select','waterBowl');const hydration=ui.state().stats.hydration;ui.click('use-inventory','waterBowl');assert.equal(ui.state().today.drinks,1);assert.equal(ui.state().stats.hydration,hydration-3+E.pet(ui.state()).drinkAmount);assert.equal(ui.state().water.amount,2);settle(ui);
  ui.click('inventory');ui.click('inventory-category','장난감');ui.click('inventory-select','mouse');assert.match(ui.modal(),/아직 반응을 관찰하지/);ui.click('use-inventory','mouse');assert.equal(ui.state().inventory.mouse,1);assert.equal(ui.state().discoveries.mouse.attempts,1);settle(ui);assert.ok(ui.state().journal.some(e=>e.response?.kind==='mouse'));
  const before=ui.state();ui.click('journal');assert.match(ui.modal(),/한 행동/);assert.match(ui.modal(),/실제로|마시는/);assert.match(ui.modal(),/꼬마 쥐/);ui.click('journal-day','1');ui.click('journal-type','observed');ui.click('close-modal');assert.deepEqual({...ui.state(),savedAt:null},{...before,savedAt:null});
  ui.click('inventory');ui.click('inventory-select','mouse');assert.match(ui.modal(),/이번 시간의 행동을 모두/);assert.match(ui.modal(),/data-do="use-inventory"[^>]*disabled/);ui.click('close-modal');
});
test('UI handles nutrition-only and hydration-only endings, diary and reload',()=>{
  const {prepared}=require('./helpers.cjs');
  for(const key of ['nutrition','hydration']){
    const s=prepared('catCurious');s.stats[key]=key==='nutrition'?12:6;const ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(s)]]));ui.click('continue');assert.match(ui.html(),/risk-banner/);
    if(key==='nutrition'){ui.click('skip-meal');ui.click('confirm-meal');}else ui.click('feed');
    assert.equal(ui.state().stage,'ended');assert.match(ui.html(),/여기서 멈췄어요/);assert.match(ui.html(),/실제 동물의 생존 시간이나 의학적 기준이 아닙니다/);assert.doesNotMatch(ui.html(),/data-do="next-day"|data-do="feed"/);
    ui.click('journal');assert.match(ui.modal(),/돌봄 시뮬레이션 종료/);ui.click('close-modal');const resumed=harness(ui.storage);resumed.click('continue');assert.match(resumed.html(),/여기서 멈췄어요/);assert.equal(resumed.state().stats[key],0);
    resumed.click('restart');resumed.click('confirm-new');assert.equal(resumed.state(),null);
  }
});
test('roster exposes all 17 profiles and corresponding atlases but no hidden toy affinity',()=>{
  const ui=harness();for(const species of ['cat','dog']){ui.click('roster-tab',species);for(const p of Object.values(D.PETS).filter(p=>p.species===species)){ui.click('select',p.id);assert.ok(ui.html().includes(p.healthNotes));assert.ok(ui.html().includes(p.image));assert.match(ui.html(),/세부 장난감 취향은 실제 반응/);}}
});
test('critical thirst remains visible after play; refusal is recorded without false hydration',()=>{
 const {prepared}=require('./helpers.cjs'),s=prepared('catCurious');E.feed(s);s.stats.hydration=15;
 let ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(s)]]));ui.click('continue');ui.click('inventory');ui.click('inventory-select','mouse');ui.click('use-inventory','mouse');assert.equal(ui.state().stats.hydration,12);assert.match(ui.html(),/state-thirsty severity-2/);
 const t=prepared('catShy');E.feed(t);t.stats.stress=90;t.stats.hydration=40;ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(t)]]));ui.click('continue');ui.click('act','water');assert.equal(ui.state().today.drinks,0);assert.equal(ui.state().stats.hydration,37);assert.equal(ui.state().water.amount,3);assert.doesNotMatch(ui.html(),/data-do="drink"/);
});

test('incident UI enforces image first, saves both steps, pauses and reopens a read-only diary explanation',()=>{
 const {prepared}=require('./helpers.cjs');const s=prepared('catDudung');E.feed(s);E.startEvent(s,'catCup');let ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(s)]]));ui.click('continue');
 assert.match(ui.modal(),/incident-image-modal/);assert.match(ui.modal(),/닫기/);assert.match(ui.modal(),/catDudung-events-v1/);assert.match(ui.modal(),/events-a-v1/);assert.doesNotMatch(ui.modal(),/왜 이런|data-do="event"/);assert.equal(ui.nodes['#app'].inert,true);
 const before=ui.state();ui.advance(180000);assert.deepEqual(ui.state(),before);ui=harness(ui.storage);ui.click('continue');assert.match(ui.modal(),/incident-image-modal/);ui.click('event-image-close');assert.match(ui.modal(),/무슨 일이 있었나요/);assert.match(ui.modal(),/왜 이런 행동/);assert.match(ui.modal(),/지금 할 대응을 골라/);assert.doesNotMatch(ui.modal(),/다음에는 어떻게 예방|행동 0회|비용 0원|이번 사건의 결과/);assert.equal(ui.state().balance,before.balance);assert.deepEqual(ui.state().stats,before.stats);
 ui=harness(ui.storage);ui.click('continue');assert.match(ui.modal(),/incident-education/);assert.doesNotMatch(ui.modal(),/incident-image-modal/);ui.advance(300000);assert.equal(ui.state().phase,before.phase);ui.click('guide','eventSafety');ui.click('close-modal');assert.match(ui.modal(),/선반 위에서 떨어진/);ui.click('shop');const budget=ui.state().balance;ui.click('buy','food');assert.equal(ui.state().balance,budget-11660);ui.click('close-modal');ui.click('event','tidy');assert.equal(ui.modal(),'');assert.equal(ui.nodes['#app'].inert,false);
 const done=ui.state();ui.click('journal');ui.click('journal-type','events');assert.match(ui.modal(),/사건 설명·대응 다시 읽기/);ui.click('event-replay','1');assert.match(ui.modal(),/지난 사건/);assert.match(ui.modal(),/지금 할 대응/);assert.doesNotMatch(ui.modal(),/data-do="event"/);ui.advance(300000);ui.click('guide','eventSafety');ui.click('close-modal');assert.match(ui.modal(),/지난 사건/);ui.click('close-modal');assert.match(ui.modal(),/반려동물 일지/);ui.click('close-modal');assert.deepEqual({...ui.state(),savedAt:null},{...done,savedAt:null});
});

test('every event scene reaches its three-part education and response through real handlers',()=>{
 const ED=require('../dist/event-data.js'),{prepared}=require('./helpers.cjs');for(const e of ED.EVENTS){
  const s=prepared(e.species==='dog'?'dogSunny':'catDudung',{startingBudget:300000});E.purchase(s,'plush');E.feed(s);E.startEvent(s,e.id);const ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(s)]]));ui.click('continue');assert.match(ui.modal(),/event-image-close/);assert.ok(ui.modal().includes(e.title));ui.click('event-image-close');for(const text of ['무슨 일이 있었나요','왜 이런 행동을 했을까요','지금 할 대응을 골라 주세요'])assert.ok(ui.modal().includes(text));if(e.urgent)assert.match(ui.modal(),/지금 동물병원/);const c=e.choices.find(c=>!E.eventReason(ui.state(),c.id));ui.click('event',c.id);assert.equal(ui.state().pendingEvent,null,e.id);assert.equal(ui.state().incidents.at(-1).status,'resolved');
 }
});

test('all 17 selected pets keep their own coat atlas in incident scenes',()=>{
 const {prepared}=require('./helpers.cjs');for(const p of Object.values(D.PETS)){const s=prepared(p.id);E.feed(s);E.startEvent(s,'newHome');const ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(s)]]));ui.click('continue');assert.ok(ui.modal().includes(p.id+(p.species==='cat'?'-events-v1.png':'-states-v3.png')));assert.ok(ui.modal().includes(p.name));}
});

test('mode picker → direct later chapter → intro → scene → response → result, reload, replay and separate saves',()=>{
 const original=E.serialize(require('./helpers.cjs').prepared('dogSunny')),storage=new Map([[D.CONFIG.saveKey,original]]);let ui=harness(storage);
 ui.click('mode','experience');ui.click('start');assert.match(ui.html(),/CHAPTER 5/);assert.doesNotMatch(ui.html(),/data-id="dogChew"/);ui.click('scenario-start','gait');assert.match(ui.html(),/scenario-intro/);assert.equal(ui.experience().current.experience.step,'intro');assert.equal(storage.get(D.CONFIG.saveKey),original);
 ui=harness(storage);ui.click('mode','experience');ui.click('start');ui.click('experience-continue');ui.click('scenario-launch');assert.match(ui.modal(),/incident-image-modal/);ui.click('event-image-close');assert.equal((ui.modal().match(/class="incident-lesson"/g)||[]).length,3);ui.click('event','visit');assert.match(ui.html(),/다시 체험하기/);assert.match(ui.html(),/다음 사건/);assert.match(ui.html(),/사건 목록으로/);assert.equal(ui.experience().current.balance,1000000-E.expenses(ui.experience().current).total);assert.equal(ui.experience().current.ledger.at(-1).amount,35000);assert.equal(storage.get(D.CONFIG.saveKey),original);assert.equal(ui.experience().completed['catDudung:gait'],true);
 ui.click('scenario-next');assert.equal(ui.experience().current.experience.id,'urinaryEmergency');ui.click('scenario-launch');settle(ui,true);ui.click('scenario-list');assert.match(ui.html(),/체험 완료/);
 ui.click('scenario-start','urine');ui.click('scenario-launch');assert.match(ui.modal(),/incident-image-modal/);settle(ui,true);assert.equal(ui.experience().seen.urine,true);ui.click('scenario-retry');ui.click('scenario-launch');assert.equal(ui.modal(),'');assert.equal(ui.experience().current.experience.step,'result');assert.equal(ui.experience().current.incidents.length,0);
 ui.click('scenario-list');ui.click('experience-reset');ui.click('experience-reset-confirm');assert.equal(ui.experience().seen.urine,false);assert.equal(Object.keys(ui.experience().completed).length,0);assert.equal(storage.get(D.CONFIG.saveKey),original);
});

test('real motion handler blocks a second feed and survives refresh without repeating effects',()=>{
 const s=require('./helpers.cjs').prepared('catDudung');let ui=harness(new Map([[D.CONFIG.saveKey,E.serialize(s)]]),true);ui.click('continue');ui.click('feed');const saved=ui.storage.get(D.CONFIG.saveKey);assert.equal(ui.state().inventory.food,s.inventory.food-1);assert.ok(ui.nodes['#app'].inert);assert.ok(ui.state().flow.queue.length);
 ui.click('act','rest');assert.equal(ui.storage.get(D.CONFIG.saveKey),saved);ui=harness(ui.storage,true);ui.click('continue');ui.flush(4400);assert.equal(ui.state().inventory.food,s.inventory.food-1);ui.flush(4400);settle(ui);assert.equal(ui.state().today.meals.length,1);assert.equal(ui.state().inventory.food,s.inventory.food-1);assert.equal(ui.state().toilet.waste.filter(w=>w.kind==='urine').length,1);
});
