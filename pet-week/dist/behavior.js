(function(root){
  'use strict';
  const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.PetData;
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
  const pof=s=>D.PETS[s.petId];
  const stateLabels={calm:'평온함',hungry:'배고픔',thirsty:'수분 부족',playful:'놀고 싶음',joyful:'즐거움과 만족',sleepy:'피곤함과 졸림',anxious:'불안과 스트레스',uncomfortable:'아프거나 불편함'};
  const poses={calm:0,hungry:1,thirsty:2,playful:3,joyful:4,sleepy:5,anxious:6,uncomfortable:7};
  function signals(s){
    const p=pof(s),v=s.stats,cat=p.species==='cat',out=[];
    const add=(key,severity,text,priority)=>out.push({key,severity,text,priority});
    if(v.nutrition<55)add('hungry',v.nutrition<=15?2:1,v.nutrition<=15?'밥그릇 곁에서 고개를 낮추고 힘없이 기다린다. 식사 신호가 강해졌다.':'밥그릇 주변을 맴돌며 보호자를 바라보고 입가를 핥는다.',v.nutrition<=15?100:65);
    if(v.hydration<55)add('thirsty',v.hydration<=15?2:1,v.hydration<=15?'몸을 낮추고 입가를 자주 핥는다. 물 쪽으로 움직이다가 오래 멈춘다.':'물그릇 쪽으로 다가갔다가 돌아온다. 입가를 몇 번 핥는다.',v.hydration<=15?101:66);
    if(v.health<=40||v.health<p.startStats.health-14)add('uncomfortable',v.health<=35?2:1,'평소보다 움직임이 적고 몸을 웅크리고 있다. 원인을 단정하지 말고 변화를 기록해 상담을 고려한다.',v.health<=35?95:80);
    if(v.stress>58)add('anxious',v.stress>=80?2:1,cat?'귀를 뒤로 돌리고 꼬리를 몸 가까이 붙인다. 접근하면 잠깐 몸을 낮춘다.':'귀를 뒤로 젖히고 꼬리를 낮춘다. 주변 소리에 몸을 굳히며 거리를 둔다.',v.stress>=80?90:72);
    if(v.fatigue>=60||s.phase===4&&v.fatigue>=28)add('sleepy',v.fatigue>=82?2:1,v.fatigue>=82?'눈을 거의 감고 몸을 낮춘다. 짧게 움직인 뒤에도 다시 눕는다.':'눈을 천천히 감았다 뜨고 하품하며 편한 자리를 찾는다.',v.fatigue>=82?85:60);
    if(v.activity<42)add('playful',v.activity<20?2:1,cat?'장난감을 앞발로 건드리며 시선을 움직인다. 꼬리 끝이 작게 흔들린다.':'장난감을 바라보거나 앞발로 건드리며 보호자를 번갈아 쳐다본다.',45);
    if(!out.length&&s.lastInteraction?.attitude==='like')add('joyful',1,cat?'눈을 부드럽게 좁히고 꼬리를 세운 채 놀이하던 자리에 머문다.':'입가가 부드러워지고 꼬리를 느슨하게 흔들며 가까이에 머문다.',20);
    if(!out.length)add('calm',1,cat?'귀와 수염이 편하게 놓여 있고 앞발을 모아 느긋하게 앉아 있다.':'귀와 꼬리가 편하게 놓여 있고 고른 움직임으로 주변을 둘러본다.',10);
    return out.sort((a,b)=>b.priority-a.priority);
  }
  function mood(s){
    const sig=signals(s),a=sig[0],p=pof(s);
    return {key:a.key,name:stateLabels[a.key],pose:poses[a.key],text:a.text,severity:a.severity,locked:a.priority>=85,className:`state-${a.key} severity-${a.severity} ${p.stressSensitivity>1.4?'sensitive':'steady'}`,face:'',signals:sig};
  }
  function observe(s){
    const p=pof(s),list=signals(s),lines=list.map(x=>x.text);
    lines.push(p.habit);
    if(p.lifeStage==='young')lines.push('어린 개체라 시선이 자주 바뀐다. 짧은 활동 뒤 눈을 감는지도 살핀다.');
    if(p.lifeStage==='senior')lines.push('천천히 자세를 바꾼다. 나이만으로 불편하다고 단정하지 않고 평소 기록과 비교한다.');
    const latestFeed=s.journal.filter(e=>e.day===s.day&&e.type==='feed').at(-1);
    if(latestFeed){const meal=latestFeed;lines.push(meal.amount?`가장 최근 급여에서 사료 ${meal.amount}끼분을 실제로 먹는 것을 확인했다.`:'가장 최근 예정된 식사는 건너뛰었다. 이번 관찰만으로 다른 음식을 먹었다고 볼 수 없다.');}
    else lines.push('오늘 실제로 먹는 모습을 확인한 기록은 아직 없다.');
    const drinks=s.journal.filter(e=>e.day===s.day&&e.type==='drink');
    lines.push(drinks.length?`오늘 실제로 물을 마시는 모습을 ${drinks.length}회 확인했다.`:'오늘 실제로 물을 마시는 모습은 아직 확인하지 못했다. 물 교체와 음수는 다른 기록이다.');
    if(s.water.amount===0)lines.push('물그릇에 준비된 물이 없다.');
    else if(s.water.freshDay<s.day)lines.push('그릇에 물은 남아 있지만 오늘 교체한 기록은 없다.');
    if(s.stats.cleanliness<40)lines.push('배변 공간 주변이 어지럽고 발 주변이 지저분해 보인다.');
    if(s.day>1)lines.push(s.adaptation>=60?'지금은 방의 여러 곳을 오가며 탐색한다.':'지금은 익숙한 자리 근처에서 주로 움직인다. 천천히 적응할 시간이 필요하다.');
    return {lines,signals:list.map(({key,severity,text})=>({key,severity,text})),day:s.day,phase:s.phase,revision:s.revision};
  }
  const playKinds={
    ball:{name:'공놀이',intensity:3,cat:['공을 눈으로 따라가다 앞발로 톡 건드리고 짧게 쫓는다.','chase'],dog:['공을 바라본 뒤 쫓아가 물고 돌아온다.','fetch']},
    tug:{name:'터그 놀이',intensity:3,cat:['로프 끝을 물고 짧게 당긴 뒤 놓는다.','tug'],dog:['로프를 물고 뒷발을 디뎌 부드럽게 당긴다.','tug']},
    squeak:{name:'소리 탐색',intensity:2,cat:['귀를 기울이고 고개를 갸웃하며 소리의 위치를 찾는다.','listen'],dog:['귀를 세우고 고개를 번갈아 갸웃한다.','listen']},
    wand:{name:'사냥놀이',intensity:3,cat:['몸을 낮추고 시선으로 따라간 뒤 짧게 뛰어올라 덮친다.','pounce'],dog:['흔들리는 끝을 눈으로 따라가다 낮게 뛰어 다가간다.','pounce']},
    plush:{name:'인형 교감',intensity:1,cat:['인형을 앞발 사이에 안고 가볍게 건드린 뒤 곁에 쉰다.','cuddle'],dog:['인형을 살짝 물고 자리로 옮긴 뒤 앞발 사이에 둔다.','carry']},
    puzzle:{name:'퍼즐 탐색',intensity:1,cat:['코를 가까이 대고 냄새를 맡으며 앞발로 차분하게 탐색한다.','sniff'],dog:['코로 냄새를 찾고 한 부분에 집중해 천천히 탐색한다.','sniff']},
    sniff:{name:'냄새 탐색',intensity:1,cat:['장난감 둘레를 킁킁대며 앞발로 틈을 살핀다.','sniff'],dog:['코를 낮추고 천천히 좌우로 움직이며 탐색한다.','sniff']},
    mouse:{name:'작은 사냥놀이',intensity:1,cat:['쥐 인형 앞에서 웅크린 뒤 앞발로 가볍게 덮친다.','pounce'],dog:['작은 인형의 냄새를 맡고 앞발로 건드린다.','chase']},
    tunnel:{name:'터널 탐험',intensity:1,cat:['입구를 살핀 뒤 몸을 낮춰 들어갔다가 다른 쪽으로 나온다.','tunnel'],dog:['입구의 냄새를 살피고 천천히 지나간다.','tunnel']},
    climb:{name:'캣타워 탐색',intensity:3,cat:['낮은 단부터 오르고 잠시 멈춰 방을 둘러본다.','climb'],dog:['주변을 차분하게 탐색한다.','sniff']}
  };
  function toyResponse(s,itemId,style='gentle'){
    const p=pof(s),i=D.ITEMS.find(x=>x.id===itemId),kind=i?.toyKind||'sniff',def=playKinds[kind],v=s.stats;
    const recent=[...s.history.flatMap(d=>d.actions),...(s.today?.actions||[])].filter(a=>a.id==='play').slice(-6).filter(a=>a.itemId===itemId).length;
    let affinity=p.toyAffinity[kind]??0;const reasons=[];
    if(affinity>=2)reasons.push('이 개체가 편안하게 참여하는 자극');
    if(affinity<0)reasons.push('이 개체가 부담스러워하는 자극');
    if(style==='gentle'){affinity+=.5;reasons.push('속도와 높이를 낮춰 짧게 진행');}
    if(v.health<p.startStats.health-10){affinity-=style==='gentle'?1:2;reasons.push('평소보다 낮은 컨디션');}
    if(style==='active'&&p.lifeStage!=='adult'){affinity-=2;reasons.push('현재 나이·컨디션에는 강도가 높음');}
    if(v.stress>65&&p.stressSensitivity>1.4&&def.intensity>1){affinity-=1.5;reasons.push('지금은 낯선 자극에 긴장함');}
    if(v.fatigue>=70){affinity-=3;reasons.push('피로가 쌓여 휴식이 먼저 필요함');}
    else if(v.fatigue>=50){affinity-=1;reasons.push('활동 후 피로가 남아 있음');}
    if(v.activity<35)affinity+=.5;
    if(recent>=2){affinity-=Math.min(4,(recent-1)*1.4);reasons.push('최근 같은 장난감을 반복함');}
    const attitude=affinity>=1.5?'like':affinity>=0?'neutral':affinity>=-2?'wary':'dislike';
    const label={like:'좋아하는 반응',neutral:'무관심한 반응',wary:'경계하는 반응',dislike:'싫어하는 반응'}[attitude];
    let [reaction,animation]=def[p.species];
    if(attitude==='neutral'){reaction=kind==='puzzle'?'잠깐 냄새를 맡다가 시선을 돌려 다른 자리로 간다.':'잠깐 바라보고 앞발을 움직이다가 관심을 거둔다.';animation='lookaway';}
    if(attitude==='wary'){reaction=p.species==='cat'?'귀를 옆으로 돌리고 몸을 낮춘 채 한 발 물러선다.':'귀와 꼬리를 낮추고 고개를 갸웃하다가 한 발 물러난다.';animation='startle';}
    if(attitude==='dislike'){reaction=p.species==='cat'?'귀를 뒤로 젖히고 꼬리를 몸에 붙인 채 자리를 피한다.':'고개를 돌리고 꼬리를 낮춘 채 장난감에서 멀어진다.';animation='withdraw';}
    const factor={like:1,neutral:.35,wary:.1,dislike:0}[attitude];
    return {itemId,kind,style,attitude,label,reaction,animation,pose:{like:4,neutral:0,wary:6,dislike:6}[attitude],reason:reasons.join(' · ')||'새로운 자극을 확인하는 중',recent,
      fit:attitude==='like'?1:attitude==='neutral'?.55:.2,
      effects:{activity:Math.round(p.activityNeed*factor),stress:attitude==='like'?-10:attitude==='neutral'?-2:style==='gentle'?0:5,bond:attitude==='like'?5:1,fatigue:Math.round((style==='gentle'?5:11)*p.fatigueRate*(attitude==='like'?1:.4))}
    };
  }
  function visibleChanges(before,after){
    const out=[];
    if(after.nutrition>before.nutrition)out.push('식사 후 밥그릇을 찾는 행동이 줄었다.');
    if(after.hydration>before.hydration)out.push('물을 마신 뒤 입가를 핥는 움직임이 잦아들었다.');
    if(after.cleanliness>before.cleanliness)out.push('배변 공간이나 털 주변이 더 정돈되어 보인다.');
    if(after.stress<before.stress-2)out.push('긴장된 자세가 조금 풀린다.');
    if(after.stress>before.stress+2)out.push('몸을 낮추거나 거리를 두는 신호가 더 뚜렷해진다.');
    if(after.activity>before.activity)out.push('함께 움직인 뒤 장난감을 조르는 행동이 줄었다.');
    if(after.fatigue<before.fatigue-5)out.push('쉰 뒤 눈을 뜨고 자세를 편하게 바꾼다.');
    if(after.fatigue>before.fatigue+5)out.push('활동 후 쉬는 자세를 더 자주 취한다.');
    return out.length?out:['이번 행동에서 뚜렷한 겉모습 변화는 확인하지 못했다.'];
  }
  const api={signals,mood,observe,toyResponse,visibleChanges,playKinds,stateLabels,poses,clamp};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;root.PetBehavior=api;
})(typeof globalThis!=='undefined'?globalThis:this);
