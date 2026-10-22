# 이벤트 장면 이미지 프롬프트

- 생성 도구: 기본 제공 `image_gen` (CLI/API 키 미사용).
- 용도: 플레이 중 API 호출 없이 제공하는 로컬 상황 이미지.
- 스타일 참조: `dist/assets/room-v2.png` (기존 펠트/봉제 게임 방).
- 형식: 각 PNG 1536 × 1024, 2열 × 2행. 셀 768 × 512. 런타임 CSS `background-size: 200% 200%`로 표시한다.
- 동물은 배경에 포함하지 않았다. 게임에서 선택한 캐릭터의 실제 로컬 봉제 스프라이트를 겹쳐 종·털색·체형을 유지한다.
- 이미지 자체에 문구/버튼이 없다. 제목, 닫기 버튼, 접근성 설명은 게임 UI가 제공한다.
- 원본은 생성 도구 출력 경로에 그대로 보존하고, 최종 선택 PNG를 프로젝트에 복사했다. PNG 픽셀을 코드로 자르거나 편집하지 않았다.

## 파일과 셀

| 파일 | 좌상 (0) | 우상 (1) | 좌하 (2) | 우하 (3) |
|---|---|---|---|---|
| `dist/assets/events/events-a-v1.png` | catCup | catGlass | catScratch | catPlant |
| `dist/assets/events/events-b-v1.png` | catBox | catHide | catLitter | dogChew |
| `dist/assets/events/events-c-v1.png` | dogTrash | dogBell | dogPull | dogDoor |
| `dist/assets/events/events-d-v1.png` | missingToy | health | vetExpense | newHome |

## 장면 확인 및 배치 참고

- catCup: 파스텔 파란 **플라스틱 컵**이 온전한 상태로 기울고 물만 쏟아짐. 깨진 조각 없음.
- catGlass: 바닥 물과 투명 유리컵 조각. 부상/피/상처는 그림에 없음.
- catPlant: 온전한 플라스틱 화분, 좁은 잎의 캣그라스, 흩어진 흙. 최초 결과의 넓은 잎 식물은 최종 편집으로 교체했다.
- catLitter: 화장실 밖의 작은 노란 물웅덩이. 대변/그래픽한 오염 묘사 없음.
- dogTrash: 종이와 휴지만 보임. 음식이나 독성물질을 먹었다는 근거로 사용하지 않는다.
- missingToy: 찢어진 봉제 뼈 모양 장난감. 조각이 보이지 않으나 삼킨 장면은 없으며 섭취를 확정하지 않는다.
- health: 일부 남은 사료와 휴식 공간. 그림만으로 질병을 진단하지 않는다.
- vetExpense: 상담/검사용 공간. 수술·입원·치료가 이미 이루어졌다는 장면이 아니다.
- 각 장면의 실제 바닥/표면을 기준으로 조정할 것. 아래 좌표는 셀 **왼쪽/위쪽**에서 잰 발 위치(%)이며 CSS bottom 값이 아니다.

| 장면 | 발 x | 발 y | 참고 |
|---|---:|---:|---|
| catCup / catGlass | 34 | 40 | 선반 윗면, 스프라이트 전체 높이 약 40% 이하 권장 |
| catScratch | 44 | 86 | 소파 긁힌 면은 왼쪽에 남겨둔다 |
| catPlant | 37 | 83 | 흙/화분은 오른쪽 |
| catBox | 58 | 82 | 상자 앞에서 관심을 보이는 구도 |
| catHide | 48 | 70 | 소파 왼쪽 그늘, 작은 불안 포즈 너비 약 22% |
| catLitter | 50 | 82 | 화장실/물웅덩이를 가리지 않는 중앙 |
| dogChew / dogTrash | 43 | 82 | 오른쪽 손상 물품을 가리지 않음 |
| dogBell | 56 | 82 | 초인종은 왼쪽 위 |
| dogPull | 64 | 84 | 줄 연결고리는 x61 y72 부근, 개 몸 앞쪽에 맞춤 |
| dogDoor | 55 | 84 | 문 아래 긁힘 일부를 드러냄 |
| missingToy | 45 | 82 | 장난감은 오른쪽 |
| health | 48 | 82 | 밥그릇은 오른쪽 |
| vetExpense | 48 | 59 | 낮은 진찰대 윗면 |
| newHome | 49 | 82 | 양옆 침구/이동장 사이 |

## 생성 원본

