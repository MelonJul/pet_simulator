# 사건 전용 고양이 이미지 B — 나비·단추·루나

2026-10-21. Built-in `image_gen.imagegen` 사용. 모든 호출에 `transparent_background:true`, `referenced_image_paths`를 전달했다. 생성 원본을 그대로 복사했으며 픽셀 편집·배경 제거·재압축은 하지 않았다.

## 최종 파일

| 개체 | 이미지 | sourceRect 메타데이터 |
|---|---|---|
| catKitten 나비 | dist/assets/events/pets/catKitten-events-v1.png | dist/assets/events/pets/catKitten-events-v1.json |
| catSenior 단추 | dist/assets/events/pets/catSenior-events-v1.png | dist/assets/events/pets/catSenior-events-v1.json |
| catIndependent 루나 | dist/assets/events/pets/catIndependent-events-v1.png | dist/assets/events/pets/catIndependent-events-v1.json |

모두 1536×1024, RGBA PNG, 4열×2행, 알파 범위 0–254. PNG의 RGB 미리보기에는 흐릿한 색이 보일 수 있지만 실제 알파 채널은 배경을 투명 처리한다. 외곽·셀 경계의 최대 알파는 0 또는 1이다. 알파 16 이상인 실루엣을 읽고 10px 여백을 더한 안전 영역을 JSON의 `frames`에 [x,y,width,height]로 기록했다. 이미지 원본은 수정하지 않았다. 모든 포즈는 서로 겹치지 않는다.

확인한 순서: 0 호기심/오른쪽 앞발 뻗기, 1 놀람/물러남, 2 두 앞발 뻗은 긁기 자세, 3 만족스러운 로프 자세, 4 웅크려 경계, 5 조심스럽게 냄새 맡기, 6 무기력한 웅크림, 7 진료 공간에서 긴장한 앉기. 눈·귀·자세의 차이를 육안 확인했다. 세 고양이의 원본 털무늬·색·코·눈·실루엣을 유지했다.

## 원본과 생성 경로

참조 원본:
- C:/Users/SSAFY/Desktop/자율 프로젝트/pet-week/dist/assets/catKitten-states-v3.png
- C:/Users/SSAFY/Desktop/자율 프로젝트/pet-week/dist/assets/catSenior-states-v3.png
- C:/Users/SSAFY/Desktop/자율 프로젝트/pet-week/dist/assets/catIndependent-states-v3.png

생성 폴더: C:/Users/SSAFY/.codex/generated_images/01a15cfa-210d-72b2-877b-ca770e968d14/

나비: 첫 결과 exec-da38eaf4-0678-43b2-9779-077ebd2b3401.png → 여백 강조 재생성 exec-80913b1a-651d-493d-8d4c-cf1887269b08.png → 레이아웃 수정 최종 exec-ce1a1884-b339-43a6-bc0e-db093e1d8eec.png.
단추: 첫 결과 exec-a94ca0a2-4a3f-419c-8cfa-5b707d09f2cc.png → 레이아웃 수정 최종 exec-20987eae-f949-4bcf-ac08-9eaf9a6c5211.png.
루나: 첫 결과 exec-485d698d-9048-43b8-92cd-af6a0052aba0.png → 레이아웃 수정 최종 exec-4f7821e4-a78a-46bb-838c-3f0862124add.png.

단추·루나의 최초 생성에는 각 개체 원본을 첫 번째 참조로, 나비 최종 아틀라스를 배치 참고용 두 번째 참조로 전달했다. 레이아웃 수정에는 직전 생성물을 단일 참조로 전달했다.

## 정확한 프롬프트

아래 공통 프롬프트에 해당 개체의 추가 문장을 그대로 이어 붙여 최초 생성했다.

### 공통

```text
Use case: identity-preserve.
Asset type: transparent raster sprite atlas for a Korean pet-care game's illustrated events.
Input image 1 is the identity reference of this exact cat, not a background reference. Create new event body poses while preserving EXACT identity, distinctive coat markings and colors, eye color, pink nose, ears, tail, plush soft felt texture, silhouette and proportions from the reference. Keep the same sweet soft 3D plush aesthetic.
Output a 1536 by 1024 PNG with TRUE ALPHA transparent background. Exactly 4 equal columns by 2 equal rows. Each cell is 384 by 512. Exactly one complete full-body cat per cell, eight total. Respect exact cell boundaries: x0,384,768,1152,1536 and y0,512,1024. Every cat must fit entirely within its own cell with at least 16px transparent padding, ears and tail uncut. Keep consistent character scale. Sitting and upright poses feet near local y450; curled/loaf cats also rest near local y450. Faces must be clearly readable, front three-quarter view generally looking RIGHT.
Pose order row-major:
0 Curious investigation: body leans RIGHT, one front paw reaches RIGHT, ears forward, bright attentive eyes, mouth closed.
1 Startled recoil: weight backward, wide surprised eyes, ears slightly sideways, one or both front paws briefly lifted, closed mouth; expressive but not cartoon terror.
2 Scratching stretch: standing on hind legs, upright elongated stretch, both front paws reaching toward an imaginary vertical surface on the RIGHT, focused attentive face; no surface drawn.
3 Cozy contentment: complete loaf with paws tucked, head upright, half-closed slow-blink eyes, relaxed ears, gentle content smile.
4 Timid hiding response: very low crouch, head peeks RIGHT, wide watchful eyes, ears sideways, tail tucked against body.
5 Hesitant sniff: looking down and RIGHT, nose lowered to investigate, one front paw hovering, cautious interested eyes.
6 Low energy: curled body, head held low, heavy eyelids, gently uncomfortable subdued expression, not asleep, no wound or illness symbol.
7 Wary at clinic: sitting with both front paws together, ears slightly sideways, eyes slightly wide and concerned, closed mouth, restrained tension.
No props, no furniture, no floor, no cast floor shadow, no backdrop, no text, no grid lines, no labels, no watermarks. Empty pixels must be transparent; never bake a checkerboard or colored gradient into background.
```

