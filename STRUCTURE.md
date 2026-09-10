# WonderWorld Architecture

The runtime is split into a React frame, Babylon canvas, and framework-agnostic gameplay module. `client/src/components/GameCanvas.tsx` owns the HUD, panels, responsive touch controls, and the React lifecycle. `client/src/game/scene.ts` owns the 100m x 76m world, regions, player, pet, NPCs, collectibles, camera, movement, fast travel, day-light cycle, local save state, XP, levels, dialogue, and event-driven progression.

The six world regions are spatially connected on one ground plane. WonderTown is the central hub; Adventure Forest, Sunny Beach, Sky Mountain, Fun Park, and Mystery Valley sit around it and are connected with roads, bridges, boardwalks, trails, and river crossings. Mystery Valley is gated by the player level and is represented in the world with glowing flora, ruins, arches, and gem collectibles.

The DOM/Babylon bridge uses these semantic events: `ww-action` for movement, fast travel, interaction, jump, sprint, rewards, and outfit changes; `ww-coins`, `ww-profile`, `ww-region`, `ww-collectibles`, `ww-dialogue`, `ww-level-up`, and `ww-toast` for state updates. LocalStorage persists level, XP, coins, region, collectible counters, unlocked regions, and daily state.

The next architectural seam for native production is to move save/profile state into a backend profile service and replace the event bridge with a typed event bus. Multiplayer can then layer on top of the existing player and region state without rewriting the HUD.
