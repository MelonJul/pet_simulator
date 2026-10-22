/* Profile-specific targets are game parameters, not veterinary prescriptions. */
(function(root){
  'use strict';
  const rows=[
    ['dogSunny','dog','두부',3,'adult','크림색 털, 둥근 주둥이와 늘어진 귀','호기심 많은 탐험가','안정적인 컨디션','냄새 탐색 뒤 흥분을 가라앉힐 시간을 주세요.',40,1.2,1,12,90,32,'문 앞에서 코를 킁킁대다 보호자를 돌아본다.',['snuffle','ball','toy'],['갑작스러운 접촉'],{ball:2,sniff:3,tug:1,squeak:1,puzzle:2,plush:0},'freezeChicken',1],
    ['dogCalm','dog','보리',5,'adult','갈색·흰색 털, 짧은 다리와 늘어진 귀','신중하고 조용한 친구','소리에 민감한 편','조용한 길에서 짧게 활동하고 다가올 때까지 기다려 주세요.',28,.55,1.5,19,88,52,'한 발 물러나 냄새를 확인한 뒤 천천히 다가온다.',['snuffle','plush','tug'],['삑삑 소리','빠른 움직임'],{ball:0,sniff:3,tug:2,squeak:-3,puzzle:2,plush:3},'trainingBites',.7],
    ['dogPuppy','dog','콩이',.5,'young','흰 털의 갈색 반점, 큰 앞발과 작은 몸','활발하고 쉽게 산만해지는 아기','짧게 놀고 자주 쉬는 연습 중','어려운 퍼즐보다 짧은 탐색을 하고 쉽게 지치는지 살펴요.',30,1.5,1.1,22,92,38,'장난감을 따라 두 걸음 뛰다가 다른 냄새에 멈춘다.',['ball','plush','squeaker'],['길고 어려운 놀이'],{ball:3,sniff:1,tug:0,squeak:2,puzzle:-1,plush:3},'freezeChicken',1.3],
    ['dogSenior','dog','밤이',12,'senior','짙은 갈색 털과 은빛 주둥이','차분하고 익숙한 것을 좋아함','긴 활동 뒤 쉽게 피곤해짐','낮은 강도로 냄새를 맡고 충분히 쉬도록 도와요.',20,.7,1.1,24,66,42,'몇 걸음 걷고 자리를 골라 천천히 앉는다.',['snuffle','plush','puzzle'],['격한 당기기','높은 점프'],{ball:0,sniff:3,tug:-2,squeak:-1,puzzle:2,plush:3},'trainingBites',1.5],
    ['dogSensitive','dog','구름',6,'adult','하얀 복슬복슬한 털과 뾰족한 귀','경계심이 높고 주변을 잘 살핌','낯선 소리에 긴장하기 쉬움','소리와 자극을 줄이고 짧은 놀이부터 시작해요.',29,.4,1.8,20,80,64,'작은 소리에 귀를 세우고 잠시 움직임을 멈춘다.',['puzzle','snuffle'],['삑삑 소리','급한 접근'],{ball:0,sniff:3,tug:0,squeak:-3,puzzle:3,plush:1},'freezeChicken',1.1],
    ['dogIndependent','dog','탄이',4,'adult','검정·황갈색 털, 곧은 귀와 긴 꼬리','독립적이고 자기 속도가 뚜렷함','안정적이지만 긴 접촉을 피함','붙잡기보다 스스로 탐색할 선택지를 주세요.',37,.8,1,15,91,39,'냄새를 맡다가 적당한 거리를 두고 누워 주변을 본다.',['puzzle','snuffle','ball'],['오래 안기','억지 당기기'],{ball:2,sniff:3,tug:-1,squeak:0,puzzle:3,plush:0},'dentalChew',1],
    ['dogGentle','dog','호두',9,'senior','베이지색 곱슬 잔털과 부드러운 눈매','온순하고 천천히 교감함','활동 후 회복 시간이 필요함','무리한 운동보다 짧은 탐색과 관찰을 이어가요.',22,.65,1.2,25,63,46,'곁에 앉아 눈을 천천히 감았다 뜬다.',['plush','snuffle'],['큰 소리','빠른 추격'],{ball:-1,sniff:3,tug:-2,squeak:-2,puzzle:1,plush:3},'freezeChicken',1.6],
    ['dogSocial','dog','해리',2,'adult','살구색 곱슬 털과 둥근 귀','애교 많고 함께 놀기를 좋아함','흥분하면 쉬는 시간을 놓치기 쉬움','놀이 사이에 멈추고 편안해지는지 확인해요.',42,1.6,1,14,94,30,'꼬리를 흔들며 장난감을 물어 보호자 곁에 놓는다.',['tug','ball','squeaker'],['지나치게 긴 놀이'],{ball:3,sniff:1,tug:3,squeak:3,puzzle:1,plush:2},'trainingBites',1.1],
    ['catCurious','cat','치즈',2,'adult','주황·크림색 줄무늬와 긴 꼬리','높은 곳과 사냥놀이를 좋아하는 탐험가','안정적인 컨디션','움직임을 쫓은 뒤 조용히 마무리할 시간을 주세요.',40,1.3,1.1,15,92,36,'창가와 장난감을 번갈아 보며 꼬리 끝을 움직인다.',['wand','mouse','catTower'],['억지로 안기'],{wand:3,mouse:3,ball:1,climb:3,tunnel:2,puzzle:1,squeak:-1,plush:0},'freezeFish',1],
    ['catShy','cat','모카',4,'adult','흰색·갈색 반점과 둥근 얼굴','소심하고 조용히 관찰함','낯선 환경 적응이 느림','숨을 곳을 열어 두고 충분한 거리를 지켜요.',28,.45,1.8,24,87,63,'쉼터 입구에서 몸을 낮춘 채 보호자의 움직임을 살핀다.',['wand','mouse','tunnel'],['삑삑 소리','가까운 접촉'],{wand:3,mouse:3,ball:0,climb:0,tunnel:3,puzzle:1,squeak:-3,plush:2},'freezeChicken',1.1],
    ['catKitten','cat','나비',.4,'young','작은 삼색 몸, 큰 귀와 분홍 코','호기심 많고 금세 다른 곳에 관심을 가짐','짧은 활동과 충분한 수면이 필요함','높은 점프보다 낮게 움직이는 장난감으로 짧게 놀아요.',30,1.6,1.2,24,93,42,'앞발로 톡 건드린 뒤 작은 소리에 고개를 갸웃한다.',['mouse','wand','plush'],['높은 점프','어려운 퍼즐'],{wand:3,mouse:3,ball:2,climb:-1,tunnel:2,puzzle:-1,squeak:0,plush:3},'creamTreat',1.4],
    ['catSenior','cat','단추',13,'senior','회색·흰색 털과 은빛 주둥이','느긋하고 익숙한 자리에서 관찰함','활동 뒤 쉽게 졸리고 회복이 느림','바닥 가까운 움직임과 편한 휴식 공간을 준비해요.',18,.6,1.1,27,62,43,'몸을 웅크려 쉬다가 낮게 움직이는 물체를 눈으로 따라간다.',['plush','mouse','puzzle'],['높은 점프','갑작스러운 소리'],{wand:1,mouse:3,ball:-1,climb:-2,tunnel:1,puzzle:2,squeak:-3,plush:3},'creamTreat',1.7],
    ['catIndependent','cat','루나',5,'adult','매끈한 검은 털과 길고 곧은 꼬리','독립적이고 자기 공간을 중시함','긴 접촉보다 선택 가능한 교감을 선호','다가오지 않으면 기다리고 혼자 탐색할 공간을 주세요.',31,.8,1.2,18,90,44,'조금 떨어진 자리에서 눈을 천천히 깜박이며 주변을 본다.',['puzzle','tunnel','mouse'],['오래 안기','시끄러운 자극'],{wand:1,mouse:3,ball:0,climb:2,tunnel:3,puzzle:3,squeak:-2,plush:0},'freezeFish',1],
    ['catSocial','cat','솜이',3,'adult','흰 복슬털과 풍성한 꼬리','애교 많고 사람에게 먼저 다가옴','털 관리에 천천히 익숙해지는 중','빗질과 놀이를 짧게 나누고 싫다는 신호를 살펴요.',32,1.5,1,18,86,30,'꼬리를 세우고 다가와 곁에 둥글게 앉는다.',['wand','plush','ball'],['오랜 빗질'],{wand:3,mouse:2,ball:2,climb:1,tunnel:1,puzzle:0,squeak:-1,plush:3},'creamTreat',1],
    ['catSensitive','cat','미루',7,'adult','청회색 짧은 털과 뾰족한 귀','예민하지만 익숙해지면 집중함','주변 변화에 스트레스가 쉽게 올라감','물건 위치와 소리를 안정적으로 유지해 주세요.',25,.35,1.9,23,76,66,'귀를 옆으로 돌리고 주변을 살핀 뒤 조용한 곳으로 이동한다.',['puzzle','mouse','tunnel'],['삑삑 소리','빠른 추격'],{wand:1,mouse:3,ball:-1,climb:0,tunnel:3,puzzle:3,squeak:-3,plush:1},'freezeChicken',1.2],
    ['catQuiet','cat','율무',10,'senior','크림색 몸과 갈색 귀·발, 통통한 얼굴','차분하고 신중하게 움직임','기초 컨디션을 꾸준히 확인해야 함','긴 활동을 피하고 식사·음수·움직임 변화를 기록해요.',20,.7,1.2,26,60,47,'편한 자리에 앞발을 모으고 앉아 장난감을 가볍게 건드린다.',['mouse','plush','puzzle'],['거친 움직임','높은 점프'],{wand:1,mouse:3,ball:-1,climb:-2,tunnel:1,puzzle:3,squeak:-2,plush:3},'creamTreat',1.6]
  ];
  // Identity/appearance supplied by the user; temperament and care values below are gameplay settings.
  rows.push(['catDudung','cat','두둥이',6,'adult','짙은 회갈색 고등어무늬, 연두빛 눈과 큰 귀, 밝은 턱','신중하게 살피는 호기심 많은 친구','게임 시작 컨디션: 안정적','먼저 냄새를 맡고 다가올 시간을 주고, 짧은 탐색과 휴식을 번갈아 제공해요.',30,.9,1.25,20,88,42,'앞발을 모아 앉아 한동안 바라보다가 코를 가까이 대고 천천히 살핀다.',['mouse','puzzle','wand'],['갑작스러운 큰 소리','빠르게 들이대는 장난감'],{wand:2,mouse:3,ball:1,climb:1,tunnel:2,puzzle:3,squeak:-2,plush:1},'freezeFish',1]);
  const profiles={};
  for(const r of rows){
    const [id,species,name,ageYears,lifeStage,appearance,type,healthNotes,careNotes,activityNeed,adaptation,stressSensitivity,rest,health,stress,habit,favoriteItems,dislikes,toyAffinity,favoriteTreat,fatigueRate]=r;
    profiles[id]={id,species,name,ageYears,lifeStage,appearance,type,healthNotes,careNotes,activityNeed,adaptation,stressSensitivity,rest,habit,favoriteItems,dislikes,toyAffinity,favoriteTreat,fatigueRate,
      age:`${{young:'어린',adult:'성체',senior:'노령'}[lifeStage]} ${species==='cat'?'고양이':'개'} · ${ageYears<1?Math.round(ageYears*12)+'개월':ageYears+'살'}`,
      tags:[type.split(' ')[0],lifeStage==='senior'?'천천히 활동해요':lifeStage==='young'?'자주 쉬어요':'서로 알아가요',adaptation<.7?'적응을 기다려요':'주변을 탐색해요'],
      description:`${type}. ${careNotes}`,signal:habit,favorite:'반응을 관찰하며 알아가요',play:activityNeed,walk:species==='dog'?activityNeed:0,playStyle:lifeStage==='senior'||adaptation<.7?'gentle':'explore',
      catnipResponse:species==='cat'?(id==='catShy'?.25:id==='catSenior'?.35:id==='catSensitive'?.4:.9):0,
      startStats:{nutrition:78,hydration:76,cleanliness:85,stress,activity:55,health,bond:20,fatigue:lifeStage==='senior'?22:12},
      drinkAmount:lifeStage==='young'?28:lifeStage==='senior'?30:32,
      image:`assets/${id}-states-v3.png`,sprite:id
    };
  }
  profiles.catDudung.breed='코리안 숏헤어';
  profiles.catDudung.age='코리안 숏헤어 · 성체 · 6살';
  profiles.catDudung.profileNote='이름·품종·나이와 외형은 제공된 정보와 사진을 반영했어요. 성격·취향·건강 수치는 게임용 설정이에요.';
  if(typeof module!=='undefined'&&module.exports)module.exports=profiles;
  root.PetProfiles=profiles;
})(typeof globalThis!=='undefined'?globalThis:this);
