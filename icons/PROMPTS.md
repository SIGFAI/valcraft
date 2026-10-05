# ValCraft replacement icons: prompts

Original 16x16 item icons for the 20 ValCraft textures that upstream makes from Valheim's own icons
(`tools/pixelize_icons.py` at v0.6.2). Same subjects, new art: designed by fal and Claude, never traced from or
compared against Valheim's or ValCraft's icons. Generated 2026-10-05.

- Model: `fal-ai/flux/dev` (sync `https://fal.run/fal-ai/flux/dev`), 512x512, `num_images: 2`,
  `num_inference_steps: 28`, `guidance_scale: 3.5`, safety checker on. Seed 1005 (round 1), 2026 (round 2).
- 46 images in 23 calls; fal price $0.025 per megapixel, 0.26 MP per image: about $0.30 (at most $1.15 if fal
  rounds each image up to 1 MP). Well inside the $5 per-mod budget of `machine/fal-budget`.
- Shrunk to 16x16 by `make_icons.py` (background flood fill, crop, box shrink to 14x14, median-cut palette,
  1-pixel dark outline). `hard_antler` and `kindled_ribs` are drawn by hand in `make_icons.py` (Claude): the fal
  results did not read at 16x16.
- The 512x512 fal images are not committed (size); rerunning the prompts with the same seeds gives them back.

Prompt = the style with `{subject}` replaced:

```
a single Minecraft-style inventory item icon, chunky 16x16 pixel art sprite scaled up, {subject}, centered, fills most of the frame, bold dark 1-pixel outline, flat blocky shading with 5 to 8 colours, plain pure white background, no text, no shadow, no frame
```

| Texture (`assets/valcraft/textures/item/`) | Subject | Seed | Used |
|---|---|---|---|
| `ancient_seed.png` | a big knobbly seed pod with a dark brown bark husk cracked open showing a faint green glow inside | 1005 | image 1 |
| `bell.png` | an old tarnished bronze bell with green patina and a small iron hanging loop | 1005 | image 1 |
| `bell_fragment.png` | a jagged broken shard of a bronze bell, curved metal piece with green patina edges | 1005 | image 0 |
| `swamp_key.png` | a heavy old iron key with a round bow and chunky teeth, dark grey metal with mossy green rust spots | 1005 | image 0 |
| `dragon_egg.png` | a large oval dragon egg, pale icy blue shell with white frost speckles | 1005 | image 1 |
| `dragon_tear.png` | a teardrop-shaped glowing crimson red crystal gem with a bright highlight | 1005 | image 1 |
| `kindled_ribs.png` | round 1: a curved burning rib bone, charred black bone with glowing orange ember cracks | 1005 | no |
| `kindled_ribs.png` | round 2: three curved rib bones joined at a spine piece, charred black bone with glowing orange ember cracks and small flames | 2026 | no: drawn by hand |
| `hard_antler.png` | round 1: a single large dark brown deer antler with three sharp pointed tines | 1005 | no |
| `hard_antler.png` | round 2: one single detached dark brown antler lying diagonally, a thick curved beam with three sharp pointed tines, no head, no animal | 2026 | no: drawn by hand |
| `majestic_carapace.png` | a glossy curved insect shell plate, deep teal and violet chitin with a light rim | 1005 | image 1 |
| `sealbreaker.png` | a round bronze rune disc key with engraved lines and a small glowing cyan core | 1005 | image 0 |
| `sealbreaker_fragment.png` | a broken wedge-shaped piece of a bronze rune disc with a thin glowing cyan line | 1005 | image 1 |
| `bonemass_trophy.png` | a mounted trophy head of a bloated swamp monster, sickly green slimy skull with dripping ooze | 1005 | image 1 |
| `moder_trophy.png` | a mounted trophy head of a frost dragon, pale blue-white scaly head with two swept-back horns | 1005 | image 1 |
| `eikthyr_trophy.png` | a mounted trophy head of a giant stag, dark brown fur with huge branching antlers crackling with blue lightning | 1005 | image 1 |
| `fader_trophy.png` | a mounted trophy skull of a fire dragon, black horned skull with glowing orange ember cracks | 1005 | image 1 |
| `yagluth_trophy.png` | a mounted trophy skull of a horned goblin king wearing a rusty iron crown, charred grey bone | 1005 | image 0 |
| `queen_trophy.png` | a mounted trophy head of a giant insect queen, purple chitin head with curved mandibles and teal eyes | 1005 | image 1 |
| `elder_trophy.png` | a mounted trophy head of an ancient tree giant, brown bark face with a mossy green beard and glowing eyes | 1005 | image 0 |
| `withered_bone.png` | a single dry cracked old bone, grey-brown with darker cracks | 1005 | image 0 |
| `torn_spirit.png` | round 1: a torn wisp of ghostly cloth, glowing pale blue-white tattered ribbon | 1005 | no |
| `torn_spirit.png` | round 2: a torn wisp of ghostly cloth floating diagonally, glowing pale blue-white tattered ribbon with ragged ends, translucent | 2026 | image 1 |
