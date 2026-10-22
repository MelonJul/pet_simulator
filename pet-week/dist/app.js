(() => {
  'use strict';
  const D=window.PetData,E=window.PetEngine,F=window.PetRuntime,S=window.PetScene,$=sel=>document.querySelector(sel);
  const money=n=>`${Math.round(n).toLocaleString('ko-KR')}원`;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths={paw:'M12 11c-3 0-6 4-6 6s3 3 6 2c3 1 6 0 6-2s-3-6-6-6ZM7 8c1 0 2-1 2-3S8 2 7 3 5 7 7 8ZM17 8c1-1 1-4 0-5s-2 0-2 2 1 3 2 3ZM3 9c-1 1 0 4 2 4s2-2 1-3-2-2-3-1ZM21 9c-1-1-2 0-3 1s-1 3 1 3 3-3 2-4Z',book:'M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3V4ZM12 6v15',bag:'M5 7h14l1 14H4L5 7ZM9 7V5a3 3 0 0 1 6 0v2',home:'m3 11 9-8 9 8M5 9v12h14V9M9 21v-7h6v7',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',arrow:'M4 12h16m-6-6 6 6-6 6',check:'m5 12 4 4L19 6',clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',wallet:'M3 6h17v15H3V6Zm0 0 14-4v4M16 11h5v6h-5v-6',sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',leaf:'M20 3c-12-2-19 7-13 13S22 15 20 3ZM4 21 16 8',close:'m6 6 12 12M6 18 18 6',chart:'M4 20V10m8 10V4m8 16v-7',refresh:'M20 7a9 9 0 1 0 1 9M20 2v6h-6',info:'M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'};
  const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.paw}"/></svg>`;
  let gameMode='simulation',experience=F.progress(null);try{experience=F.progress(localStorage.getItem(F.EXPERIENCE_KEY));if(experience.current){experience.current=E.deserialize(JSON.stringify(experience.current));}}catch{}
  let state=null,saved=null,selected='catDudung',screen='welcome',modal=null,previousModal=null,category='전체',guideTab='start',notice='',saveError=false,toastTimeout;
  let labels=true,editing=false,selectedRoomItem=null,choiceAction='play',animationBusy=false,motionTimers=[],drag=null,suppressClick=false,idleTicks=0;
  let replayIncident=null,priceItem=null;
  let inventoryCategory='전체',inventoryItem=null,journalDay='all',journalType='all',playStyle='gentle',rosterSpecies='cat';
  let timerMark=performance.now(),lastPersist=0;
  try{const raw=localStorage.getItem(D.CONFIG.saveKey);saved=E.deserialize(raw);if(raw&&!saved)notice='이전 저장 형식을 읽지 못했어요. 새 게임으로 시작할 수 있어요.';}catch{saveError=true;notice='브라우저 저장소를 사용할 수 없어요. 현재 창에서는 계속 플레이할 수 있어요.';}
  function persist(){
    if(!state)return;
    state.savedAt=Date.now();if(state.mode==='experience'){experience.petId=state.petId;experience.seen={...state.toilet.seen};experience.current=state;try{localStorage.setItem(F.EXPERIENCE_KEY,JSON.stringify(experience));}catch{saveError=true;}return;}saved=state;
    try{localStorage.setItem(D.CONFIG.saveKey,E.serialize(state));saveError=false;}catch{saveError=true;}
  }
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),4200);}
  function result(r){if(!r.ok){if(state?.stage==='ended'){persist();render();}toast(r.message);return;}persist();render();toast(r.message);}
  const pet=()=>!['welcome','scenarios'].includes(screen)&&state?E.pet(state):D.PETS[selected];
  const btn=(text,action,cls='button',extra='')=>`<button class="${cls}" data-do="${action}" ${extra}>${text}</button>`;
  function header(){return `<header class="topbar"><a class="brand" href="#" data-do="home"><span class="brand-mark">${icon('paw')}</span><span>처음, 함께<small>A LITTLE CARE, A LIFETIME TOGETHER</small></span></a><div class="header-right"><span class="save-status"><i></i>${saveError?'이 창에서 진행 중':state?'자동 저장 중':'반려생활 준비 시뮬레이션'}</span>${btn(icon('book')+' 가이드북','guide','button ghost')} ${state?btn('저장하고 나가기','home','text-button'):''}</div></header>`;}
  function sidebar(){
    const stage=['welcome','scenarios'].includes(screen)?0:state?.stage==='shopping'?1:state?.stage==='final'?3:2;
    const steps=[['01','새로운 가족 만나기','우리의 이야기 시작'],['02','하루 전 홈쇼핑','꼭 필요한 준비물'],['03','함께하는 일주일','작은 돌봄의 기록'],['04','우리의 7일 돌아보기','더 나은 내일을 위해']];
    return `<aside class="sidebar"><div><p class="eyebrow">OUR FIRST WEEK</p><nav aria-label="게임 진행">${steps.map(([n,title,sub],i)=>`<div class="nav-step ${i===stage?'active':''} ${i<stage?'done':''}"><span class="step-number">${i<stage?icon('check'):n}</span><div><b>${title}</b><small>${sub}</small></div>${i===stage?'<span class="active-dot"></span>':''}</div>`).join('')}</nav></div><div class="side-note"><span>${icon('leaf')}</span><p>완벽한 보호자보다<br><strong>알아가는 보호자</strong>가<br>되어 주세요.</p><small>작은 관심이 모여<br>편안한 하루가 됩니다.</small></div><button class="source-link" data-do="credits">이미지 & 제작 노트 ↗</button></aside>`;
  }
  function footer(){return `<footer><span>작은 생명과 함께할 준비, 오늘부터. ${btn('제작 노트','credits','text-button')}</span><span>물품은 온라인 판매가 참고 · 진료비·급여 횟수는 게임 설정</span></footer>`;}
  function render(){
    window.PetMotion.cancel();if(state){F.ensure(state);if(F.completeScenario(state,experience))persist();}
    if(state)window.PetEventUI.preload(state);
    motionTimers.forEach(clearTimeout);motionTimers=[];animationBusy=false;
    $('#app').className=`sim-app sim-${screen==='welcome'||screen==='scenarios'?'welcome':state.stage}`;
    const main=screen==='welcome'?welcome():screen==='scenarios'?scenarioList():state.mode==='experience'&&['intro','result'].includes(state.experience.step)?scenarioView():F.current(state)?.type==='motion'?care():state.stage==='shopping'?shopping():state.stage==='care'?care():state.stage==='summary'?summary():state.stage==='ended'?ended():final();
    $('#app').innerHTML=`${header()}<div class="layout">${sidebar()}<main id="main">${main}${footer()}</main></div>`;
    renderModal();updateTimer();pump();
  }
  function modePicker(){return '<div class="mode-picker">'+[['simulation','7일치 시뮬레이션','쇼핑부터 일주일의 돌봄과 최종 평가까지'],['experience','돌발 상황 체험','챕터와 사건을 골라 바로 체험하기']].map(([id,title,text])=>btn('<small>'+ (id==='simulation'?'A · OUR FIRST WEEK':'B · LITTLE STORIES')+'</small><b>'+title+'</b><span>'+text+'</span>','mode','mode-card '+(gameMode===id?'active':''),'data-id="'+id+'" aria-pressed="'+(gameMode===id)+'"')).join('')+'</div>';}
  function scenarioIds(){return window.PetScenarios.CHAPTERS.flatMap(c=>c.events).filter(id=>{const e=D.EVENTS.find(e=>e.id===id);return e.species==='all'||e.species===pet().species;});}
  function scenarioList(){const demo=E.newGame(selected);return '<div class="page-heading"><div><span class="eyebrow">LITTLE STORIES</span><h1>'+pet().name+'와 돌발 상황 체험</h1><p>준비물과 예산은 미리 마련돼요. 모든 챕터를 자유롭게 선택할 수 있어요.</p></div>'+btn('동물·모드 다시 고르기','home','button')+btn('체험 기록 새로 시작','experience-reset','text-button')+'</div>'+(experience.current?'<div class="continue-banner">진행 중인 체험이 있어요 '+btn('체험 이어하기','experience-continue','button')+'</div>':'')+window.PetScenarios.CHAPTERS.map(ch=>'<section class="chapter"><span class="eyebrow">CHAPTER '+ch.id+'</span><h2>'+ch.title+'</h2><p>'+ch.intro+'</p><div class="scenario-grid">'+ch.events.filter(id=>scenarioIds().includes(id)).map(id=>{const e=D.EVENTS.find(e=>e.id===id);return btn(window.PetEventUI.scene(demo,e,true)+'<b>'+e.title+'</b><small>'+(experience.completed[selected+':'+id]?'✓ 체험 완료':'미체험')+'</small>','scenario-start','scenario-card','data-id="'+id+'"');}).join('')+'</div></section>').join('');}
  function scenarioView(){const e=D.EVENTS.find(e=>e.id===state.experience.id),ch=window.PetScenarios.CHAPTERS.find(c=>c.events.includes(e.id)),done=state.experience.step==='result';return '<section class="scenario-'+(done?'result':'intro')+'"><span class="eyebrow">CHAPTER '+ch.id+' · '+ch.title+'</span><h1>'+e.title+'</h1>'+window.PetEventUI.scene(state,e,true)+'<p>'+ (done?esc(state.experience.result):ch.intro)+'</p>'+(done?'<p>상태 변화·실제 지출은 이번 체험의 일지에만 기록했어요.</p>'+journalEntries(state.journal.filter(e=>['event','hospital','toilet','play','drink','feed'].includes(e.type)).slice(-3)):'<p>'+pet().name+'와 이 순간을 경험해요. 필요한 물품·환경·예산은 준비되어 있어요.</p>')+'<div class="scenario-controls">'+(done?btn('다시 체험하기','scenario-retry','button')+btn('다음 사건','scenario-next','button primary')+btn('이번 체험 일지','journal','button'):btn('상황 시작하기','scenario-launch','button primary'))+btn('사건 목록으로','scenario-list','button')+'</div></section>';}
  function pump(){
    if(!state||screen!=='game'||modal||state.pendingEvent)return;
    const job=F.current(state);if(!job)return;
    if(job.type==='event'){F.advance(state);persist();render();return;}
    animationBusy=true;$('#app').inert=true;window.PetMotion.play(state,job,()=>{F.finishMotion(state,job.id);animationBusy=false;persist();render();});
  }
  function welcome(){
    const p=pet(),demo=E.newGame(selected);demo.stage='care';demo.day=1;demo.inventory={bowl:1,waterBowl:1,bed:1,food:9,toy:1,...(p.species==='cat'?{catTower:1,mouse:1,litterBox:1}:{ball:1,tug:1,carrier:1})};
    return modePicker()+'<section class="game-intro"><div class="intro-copy"><span class="intro-tag">작은 발자국으로 시작되는 이야기</span><h1>처음,<br><em>함께.</em><span>우리의 첫 일주일</span></h1><p>텅 빈 방에 작은 가족이 들어오면,<br>평범한 하루가 조금 특별해져요.</p><div class="intro-steps"><span>01 · 방 준비하기</span><i>→</i><span>02 · 함께 살아보기</span><i>→</i><span>03 · 7일의 기록</span></div></div><div class="intro-room">'+S.markup(demo,{demo:true,labels:false})+'<span class="intro-sticker">매일 조금씩<br><b>가까워지는 우리 ♥</b></span></div></section>'+
      (notice?'<div class="notice">'+esc(notice)+'</div>':'')+
      (saved?'<div class="continue-banner"><div>'+icon('book')+' <b>이어 쓸 이야기가 있어요</b><span>'+esc(D.PETS[saved.petId].name)+' · '+(saved.stage==='shopping'?'입양 하루 전 쇼핑':saved.day+'일 차')+'</span></div>'+btn('이어서 플레이 '+icon('arrow'),'continue','button small')+'</div>':'')+
      '<div class="section-label meet-label"><div><span class="tiny-number">♥</span><h2>어떤 친구와 함께할까요?</h2></div><span>'+Object.values(D.PETS).length+'마리 · 서로 다른 속도와 마음</span></div><div class="pet-options plush-options">'+roster()+'</div><div class="selection-strip"><div class="selection-copy"><span class="small-paw">'+icon('paw')+'</span><div><b>'+p.name+'와 첫 일주일을 시작해요</b><small>'+p.age+' · '+p.type+'</small></div></div><div class="selection-actions">'+btn('진행 설정','settings','text-button')+btn((gameMode==='experience'?'돌발 상황 목록 보기':'우리 집 준비하기')+' '+icon('arrow'),'start','button primary large')+'</div></div><p class="welcome-note">60초 동안 준비하고, 7일 동안 돌봐 주세요. 물품과 돌봄 기록은 자동으로 저장됩니다.</p>';
  }
  function roster(){
    const p=pet();
    return '<div class="roster-wrap"><div class="roster-tabs">'+['cat','dog'].map(k=>btn((k==='cat'?'고양이':'강아지')+' '+Object.values(D.PETS).filter(p=>p.species===k).length+'마리','roster-tab','tab '+(rosterSpecies===k?'active':''),'data-id="'+k+'"')).join('')+'</div><div class="roster-grid">'+Object.values(D.PETS).filter(q=>q.species===rosterSpecies).map(q=>'<button class="roster-card '+(q.id===selected?'selected':'')+'" data-do="select" data-id="'+q.id+'" aria-pressed="'+(q.id===selected)+'">'+S.petSprite(q.id,0)+'<b>'+q.name+'</b><small>'+q.age+'</small><span>'+q.type+'</span></button>').join('')+'</div><div class="known-profile"><div>'+S.petSprite(p.id,0)+'</div><article><span class="eyebrow">만나기 전, 알려진 이야기</span><h2>'+p.name+' <small>'+p.age+'</small></h2><p>'+p.appearance+'</p><p><b>성격</b> '+p.type+'</p><p><b>기본 건강·관리</b> '+p.healthNotes+' · '+p.careNotes+'</p><p><b>생활 속도</b> '+(p.activityNeed>=35?'활동적인 편':p.activityNeed<=22?'짧고 낮은 강도의 활동':'적당한 활동과 휴식')+' · '+(p.adaptation<.7?'천천히 적응해요':'주변을 비교적 빠르게 탐색해요')+'</p><p><b>알려진 습관</b> '+p.habit+'</p><small>세부 장난감 취향은 실제 반응을 관찰하며 일지에서 알아가요. 나이·기초 건강 자체로 감점하지 않습니다.</small>'+(p.profileNote?'<small>'+esc(p.profileNote)+'</small>':'')+'</article></div></div>';
  }
  let options={shoppingSeconds:D.CONFIG.shoppingSeconds,startingBudget:D.CONFIG.startingBudget};
  function shopping(){
    const s=state,p=pet(),ess=E.essentialItems(s),ready=ess.filter(i=>s.cart[i.id]>0).length;
    return `<div class="page-kicker">DAY −1 <span>입양 하루 전</span></div><div class="page-heading"><div><h1>${p.name}를 위한<br><em>작은 준비, 큰 환영.</em></h1><p>꼭 필요한 물품을 고르고, 일주일을 위한 여유도 남겨 주세요.</p></div><div class="timer-box"><span>${icon('clock')} 쇼핑 남은 시간</span><b id="timer">${Math.ceil(s.remainingMs/1000)}<small>초</small></b><div class="timer-track"><i id="timer-progress"></i></div></div></div>
      <div class="shopping-tip">${icon('book')} 첫 쇼핑이 막막하다면 가이드북을 펼쳐 보세요. 읽는 동안 시간은 멈춰요. ${btn('준비물 알아보기 ↗','guide','text-button',`data-id="items"`)}</div>
      <div class="shop-layout"><section>${catalog(false)}</section><aside class="cart-panel">${S.markup(s,{preview:true,labels:false})}<span class="eyebrow">MY LITTLE BASKET</span><h2>환영의 장바구니 ${icon('bag')}</h2><div class="cart-budget"><span>남은 예산</span><strong>${money(s.balance)}</strong><small>시작 예산 ${money(s.settings.startingBudget)}</small></div><div class="cart-items">${Object.entries(s.cart).filter(([,n])=>n>0).map(([id,n])=>`<div class="cart-row"><div><b>${E.item(id).name}</b><small>${n}묶음 · ${n*E.item(id).qty}${E.item(id).unit}</small></div><span>${money(E.basePrice(s,id)*n)}</span>${btn('−','remove','mini-button',`data-id="${id}" aria-label="${E.item(id).name} 한 묶음 빼기"`)}</div>`).join('')||'<div class="empty-cart">아직 장바구니가 비어 있어요.<br>식사와 배변 용품부터 골라볼까요?</div>'}</div><div class="prepared"><span>필수 품목 준비</span><b>${ready} / ${ess.length}</b></div><div class="progress-line"><i style="width:${ready/ess.length*100}%"></i></div><small class="cart-help">사료는 총 ${s.settings.days*3}끼가 필요해요.<br>추가 주문과 상담을 위한 비용도 남겨요.</small>${btn('준비 완료, 만나러 가기 '+icon('arrow'),'finish-shopping','button primary full')}<p class="micro">시간이 끝나면 현재 장바구니로 시작해요.</p></aside></div>`;
  }
  function catalog(late){
    const filtered=E.availableItems(state).filter(i=>category==='전체'||category==='필수 준비'?category==='전체'||E.essentialItems(state).some(e=>e.id===i.id):i.category===category);
    return `<div class="price-notice"><span>온라인 판매가 참고 · 게임 사용 단위 적용</span>${btn('가격 조사·출처 ↗','prices','text-button')}${state.pricingRevision!==D.PRICES.REVISION?'<small>이어 하는 게임은 시작 당시 가격을 유지해요.</small>':''}</div><div class="catalog-tabs" aria-label="상품 분류">${['전체','필수 준비','식사','간식','놀이','가구','위생','생활'].map(c=>btn(c,'category',`tab ${category===c?'active':''}`,`data-id="${c}" aria-pressed="${category===c}"`)).join('')}</div><div class="product-grid">${filtered.map(i=>{
      const reason=E.shopReason(state,i.id),count=late?(state.inventory[i.id]||0):(state.cart[i.id]||0)*i.qty,essential=E.essentialItems(state).some(e=>e.id===i.id);
      return `<article class="product-card"><div class="product-top"><span class="product-icon ${i.category==='위생'?'blue':i.category==='놀이'?'pink':''}">${S.itemArt(i)}</span><span class="product-type">${essential?'필수 준비':'선택 물품'}</span></div><h3>${i.name}</h3><div class="product-sub">${i.species==='all'?'공통':i.species==='dog'?'개 전용':'고양이 전용'} · ${i.qty}${i.unit} · ${i.kind==='durable'?'재사용':'소모품'} · ${i.placement==='room'?'방에 설치':'가방 보관'}</div><p>${i.description}</p><div class="product-bottom"><div>${late?`<del>${money(E.basePrice(state,i.id))}</del>`:''}<strong>${money(E.price(state,i.id,late))}</strong></div>${btn(reason&&i.kind==='durable'&&count?'✓':'+','buy','add-button',`data-id="${i.id}" ${reason?'disabled':''} aria-label="${i.name} 구매${reason?' · '+reason:''}" title="${reason||'한 묶음 구매'}"`)}</div><small class="stock-label">${late?'보유':'장바구니'} ${count}${i.unit}${reason&&!(i.kind==='durable'&&count)?' · '+reason:''}</small>${btn('가격 근거 보기','prices','text-button price-detail-link',`data-id="${i.id}"`)}</article>`;
    }).join('')}</div>`;
  }
  function care(){
    const p=pet(),q=state,isMeal=[0,2,4].includes(q.phase),m=E.mood(q),risks=E.warn(q);
    return (q.mode==='experience'?'<div class="experience-banner">돌발 상황 체험 · 7일 게임 저장과 별도로 진행해요.</div>':'')+(F.current(q)?.type==='motion'?'<div class="motion-status" role="status">'+p.name+'의 동작을 보고 있어요 · 끝나면 다음 상황으로 이어져요</div>':'')+'<div class="game-hud"><div class="day-badge"><span>DAY</span><b>'+String(q.day).padStart(2,'0')+'</b><small>/ 7</small></div><div class="hud-story"><h1>'+p.name+'와 함께하는 하루</h1><div class="week-track">'+Array.from({length:7},(_,i)=>'<i class="'+(i+1===q.day?'active':i+1<q.day?'done':'')+'">'+(i+1<q.day?'♥':i+1)+'</i>').join('')+'</div></div><div class="hud-wallet"><small>우리의 생활비</small><b>'+money(q.balance)+'</b></div>'+btn(icon('bag')+' 추가 주문','shop','button shop-button')+'</div>'+
      (risks.length?'<div class="risk-banner" role="alert"><b>지금 돌봄을 확인해 주세요</b>'+risks.map(r=>'<p>'+r.text+'</p>').join('')+'<span>식사 또는 수분 중 하나라도 0이면 게임 종료 · 시간을 넘기기 전에 대응할 수 있어요.</span><div>'+btn('관찰하기','observe','button small')+(q.stats.nutrition<=30?btn('부족한 식사 보충','urgent-feed','button small',E.mealReason(q,1,true)?'disabled':''):'')+btn('인벤토리 열기','inventory','button small')+'</div></div>':'')+
      '<div class="sim-layout"><section class="living-area">'+S.markup(q,{labels,editing})+'<div class="care-toolbar">'+btn('◎ 상태 · 관찰하기','observe','button primary')+btn(icon('bag')+' 인벤토리','inventory','button')+btn(icon('book')+' 반려동물 일지','journal','button')+'<span>친구를 눌러도 상태창이 열려요 · 무료</span></div><div class="visible-signals"><b>지금 보이는 모습 · '+m.name+'</b><p>'+m.text+'</p>'+(m.signals.length>1?'<small>함께 보이는 신호: '+m.signals.slice(1).map(x=>window.PetBehavior.stateLabels[x.key]).join(' · ')+'</small>':'')+'</div><div class="scene-dialogue" aria-live="polite"><div class="dialogue-portrait">'+S.petSprite(p.id,m.pose)+'</div><div><span class="dialogue-name">'+p.name+'의 하루 <small>오늘의 작은 순간</small></span><p>'+esc(q.lastMessage)+'</p></div><span class="dialogue-next">♥</span></div><div class="observation-preview"><span>마지막 직접 관찰</span><p>'+ (q.observation? q.observation.day+'일 차 · '+D.PHASES[q.observation.phase]+' — '+esc(q.observation.lines[0])+(q.observation.revision!==q.revision?' <em>이후 변화는 다시 관찰해 주세요.</em>':''):'아직 관찰 기록이 없어요. 관찰하기를 눌러 식사·음수·자세를 확인해요.')+'</p></div></section><aside class="daily-planner"><div class="planner-top"><span>TODAY’S LITTLE ROUTINE</span><h2>오늘의 돌봄 수첩</h2></div><div class="routine-steps">'+D.PHASES.map((n,i)=>'<span class="'+(i===q.phase?'active':i<q.phase?'done':'')+'"><i>'+(i<q.phase?'✓':i+1)+'</i>'+n+'</span>').join('')+'</div><div class="planner-task"><div class="planner-title"><h3>'+D.PHASES[q.phase]+'</h3><span>'+(isMeal?'사료 1끼':q.remainingActions+' / 2회 남음')+'</span></div>'+(isMeal?mealView():actionsView())+'<div class="water-status"><b>물 준비와 실제 음수</b><p>그릇에 '+q.water.amount+'회분 · '+(q.water.freshDay===q.day?'오늘 교체함':'오늘 교체 기록 없음')+'<br>오늘 실제 마심 '+q.today.drinks+'회</p>'+''+'<small>'+'물을 갈아주면 자동 음수까지 이어져요 · 실제 마셨을 때만 회복'+'</small></div></div><div class="planner-help">'+btn('관찰·물·종료 규칙 ↗','guide','text-button','data-id="survival"')+'</div></aside></div>';
  }
  function journalEntries(entries){return entries.length?entries.map(e=>'<article class="journal-entry"><div class="journal-stamp">'+(e.day?'DAY '+e.day:'입양 전')+' · '+esc(e.slot)+' <small>'+esc(e.time)+' · #'+e.id+' · '+esc(e.source)+'</small></div><h3>'+esc(e.action)+'</h3><div class="journal-chain"><span>한 행동</span><p>'+esc(e.action)+'</p><span>반려동물의 반응 / 확인 결과</span><p>'+esc(e.reaction)+'</p><span>관찰된 변화 / 확인한 기록</span><ul>'+e.changes.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div>'+(e.eventInstance?btn('사건 설명·대응 다시 읽기','event-replay','button small event-replay-button','data-id="'+e.eventInstance+'"'):'')+'</article>').join(''):'<div class="empty-journal">이 조건에 맞는 기록이 아직 없어요. 확인하지 않은 사실은 채워 넣지 않아요.</div>';}
  function journalView(){
    const records=state.journal.filter(e=>(journalDay==='all'||e.day===Number(journalDay))&&(journalType==='all'||(journalType==='observed'?['observation','play','drink'].includes(e.type):journalType==='events'?!!e.eventInstance:e.type===journalType)));
    return '<p class="journal-intro">행동 → 반응 → 확인한 변화. 관찰한 날끼리 비교하며 '+pet().name+'의 속도를 알아가요. <b>열람 무료</b></p><div class="journal-filters"><div>'+['all',...Array.from({length:state.day+1},(_,i)=>String(i))].map(d=>btn(d==='all'?'모든 날':d==='0'?'준비일':d+'일 차','journal-day','tab '+(journalDay===d?'active':''),'data-id="'+d+'"')).join('')+'</div><div>'+[['all','전체'],['observed','관찰·반응'],['feed','급여'],['care','돌봄'],['events','사건'],['hospital','병원'],['expense','지출'],['summary','하루 요약']].map(([id,n])=>btn(n,'journal-type','tab '+(journalType===id?'active':''),'data-id="'+id+'"')).join('')+'</div></div><div class="discovery-notes"><h3>반응을 통해 알아가는 취향</h3>'+(Object.keys(state.discoveries).length?Object.keys(state.discoveries).map(id=>'<p><b>'+E.item(id).name+'</b> '+E.knownPreference(state,id)+'</p>').join(''):'<p>아직 장난감 반응을 확인하지 않았어요. 기본 프로필만으로 세부 취향을 단정하지 않아요.</p>')+'</div><div class="journal-timeline">'+journalEntries(records.slice().reverse())+'</div>';
  }
  const invGroup=i=>['식사','간식'].includes(i.category)?'사료·간식':i.category==='놀이'?'장난감':i.category==='위생'?'위생용품':'생활용품';
  function itemDetail(i,inventory=false){
    if(!i)return '<div class="inventory-empty">물품을 골라 용도와 사용 조건을 확인해요.</div>';
    const a=roomAction(i),reason=!E.have(state,i.id)?'보유 재고가 없어요.':a==='feed'?E.mealReason(state,1):a?E.actionReason(state,a,i.use?i.id:undefined):'상황에 필요한 생활용품이에요. 직접 사용하는 행동은 없어요.';
    return '<div class="object-detail"><div class="object-detail-art">'+S.itemArt(i)+'</div><span class="pill">보유 '+(state.inventory[i.id]||0)+i.unit+' · '+(i.kind==='durable'?'반복 사용':'소모품')+'</span><h2>'+i.name+'</h2><p class="item-location">'+(i.placement==='room'?'방에 설치된 물품 · 방 꾸미기에서 위치를 바꿀 수 있어요.':'인벤토리에 보관 중 · 필요할 때 꺼내 사용해요.')+'</p><p>'+i.description+'</p>'+(i.use==='play'?'<p class="discovered-hint">'+E.knownPreference(state,i.id)+'</p>'+styleChooser():'')+'<p class="object-use-cost">'+(a==='feed'?'사료 1끼 · 행동 소모 없음':a?D.ACTIONS.find(x=>x.id===a).name+' · 행동 '+D.ACTIONS.find(x=>x.id===a).cost+'회':'특별 상황 또는 생활 환경에 사용')+'</p>'+ (a?btn(inventory?'사용하기':a==='feed'?'밥그릇에 사료 담기':D.ACTIONS.find(x=>x.id===a).name,inventory?'use-inventory':'use-room-item','button primary full','data-id="'+i.id+'" '+(reason?'disabled':'')):'')+(reason?'<p class="missing">'+reason+'</p>':'')+(i.id==='waterBowl'?''+'<small>'+esc(E.drinkReason(state)||'준비된 물을 마시는 모습을 확인합니다.')+'</small>':'')+'</div>';
  }
  function inventoryView(){
    const list=E.availableItems(state).filter(i=>E.have(state,i.id)&&(inventoryCategory==='전체'||invGroup(i)===inventoryCategory));
    return '<div class="inventory-header"><p>가방 보관 '+(S.owned(state).length-S.installed(state).length)+'종 · 방에 설치 '+S.installed(state).length+'종 · 열람 무료</p>'+btn('추가 주문','shop','button small')+'</div><div class="catalog-tabs">'+['전체','사료·간식','장난감','위생용품','생활용품'].map(c=>btn(c,'inventory-category','tab '+(inventoryCategory===c?'active':''),'data-id="'+c+'"')).join('')+'</div><div class="inventory-layout"><div class="inventory-slots">'+(list.map(i=>'<button class="inventory-slot '+(inventoryItem===i.id?'selected':'')+'" data-do="inventory-select" data-id="'+i.id+'">'+S.itemArt(i)+'<b>'+i.name+'</b><span>'+(state.inventory[i.id]||0)+i.unit+'</span><small>'+(i.placement==='room'?'방에 설치 · ':'가방 보관 · ')+(i.kind==='durable'?'반복 사용':'소모품')+'</small></button>').join('')||'<p class="empty-journal">이 분류에 보유한 물품이 없어요.</p>')+'</div><aside class="inventory-detail">'+itemDetail(E.item(inventoryItem),true)+'</aside></div>';
  }
  function styleChooser(){return '<div class="play-style"><span>진행 강도</span>'+[['gentle','낮고 짧게'],['active','활발하게']].map(([id,n])=>btn(n,'play-style','tab '+(playStyle===id?'active':''),'data-id="'+id+'"')).join('')+'</div>';}
  function ended(){
    const end=state.ending,recent=state.journal.filter(e=>end.recent.includes(e.id));
    return '<section class="early-ending"><span class="pill">함께한 기록에서 다시 배우기</span><div class="ending-pet">'+S.petSprite(pet().id,end.causes.includes('hydration')?2:1)+'</div><h1>이번 돌봄은 여기서 멈췄어요.</h1><p class="ending-when">'+end.day+'일 차 · '+esc(end.slot)+'</p><div class="ending-cause"><h2>'+end.causes.map(k=>D.STAT_LABELS[k]).join('·')+' 상태가 0이 되었어요.</h2><p>'+esc(end.cause)+'</p><small>둘 중 하나만 0이어도 종료되는 게임 규칙입니다. 실제 동물의 생존 시간이나 의학적 기준이 아닙니다.</small></div><div class="ending-advice"><h3>다시 해 볼 때는</h3><ul><li>경고가 나타나면 시간을 넘기기 전에 관찰하고 재고를 확인해요.</li>'+(end.causes.includes('nutrition')?'<li>예정된 식사를 챙기고 식사 부족 신호가 강하면 사료 1끼 보충을 사용해요.</li>':'')+(end.causes.includes('hydration')?'<li>물 교체 행동을 확보하고 실제 음수 기록까지 확인해요. 물을 놓는 것만으로 수분이 회복되지는 않아요.</li>':'')+'<li>일지에서 마지막으로 먹고 마신 때와 지나간 시간을 함께 살펴요.</li></ul></div><div class="report-bottom">'+btn('전체 일지 보기','journal','button')+btn('다시 시작하기','restart','button primary large')+'</div><h2>종료와 관련된 최근 기록</h2>'+journalEntries(recent.slice().reverse())+'</section>';
  }

  function priceView(){
    const rows=(priceItem?[E.item(priceItem)]:D.ITEMS).filter(Boolean);
    return '<div class="price-method"><span class="pill">조회일 '+D.PRICES.CHECKED_AT+'</span><p>'+D.PRICES.METHOD+'</p><p>'+D.PRICES.UNITS+'</p><p>추가 주문은 이 게임의 초기 기준가 × 1.10으로 고정돼요. 새 가격은 새 게임부터 적용되고 이전 저장의 구매·환불·추가 주문은 당시 가격을 유지해요.</p></div><div class="price-references">'+rows.map(i=>'<article><h3>'+i.name+'</h3><div class="price-reference-values"><span>새 게임 기준가 <b>'+money(i.price)+'</b></span><span>게임 수량 <b>'+i.qty+i.unit+'</b></span>'+(state?'<span>현재 게임 기준가 <b>'+money(E.basePrice(state,i.id))+'</b></span><span>현재 추가 주문 <b>'+money(E.price(state,i.id,true))+'</b></span>':'')+'</div><p>'+esc(i.market.basis)+'</p>'+i.market.sources.map(r=>'<div class="retail-source"><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.shop)+' · '+esc(r.product)+' ↗</a><strong>'+money(r.price)+' / '+esc(r.pack)+'</strong><small>'+esc(r.note)+'</small></div>').join('')+'</article>').join('')+'</div><p class="micro">조회·열람 무료 · 쇼핑 중 타이머 일시 정지 · 외부 판매 페이지는 새 탭으로 열려요.</p>';
  }
  function statusView(){
    const o=state.observation,m=E.mood(state),p=pet();
    return '<div class="pet-status-sheet"><div class="pet-status-heading"><div class="observation-portrait">'+S.petSprite(p.id,m.pose)+'</div><div><span class="pill">'+state.day+'일 차 · '+D.PHASES[state.phase]+'</span><h3>'+p.name+' · '+m.name+'</h3><p>'+p.age+' · '+p.type+'</p><small>방금 관찰했어요 · 행동과 비용 소모 없음</small></div></div>'+ (E.warn(state).length?'<div class="risk-banner" role="alert">'+E.warn(state).map(r=>'<p>'+esc(r.text)+'</p>').join('')+'</div>':'')+'<div class="pet-status-grid">'+Object.entries({...D.STAT_LABELS,fatigue:'피로'}).map(([key,label])=>statBar(key,label,state.stats[key])).join('')+'</div><p class="status-rule">0~100의 게임 상태 지표예요. 식사 또는 수분이 0이면 게임이 종료돼요. 건강 수치는 질병 진단이 아니며, 실제 행동과 함께 살펴봐요.</p><div class="status-observation"><h3>지금 관찰한 행동과 표정</h3><ul>'+o.lines.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><p>물그릇 '+state.water.amount+'회분 · 오늘 실제 음수 '+state.today.drinks+'회 · '+(state.water.freshDay===state.day?'오늘 물 교체함':'오늘 물 교체 기록 없음')+'</p></div><div class="status-actions">'+btn(icon('bag')+' 인벤토리에서 돌보기','inventory','button primary')+btn('관찰 일지 확인','journal','button')+'</div></div>';
  }
  function statBar(key,label,value,delta){
    const v=Math.round(value),lower=['stress','fatigue'].includes(key),bad=lower?v>60:v<35;
    return `<div class="stat ${bad?'warning':''}"><div><span>${label}</span><b>${v}${delta!==undefined?`<small class="delta ${delta>0?'plus':''}">${delta>0?'+':''}${Math.round(delta)}</small>`:''}</b></div><div class="stat-track" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-valuetext="${v} / 100, ${lower?'낮을수록 편안해요':'높을수록 충족돼요'}"><i style="width:${v}%"></i></div><small class="stat-direction">${lower?'낮을수록 편안해요':'높을수록 충족돼요'}</small></div>`;
  }
  function mealView(){
    const reason=E.mealReason(state,1);
    return '<div class="meal-card"><div class="meal-art">'+S.itemArt(E.item('bowl'))+'</div><h3>밥 먹을 시간이야!</h3><p>밥그릇에 사료를 담으면<br>'+pet().name+'가 다가와 냠냠 먹어요.</p><div class="meal-stock">사료 <b>'+(state.inventory.food||0)+'끼</b><span>·</span>밥그릇 <b>'+(E.have(state,'bowl')?'✓':'없음')+'</b></div>'+btn('정량 급여하기 · 1끼','feed','button primary full','data-amount="1" '+(reason?'disabled':''))+(reason?'<p class="missing">'+reason+' '+btn('준비하러 가기','shop','text-button')+'</p>':'')+'<div class="meal-alternatives">'+btn('이번 식사 건너뛰기','skip-meal','text-button')+btn('2끼분 주기','overfeed','text-button',E.mealReason(state,2)?'disabled':'')+'</div><small>하루 세 끼는 이 게임의 규칙이에요.</small></div>';
  }
  function actionsView(){
    return '<p class="action-intro">필요한 돌봄부터 하나씩. '+btn('성향 힌트 ↗','guide','text-button','data-id="personality"')+'</p><div class="action-grid">'+D.ACTIONS.filter(a=>!['observe','drink'].includes(a.id)&&!(pet().species==='cat'&&a.id==='walk')&&!(pet().species==='dog'&&a.id==='catnip')).map(a=>{
      const reason=E.actionReason(state,a.id),req=E.requirements(state,a.id),requirements=[...req.tools.map(id=>E.item(id).name),...Object.entries(req.consume).map(([id,n])=>E.item(id).name+' '+n+E.item(id).unit)].join(' · ')||'준비물 없음';
      return '<button class="action-card" data-do="act" data-id="'+a.id+'" '+(reason?'disabled':'')+' title="'+(reason||a.description)+'"><span class="action-symbol">'+a.icon+'</span><span><b>'+a.name+'</b><small>'+requirements+'</small><span class="action-require">'+a.description+'</span>'+(state.today.counts[a.id]?'<em>오늘 '+state.today.counts[a.id]+'회 · 반복 효과 감소</em>':'')+(reason&&state.remainingActions>0?'<em class="missing">'+reason+'</em>':'')+'</span><i>'+a.cost+'회</i></button>';
    }).join('')+'</div><p class="action-limit-note">오전 2회 · 오후 2회<br>관찰·인벤토리 열람·음수 확인은 무료</p><div class="next-period"><small>'+(state.remainingActions?'남은 행동을 확인해 주세요.':'이번 돌봄을 마쳤어요.')+'</small>'+btn((state.phase===1?'점심':'저녁')+' 시간으로 '+icon('arrow'),'end-period','button primary full')+'</div>';
  }
  function summary(){
    const d=state.history.at(-1),report=d.summary,spent=state.ledger.filter(l=>l.day===state.day).reduce((n,l)=>n+l.amount,0);
    return '<div class="report-heading"><span class="pill">DAY '+state.day+' · 하루 결산</span><h1>오늘은 어떤 모습이었나요?</h1><p>'+pet().name+'의 오늘과 지난 관찰을 함께 돌아봐요.</p></div><div class="report-grid"><section class="panel"><h2>오늘의 돌봄 기록</h2><ul class="daily-narrative">'+report.changes.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><div class="next-check"><h3>다음 날 살펴볼 점</h3><ul>'+report.next.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div>'+btn('시간대별 일지 펼치기','journal','button')+'</section><section class="panel"><h2>오늘의 생활비와 물품</h2><div class="expense-block"><div><span>오늘 지출</span><strong>'+money(spent)+'</strong></div><div><span>남은 예산</span><b>'+money(state.balance)+'</b></div><div><span>사료</span><b>'+(state.inventory.food||0)+'끼</b></div><div><span>실제 음수 / 물 교체</span><b>'+d.drinks+' / '+(d.counts.water||0)+'회</b></div></div><h3>특별 상황</h3>'+d.events.map(e=>'<p class="event-log"><b>'+esc(e.title)+'</b><br>'+esc(e.result)+'</p>').join('')+btn('인벤토리','inventory','button')+'</section></div><div class="report-bottom">'+btn('추가 물품 주문','shop','button')+btn(state.day===7?'7일 최종 평가 보기':'다음 날 아침으로','next-day','button primary large')+'</div>';
  }
  function final(){
    const s=state,r=E.score(s),p=pet(),labels={basic:'기본 돌봄 수행',emotion:'성향에 맞는 활동과 정서',events:'특별 상황 대응',preparation:'준비물의 적절성',budget:'예산 관리'},m=r.metrics;
    const good=[m.meals>=0.9?'규칙적인 정량 식사를 꾸준히 챙겼어요.':null,m.water>=0.85?'새 물과 실제 음수 모습을 꾸준히 확인했어요.':null,m.activity>=0.8?`${p.name}에게 맞는 활동을 골랐어요.`:null,r.parts.events.ratio>=0.8?'예상치 못한 상황에서도 반응을 살펴 대응했어요.':null].filter(Boolean);
    const improve=[m.meals<1?'식사마다 사료와 밥그릇을 먼저 확인해요.':null,m.water<1?'물 교체 시간과 실제로 마셨는지 확인할 시간을 확보해요.':null,m.clean<1?'배변 청소와 소모품 재고를 함께 챙겨요.':null,m.hygiene<1?'위생 관리를 일주일에 3회 이상 계획해요.':null,m.activity<1?'간식보다 성향에 맞는 활동에 시간을 써요.':null,m.connection<1?'휴식·관찰을 하는 날도 4일 이상 마련해요.':null,m.waste?'과다 급여와 반복 간식을 줄여요.':null].filter(Boolean);
    return `<div class="report-heading final-heading"><span class="pill">OUR FIRST WEEK · 함께한 7일</span><h1>${r.total>=80?'마음이 한 뼘 더 가까워졌어요.':'알아갈수록, 더 잘 돌볼 수 있어요.'}</h1><p>완벽함보다 중요한 건, 함께 살아갈 준비를 이어가는 마음이에요.</p></div><div class="final-grid"><section class="score-panel"><div class="score-circle" style="--score:${r.total}%"><div><small>우리의 첫 일주일</small><strong>${r.total}<span>점</span></strong><span>100점 만점</span></div></div><h2>${r.total>=85?'다정하고 든든한 첫걸음':r.total>=65?'차근차근 배우는 보호자':'준비를 더해 가는 보호자'}</h2><p>7일 동안의 기록을 반영했어요.<br>이 점수가 실제 입양 자격을 판단하지는 않아요.</p>${S.petSprite(p.id,4,"final-avatar")}<b>${p.name}와 함께한 7일</b></section><section class="panel"><h2>어떤 선택을 했을까요?</h2><div class="score-list">${Object.entries(r.parts).map(([key,v])=>`<div><div><b>${labels[key]}</b><span><strong>${v.score}</strong> / ${v.max}</span></div><div class="progress-line"><i style="width:${v.ratio*100}%"></i></div></div>`).join('')}</div>${btn('평가 계산 기준 자세히 보기 ↗','guide','text-button',`data-id="score"`)}<div class="final-cost"><div><span>초기 준비비</span><b>${money(r.expenses.initial)}</b></div><div><span>7일 추가 물품비</span><b>${money(r.expenses.additional)}</b></div><div><span>상담·병원 등 특별 지출</span><b>${money(r.expenses.special)}</b></div><div class="total"><span>총지출</span><strong>${money(r.expenses.total)}</strong></div><small>7일간 추가 지출 ${money(r.expenses.additional+r.expenses.special)} · 잔액 ${money(s.balance)}</small></div></section></div><div class="report-grid final-feedback"><section class="panel"><span class="feedback-symbol">✦</span><h2>잘한 선택</h2><ul>${(good.length?good:['일주일 동안 어떤 돌봄이 필요한지 경험했어요.']).map(t=>`<li>${t}</li>`).join('')}</ul></section><section class="panel"><span class="feedback-symbol orange">↗</span><h2>다음엔 이렇게 해 봐요</h2><ul>${(improve.length?improve:['지금의 균형을 유지하고 실제 생활에서도 충분한 시간을 확보해요.']).map(t=>`<li>${t}</li>`).join('')}</ul></section></div><div class="learning-note"><div>${icon('book')}<h2>${p.name}에게 배운 것</h2></div><p>${p.description} ${p.signal}</p><div class="final-discoveries">${Object.keys(s.discoveries).length?Object.keys(s.discoveries).map(id=>`<p><b>${E.item(id).name}</b> ${E.knownPreference(s,id)}</p>`).join(''):'<p>아직 직접 놀이 취향을 확인한 기록은 없어요.</p>'}</div><b>실제 입양 전에는</b><p>평생 돌봄 비용과 비상 진료비, 함께 사는 사람의 동의, 집의 안전, 매일의 돌봄 시간, 예방 진료 계획, 집을 비울 때 돌봐줄 사람도 준비해 주세요.</p></div><div class="report-bottom">${btn('반려동물 일지 펼치기','journal','button')}${btn('7일 기록 내려받기','export','button ghost')}${btn('다른 친구와 다시 플레이 '+icon('refresh'),'restart','button primary large')}</div>`;
  }
  function openModal(kind,tab){
    previousModal=modal;modal=kind;if(tab)guideTab=tab;timerMark=performance.now();persist();renderModal();
  }
  function closeModal(){if(!modal&&state?.pendingEvent)return;modal=modal==='event-replay'?'journal':previousModal;previousModal=null;timerMark=performance.now();renderModal();}
  function renderModal(){
    const eventActive=screen!=='welcome'&&state?.pendingEvent&&!modal;
    if(state?.stage==='ended'&&['shop','room-item','choose-item','observation'].includes(modal)){modal=null;previousModal=null;}
    const kind=eventActive?'event':modal;
    if(!kind){$('#modal-root').innerHTML='';document.body.classList.remove('modal-open');$('#app').inert=false;return;}
    document.body.classList.add('modal-open');$('#app').inert=true;
    if(kind==='event'&&E.eventView(state)?.incident.screen==='image'){const view=E.eventView(state);$('#modal-root').innerHTML=window.PetEventUI.imageScreen(state,view);window.PetEventUI.readyScene($('.incident-image-modal'),state,view.event);$('.modal').focus({preventScroll:true});return;}
    let content='',title='',wide=false;
    if(kind==='guide'){
      wide=true;title='작은 돌봄 가이드북';const g=D.GUIDE.find(g=>g.id===guideTab)||D.GUIDE[0];
      content=`<div class="guide-layout"><nav>${D.GUIDE.map(g=>btn(g.title,'guide-tab',`guide-tab ${g.id===guideTab?'active':''}`,`data-id="${g.id}"`)).join('')}</nav><article class="guide-content"><span class="eyebrow">YOUR LITTLE CARE BOOK</span><h2>${g.title}</h2><h3>${g.subtitle}</h3><p>${g.text}</p>${guideTab==='personality'?`<div class="guide-pet">${S.petSprite(pet().id,0,"guide-avatar")}<div><b>${pet().name} · ${pet().type}</b><p>${pet().signal}</p><small>좋아하는 활동: ${pet().favorite}</small></div></div>`:''}${guideTab==='items'?`<div class="guide-items">${D.ITEMS.filter(i=>i.species==='all'||i.species===pet().species).map(i=>`<div><b>${i.name}</b><span>${i.description}</span></div>`).join('')}</div>`:''}${guideTab==='score'?`<div class="weight-chips">${Object.entries((state?.settings||D.CONFIG).weights).map(([k,v])=>`<span>${{basic:'기본 돌봄',emotion:'성향·정서',events:'사건 대응',preparation:'준비물',budget:'예산'}[k]} <b>${Math.round(v/Object.values((state?.settings||D.CONFIG).weights).reduce((a,b)=>a+b,0)*100)}점</b></span>`).join('')}</div>`:''}<div class="guide-source">${Object.entries(window.PetEventData.SOURCES).filter(([key])=>['itch','urinary','gait','dogToilet'].includes(key)).map(([,v])=>`<a href="${v[1]}" target="_blank" rel="noreferrer">${v[0]}</a>`).join(' · ')}<br>참고 자료: <a href="https://www.aspca.org/pet-care/dog-care/general-dog-care" target="_blank" rel="noreferrer">ASPCA 개 돌봄</a> · <a href="https://www.cats.org.uk/help-and-advice/getting-a-cat/preparing-for-a-cat" target="_blank" rel="noreferrer">Cats Protection 입양 준비</a> · <a href="https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-hiding" target="_blank" rel="noreferrer">고양이의 숨는 행동</a> · <a href="https://www.merckvetmanual.com/special-pet-topics/emergencies/evaluation-and-initial-treatment-of-dog-and-cat-emergencies" target="_blank" rel="noreferrer">응급 상황 안내</a><p>게임의 금액·행동 횟수·상태 변화는 교육을 위해 단순화했어요.</p></div></article></div><div class="modal-foot">${icon('clock')} ${state?.stage==='shopping'?'쇼핑 타이머 일시 정지 중':'무료 열람 · 행동 횟수 소모 없음'}</div>`;
    }else if(kind==='prices'){
      title=priceItem?E.item(priceItem).name+' · 가격 근거':'상점 가격 조사·출처';wide=true;content=priceView();
    }else if(kind==='shop'){
      wide=true;title='우리 집 추가 주문';content=`<div class="shop-modal-intro"><p>초기 기준가의 <b>110%</b> · 주문 즉시 도착 · 행동 소모 없음<br><small>주문 횟수와 상관없이 같은 추가 주문 가격이에요.</small></p><div class="budget-chip">${icon('wallet')}<b>${money(state.balance)}</b></div></div>${catalog(true)}`;
    }else if(kind==='event'||kind==='event-replay'){
      wide=true;title=kind==='event'?'잠깐 멈춰, 함께 알아봐요':'일지 속 사건 다시 읽기';
      const v=E.eventView(state,kind==='event'?state.activeEvent:replayIncident);content=v?window.PetEventUI.education(state,v,kind==='event-replay'):'기록을 찾을 수 없어요.';
    }else if(kind==='room-item'){
      title=E.item(selectedRoomItem).name;content=itemDetail(E.item(selectedRoomItem));
    }else if(kind==='choose-item'){
      title=choiceAction==='play'?'어떤 장난감으로 놀까요?':'오늘은 어떤 간식을 줄까요?';
      content='<p class="muted">'+(choiceAction==='play'?'아직 모르는 취향은 반응을 관찰하며 알아가요.':'간식 종류를 바꿔도 반복 횟수는 함께 누적돼요.')+'</p>'+(choiceAction==='play'?styleChooser():'')+'<div class="choose-items">'+E.actionItems(state,choiceAction).map(i=>'<button data-do="use-choice" data-id="'+i.id+'">'+S.itemArt(i)+'<span><b>'+i.name+'</b><small>'+esc(choiceAction==='play'?E.knownPreference(state,i.id):i.description)+'</small><em>'+(i.kind==='consumable'?'남은 '+state.inventory[i.id]+i.unit+' · 1회분 사용':'반복 사용')+' · 행동 1회</em></span>'+icon('arrow')+'</button>').join('')+'</div>';
    }else if(kind==='inventory'){
      title='우리 집 인벤토리';wide=true;content=inventoryView();
    }else if(kind==='journal'){
      title=pet().name+'의 반려동물 일지';wide=true;content=journalView();
    }else if(kind==='observation'){
      title=pet().name+'의 상태';wide=true;content=statusView();
    }else if(kind==='settings'){
      title='나에게 맞는 진행 속도';content=`<form id="settings-form"><label>쇼핑 제한시간<select name="shoppingSeconds">${[30,60,90,120,180].map(n=>`<option value="${n}" ${n===options.shoppingSeconds?'selected':''}>${n}초${n===60?' · 기본':''}</option>`).join('')}</select></label><label>시작 예산<select name="startingBudget">${[150000,200000,250000,300000].map(n=>`<option value="${n}" ${n===options.startingBudget?'selected':''}>${money(n)}${n===200000?' · 기본':''}</option>`).join('')}</select></label><div class="action-limit-note">오전 돌봄 2회 + 오후 돌봄 2회로 고정돼요.<br>급여는 별도 시간에 진행하고 관찰·열람은 무료예요.</div><p class="muted">새 게임부터 적용돼요. 넉넉한 시간으로 연습해도 좋아요.</p><button class="button primary full" type="submit">이 설정으로 준비하기</button></form>`;
    }else if(kind==='credits'){
      title='이미지 & 제작 노트';content='<div class="credits"><p>사용자가 제공한 봉제 고양이의 분위기를 참고해 방, 고양이·강아지 동작, 물품 이미지를 생성했습니다. 부드러운 펠트 질감과 둥근 형태로 같은 화풍을 유지했습니다.</p><div class="credits-plush">'+S.petSprite('cat',4)+S.petSprite('dog',4)+'</div><p>내장 이미지 생성 도구 · 2026년 10월<br>캐릭터 '+Object.values(D.PETS).length+'마리 × 8개 표정·자세 / 물품 아틀라스 / 방 배경 / 16개 상황 장면<br>모든 게임 이미지가 파일에 포함되어 오프라인에서도 표시됩니다.</p><p>프로필 이름과 성향, 가격과 상태 수치는 게임용 설정입니다. 초기 버전에 사용한 공개 라이선스 사진의 출처는 assets/LICENSES.txt에 보존했습니다.</p><p>구조 참고: <a href="https://store.steampowered.com/app/368360/60_Seconds/?l=koreana" target="_blank" rel="noreferrer">60 Seconds!</a>의 시간 제한 준비와 일일 자원 관리. 화면·문구·게임 규칙은 자체 제작했습니다.</p></div>';
    }else if(kind==='experience-reset'){title='체험 기록을 새로 시작할까요?';content='<p>체험 완료 표시와 최초 배변 안내 기록을 초기화해요. 7일 시뮬레이션 저장은 유지돼요.</p>'+btn('체험 기록 초기화','experience-reset-confirm','button primary')+btn('취소','close-modal','button');
    }else if(kind==='restart'||kind==='replace'){
      title='새로운 이야기를 시작할까요?';content=`<div class="confirm-content"><p>이 브라우저에는 하나의 진행 상황을 저장해요. 새 이야기를 시작하면 이전 저장을 바꿔요.</p>${btn('새 게임 시작','confirm-new','button primary full')}${btn('이전 이야기 유지하기','close-modal','button ghost full')}</div>`;
    }else if(kind==='skip-meal'||kind==='overfeed'){
      title=kind==='skip-meal'?'이번 식사를 건너뛸까요?':'정량보다 많이 급여할까요?';content=`<div class="confirm-content"><p>${kind==='skip-meal'?'식사를 놓치면 식사·건강 상태와 기본 돌봄 평가에 반영돼요. 부족한 물품은 추가 주문할 수 있어요.':'이 게임의 정량은 사료 1끼예요. 2끼분을 한 번에 주면 재고를 더 쓰고 건강과 예산 평가에도 불이익이 있어요.'}</p>${btn(kind==='skip-meal'?'이번 식사 건너뛰기':'2끼분 급여하기','confirm-meal','button primary full',`data-amount="${kind==='skip-meal'?0:2}"`)}${btn('돌아가기','close-modal','button ghost full')}</div>`;
    }
    $('#modal-root').innerHTML=`<div class="modal-overlay"><section class="modal ${wide?'wide':''} ${['event','event-replay'].includes(kind)?'event-modal':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><div class="modal-header"><h2 id="modal-title">${title}</h2>${kind!=='event'?btn(icon('close'),'close-modal','icon-button','aria-label="닫기"'):''}</div><div class="modal-body">${content}</div></section></div>`;
    $('.modal').focus({preventScroll:true});
  }
  function roomAction(i){
    return i.use||({bowl:'feed',food:'feed',waterBowl:'water',litterBox:'clean',litter:'clean',pads:'clean',cleaner:'clean',hygiene:'hygiene',harness:'walk',bags:'walk'})[i.id];
  }
  function pose(number){
    const el=$('#pet-mover .plush-sprite');if(!el)return;
    if(state&&screen==='game'&&E.mood(state).locked)number=E.mood(state).pose;
    el.style.setProperty('--sprite-x',(number%4/3*100)+'%');el.style.setProperty('--sprite-y',(Math.floor(number/4)*100)+'%');
  }
  function restoreMood(){
    const mover=$('#pet-mover');if(!mover||!state)return;const m=E.mood(state);mover.className='pet-mover '+m.className;pose(m.pose);
    const bubble=$('#pet-bubble');if(bubble)bubble.textContent=m.name+(m.severity===2?' · 신호가 강해요':'');animationBusy=false;
  }
  function movePet(x,y,endPose=0,text='주변을 천천히 둘러봐요',behavior='walk'){
    const mover=$('#pet-mover');if(!mover||!state||state.stage!=='care')return;
    motionTimers.forEach(clearTimeout);motionTimers=[];animationBusy=true;const m=E.mood(state),gentle=pet().lifeStage!=='adult'||state.stats.fatigue>50||playStyle==='gentle';
    mover.getBoundingClientRect();pose(m.locked?m.pose:0);mover.classList.add('walking');mover.style.setProperty('--motion-scale',gentle?'.55':'1');
    if(!m.locked){mover.style.left=x+'%';mover.style.top=y+'%';mover.style.zIndex=Math.round(y)+1;mover.dataset.x=x;mover.dataset.y=y;state.room.pet={x,y};persist();}
    const bubble=$('#pet-bubble');if(bubble)bubble.textContent=m.locked?m.text:text;
    motionTimers.push(setTimeout(()=>{mover.classList.remove('walking');pose(endPose);mover.classList.add('behavior-'+(m.locked?'distress':behavior));animationBusy=false;},650));
    motionTimers.push(setTimeout(restoreMood,2400));
  }
  function perform(r,action,targetId){result(r);}
  document.addEventListener('pointerdown',e=>{
    if(!editing||modal||animationBusy||state?.stage!=='care')return;
    const object=e.target.closest('.room-object'),stage=$('#room-stage');if(!object||!stage)return;
    const rect=stage.getBoundingClientRect();drag={object,id:object.dataset.roomId,rect,startX:e.clientX,startY:e.clientY,moved:false};
    object.setPointerCapture(e.pointerId);object.classList.add('dragging');
  });
  document.addEventListener('pointermove',e=>{
    if(!drag)return;const {object,rect}=drag;
    if(Math.abs(e.clientX-drag.startX)+Math.abs(e.clientY-drag.startY)>5)drag.moved=true;
    if(!drag.moved)return;drag.x=Math.max(4,Math.min(96,(e.clientX-rect.left)/rect.width*100));drag.y=Math.max(45,Math.min(96,(e.clientY-rect.top)/rect.height*100));
    object.style.setProperty('--object-x',drag.x+'%');object.style.setProperty('--object-y',drag.y+'%');object.style.zIndex=Math.round(drag.y);
  });
  function endDrag(){if(!drag)return;if(drag.moved){E.placeItem(state,drag.id,drag.x,drag.y);persist();suppressClick=true;}drag.object.classList.remove('dragging');drag=null;}
  document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);
  document.addEventListener('pointerup',e=>{
    if(!state||screen!=='game'||state.stage!=='care'||modal||state.pendingEvent||editing||animationBusy||e.target.closest('button'))return;
    const stage=e.target.closest('.room-stage');if(!stage)return;const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
    if(y>=48)movePet(Math.max(10,Math.min(90,x)),Math.min(90,y),0);
  });
  setInterval(()=>{
    if(!state||screen!=='game'||state.stage!=='care'||modal||state.pendingEvent||animationBusy||editing||document.hidden)return;
    idleTicks++;restoreMood();
  },6500);

  function start(){
    state=E.newGame(selected,options);screen='game';modal=null;previousModal=null;category='전체';inventoryCategory='전체';inventoryItem=null;journalDay='all';journalType='all';playStyle='gentle';editing=false;timerMark=performance.now();persist();render();window.scrollTo(0,0);
  }
  document.addEventListener('click',e=>{
    if(suppressClick){suppressClick=false;return;}const b=e.target.closest('[data-do]');if(!b||b.disabled)return;if(animationBusy){e.preventDefault();return;}e.preventDefault();const action=b.dataset.do,id=b.dataset.id;
    if(screen==='game'&&state?.pendingEvent){const image=E.eventView(state)?.incident.screen==='image';if(image&&action!=='event-image-close')return;if(!image&&!['event','guide','guide-tab','shop','category','buy','prices','close-modal'].includes(action))return;}
    if(action==='select'){selected=id;rosterSpecies=D.PETS[id].species;render();}
    else if(action==='mode'){gameMode=id;render();}
    else if(action==='experience-reset')openModal('experience-reset');
    else if(action==='experience-reset-confirm'){experience=F.progress(null);experience.petId=selected;state=null;modal=null;previousModal=null;try{localStorage.setItem(F.EXPERIENCE_KEY,JSON.stringify(experience));}catch{saveError=true;}screen='scenarios';render();}
    else if(action==='scenario-list'){persist();state=null;screen='scenarios';modal=null;render();}
    else if(action==='scenario-start'){state=F.scenario(experience,selected,id);screen='game';modal=null;previousModal=null;persist();render();}
    else if(action==='scenario-launch'){result(F.launch(state));}
    else if(action==='experience-continue'){state=experience.current;selected=state.petId;screen='game';render();}
    else if(action==='scenario-retry'){state=F.scenario(experience,state.petId,state.experience.id);persist();render();}
    else if(action==='scenario-next'){const all=scenarioIds(),next=all[all.indexOf(state.experience.id)+1];if(next){state=F.scenario(experience,state.petId,next);persist();render();}else{state=null;screen='scenarios';render();}}
    else if(action==='start'){if(gameMode==='experience'){state=null;screen='scenarios';render();return;}if(saved)openModal('replace');else start();}
    else if(action==='confirm-new'){if(modal==='restart'){state=null;saved=null;screen='welcome';modal=null;previousModal=null;try{localStorage.removeItem(D.CONFIG.saveKey);}catch{}render();window.scrollTo(0,0);}else start();}
    else if(action==='continue'){gameMode='simulation';state=E.deserialize(E.serialize(saved));if(!state){toast('저장된 게임을 읽을 수 없어요.');return;}screen='game';timerMark=performance.now();render();}
    else if(action==='home'){persist();if(state?.mode==='experience')state=null;screen='welcome';modal=null;previousModal=null;render();window.scrollTo(0,0);}
    else if(action==='guide')openModal('guide',id||'start');
    else if(action==='guide-tab'){guideTab=id;renderModal();}
    else if(action==='close-modal')closeModal();
    else if(['inventory','journal'].includes(action)){previousModal=null;modal=null;openModal(action);}
    else if(action==='prices'){priceItem=id||null;openModal('prices');}
    else if(['settings','credits','restart','skip-meal','overfeed'].includes(action))openModal(action);
    else if(action==='roster-tab'){rosterSpecies=id;render();}
    else if(action==='inventory-category'){inventoryCategory=id;renderModal();}
    else if(action==='inventory-select'){inventoryItem=id;renderModal();}
    else if(action==='journal-day'){journalDay=id;renderModal();}
    else if(action==='journal-type'){journalType=id;renderModal();}
    else if(action==='play-style'){playStyle=id;renderModal();}
    else if(action==='observe'){const r=E.observe(state);result(r);if(r.ok)openModal('observation');}
    else if(action==='drink'){modal=null;previousModal=null;perform(F.command(state,'drink'),'drink','waterBowl');}
    else if(action==='urgent-feed'){modal=null;previousModal=null;perform(F.command(state,'feed',1,true),'feed','bowl');}
    else if(action==='shop'){category='전체';openModal('shop');}
    else if(action==='category'){category=id;if(modal==='shop')renderModal();else render();}
    else if(action==='buy'){const r=E.purchase(state,id);persist();if(modal==='shop')render();else render();toast(r.message);}
    else if(action==='remove')result(E.removeCart(state,id));
    else if(action==='finish-shopping')result(E.finishShopping(state));
    else if(action==='feed')perform(F.command(state,'feed',Number(b.dataset.amount)),'feed','bowl');
    else if(action==='confirm-meal'){modal=null;previousModal=null;result(F.command(state,'feed',Number(b.dataset.amount)));}
    else if(action==='act'){
      if(['play','treat'].includes(id)&&E.actionItems(state,id).length>1){choiceAction=id;openModal('choose-item');}
      else{const tool=E.chosenItem(state,id);perform(F.command(state,'act',id,undefined,playStyle),id,tool);}
    }
    else if(action==='room-item'){if(editing){toast('물건을 끌어 원하는 곳에 놓아 주세요.');return;}selectedRoomItem=id;openModal('room-item');}
    else if(action==='use-room-item'||action==='use-inventory'){const i=E.item(id),a=roomAction(i);modal=null;previousModal=null;perform(a==='feed'?F.command(state,'feed',1):F.command(state,'act',a,i.use?i.id:undefined,playStyle),a,id);}
    else if(action==='use-choice'){modal=null;previousModal=null;perform(F.command(state,'act',choiceAction,id,playStyle),choiceAction,id);}
    else if(action==='toggle-labels'){labels=!labels;render();}
    else if(action==='decorate'){editing=!editing;render();}
    else if(action==='pet-info'){const r=E.observe(state);result(r);if(r.ok)openModal('observation');}
    else if(action==='end-period')result(F.command(state,'end'));
    else if(action==='event-image-close')result(E.closeEventImage(state,Number(b.dataset.instance)));
    else if(action==='event')result(E.resolveEvent(state,id,Number(b.dataset.instance)));
    else if(action==='event-replay'){replayIncident=Number(id);openModal('event-replay');}
    else if(action==='next-day'){result(F.command(state,'next'));window.scrollTo(0,0);}
    else if(action==='export'){
      const report={title:'처음, 함께 — 7일 돌봄 기록',pet:pet().name,profile:pet().type,result:E.score(state),days:state.history,journal:state.journal,discoveries:state.discoveries,expenses:state.ledger,note:'게임용 예시 수치이며 실제 건강·비용 기준이 아닙니다.'};
      const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='처음-함께-7일기록.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
  });
  document.addEventListener('submit',e=>{
    if(e.target.id!=='settings-form')return;e.preventDefault();const form=new FormData(e.target);
    for(const key of Object.keys(options))options[key]=Number(form.get(key));closeModal();toast('새 게임의 진행 설정을 저장했어요.');
  });
  document.addEventListener('keydown',e=>{
    if(animationBusy){e.preventDefault();return;}
    if(e.key==='Escape'&&screen==='game'&&state?.pendingEvent&&!modal){e.preventDefault();if(E.eventView(state)?.incident.screen==='image')result(E.closeEventImage(state));return;}
    if(e.key==='Escape'&&modal){closeModal();return;}
    if(e.key==='Tab'&&$('.modal')){
      const focusable=[...$('.modal').querySelectorAll('button:not([disabled]),a,select,input')];if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('.modal'))){last.focus();e.preventDefault();}
      else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===$('.modal'))){first.focus();e.preventDefault();}
    }
  });
  function updateTimer(){
    if(!state||state.stage!=='shopping')return;
    const t=$('#timer'),bar=$('#timer-progress');if(t)t.innerHTML=`${Math.ceil(state.remainingMs/1000)}<small>초</small>`;
    if(bar)bar.style.width=`${state.remainingMs/(state.settings.shoppingSeconds*1000)*100}%`;
    $('.timer-box')?.classList.toggle('urgent',state.remainingMs<=10000);
  }
  setInterval(()=>{
    const now=performance.now(),delta=now-timerMark;timerMark=now;
    if(screen!=='game'||!state||state.stage!=='shopping'||modal||document.hidden)return;
    if(E.tickShopping(state,delta)){persist();render();toast('쇼핑 시간이 끝났어요. 준비한 물품과 함께 첫날을 시작해요.');}
    else{updateTimer();if(now-lastPersist>1000){persist();lastPersist=now;}}
  },200);
  document.addEventListener('visibilitychange',()=>{timerMark=performance.now();persist();});
  window.addEventListener('pagehide',persist);
  render();
})();
