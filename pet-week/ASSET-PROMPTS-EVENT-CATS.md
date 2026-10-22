# 고양이 사건 표정 이미지 · 제작 기록

내장 `image_gen`으로 기존 캐릭터 이미지를 참고해 생성했습니다. API/CLI 생성이나 실행 중 외부 호출은 사용하지 않습니다. 생성 PNG를 그대로 보존하고 CSS에서 포즈 영역을 표시합니다.

| 캐릭터 | 최종 PNG | 정확한 프롬프트·생성 원본 경로 |
|---|---|---|
| 두둥이 | `dist/assets/events/pets/catDudung-events-v1.png` | [A](ASSET-PROMPTS-EVENT-CATS-A.md) |
| 치즈 | `dist/assets/events/pets/catCurious-events-v1.png` | [A](ASSET-PROMPTS-EVENT-CATS-A.md) |
| 모카 | `dist/assets/events/pets/catShy-events-v1.png` | [A](ASSET-PROMPTS-EVENT-CATS-A.md) |
| 나비 | `dist/assets/events/pets/catKitten-events-v1.png` | [B](ASSET-PROMPTS-EVENT-CATS-B.md) |
| 단추 | `dist/assets/events/pets/catSenior-events-v1.png` | [B](ASSET-PROMPTS-EVENT-CATS-B.md) |
| 루나 | `dist/assets/events/pets/catIndependent-events-v1.png` | [B](ASSET-PROMPTS-EVENT-CATS-B.md) |
| 솜이 | `dist/assets/events/pets/catSocial-events-v1.png` | [C](ASSET-PROMPTS-EVENT-CATS-C.md) |
| 미루 | `dist/assets/events/pets/catSensitive-events-v1.png` | [C](ASSET-PROMPTS-EVENT-CATS-C.md) |
| 율무 | `dist/assets/events/pets/catQuiet-events-v1.png` | [C](ASSET-PROMPTS-EVENT-CATS-C.md) |

각 PNG는 1536×1024 RGBA이며 호기심, 놀람, 긁기, 만족, 숨기, 탐색, 불편함, 낯선 곳 경계의 8개 포즈를 포함합니다. 같은 이름의 JSON에 포즈별 원본 영역 8개를 기록했습니다. 균등 4×2 셀을 가정하지 않고 그 영역을 사용해야 앞발·꼬리가 잘리지 않습니다.

상황별 배치와 움직임은 `dist/event-data.js`의 `REACTIONS`, 표시 방식은 `dist/event-ui.js`와 `dist/events.css`에 있습니다. 이미지와 영역·게임 흐름은 검토했지만 브라우저 자동 접근 제한으로 최종 합성 화면의 육안 검증은 수행하지 못했습니다.
