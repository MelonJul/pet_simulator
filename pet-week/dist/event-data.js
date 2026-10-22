/* Editable event catalogue. Costs and frequency are GAME examples, not medical estimates. */
(function(root){
  'use strict';
  const SOURCES={
    scratch:['Cats Protection · 긁는 행동','https://www.cats.org.uk/help-and-advice/cat-behaviour/scratching'],
    hide:['Cats Protection · 숨는 행동','https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-hiding'],
    play:['Cats Protection · 놀이','https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-and-play'],
    home:['Cats Protection · 안전한 집','https://www.cats.org.uk/help-and-advice/caring-for-your-cat/home-and-environment/keeping-your-cat-safe'],
    toilet:['Cats Protection · 배변 문제','https://www.cats.org.uk/help-and-advice/cat-behaviour/toileting'],
    chew:['Dogs Trust · 물건을 망가뜨리는 행동','https://www.dogstrust.org.uk/dog-advice/training/unwanted-behaviours/destructive'],
    bark:['Dogs Trust · 짖는 행동','https://www.dogstrust.org.uk/dog-advice/training/unwanted-behaviours/stop-your-dog-barking'],
    walk:['Dogs Trust · 느슨한 줄로 걷기','https://www.dogstrust.org.uk/dog-advice/training/outdoors/walking-nicely-training'],
    dogEmergency:['PDSA · 유해 물질·이물 섭취 의심','https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/symptoms/my-dog-has-eaten-something-harmful'],
    catEmergency:['PDSA · 고양이의 이물과 장폐색','https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/conditions/bowel-obstructionintestinal-blockage-in-cats'],
    firstAid:['PDSA · 응급처치와 진료','https://www.pdsa.org.uk/pet-help-and-advice/looking-after-your-pet/all-pets/first-aid-for-pets']
  };
  const CONFIG={chance:.62,minPerDay:2,maxPerDay:3,cooldownDays:3,seriousChance:.025,minSafeNutrition:32,minSafeHydration:32};
  const scene=(atlas,cell,x=48,y=82,pose=0,width=27)=>({atlas:'assets/events/events-'+atlas+'-v1.png',cell,x,y,pose,width});
  const choice=(id,label,result,extra={})=>({id,label,result,money:0,cost:0,quality:1,effects:{},...extra});
  const cleanup=(flag='tidied')=>[
    choice('tidy','접근을 막고 수건으로 정리하기','안전한 곳으로 유도한 뒤 집에 있는 수건으로 정리하고 물건 위치를 바꿨다.',{flags:[flag],effects:{cleanliness:6,stress:-3}}),
    choice('kit','보유 청소용품으로 정리하기','청소용품으로 주변을 정리하고 물건 위치를 바꿨다.',{consume:{cleaner:1},flags:[flag],effects:{cleanliness:8,stress:-3}})
  ];
  const EVENTS=[
    {id:'newHome',species:'all',title:'아직은 낯선 우리 집',icon:'⌂',guide:'personality',image:scene('d',3,49,82,6),weight:()=>0,
      description:'익숙하지 않은 방에서 몸을 낮추고 소리 나는 쪽을 살폈어요.',causes:['새 냄새와 소리에 익숙해지는 속도는 개체마다 달라요.','몸을 낮추는 모습만으로 병이나 성격을 확정할 수는 없어요.'],response:'소리와 접촉을 줄이고 스스로 탐색할 시간을 주세요.',prevention:'편안한 쉼터와 일정한 돌봄 순서를 마련하고 방문객을 천천히 소개해요.',consequence:['파손·부상은 확인되지 않았어요. 주변에 적응할 시간이 필요해요.'],effects:{stress:3},sources:['hide','chew'],choices:[
        choice('space','조용한 쉼터에서 기다리기','쉼터에서 쉬다가 고개를 들고 주변을 살폈다.',{require:['bed'],effects:{stress:-12,bond:4}}),
        choice('quiet','주변 소리를 줄이고 거리 두기','접촉을 강요하지 않자 조심스럽게 탐색을 시작했다.',{effects:{stress:-10,bond:3}}),
        choice('hug','바로 안아서 달래기','몸을 더 낮추며 접촉을 피했다. 다음에는 먼저 다가오도록 기다려야겠다.',{quality:.2,effects:{stress:8,bond:-2}})]},
    {id:'catCup',species:'cat',title:'선반 위에서 떨어진 물컵!',icon:'◒',guide:'eventSafety',image:scene('a',0,34,40,3,22),weight:(s,p)=>s.environment.cupsSecured?.3:2+(p.activityNeed>=30?2:0),
      description:'선반 위 플라스틱 컵을 앞발로 건드려 컵이 떨어지고 물이 쏟아졌어요. 컵은 깨지지 않았어요.',causes:['높은 곳을 이용하거나 움직이는 물건을 앞발로 탐색하는 행동일 수 있어요.','주변 자극과 놀이 기록도 함께 봐요. 보호자를 골탕 먹이려 했다고 단정할 수 없어요.'],response:'젖은 바닥에 접근하지 않도록 유도하고 물을 닦아요.',prevention:'컵을 가장자리에서 치우고 안정적인 높은 쉼터를 마련해요.',consequence:['물청소가 필요해요. 컵 파손·부상·금전 손실은 발생하지 않았어요.'],effects:{cleanliness:-6},sources:['play','home'],choices:cleanup('cupsSecured')},
    {id:'catGlass',species:'cat',title:'떨어진 유리컵, 가까이 가지 않아요',icon:'!',guide:'eventSafety',image:scene('a',1,34,40,6,22),weight:s=>s.environment.cupsSecured?0:.35,minDay:3,
      description:'선반의 유리컵이 떨어져 깨졌고 물과 파편이 바닥에 남았어요.',causes:['높은 공간에서 앞발로 탐색하다 불안정한 물건을 건드릴 수 있어요.','이 사건에서 다친 모습은 아직 관찰되지 않았으며 부상으로 확정하지 않아요.'],response:'먼저 다른 안전한 공간으로 유도해 파편 접근을 막아요. 손을 보호해 치운 뒤 발·입가와 움직임을 관찰하고 이상이 있으면 진료를 구해요.',prevention:'깨지기 쉬운 컵은 닿지 않는 수납장에 두고 높은 공간의 흔들리는 물건을 고정해요.',consequence:['가정용 유리컵 1개 파손(돌봄 인벤토리 외 물건). 교체는 선택 사항이에요.','아직 부상은 확인되지 않았어요. 파편 정리와 상태 확인이 필요해요.'],effects:{cleanliness:-8,stress:3},sources:['home','firstAid'],choices:[
        choice('secure','접근 차단 → 파편 정리 → 상태 확인','파편을 치운 뒤 발과 입가, 걷는 모습을 확인했다. 이번 관찰에서는 상처나 절뚝임이 보이지 않았다.',{flags:['cupsSecured'],effects:{cleanliness:8,stress:-3}}),
        choice('replace','안전 조치 후 컵도 교체하기','안전 조치와 관찰을 마쳤다. 상처는 보이지 않았고 가정용 컵을 교체했다.',{money:4000,expenseType:'replacement',flags:['cupsSecured'],effects:{cleanliness:8,stress:-3}})]},
    {id:'catScratch',species:'cat',title:'소파에 남은 작은 발톱 자국',icon:'≋',guide:'eventBehavior',image:scene('a',2,44,83,3),weight:(s,p,h)=>!h.have('scratch')?5:h.scratchNear?1:3,
      description:'소파 옆면을 긁어 천에 얕은 자국이 남았어요.',causes:['긁기는 발톱 관리와 흔적 남기기 등 자연스러운 행동이에요.','스크래처가 있어도 위치·높이·재질이 취향과 맞지 않을 수 있어요.'],response:'혼내지 않고 긁던 곳 가까이 안전한 대체 표면을 두어 반응을 살펴요.',prevention:'소파 옆과 자고 일어나는 곳에 안정적인 긁을 공간을 마련하고 선호하는 방향을 관찰해요.',consequence:['소파 천에 얕은 자국이 생겼어요. 사용은 가능하며 수리비를 자동 청구하지 않아요.'],effects:{},sources:['scratch'],choices:[
        choice('move','보유 스크래처를 소파 옆으로 옮기기','스크래처를 소파 옆으로 옮겼다. 사용 여부는 다음 놀이 때 살펴보기로 했다.',{require:['scratch'],place:{scratch:{x:30,y:69}},flags:['scratchAdjusted'],effects:{stress:-4}}),
        choice('protect','소파를 보호하고 집의 튼튼한 골판지 제공','느슨한 끈과 테이프를 제거한 골판지를 고정했다. 실제 선호는 다음 관찰로 확인한다.',{flags:['scratchAdjusted'],effects:{stress:-3}})]},
    {id:'catPlant',species:'cat',title:'화분이 기울고 흙이 와르르!',icon:'♧',guide:'eventSafety',image:scene('a',3,40,83,3),weight:s=>s.environment.plantsSecured?.2:1.4,
      description:'캣그라스가 담긴 플라스틱 화분이 기울어 흙이 쏟아졌어요. 화분은 깨지지 않았어요.',causes:['흔들리는 잎이나 흙의 질감을 탐색하다 건드렸을 수 있어요.','이 장면의 식물은 게임용 캣그라스 설정이며 다른 식물도 안전하다는 뜻은 아니에요.'],response:'흙을 치우고 접근을 막아요. 식물 종류가 불분명하거나 먹은 것이 의심되면 병원에 확인해요.',prevention:'안전성을 확인한 식물만 두고 화분을 안정적으로 고정해요.',consequence:['흙청소가 필요해요. 화분 손실과 식물 섭취·부상은 확인되지 않았어요.'],effects:{cleanliness:-6},sources:['home'],choices:cleanup('plantsSecured')},
    {id:'catBox',species:'cat',title:'새 장난감보다 이 상자가 좋아요',icon:'□',guide:'eventBehavior',image:scene('b',0,59,80,4),weight:(s,p,h)=>h.recentPlay?2.5:0,
      description:'장난감 대신 배송 상자를 살피다가 안에 자리를 잡았어요.',causes:['몸을 가리는 공간이나 새로운 냄새가 매력적일 수 있어요.','장난감이 싫다는 결론은 아직 일러요. 피로와 놀이 방식에 따라 반응은 달라져요.'],response:'스테이플·끈·테이프를 제거하고 편히 나올 수 있는 안전한 상자를 제공해요.',prevention:'새 장난감은 짧게 제안하고 스스로 선택하는 반응을 기록해요.',consequence:['물품 손실·비용 없음. 상자를 선택한 모습을 이번에 확인했어요.'],effects:{stress:-2},sources:['hide','play'],choices:[choice('confirm','확인 · 이번 선택을 기억하기','이번에는 상자를 선택한 모습을 일지에 남겼다. 모든 장난감을 싫어한다는 뜻으로 단정하지 않는다.')]},
    {id:'catHide',species:'cat',title:'손님이 오자 조용한 곳으로 쏙',icon:'⌂',guide:'eventBehavior',image:scene('b',1,48,70,6,22),minDay:2,weight:(s,p)=>p.stressSensitivity*2+(s.adaptation<45?2:0),
      description:'방문객의 발소리를 듣고 소파 옆 숨을 곳으로 물러났어요.',causes:['낯선 자극을 피하고 안전한 거리를 확보하려는 반응일 수 있어요.','평소와 달리 계속 숨으며 먹기·마시기·배변도 달라지면 몸의 불편함을 확인해야 해요.'],response:'끌어내지 말고 손님과 거리를 둬요. 쉼터 가까이 필요한 자원을 이용할 길을 열어 둬요.',prevention:'손님에게 먼저 다가가지 않도록 부탁하고 만남을 짧고 조용하게 시작해요.',consequence:['몸을 낮추고 숨는 모습을 확인했어요. 부상이나 파손은 없어요.'],effects:{stress:5},sources:['hide'],choices:[choice('space','손님과 거리를 두고 기다리기','방문객이 거리를 두자 숨은 자리에서 주변을 살폈다. 억지로 꺼내지 않았다.',{effects:{stress:-9,bond:2}}),choice('offer','보유 숨숨집으로 조용한 공간 마련','숨숨집 주변의 이동 경로를 열어 두었다. 접근과 사용은 스스로 선택하도록 기다렸다.',{require:['hideout'],effects:{stress:-9,bond:2}})]},
    {id:'catLitter',species:'cat',title:'화장실 밖에서 소변을 봤어요',icon:'▤',guide:'health',image:scene('b',2,50,82,6),minDay:2,weight:(s,p,h)=>(s.stats.cleanliness<55?4:1)+(h.have('litterBox')?0:3)+(p.lifeStage==='senior'?1:0),
      description:'화장실 밖 바닥에서 소변을 본 흔적을 발견했어요.',causes:['청결·위치·모래 선호·입구 접근성 같은 환경 요인이 있을 수 있어요.','몸의 불편함도 원인일 수 있어요. 한 번의 청소 누락이 질환을 만들었다고 단정하지 않아요.'],response:'꾸짖지 말고 주변을 청소하고 배변 기록과 화장실 접근성을 확인해요. 새로 생긴 변화는 병원에 상담해요. 힘을 주는데 소변이 안 나오면 즉시 진료가 필요해요.',prevention:'조용하고 접근하기 쉬운 곳에 깨끗한 화장실을 두고 나이와 움직임에 맞는 입구를 준비해요.',consequence:['바닥 오염이 생겼어요. 질환이나 배뇨 불능은 이번 사건에서 확인되지 않았어요.'],effects:{cleanliness:-8},sources:['toilet','firstAid'],choices:[choice('check','주변 청소·접근성 확인·병원에 변화 전달','주변을 닦고 화장실 길을 확보했다. 배변 변화를 병원에 전달하고 반복 여부를 기록하기로 했다.',{flags:['litterAdjusted'],effects:{cleanliness:8}}),choice('kit','청소용품으로 닦고 변화 전달','청소용품으로 오염을 제거하고 배변 변화를 병원에 전달했다.',{consume:{cleaner:1},effects:{cleanliness:10}})]},
    {id:'dogChew',species:'dog',title:'신발 끝이 오물오물…',icon:'♧',guide:'eventBehavior',image:scene('b',3,43,82,3),weight:(s,p)=>s.environment.shoesSecured?.3:(p.lifeStage==='young'?5:2)+(s.stats.activity<45?2:0),
      description:'바닥에 놓인 신발을 씹어 끝부분이 상했어요. 떨어진 조각은 모두 주변에서 확인했어요.',causes:['입으로 탐색하거나 씹는 감각을 즐길 수 있고, 스트레스와도 관련될 수 있어요.','어린 개체의 탐색, 활동 기록과 주변 물건에 접근할 수 있었는지를 함께 봐요.'],response:'쫓거나 입을 억지로 벌리지 말고 안전하게 관심을 돌린 뒤 신발을 치워요.',prevention:'신발을 수납하고 크기와 강도에 맞는 씹을 대상을 감독하며 제공해요.',consequence:['가정용 신발에 손상 발생. 교체는 선택이며 삼킴·부상은 확인되지 않았어요.'],effects:{},sources:['chew'],choices:[choice('store','관심을 돌리고 신발을 수납하기','신발을 안전하게 회수하고 닿지 않는 곳에 넣었다.',{flags:['shoesSecured'],effects:{stress:-3}}),choice('replace','신발을 수납하고 손상된 신발 교체','접근 환경을 바꾸고 가정용 신발을 교체했다. 돌봄 물품 주문과 별도 지출이다.',{flags:['shoesSecured'],money:15000,expenseType:'replacement',effects:{stress:-3}})]},
    {id:'dogTrash',species:'dog',title:'쓰레기통에서 바스락 소리가!',icon:'▥',guide:'eventSafety',image:scene('c',0,43,82,3),weight:(s,p)=>s.environment.trashSecured?.2:2+(p.activityNeed>30?1:0),
      description:'쓰레기통을 뒤져 빈 종이 포장지가 바닥에 흩어졌어요. 이 장면에는 음식물·약품·날카로운 물건이 없어요.',causes:['낯선 냄새와 물건을 탐색했을 수 있어요.','식사가 부족해서만 생기는 행동은 아니며 접근 가능한 환경도 중요해요.'],response:'접근을 막고 흩어진 종이를 확인하며 치워요. 실제로 유해한 것을 먹었을 가능성이 있으면 즉시 병원에 연락해요.',prevention:'뚜껑과 잠금이 있는 수납 공간에 쓰레기통을 두고 위험한 내용물은 따로 보관해요.',consequence:['종이 조각 청소가 필요해요. 섭취·중독·부상은 확인되지 않았어요.'],effects:{cleanliness:-5},sources:['chew','dogEmergency'],choices:cleanup('trashSecured')},
    {id:'dogBell',species:'dog',title:'딩동! 문 쪽으로 멍멍',icon:'♪',guide:'eventBehavior',image:scene('c',1,56,82,6),weight:(s,p)=>p.stressSensitivity*2+(s.stats.stress>55?2:0),
      description:'초인종 소리를 듣고 귀를 세운 뒤 문을 향해 짖었어요.',causes:['경계·기대·불안 등 여러 이유가 있을 수 있어요.','짖음만으로 공격성이나 의도를 단정하지 않고 자세와 거리를 함께 살펴요.'],response:'함께 소리치지 말고 문에서 거리를 두어 자극을 낮춰요.',prevention:'작은 소리와 짧은 연습부터 시작하고 편안히 머무는 행동을 보상해요.',consequence:['짖는 반응과 긴장 증가를 확인했어요. 물품 피해는 없어요.'],effects:{stress:5},sources:['bark'],choices:[choice('distance','문에서 거리를 두고 소리 줄이기','문에서 멀어지자 주변을 살폈다. 다시 짖는지 관찰하기로 했다.',{effects:{stress:-8}}),choice('practice','조용한 상태에서 짧게 연습하기','충분히 거리를 둔 뒤 아주 작은 자극부터 짧게 연습했다.',{cost:1,effects:{stress:-10,bond:2}})]},
    {id:'dogPull',species:'dog',title:'산책길에서 갑자기 팽팽해진 줄',icon:'↗',guide:'species',image:scene('c',2,60,82,3),weight:(s,p,h)=>h.recentWalk?2+(p.activityNeed>30?2:0):0,
      description:'산책 중 냄새 나는 쪽으로 갑자기 움직이며 줄이 팽팽해졌어요.',causes:['냄새 탐색이나 다른 자극에 대한 관심, 긴장이 영향을 줄 수 있어요.','일부러 보호자를 지배하려 한다는 의미로 해석하지 않아요.'],response:'안전한 거리에서 멈추고 줄이 느슨해질 때 천천히 움직여요. 목이나 몸을 세게 당기지 않아요.',prevention:'맞는 하네스를 점검하고 조용한 곳에서 느슨한 줄로 걷는 연습을 짧게 해요.',consequence:['갑자기 줄이 당겨졌지만 넘어짐·부상·하네스 파손은 없어요.'],effects:{stress:3},sources:['walk'],choices:[choice('pause','안전하게 멈춰 거리 확보하기','줄이 느슨해지기를 기다려 조용한 방향으로 이동했다.',{effects:{stress:-5}}),choice('practice','조용한 길에서 짧게 연습하기','강도를 낮추고 느슨한 줄로 걷기를 짧게 연습했다.',{cost:1,effects:{stress:-7,bond:2}})]},
    {id:'dogDoor',species:'dog',title:'잠깐 비운 사이 문에 남은 자국',icon:'⌂',guide:'eventBehavior',image:scene('c',3,55,84,6),minDay:2,weight:(s,p)=>s.stats.stress>45||p.adaptation<.8?2:0,
      description:'잠시 자리를 비운 사이 문 아래에 새 긁힘 자국이 생겼어요. 돌아왔을 때 문 앞에 서 있는 모습을 봤어요.',causes:['혼자 남은 상황의 불편함이나 바깥 자극에 대한 반응일 수 있어요.','자국만으로 혼자 있는 동안의 모든 행동이나 분리불안을 진단할 수는 없어요.'],response:'꾸짖지 말고 발과 주변 안전을 확인해요. 버틸 수 있는 짧은 거리·시간부터 다시 연습해요.',prevention:'혼자 남는 시간을 서서히 늘리고 반복되면 수의사나 적절한 행동 전문가에게 기록을 보여 주세요.',consequence:['문 표면에 얕은 자국이 생겼어요. 행동의 전체 경과와 부상 여부는 아직 미확인이에요.'],effects:{stress:5},sources:['chew'],choices:[choice('support','발과 환경을 살피고 가까이 머물기','발에서 상처는 보이지 않았다. 긴장을 낮추고 혼자 있는 시간을 줄이기로 했다.',{effects:{stress:-9},flags:['aloneAdjusted']})]},
    {id:'missingToy',species:'all',title:'장난감 조각이 보이지 않아요',icon:'!',guide:'eventEmergency',urgent:true,serious:true,minDay:3,image:scene('d',0,45,82,7),weight:(s,p,h)=>h.have('plush')&&h.toyUses>=2?1:0,loss:{plush:1},
      description:'사용하던 포옹 인형의 천 일부가 떨어져 있고 조각을 찾지 못했어요. 삼켰는지는 아직 알 수 없어요.',causes:['놀이 중 손상된 조각을 삼켰을 가능성을 배제할 수 없어 전문가의 판단이 필요해요.','겉으로 멀쩡해 보여도 안전하다고 판단하지 않아요. 특정 질환은 확정되지 않았어요.'],response:'놀이를 멈추고 남은 장난감을 치운 뒤 즉시 동물병원에 연락해 안내를 받아요. 임의로 토하게 하거나 먹이·약을 주어 해결하지 않아요.',prevention:'놀이 전후 손상과 조각 수를 점검하고 크기·강도가 맞는 장난감을 감독하며 사용해요.',consequence:['손상된 포옹 인형 1개 사용 중지·재고에서 제외. 삼킴·부상은 아직 미확인이에요.','다음 날까지 기다리는 대신 지금 병원에 연락해야 해요. 진료비는 선택 전에 표시돼요.'],effects:{stress:3},sources:['dogEmergency','catEmergency'],choices:[choice('contact','지금 병원에 전화해 이동 안내 받기','즉시 병원에 연락해 재질·크기·마지막 사용 시점을 전달하고 진료 이동 안내를 받았다. 삼킴 여부는 미확인이고 치료 완료로 기록하지 않는다.',{hospital:true,followup:'병원 안내에 따른 진료·경과 확인이 남아 있어요.'}),choice('visit','병원에 연락하고 이동장으로 방문','병원에 연락한 뒤 안전하게 이동해 진료를 받았다. 진단이나 치료 방법은 이 게임에서 결정하지 않는다.',{require:['carrier'],money:35000,hospital:true,expenseType:'vet',followup:'진료 후 안내받은 경과 관찰을 계속해요.'})]},
    {id:'health',species:'all',title:'기록과 다른 오늘의 움직임',icon:'♡',guide:'health',image:scene('d',1,48,82,7),minDay:3,weight:(s,p,h)=>h.persistentChange?2:0,
      description:'일지와 비교하며 보니 움직임이 줄고 먹는 중간에 쉬는 모습이 보였어요. 이번에 직접 본 변화로 기록해요.',causes:['피로·환경 스트레스·몸의 불편함 등 여러 가능성을 확인해야 해요.','나이 또는 한 번 놓친 돌봄만으로 질병이 발생했다고 처리하지 않아요.'],response:'식사·음수·배변과 활동의 변화를 정리해 병원에 상담해요. 호흡 곤란·의식 저하·소변이 나오지 않는 상황은 즉시 진료를 구해요.',prevention:'평소의 먹기·마시기·배변·움직임을 기록하고 지속되는 변화는 진료로 확인해요.',consequence:['활동·식사 행동의 변화를 이번에 관찰했어요. 병명과 부상은 확정되지 않았어요.'],effects:{},sources:['firstAid','toilet'],choices:[choice('consult','변화 기록을 가지고 병원 상담','기록을 전달하고 경과 관찰과 방문 시점을 안내받았다. 상담만으로 진단을 확정하지 않는다.',{money:8000,hospital:true,expenseType:'vet',followup:'지속·악화 여부를 관찰하고 병원 안내를 따라요.'}),choice('visit','이동장으로 병원 방문','안전하게 이동해 진료를 받았다. 필요한 지출은 예산 점수에서 감점하지 않는다.',{require:['carrier'],money:35000,hospital:true,expenseType:'vet'}),choice('record','지금 병원에 변화와 비용 사정 전달','지금 병원에 연락해 변화를 전달하고 가능한 진료 경로와 비용을 상담했다. 실제 진료는 아직 남아 있다.',{hospital:true,followup:'안내받은 진료를 마련하고 경과를 살펴요.'})]},
    {id:'vetExpense',species:'all',title:'병원에서 추가 관찰을 권했어요',icon:'♡',guide:'budget',image:scene('d',2,48,59,7,22),serious:true,minDay:4,weight:(s,p,h)=>h.priorConsult&&h.persistentChange?1:0,
      description:'앞선 상담 뒤 변화가 이어져 병원에 다시 확인했고, 추가 검사와 병원 내 관찰에 대한 설명을 받았어요.',causes:['확인된 변화가 이어져 전문가가 추가 평가를 권한 상황이에요.','노령이라는 이유로 수술이나 입원이 자동 확정된 사건은 아니에요.'],response:'검사·관찰의 필요성과 예상 비용, 가능한 지원 방법을 병원에 확인해요.',prevention:'평소 기록과 이동 수단, 예비 비용을 준비해요. 모든 건강 문제를 예방할 수 있는 것은 아니에요.',consequence:['추가 평가 권고를 받았어요. 검사·입원·수술은 아직 시행되지 않았고 비용도 아직 발생하지 않았어요.'],effects:{},sources:['firstAid'],choices:[choice('plan','지금 병원과 진료·비용 계획 세우기','병원과 필요한 진료 경로·비용 지원을 지금 상의했다. 추가 검사나 입원이 완료된 것으로 기록하지 않는다.',{hospital:true,followup:'병원과 정한 추가 진료 계획을 확인해요.'}),choice('care','설명받은 추가 검사·병원 관찰 진행','게임 설정의 추가 검사와 병원 내 관찰을 진행했다. 병명이나 수술을 임의로 확정하지 않는다.',{money:60000,hospital:true,expenseType:'vet',followup:'퇴원·귀가 후 병원 안내에 맞춰 관찰해요.'})]}
  ];
  for(const e of EVENTS){e.cooldownDays??=CONFIG.cooldownDays;e.effects??={};e.consequence??=[];}
  // Visual performance only: never changes the simulation or asserts a diagnosis.
  // Cat event frames: reach, startled, scratch, content, hide, sniff, low energy, wary.
  // Frames progress attention → reaction → settling. Dog frames retain their own atlas.
  const REACTIONS={
    newHome:{cat:[4,7,5],dog:[6,6,0],motion:'peek',x:52,y:83,width:34,cue:'…',text:'귀를 옆으로 기울이고 몸을 낮춰 주변을 살핀다.'},
    catCup:{cat:[0,1,5],motion:'recoil',x:52,y:43,width:24,cue:'!',text:'앞발을 뻗었다가 눈을 크게 뜨고 몸을 뒤로 뺀다.'},
    catGlass:{cat:[0,1,7],motion:'recoil',x:46,y:43,width:24,cue:'!',text:'깨진 컵 쪽을 보며 귀를 옆으로 돌리고 몸을 뒤로 물린다.'},
    catScratch:{cat:[0,2,3],motion:'scratch',x:40,y:82,width:31,flip:-1,cue:'',text:'앞발을 번갈아 뻗고 몸을 길게 늘여 긁는다.'},
    catPlant:{cat:[0,1,5],motion:'recoil',x:46,y:84,width:32,cue:'!',text:'흔들리는 잎을 따라 앞발을 뻗었다가 떨어진 흙을 내려다본다.'},
    catBox:{cat:[5,3,3],motion:'nestle',x:65,y:79,width:32,cue:'',text:'상자 안에 몸을 낮춰 앉고 눈을 편안하게 가늘게 뜬다.'},
    catHide:{cat:[1,4,4],motion:'hide',x:43,y:77,width:27,cue:'…',text:'낯선 발소리에 몸을 낮추고 귀를 옆으로 향한 채 조심스럽게 내다본다.'},
    catLitter:{cat:[5,7,5],motion:'sniff',x:54,y:85,width:32,cue:'?',text:'바닥과 화장실을 번갈아 살피며 코를 가까이 대고 앞발을 멈춘다.'},
    dogChew:{dog:[3,0,0],motion:'nibble',x:48,y:83,width:33,cue:'',text:'신발 쪽으로 고개를 낮췄다가 고개를 들어 주변을 본다.'},
    dogTrash:{dog:[3,0,0],motion:'sniff',x:50,y:83,width:33,cue:'?',text:'흩어진 종이에 코를 가까이 대고 귀를 기울인다.'},
    dogBell:{dog:[0,6,6],motion:'listen',x:55,y:83,width:34,cue:'!',text:'귀를 세우고 문 쪽으로 몸을 돌린 뒤 잠깐 멈춘다.'},
    dogPull:{dog:[3,3,0],motion:'lean',x:61,y:84,width:34,cue:'',text:'냄새 나는 쪽으로 몸을 기울였다가 걸음을 멈춘다.'},
    dogDoor:{dog:[6,6,0],motion:'peek',x:53,y:84,width:33,cue:'…',text:'문 앞에서 귀를 기울이고 보호자 쪽을 돌아본다.'},
    missingToy:{cat:[5,7,5],dog:[0,6,0],motion:'inspect',x:43,y:84,width:34,cue:'?',text:'남은 인형 쪽으로 시선을 옮긴다. 표정만으로 삼킴이나 부상을 확인할 수는 없다.'},
    health:{cat:[6,6,6],dog:[7,7,7],motion:'breathe',x:49,y:85,width:36,cue:'',text:'몸을 웅크리고 눈꺼풀이 내려와 있으며 움직임이 적다.'},
    vetExpense:{cat:[7,4,7],dog:[6,6,0],motion:'wary',x:49,y:60,width:28,cue:'…',text:'낯선 진찰대에서 앞발을 모으고 귀를 기울이며 주변을 살핀다.'}
  };
  const api={CONFIG,EVENTS,SOURCES,REACTIONS};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.PetEventData=api;
})(typeof globalThis!=='undefined'?globalThis:this);
