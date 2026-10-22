/* 2026-10-21에 조회한 공개 판매가 참고. 캐시 포함, 실시간 시세 API 아님. */
(function(root){
  'use strict';
  const source=(shop,product,pack,price,url,note='판매 상세의 표시 판매가')=>({shop,product,pack,price,url,note});
  const fit=(product,price,id,note)=>source('핏펫',product,'1개',price,'https://www.fitpetmall.com/mall/products/'+id,note);
  const nyang=(product,pack,price,url='https://nyangmeong.com/')=>source('냥멍',product,pack,price,url,'판매처 상품 목록에서 확인 · 상세 열기 제한');
  const entry=(gamePrice,basis,...sources)=>({gamePrice,basis,sources});
  const ITEMS={
    food:entry(10600,'개·고양이 소포장 사료 2종의 포장가 중간값 (9,610 + 11,590) ÷ 2. 시장 평균이 아닌 게임 공통 기준. 종과 개체에 맞는 사료를 준비하는 것으로 가정해요.',source('멍뭉이마트','시저 연어와 쇠고기','1kg',9610,'https://mmemart.com/product/시저-연어와-쇠고기-1kg/871/','개 사료 · 기간 할인 제외'),source('펫천국','캐츠랑 어덜트 웨이트케어','1.5kg',11590,'https://jspet.co.kr/product/무료배송-캐츠랑-어덜트-웨이트케어-15kg-고양이사료/3159/','고양이 사료 · 특정 제품 급여를 권하는 뜻은 아님')),
    bowl:entry(10000,'식기 1개 가격',nyang('펫킷 프레쉬 나노 식기 1구','1개',10000)),
    waterBowl:entry(10000,'물그릇으로 사용할 별도 식기 1개 가격',nyang('펫킷 프레쉬 나노 식기 1구','1개',10000)),
    carrier:entry(16200,'소형 이동장 1개 참고. 실제 크기는 개체에 맞게 선택해야 해요.',nyang('푸르미 하드캐리어 FC2000','1개',16200,'https://nyangmeong.com/category/하드-캐리어-이동장/497/')),
    bed:entry(19900,'쿠션형 방석 1개 가격',source('오늘의집','반려동물 털 안붙는 통세탁 인견 방석','1개',19900,'https://store.ohou.se/goods/3588290','판매처 검색 색인의 판매가 · 상세 열기 제한')),
    toy:entry(4100,'탐색용 간식볼 1개 가격',source('CJ온스타일','오렌지 실리콘 노즈워크 간식볼','1개',4100,'https://item.cjonstyle.com/nfront/item/2051551194?channelCode=30002002','혜택가 3,900원 제외')),
    treat:entry(4500,'비스킷 1봉 포장가',source('더주스','비스코티 단호박·당근·시금치 비스켓','160g',4500,'https://thezoos.kr/product/비스코티-단호박당근시금치-비스켓-160g/233/category/53/display/1/','판매처 검색 색인에서 확인 · 상세 열기 제한')),
    hygiene:entry(13800,'브러쉬 5,900원 + 칫솔 7,900원 합산. 실제 묶음 상품은 아니에요.',fit('크레용펫 미니 그루밍 브러쉬',5900,'1000037146'),fit('오늘멍냥 360도 칫솔',7900,'1000041216')),
    cleaner:entry(5500,'청소용품 1병 포장가',source('펫디랩','퓨어핏 탈취제','500ml',5500,'https://petdilab.com/product/반려동물-살균·탈취제-펫디랩-퓨어핏-살균-탈취제-500ml/22/category/1/display/2/','웰컴 쿠폰가 4,500원 제외 · 청소용품 가격 참고')),
    harness:entry(14900,'하네스와 리드줄 1세트 가격',source('유앤펫','쥬뗌므 하네스 리드줄 세트','S~XL 세트',14900,'https://u-n-pet.com/category/목줄하네스/116/','판매처 상품 목록의 판매가')),
    bags:entry(500,'270매 12,900원 ÷ 270 × 10 = 약 478원 → 게임 10장 500원',source('강아지대통령','크레용펫 THE그린 배변봉투','270매',12900,'https://prod-view.dogpre.com/product/106054','판매처 공개 상품 페이지 · 즉시할인 반영, 별도 쿠폰 제외')),
    pads:entry(2600,'50매 12,900원 ÷ 50 × 10 = 2,580원 → 게임 10장 2,600원',source('강아지대통령','흡수혁명 배변패드 소형','50매',12900,'https://dogpre.com/product/26150','표시 즉시할인 반영 · 쿠폰 제외')),
    litterBox:entry(17400,'모래삽을 포함한 화장실 1개 가격',nyang('네이처펫 냥냥이 탐나는 2단높이 화장실','모래삽 포함 1개',17400,'https://nyangmeong.com/category/화장실/327/')),
    litter:entry(7200,'모래 1봉 포장가',source('고양이대통령','네꼬모리 두부국시 극세입자 오리지널','2.8kg',7200,'https://catpre.com/product/25179','표시 즉시할인 반영 · 품절 표시 상품의 참고가격')),
    scratch:entry(10000,'수직 스크래처 가격을 100원 단위로 반올림',source('모넬로','수직 벽부착 스크래쳐 GO2093','1개',9990,'https://monello.co.kr/','판매처 상품 목록에서 확인 · 게임 그림과 설치 형태는 다를 수 있음')),
    wand:entry(2200,'낚싯대 장난감 1개 가격',nyang('펫모닝 PMC-320 팔락팔락 리본 낚시대','1개',2200)),
    freezeChicken:entry(6900,'동결건조 간식 1봉 포장가',source('해피팡팡','동결건조 닭가슴살','50g',6900,'https://m.happypangpang.net/product/동결건조-닭가슴살-50g/564/')),
    freezeFish:entry(13000,'동결건조 북어 1통 포장가',source('고양이대통령','츄통령 바삭츄 동결건조 북어','75g',13000,'https://catpre.com/product/41910','캐시된 판매 상세 · 가격 변동 가능')),
    creamTreat:entry(1900,'스틱 4개입 포장가를 반올림. 게임 5회는 실제 스틱 5개가 아니에요.',source('냥멍','이나바 챠오 츄르 참치 SC-71','14g × 4개',1890,'https://m.nyangmeong.com/product/이나바-챠오-츄르-참치14gx4개입sc-71-고양이-마약간식차오추르츄루추르/4188/')),
    trainingBites:entry(9000,'훈련 간식 1봉 포장가',source('플로트','릴리스키친 트레이닝 트릿','80g',9000,'https://flotshop.com/product/릴리스키친-트레이닝-트릿-80g-강아지간식/1213/','회원가 8,100원 제외')),
    dentalChew:entry(2000,'덴탈껌 1봉 포장가를 반올림. 게임 4회는 실제 4개와 달라요.',source('강아지대통령','카리에스 덴탈껌','6개입 / 100g',1950,'https://dogpre.com/product/3510','표시 즉시할인 반영 · 쿠폰 제외')),
    ball:entry(8900,'놀이공 단품 가격',fit('딩동펫 테라조 TPU 공 S/M',8900,'1000022256')),
    mouse:entry(2000,'쥐돌이 장난감 1개 가격을 반올림',nyang('펫모닝 PMC-363 바스락 쥐돌이','1개',1950)),
    tunnel:entry(15000,'고양이 터널 1개 가격',fit('아서아리 터널 동굴 스프링 장난감',15000,'1000037734','쿠폰가 13,350원 제외')),
    snuffle:entry(39000,'노즈워크 매트 1개 가격',source('비마이펫 스토어','세이오앙 놀다지쳐 꿀잠 매트','1개',39000,'https://store.bemypet.kr/product/세이오앙-놀다지쳐-꿀잠-강아지-노즈워크-매트/','일반 할인 판매가 · 정가 49,000원')),
    tug:entry(2700,'터그 로프 1개 가격',fit('펫모닝 로프토이 매듭',2700,'1000004084','판매처 검색 색인 확인 · 상세 열기 제한 · 쿠폰가 제외')),
    puzzle:entry(15400,'퍼즐 먹이통 단품 가격',fit('쏘울펫 노즈워크 퍼즐 먹이통',15400,'1000011496','원형/발바닥 옵션 · 쿠폰가 제외')),
    catTower:entry(64800,'중형 캣타워 1개 가격',source('롯데홈쇼핑','헬로망치 프리미엄 중형 캣타워 D400','1개',64800,'https://www.lotteimall.com/planshop/viewPlanShopDetail.lotte?dispAdutCd=ec_P1001_2&llog=P1001_2&spdp_no=5437224','판매처 기획전의 검색 색인 확인 · 상세 열기 제한')),
    catnip:entry(9900,'캣닢 1통 포장가. 4회는 게임의 사용 단위예요.',source('핏펫','고냥냥 국내산 캣닢가루','10g',9900,'https://www.fitpetmall.com/mall/products/1000037569')),
    hideout:entry(36000,'숨숨집 1개 가격',source('모넬로','박스냥 스크래쳐 숨숨집 GO26335','1개',36000,'https://monello.co.kr/','판매처 상품 목록에서 확인')),
    squeaker:entry(6900,'소리 나는 장난감 1개 가격',fit('펫베오 곰도리 도넛 라텍스 장난감',6900,'1000041349','쿠폰가 제외')),
    plush:entry(7500,'봉제 장난감 1개 가격',fit('크레용펫 공룡 봉제 장난감',7500,'1000037107','쿠폰가 제외'))
  };
  const LEGACY_PRICES={food:12000,bowl:5000,waterBowl:5000,carrier:28000,bed:12000,toy:7000,treat:4000,hygiene:8000,cleaner:5000,harness:15000,bags:3000,pads:6000,litterBox:16000,litter:10000,scratch:10000,wand:6000,freezeChicken:6500,freezeFish:7000,creamTreat:5000,trainingBites:4500,dentalChew:7000,ball:5000,mouse:4000,tunnel:18000,snuffle:16000,tug:6000,puzzle:14000,catTower:35000,catnip:4500,hideout:22000,squeaker:6500,plush:8500};
  const data={REVISION:'retail-2026-10-21',CHECKED_AT:'2026-10-21',ITEMS,LEGACY_PRICES,
    METHOD:'국내 온라인 판매처에서 조회한 비교 상품 가격을 100원 단위로 반올림했어요. 별도 배송비·회원가·쿠폰가는 제외하고 공개 즉시할인은 포함했어요. 일부 캐시·검색 색인 및 품절 상품이 포함되어 현재 결제 가격과 다를 수 있어요. 전국 평균이나 최저가, 특정 제품의 구매 추천은 아니에요.',
    UNITS:'사료의 끼니와 간식·모래·청소용품·캣닢의 사용 횟수는 게임 단위예요. 실제 포장량을 권장 급여량이나 사용 주기로 환산하지 않아요. 배변패드와 봉투만 실제 장수를 환산했어요. 실제 제품은 종·나이·체격·관리 필요에 맞게 골라야 해요.'};
  if(typeof module!=='undefined'&&module.exports)module.exports=data;root.PetPrices=data;
})(typeof globalThis!=='undefined'?globalThis:this);
