// ValCraft (LoAlCo, no repo license): play Valheim as a Minecraft player. A BepInEx plugin in Valheim and a Fabric mod
// in Minecraft 26.3 (forked from SkyCraft), linked over shared memory (Local\ValCraft_v1).
// No license, so upstream fetch (PLATFORM-SPEC section 4, "Upstream fetch"): LoAlCo-ValCraft-0.6.2.zip and
// valcraft-fabric-0.6.2.jar are downloaded by the app from the author's v0.6.2 release as released, never rehosted.
// The jar is a download entry of our .mrpack (github.com is a valid mrpack download host). ValCraft's installer is not
// used (it downloads unpinned mod managers). SIGFAI/valcraft hosts the recipe and our own files:
//   - denikson-BepInExPack_Valheim-5.4.2350.zip: the Thunderstore pack upstream depends on, unchanged (BepInEx 5.4.23.5
//     LGPL-2.1 with Valheim's config and AzumattDev's preloader changes, MIT; Harmony/HarmonyX/MonoMod/Cecil MIT).
//   - valcraft-sigf-config.zip: BepInEx/config/loalco.valcraft.cfg with StartWithValheim = false (see below).
//   - valcraft.mrpack: Minecraft 26.3 + Fabric Loader 0.19.5, the upstream jar, Fabric API and e4mc from Modrinth, and
//     our resource pack valcraft-sigf-icons (library/valcraft/icons), enabled through overrides/options.txt.
//
// The jar's ~20 boss item / trophy textures are 16x16 shrinks of Valheim's own icons (upstream tools/pixelize_icons.py),
// i.e. ripped (library/QC.md section 2). We cannot repack the jar (no license, installed as released), so our
// resource pack draws original fal/Claude icons over the same asset paths. The jar on disk still holds the originals.
//
// The plugin starts Minecraft itself in Awake (Launcher.cs) unless a Minecraft with the ValCraft mod already holds the
// mutex Local\ValCraft_v1_minecraft; the app starts its own instance only seconds earlier, before the mod is loaded,
// so the plugin would unpack its bundled Prism to %LOCALAPPDATA%\ValCraft and start a second Minecraft. The config
// turns that off (upstream's own setting: "Off: start it yourself, any way you like; it connects on its own").
//   node library/valcraft/build.mjs       (outputs: library/lib.mjs; no app fixture: no new test fixtures)
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mrpack, resolveFabricApi } from '../../orchestrator/src/recipe.js';
import { instanceName } from '../../orchestrator/scripts/package-fusion.mjs';
import { asset, card, dl, emit, pinned, zipAsset } from '../lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const UP = {
  repo: 'https://github.com/LoAlCo/ValCraft', tag: 'v0.6.2', commit: 'cf1b4fcfc34fb5231762296a99be936b1b065505',
  authors: ['LoAlCo'],
  zip: { file: 'LoAlCo-ValCraft-0.6.2.zip', sha256: 'b57a0b85c848e57e249dcbeecd03d52cc054286eaf2a32f415e4e32a51a38445' }, // = GitHub digest
  jar: { file: 'valcraft-fabric-0.6.2.jar', sha256: 'f89ce376597471bfde6c668187593ba4908639a89fb2aeb55cb3c7ce44eec53e' }, // = GitHub digest
};
const SKYCRAFT = { repo: 'https://github.com/chasmlol/SkyCraft', license: 'MIT', authors: ['chasmlol'] };
// Upstream manifest.json: "denikson-BepInExPack_Valheim-5.4.2350". Thunderstore's file, rehosted unchanged.
const BEPV = {
  id: 'bepinexpack-valheim', version: '5.4.2350', file: 'denikson-BepInExPack_Valheim-5.4.2350.zip',
  url: 'https://thunderstore.io/package/download/denikson/BepInExPack_Valheim/5.4.2350/',
  page: 'https://thunderstore.io/c/valheim/p/denikson/BepInExPack_Valheim/',
  sha256: '37a91c000b4e88f2ed7a4bd7d812239852d2e36cbf0ff0a9f5faacfba46b105f', // Thunderstore download, 2026-10-05
  repo: 'https://github.com/AzumattDev/BepInEx', commit: 'ef506e0a6bb98c49d85b7927b5ab625605826be0', // "Bump Thunderstore version to 5.4.2350"
  license: 'LGPL-2.1 (BepInEx 5.4.23.5) + MIT (Valheim changes, Harmony, MonoMod, Mono.Cecil)',
};
// fabric/gradle.properties at the tag; e4mc and Fabric API sha512 = upstream's pins (tools/package.py:38,42).
const MC = { mc: '26.3', loader: '0.19.5', fabricApi: '0.161.0+26.3', java: '25' };
const PINS = {
  fabricApi: 'ed6b2586d6fde11fde8472f5a527c51e99b67026e46f94d4bfd85e7e28ce5ee299173ee16ad576ceb51f39f98d30a811086a6deb1a86a524859cc16e12da109d',
  e4mc: '01ef0a8c5b76e2cb0effd337bad3350d8807d100d0ec661e01b2ffb20af7b652f756c5eaa11bee233c37905bfd7b573f7a85f3d15bfd2833962c76f02cd59a86',
};
const ID = 'valcraft', VERSION = '0.6.2', NAME = 'ValCraft';
const PACK = 'valcraft-sigf-icons';
const TAGLINE = 'Play Valheim as a Minecraft player: Minecraft runs alongside and drives movement, inventory, blocks and combat inside Valheim\'s world (BepInEx plugin + Fabric mod).';
const UA = { 'User-Agent': 'SIGFAI/mod-orchestrator (sigf.ai)' };
const hash = (algo, data) => crypto.createHash(algo).update(data).digest('hex');

