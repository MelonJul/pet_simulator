/* Local scenario content: editable chapters, prerequisites and teaching cards. */
(function(root){
 'use strict';
 const ED=typeof module!=='undefined'&&module.exports?require('./event-data.js'):root.PetEventData;
 Object.assign(ED.SOURCES,{itch:['Merck · 가려움은 증상','https://www.merckvetmanual.com/dog-owners/skin-disorders-of-dogs/itching-pruritus-in-dogs'],urinary:['Cats Protection · 배뇨 문제','https://www.cats.org.uk/help-and-advice/health/urinary-problems'],gait:['PDSA · 걸음 변화','https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/symptoms/limping-and-stiffness-in-dogs'],dogToilet:['Dogs Trust · 배변 장소 연습','https://www.dogstrust.org.uk/dog-advice/training/unwanted-behaviours/toileting-in-the-house']});
 const c=(id,label,result,more={})=>({id,label,result,money:0,cost:0,quality:1,effects:{},...more});
 const add=(id,title,description,causes,choices,extra={})=>({id,title,description,causes,choices,species:'all',guide:'routine',image:{atlas:'assets/room-v2.png',room:true,prop:id,pose:0},effects:{},consequence:['장면에서 확인한 사실을 기록했다. 진단이나 부상은 추가로 단정하지 않는다.'],response:'관찰한 사실에 맞게 대응해요.',prevention:'환경과 기록을 함께 살펴요.',sources:['home'],weight:()=>0,...extra});
 const consult=(result)=>[c('contact','관찰 내용을 기록하고 병원에 연락하기',result,{hospital:true}),c('visit','안전하게 이동해 진료받기','관찰 기록을 전달하고 진료를 받았다. 경과 확인 안내를 일지에 남겼다.',{money:35000,hospital:true,expenseType:'hospital',effects:{stress:-2}})];
 const extras=[
 add('firstMeal','우리 집 첫 식사','종과 개체에 맞게 준비한 사료를 그릇에서 먹었어요.',['새 환경에서는 조용한 식사 장소와 익숙한 사료가 도움이 될 수 있어요.','먹은 양과 행동을 기록하고 실제 급여량은 개체에 맞게 확인해요.'],[c('note','먹은 모습 기록하기','식사 모습을 기록했다. 실제 권장 급여 횟수와 게임의 세 끼 규칙을 구분한다.')],{demoMotion:'feed',image:{atlas:'assets/room-v2.png',room:true,prop:'bowl',pose:4}}),
 add('firstWater','깨끗한 물을 마셨어요','물을 교체하자 그릇으로 다가가 혀로 물을 마셨어요.',['새 물 준비와 실제 음수는 다른 사실이에요.','이번에는 실제 마신 모습을 확인했어요.'],[c('note','음수 기록 확인하기','실제 음수와 물 교체를 각각 기록했다.')],{demoMotion:'water',image:{atlas:'assets/room-v2.png',room:true,prop:'waterBowl',pose:0}}),
 ...['stool','urine'].map(kind=>add(kind,kind==='stool'?'첫 대변, 편안한 장소에서':'첫 소변, 흔적을 살펴요',kind==='stool'?'배변 장소로 이동해 자세를 낮춘 뒤 대변 흔적이 남았어요.':'배뇨 장소에서 자세를 취한 뒤 소변 흔적이 남았어요.',['고양이는 모래를 파거나 덮기도 하지만 개체마다 행동이 달라요.','개의 배뇨 자세와 장소 습관도 서로 달라요. 실수는 혼내지 말고 환경과 기회를 살펴요.'],[c('understood','확인하고 돌봄으로 돌아가기','흔적과 장소를 확인했다. 청소 행동으로 정리하고 평소와 다른 변화는 기록한다.')],{routine:true,demoMotion:kind,sources:['toilet','dogToilet'],image:{atlas:'assets/room-v2.png',room:true,prop:kind,pose:0}})),
 add('dogToilet','패드 밖에 남은 흔적','지정된 패드 옆 바닥에 배변 흔적이 남았어요.',['배변 기회와 장소 적응, 청결을 살펴요. 갑자기 반복되면 건강 변화도 확인해요.'],[c('tidy','혼내지 않고 정리하고 위치 살피기','바닥을 청소하고 패드에 접근하기 편한지 살폈다.',{effects:{cleanliness:4}})],{species:'dog',sources:['dogToilet'],effects:{cleanliness:-4}}),
 add('boredom','함께 놀고 싶은 순간','장난감을 건드리며 보호자 쪽을 돌아봤어요.',['활동 욕구나 관심 요청일 수 있어요. 피로와 스트레스 신호도 함께 확인해요.'],[c('plan','반응을 살피고 짧은 놀이 계획하기','쉬는 속도를 확인하고 다음 돌봄에 짧은 놀이를 준비했다.',{effects:{bond:1}})],{cooldownDays:1,weight:s=>s.stats.activity<60?3:1,image:{atlas:'assets/room-v2.png',room:true,prop:'toy',pose:3}}),
 add('toyTaste','같은 장난감, 다른 취향','장난감을 보고 냄새를 맡은 뒤 자기 방식으로 반응했어요.',['선호는 성격·나이·피로와 최근 반복 사용에 따라 달라져요.','관심이 적어도 접촉이나 놀이를 강요하지 않아요.'],[c('note','이번 반응을 기록하기','장난감에 대한 실제 반응을 기록했다. 한 번의 반응으로 취향을 확정하지 않는다.')],{demoMotion:'play',image:{atlas:'assets/room-v2.png',room:true,prop:'toy',pose:3}}),
 add('windowSound','창밖에서 들린 작은 소리','잠시 귀를 기울이고 창밖을 바라봤어요.',['소리에 대한 호기심이나 경계일 수 있어요. 반응 강도는 개체마다 달라요.'],[c('quiet','조용히 주변을 살피도록 두기','자극을 더하지 않고 기다리자 시선을 돌렸다.',{effects:{stress:-1}})],{cooldownDays:1,weight:()=>1,image:{atlas:'assets/room-v2.png',room:true,prop:'window',pose:0}}),
 add('restSpot','오늘은 이 자리가 좋아요','평소 자리 옆에서 편안하게 몸을 말았어요.',['온도·소리·거리 선호에 따라 쉬는 자리가 달라질 수 있어요.'],[c('space','통로를 비우고 쉬게 두기','스스로 고른 자리에서 쉴 수 있도록 통로를 정리했다.',{effects:{stress:-1}})],{cooldownDays:1,weight:()=>1,image:{atlas:'assets/room-v2.png',room:true,prop:'bed',pose:5}}),
 add('itch','같은 곳을 자꾸 긁어요','평소보다 귀나 몸의 같은 부위를 반복해서 긁었어요.',['피부 자극·기생충·알레르기·감염 등 다양한 원인이 있어요. 가려움은 병명이 아니에요.'],consult('긁는 부위와 횟수, 상처 여부를 전달하고 진료 필요성을 상담했다.'),{sources:['itch'],medical:true,guide:'health',image:{atlas:'assets/room-v2.png',room:true,prop:'itch',pose:7}}),
 add('urinaryPattern','평소와 다른 화장실 기록','화장실을 여러 번 드나들었고 소변 흔적은 평소보다 적었어요.',['환경뿐 아니라 통증이나 배뇨 문제를 확인해야 해요. 고집이나 습관으로 단정하지 않아요.'],consult('소변 양과 횟수, 자세를 기록해 병원에 연락했다. 소변이 나오지 않으면 즉시 진료 안내를 구한다.'),{sources:['urinary'],medical:true,guide:'health',image:{atlas:'assets/room-v2.png',room:true,prop:'urine',pose:7}}),
 add('urinaryEmergency','소변 자세를 취하지만 나오지 않아요','소변 자세를 반복하는데 흔적이 없고 불편해해요.',['원인은 진료로 확인해야 해요. 소변을 보지 못하는 상태는 바로 병원에 연락할 신호예요.'],[c('emergency','지금 응급 진료 가능한 병원에 연락하기','증상과 시점을 전달하고 즉시 이동·진료 안내를 받았다. 연락만으로 치료가 끝난 것은 아니다.',{hospital:true})],{sources:['urinary'],medical:true,guide:'health',urgent:true,serious:true,image:{atlas:'assets/room-v2.png',room:true,prop:'urine',pose:7}}),
 add('gait','걷는 모습이 평소와 달라요','걸음을 망설이며 한쪽 다리에 체중을 덜 실었어요.',['발·다리의 상처나 통증 등 여러 원인을 확인해야 해요. 나이만으로 넘기지 않아요.'],consult('활동을 중단하고 걸음 변화와 시점을 기록해 병원에 연락했다. 딛지 못하거나 통증이 심하면 즉시 진료를 구한다.'),{sources:['gait'],medical:true,guide:'health',image:{atlas:'assets/room-v2.png',room:true,prop:'gait',pose:7}}),
 add('brokenGear','낡은 장난감, 사용을 멈춰요','장난감의 봉제선이 벌어졌어요. 이번 장면에서는 조각이 사라지지 않았어요.',['마모 정도와 사용 습관에 따라 교체 시기가 달라져요.'],[c('putAway','장난감을 치우고 다른 활동 준비하기','손상된 물품의 사용을 중단하고 안전한 놀이를 준비했다.'),c('replace','추가 주문을 확인하고 교체 계획하기','손상된 인형은 사용을 중단했다. 필요하면 추가 주문에서 기준가의 110%로 새 인형을 구입한다.')],{loss:{plush:1},consequence:['포옹 인형 1개 사용 중지. 실제 추가 주문 시에만 비용을 차감한다.'],image:{atlas:'assets/room-v2.png',room:true,prop:'plush',pose:0}})
 ];
 ED.EVENTS.push(...extras);
 const CHAPTERS=[
 {id:1,title:'우리 집에 온 첫날',intro:'낯선 방에서 작은 친구가 자기 속도로 첫 하루를 시작해요.',events:['newHome','firstMeal','firstWater','stool','urine','catLitter','dogToilet']},
 {id:2,title:'집 안의 작은 소동',intro:'익숙해진 공간에는 호기심을 끄는 물건도 많아요.',events:['catCup','catGlass','catPlant','catScratch','dogChew','dogTrash']},
 {id:3,title:'마음을 알아가는 시간',intro:'다가오거나 거리를 두는 작은 신호에 귀를 기울여요.',events:['boredom','toyTaste','catBox','catHide','dogBell','dogPull','dogDoor']},
 {id:4,title:'갑자기 달라진 행동',intro:'평소와 다른 모습은 기록하고, 확인이 필요한 신호는 상담해요.',events:['health','itch','urinaryPattern','gait','urinaryEmergency']},
 {id:5,title:'예상하지 못한 지출',intro:'안전을 먼저 확보하고 꼭 필요한 비용과 선택 지출을 구분해요.',events:['brokenGear','missingToy','vetExpense']}
 ];
 const api={CHAPTERS,extras};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.PetScenarios=api;
})(typeof globalThis!=='undefined'?globalThis:this);
