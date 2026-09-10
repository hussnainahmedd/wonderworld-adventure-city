# WonderWorld Architecture

## Runtime layers

- `client/src/App.tsx` renders the game shell only.
- `client/src/components/GameCanvas.tsx` owns the React HUD, panels, responsive layout, and the Babylon engine lifecycle.
- `client/src/game/scene.ts` is framework-agnostic gameplay and scene construction. It owns the town, player, pet follower, collectibles, controls, quest signals, and camera.
- Custom window events form a small bridge between the DOM HUD and game world: `ww-action`, `ww-coins`, `ww-quest-progress`, and `ww-toast`.

## Scene composition

The scene uses a single ArcRotateCamera, hemisphere + directional lights, a green island ground, a town plaza, procedural buildings, a fountain landmark, road strips, forest trees, beach/ocean meshes, a mountain silhouette, a player explorer, a pet, spinning Wonder Coins, and Lost Star rings.

## Future expansion seams

- Replace custom events with an EventBus and persisted player profile.
- Move quests, items, pets, and daily rewards into data modules.
- Add auth/database through the WebDev `web-db-user` upgrade when online profiles are required.
- Add a multiplayer transport layer around the existing player and zone state without changing the HUD contract.
