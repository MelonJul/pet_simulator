# 두둥이 캐릭터 추가 · 이미지 제작 기록

- 방식: 내장 `image_gen` · `stylized-concept` · 사진을 참고한 새 이미지 생성
- 캐릭터: 두둥이 / 코리안 숏헤어 / 6살
- 게임 파일: `dist/assets/catDudung-states-v3.png`
- 요청: 기존 봉제인형 화풍, 사진의 짙은 고등어무늬·연두빛 눈·큰 귀·밝은 턱 반영
- 참고: 사용자가 제공한 얼굴·전신 사진 3장과 기존 `catShy-states-v3.png` 화풍/배열. 원본 사진은 게임 배포물에 포함하지 않습니다.
- 배열: 4열 × 2행. 평온 → 배고픔 → 수분 부족 → 놀이 욕구 → 만족 → 졸림 → 불안 → 불편함
- 성격·건강·장난감 취향은 게임 데이터로 별도 설정했습니다. 사진에서 추정한 실제 특성이 아닙니다.

## 정확한 생성 프롬프트

```text
Use case: stylized-concept.
Asset type: production transparent sprite atlas for an existing cozy Korean pet-care browser game.
Primary request: Add ONE new playable cat named 두둥이 (Dudung), a six-year-old Korean shorthair, based on the user's cat photos. Produce a 1536x1024 PNG sprite sheet with exactly 4 equal columns by 2 equal rows, eight poses of the SAME cat.
Reference images: first three supplied JPGs are identity references of the same real cat; fourth PNG is STYLE and GRID reference only. Keep the existing game's soft plush felt toy aesthetic, short velvety fabric fibers, round oversized head, small rounded body and paws, simple cute sculpted face. Do not use the white/brown coat of the style reference.
Identity: dark charcoal and warm gray-brown mackerel tabby, strong black forehead M and cheek stripes, black narrow stripes on legs and torso, dark striped tail, tall triangular ears with dusty pink inner felt, a small dusky brown-pink nose with dark border, cream chin and a little cream around the muzzle only (NO white chest/bib or white paws). Distinct large yellow-green eyes, green iris rims around glossy black pupils, reflecting the user's photos, but remain toy-like rather than photorealistic.
Eight frames left to right, top to bottom:
0 calm: upright sitting, relaxed ears, soft neutral mouth, front paws together.
1 hungry: standing leaning forward slightly, expectant open eyes, licking lips with tiny tongue, tail raised.
2 thirsty: lower tired crouch, ears lowered sideways, dry little tongue at lips, drooping gaze; clearly distinct from hungry.
3 wants play: playful low stalking crouch, raised hindquarters, one front paw stretching, attentive eyes and upright ears.
4 joyful/satisfied: sitting delighted, eyes closed into smiles, two raised front paws, relaxed curled tail.
5 sleepy: lying curled with eyes closed, head on paws, tail around body.
6 anxious: tense upright tucked sitting, ears back, worried eyes, tail tight around paws, closed worried mouth.
7 uncomfortable: hunched low lying posture, head lowered, ears sideways, half-closed eyes, subdued face without medical symbols.
Composition: orthographic-like three-quarter front view, consistent identity/material and scale. Each 384x512 cell contains one complete full-body cat and tail, centered horizontally, paws/body baseline near 90% of its own cell height. KEEP 25+ pixels of entirely transparent padding on all four edges of EACH cell. No clipping or overlap into neighboring cells. No props, no letters, no captions, no borders.
Background: genuinely transparent alpha throughout empty areas, NO opaque or translucent colored gradient, no floor, no scene, no checkerboard baked into pixels, no cast shadows behind the silhouettes. Soft studio lighting only on the cat bodies.
Preserve recognizable tabby markings and yellow-green eyes consistently in all eight frames.
```

## 프레임 여백 보정 프롬프트

같은 내장 이미지 생성 도구로 귀·꼬리·발이 각 셀 안에 들어오도록 여백을 보정했습니다. 원본 PNG는 보존하며 코드로 재가공하지 않았습니다.

```text
Use case: precise-object-edit. This is a game sprite atlas layout correction, not a redesign. Preserve the exact gray-brown tabby plush cat identity, yellow-green eyes, markings, texture and all eight expressions from the input. Correct ONLY framing and spacing.
Output a transparent PNG 1536x1024 with a mathematically regular 4-column by 2-row grid. Cell boundaries x=0,384,768,1152,1536 and y=0,512,1024. Exactly one cat per cell in the same order as input.
Scale each of the eight full-body cats down to at most 260 pixels wide and 350 pixels tall, including ears, whiskers and whole tail. Each cat must remain wholly inside its own cell. Every cat is centered at x=192,576,960,1344 respectively. Feet/body base is y=455 for the top row and y=967 for the bottom row. Leave generous totally empty transparent gutters around every cat. In particular the sleeping cat in row 2 column 2 MUST NOT cross x=384 or x=768. Top-row paws MUST NOT cross y=512. Keep the cats visibly separated and smaller than in input; empty space is required for runtime animation cropping.
State order: top calm sitting, hungry licking lips standing, thirsty low crouch, playful stalking; bottom joyful raised paws, sleepy curled on paws, anxious tucked sitting, uncomfortable low hunched.
Absolutely transparent alpha background, no backdrop, no floor, no labels or grid lines. Soft studio lighting on cats only. Do not change colors, character features, expressions, grid order, or camera angle.
```

- 1차 원본: `C:/Users/SSAFY/.codex/generated_images/01a15bf4-eac8-72c3-9545-5e21c463fc9f/exec-1280f3a7-f369-4f82-a287-e798be9531e7.png`
- 최종 선택 원본: `C:/Users/SSAFY/.codex/generated_images/01a15bf4-eac8-72c3-9545-5e21c463fc9f/exec-a5e85fe5-78e2-44cd-bc22-2211a48ed687.png`
- 두 이미지를 검토한 뒤 여백을 확보한 최종 원본을 게임 파일에 복사했습니다.

