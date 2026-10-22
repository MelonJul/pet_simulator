# 생성 이미지 제작 기록

제작 모드: 내장 image_gen · 2026-10-21

사용자 제공 봉제 고양이 참고 이미지의 부드러운 펠트 질감과 비례를 바탕으로 제작했습니다. 게임은 아래 PNG를 직접 읽으며 실행 시 이미지 생성 API를 호출하지 않습니다. 원본은 생성 이미지 폴더에 보존하고 프로젝트에 복사했습니다.

## room-v2

사용 파일: dist/assets/room-v2.png

최종 프롬프트:

Use case: stylized-concept. Production raster assets for a cozy browser pet care simulation. Style is a premium miniature plush toy diorama: tactile soft short flocked fur, cream/off-white with soft milk-chocolate brown markings, oversized round heads, little glossy black bead eyes, pink embroidered noses, stubby paws; handmade felt, rounded 3D miniature shapes, warm diffused light, subtle ambient shadow. NOT flat vector, NOT realistic living animal, no outlines, no text/logos/UI. Create ONE empty pet living-room game background, wide landscape 1536x1024, gentle elevated FRONT view, almost orthographic (not steep isometric). Whole spacious floor visible, rear wall starts at 42% image height, left and right walls barely visible. Soft peach wallpaper, large rounded wood window in upper left with pale sage curtains and blue sky, low simple oak storage cabinet on far right back wall, small framed paw art on back wall, warm cream woven floor with very subtle seam lines, large pale oat oval rug centered in the lower-middle. All furniture looks like stuffed/felt miniature set pieces. Floor at bottom 55% must stay open for separately composited pets and objects. Fixed decor only; no pets, no humans, no food bowls, no pet beds, no cat tower, no toys, no litter box, no consumable packaging. Cozy collectible dollhouse aesthetic matching soft white-and-brown plush cats. Full bleed; no border.

## cat-v2

사용 파일: dist/assets/cat-v2.png

최종 프롬프트:

Use case: stylized-concept. Production raster assets for a cozy browser pet care simulation. Style is a premium miniature plush toy diorama: tactile soft short flocked fur, cream/off-white with soft milk-chocolate brown markings, oversized round heads, little glossy black bead eyes, pink embroidered noses, stubby paws; handmade felt, rounded 3D miniature shapes, warm diffused light, subtle ambient shadow. NOT flat vector, NOT realistic living animal, no outlines, no text/logos/UI. EDIT the attached plush-cat reference into a game-ready CAT sprite atlas, using only one original-style kitten (white with milk-chocolate tabby patches, black bead eyes, pink nose) consistently across all poses. Preserve its charming plush material and face proportions. Output ONE transparent PNG atlas, 1536x1024, precisely 4 columns by 2 rows, 8 equal 384x512 cells. No drawn grid, no labels. Every character stays completely inside its cell with wide 12% safe margins, consistent scale and floor baseline at 84% of each cell, camera gently elevated front-three-quarter. Row1 left to right: (1) sitting front with happy bead eyes (2) mid-step walking left, body in side three-quarter (3) mid-step walking right (4) crouched head lowered eating, NO bowl. Row2 left to right: (5) playful with one paw raised (6) curled up asleep eyes closed (7) shy sitting ears lowered slightly (8) grooming one paw with closed content eyes. Each cell contains exactly one complete cat. All outside pixels fully transparent, no ground plane or colored background. No other animals.

## dog-v2

사용 파일: dist/assets/dog-v2.png

최종 프롬프트:

Use case: stylized-concept. Production raster assets for a cozy browser pet care simulation. Style is a premium miniature plush toy diorama: tactile soft short flocked fur, cream/off-white with soft milk-chocolate brown markings, oversized round heads, little glossy black bead eyes, pink embroidered noses, stubby paws; handmade felt, rounded 3D miniature shapes, warm diffused light, subtle ambient shadow. NOT flat vector, NOT realistic living animal, no outlines, no text/logos/UI. EDIT the attached reference's art style into one friendly cream-and-caramel PUPPY with floppy felt ears, black bead eyes, tiny brown embroidered nose, round plush head and paws. Output ONE transparent game sprite atlas, 1536x1024, exactly 4 columns by 2 rows of equal 384x512 cells. No drawn grid, no text. Same puppy consistent scale, front-three-quarter gently elevated view. Wide 12% safe margins in every cell, floor baseline at 84% of cell. Row1: (1) sitting happily front (2) walking toward left side three-quarter (3) walking toward right side three-quarter (4) crouching head lowered eating, NO bowl. Row2: (5) play bow with front paws low, tail raised (6) curled up asleep eyes closed (7) shy sitting floppy ears low (8) grooming a paw. Each cell exactly one complete puppy, no cats. All outside pixels fully transparent, no ground plane.

