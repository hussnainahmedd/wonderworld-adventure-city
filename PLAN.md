# WonderWorld: Adventure City — Vertical Slice Plan

## Scope
Build a complete, original, family-friendly browser-playable vertical slice inspired by social sandbox adventures without copying any protected IP. The slice targets Android landscape interaction and is structured so online systems can be added later.

## Risk slices
1. **3D scene lifecycle:** Babylon.js runs through a React-owned canvas with strict cleanup and a stable render loop.
2. **Touch-first play:** DOM HUD provides a virtual movement pad, large buttons, and keyboard fallback for desktop testing.
3. **Repeatable progression:** deterministic quests, collectibles, rewards, pets, outfits, and three mini-game loops use clear, non-gambling progression.
4. **Visual cohesion:** procedural low-poly geometry is paired with a generated WonderWorld art-direction backdrop.

## Verification criteria
- The preview opens into a readable WonderTown scene with fountain, buildings, forest, beach, mountain, collectibles, player, and pet.
- WASD/arrow controls move the explorer, Space hops, and the virtual pad moves the player.
- Coins and Lost Stars visibly update when the player collects them.
- Quest Board, Mini-Games, Style Studio, Cozy Home, and travel map panels are playable.
- `pnpm check` and `pnpm build` pass.
- Screenshot verification confirms the game reads as a finished mobile-oriented experience.

## Asset assignments
- WonderWorld generated reference/backdrop: `/manus-storage/wonderworld-reference_9853872f.png` — used as the branded art wash behind the 3D scene.
- All world props are intentionally lightweight procedural meshes to preserve low/mid-range device performance.