- A 최초: `C:/Users/SSAFY/.codex/generated_images/01a15cd9-f81a-7f40-8b92-9f0004e3bf8b/exec-d22055f5-4ca0-47de-8f35-050a23d2870c.png`
- A 최종: `C:/Users/SSAFY/.codex/generated_images/01a15cd9-f81a-7f40-8b92-9f0004e3bf8b/exec-569209b4-3e53-4865-b687-6cd37a25ddbf.png`
- B: `C:/Users/SSAFY/.codex/generated_images/01a15cd9-f81a-7f40-8b92-9f0004e3bf8b/exec-334534e9-321b-44ab-a213-f9c0f0a0e6c4.png`
- C: `C:/Users/SSAFY/.codex/generated_images/01a15cd9-f81a-7f40-8b92-9f0004e3bf8b/exec-c5b0a8fe-d24a-4cbc-a5fd-344afa008ea0.png`
- D: `C:/Users/SSAFY/.codex/generated_images/01a15cd9-f81a-7f40-8b92-9f0004e3bf8b/exec-5de77dda-fdef-4202-be1e-e4e888f86e0c.png`

## 정확한 프롬프트

### Atlas A

```text
Use case: illustration-story. Asset type: local background atlas for a warm Korean pet-care simulation game. Create ONE landscape PNG exactly 1536x1024 containing FOUR independent 768x512 scenes in a precise 2 by 2 grid. The cells meet exactly at x768 and y512: no gutters, margins, captions, frames, labels, or lettering. Do not merge scenery across the cell boundaries.
Input image: the provided room is STYLE REFERENCE ONLY, not an edit target. Match its soft tactile felt/plush miniature furniture, cream rug, warm peach walls, sage accents and rounded wooden furnishings. Soft daylight, eye-level three-quarter room perspective. Each quadrant has an entire distinct scene.
IMPORTANT: ABSOLUTELY NO ANIMALS OR PEOPLE. A pet sprite is added later by the application. Leave the described pet area visually empty and unobstructed.
TOP LEFT — intact plastic cup accident. A low wide wooden shelf along the left half, top surface at 54% down that quadrant. Keep an empty landing spot at x34%, y54% down. At right edge of shelf a clearly opaque pastel blue PLASTIC tumbler tilts outward, water pouring downward into a puddle on floor right. Cup intact, no cracks, no fragments anywhere. Show the cup in mid-tip/mid-fall and visible water splash, while empty shelf spot will host a cat.
TOP RIGHT — broken glass cup accident. Same warm room with low wide wooden shelf left and empty pet landing spot at x34%, y54%. At far right floor: a small broken transparent drinking glass and a few visibly translucent glass fragments in a puddle. No blood or injuries. Damage is clearly on floor well away from pet spot.
BOTTOM LEFT — sofa scratching. A soft sage sofa behind and to left. Its left-front fabric corner bears several clear vertical scratch pulls and loose fabric threads. Empty floor spot centered x44%, y83% for later pet. Scratches visible beside this spot, not hidden by it.
BOTTOM RIGHT — knocked-over plant. Intact rounded pastel terracotta PLASTIC plant pot tipped on right foreground, loose dark potting soil scattered nearby, harmless rounded leafy indoor plant partly out of pot. Pot is unbroken, no glass or ceramic shards. Empty floor spot centered x40%, y83% for later pet.
No UI, no logos, no text, no animals, no visible human, no gore. All four scenes should feel like a cozy stop-motion plush game rather than realistic photography.
```

### Atlas B

```text
Use case: illustration-story. Asset type: local background atlas for a warm pet-care simulation game. Create ONE landscape PNG exactly 1536x1024 containing FOUR independent 768x512 scenes in a precise 2 by 2 grid. Cells meet exactly at x768 and y512; no gutter, margin, caption, frame or lettering. No scenery crosses cell boundaries.
Input image is STYLE REFERENCE ONLY. Match soft tactile felt/plush miniature furniture, warm peach walls, cream knitted rug, sage accents, rounded wooden furnishings. Soft daylight, eye-level three-quarter room perspective.
ABSOLUTELY NO ANIMALS. The selected pet's exact image is composited later, so keep its area empty.
TOP LEFT — box preferred over new toy. Open empty cardboard box center-right, opening clearly visible, front wall low, box rear rim at 60% down cell and front rim at 85% down. Ignored colorful feather wand toy lies visibly on floor at left. Empty space inside/just in front of box centered x59%, foot position y80% for pet.
TOP RIGHT — hiding from guests. Large soft sage sofa along right half; narrow shadowy shelter/alcove beside sofa's left base at x61%, foot position y80%, visibly empty for pet. Open doorway far left, only lower trouser legs and soft shoes of one guest partly visible at extreme left beyond doorway, no head or torso, no animal. Calm scene, no threat.
BOTTOM LEFT — outside litter tray. Clean accessible shallow sage litter tray far right, small yellowish puddle on floor far left in front of tray, no feces and no graphic mess. Empty floor in middle at x50%, foot position y82% for later pet. Quiet cozy room without feeding bowls.
BOTTOM RIGHT — chewed shoe. Cozy room with sofa in background, visibly chewed torn sneaker in foreground right, a few loose fabric/rubber pieces beside it. Empty floor space at x43%, foot position y82% for dog sprite; no dog rendered. Torn shoe clearly recognizable and visually separate from pet area.
No text, logo, UI, captions, watermark, animals, injuries, gore. Four distinctive cozy stop-motion plush scenes.
```