## items-v2

사용 파일: dist/assets/items-v2.png

최종 프롬프트:

Use case: stylized-concept. Production raster assets for a cozy browser pet care simulation. Style is a premium miniature plush toy diorama: tactile soft short flocked fur, cream/off-white with soft milk-chocolate brown markings, oversized round heads, little glossy black bead eyes, pink embroidered noses, stubby paws; handmade felt, rounded 3D miniature shapes, warm diffused light, subtle ambient shadow. NOT flat vector, NOT realistic living animal, no outlines, no text/logos/UI. Create ONE game inventory and room-object sprite atlas, 1536x1536 square PNG, fully transparent background, exactly 4 columns x 4 rows of 16 equal 384x384 cells. One complete isolated object centered in each cell, no clipping and 12% transparent margin all around, perspective gently elevated front-three-quarter, very soft contact shadow only. Same cream, sage, powder peach, caramel plush/felt handmade miniature art style as soft stuffed cats. NO animal characters. No letters, no numbers, no grids. EXACT objects row-major: Row1: (1) pale peach low ceramic food bowl filled brown kibble (2) powder blue low ceramic bowl with water (3) round cream fluffy pet cushion bed (4) sage-and-cream rounded pet travel carrier. Row2: (5) tall beige 3-level cat tower with platforms and enclosed cubby, fits entirely inside cell (6) compact tan scratching post on base (7) pale sage hooded litter box with sand tray visible (8) dusty pink soft fabric play tunnel. Row3: (9) coral rubber toy ball (10) feather wand with short string (11) little gray felt toy mouse (12) mustard knotted tug rope. Row4: (13) cream food pouch with simple paw symbol (14) assortment of three pastel snack sachets with tiny treat shapes beside them (15) glass jar of green dried catnip leaves with cork lid (16) small wooden grooming brush with cream bristles. Assets must look volumetric, soft, cohesive, collectible, like miniature furniture and objects for plush pets. Alpha transparency outside all objects.

## items-extra-v2

사용 파일: dist/assets/items-extra-v2.png

최종 프롬프트:

Create one transparent PNG game prop sprite atlas matching the attached plush toy game art. Soft felt fabric and embroidery, rounded miniature 3D objects, warm cream/caramel/sage/coral palette, gentle diffuse light from upper left. Exactly a 4 columns by 4 rows GRID, sixteen equally sized SQUARE cells, one complete centered isolated prop per cell. Every prop fully within its cell with at least 15% transparent margin. NO floor, NO background, NO text, NO numbers, NO labels. Fixed three-quarter slightly elevated camera for every object. Consistent orthographic dollhouse scale and studio lighting. Contents in reading order: row 1 column 1 upright cream kibble food pouch with small paw emblem; column 2 sage green roll of dog poop bags; column 3 flat square white absorbent puppy pad with pale blue border; column 4 small sage cleaning spray bottle beside folded cream cleaning cloth. Row 2 column 1 coral dog harness with attached coiled leash; column 2 beige sack of cat litter with tiny blue pebble emblem; column 3 flat round green and yellow shaggy felt sniffing snuffle mat; column 4 mustard yellow flat circular dog puzzle board with exactly three coral sliding lids. Row 3 column 1 soft cream and sage plush igloo pet hideout with open entrance and cushion, clearly not a transport carrier; column 2 peach open bag of cubed freeze-dried chicken treats with two pale beige cubes next to it; column 3 pale blue open bag of freeze-dried fish treats with tiny cream fish-shape treats next to it; column 4 three slim coral and cream squeezable lickable cat treat sticks, laid diagonally. Row 4 column 1 short clear jar with sage lid filled with small tan training snack bites; column 2 three pale caramel dog dental chew sticks with ridged ends; column 3 small open cream pouch of tiny star-shaped crunchy biscuits; column 4 turquoise felt textured exploration toy ball with soft multicolored fabric tabs. Important: clean true alpha TRANSPARENT background everywhere outside the 16 separate props; keep each prop comfortably inside its own equal grid cell. Do not include the cat character. This is a production game sprite sheet, not an infographic.