/** One Modrinth file as an mrpack download entry, checked against upstream's sha512 pin. */
async function modrinth(project, version, sha512) {
  const q = `loaders=${encodeURIComponent('["fabric"]')}&game_versions=${encodeURIComponent(JSON.stringify([MC.mc]))}`;
  const res = await fetch(`https://api.modrinth.com/v2/project/${project}/version?${q}`, { headers: UA });
  if (!res.ok) throw new Error(`Modrinth ${project}: HTTP ${res.status}`);
  const v = (await res.json()).find(x => x.version_number === version);
  const f = v && (v.files.find(x => x.primary) ?? v.files[0]);
  if (!f) throw new Error(`Modrinth ${project} ${version} for ${MC.mc}: not found`);
  if (f.hashes.sha512 !== sha512) throw new Error(`Modrinth ${project} ${version}: not upstream's pinned file`);
  return { path: `mods/${f.filename}`, hashes: { sha1: f.hashes.sha1, sha512: f.hashes.sha512 }, env: { client: 'required', server: 'required' }, downloads: [f.url], fileSize: f.size };
}

/** Every file under dir as zip entries, paths relative with '/'. */
const tree = (dir, base = dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
  ? tree(path.join(dir, e.name), base)
  : [{ name: path.relative(base, path.join(dir, e.name)).replace(/\\/g, '/'), data: fs.readFileSync(path.join(dir, e.name)) }]);

const upRel = (f) => `${UP.repo}/releases/download/${UP.tag}/${f}`;
const plugin = asset(UP.zip.file, await pinned(upRel(UP.zip.file), UP.zip.sha256), { zipped: true, upstream: upRel(UP.zip.file) });
const jar = await pinned(upRel(UP.jar.file), UP.jar.sha256);
const bepv = asset(BEPV.file, await pinned(BEPV.url, BEPV.sha256, BEPV.file), { zipped: true });

const CFG = [
  '## SIGF: the app starts Minecraft (its Prism instance) before Valheim, so the plugin must not start its own.',
  '## Delete this file (or set true) to go back to ValCraft\'s bundled Minecraft.',
  '',
  '[Minecraft]',
  '',
  '## Start Minecraft (hidden) when Valheim starts. Off: start it yourself, any way you like; it connects on its own.',
  '# Setting type: Boolean',
  '# Default value: true',
  'StartWithValheim = false',
  '',
].join('\r\n');
const config = zipAsset(`${ID}-sigf-config.zip`, [{ name: 'BepInEx/config/loalco.valcraft.cfg', data: Buffer.from(CFG) }]);

// Our resource pack, from the committed files (library/valcraft/icons/pack, made by make_icons.py).
const iconsZip = zipAsset(`${PACK}.zip`, tree(path.join(here, 'icons', 'pack'))).data;
// options.txt of a fresh instance: only the pack list (above "fabric", the mods' resources) and the options format
// (26.3's data version, so no options data fixer runs). Minecraft fills in every other option with its default.
const OPTIONS = `version:5023\nresourcePacks:["vanilla","fabric","file/${PACK}.zip"]\n`;
const ICONS_TXT = [
  `${PACK}: original 16x16 item icons by SIGF (designed with fal and by Claude), MIT.`,
  'They replace, on screen, the 20 ValCraft item textures that upstream makes by shrinking Valheim\'s own icons',
  '(tools/pixelize_icons.py). Same asset paths (assets/valcraft/textures/item/), so the pack wins over the mod jar.',
  `Prompts and tool: https://github.com/SIGFAI/${ID} (library/valcraft/icons in the SIGF repo).`,
  '',
].join('\n');

const fabricApi = await resolveFabricApi(MC.fabricApi, MC.mc);
if (fabricApi?.download?.hashes?.sha512 !== PINS.fabricApi) throw new Error(`Fabric API ${MC.fabricApi}: not resolved on Modrinth, or not upstream's pinned file`);
const downloads = [
  { path: `mods/${UP.jar.file}`, hashes: { sha1: hash('sha1', jar), sha512: hash('sha512', jar) }, env: { client: 'required', server: 'required' },
    downloads: [upRel(UP.jar.file)], fileSize: jar.length },
  await modrinth('e4mc', '6.2.2-fabric-modern', PINS.e4mc),
];
const pack = asset(`${ID}.mrpack`, mrpack({ name: NAME, summary: TAGLINE, versions: MC, versionId: VERSION, fabricApi, downloads, jars: [],
  extra: [
    { name: `overrides/resourcepacks/${PACK}.zip`, data: iconsZip },
    { name: 'overrides/options.txt', data: Buffer.from(OPTIONS) },
    { name: `overrides/licenses/${PACK}.txt`, data: Buffer.from(ICONS_TXT) },
  ] }));
