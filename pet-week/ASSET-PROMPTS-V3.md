# 반려동물 16마리 · 상태 스프라이트 생성 기록

- 생성 방식: 기본 내장 `image_gen` 도구. CLI/API 대체 방식은 사용하지 않았습니다.
- 생성일: 2026-10-21
- 용도: 게임 캐릭터 선택 화면 및 방 안 상태 표현.
- 최종 저장 위치: `dist/assets/{고유 식별자}-states-v3.png`
- 원본은 도구 기본 생성 폴더에 보존하고 프로젝트로 복사했습니다.
- 크기: 16개 모두 실제 1536 × 1024 px, PNG 알파 투명 배경.
- 배열: 4열 × 2행, 한 칸 384 × 512 px. 왼쪽 위부터 행 우선 순서입니다.

| 인덱스 | 상태 |
|---|---|
|0|평온함|
|1|배고픔|
|2|수분 부족|
|3|놀고 싶음|
|4|즐거움·만족|
|5|피곤함·졸림|
|6|불안·스트레스|
|7|아프거나 불편함|

숫자와 순서는 `dist/assets/manifest-v3.json`에도 기록되어 있습니다. 모든 결과를 시각적으로 확인했으며 눈·귀·입·꼬리·자세의 변화를 포함합니다. 생성 이미지의 여백은 칸마다 약간 다르므로 화면에서는 고정 셀 단위로 잘라 사용합니다. 알파 값은 가장자리 (0, 0)에서 모두 0, 중앙 격자 교차점에서 0 또는 1임을 확인했습니다. 단순한 색상 필터로 개체를 대체하지 않았습니다.

## 참조 이미지

- 고양이: `dist/assets/cat-v2.png` — 부드러운 봉제 질감과 화풍 참고.
- 개: `dist/assets/dog-v2.png` — 부드러운 봉제 질감과 화풍 참고.
- 모든 호출에서 `transparent_background: true`를 사용했습니다.

## 실제 프롬프트

각 호출의 정확한 프롬프트는 아래 **공통 접두문** 뒤에 해당 개체의 **접미문**을 구분자나 줄바꿈 없이 이어 붙인 문자열입니다. `Subject identity: ` 다음에 공백 한 칸이 있습니다. 참조 이미지 경로는 각 종의 위 파일로 전달했습니다.

### 공통 접두문

```text
Use case: stylized-concept.
Asset type: production transparent sprite atlas for a Korean pet-care web game.
Reference image: style and soft material reference ONLY. Create the specified individual identity, not a recolor of the reference silhouette.
Render a SINGLE landscape PNG atlas, exactly 1536 x 1024 pixels, with EXACTLY 4 equal columns and 2 equal rows. Cells are each 384 x 512 pixels. Eight full-body poses of ONE identical animal, one pose per cell. All characters centered horizontally in their cell with feet/belly resting at the same floor baseline 440px from each cell's top. Keep the WHOLE animal, including every ear, tail, whisker and paw, within x=45..339 and y=65..440 within its cell. Generous truly transparent gutters, absolutely no overlap between cells. No visible grid or dividers. Fixed camera, same scale and front/three-quarter view across all eight cells. No perspective variation. In seated poses make height about 330 px, never crop a body part.
Soft handmade stuffed-toy aesthetic: fuzzy felt plush, rounded tactile stitching, black glossy bead eyes, stubby soft paws, warm gentle studio lighting, charming expressive animal anatomy. Not a realistic live animal. Do not add clothing, accessories, symbols, hearts, food bowls, props or text.
Expression and pose order, left-to-right TOP ROW then left-to-right BOTTOM ROW:
0 CALM: upright relaxed sitting, ears natural, soft open eyes, small relaxed mouth, loose tail.
1 HUNGRY: leaning forward expectantly, head lifted, pleading open eyes, tiny pink tongue licking lips, ears angled toward viewer; noticeably different silhouette from calm.
2 THIRSTY: body lower and drooping, head and ears lowered, subdued half-lidded eyes, little tongue touching lips, tail hanging or lying flat.
3 WANTS TO PLAY: very low playful crouch with rear lifted, ears leaning forward, focused bright eyes, one front paw raised; lively bent silhouette.
4 JOYFUL SATISFIED: sitting tall with front paws lifted cheerfully, upturned smiling eyes, happy open little mouth, tail lifted; face clearly visibly joyful.
5 SLEEPY TIRED: lying curled on its side, eyes fully closed, ears relaxed, tail wrapped along body; horizontal silhouette.
6 ANXIOUS: body pulled in tightly, hunched shoulders, ears folded backward, widened uncertain eyes, little worried downturned mouth, tail tucked around feet.
7 UNCOMFORTABLE: low compact crouch with head bowed and back gently hunched, halfclosed eyes, ears lowered, slack tail and visibly low energy. No wounds, blood, tears, disease symbols or diagnostic labels.
Ensure distinguishable actual eye, mouth, ear, tail and body poses, not just color changes. The atlas must have a REAL transparent alpha background, no painted checkerboard, no beige/brown backdrop, no contact-shadow rectangle, no floor, no vignette, no watermark.
Subject identity: 
```

### 개체별 접미문과 저장 파일

#### 두부 · dogSunny

- 파일: `dist/assets/dogSunny-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-7ffb5295-3d64-43ea-ba02-bb8b89da2000.png`

```text
두부 (dogSunny), a cream retriever with broad round floppy ears, a cream muzzle, sturdy adult build and a soft waving plume tail. Species: dog. Keep exactly this identity across all eight poses.
```

#### 보리 · dogCalm

