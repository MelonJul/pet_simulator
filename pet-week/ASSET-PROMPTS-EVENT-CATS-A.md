# Cat event pose atlases — set A

Generated with the built-in `image_gen` tool (not the API/CLI). Source sprite sheets were visually inspected with `view_image` before generation. The generated PNGs were copied byte-for-byte into the project; no image pixel edits, cropping, resampling, or alpha modification were performed.

## Outputs and validation

All three outputs are 1536 × 1024 RGBA PNGs, with eight distinct full-body poses in row-major order. The transparent background has alpha range 0–254. Most corner samples are 0; Dudung's bottom-left sample is 1 (very faint alpha). Reference-style soft plush rendering, coat identities and eye styles are preserved. Expression order is: reaching curiosity, recoil surprise, scratching stretch, content loaf, cautious crouch, hesitant sniff, low-energy discomfort, clinic caution.

The image generator did not exactly respect the equal 384 × 512 cell boundaries: the first reaching paw slightly crosses the nominal column border. Safe per-pose source rectangles are therefore included as separate JSON files. Rectangles include eight pixels of padding around visible alpha > 32, clipped to clear inter-character gaps. Use these source rectangles at runtime instead of assuming a regular grid. Do not use the whole image as a backdrop. Faces and complete bodies remain separate; no other cat's visible pixels occur inside a chosen rectangle. Transparent low-alpha antialiasing is preserved.

## catDudung

- Identity reference: `dist/assets/catDudung-states-v3.png`
- Delivered image: `dist/assets/events/pets/catDudung-events-v1.png`
- Source rectangles: `dist/assets/events/pets/catDudung-events-v1.json`
- Original generated file: `C:/Users/SSAFY/.codex/generated_images/01a15cf9-fdc8-7822-b6cc-dfe68b668bb3/exec-22b57bf1-ee94-45b2-958e-4e140c8cae4a.png`
- Generation setting: `transparent_background: true`

### Exact final prompt

```text
Use case: identity-preserve. Asset type: transparent game cat expression and event pose sprite atlas.
The input is a REFERENCE for this individual cat's identity and cozy plush style only. Create a new production sprite sheet with EXACTLY 8 distinct full-body poses of that SAME individual cat. Preserve exact coat colors, markings, eyes, face shape, body proportions and soft plush fur material. DO NOT reproduce background from the reference.

Layout: output exactly 1536 by 1024 pixels, 4 columns by 2 rows of equal invisible tiles, each 384 by 512. Each cat is SMALL, only 220 pixels WIDE and at most 300 pixels TALL. Each cat remains entirely inside its own tile with at least 72 pixels of transparent padding at every edge, ears and tail included. Center cat horizontally within tile and align feet/body bottom near local y410. No tile borders, labels or numbers. True TRANSPARENT alpha background, NO colored gradient, NO floor, NO background, NO props, NO text, NO frames, NO cast shadow beyond tiny faint contact alpha. Leave generous clear gutters between poses. Camera 3/4 front, faces clearly visible even when facing right. Exactly one cat in each cell, no overlaps, no detached body parts.

In row-major order:
0 TOP LEFT: curious leaning forward; one front paw actively reaches to the RIGHT toward an imaginary small object, bright attentive eyes, ears forward, mouth closed. Clearly reaching, not generic sitting.
1 TOP SECOND: startled recoil; body leans back, both front paws lift, eyes wide, ears turn sideways; surprised CLOSED mouth, not an angry grin and no tears.
2 TOP THIRD: stretching tall upward on back paws, both front paws reach diagonally up to the RIGHT to scratch an imaginary vertical surface; alert focused face; full body and tail fit.
3 TOP RIGHT: comfortable curled loaf, head upright, gentle slow-blink HALF-CLOSED eyes, tiny content closed mouth; no box.
4 BOTTOM LEFT: timid crouch peeking toward the RIGHT; ears tilt slightly sideways, wide watchful eyes, tail tucked; alert cautious, not depressed.
5 BOTTOM SECOND: hesitant sniff; head angled down toward RIGHT, nose forward, one front paw hovering, cautious inquisitive expression.
6 BOTTOM THIRD: low-energy curled body, head low resting by paws, heavy eyelids, mildly uncomfortable face, no tears and no disease symbols.
7 BOTTOM RIGHT: wary at a clinic; sitting upright with front paws neatly together, ears sideways, slightly wide eyes, closed mouth, composed caution.
Make the eyes, ears, mouth and posture of all eight poses express their different situations visibly. Expressive and lively but gentle natural cat body language. No medical diagnosis visuals. No extra limbs.
Layout is essential: Exactly8 SMALL plush cats surrounded by MUCH EMPTY TRANSPARENT SPACE. Cat centers are x192,576,960,1344; row0 body bottom y410,row1 bodybottom y922. Unlike the input sprite sheet, make each individual cat much smaller. Maximum occupied width220,height300. Every cell's 72-pixel edge margin MUST be totally empty transparent. Individual identity: Dudung dark brown-gray Korean shorthair tabby, black dense stripes, yellow-green eyes and soft pale chin.
```

