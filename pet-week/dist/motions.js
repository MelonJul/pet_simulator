/* Coat-preserving articulated sprite layers. No effects or inventory writes here. */
(function(root){
 const S=root.PetScene,E=root.PetEngine;let timers=[],generation=0;
 const anchors={catDudung:[.47,.59,.66],catKitten:[.51,.53,.66],dogSunny:[.54,.50,.64],dogCalm:[.56,.53,.64],dogSocial:[.54,.51,.61],dogIndependent:[.59,.47,.55]};
 function cancel(){generation++;timers.forEach(clearTimeout);timers=[];}
 function rig(s,action){const p=E.pet(s),a=anchors[p.id]||(p.species==='cat'?[.50,.55,.65]:[.54,.51,.63]),toilet=['stool','urine'].includes(action),lift=p.species==='dog'&&action==='urine'&&['dogSunny','dogIndependent','dogSocial'].includes(p.id);return '<span class="care-rig '+p.species+' '+(toilet?'toileting':'')+' '+(lift?'leg-lift':'')+'" style="--mouth-x:'+a[0]*100+'%;--mouth-y:'+a[1]*100+'%;--cut:'+a[2]*100+'%;--drop:'+(p.species==='cat'?13:16)+'%"><span class="rig-body rig-layer">'+S.petSprite(p.id,toilet?3:0)+'</span><span class="rig-head rig-layer">'+S.petSprite(p.id,0)+'<i class="rig-mouth"></i><i class="rig-tongue"></i></span>'+(lift?'<span class="rig-leg rig-layer">'+S.petSprite(p.id,3)+'</span>':'')+(toilet&&p.species==='cat'?'<span class="rig-paw rig-layer">'+S.petSprite(p.id,3)+'</span>':'')+'<span class="sand-kicks">· · ·</span></span>';}
 function play(s,job,done){
  cancel();const token=generation,mover=document.querySelector('#pet-mover'),stage=document.querySelector('#room-stage'),actor=document.querySelector('#pet-mover .pet-actor');
  if(!mover||!stage||!actor){done();return;}
  const p=E.pet(s),mood=E.mood(s),kind=job.action,meal=kind==='feed',drink=kind==='drink',toilet=['stool','urine'].includes(kind),target=meal?'bowl':drink?'waterBowl':toilet?job.location?.place:job.target;
  const object=document.querySelector('[data-room-id="'+target+'"] .item-art'),box=stage.getBoundingClientRect(),petbox=mover.getBoundingClientRect();
  const a=anchors[p.id]||(p.species==='cat'?[.50,.55,.65]:[.54,.51,.63]),drop=p.species==='cat'?.13:.16,rect=object?.getBoundingClientRect();
  let x=job.location?.x??48,y=job.location?.y??78;
  if((meal||drink)&&rect){const px=rect.left+rect.width*(drink?.52:.50),py=rect.top+rect.height*(drink?.37:.39);x=(px-box.left+petbox.width*(.5-a[0]))/box.width*100;y=(py-box.top+petbox.height*(.91-a[1]-drop))/box.height*100;}
  else if(rect){x=(rect.left+rect.width*.5-box.left)/box.width*100;y=(rect.bottom-box.top)/box.height*100;}
  mover.style.left=x+'%';mover.style.top=y+'%';mover.style.zIndex=Math.round(y)+1;mover.className='pet-mover '+mood.className+(mood.locked?'':' walking');mover.style.setProperty('--motion-scale',p.lifeStage!=='adult'||s.stats.fatigue>50?'.55':'1');if(kind==='play'&&E.item(job.target)&&!mood.locked)stage.insertAdjacentHTML('beforeend','<div class="active-toy toy-motion-'+job.response?.kind+'" style="left:'+x+'%;top:'+y+'%">'+S.itemArt(E.item(job.target))+'</div>');
  const label=document.querySelector('#pet-bubble');if(label)label.textContent=meal?'밥그릇으로 가요':drink?'깨끗한 물을 살펴요':toilet?'배변 장소를 찾아요':job.response?.label||'천천히 반응을 살펴요';
  const later=(ms,fn)=>timers.push(setTimeout(()=>{if(token===generation)fn();},ms));
  later(650,()=>{mover.classList.remove('walking');if(meal||drink||toilet){actor.innerHTML=rig(s,kind);actor.classList.add('performing-'+kind);if(object&&(meal||drink))object.insertAdjacentHTML('beforeend','<span class="bowl-surface '+(meal?'food-surface':'water-surface')+'"><i></i><b></b><em></em></span>');}else{const sprite=actor.querySelector('.plush-sprite');if(sprite){const pose=mood.locked?mood.pose:(job.response?.pose??(kind==='rest'?5:0));sprite.style.setProperty('--sprite-x',pose%4/3*100+'%');sprite.style.setProperty('--sprite-y',Math.floor(pose/4)*100+'%');}mover.classList.add('behavior-'+(mood.locked?'look':(job.response?.animation||({rest:'sleep',hygiene:'groom',walk:'fetch',catnip:'roll'}[kind]||'look'))));}});
  later(1050,()=>{actor.classList.add('lowered');if(label)label.textContent=meal?'고개를 낮춰 한 입씩':drink?(job.drank===false?'지금은 마시지 않았어요':'혀로 조금씩 마셔요'):toilet?(kind==='stool'?'자세를 낮춰 대변을 봐요':'자기 자세로 소변을 봐요'):mood.locked?mood.text:(job.response?.reaction||'반응을 기록하고 있어요');});
  later(1450,()=>{if((meal||drink)&&job.drank!==false){actor.classList.add('consuming');object?.classList.add(meal?'food-decreasing':'water-rippling');}});
  later(3300,()=>{actor.classList.remove('consuming');if(toilet&&p.species==='cat'&&job.location?.place==='litterBox'){actor.classList.add('covering');if(label)label.textContent='앞발로 모래를 덮어요';}else{actor.classList.remove('lowered');if(label)label.textContent=meal?'냠냠, 식사를 마쳤어요':drink?(job.drank===false?'억지로 권하지 않고 물러나요':'물을 마시고 입가를 핥아요'):'동작을 마쳤어요';}});
  later(4400,()=>{stage.querySelector('.active-toy')?.remove();object?.querySelector('.bowl-surface')?.remove();object?.classList.remove('food-decreasing','water-rippling');actor.className='pet-actor';done();});
 }
 root.PetMotion={play,cancel,rig,anchors};
})(typeof globalThis!=='undefined'?globalThis:this);
