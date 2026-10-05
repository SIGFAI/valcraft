# ValCraft

Play Valheim as a Minecraft player: Minecraft runs alongside and drives movement, inventory, blocks and combat inside Valheim's world (BepInEx plugin + Fabric mod).

**ValCraft is made by [LoAlCo](https://github.com/LoAlCo).** All credit for the mod goes to them. It is built on [chasmlol/SkyCraft](https://github.com/chasmlol/SkyCraft) by chasmlol.

- Original project: https://github.com/LoAlCo/ValCraft
- Report bugs and ask questions there: https://github.com/LoAlCo/ValCraft/issues
- Upstream release packaged here: [v0.6.2](https://github.com/LoAlCo/ValCraft/releases/tag/v0.6.2) (commit [`cf1b4fc`](https://github.com/LoAlCo/ValCraft/tree/cf1b4fcfc34fb5231762296a99be936b1b065505))

> **Beta.** Nobody at SIGF has played this build yet. Back up your saves.
> Bugs in the mod itself go to the author's issue tracker above; problems with the one-click install go to this repository's issues.

## What you need

- **Valheim** ([Steam](https://store.steampowered.com/app/892970/)): current Steam build (upstream pins none).
- **Minecraft**: Java Edition 26.3.
- Windows and the [SIGF app](https://sigf.ai). The app installs bepinexpack-valheim 5.4.2350, fabric-loader 0.19.5, fabric-api 0.161.0+26.3 for you.

## Install

In the SIGF app, open **ValCraft** in the catalog, press **Install**, then **Play**. **Restore** puts your game folders back exactly as they were.
The app follows `mashup.json` in this repository: every download is pinned by sha256. The files come from the release [`v0.6.2`](../../releases/tag/v0.6.2) and, for `LoAlCo-ValCraft-0.6.2.zip`, from the author's own release.

### Good to know

- You need Valheim on Steam (Windows) and Minecraft: Java Edition. About 3 GB of extra RAM: both games run at once.
- Press Play: Minecraft starts first as the app's own Prism instance "sigf-valcraft" (ValCraft's Fabric mod, Minecraft 26.3, Java 25), then Valheim. Minecraft's window stays visible (minimise it); load a Valheim world and Minecraft links up and drives your character.
- BepInExPack_Valheim 5.4.2350, ValCraft 0.6.2 and a ValCraft setting are installed into the Valheim folder, ValCraft downloaded from the author's own release; Restore removes them. The setting (StartWithValheim = false) stops the plugin from starting a second Minecraft of its own.
- The valcraft-sigf-icons resource pack is on by default: original SIGF icons for ValCraft's boss items and trophies (Options > Resource Packs).
- Multiplayer is experimental upstream (0.6.2): the first ValCraft player opens their Minecraft world through the e4mc relay and the link goes to the others over Valheim. Windows asks once to let Java through the firewall.
- Beta, experimental upstream: known gaps include no Nether/End portals, some items missing and falling through craters. Report bugs to the author on the upstream issue tracker.

## Icons

ValCraft makes 20 of its item icons from Valheim's own icons (`tools/pixelize_icons.py` upstream). Our resource pack `valcraft-sigf-icons`, in `valcraft.mrpack` and turned on by default, covers exactly those 20 with original 16x16 icons of the same subjects, made by SIGF (fal + Claude) without tracing or comparing with Valheim's or ValCraft's art. Prompts, seeds and the script are in `icons/` (`icons/PROMPTS.md`). The author's jar is downloaded unchanged, so the original textures are still inside it: the pack replaces them on screen, and turning it off in Options > Resource Packs shows them again.

## What this repository holds

ValCraft has no license, so SIGF may not rehost it. This repository holds **only SIGF's own files**, never the author's:

1. This README, `THIRD-PARTY.md`, `icons/` (the source of our icon pack: the icons, `PROMPTS.md` provenance and `make_icons.py`; MIT), `sigf/` (the script that built the recipe, for reference) and `mashup.json` (the SIGF app recipe).
2. Not here: `LoAlCo-ValCraft-0.6.2.zip` (sha256 `b57a0b85c848e57e249dcbeecd03d52cc054286eaf2a32f415e4e32a51a38445`). The app downloads it on the player's demand from the author's release, as released: https://github.com/LoAlCo/ValCraft/releases/download/v0.6.2/LoAlCo-ValCraft-0.6.2.zip
3. The release `v0.6.2`:

| Asset | Size | sha256 | What it is |
|---|---|---|---|
| `denikson-BepInExPack_Valheim-5.4.2350.zip` | 706129 B | `37a91c000b4e88f2ed7a4bd7d812239852d2e36cbf0ff0a9f5faacfba46b105f` | BepInExPack_Valheim 5.4.2350 (BepInEx 5.4.23.5 configured for Valheim by Azumatt, Vapok and Margmas), the Thunderstore file, unchanged (see THIRD-PARTY.md); its `BepInExPack_Valheim/` folder goes into the Valheim folder. |
| `valcraft-sigf-config.zip` | 419 B | `9da08c63be50a405cfae18b42ef196e549829a6da4c9ca3b65b571af6ffdbc13` | ours: `BepInEx/config/loalco.valcraft.cfg` with `[Minecraft] StartWithValheim = false`, so ValCraft uses the app's Minecraft instead of unpacking and starting its own. |
| `valcraft.mrpack` | 9199 B | `23ce409a5c8ec8a0d01ecfbbd781638fd4bc537b28c3e7d83f942bb506399fcf` | the Minecraft side for Minecraft 26.3 with Fabric Loader 0.19.5: a download link to the author's `valcraft-fabric-0.6.2.jar` (the author's release, pinned by sha1/sha512, not stored here), Fabric API 0.161.0+26.3 and e4mc 6.2.2 from Modrinth (links), and ours: the `valcraft-sigf-icons` resource pack, an `options.txt` turning it on, its MIT license. |

The sha256 of every file inside the zips is in `mashup.json` (`contents`).

## Licenses

| Part | License | Where |
|---|---|---|
| ValCraft (`LoAlCo-ValCraft-0.6.2.zip`, `valcraft-fabric-0.6.2.jar`, the author's release files) | no license: all rights reserved by LoAlCo. Not stored here; the app downloads them from the author's release | https://github.com/LoAlCo/ValCraft |
| BepInExPack_Valheim 5.4.2350 (release asset) | MIT (BepInEx, the Valheim changes, HarmonyX, MonoMod, Mono.Cecil); UnityDoorstop LGPL-2.1 | `THIRD-PARTY.md` |
| `valcraft-sigf-icons`, `valcraft-sigf-config.zip`, `icons/` (ours) | MIT | `licenses/valcraft-sigf-icons.txt` in `valcraft.mrpack` |
| Fabric API, e4mc (downloaded from Modrinth by the app, not stored here) | Apache-2.0, MIT | https://modrinth.com/mod/fabric-api, https://modrinth.com/mod/e4mc |

## Why this repository exists

The SIGF app (https://sigf.ai) installs mods from recipes (`mashup.json`) whose downloads are pinned release files. This repository makes ValCraft installable in one click, credited to LoAlCo. If you are the author and want anything changed or taken down, open an issue here.