## catCurious

- Identity reference: `dist/assets/catCurious-states-v3.png`
- Delivered image: `dist/assets/events/pets/catCurious-events-v1.png`
- Source rectangles: `dist/assets/events/pets/catCurious-events-v1.json`
- Original generated file: `C:/Users/SSAFY/.codex/generated_images/01a15cf9-fdc8-7822-b6cc-dfe68b668bb3/exec-06cc2467-9b1c-4ca8-a32c-87fe48433690.png`
- Generation setting: `transparent_background: true`

### Exact final prompt

```text
Use case: identity-preserve. Asset type: transparent game cat expression and event pose sprite atlas.
The input is a REFERENCE for this individual cat's identity and cozy plush style only. Create a new production sprite sheet with EXACTLY 8 distinct full-body poses of that SAME individual cat. Preserve exact coat colors, markings, eyes, face shape, body proportions and soft plush fur material. DO NOT reproduce background from the reference.

Layout: output exactly 1536 by 1024 pixels, 4 columns by 2 rows of equal invisible tiles, each 384 by 512. Each cat is SMALL, only 220 pixels WIDE and at most 300 pixels TALL. Each cat remains entirely inside its own tile with at least 72 pixels of transparent padding at every edge, ears and tail included. Center cat horizontally within tile and align feet/body bottom near local y410. No tile borders, labels or numbers. True TRANSPARENT alpha background, NO colored gradient, NO floor, NO background, NO props, NO text, NO frames, NO cast shadow beyond tiny faint contact alpha. Leave generous clear gutters between poses. Camera 3/4 front, faces clearly visible even when facing right. Exactly one cat in each cell, no overlaps, no detached body parts.

In row-major order:
0 TOP LEFT: curious leaning forward; one front paw actively reaches to the RIGHT toward an imaginary small object, bright attentive eyes, ears forward, mouth closed. Clearly reaching, not generic sitting.
1 TOP SECOND: startled recoil; body leans back, both front paws lift, eyes wide, ears turn sideways; surprised CLOSED mouth, not an angry grin and no tears.
2 TOP THIRD: stretching tall upward on back paws, both front paws reach diagonally up to the RIGHT to scratch an imaginary vertical surface; alert focused face; full body and tail fit.
3 TOP RIGHT: comfortable curled loaf, head upright, gentle slow-blink HALF-CLOSED eyes, tiny content closed mouth; no box.
4 BOTTOM LEFT: timid crouch peeking toward the RIGHT; ears tilt slightly sideways, wide watchful eyes, tail tucked; alert cautious, not depressed.
5 BOTTOM SECOND: hesitant sniff; head angled down toward RIGHT, nose forward, one front paw hovering, cautious inquisitive expression.
6 BOTTOM THIRD: low-energy curled body, head low resting by paws, heavy eyelids, mildly uncomfortable face, no tears and no disease symbols.
7 BOTTOM RIGHT: wary at a clinic; sitting upright with front paws neatly together, ears sideways, slightly wide eyes, closed mouth, composed caution.
Make the eyes, ears, mouth and posture of all eight poses express their different situations visibly. Expressive and lively but gentle natural cat body language. No medical diagnosis visuals. No extra limbs.
Layout is essential: Exactly8 SMALL plush cats surrounded by MUCH EMPTY TRANSPARENT SPACE. Eachcat maxwidth220,height300. Character centers x192,576,960,1344. Lots of transparent empty gutters. Individual identity: Cheese is the orange and cream-white plush cat in the reference: warm orange tabby forehead stripes and ears, white muzzle chest belly and paws, orange body patches, orange/cream banded tail, glossy black bead eyes, pink tiny nose, embroidered black whisker lines. Keep this exact toy-like styling, no realistic green irises.
```

