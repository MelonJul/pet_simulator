/* 밸런스 설정과 콘텐츠. 금액·효과는 교육용 게임 수치이며 실제 진료/급여 기준이 아닙니다. */
(function (root) {
  'use strict';
  const PRICES=typeof module!=='undefined'&&module.exports?require('./price-data.js'):root.PetPrices;
  const CONFIG = {
    version: 3, saveKey: 'first-together-save-v1', days: 7,
    shoppingSeconds: 60, startingBudget: 200000, actionsPerPeriod: 2,
    reorderMultiplier: 1.10, seed: null,
    weights: { basic: 35, emotion: 25, events: 20, preparation: 10, budget: 10 },
    hygieneTarget: 3, dailyDecay: { nutrition:-14, hydration:-16, cleanliness:-25 },
    warningThreshold:30, criticalThreshold:15,
    timeDecay:{meal:{nutrition:-8,hydration:-6},period:{nutrition:-10,hydration:-9},action:{nutrition:-2,hydration:-3}},
    startStats: { nutrition: 80, hydration: 80, cleanliness: 85, stress: 35, activity: 55, health: 90, bond: 25, fatigue:12 }
  };
  const PETS = typeof module!=='undefined'&&module.exports?require('./profiles.js'):root.PetProfiles;
  const ITEMS = [
    {id:'food',name:'균형 잡힌 사료',qty:12,unit:'끼',species:'all',kind:'consumable',category:'식사',icon:'◒',description:'정량 급여 12회분. 일주일에 21회분이 필요해요.',essential:true},
    {id:'bowl',name:'밥그릇',qty:1,unit:'개',species:'all',kind:'durable',category:'식사',icon:'◡',description:'한 번 준비하면 매 끼니 다시 사용할 수 있어요.',essential:true},
    {id:'waterBowl',name:'물그릇',qty:1,unit:'개',species:'all',kind:'durable',category:'식사',icon:'◡',description:'물은 무료. 깨끗한 물로 매일 갈아 주세요.',essential:true},
    {id:'carrier',name:'안전한 이동장',qty:1,unit:'개',species:'all',kind:'durable',category:'생활',icon:'▣',description:'집으로 오는 길과 병원 이동에 필요해요.',essential:true},
    {id:'bed',name:'포근한 쉼터',qty:1,unit:'개',species:'all',kind:'durable',category:'생활',icon:'▱',description:'안전하게 숨고 쉴 수 있는 개인 공간이에요.',essential:true},
    {id:'toy',name:'탐색 장난감',qty:1,unit:'개',species:'all',kind:'durable',category:'놀이',icon:'◉',description:'개의 탐색 놀이와 고양이의 공놀이에 사용해요.',essential:false},
    {id:'treat',name:'바삭한 미니 비스킷',qty:5,unit:'회',species:'all',kind:'consumable',category:'간식',icon:'✦',description:'작게 나눠 주는 기본 간식. 주식을 대신하지 않아요.',essential:false},
    {id:'hygiene',name:'위생 관리 키트',qty:1,unit:'세트',species:'all',kind:'durable',category:'위생',icon:'▤',description:'빗·칫솔 등 기본 관리 도구. 일주일 3회 관리 목표.',essential:true},
    {id:'cleaner',name:'배변 청소용품',qty:10,unit:'회',species:'all',kind:'consumable',category:'위생',icon:'▥',description:'배변 처리·화장실 청소를 할 때 1회분을 사용해요.',essential:true},
    {id:'harness',name:'하네스와 리드줄',qty:1,unit:'세트',species:'dog',kind:'durable',category:'생활',icon:'∞',description:'안전한 산책에 필요해요. 사용해도 사라지지 않아요.',essential:true},
    {id:'bags',name:'배변봉투',qty:10,unit:'장',species:'dog',kind:'consumable',category:'위생',icon:'▧',description:'산책할 때 1장씩 사용해요.',essential:true},
    {id:'pads',name:'배변패드',qty:10,unit:'장',species:'dog',kind:'consumable',category:'위생',icon:'▦',description:'이 게임의 실내 배변 처리에 1장씩 사용해요.',essential:true},
    {id:'litterBox',name:'고양이 화장실',qty:1,unit:'개',species:'cat',kind:'durable',category:'위생',icon:'▰',description:'편하게 배변할 수 있는 화장실이에요.',essential:true},
    {id:'litter',name:'화장실 모래',qty:10,unit:'회',species:'cat',kind:'consumable',category:'위생',icon:'⠿',description:'화장실을 청소하고 보충할 때 1회분을 사용해요.',essential:true},
    {id:'scratch',name:'스크래처',qty:1,unit:'개',species:'cat',kind:'durable',category:'놀이',icon:'▨',description:'발톱 긁기는 자연스러운 행동. 매일 스트레스를 줄여요.',essential:true},
    {id:'wand',name:'낚싯대 장난감',qty:1,unit:'개',species:'cat',kind:'durable',category:'놀이',icon:'⌁',description:'거리를 두고 사냥놀이를 할 수 있어요.',essential:true}
  ];
  ITEMS.push(
    {id:'freezeChicken',name:'동결건조 닭고기',qty:6,unit:'회',species:'all',kind:'consumable',category:'간식',description:'고소한 닭고기 간식. 두부와 모카가 특히 좋아해요.',use:'treat',effects:{bond:5,stress:-4},sprite:13,tint:'warm'},
    {id:'freezeFish',name:'동결건조 흰살생선',qty:6,unit:'회',species:'cat',kind:'consumable',category:'간식',description:'바삭한 생선 간식. 치즈의 취향에 잘 맞아요.',use:'treat',effects:{bond:5,stress:-4},sprite:13,tint:'blue'},
    {id:'creamTreat',name:'촉촉한 스틱 간식',qty:5,unit:'회',species:'cat',kind:'consumable',category:'간식',description:'조금씩 짜 주는 간식. 식사와 물 마시기를 대신하지 않아요.',use:'treat',effects:{bond:4,stress:-4},sprite:13,tint:'pink'},
    {id:'trainingBites',name:'한입 훈련 간식',qty:8,unit:'회',species:'dog',kind:'consumable',category:'간식',description:'짧은 교감에 쓰는 작은 간식. 보리가 좋아해요.',use:'treat',effects:{bond:5,stress:-3},sprite:13,tint:'green'},
    {id:'dentalChew',name:'씹는 간식',qty:4,unit:'회',species:'dog',kind:'consumable',category:'간식',description:'씹는 시간을 즐겨요. 양치나 정규 식사를 대신하지 않아요.',use:'treat',effects:{bond:3,stress:-6},sprite:13,tint:'warm'},
    {id:'ball',name:'통통 놀이공',qty:1,unit:'개',species:'all',kind:'durable',category:'놀이',description:'굴러가는 공을 따라 짧게 움직여요. 두부의 취향!',use:'play',playPower:1,sprite:8},
    {id:'mouse',name:'꼬마 쥐 장난감',qty:1,unit:'개',species:'cat',kind:'durable',category:'놀이',description:'발로 톡톡 건드리는 조용한 사냥놀이.',use:'play',playPower:1,sprite:10},
    {id:'tunnel',name:'바스락 숨숨 터널',qty:1,unit:'개',species:'cat',kind:'durable',category:'놀이',description:'탐색하며 숨을 수 있어요. 새 공간에 대한 반응을 살펴요.',use:'play',playPower:0.9,sprite:7},
    {id:'snuffle',name:'킁킁 노즈워크 매트',qty:1,unit:'개',species:'dog',kind:'durable',category:'놀이',description:'코를 사용해 냄새를 탐색해요. 개체마다 탐색 방식이 달라요.',use:'play',playPower:1.1,sprite:2,tint:'green'},
    {id:'tug',name:'매듭 터그 로프',qty:1,unit:'개',species:'dog',kind:'durable',category:'놀이',description:'무리하게 잡아당기지 않고 짧게 교감해요.',use:'play',playPower:0.9,sprite:11},
    {id:'puzzle',name:'탐색 퍼즐 장난감',qty:1,unit:'개',species:'all',kind:'durable',category:'놀이',description:'호기심을 자극하는 탐색 놀이. 어려우면 쉬운 단계부터.',use:'play',playPower:0.9,sprite:8,tint:'green'},
    {id:'catTower',name:'구름 캣타워',qty:1,unit:'개',species:'cat',kind:'durable',category:'가구',description:'높은 자리에서 관찰하고 오르내려요. 하루 시작 스트레스 −3.',use:'play',playPower:0.85,sprite:4},
    {id:'catnip',name:'향긋한 캣닢',qty:4,unit:'회',species:'cat',kind:'consumable',category:'놀이',description:'냄새를 맡고 반응을 관찰해요. 모카는 반응이 약해요.',use:'catnip',sprite:14},
    {id:'hideout',name:'아늑한 숨숨 하우스',qty:1,unit:'개',species:'all',kind:'durable',category:'가구',description:'조용히 숨을 공간. 쉼터가 없을 때도 편안히 쉬어요.',use:'rest',sprite:3,tint:'warm'}
  );
  const BASE_SPRITES={food:12,bowl:0,waterBowl:1,carrier:3,bed:2,toy:8,treat:13,hygiene:15,cleaner:15,harness:11,bags:12,pads:6,litterBox:6,litter:12,scratch:5,wand:9};
  const EXTRA_SPRITES={food:0,bags:1,pads:2,cleaner:3,harness:4,litter:5,snuffle:6,puzzle:7,hideout:8,freezeChicken:9,freezeFish:10,creamTreat:11,trainingBites:12,dentalChew:13,treat:14,toy:15};
  // 정규화된 방 좌표: x/y는 물품의 바닥 중심, w는 방 너비에 대한 비율.
  const ROOM_PLACEMENTS={
    bowl:[25,85,12],waterBowl:[11,82,11],bed:[24,62,23],carrier:[10,62,17],hygiene:[62,48,7],cleaner:[67,48,7],harness:[8,46,9],bags:[16,46,5],pads:[11,94,12],
    litterBox:[90,91,20],scratch:[60,61,12],toy:[39,87,8],wand:[35,74,15],ball:[47,93,7],mouse:[54,84,8],tunnel:[69,84,22],snuffle:[30,72,19],tug:[38,94,12],puzzle:[56,94,11],catTower:[85,65,26],hideout:[49,60,19],
    food:[71,47,8],litter:[96,53,7],treat:[77,47,6],freezeChicken:[82,47,6],freezeFish:[87,47,6],creamTreat:[92,47,6],trainingBites:[87,47,6],dentalChew:[92,47,6],catnip:[97,47,5]
  };
  for(const i of ITEMS){
    i.sprite=i.sprite??BASE_SPRITES[i.id]??12;i.icon=i.icon||'✦';
    if(EXTRA_SPRITES[i.id]!==undefined){i.sprite=EXTRA_SPRITES[i.id];i.atlas='items-extra-v2';i.tint='none';}
    i.room=ROOM_PLACEMENTS[i.id]||[50,80,10];
    if(i.id==='toy'||i.id==='wand'){i.use='play';i.playPower=i.id==='wand'?1:0.75;}
    if(i.id==='treat'){i.use='treat';i.effects={bond:4,stress:-4};}
    if(i.id==='bed')i.use='rest';
    if(['bed','carrier'].includes(i.id))i.category='가구';
  }
  ITEMS.push(
    {id:'squeaker',name:'삑삑이 장난감',qty:1,unit:'개',species:'all',kind:'durable',category:'놀이',description:'작은 소리를 내요. 소리에 대한 반응을 먼저 살피고 짧게 시도해요.',use:'play',toyKind:'squeak',sprite:15,atlas:'items-extra-v2',room:[58,90,9]},
    {id:'plush',name:'포옹 인형',qty:1,unit:'개',species:'all',kind:'durable',category:'놀이',description:'안거나 가볍게 건드리는 부드러운 인형이에요.',use:'play',toyKind:'plush',sprite:10,room:[34,63,11]}
  );
  for(const i of ITEMS){i.market=PRICES.ITEMS[i.id];i.price=i.market.gamePrice;}
  const kinds={toy:'sniff',ball:'ball',mouse:'mouse',tunnel:'tunnel',snuffle:'sniff',tug:'tug',puzzle:'puzzle',catTower:'climb',wand:'wand'};
  // 설치 가구만 방에 표시하고, 소모품·휴대 도구·장난감은 가방에 보관합니다.
  const ROOM_ITEMS=new Set(['bowl','waterBowl','bed','litterBox','scratch','catTower','hideout']);
  for(const i of ITEMS)i.placement=ROOM_ITEMS.has(i.id)?'room':'inventory';
  for(const i of ITEMS){if(kinds[i.id])i.toyKind=kinds[i.id];if(i.use==='treat')i.description=i.description.replace(/두부와 모카가 특히 좋아해요\.|치즈의 취향에 잘 맞아요\.|보리가 좋아해요\./g,'맛에 대한 반응을 관찰해요.');if(i.id==='ball')i.description='굴러가는 공을 따라 짧게 움직여요. 반응을 살펴보세요.';if(i.id==='catnip')i.description='냄새에 대한 반응이 개체마다 달라요. 관찰하며 짧게 사용해요.';}
  const ACTIONS = [
    {id:'water',name:'물 갈아주기',icon:'◈',cost:1,description:'새 물 교체 후 자동 음수 · 행동 1회',guide:'routine',effects:{bond:1}},
    {id:'clean',name:'배변 공간 청소',icon:'▤',cost:1,description:'청결 +38 · 배변 소모품 사용',guide:'routine',effects:{cleanliness:38,stress:-5}},
    {id:'play',name:'놀아주기',icon:'◉',cost:1,description:'취향·피로·반복에 따른 반응 · 강도 선택',guide:'personality',effects:{stress:-10,bond:5}},
    {id:'walk',name:'산책하기',icon:'♧',cost:1,description:'개체의 활동 필요에 맞춘 짧은 산책 · 봉투 1장',guide:'species',effects:{stress:-12,bond:5}},
    {id:'hygiene',name:'위생 관리',icon:'✧',cost:1,description:'청결 +18 · 건강 +4',guide:'routine',effects:{cleanliness:18,health:4,bond:2}},
    {id:'observe',name:'관찰하기',icon:'◎',cost:0,description:'행동·자세·식사와 음수 확인 · 일지 기록',guide:'journal',effects:{}},
    {id:'drink',name:'음수 확인',icon:'◈',cost:0,description:'준비된 물을 실제로 마시는지 확인',guide:'survival',effects:{}},
    {id:'rest',name:'편안하게 쉬기',icon:'☾',cost:1,description:'긴장·피로 완화 · 개체별 휴식 효과',guide:'personality',effects:{health:2,bond:3}},
    {id:'treat',name:'간식 주기',icon:'✦',cost:1,description:'종류를 골라 조금씩 · 주식 대체 불가',guide:'routine',effects:{bond:4,stress:-4}},
    {id:'catnip',name:'캣닢 반응 살피기',icon:'♧',cost:1,description:'개체별 반응 관찰 · 캣닢 1회',guide:'personality',effects:{stress:-10,activity:7,bond:2}}
  ];
  const LEGACY_EVENTS = [
    {id:'newHome',title:'아직은 낯선 우리 집',icon:'⌂',description:'주변을 살피며 몸을 낮추고 있어요. 새로운 냄새와 소리가 낯설 수 있어요.',guide:'personality',choices:[
      {id:'space',label:'조용한 쉼터에서 기다리기',require:['bed'],money:0,quality:1,effects:{stress:-12,bond:4},result:'먼저 다가올 수 있도록 기다렸어요. 안전한 공간이 적응에 도움이 됐어요.'},
      {id:'quiet',label:'주변 소리를 줄이고 거리 두기',money:0,quality:0.9,effects:{stress:-10,bond:3},result:'접촉을 강요하지 않고 자극을 줄였어요. 천천히 주변을 탐색하기 시작해요.'},
      {id:'hug',label:'바로 안아서 달래기',money:0,quality:0.2,effects:{stress:10,bond:-3},result:'낯선 접촉이 부담스러웠어요. 상대가 먼저 다가올 시간을 주는 편이 좋아요.'}
    ]},
    {id:'bored',title:'오늘은 조금 심심한가 봐요',icon:'◉',description:'주변을 맴돌며 관심을 요구해요. 오늘 활동이 충분했는지 확인해 볼까요?',guide:'species',choices:[
      {id:'enrich',label:'짧은 탐색 놀이로 관심 돌리기',money:0,quality:1,effects:{activity:12,stress:-6},result:'주변 냄새와 움직임을 천천히 탐색했어요. 정규 활동을 보충하는 짧은 교감이에요.'},
      {id:'snack',label:'간식으로 달래기',consume:{treat:1},money:0,quality:0.4,effects:{bond:2},result:'잠깐 관심은 바뀌었지만 활동 욕구는 남았어요. 간식이 놀이를 대신하지는 않아요.'},
      {id:'ignore',label:'그대로 하루 이어가기',money:0,quality:0.2,effects:{stress:6},result:'활동 욕구가 남아 있어요. 다음 돌봄 시간에 함께 움직여 주세요.'}
    ]},
    {id:'toyChoice',title:'이 장난감은 취향이 아닌가 봐요',icon:'?',description:'장난감을 잠깐 보고 고개를 돌려요. 같은 종이어도 좋아하는 놀이가 달라요.',guide:'personality',choices:[
      {id:'change',label:'거리와 속도를 바꿔 짧게 시도하기',money:0,quality:1,effects:{activity:8,stress:-5,bond:3},result:'움직임을 느리게 하고 거리를 두자 관심을 보였어요. 개체의 반응을 따라가는 게 중요해요.'},
      {id:'pause',label:'멈추고 나중에 다시 제안하기',money:0,quality:0.9,effects:{stress:-7},result:'싫다는 신호를 존중했어요. 충분히 쉬고 다른 놀이를 시도할 수 있어요.'},
      {id:'force',label:'계속 눈앞에 들이밀기',money:0,quality:0.1,effects:{stress:12,bond:-3},result:'피하는 신호가 더 커졌어요. 놀이를 강요하면 스트레스가 될 수 있어요.'}
    ]},
    {id:'mess',title:'배변 공간 주변이 더러워졌어요',icon:'▤',description:'주변을 맴돌며 자리를 찾고 있어요. 배변 공간이 편안하고 깨끗한지 살펴봐요.',guide:'routine',choices:[
      {id:'wipe',label:'오염된 주변을 바로 닦기',consume:{cleaner:1},money:0,quality:1,effects:{cleanliness:14,stress:-5},result:'주변 오염을 치웠어요. 정규 배변 공간 청소와 소모품 보충도 따로 챙겨 주세요.'},
      {id:'adapt',label:'주변을 정리하고 조용한 위치 확보하기',money:0,quality:0.7,effects:{stress:-4},result:'환경은 조금 편해졌어요. 청결을 회복하려면 청소용품으로 마무리해야 해요.'},
      {id:'scold',label:'실수를 꾸짖기',money:0,quality:0,effects:{stress:13,bond:-5},result:'불안이 커졌어요. 꾸짖기보다 환경과 몸 상태를 확인해 주세요.'}
    ]},
    {id:'spill',title:'사료를 조금 쏟았어요',icon:'◒',description:'보관 중 일부 사료가 바닥에 흩어졌어요. 재고를 확인하고 보관 방식을 바꿔 봐요.',guide:'budget',choices:[
      {id:'discard',label:'오염된 1회분 버리고 밀봉하기',consume:{food:1},money:0,quality:1,effects:{},result:'사료 1회분을 버렸지만 오염된 먹이는 피했어요. 추가 주문이 필요한지 재고를 확인해요.'},
      {id:'check',label:'오염 여부 확인 후 깨끗한 분량 분리하기',money:0,quality:0.9,effects:{},result:'오염된 부분은 사용하지 않고 보관 상태를 점검했어요. 다음 식사 전 재고를 살펴봐요.'}
    ]},
    {id:'health',title:'평소와 다른 모습을 발견했어요',icon:'♡',description:'오늘은 평소보다 움직임이 적고 먹는 속도가 달라요. 원인은 단정할 수 없어요. 변화를 기록해 전문가와 상의해 봐요.',guide:'health',choices:[
      {id:'consult',label:'변화를 기록하고 동물병원 상담',money:8000,quality:1,effects:{health:5,stress:-3},result:'기록을 바탕으로 상담했어요. 지속되거나 악화되면 방문하기로 했어요. 상담만으로 진단이 확정되는 것은 아니에요.'},
      {id:'visit',label:'이동장으로 병원 방문',require:['carrier'],money:35000,quality:1,effects:{health:8},result:'안전하게 이동해 진료를 받았어요. 필요한 지출은 예산 점수에서 불이익이 없어요.'},
      {id:'record',label:'상태 기록 후 무료 상담 경로 확인',money:0,quality:0.6,effects:{health:-2},result:'변화를 기록하고 상담 가능한 경로를 확인했어요. 증상이 이어지거나 악화되면 진료가 필요해요.'}
    ]}
  ];
  if(typeof module!=='undefined'&&module.exports)require('./scenarios.js');
  const EVENT_DATA=typeof module!=='undefined'&&module.exports?require('./event-data.js'):root.PetEventData;
  const EVENTS=[...EVENT_DATA.EVENTS,...LEGACY_EVENTS.filter(e=>!EVENT_DATA.EVENTS.some(n=>n.id===e.id)).map(e=>({...e,retired:true,species:'all',weight:()=>0,image:EVENT_DATA.EVENTS[0].image,causes:['이전 버전에서 이어진 상황이에요. 현재 상태와 최근 돌봄을 함께 살펴요.'],response:'아래 대응의 필요 물품과 결과를 살펴보고 선택해요.',prevention:'규칙적인 돌봄과 안전한 환경을 준비하고 개체의 반응을 기록해요.',consequence:['이전 버전의 사건이에요. 기존 대응 선택 전 비용은 발생하지 않았어요.'],sources:[],effects:{}}))];
  const GUIDE = [
    {id:'start',title:'처음 함께하는 방법',subtitle:'하루 전 쇼핑 → 7일 돌봄 → 돌아보기',text:'게임의 물품 가격과 상태 수치는 학습을 위한 예시예요. 입양 전 실제 생활환경·주거 조건·돌봄 시간·평생 비용을 따로 확인해 주세요. 가이드북은 언제든 무료이며 쇼핑 중에는 시간이 멈춰요.'},
    {id:'species',title:'개와 고양이는 달라요',subtitle:'종의 특성 안에도 개체의 차이가 있어요',text:'개는 안전한 산책과 냄새 탐색이 중요한 활동이에요. 고양이는 실내 사냥놀이·스크래처·높고 안전한 공간·숨을 곳을 준비해요. 이 게임에서 고양이 산책은 제공하지 않으며 감점하지 않아요. 놀이와 접촉은 실제 반응을 보며 조절해요.'},
    {id:'personality',title:'성향과 행동 신호',subtitle:'먼저 관찰하고, 선택을 존중해요',text:'피하거나 몸을 낮추거나 귀를 뒤로 젖히면 자극을 줄이고 거리를 둬요. 혼자 쉬는 공간도 필요해요. 개 8마리와 고양이 9마리는 나이·적응 속도·자극 선호가 달라요. 세부 취향은 놀이 반응으로 발견해요. 소리·당기기·추격·퍼즐·인형에 대한 반응과 최근 반복, 피로를 함께 살펴요. 낮고 짧은 활동도 해당 개체에게 맞으면 충분히 평가받아요. 같은 행동을 하루에 반복하면 효과가 줄고, 간식·놀이만 반복하면 물·청소 등 기본 돌봄을 놓치게 돼요.'},
    {id:'items',title:'준비물은 어떻게 쓰나요?',subtitle:'소모품과 오래 쓰는 물건을 구분해요',text:'사료는 정량 급여 1회에 1끼, 청소용품은 배변 청소 1회에 1회분을 써요. 개는 청소에 패드 1장, 산책에 봉투 1장을 추가로 써요. 고양이는 청소에 모래 1회분이 필요해요. 밥그릇·물그릇·이동장·하네스·위생 키트·장난감은 재사용해요. 고양이의 스크래처와 모든 동물의 쉼터는 하루 시작 스트레스를 낮춰요.'},
    {id:'routine',title:'식사·물·청결·활동·휴식',subtitle:'매일 조금씩, 빠뜨리지 않도록',text:'게임에서는 아침·점심·저녁에 사료 1끼씩 급여해요. 이것은 진행 규칙이며 실제 급여 횟수나 양에 대한 권장안이 아니에요. 실제 급여는 나이·건강·체중·사료에 따라 수의사와 조절해요. 하루에 물 교체와 실제 음수 확인, 배변 청소 1회, 적절한 활동 1회를 목표로 하며 위생 관리는 7일 중 3회가 게임 목표예요. 오전·오후 각각 기본 2번 행동하고 급여·음수 확인·관찰·인벤토리 및 일지 열람·주문·가이드 열람은 행동 횟수를 쓰지 않아요. 이벤트 대응은 선택지에 표시된 행동 횟수를 사용해요. 물 교체는 행동 1회를 쓰며 수분 회복과 별개예요.'},
    {id:'health',title:'몸과 마음의 변화를 살펴요',subtitle:'관찰 기록을 가지고 전문가에게',text:'식욕·음수·배변·활동이 평소와 다르거나 변화가 지속되면 동물병원에 상담해요. 호흡이 힘들거나 의식이 없거나 소변을 보려고 하지만 나오지 않는 등의 상황은 즉시 진료를 구해야 해요. 게임은 병명을 진단하지 않고 약물 투여를 정답으로 제시하지 않아요. 표시된 건강 수치는 실제 건강을 판별하는 도구가 아니에요.'},
    {id:'budget',title:'처음 드는 돈, 계속 드는 돈',subtitle:'남은 돈보다 돌봄을 이어갈 준비',text:'이동장·그릇 같은 준비물은 초기 비용, 사료·모래·청소용품은 반복 지출이에요. 추가 주문은 항상 최초 기준가 × 1.10이며 누적 인상하지 않아요. 잔액은 0원 아래로 내려가지 않아요. 진료비는 특별 지출로 따로 기록해요. 물품은 2026-10-21에 조회한 국내 온라인 판매가를 참고했어요. 상점의 가격 조사·출처에서 포장 크기와 환산 기준을 볼 수 있어요. 게임 사용 횟수는 실제 급여량이 아니에요. 병원비는 게임용 예시예요. 기존 저장은 시작 당시 가격을 유지해요.'},
    {id:'score',title:'평가 기준을 공개해요',subtitle:'마지막 상태보다 일주일의 기록',text:'기본 돌봄은 정량 식사(50%)·매일 물 교체와 실제 음수(20%)·매일 청소(20%)·위생 목표(10%)를 반영해요. 성향 관리는 매일 알맞은 활동(50%)·시작 성향의 스트레스 수준 대비 기간 중 편안함(30%)·휴식 또는 관찰을 한 날(20%)로 계산해요. 사건은 대응의 적절성 평균, 준비물은 초기 필수 품목 충족률을 사용해요. 예산은 기본 돌봄 충족률과 불필요한 과다 급여를 반영하며, 필요한 지출이나 잔액 자체는 감점하지 않아요. 총 배점은 설정에 따라 100점으로 정규화해요. 나이와 기초 건강 자체는 감점하지 않으며 활동량은 개체별 필요량을 기준으로 해요.'}
  ];
  GUIDE.push({id:'journal',title:'관찰과 반려동물 일지',subtitle:'행동 → 반응 → 직접 확인한 변화',text:'방 안의 반려동물이나 이름표를 누르면 상태창이 열려요. 8개 게임 지표와 관찰 문장을 함께 볼 수 있어요. 관찰은 무료이고 행동 횟수를 쓰지 않아요. 식사·음수·자세·표정과 최근 돌봄을 문장으로 살피고 일지에 자동 기록해요. 같은 순간을 반복 관찰해도 보상이 생기지 않아요. 일지는 날짜와 시간대, 종류별로 볼 수 있어요. 직접 관찰하지 않은 날의 상태 변화는 미확인으로 남기고, 관찰한 날끼리 신호를 비교해요. 장난감의 세부 취향은 반응 기록이 쌓일수록 알아갈 수 있어요. 기록의 시간은 실제 시각이 아닌 게임의 시간대예요.'},{id:'survival',title:'식사·수분과 종료 규칙',subtitle:'물 준비와 실제 마시기는 서로 달라요',text:'식사와 수분은 내부적으로 각각 0~100이에요. 하나만 0이어도 즉시 게임이 종료되고 되돌릴 수 없어요. 이는 실제 동물의 생존 시간이나 의학적 기준이 아닌 게임 규칙이에요. 30 이하에서 경고, 15 이하에서 심한 자세 신호가 나타나요. 낮은 식사 상태에서는 경고의 사료 1끼 보충으로 대응할 수 있어요. 물 교체는 물그릇에 3회분을 준비하고 자동으로 음수까지 이어져요. 실제로 마셨을 때만 1회분이 줄고 수분이 회복돼요. 물 교체와 이어지는 음수는 행동 1회이며 별도 버튼을 누를 필요가 없어요. 배가 부르거나 심하게 불안해 마시지 않으면 그 사실을 기록해요. 수분이 72 미만이고 오늘의 물이 남아 있으며 스트레스가 85 미만일 때 자율 음수가 일어나요. 심하게 불안하면 마시지 않을 수 있으므로 휴식과 자극 감소 뒤 확인해요. 물은 다음 날 다시 갈아야 해요. 급여 시간에는 식사 −8·수분 −6, 다음 구간으로 이동하면 −10·−9, 돌봄 1회에는 −2·−3, 밤에는 −14·−16이 적용돼요. 실제 음수는 개체별 28~32 회복하며 시간·급여·돌봄의 상태 변화 직후 종료 여부를 확인해요.'});
  GUIDE.push({id:'eventSafety',title:'일상 사고와 안전',subtitle:'먼저 안전 확보, 그다음 정리',text:'사건은 전체 화면 장면부터 보여요. 닫기를 누르면 설명이 열리고 대응 뒤 게임으로 돌아와요. 열람 동안 시간·상태·날짜는 멈춰요. 실제 피해와 아직 확인하지 못한 위험을 구분해요. 깨진 유리는 접근을 막고 보호 장비를 사용해 치운 뒤 발·입가·움직임을 살펴요. 가정용 물건 교체는 선택이며 청소·환경 조정만으로도 적절한 대응이 될 수 있어요.'},{id:'eventBehavior',title:'행동의 이유 알아보기',subtitle:'한 가지 의도로 단정하지 않아요',text:'긁기·씹기·숨기·짖기는 개체와 환경에 따라 이유가 달라요. 종, 나이, 적응 속도, 최근 놀이와 휴식을 함께 살펴요. 물품을 샀다고 반드시 사용하거나 선호하지는 않아요. 위치와 자극을 바꾸고 반응을 기록해요. 식사·돌봄·시간 전환 뒤 하루 2~3회 사건을 목표로 판단해요. 동작이 끝난 뒤 사건을 보여 주고, 위험 신호가 있으면 돌봄을 우선해요. 가벼운 사건의 간격은 1일, 기존 사건은 기본 3일이며 같은 사건은 연속 발생하지 않아요. 응급 추첨은 하루 한 번만 하여 빈도를 따로 제한해요. 일반 배변 모션은 이 횟수에 포함하지 않아요. 심각한 사건은 관련 조건을 충족했을 때도 드물게 추첨해요. 발생 자체는 감점하지 않고 대응을 평가해요.'},{id:'eventEmergency',title:'삼킴 의심과 긴급 대응',subtitle:'확정 진단 없이 즉시 병원에 연락',text:'장난감 조각이 사라지면 놀이를 멈추고 남은 물건을 치워요. 삼켰다고 확정할 수 없어도 즉시 병원에 재질·크기·시점과 보이는 증상을 전달하고 안내받아요. 임의로 토하게 하거나 약·음식을 주지 않아요. 전화는 치료 완료가 아니고 필요한 진료와 경과 확인이 남아요. 게임의 무료 연락은 진행을 위한 단순화이며 실제 상담·진료의 제공 여부와 금액은 병원마다 달라요. 관련 링크는 가이드북에 제공돼요. 일지에서 사건을 다시 읽어도 비용·피해가 재적용되지 않아요.'});
  const STAT_LABELS={nutrition:'식사',hydration:'수분',cleanliness:'청결',stress:'스트레스',activity:'활동',health:'건강',bond:'친밀도'};
  GUIDE.push({id:'room',title:'방에서 함께 놀기',subtitle:'물건을 누르면 돌봄이 시작돼요',text:'밥그릇·물그릇·쉼터·화장실·스크래처·캣타워·숨숨 하우스는 방에 자동 설치돼요. 사료·간식·모래·위생용품·장난감·이동장·산책 도구는 인벤토리에 보관해요. 방의 설치 물품을 누르거나 인벤토리에서 물품을 골라 사용해요. 놀아주기와 간식 주기는 보유한 종류를 골라서 사용할 수 있어요. 종류를 바꿔도 하루 반복 횟수는 함께 누적돼요. 캣타워는 하루 시작 스트레스를 3 줄이고, 오르내리는 놀이에도 사용할 수 있어요. 캣닢 반응은 개체별로 다르고 정규 활동을 대신하지 않아요. 사건의 발생 가능성에는 물품 보유와 스크래처 배치도 반영돼요. 방의 빈 바닥을 누르면 친구가 그 자리로 걸어가요. 이 이동과 꾸미기에는 행동이나 돈이 들지 않아요. 사건에서의 적절한 환경 조정은 대응 평가에 반영돼요. 방 꾸미기에서는 설치 물품만 끌어 배치하고 저장할 수 있어요.'});
  const PHASES=['아침 급여','오전 돌봄','점심 급여','오후 돌봄','저녁 급여'];
  GUIDE.push({id:'modes',title:'두 가지 모드와 배변 동작',subtitle:'전체 일주일 또는 원하는 순간부터',text:'시작 화면에서 7일치 시뮬레이션과 돌발 상황 체험을 고를 수 있어요. 체험은 5개 챕터의 사건을 자유롭게 고르고 도입 이야기부터 시작해요. 물품·상태·예산은 준비되어 있으며 완료 뒤 다시 체험·다음 사건·목록으로 이동할 수 있어요. 두 모드는 저장·비용·점수와 배변 최초 안내 기록이 분리돼요. 일반 소변은 아침 식사 뒤, 대변은 점심 식사 뒤 한 번씩 연출하는 게임 규칙이며 실제 배변 횟수의 기준이 아니에요. 고양이는 화장실과 모래 덮기, 개는 개체별 자세로 표현해요. 남은 흔적은 배변 공간 청소로 지워요. 대변과 소변의 안내는 각 모드에서 처음 한 번만 나오고 이후에는 동작과 일지만 남아요. 새 시뮬레이션 또는 체험 목록의 기록 초기화로 최초 안내를 다시 볼 수 있어요. 별도의 건강 이상 사건은 이 제한을 받지 않아요.'});
  const data={PRICES,CONFIG,PETS,ITEMS,ACTIONS,EVENTS,GUIDE,STAT_LABELS,PHASES};
  if(typeof module!=='undefined'&&module.exports) module.exports=data;
  root.PetData=data;
})(typeof globalThis!=='undefined'?globalThis:this);