- 파일: `dist/assets/dogCalm-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-52898a82-dd3a-48a5-a5fd-945a3b7af8af.png`

```text
보리 (dogCalm), a caramel and white short-legged adult dog, very long floppy ears, white face blaze, shy compact build. Species: dog. Keep exactly this identity across all eight poses.
```

#### 콩이 · dogPuppy

- 파일: `dist/assets/dogPuppy-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-17f7ba8f-92bc-4e2e-bca4-3d5ed4f097da.png`

```text
콩이 (dogPuppy), a small white puppy with asymmetrical warm-brown patches, one brown ear, big soft paws and a very round baby head. Species: dog. Keep exactly this identity across all eight poses.
```

#### 밤이 · dogSenior

- 파일: `dist/assets/dogSenior-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-14454f99-6f98-4943-8294-3e3eb6ac8d6f.png`

```text
밤이 (dogSenior), a dark chocolate-brown senior dog, visibly silver-grey muzzle and eyebrow fur, gently drooping ears and a slightly stocky build. Species: dog. Keep exactly this identity across all eight poses.
```

#### 구름 · dogSensitive

- 파일: `dist/assets/dogSensitive-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-321a5660-4ff1-4a1e-8a94-4f5954805eed.png`

```text
구름 (dogSensitive), a very fluffy white spitz dog with triangular upright ears, cloudlike round body and curled plume tail. Species: dog. Keep exactly this identity across all eight poses.
```

#### 탄이 · dogIndependent

- 파일: `dist/assets/dogIndependent-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-def726ad-02cf-420e-bbc1-d601973a7ef1.png`

```text
탄이 (dogIndependent), a sleek black and tan pointed-ear dog with tan eyebrows and paws, pointed upright ears and a slender athletic adult body. Species: dog. Keep exactly this identity across all eight poses.
```

#### 호두 · dogGentle

- 파일: `dist/assets/dogGentle-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-8b2173e2-3b2b-4f66-b18c-a0fb651036b1.png`

```text
호두 (dogGentle), a beige shaggy senior dog, softly scruffy fluffy beard and eyebrows, floppy ears and broad gentle face. Species: dog. Keep exactly this identity across all eight poses.
```

#### 해리 · dogSocial

- 파일: `dist/assets/dogSocial-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-0e42c956-9bee-4416-b948-41efd060e49e.png`

```text
해리 (dogSocial), a apricot poodle with tightly curled plush wool fur, fluffy round floppy ears and long slim legs. Species: dog. Keep exactly this identity across all eight poses.
```

#### 치즈 · catCurious

- 파일: `dist/assets/catCurious-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-ee4a67bc-2de4-4775-89e8-036334f2b62b.png`

```text
치즈 (catCurious), a orange and cream striped adult cat, cream muzzle and belly, clear darker orange forehead stripes and ringed tail. Species: cat. Keep exactly this identity across all eight poses.
```

#### 모카 · catShy

- 파일: `dist/assets/catShy-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-10cc70b7-ab5f-490d-bd43-1fc056eca272.png`

```text
모카 (catShy), a white and warm brown patched adult cat, brown ears, brown forehead stripes, white muzzle, softly round cheeks and ringed brown tail. Species: cat. Keep exactly this identity across all eight poses.
```

#### 나비 · catKitten

- 파일: `dist/assets/catKitten-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-4c0aaba3-f4b7-4d6b-ad36-d011d3a5c97f.png`

```text
나비 (catKitten), a small calico kitten, white base with orange and black patches, oversized triangular ears and little stubby kitten paws. Species: cat. Keep exactly this identity across all eight poses.
```

#### 단추 · catSenior

- 파일: `dist/assets/catSenior-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-19badeb2-c1b1-46fa-935d-3e365826d3a5.png`

```text
단추 (catSenior), a grey and white senior cat, silver muzzle and eyebrows, white chest and paws, rounded grey ears and stocky gentle body. Species: cat. Keep exactly this identity across all eight poses.
```

#### 루나 · catIndependent

- 파일: `dist/assets/catIndependent-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-0d88fed0-f007-4d39-b197-c16c478ab4a5.png`

```text
루나 (catIndependent), a sleek black adult cat with subtly charcoal muzzle, pointed triangular ears, long slender tail and slim elegant build. Species: cat. Keep exactly this identity across all eight poses.
```

#### 솜이 · catSocial

- 파일: `dist/assets/catSocial-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-7e2a6aa5-9125-4766-a83e-21768544e3d5.png`

```text
솜이 (catSocial), a extremely fluffy white adult cat with pink inner ears, round cloudlike cheeks, small pink nose and enormous fluffy plume tail. Species: cat. Keep exactly this identity across all eight poses.
```

#### 미루 · catSensitive

- 파일: `dist/assets/catSensitive-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-816f004b-5ede-4e85-bc7c-a74db67c6689.png`

```text
미루 (catSensitive), a blue-grey shorthair adult cat with rounded triangular upright ears, smooth dense felt coat, silvery muzzle and slim tail. Species: cat. Keep exactly this identity across all eight poses.
```

#### 율무 · catQuiet

- 파일: `dist/assets/catQuiet-states-v3.png`
- 원본: `C:\Users\SSAFY\.codex\generated_images\01a15c95-6bf7-7841-95a5-386dbbaa7e19\exec-f267c14d-4d34-4e0b-a648-6eaaf369fbfe.png`

```text
율무 (catQuiet), a cream adult cat with dark cocoa-brown pointed ears, cocoa brown paws and tail, small rounded face and pale ivory chest. Species: cat. Keep exactly this identity across all eight poses.
```


