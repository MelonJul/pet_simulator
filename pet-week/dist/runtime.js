/* Durable presentation queue. Commands commit once; replaying motion never repeats care. */
(function(root){
 'use strict';const node=typeof module!=='undefined'&&module.exports,E=node?require('./engine.js'):root.PetEngine,D=node?require('./data.js'):root.PetData,ED=node?require('./event-data.js'):root.PetEventData;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const EXPERIENCE_KEY='first-together-experience-v1';
 function ensure(s){s.mode??='simulation';s.flow??={serial:0,queue:[]};s.toilet??={seen:{stool:false,urine:false},done:{},waste:[]};s.eventSchedule??={day:0,count:0,checkpoints:0,target:2,seriousRolled:false};return s;}
 function enqueue(s,type,data={}){ensure(s);const job={id:++s.flow.serial,type,...data};s.flow.queue.push(job);return job;}
 function current(s){return ensure(s).flow.queue[0]||null;}
 function rng(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
 function schedule(s){
  if(s.mode==='experience'||s.stage!=='care'||s.stats.nutrition<=ED.CONFIG.minSafeNutrition||s.stats.hydration<=ED.CONFIG.minSafeHydration)return;
  let day=s.eventSchedule;if(day.day!==s.day){const existing=s.incidents.filter(i=>i.day===s.day&&!D.EVENTS.find(e=>e.id===i.eventId)?.routine);day=s.eventSchedule={day:s.day,count:existing.length,checkpoints:0,target:ED.CONFIG.minPerDay+Math.floor(rng(s)*(ED.CONFIG.maxPerDay-ED.CONFIG.minPerDay+1)),seriousRolled:existing.some(i=>D.EVENTS.find(e=>e.id===i.eventId)?.serious)};}
  day.checkpoints++;if(day.count>=Math.min(day.target,ED.CONFIG.maxPerDay))return;
  const force=day.count<ED.CONFIG.minPerDay&&day.checkpoints>=(day.count?5:1);
  if(!force&&rng(s)>ED.CONFIG.chance)return;
  const pool=E.eventCandidates(s).filter(x=>!x.event.routine&&!x.event.demoMotion),last=s.incidents.filter(i=>!D.EVENTS.find(e=>e.id===i.eventId)?.routine).at(-1);
  let eligible=pool.filter(x=>!x.event.serious&&x.event.id!==last?.eventId);
  if(!day.seriousRolled){day.seriousRolled=true;if(rng(s)<ED.CONFIG.seriousChance){const rare=pool.filter(x=>x.event.serious);if(rare.length)eligible=rare;}}
  if(s.day===1&&!s.incidents.length)eligible=[{event:D.EVENTS.find(e=>e.id==='newHome'),weight:1}];
  if(!eligible.length)return;let roll=rng(s)*eligible.reduce((n,x)=>n+x.weight,0);const chosen=eligible.find(x=>(roll-=x.weight)<0)||eligible.at(-1);
  day.count++;enqueue(s,'event',{eventId:chosen.event.id});
 }
 function toiletLocation(s){if(E.pet(s).species==='cat'&&E.have(s,'litterBox')){const base=E.item('litterBox').room;return {place:'litterBox',x:s.room.layout.litterBox?.x??base[0],y:(s.room.layout.litterBox?.y??base[1])-5};}return {place:E.have(s,'pads')?'pad':'floor',x:83,y:82};}
 function queueToilet(s,kind){const key=s.day+':'+kind;if(s.toilet.done[key])return;s.toilet.done[key]=true;enqueue(s,'motion',{action:kind,location:toiletLocation(s)});}
 function command(s,type,...args){
  ensure(s);if(current(s)||s.pendingEvent)return {ok:false,message:'지금 동작과 상황이 끝난 뒤 선택해 주세요.'};
  const beforePhase=s.phase,drinks=s.today?.drinks||0,tool=type==='act'?(args[1]||E.chosenItem(s,args[0])):null;
  const fn={feed:E.feed,act:E.act,drink:E.drink,end:E.endPeriod,next:E.nextDay}[type];if(!fn)return {ok:false,message:'알 수 없는 행동이에요.'};
  const r=fn(s,...args);if(!r.ok||s.stage==='ended')return r;
  const action=type==='act'?args[0]:type;
  if(type==='feed'&&args[0]!==0)enqueue(s,'motion',{action:'feed',target:'bowl'});
  if(type==='act')enqueue(s,'motion',{action:action==='water'?'drink':action,target:tool,response:r.response,drank:action==='water'?s.today.drinks>drinks:undefined});
  if(type==='drink'&&r.drank)enqueue(s,'motion',{action:'drink',target:'waterBowl',drank:true});
  if(type!=='drink'&&action!=='water'&&(s.today?.drinks||0)>drinks)enqueue(s,'motion',{action:'drink',target:'waterBowl',drank:true});
  if(action==='clean'){s.toilet.waste=[];E.record(s,'cleaning','배변 흔적 정리','배설물과 젖은 흔적을 치웠다.',['화장실·패드·바닥에 남은 게임 흔적이 없어졌다.']);}
  if(type==='feed'&&s.stage==='care'){if(beforePhase===0)queueToilet(s,'urine');if(beforePhase===2)queueToilet(s,'stool');}
  if(['feed','act','end','next'].includes(type))schedule(s);
  return r;
 }
 function finishMotion(s,id){
  const job=current(s);if(!job||job.id!==id||job.type!=='motion')return {ok:false,message:'이미 마친 동작이에요.'};s.flow.queue.shift();
  if(['stool','urine'].includes(job.action)&&s.stage!=='ended'){
   const loc=job.location||toiletLocation(s);s.toilet.waste.push({id:job.id,kind:job.action,...loc});E.change(s,{cleanliness:-2},'일반 배변 흔적');
   E.record(s,'toilet',job.action==='stool'?'대변을 봄':'소변을 봄',loc.place==='litterBox'?'화장실을 이용하고 앞발로 모래를 덮었다.':loc.place==='pad'?'패드에서 자기 자세로 배변한 뒤 돌아왔다.':'준비된 배변 장소가 없어 바닥에 흔적이 남았다.',[`${loc.place==='litterBox'?'화장실':loc.place==='pad'?'배변패드':'바닥'}에 ${job.action==='stool'?'대변':'소변'} 흔적이 남아 청소할 수 있다.`],{kind:job.action});
   if(!s.toilet.seen[job.action]){s.toilet.seen[job.action]=true;s.flow.queue.unshift({id:++s.flow.serial,type:'event',eventId:job.action,educationOnly:s.mode!=='experience'});}
  }
  return {ok:true,message:'동작을 마쳤어요.'};
 }
 function advance(s){
  if(s.stage==='ended'){s.flow.queue=[];return null;}
  if(s.pendingEvent)return null;const job=current(s);if(!job)return null;
  if(job.type==='event'){s.flow.queue.shift();const r=E.startEvent(s,job.eventId,{presentation:true});if(r.ok&&job.educationOnly)E.closeEventImage(s);return r;}
  return job;
 }
 function progress(raw){try{const p=JSON.parse(raw);if(p?.version===1&&p.completed&&p.seen&&D.PETS[p.petId])return p;}catch{}return {version:1,petId:'catDudung',completed:{},seen:{stool:false,urine:false},current:null};}
 function scenario(p,petId,id){
  const e=D.EVENTS.find(e=>e.id===id&&!e.retired&&(e.species==='all'||e.species===D.PETS[petId]?.species));if(!e)return null;
  const s=E.newGame(petId,{startingBudget:1000000,seed:42});for(const i of E.availableItems(s))E.purchase(s,i.id);E.finishShopping(s);ensure(s);s.mode='experience';s.toilet.seen=clone(p.seen);s.stats.stress=35;s.stats.hydration=50;s.stats.nutrition=60;s.phase=1;s.remainingActions=2;
  s.experience={id,step:'intro',result:null};return s;
 }
 function launch(s){
  if(s.mode!=='experience'||s.experience.step!=='intro')return {ok:false,message:'이미 시작한 체험이에요.'};s.experience.step='playing';const e=D.EVENTS.find(e=>e.id===s.experience.id),a=e.demoMotion;
  if(a==='feed'){s.phase=0;E.feed(s);enqueue(s,'motion',{action:'feed',target:'bowl'});}
  else if(a==='water'){E.act(s,'water');enqueue(s,'motion',{action:'drink',target:'waterBowl',drank:true});}
  else if(a==='play'){const item=E.pet(s).favoriteItems.find(id=>E.have(s,id))||'toy',r=E.act(s,'play',item);enqueue(s,'motion',{action:'play',target:item,response:r.response});}
  else if(['stool','urine'].includes(a)){enqueue(s,'motion',{action:a,location:toiletLocation(s)});return {ok:true};}
  else enqueue(s,'motion',{action:'look',target:null});
  enqueue(s,'event',{eventId:e.id});return {ok:true};
 }
 function completeScenario(s,p){if(s.mode!=='experience'||s.pendingEvent||current(s)||s.experience.step!=='playing')return false;const i=s.incidents.at(-1);s.experience.step='result';s.experience.result=i?.result||'배변 동작과 흔적을 기록했어요. 이미 읽은 일반 배변 안내는 다시 표시하지 않아요.';p.completed[s.petId+':'+s.experience.id]=true;p.seen=clone(s.toilet.seen);return true;}
 const api={EXPERIENCE_KEY,ensure,current,enqueue,command,advance,finishMotion,queueToilet,toiletLocation,progress,scenario,launch,completeScenario,schedule};if(node)module.exports=api;root.PetRuntime=api;
})(typeof globalThis!=='undefined'?globalThis:this);