### 나비 추가 문장

```text

This specific cat is catKitten / 나비: a very young small calico kitten with large ears, white face and body base, orange and charcoal black patches, distinctive charcoal patch above forehead, pink nose, shiny black eyes, white paws, calico tail with white tip. Preserve the reference patch layout. Convey a young curious kitten with compact little body and oversized head and ears.
```

나비의 두 번째 생성은 공통 + 나비 추가 문장 + 아래 문장을 그대로 연결하고 원본 catKitten-states-v3.png를 참조했다.

```text

CRITICAL LAYOUT CORRECTION: Use the original reference cat identity, but leave much MORE transparent padding than its sample. The sprite viewer clips at fixed 384px cell widths. Horizontal centers of the eight cats MUST be x192,576,960,1344 on each row. Shrink each cat enough that INCLUDING tail, reaching paws, ears, all fur, each silhouette's maximum horizontal width is ONLY 290px. No part may touch a column separator at x384,768,1152. Leave 47px fully transparent space on each side of every cell. Maximum character height390px. Row1 feet baseline y450, row2 feet baseline y962. This is a sparse atlas with big clear transparent gutters, not tightly packed illustration. Do not enlarge characters to fill space. Do not add any background.
```

### 단추 추가 문장

```text

This specific cat is catSenior / 단추: a senior gray-and-white plush tabby cat, silver-gray forehead and back with darker gray tabby lines, white muzzle/bib/legs/paws, distinctive white eyebrow patches above shiny black eyes, pink nose, gray-ringed tail with white tip. Preserve the reference markings and rounded gently elderly face. Match its relatively sturdy body and modest sleepy demeanor while keeping all eight requested expressions distinct.
Input image 2 is ONLY the sparse grid layout reference, not character identity. Match its four-column two-row arrangement and generous transparent gutters exactly. Use the character from image1 in every cell. No calico coat from image2. The complete character in each cell should occupy only about70% of that cell's width including tail and paws. Every cat is isolated with at least30px clear space on both sides, even reaching poses.
```

### 루나 추가 문장

```text

This specific cat is catIndependent / 루나: a sleek uniform BLACK plush cat with no white patches, shiny black eyes, pale pink nose and inner ears, thin white whiskers, long tapering black tail, straight pointed ears and elegant upright silhouette. Preserve uniform near-black fur, reference head shape and black eyes; do not recolor eyes or add patches. The cat is independent and watchful, with restrained expressive poses.
Input image 2 is ONLY the sparse grid layout reference, not character identity. Match its four-column two-row arrangement and generous transparent gutters exactly. Use the character from image1 in every cell. No calico coat from image2. The complete character in each cell should occupy only about70% of that cell's width including tail and paws. Every cat is isolated with at least30px clear space on both sides, even reaching poses.
```

### 최종 레이아웃 수정 (세 개체 각각 동일한 문장)

```text
Use case: precise-object-edit. Edit the supplied 1536x1024 transparent eight-cat sprite atlas ONLY for layout. KEEP all eight cats EXACTLY as drawn, with identical expressions, colors, coat patterns, textures and poses. Shrink each of the eight individual cats to 70 percent of its current width and height. Arrange the shrunken cats in four columns and two rows. Each column has width384 and each row height512. Put horizontal center of each full cat silhouette at x192,576,960,1344. Put first-row feet at y450 and second-row feet at y962. Clear transparent gutters at all cell boundaries. EVERY cat including tail and reaching paw must be fully INSIDE its own cell. Large empty transparent space is intentional. Do NOT enlarge to fill space. No background, no shadow, no text. Preserve true alpha transparency. Output same1536x1024 PNG.
```

이 문장은 시트의 각 고양이 사이에 투명 여백을 확보하기 위한 이미지 생성 수정 요청이다. 런타임에서는 안전한 sourceRect를 사용하므로 고양이 앞발·꼬리가 셀 경계에서 잘리지 않는다.