## catShy

- Identity reference: `dist/assets/catShy-states-v3.png`
- Delivered image: `dist/assets/events/pets/catShy-events-v1.png`
- Source rectangles: `dist/assets/events/pets/catShy-events-v1.json`
- Original generated file: `C:/Users/SSAFY/.codex/generated_images/01a15cf9-fdc8-7822-b6cc-dfe68b668bb3/exec-7e043086-5008-4865-8c85-83de0f9f10fb.png`
- Generation setting: `transparent_background: true`

### Exact final prompt

```text
Use case: identity-preserve. Asset type: transparent game cat expression and event pose sprite atlas.
The input is a REFERENCE for this individual cat's identity and cozy plush style only. Create a new production sprite sheet with EXACTLY 8 distinct full-body poses of that SAME individual cat. Preserve exact coat colors, markings, eyes, face shape, body proportions and soft plush fur material. DO NOT reproduce background from the reference.

Layout: output exactly 1536 by 1024 pixels, 4 columns by 2 rows of equal invisible tiles, each 384 by 512. Each cat is SMALL, only 220 pixels WIDE and at most 300 pixels TALL. Each cat remains entirely inside its own tile with at least 72 pixels of transparent padding at every edge, ears and tail included. Center cat horizontally within tile and align feet/body bottom near local y410. No tile borders, labels or numbers. True TRANSPARENT alpha background, NO colored gradient, NO floor, NO background, NO props, NO text, NO frames, NO cast shadow beyond tiny faint contact alpha. Leave generous clear gutters between poses. Camera 3/4 front, faces clearly visible even when facing right. Exactly one cat in each cell, no overlaps, no detached body parts.

In row-major order:
0 TOP LEFT: curious leaning forward; one front paw actively reaches to the RIGHT toward an imaginary small object, bright attentive eyes, ears forward, mouth closed. Clearly reaching, not generic sitting.
1 TOP SECOND: startled recoil; body leans back, both front paws lift, eyes wide, ears turn sideways; surprised CLOSED mouth, not an angry grin and no tears.
2 TOP THIRD: stretching tall upward on back paws, both front paws reach diagonally up to the RIGHT to scratch an imaginary vertical surface; alert focused face; full body and tail fit.
3 TOP RIGHT: comfortable curled loaf, head upright, gentle slow-blink HALF-CLOSED eyes, tiny content closed mouth; no box.
4 BOTTOM LEFT: timid crouch peeking toward the RIGHT; ears tilt slightly sideways, wide watchful eyes, tail tucked; alert cautious, not depressed.
5 BOTTOM SECOND: hesitant sniff; head angled down toward RIGHT, nose forward, one front paw hovering, cautious inquisitive expression.
6 BOTTOM THIRD: low-energy curled body, head low resting by paws, heavy eyelids, mildly uncomfortable face, no tears and no disease symbols.
7 BOTTOM RIGHT: wary at a clinic; sitting upright with front paws neatly together, ears sideways, slightly wide eyes, closed mouth, composed caution.
Make the eyes, ears, mouth and posture of all eight poses express their different situations visibly. Expressive and lively but gentle natural cat body language. No medical diagnosis visuals. No extra limbs.
Layout is essential: Exactly8 SMALL plush cats surrounded by MUCH EMPTY TRANSPARENT SPACE. Eachcat maxwidth220,height300. Character centers x192,576,960,1344. Lots of transparent empty gutters. Individual identity: Mocha is the brown and cream-white plush cat in the reference: warm medium brown forehead stripes and ears, white muzzle chest belly and paws, brown body patches, brown/white banded tail, glossy black bead eyes, pink tiny nose, embroidered black whisker lines. Keep this exact toy-like styling, no realistic green irises and no orange fur.
```

## Dudung layout iteration

Two earlier unused variants attempted regular-grid spacing. The final version was generated directly from the original identity sheet using the exact final prompt above. Their originals remain in the built-in generated-images folder; they are not project assets. The selected final PNG is preserved unchanged and safe source rectangles resolve the remaining layout variance.

