/* Presentation only. Replaying a recorded incident never invokes the simulation. */
(function(root){
  'use strict';
  const E=root.PetEngine,S=root.PetScene,ED=root.PetEventData;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>n.toLocaleString('ko-KR')+'원';
  const images=new Map();
  function preload(s,e=null){
    if(typeof root.Image!=='function')return Promise.resolve(true);
    const p=E.pet(s),urls=[`assets/${p.id}-states-v3.png`];
    if(p.species==='cat')urls.push(`assets/events/pets/${p.id}-events-v1.png`);
    if(e)urls.push(e.image.atlas);
    return Promise.all(urls.map(url=>{
      if(!images.has(url))images.set(url,new Promise(resolve=>{const img=new root.Image();img.onload=()=>resolve(true);img.onerror=()=>{images.delete(url);resolve(false);};img.src=url;}));
      return images.get(url);
    })).then(ready=>ready.every(Boolean));
  }
  function readyScene(el,s,e){
    if(!el)return;
    el.classList.add('incident-loading');
    return preload(s,e).then(ready=>{if(el.isConnected===false)return;el.classList.remove('incident-loading');el.classList.toggle('incident-load-error',!ready);});
  }
  // Optical source rectangles preserve paws and tails that cross the grid.
  // Only CSS samples the original PNG; no raster is trimmed or rewritten.
  function frameStyle(meta,pose){
    const [x,y,w,h]=meta.frames[pose],scale=Math.min(352/w,434/h);
    return {left:(384-w*scale)/2/384*100,top:(450-h*scale)/512*100,width:w*scale/384*100,height:h*scale/512*100,sizeX:meta.width/w*100,sizeY:meta.height/h*100,x:x/(meta.width-w)*100,y:y/(meta.height-h)*100};
  }
  function actorSprite(id,pose,className,r){
    const meta=root.CatEventFrames?.[id];
    if(!meta||r.critical)return S.petSprite(id,pose,className);
    const f=frameStyle(meta,pose);
    return `<span class="incident-cutout ${className}" data-pet="${id}" data-pose="${pose}" aria-hidden="true"><span style="left:${f.left}%;top:${f.top}%;width:${f.width}%;height:${f.height}%;background-image:url('${r.atlas}');background-size:${f.sizeX}% ${f.sizeY}%;background-position:${f.x}% ${f.y}%"></span></span>`;
  }
  function presentation(s,e,small=false){
    const p=E.pet(s),r=ED.REACTIONS[e.id]||ED.REACTIONS.newHome,mood=E.mood(s);
    const critical=!small&&mood.locked,frames=critical?[mood.pose,mood.pose,mood.pose]:r[p.species]||[e.image.pose,e.image.pose,e.image.pose];
    const atlas=p.species==='cat'&&!critical?`assets/events/pets/${p.id}-events-v1.png`:`assets/${p.id}-states-v3.png`;
    const scale=p.lifeStage==='senior'?.55:p.lifeStage==='young'?.85:1,alert=1+(p.stressSensitivity-1)*.18;
    return {...r,frames,atlas,motion:critical?'breathe':r.motion,scale:Math.round(scale*alert*100)/100,critical,text:critical?mood.text:r.text};
  }
  function scene(s,e,small=false){
    if(e.image.room){const props={bowl:'bowl',waterBowl:'waterBowl',toy:'wand',bed:'bed',plush:'plush',stool:E.pet(s).species==='cat'?'litterBox':'pads',urine:E.pet(s).species==='cat'?'litterBox':'pads'},object=E.item(props[e.image.prop]);return '<div class="incident-scene room-incident scene-'+e.image.prop+' '+(small?'incident-thumbnail':'')+'" data-character="'+s.petId+'" data-incident="'+e.id+'" role="img" aria-label="'+esc(E.pet(s).name+' · '+e.description)+'"><img src="assets/room-v2.png" alt=""><div class="room-incident-pet">'+S.petSprite(s.petId,!small&&E.mood(s).locked?E.mood(s).pose:(e.image.pose||0))+'</div>'+(object?'<div class="room-incident-prop">'+S.itemArt(object)+'</div>':'')+'<span class="scene-signal" aria-hidden="true">'+({itch:'〰',gait:'…',urine:'◌',stool:'●',window:'♪'}[e.image.prop]||'')+'</span></div>';}
    const a=e.image,r=presentation(s,e,small),p=E.pet(s),frames=small?[r.frames[2]]:r.frames;
    return `<div class="incident-scene ${small?'incident-thumbnail':'incident-live'}" data-incident="${e.id}" data-character="${s.petId}" data-expression="${r.frames.join('-')}" role="img" aria-label="${esc(p.name+' · '+e.description+' '+r.text)}" style="--scene-atlas:url('${a.atlas}');--scene-x:${a.cell%2*100}%;--scene-y:${Math.floor(a.cell/2)*100}%"><span class="incident-pet ${r.critical?'incident-critical':''}" style="left:${r.x}%;top:${r.y}%;width:${r.width}%;--acting-scale:${r.scale};--acting-flip:${r.flip||1};"><span class="incident-motion motion-${r.motion}"><span class="incident-facing">${frames.map((pose,i)=>actorSprite(s.petId,pose,small?'incident-pose pose-still':`incident-pose pose-${i}`,r)).join('')}</span></span>${!small?`<span class="incident-character-name">${esc(p.name)}</span>${r.cue&&!r.critical?`<span class="incident-reaction-cue" aria-hidden="true">${r.cue}</span>`:''}`:''}</span></div>`;
  }
  function imageScreen(s,v){return `<div class="modal-overlay incident-image-overlay"><section class="modal incident-image-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><div class="incident-viewport">${scene(s,v.event)}</div><div class="incident-image-heading"><span>DAY ${v.incident.day} · ${esc(E.pet(s).name)}의 순간</span><h2 id="modal-title">${esc(v.incident.title)}</h2></div><button class="incident-close" data-do="event-image-close" data-instance="${v.incident.instanceId}" aria-label="닫기 · 상황 설명으로 이동">닫기 <span aria-hidden="true">✕</span></button></section></div>`;}
  const list=items=>'<ul>'+items.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';
  function education(s,v,replay=false){
    const {event:e,incident:i}=v;
    const choices=replay?'<p>'+esc(i.result||'대응 전 기록이에요.')+'</p>':'<div class="event-choices">'+e.choices.map(c=>{const reason=E.eventReason(s,c.id,i.instanceId),costs=[c.money?money(c.money):'',c.cost?'행동 '+c.cost+'회':'',...(c.require||[]).map(id=>E.item(id).name+' 필요'),...Object.entries(c.consume||{}).map(([id,n])=>E.item(id).name+' '+n+E.item(id).unit+' 소모')].filter(Boolean);return '<button class="event-choice" data-do="event" data-id="'+c.id+'" data-instance="'+i.instanceId+'" '+(reason?'disabled':'')+'><b>'+esc(c.label)+'</b>'+(costs.length?'<span>'+esc(costs.join(' · '))+'</span>':'')+(reason?'<small>'+esc(reason)+'</small>':'')+'</button>';}).join('')+'</div>';
    const sections=[['01','무슨 일이 있었나요?','<p>'+esc(i.description)+'</p>'+((i.losses||[]).length?'<p>'+esc(i.losses.join(' '))+'</p>':'')],['02','왜 이런 행동을 했을까요?',list(e.causes)+(e.urgent?'<p class="incident-urgent"><b>지금 동물병원에 연락해 주세요.</b> 기다리거나 임의로 약을 주어 해결하지 않아요.</p>':'')],['03','지금 할 대응을 골라 주세요',choices]];
    return '<div class="incident-education"><div class="incident-story-top">'+scene(s,e,true)+'<div><span class="eyebrow">'+esc(E.pet(s).name)+' · '+(replay?'지난 사건':'잠깐 쉬어 가요')+'</span><h2>'+esc(i.title)+'</h2></div></div><div class="incident-lessons">'+sections.map(([n,title,body])=>'<section class="incident-lesson"><span class="lesson-number">'+n+'</span><div><h3>'+title+'</h3>'+body+'</div></section>').join('')+'</div><div class="event-links"><button class="text-button" data-do="guide" data-id="'+e.guide+'">관련 가이드북 ↗</button>'+(replay?'<button class="button" data-do="close-modal">일지로 돌아가기</button>':'<button class="text-button" data-do="shop">부족한 물품 주문</button>')+'</div></div>';
  }

  root.PetEventUI={scene,imageScreen,education,presentation,frameStyle,preload,readyScene};
})(typeof globalThis!=='undefined'?globalThis:this);