const assets = [bepv, plugin, config, pack];

const make = (urls, set) => {
  const mp = set.find(a => a.name.endsWith('.mrpack'));
  return {
    id: `sigf/${ID}`,
    version: VERSION,
    name: NAME,
    tagline: TAGLINE,
    kind: 'passthrough',
    games: [
      { game: 'valheim', role: 'host', label: 'Valheim', engine: 'Valheim (Unity, Mono) + BepInEx 5 plugin ValCraft (C#)', apps: { steam: '892970' }, runtime: 'current Steam build (upstream pins none)' },
      { game: 'minecraft', role: 'guest', label: 'Minecraft', mc: MC.mc, loader: `fabric@${MC.loader}`, java: MC.java },
    ],
    requires: [
      { id: BEPV.id, version: BEPV.version, license: `${BEPV.license}, shipped unchanged`, page: BEPV.page,
        note: 'the Valheim build of BepInEx that ValCraft depends on; installed into the game folder by the app', source: { url: urls[bepv.name], sha256: bepv.sha256 } },
      { id: 'fabric-loader', version: MC.loader },
      { id: 'fabric-api', version: MC.fabricApi, note: 'in the Minecraft pack (downloaded from Modrinth)' },
    ],
    install: [
      { game: 'valheim', strategy: 'game-dir-snapshot', loader: 'bepinex', files: [
        // Thunderstore layout: the pack's BepInExPack_Valheim/ folder is what goes into the Valheim folder.
        { src: bepv.name, dst: '{game}', root: 'BepInExPack_Valheim', unpack: true, contents: bepv.contents, ...dl(bepv, urls) },
        // Upstream file as released: plugins/ValCraft/ (ValCraft.dll, NOTICE.md, the unused ValCraft-Minecraft.zip
        // bundle) into BepInEx/plugins, Thunderstore's own placement. manifest/README/icon are checked, not written.
        { src: plugin.name, dst: '{game}/BepInEx/plugins', root: 'plugins', unpack: true, contents: plugin.contents, ...dl(plugin, urls) },
        { src: config.name, dst: '{game}', unpack: true, contents: config.contents, ...dl(config, urls) },
      ] },
      { game: 'minecraft', strategy: 'mrpack', pack: { src: mp.name, ...dl(mp, urls) } },
    ],
    // Minecraft first (the app's Prism instance), then Valheim through Steam: BepInEx loads through winhttp.dll.
    launch: [{ game: 'minecraft' }, { game: 'valheim', args: [] }],
    files: set.map(a => ({ name: a.name, ...dl(a, urls) })),
    source: {
      repo: UP.repo, license: 'No license (upstream) + LGPL-2.1, MIT', upstream_license: null, fetch: 'upstream', tag: UP.tag, commit: UP.commit,
      hosted: `https://github.com/SIGFAI/${ID}`, based_on: SKYCRAFT.repo,
      bundled: [
        { name: 'BepInExPack_Valheim', version: BEPV.version, repo: BEPV.repo, commit: BEPV.commit, license: BEPV.license },
        { name: `${PACK} (resource pack, original icons)`, version: VERSION, repo: `https://github.com/SIGFAI/${ID}`, license: 'MIT' },
      ],
    },
    media: {},
    built_by: { author: UP.authors[0], authors: [...UP.authors, ...SKYCRAFT.authors], packaged_by: 'SIGF' },
    idea_by: UP.authors[0],
    built_at: '2026-10-05T00:00:00.000Z',
    ...card(UP.repo),
    notes: [
      'You need Valheim on Steam (Windows) and Minecraft: Java Edition. About 3 GB of extra RAM: both games run at once.',
      `Press Play: Minecraft starts first as the app's own Prism instance "${instanceName(`sigf/${ID}`)}" (ValCraft's Fabric mod, Minecraft ${MC.mc}, Java ${MC.java}), then Valheim. Minecraft's window stays visible (minimise it); load a Valheim world and Minecraft links up and drives your character.`,
      'BepInExPack_Valheim 5.4.2350, ValCraft 0.6.2 and a ValCraft setting are installed into the Valheim folder, ValCraft downloaded from the author\'s own release; Restore removes them. The setting (StartWithValheim = false) stops the plugin from starting a second Minecraft of its own.',
      `The ${PACK} resource pack is on by default: original SIGF icons for ValCraft's boss items and trophies (Options > Resource Packs).`,
      'Multiplayer is experimental upstream (0.6.2): the first ValCraft player opens their Minecraft world through the e4mc relay and the link goes to the others over Valheim. Windows asks once to let Java through the firewall.',
      'Beta, experimental upstream: known gaps include no Nether/End portals, some items missing and falling through craters. Report bugs to the author on the upstream issue tracker.',
    ],
  };
};

emit({ slug: ID, version: VERSION, assets, fixtureAssets: null, make });
