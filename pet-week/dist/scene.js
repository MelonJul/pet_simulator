/* 방 장면: 생성 이미지 아틀라스를 사용합니다. 게임 수치와 분리된 시각 상태입니다. */
(function(root){
  'use strict';
  const D=root.PetData,E=root.PetEngine;
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Optical sprite frames: transparent padding varies in the generated sheets.
  // Read each complete prop with CSS instead of trimming or changing the PNG originals.
  const FRAMES={
    'items-v2':[[10,40,300,260],[325,65,290,245],[626,40,300,270],[939,0,315,320],[20,298,295,362],[344,318,263,325],[633,341,303,308],[947,387,307,264],[40,699,265,247],[319,665,321,306],[653,700,273,233],[967,725,276,203],[29,949,277,305],[326,981,313,252],[659,945,263,309],[963,946,291,308]],
    'items-extra-v2':[[25,10,275,310],[321,80,292,245],[626,70,329,260],[989,25,260,310],[10,334,322,294],[345,328,260,294],[613,345,334,277],[954,365,298,250],[5,631,315,288],[348,632,289,290],[665,635,265,291],[956,635,298,291],[49,926,256,300],[330,930,308,295],[665,916,269,320],[963,918,287,306]]
  };
  function petSprite(id,pose=0,className=''){
    const p=D.PETS[id]||Object.values(D.PETS).find(p=>p.species===id),species=p.species;
    return `<span class="plush-sprite ${className}" data-species="${species}" data-pet="${p.id}" style="--pet-atlas:url('assets/${p.id}-states-v3.png');--sprite-x:${pose%4/3*100}%;--sprite-y:${Math.floor(pose/4)*100}%" aria-hidden="true"></span>`;
  }
  function itemArt(i,className=''){
    const atlas=i.atlas||'items-v2',[x,y,w,h]=FRAMES[atlas][i.sprite],size=1254;
    return `<span class="item-art ${className} tint-${i.tint||'none'}" style="--item-atlas:url('assets/${atlas}.png');--art-ratio:${w}/${h};--item-size:${size/w*100}% ${size/h*100}%;--item-x:${x/(size-w)*100}%;--item-y:${y/(size-h)*100}%" aria-hidden="true"></span>`;
  }
  function owned(s){
    return E.availableItems(s).filter(i=>s.stage==='shopping'?(s.cart[i.id]||0)>0:E.have(s,i.id)).map(i=>({...i,count:s.stage==='shopping'?s.cart[i.id]*i.qty:s.inventory[i.id]}));
  }
  function position(s,i){const custom=s.room?.layout?.[i.id];return {x:custom?.x??i.room[0],y:custom?.y??i.room[1],w:i.room[2]};}
  function installed(s){return owned(s).filter(i=>i.placement==='room');}
  function markup(s,{demo=false,preview=false,labels=true,editing=false}={}){
    const p=E.pet(s),m=E.mood(s),list=installed(s),location=s.room?.pet||{x:49,y:77};
    const time=s.phase===4||s.stage==='summary'?'evening':s.phase>=2?'afternoon':'morning';
    const pose=m.pose;
    return `<div class="room-stage ${time} ${preview?'room-preview':''} ${editing?'editing':''} ${labels?'show-labels':''}" id="room-stage" role="region" aria-label="${p.name}의 방 · 설치 물품 ${list.length}종"><img class="room-background" src="assets/room-v2.png" alt="따뜻한 창가와 러그가 있는 봉제인형 화풍의 방" draggable="false"><div class="room-daylight"></div><div class="room-specks" aria-hidden="true">✧<i>✦</i><b>·</b></div>
      ${!preview&&!demo&&p.species==='dog'&&E.have(s,'pads')?'<span class="toilet-pad" aria-label="정해진 배변패드 자리"></span>':''}${(s.toilet?.waste||[]).map(w=>`<span class="waste-mark waste-${w.kind} waste-${w.place}" style="left:${w.x}%;top:${w.y}%" role="img" aria-label="${w.kind==='stool'?'대변':'소변'} 흔적 · 청소 필요"></span>`).join('')}
      ${list.map(i=>{const q=position(s,i);const tag=demo?'span':'button';return `<${tag} class="room-object ${i.kind==='consumable'?'consumable':''} ${i.id==='catTower'?'tower':''}" ${demo?'':`type="button" data-do="room-item" data-id="${i.id}" aria-label="${i.name}, ${i.count}${i.unit} 보유" title="${i.name} · ${i.count}${i.unit}${editing?' · 끌어서 배치':''}"`} style="--object-x:${q.x}%;--object-y:${q.y}%;--object-w:${q.w}%;z-index:${Math.round(q.y)}" data-room-id="${i.id}">${itemArt(i)}<span class="object-label">${i.name}<b>${i.kind==='consumable'?i.count+i.unit:'✓'}</b></span>${i.kind==='consumable'?`<span class="object-count">${i.count}</span>`:''}</${tag}>`;}).join('')}
      ${preview?'<div class="arrival-card">곧, 새로운 가족이 와요<span>가구는 방에 · 소모품과 장난감은 인벤토리에</span></div>':`<div id="pet-mover" class="pet-mover ${m.className}" style="left:${location.x}%;top:${location.y}%;z-index:${Math.round(location.y)+1}" data-x="${location.x}" data-y="${location.y}"><div class="pet-shadow"></div><div class="pet-bubble" id="pet-bubble">${demo?'여기가 우리 집이야?':m.name+(m.severity===2?' · 신호가 강해요':'')}</div><${demo?'span':'button'} class="pet-actor" ${demo?'':`type="button" data-do="pet-info" aria-label="${p.name} 상태 보기" title="눌러서 상태 보기"`}>${petSprite(p.id,pose,'room-pet')}</${demo?'span':'button'}><${demo?'span':'button'} class="pet-name-tag" ${demo?'':'type="button" data-do="pet-info"'}>${p.name}${demo?'<i>♥</i>':' · 상태 보기'}</${demo?'span':'button'}><span class="pet-particles" id="pet-particles"></span></div>`}
      ${!demo&&!preview?`<div class="room-nameplate"><i>⌂</i> ${p.name}의 포근한 방 <span>${time==='evening'?'노을이 내리는 저녁':time==='afternoon'?'나른한 오후':'햇살 좋은 아침'}</span></div><div class="room-controls"><button data-do="toggle-labels" class="room-control" aria-pressed="${labels}">이름표 ${labels?'켜짐':'꺼짐'}</button><button data-do="decorate" class="room-control ${editing?'active':''}" aria-pressed="${editing}">${editing?'배치 완료 ✓':'방 꾸미기'}</button></div><div class="room-instruction">${editing?'설치 물품을 끌어 옮겨 보세요 · 자동 저장':'친구를 누르면 상태 보기 · 장난감은 인벤토리에서'}</div>`:''}
    </div>`;
  }
  root.PetScene={markup,petSprite,itemArt,owned,installed,position};
})(typeof globalThis!=='undefined'?globalThis:this);