### Atlas C

```text
Use case: illustration-story. Asset type: local background atlas for a warm pet-care simulation game. Create ONE landscape PNG exactly 1536x1024 containing FOUR independent 768x512 scenes in a precise 2 by 2 grid. Cells meet exactly at x768 and y512; no gutter, margin, caption, frame, border or lettering. No scenery crosses cell boundaries.
Input image is STYLE REFERENCE ONLY. Match soft tactile felt/plush miniature furniture, warm peach walls, cream knitted rug, sage accents, rounded wooden furnishings. Soft daylight, eye-level three-quarter perspective.
ABSOLUTELY NO ANIMALS OR PEOPLE. A dog sprite will be composited later; leave its area empty.
TOP LEFT — rummaging in trash. Cozy kitchen corner, tipped small pale sage waste basket on far right, only crumpled paper and tissue scraps spilled next to it, no food, medicine, sharp objects or hazardous waste. Large clear floor space x43%, foot position y82% for later dog.
TOP RIGHT — barking at doorbell. Warm home entrance. Closed wooden front door on left, small brass wall bell/button beside left door with gentle three-line glow indicating a ring, no words or letters. Wide empty floor area centered x56%, foot position y82% for dog. Friendly lighting, no threat.
BOTTOM LEFT — sudden leash pulling during walk. Safe fenced park walkway with plush felt grass and soft rounded trees. No traffic or animals or people. A red leash HANDLE partly off the far left edge, with red leash cord stretching diagonally to a loose attachment clasp near x60%, foot position y82%, where dog sprite will be added. Clasp on path can be partly hidden later; leash must show mild tension, without harm. Large empty center-right path, softly glowing daylight.
BOTTOM RIGHT — scratching entrance door while alone. Cozy entry with closed sage green front door in back center. Several clear scratch marks on door low down, no broken door, no hole. Empty floor spot x55%, foot position y84% for a dog. Warm room, no gloomy danger imagery.
No text, captions, logo, watermark, UI, animals, people, gore, injuries. Four distinctive cozy stop-motion plush scenes.
```

### Atlas D

```text
Use case: illustration-story. Asset type: local background atlas for a warm pet-care simulation game. Create ONE landscape PNG exactly 1536x1024 containing FOUR independent 768x512 scenes in a precise 2 by 2 grid. Cells meet exactly at x768 and y512; no gutter, margin, caption, frame, border or lettering. No scenery crosses cell boundaries.
Input image is STYLE REFERENCE ONLY. Match its soft tactile felt/plush miniatures, warm peach walls, cream knitted rug, sage accents, rounded wooden furnishings. Soft daylight, eye-level three-quarter room perspective.
ABSOLUTELY NO ANIMALS OR PEOPLE. The chosen cat or dog sprite will be added later; leave large clear space at specified position.
TOP LEFT — missing piece from damaged toy. A small torn plain stuffed fabric toy at right foreground. It is an abstract patchwork plush bone shape, not an animal character. A clear seam tear and one small missing fabric edge, a little exposed stuffing but no separate piece lying on floor. No proof of ingestion depicted. Empty floor spot x45%, foot position y82% for later pet. Cozy neutral room behind.
TOP RIGHT — observed low activity and meal change. Quiet cozy room, soft pet bed and blanket at far left. Partially full sage food bowl at far right with small visible kibble pieces. Empty cream floor at x48%, foot position y82% for pet. Calm daylight, no diagnosis, pills or injury.
BOTTOM LEFT — veterinary assessment costs. Friendly veterinary consultation room with a LOW padded pale sage exam platform/table occupying center. Clean cream cabinets back, simple plain medical bag far right, small stethoscope hung on wall. NO text, charts with letters, needles, operations, patients or people. Platform top should be around y70% down cell; empty landing area centered x48% for later pet. Warm caring atmosphere.
BOTTOM RIGHT — first day at home. Cozy new home corner, open empty sage carrier at far right, quiet round pet bed and folded soft blanket at far left, soft daylight, large empty cream rug in middle at x49%, foot position y82% for pet. Gentle sense of welcome, no party decorations.
No text, logo, watermark, captions, UI, animals, human figures, gore or injuries. Four distinctive cozy stop-motion plush scenes.
```

### Atlas A 식물만 수정

```text
Use case: precise-object-edit. This image is a 1536x1024 2-by-2 game background atlas. Edit ONLY the plant inside the knocked-over pot in the BOTTOM RIGHT quadrant: replace its broad variegated leaves with a compact dense tuft of plain narrow green grass blades (cat grass / wheatgrass), still partly spilled out of the same intact plastic terracotta-colored pot with potting soil on the floor. No broad leaves or vines attached to that tipped pot. Keep the exact grid, all room backgrounds, shelf/cups/plastic water spill, broken glass, scratched sofa, light, texture, placement, dimensions, and all other objects unchanged. Preserve the top left, top right, and bottom left scenes exactly. No animals, no people, no labels, no text.
```

