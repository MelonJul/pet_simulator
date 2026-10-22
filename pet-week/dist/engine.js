/* All state transitions pass through change/checkEnd; ended is an absorbing state. */
(function(root){
  'use strict';
  const node=typeof module!=='undefined'&&module.exports,D=node?require('./data.js'):root.PetData,B=node?require('./behavior.js'):root.PetBehavior;
  const ED=node?require('./event-data.js'):root.PetEventData;
  const {CONFIG,PETS,ITEMS,ACTIONS,EVENTS}=D,clone=x=>JSON.parse(JSON.stringify(x)),clamp=B.clamp;
  const item=id=>ITEMS.find(x=>x.id===id),pet=s=>PETS[s.petId],have=(s,id,n=1)=>(s.inventory[id]||0)>=n;
  const availableItems=s=>ITEMS.filter(i=>i.species==='all'||i.species===pet(s).species);
  const basePrice=(s,id)=>s.prices[id];
  const price=(s,id,late=s.stage!=='shopping')=>Math.round(basePrice(s,id)*(late?s.settings.reorderMultiplier:1));
  const timeLabel=s=>s.day===0?'입양 전 쇼핑':D.PHASES[s.phase];
  function log(s,type,action,reaction,changes=[],extra={}){
    const e={id:++s.sequence,day:s.day,phase:s.phase,slot:timeLabel(s),time:['08:00','10:00','12:00','15:00','18:00'][s.phase],type,action,reaction,changes,source:'직접 확인',...extra};s.journal.push(e);return e;
  }
  function checkEnd(s,cause='상태 변화'){
    if(s.stage==='ended')return true;if(!['care','summary'].includes(s.stage))return false;
    const causes=['nutrition','hydration'].filter(k=>s.stats[k]<=0);if(!causes.length)return false;
    s.ending={day:s.day,phase:s.phase,slot:timeLabel(s),causes,cause,recorded:false,recent:[]};s.stage='ended';if(s.activeEvent){const incident=s.incidents?.find(e=>e.instanceId===s.activeEvent);if(incident&&incident.status==='pending')incident.status='interrupted';}s.activeEvent=null;s.pendingEvent=null;s.remainingActions=0;return true;
  }
  function completeEnd(s){
    if(s.stage!=='ended'||s.ending.recorded)return;s.ending.recent=s.journal.slice(-10).map(e=>e.id);s.ending.recorded=true;
    const text=s.ending.causes.map(k=>D.STAT_LABELS[k]).join('·')+' 상태가 0에 도달하여 이번 게임을 종료했어요.';
    log(s,'ending','돌봄 시뮬레이션 종료',text,['둘 중 하나라도 0이면 종료되는 게임 규칙입니다. 실제 생존 시간이나 의학적 기준이 아닙니다.'],{source:'게임 규칙'});s.lastMessage=text;
  }
  function respond(s,message,extra={}){if(s.stage==='ended')completeEnd(s);else s.lastMessage=message;return {ok:true,message:s.lastMessage,...extra,ended:s.stage==='ended'};}
  function guard(s,stages=['care']){if(checkEnd(s)){completeEnd(s);return '이미 종료된 게임은 다시 돌볼 수 없어요. 새 게임을 시작해 주세요.';}return stages.includes(s.stage)?'':'지금은 이 행동을 할 수 없어요.';}
  function change(s,effects,cause){if(['ended','final'].includes(s.stage))return false;for(const [k,v] of Object.entries(effects))if(k in s.stats)s.stats[k]=clamp(s.stats[k]+v);s.revision++;return !checkEnd(s,cause);}
  function warn(s){return ['nutrition','hydration'].filter(k=>s.stats[k]<=CONFIG.warningThreshold).map(key=>({key,severe:s.stats[key]<=CONFIG.criticalThreshold,text:key==='nutrition'?'밥그릇을 찾는 신호가 강해요. 시간을 넘기기 전에 식사와 사료 재고를 확인해요.':'입가를 핥고 물을 찾는 신호가 강해요. 새 물이 있는지, 실제로 마셨는지 확인해요.'}));}
  function newGame(petId,options={}){
    if(!PETS[petId])throw Error('알 수 없는 동물이에요.');const settings=clone(CONFIG);
    for(const k of ['shoppingSeconds','startingBudget'])if(Number.isFinite(options[k]))settings[k]=Math.round(options[k]);
    settings.shoppingSeconds=clamp(settings.shoppingSeconds,10,600);settings.startingBudget=clamp(settings.startingBudget,50000,1000000);settings.actionsPerPeriod=2;
    return {version:3,mode:'simulation',flow:{serial:0,queue:[]},toilet:{seen:{stool:false,urine:false},done:{},waste:[]},eventSchedule:{day:0,count:0,checkpoints:0,target:2,seriousRolled:false},settings,prices:Object.fromEntries(ITEMS.map(i=>[i.id,i.price])),pricingRevision:D.PRICES.REVISION,petId,stage:'shopping',day:0,phase:0,remainingActions:0,balance:settings.startingBudget,remainingMs:settings.shoppingSeconds*1000,cart:{},inventory:{},initialInventory:{},ledger:[],history:[],today:null,stats:clone(PETS[petId].startStats),pendingEvent:null,activeEvent:null,incidents:[],eventSequence:0,environment:{},usedEvents:[],room:{layout:{},pet:{x:49,y:77}},rng:(options.seed??CONFIG.seed??Date.now())>>>0,journal:[],sequence:0,revision:0,observation:null,discoveries:{},water:{amount:0,freshDay:-1},adaptation:10,lastInteraction:null,ending:null,lastMessage:'작은 친구의 신호를 읽는 일주일을 준비해요.',savedAt:null};
  }
  function shopReason(s,id){const g=guard(s,['shopping','care','summary']);if(g)return g;if(s.pendingEvent&&eventView(s)?.incident.screen==='image')return '이미지의 닫기를 눌러 설명을 먼저 확인해 주세요.';const i=item(id);if(!i||!availableItems(s).some(v=>v.id===id))return '이 동물에게 사용할 수 없는 상품이에요.';if(i.kind==='durable'&&(have(s,id)||(s.cart[id]||0)>0))return '이미 준비한 재사용 물품이에요.';return s.balance<price(s,id)?'잔액이 부족해요.':'';}
  function purchase(s,id){
    const reason=shopReason(s,id);if(reason)return {ok:false,message:reason};const i=item(id),amount=price(s,id);s.balance-=amount;s.revision++;
    if(s.stage==='shopping')s.cart[id]=(s.cart[id]||0)+1;
    else{s.inventory[id]=(s.inventory[id]||0)+i.qty;s.ledger.push({day:s.day,phase:s.phase,category:'additional',item:id,label:i.name,amount,qty:i.qty});log(s,'expense',`${i.name} 추가 주문 · ${amount.toLocaleString('ko-KR')}원`,i.placement==='room'?'물품이 도착해 방에 설치했다.':'물품이 도착해 인벤토리에 넣었다.',[`${i.qty}${i.unit} 추가 · 잔액 ${s.balance.toLocaleString('ko-KR')}원`],{itemId:id,amount});}
    return respond(s,`${i.name} ${i.qty}${i.unit} 준비했어요.`);
  }
  function removeCart(s,id){if(s.stage!=='shopping'||!(s.cart[id]>0))return {ok:false,message:'장바구니에 없는 물품이에요.'};s.cart[id]--;s.balance+=basePrice(s,id);s.revision++;return respond(s,'장바구니에서 뺐어요.');}
  function essentialItems(s){return availableItems(s).filter(i=>i.essential||(i.id==='toy'&&pet(s).species==='dog'));}
  function beginDay(s){
    s.phase=0;s.remainingActions=0;s.pendingEvent=null;s.lastInteraction=null;s.today={day:s.day,startStats:clone(s.stats),endStats:null,meals:[],actions:[],counts:{},events:[],activityFit:0,notes:[],drinks:0,summary:null};
    if(s.day>1){change(s,{...s.settings.dailyDecay,activity:-pet(s).activityNeed,stress:Math.max(1,7-pet(s).adaptation*3),fatigue:-42},'밤이 지나 다음 날 아침이 됨');log(s,'time','밤이 지나 아침이 됨','새로운 하루가 시작됐다.',['식사·수분이 시간 진행에 따라 줄었다. 새로운 상태는 관찰해서 확인해요.'],{source:'게임 규칙'});if(s.stage==='ended')return;s.adaptation=clamp(s.adaptation+pet(s).adaptation*10+(s.stats.stress<55?5:0));}
    change(s,{stress:-(have(s,'bed')||have(s,'hideout')?3:0)-(pet(s).species==='cat'&&have(s,'scratch')?4:0)-(pet(s).species==='cat'&&have(s,'catTower')?3:0)},'생활 공간의 영향');
  }
  function finishShopping(s){
    if(s.stage!=='shopping')return {ok:false,message:'이미 쇼핑을 마쳤어요.'};
    for(const [id,packs] of Object.entries(s.cart)){if(!packs)continue;const i=item(id),amount=packs*basePrice(s,id);s.inventory[id]=packs*i.qty;s.ledger.push({day:0,phase:0,category:'initial',item:id,label:i.name,amount,qty:packs*i.qty});log(s,'expense',`${i.name} 초기 준비 · ${amount.toLocaleString('ko-KR')}원`,i.placement==='room'?'방에 설치할 물품을 준비했다.':'인벤토리에 물품을 보관했다.',[`${packs*i.qty}${i.unit} 보유`],{itemId:id,amount});}
    s.initialInventory=clone(s.inventory);s.cart={};s.day=1;s.stage='care';beginDay(s);log(s,'arrival',`${pet(s).name} 입양 첫날`,pet(s).habit,['세부 취향과 오늘의 음수 여부는 아직 확인하지 않았어요.']);return respond(s,`${pet(s).name}가 도착했어요. 먼저 관찰하고 아침 식사를 준비해요.`);
  }
  function tickShopping(s,ms){if(s.stage!=='shopping'||!Number.isFinite(ms)||ms<0)return false;s.remainingMs=Math.max(0,s.remainingMs-ms);if(!s.remainingMs){finishShopping(s);return true;}return false;}
  function mealReason(s,amount,urgent=false){const g=guard(s);if(g)return g;if(s.pendingEvent)return '먼저 현재 상황에 대응해 주세요.';if(!urgent&&![0,2,4].includes(s.phase))return '지금은 급여 시간이 아니에요.';if(urgent&&s.stats.nutrition>30)return '부족한 식사 보충은 식사 상태가 낮을 때만 가능해요.';if(urgent&&amount!==1)return '부족한 식사는 1끼분씩 보충해요.';if(![0,1,2].includes(amount))return '급여량을 확인해 주세요.';if(amount&&!have(s,'bowl'))return '밥그릇을 먼저 준비해 주세요.';if(amount&&!have(s,'food',amount))return '사료 재고가 부족해요. 추가 주문을 확인해요.';return '';}
  function autoDrink(s){if(s.stage==='care'&&s.stats.hydration<72&&s.water.amount>0&&s.water.freshDay===s.day&&s.stats.stress<85)drink(s,true);}
  function feed(s,amount=1,urgent=false){
    const reason=mealReason(s,amount,urgent);if(reason)return {ok:false,message:reason};const before=clone(s.stats),phase=s.phase;if(amount)s.inventory.food-=amount;
    const reaction=amount===1?'사료를 먹고 입가를 핥은 뒤 그릇에서 물러난다.':amount===2?'사료를 많이 먹은 뒤 잠깐 움직임을 줄인다.':'밥그릇 주변을 살피고 보호자를 바라본다.';
    if(!urgent)s.today.meals.push({phase,amount,proper:amount===1});change(s,amount===1?{nutrition:26,health:1,bond:1}:amount===2?{nutrition:29,health:-4,stress:3}:{nutrition:-12,health:-5,stress:5},amount?'급여':'식사 건너뛰기');
    log(s,'feed',urgent?'부족한 식사 1끼 보충':amount?`사료 ${amount}끼분 급여`:'이번 식사 건너뛰기',reaction,B.visibleChanges(before,s.stats),{amount,proper:!urgent&&amount===1});if(s.stage==='ended')return respond(s,reaction);
    if(urgent){s.today.notes.push('식사 부족 신호를 보고 사료를 보충했어요.');return respond(s,'부족한 식사를 보충했어요. 예정된 식사 기록과는 구분해요.');}
    change(s,s.settings.timeDecay.meal,'식사 시간 경과');if(s.stage==='ended')return respond(s,reaction);autoDrink(s);
    if(phase===4)finishDay(s);else{s.phase++;s.remainingActions=s.settings.actionsPerPeriod;}
    return respond(s,amount===1?'정량의 사료 1끼를 먹는 모습을 확인했어요.':amount===2?'한 번에 2끼분을 급여했어요. 이 게임의 정량을 넘겼어요.':'이번 식사를 놓쳤어요. 식사 신호가 강해지기 전에 다음 식사를 챙겨요.');
  }
  function drinkReason(s){const g=guard(s);if(g)return g;if(s.pendingEvent)return '먼저 현재 상황에 대응해 주세요.';if(!have(s,'waterBowl'))return '물그릇이 필요해요.';if(s.water.amount<=0)return '물그릇이 비었어요. 돌봄 시간에 물을 갈아 주세요.';if(s.water.freshDay!==s.day)return '오늘의 새 물로 교체한 뒤 확인해 주세요.';return s.stats.hydration>=94?'지금은 더 마실 필요가 없어 보여요.':'';}
  function drink(s,automatic=false){
    const reason=drinkReason(s);if(reason)return {ok:false,message:reason};
    if(s.stats.stress>=85){const text='주변을 경계하며 물그릇에서 물러났어요. 자극을 줄이고 쉬도록 한 뒤 다시 살펴요.';if(s.lastDrinkRefusal!==s.revision){log(s,'drink-attempt','실제 음수 확인','물그릇에 다가갔지만 아직 마시지 않았다.',['음수를 확인하지 못했으므로 수분 회복 기록은 없다.']);s.lastDrinkRefusal=s.revision;}return respond(s,text,{drank:false});}
    const before=clone(s.stats);s.water.amount--;s.today.drinks++;change(s,{hydration:pet(s).drinkAmount},'실제 음수');log(s,'drink',automatic?'스스로 마시는 모습 확인':'조용히 음수 확인','물그릇에 고개를 낮추고 혀로 물을 여러 번 마신다.',B.visibleChanges(before,s.stats),{automatic});return respond(s,'실제로 물을 마시는 모습을 확인했어요. 수분 상태가 회복됐어요.',{drank:true});
  }
  function observe(s){
    const g=guard(s);if(g)return {ok:false,message:g};if(s.pendingEvent)return {ok:false,message:'먼저 현재 사건에 대응해 주세요.'};if(s.observation?.revision===s.revision&&s.observation.day===s.day&&s.observation.phase===s.phase)return respond(s,'같은 순간의 관찰 기록을 다시 펼쳤어요.',{observation:clone(s.observation),reused:true});
    const o=B.observe(s);s.observation=o;s.today.counts.observe=(s.today.counts.observe||0)+1;log(s,'observation','거리와 시간을 두고 관찰',o.lines.join(' '),['이번에 직접 본 신호를 기록했다. 내부 수치나 질병을 진단한 기록은 아니다.'],{signals:clone(o.signals),source:'직접 관찰'});return respond(s,o.lines[0],{observation:clone(o)});
  }
  function actionItems(s,id){return availableItems(s).filter(i=>i.use===id&&have(s,i.id));}
  function chosenItem(s,id,selectedId){return selectedId||actionItems(s,id)[0]?.id||({play:pet(s).species==='cat'?'wand':'toy',treat:'treat',catnip:'catnip'}[id]);}
  function requirements(s,id,selectedId){if(id==='water'||id==='drink')return {tools:['waterBowl'],consume:{}};if(id==='clean')return pet(s).species==='dog'?{tools:[],consume:{cleaner:1,pads:1}}:{tools:['litterBox'],consume:{cleaner:1,litter:1}};if(id==='play')return {tools:[chosenItem(s,id,selectedId)],consume:{}};if(id==='walk')return {tools:['harness'],consume:{bags:1}};if(id==='hygiene')return {tools:['hygiene'],consume:{}};if(['treat','catnip'].includes(id))return {tools:[],consume:{[chosenItem(s,id,selectedId)]:1}};if(id==='rest'&&selectedId)return {tools:[selectedId],consume:{}};return {tools:[],consume:{}};}
  function actionReason(s,id,selectedId){
    const g=guard(s);if(g)return g;const a=ACTIONS.find(a=>a.id===id);if(!a)return '알 수 없는 행동이에요.';if(id==='observe')return s.pendingEvent?'먼저 현재 사건에 대응해 주세요.':'';if(id==='drink')return drinkReason(s);
    if(![1,3].includes(s.phase)||s.pendingEvent)return '돌봄 시간에 선택할 수 있어요.';if(id==='walk'&&pet(s).species==='cat')return '고양이에게는 실내 놀이를 제공해요.';if(id==='catnip'&&pet(s).species!=='cat')return '캣닢은 고양이 전용 물품이에요.';
    if(selectedId&&!availableItems(s).some(i=>i.id===selectedId&&i.use===id))return '이 행동에 사용할 수 없는 물품이에요.';if(s.remainingActions<a.cost)return '이번 시간의 행동을 모두 사용했어요.';
    const req=requirements(s,id,selectedId),missing=[...req.tools,...Object.keys(req.consume)].filter(k=>!have(s,k,req.consume[k]||1));return missing.length?`${missing.map(k=>item(k)?.name||k).join(', ')} 필요`:'';
  }
  function act(s,id,selectedId,style='gentle'){
    const reason=actionReason(s,id,selectedId);if(reason)return {ok:false,message:reason};if(id==='observe')return observe(s);if(id==='drink')return drink(s);if(!['gentle','active'].includes(style))return {ok:false,message:'놀이 강도를 확인해 주세요.'};
    const p=pet(s),a=ACTIONS.find(a=>a.id===id),req=requirements(s,id,selectedId),before=clone(s.stats),used=chosenItem(s,id,selectedId),object=item(used),count=s.today.counts[id]||0,mult=count===0?1:count===1?.45:.15;
    let effect=clone(a.effects),reaction='',fit=0,response=null;for(const [k,n] of Object.entries(req.consume))s.inventory[k]-=n;s.remainingActions-=a.cost;s.today.counts[id]=count+1;
    if(id==='water'){effect={bond:1};s.water={amount:3,freshDay:s.day};reaction='새 물을 바라보고 냄새를 맡는다. 아직 실제로 마신 것은 확인하지 않았다.';}
    if(id==='clean'&&s.toilet)s.toilet.waste=[];
    if(id==='clean')reaction=p.species==='cat'?'정리된 화장실 주변을 돌아보고 자리를 확인한다.':'패드를 교체한 공간에 다가가 냄새를 맡는다.';
    if(id==='hygiene')reaction='몸을 만지는 동안의 반응을 보고 짧게 빗질과 위생 관리를 마친다.';
    if(id==='rest'){effect={stress:-p.rest*((have(s,'bed')||have(s,'hideout'))?1:.6),health:2,bond:3,fatigue:-32};reaction='조용한 공간에서 몸을 말고 눈을 감는다. 접촉을 강요하지 않고 기다렸다.';}
    if(id==='play'){
      response=B.toyResponse(s,used,style);effect=response.effects;reaction=response.reaction;fit=response.fit;s.lastInteraction={...response,revision:s.revision+1};
      const d=s.discoveries[used]||(s.discoveries[used]={attempts:0,reactions:{},lastDay:0,notes:[]});d.attempts++;d.reactions[response.attitude]=(d.reactions[response.attitude]||0)+1;d.lastDay=s.day;d.notes.push({day:s.day,phase:s.phase,attitude:response.attitude,reason:response.reason});
    }
    if(id==='walk'){const gentle=style==='gentle',overloaded=s.stats.fatigue>75||!gentle&&p.lifeStage!=='adult';effect={activity:overloaded?8:p.activityNeed,stress:overloaded?3:-12,bond:4,fatigue:Math.round((gentle?6:13)*p.fatigueRate)};fit=overloaded?.3:1;reaction=overloaded?'자주 멈춰 서고 쉬는 자리를 찾는다. 다음에는 강도를 낮추고 휴식을 먼저 확인해야겠다.':'자기 속도로 냄새를 맡으며 짧게 걷고 편안하게 돌아온다.';}
    if(id==='treat'){effect={...(object.effects||a.effects)};delete effect.hydration;if(p.favoriteTreat===used)effect.bond+=2;if(count){effect.health=-5;effect.stress=2;}reaction=`${object.name}를 조금 먹고 입가를 핥는다. `+(count?'종류를 바꿔도 반복 간식이다. 식사를 대신하지 않는다.':'간식을 먹은 사실과 정규 식사는 따로 기록한다.');}
    if(id==='catnip'){effect={stress:-10*p.catnipResponse,activity:7*p.catnipResponse,bond:1};reaction=p.catnipResponse<.5?'냄새를 살짝 맡고 관심을 돌린다. 억지로 권하지 않고 마쳤다.':'냄새를 맡고 몸을 살짝 비비다가 편하게 앉는다.';}
    effect=Object.fromEntries(Object.entries(effect).map(([k,v])=>[k,v*mult]));change(s,effect,a.name);s.today.activityFit=Math.max(s.today.activityFit,fit);
    s.today.actions.push({id,itemId:object?.id||null,phase:s.phase,effects:clone(effect),message:reaction,response:response?clone(response):null});log(s,id==='play'?'play':'care',a.name+(object?' · '+object.name:''),reaction,B.visibleChanges(before,s.stats),{itemId:object?.id||null,response:response?clone(response):null});
    if(s.stage==='ended')return respond(s,reaction,{response});change(s,{...s.settings.timeDecay.action,fatigue:id==='rest'?0:1},`${a.name} 동안 시간 경과`);let drank=false;if(s.stage!=='ended'){if(id==='water'){const drinking=drink(s,true);drank=!!drinking.drank;reaction=drank?'새 물로 교체한 뒤 스스로 다가가 실제로 마셨어요.':drinking.message;}else autoDrink(s);}
    return respond(s,reaction+(response?' '+response.reason:'')+(count?' 같은 행동을 반복해 효과가 줄었어요.':''),{response,drank:id==='water'?drank:undefined});
  }
  function endPeriod(s){const g=guard(s);if(g)return {ok:false,message:g};if(![1,3].includes(s.phase)||s.pendingEvent)return {ok:false,message:'지금은 시간을 넘길 수 없어요.'};if(s.remainingActions)s.today.notes.push(`${timeLabel(s)}에 행동 ${s.remainingActions}회를 남겼어요.`);change(s,{...s.settings.timeDecay.period,fatigue:3},`${timeLabel(s)}에서 다음 시간으로 이동`);log(s,'time','다음 시간으로 이동','시간이 흘렀다.',['식사·수분 소모가 적용됐다. 반려동물의 신호를 다시 살펴요.'],{source:'게임 규칙'});if(s.stage==='ended')return respond(s,'');autoDrink(s);s.phase++;s.remainingActions=0;return respond(s,`${timeLabel(s)} 시간이에요. 식사와 실제 음수 기록을 확인해요.`);}
  function ensureEvents(s){s.incidents??=[];s.eventSequence??=0;s.activeEvent??=null;s.environment??={};}
  function eventContext(s){
    const recent=[...s.history.slice(-2).flatMap(d=>d.actions),...(s.today?.actions||[])],scratch=s.room.layout.scratch||{x:14,y:76};
    return {have:id=>have(s,id),scratchNear:Math.hypot(scratch.x-30,scratch.y-69)<18,recentPlay:recent.some(a=>a.id==='play'),recentWalk:recent.some(a=>a.id==='walk'),toyUses:recent.filter(a=>a.itemId==='plush').length,
      persistentChange:s.history.slice(-2).length===2&&s.history.slice(-2).every(d=>d.endStats.health<pet(s).startStats.health-8||d.endStats.fatigue>=65),priorConsult:s.incidents.some(e=>e.eventId==='health'&&e.status==='resolved')};
  }
  function eventCandidates(s){
    ensureEvents(s);const p=pet(s),context=eventContext(s),last=s.incidents.at(-1);
    return EVENTS.filter(e=>!e.retired&&(e.species==='all'||e.species===p.species)&&s.day>=(e.minDay||1)&&last?.eventId!==e.id&&!s.incidents.some(i=>i.eventId===e.id&&s.day-i.day<(e.cooldownDays||ED.CONFIG.cooldownDays)))
      .map(event=>({event,weight:event.weight(s,p,context)*(s.environment.scratchAdjusted&&event.id==='catScratch'?.25:s.environment.litterAdjusted&&event.id==='catLitter'?.5:s.environment.aloneAdjusted&&event.id==='dogDoor'?.25:1)})).filter(c=>c.weight>0);
  }
  function eventChanges(before,after){return Object.keys(before).filter(k=>after[k]!==before[k]).map(k=>`${D.STAT_LABELS[k]||'피로'} ${after[k]-before[k]>0?'+':''}${Math.round((after[k]-before[k])*10)/10} (게임 상태 변화)`);}
  function startEvent(s,eventId,{legacy=false,presentation=false}={}){
    const g=guard(s);if(g)return {ok:false,message:g};ensureEvents(s);const e=EVENTS.find(e=>e.id===eventId);
    if(s.pendingEvent||!e||!legacy&&(!presentation&&![1,3].includes(s.phase)||(e.species!=='all'&&e.species!==pet(s).species)))return {ok:false,message:'지금은 사건을 시작할 수 없어요.'};
    const before=clone(s.stats),losses=[];if(!legacy)for(const [id,n] of Object.entries(e.loss||{})){const lost=Math.min(s.inventory[id]||0,n);if(lost){s.inventory[id]-=lost;losses.push(`${item(id).name} ${lost}${item(id).unit} 사용 중지`);}}
    const instanceId=++s.eventSequence,incident={instanceId,eventId:e.id,day:s.day,phase:s.phase,slot:timeLabel(s),status:'pending',screen:'image',title:e.title,description:e.description,context:[`${pet(s).name} · ${pet(s).age} · ${pet(s).type}`,`이번 사건 전 확인 기록: 오늘 놀이 ${s.today.counts.play||0}회, 산책 ${s.today.counts.walk||0}회, 휴식 ${s.today.counts.rest||0}회.`,`알려진 관리 사항: ${pet(s).careNotes}`],consequences:clone(e.consequence),changes:[],losses,amount:0,choice:null,followup:null};
    s.incidents.push(incident);s.activeEvent=instanceId;s.pendingEvent=e.id;s.usedEvents.push(e.id);if(!legacy)change(s,e.effects,e.title);
    incident.changes=eventChanges(before,s.stats);log(s,'situation',e.title,e.description,[...incident.consequences,...losses,...incident.changes,'발생 비용 0원 · 대응은 아직 선택하지 않았다.'],{eventInstance:instanceId,source:'사건에서 확인한 상황'});completeEnd(s);return {ok:true,message:e.title,ended:s.stage==='ended'};
  }
  function eventView(s,instanceId=s.activeEvent){const incident=s.incidents?.find(i=>i.instanceId===Number(instanceId));return incident?{incident,event:EVENTS.find(e=>e.id===incident.eventId)}:null;}
  function closeEventImage(s,instanceId=s.activeEvent){
    const g=guard(s);if(g)return {ok:false,message:g};const v=eventView(s,instanceId);if(!v||s.activeEvent!==v.incident.instanceId||v.incident.status!=='pending'||v.incident.screen!=='image')return {ok:false,message:'이미 상황 설명으로 이동했어요.'};
    v.incident.screen='education';return {ok:true,message:'상황의 이유와 대응 방법을 살펴봐요.'};
  }
  function eventReason(s,choiceId,instanceId=s.activeEvent){
    const g=guard(s);if(g)return g;const v=eventView(s,instanceId),c=v?.event.choices.find(c=>c.id===choiceId);
    if(!v||!c||s.activeEvent!==v.incident.instanceId||s.pendingEvent!==v.event.id||v.incident.status!=='pending')return '선택할 수 없는 대응이에요.';
    if(v.incident.screen!=='education')return '상황 이미지의 닫기를 눌러 설명을 먼저 확인해 주세요.';
    if(s.balance<(c.money||0))return '잔액이 부족해요.';if(s.remainingActions<(c.cost||0))return '남은 행동 횟수가 부족해요. 행동을 쓰지 않는 대응을 골라 주세요.';
    const miss=[...(c.require||[]),...Object.keys(c.consume||{})].filter(k=>!have(s,k,c.consume?.[k]||1));return miss.length?`${miss.map(k=>item(k).name).join(', ')} 필요`:'';
  }
  function resolveEvent(s,choiceId,instanceId=s.activeEvent){
    const reason=eventReason(s,choiceId,instanceId);if(reason)return {ok:false,message:reason};const {event:e,incident}=eventView(s,instanceId),c=e.choices.find(c=>c.id===choiceId),before=clone(s.stats);
    // Commit the instance before any consequence. A stale button cannot act on a later event.
    incident.status='resolved';incident.choice=c.id;incident.label=c.label;incident.result=c.result;incident.amount=c.money||0;incident.followup=c.followup||null;incident.actionCost=c.cost||0;
    for(const [k,n] of Object.entries(c.consume||{}))s.inventory[k]-=n;s.remainingActions-=c.cost||0;
    if(c.money){s.balance-=c.money;s.ledger.push({day:s.day,phase:s.phase,category:'special',type:c.expenseType||'special',label:c.label,amount:c.money,eventInstance:instanceId});log(s,'expense',`${c.label} · ${c.money.toLocaleString('ko-KR')}원`,'선택한 대응 비용을 지출했다.',[`잔액 ${s.balance.toLocaleString('ko-KR')}원`],{amount:c.money,eventInstance:instanceId});}
    for(const flag of c.flags||[])s.environment[flag]=true;for(const [id,pos] of Object.entries(c.place||{}))s.room.layout[id]=clone(pos);
    s.pendingEvent=null;s.activeEvent=null;change(s,c.effects,e.title);if(c.cost&&s.stage!=='ended')change(s,Object.fromEntries(Object.entries(s.settings.timeDecay.action).map(([k,v])=>[k,v*c.cost])),c.label+' 동안 시간 경과');
    incident.responseChanges=eventChanges(before,s.stats);incident.consumed=clone(c.consume||{});
    s.today.events.push({id:e.id,instanceId,title:e.title,choice:choiceId,label:c.label,quality:c.quality,money:c.money||0,result:c.result,followup:c.followup||null});
    log(s,c.hospital?'hospital':'event',c.label,c.result,[...incident.responseChanges,...Object.entries(c.consume||{}).map(([id,n])=>`${item(id).name} ${n}${item(id).unit} 소모`),`행동 ${c.cost||0}회 · 지출 ${c.money||0}원`,...(c.followup?[c.followup]:[])],{eventInstance:instanceId});return respond(s,c.result);
  }
  function daySummary(s){
    const d=s.today,seen=s.journal.filter(e=>e.day===s.day&&e.type==='observation'),earlier=s.journal.filter(e=>e.day<s.day&&e.type==='observation').at(-1),last=seen.at(-1);
    const changes=[`정량 식사 ${d.meals.filter(m=>m.proper).length}/3회, 물 교체 ${d.counts.water||0}회, 실제 음수 ${d.drinks}회를 확인했다.`,`배변 처리 ${d.counts.clean||0}회, 놀이·산책 ${d.actions.filter(a=>['play','walk'].includes(a.id)).length}회를 진행했다.`];
    if(!last)changes.push('오늘 직접 관찰한 기록이 없어 상태 변화는 미확인이다.');
    else{changes.push('마지막 관찰: '+last.signals.map(v=>v.text).join(' '));if(earlier){const now=last.signals.map(v=>v.key),gone=earlier.signals.map(v=>v.key).filter(k=>!now.includes(k));changes.push(gone.length?`이전 관찰(${earlier.day}일 차)에서 보인 ${gone.map(k=>B.stateLabels[k]).join('·')} 신호는 이번 관찰에 나타나지 않았다. 한 번의 관찰로 완전히 해결됐다고 단정하지 않는다.`:'이전 관찰과 겹치는 신호가 있어 다음 날에도 비교해 볼 필요가 있다.');}}
    for(const e of d.events)changes.push('사건 · '+e.title+': '+e.result);
    const next=d.events.filter(e=>e.followup).map(e=>e.followup);next.push('다음 날 첫 식사와 실제 음수 모습을 확인하고 오늘 관찰과 비교해요.');if(!have(s,'food',3))next.push('사료 3끼 이상을 확보해요.');if(!d.counts.water||!d.drinks)next.push('새 물 준비와 실제 음수를 각각 확인해요.');if(last?.signals.some(v=>['uncomfortable','anxious','sleepy'].includes(v.key)))next.push('휴식 뒤에도 평소와 다른 자세가 이어지는지 살펴보고 필요하면 상담해요.');return {changes,next,observations:seen.length};
  }
  function finishDay(s){if(s.stage!=='care'||s.today.meals.length!==3)return;if([s.stats.nutrition,s.stats.hydration,s.stats.cleanliness].some(n=>n<30))change(s,{health:-5,stress:4},'하루 돌봄 부족');if(s.stage==='ended')return;s.today.summary=daySummary(s);s.today.endStats=clone(s.stats);s.history.push(clone(s.today));log(s,'summary','오늘의 일지 정리',s.today.summary.changes.join(' '),s.today.summary.next,{source:'확인한 기록의 요약'});s.stage='summary';}
  function nextDay(s){const g=guard(s,['summary']);if(g)return {ok:false,message:g};if(s.day>=s.settings.days){s.stage='final';return respond(s,'7일 동안 관찰하고 돌본 기록을 함께 돌아봐요.');}s.day++;s.stage='care';beginDay(s);return respond(s,`${s.day}일 차 아침이에요. 어제 일지와 오늘의 신호를 비교해요.`);}
  function expenses(s){const out={initial:0,additional:0,special:0,total:0};for(const l of s.ledger){out[l.category]+=l.amount;out.total+=l.amount;}return out;}
  function score(s){
    const days=s.settings.days,h=s.history,p=pet(s),meals=h.reduce((n,d)=>n+d.meals.filter(m=>m.proper).length,0)/(days*3),water=h.filter(d=>d.counts.water&&d.drinks>0).length/days,clean=h.filter(d=>d.counts.clean).length/days,hygiene=Math.min(1,h.filter(d=>d.counts.hygiene).length/s.settings.hygieneTarget),basic=meals*.5+water*.2+clean*.2+hygiene*.1,activity=h.reduce((n,d)=>n+d.activityFit,0)/days;
    const comfort=h.reduce((n,d)=>n+clamp((p.startStats.stress-d.endStats.stress+20)/20,0,1),0)/days,connection=Math.min(1,h.filter(d=>d.counts.rest||d.counts.observe).length/4),es=h.flatMap(d=>d.events).filter(e=>!EVENTS.find(x=>x.id===e.id)?.routine),ev=es.length?es.reduce((n,e)=>n+e.quality,0)/es.length:1,ess=essentialItems(s),prep=ess.filter(i=>(s.initialInventory[i.id]||0)>0).length/ess.length,waste=h.reduce((n,d)=>n+d.meals.filter(m=>m.amount>1).length+Math.max(0,(d.counts.treat||0)-1),0);
    const ratios={basic,emotion:activity*.5+comfort*.3+connection*.2,events:ev,preparation:prep,budget:clamp(basic-waste*.04,0,1)},w=s.settings.weights,totalWeight=Object.values(w).reduce((a,b)=>a+b,0),parts=Object.fromEntries(Object.entries(ratios).map(([k,v])=>[k,{score:Math.round(clamp(v,0,1)*w[k]/totalWeight*1000)/10,max:Math.round(w[k]/totalWeight*1000)/10,ratio:clamp(v,0,1)}]));return {total:Math.round(Object.values(parts).reduce((n,p)=>n+p.score,0)),parts,metrics:{meals,water,clean,hygiene,activity,comfort,connection,waste},expenses:expenses(s)};
  }
  const advice=s=>s.today?.summary?.next.join(' ')||'시간을 넘기기 전에 식사·음수 신호와 기록을 살펴봐요.';
  function knownPreference(s,id){const d=s.discoveries[id];if(!d)return '아직 반응을 관찰하지 않았어요.';if((d.reactions.like||0)>=2)return `좋아하는 반응 ${d.reactions.like}회 확인 · 상황에 따라 달라질 수 있어요.`;return `${d.attempts}회 시도 · 최근 ${{like:'즐거움',neutral:'무관심',wary:'경계',dislike:'회피'}[d.notes.at(-1).attitude]} 반응 · 더 관찰해요.`;}
  function migrate(s){
    if(!s||s.version!==1)return s;s.version=3;s.settings={...clone(CONFIG),...s.settings,version:3,timeDecay:clone(CONFIG.timeDecay),dailyDecay:clone(CONFIG.dailyDecay)};s.stats.fatigue=15;s.room=s.room||{layout:{},pet:{x:49,y:77}};s.journal=[];s.sequence=0;s.revision=0;s.observation=null;s.discoveries={};s.water={amount:0,freshDay:-1};s.adaptation=10;s.lastInteraction=null;s.ending=null;
    for(const d of [...s.history,...(s.today?[s.today]:[])]){d.drinks=0;d.startStats.fatigue??=15;if(d.endStats)d.endStats.fatigue??=15;d.summary??={changes:['이전 버전 기록: 실제 음수와 직접 관찰은 별도로 기록되지 않았어요.'],next:['새 물을 준비하고 실제 음수·관찰을 기록해요.'],observations:0};}
    for(const l of s.ledger)log(s,'expense',l.label,'이전 버전의 지출 기록을 가져왔다.',[`${l.amount}원`],{day:l.day,phase:l.phase??0,slot:l.day?'이전 기록':'입양 전 쇼핑',source:'이전 버전',amount:l.amount});
    if(s.stage!=='shopping')log(s,'migration','새 기록 방식으로 이어하기','이전 상태와 재고를 이어받았다.',['과거에 실제로 마셨거나 관찰했다고 추정하지 않는다. 새 물과 관찰을 준비해요.'],{source:'버전 전환'});if(['care','summary'].includes(s.stage))checkEnd(s,'이전 저장의 상태 확인');completeEnd(s);return s;
  }
  function validate(s){
    try{
      if(!s||s.version!==3||!PETS[s.petId]||!['shopping','care','summary','final','ended'].includes(s.stage))return false;
      if(!Number.isFinite(s.balance)||s.balance<0||!Number.isFinite(s.remainingMs)||s.remainingMs<0||!Number.isInteger(s.day)||s.day<0||s.day>7||!Number.isInteger(s.phase)||s.phase<0||s.phase>4)return false;
      if(!s.settings||s.settings.days!==7||!Number.isInteger(s.settings.actionsPerPeriod)||s.settings.actionsPerPeriod!==2||!Number.isFinite(s.settings.startingBudget)||s.balance>s.settings.startingBudget||s.settings.reorderMultiplier!==1.1)return false;
      if(!s.settings.timeDecay||['meal','period','action'].some(t=>!s.settings.timeDecay[t]||['nutrition','hydration'].some(k=>!Number.isFinite(s.settings.timeDecay[t][k])))||!s.settings.dailyDecay||Object.values(s.settings.dailyDecay).some(v=>!Number.isFinite(v))||!Number.isFinite(s.settings.hygieneTarget)||s.settings.hygieneTarget<=0)return false;
      if(!Number.isInteger(s.remainingActions)||s.remainingActions<0||s.remainingActions>s.settings.actionsPerPeriod||!s.settings.weights||Object.keys(CONFIG.weights).some(k=>!Number.isFinite(s.settings.weights[k])||s.settings.weights[k]<0)||Object.values(s.settings.weights).reduce((a,b)=>a+b,0)<=0)return false;
      if(s.flow&&(!Number.isInteger(s.flow.serial)||!Array.isArray(s.flow.queue)||s.flow.queue.some(j=>!Number.isInteger(j.id)||!['motion','event'].includes(j.type))))return false;
      if(s.toilet&&(!s.toilet.seen||!s.toilet.done||!Array.isArray(s.toilet.waste)))return false;
      if(!s.prices||typeof s.pricingRevision!=='string'||ITEMS.some(i=>!Number.isInteger(s.prices[i.id])||s.prices[i.id]<=0))return false;
      for(const obj of [s.inventory,s.cart,s.initialInventory]){if(!obj||typeof obj!=='object'||Array.isArray(obj))return false;for(const [id,n] of Object.entries(obj))if(!item(id)||!Number.isInteger(n)||n<0)return false;}
      if(Object.keys(CONFIG.startStats).some(k=>!Number.isFinite(s.stats[k])||s.stats[k]<0||s.stats[k]>100)||!Array.isArray(s.history)||s.history.length>7||!Array.isArray(s.ledger)||!Array.isArray(s.usedEvents)||!Array.isArray(s.journal))return false;
      if(!Number.isInteger(s.sequence)||s.sequence<0||!Number.isInteger(s.revision)||s.revision<0||!s.discoveries||!Number.isFinite(s.adaptation)||!s.water||!Number.isInteger(s.water.amount)||s.water.amount<0||s.water.amount>3||!Number.isInteger(s.water.freshDay))return false;
      if(s.journal.some(e=>!Number.isInteger(e.id)||typeof e.action!=='string'||typeof e.reaction!=='string'||!Array.isArray(e.changes)||e.changes.some(x=>typeof x!=='string')||!Number.isInteger(e.day)||e.day<0||e.day>7||!Number.isInteger(e.phase)||e.phase<0||e.phase>4))return false;
      if(s.observation&&(!Array.isArray(s.observation.lines)||s.observation.lines.some(t=>typeof t!=='string')||!Array.isArray(s.observation.signals)))return false;
      if(Object.entries(s.discoveries).some(([id,d])=>!item(id)||!Number.isInteger(d.attempts)||d.attempts<1||!d.reactions||!Array.isArray(d.notes)||!d.notes.length||d.notes.some(n=>!['like','neutral','wary','dislike'].includes(n.attitude))))return false;
      if(s.journal.some(e=>e.type==='observation'&&(!Array.isArray(e.signals)||e.signals.some(v=>!B.stateLabels[v.key]||typeof v.text!=='string'))))return false;
      if(s.pendingEvent&&!EVENTS.some(e=>e.id===s.pendingEvent)||s.stage==='shopping'&&(s.day!==0||s.history.length))return false;
      if(s.stage!=='shopping'&&(!s.today||!Array.isArray(s.today.meals)||!Array.isArray(s.today.actions)||!s.today.counts||!Array.isArray(s.today.events)))return false;
      if(s.history.some((d,i)=>d.day!==i+1||!Array.isArray(d.meals)||d.meals.length!==3||!d.counts||!Array.isArray(d.actions)||!Array.isArray(d.events)||!d.endStats)||s.ledger.some(l=>!['initial','additional','special'].includes(l.category)||!Number.isFinite(l.amount)||l.amount<0))return false;
      const cartTotal=Object.entries(s.cart).reduce((n,[id,q])=>n+basePrice(s,id)*q,0);if(Math.abs(s.settings.startingBudget-s.balance-expenses(s).total-cartTotal)>.01)return false;
      if(s.stage==='care'&&s.history.length!==s.day-1||['summary','final'].includes(s.stage)&&s.history.length!==s.day||s.stage==='final'&&s.day!==7)return false;
      if(s.stage==='ended'&&(!s.ending||!s.ending.causes?.length||s.ending.causes.some(k=>!['nutrition','hydration'].includes(k)||s.stats[k]!==0)))return false;
      if(!Array.isArray(s.incidents)||!Number.isInteger(s.eventSequence)||s.eventSequence<0||!s.environment||typeof s.environment!=='object')return false;
      if(s.incidents.some(i=>!Number.isInteger(i.instanceId)||i.instanceId<1||i.instanceId>s.eventSequence||!EVENTS.some(e=>e.id===i.eventId)||!['pending','resolved','interrupted'].includes(i.status)||!['image','education'].includes(i.screen)||!Array.isArray(i.context)||!Array.isArray(i.consequences)||!Array.isArray(i.changes)||!Array.isArray(i.losses)||!Number.isInteger(i.day)||i.day<1||i.day>7||!Number.isInteger(i.phase)||i.phase<0||i.phase>4||!Number.isFinite(i.amount)||i.amount<0))return false;
      if(new Set(s.incidents.map(i=>i.instanceId)).size!==s.incidents.length||s.incidents.filter(i=>i.status==='pending').length>(s.pendingEvent?1:0))return false;
      if(s.pendingEvent&&(!eventView(s)||eventView(s).incident.status!=='pending'||eventView(s).event.id!==s.pendingEvent||s.stage!=='care')||!s.pendingEvent&&s.activeEvent!==null)return false;
      if(s.room){if(!s.room.layout||!s.room.pet||![s.room.pet.x,s.room.pet.y].every(Number.isFinite))return false;for(const [id,p] of Object.entries(s.room.layout))if(!item(id)||!p||![p.x,p.y].every(Number.isFinite)||p.x<4||p.x>96||p.y<45||p.y>96)return false;}return true;
    }catch{return false;}
  }
  function upgradeRules(s){
    // Preserve the price originally paid, including unconfirmed shopping carts.
    if(!Object.hasOwn(s,'prices')){s.prices=clone(D.PRICES.LEGACY_PRICES);s.pricingRevision='legacy';}
    s.mode??='simulation';s.flow??={serial:0,queue:[]};s.toilet??={seen:{stool:false,urine:false},done:{},waste:[]};s.eventSchedule??={day:0,count:0,checkpoints:0,target:2,seriousRolled:false};
    const cap=s.settings?.actionsPerPeriod,left=s.remainingActions;
    if(Number.isInteger(cap)&&cap>=1&&cap<=5&&Number.isInteger(left)&&left>=0&&left<=cap){
      s.remainingActions=[1,3].includes(s.phase)?Math.max(0,2-(cap-left)):Math.min(left,2);
      s.settings.actionsPerPeriod=2;
    }
  }
  const serialize=s=>JSON.stringify(s);
  function deserialize(raw){try{const s=migrate(JSON.parse(raw));if(!s)return null;upgradeRules(s);const old=!Object.hasOwn(s,'incidents');ensureEvents(s);if(old&&s.pendingEvent&&s.stage==='care'){const id=s.pendingEvent;s.pendingEvent=null;startEvent(s,id,{legacy:true});}if(!validate(s))return null;if(!s.room)s.room={layout:{},pet:{x:49,y:77}};if(['care','summary'].includes(s.stage)){checkEnd(s,'저장 상태 확인');completeEnd(s);}return s;}catch{return null;}}
  function placeItem(s,id,x,y){const g=guard(s,['care','shopping']);if(g)return {ok:false,message:g};if(s.pendingEvent)return {ok:false,message:'사건 화면에서는 방 배치를 바꿀 수 없어요.'};if(!item(id)||item(id).placement!=='room'||(!have(s,id)&&!s.cart[id])||![x,y].every(Number.isFinite))return {ok:false,message:'배치할 물품을 확인해 주세요.'};s.room.layout[id]={x:clamp(x,4,96),y:clamp(y,45,96)};return {ok:true,message:`${item(id).name} 위치를 저장했어요.`};}
  const api={record:log,newGame,item,pet,availableItems,have,basePrice,price,shopReason,purchase,removeCart,essentialItems,finishShopping,tickShopping,mealReason,feed,drinkReason,drink,observe,requirements,actionItems,chosenItem,actionReason,act,endPeriod,eventCandidates,startEvent,eventView,closeEventImage,eventReason,resolveEvent,nextDay,expenses,score,advice,mood:B.mood,signals:B.signals,toyResponse:B.toyResponse,knownPreference,daySummary,warn,checkEnd,change,validate,serialize,deserialize,placeItem};
  if(node)module.exports=api;root.PetEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
