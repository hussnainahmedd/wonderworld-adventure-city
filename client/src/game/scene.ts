import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export type GameHandle = { scene: Scene; dispose: () => void };

type ActionDetail = { type: string; value?: string };

type Materials = Record<string, StandardMaterial>;

function mat(scene: Scene, name: string, hex: string, roughness = 0.8) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.specularColor = new Color3(0.08, 0.1, 0.12);
  m.roughness = roughness;
  return m;
}

function emit(name: string, detail: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function box(scene: Scene, name: string, size: { w: number; h: number; d: number }, pos: Vector3, material: StandardMaterial, parent?: TransformNode) {
  const mesh = MeshBuilder.CreateBox(name, { width: size.w, height: size.h, depth: size.d }, scene);
  mesh.position = pos;
  mesh.material = material;
  if (parent) mesh.parent = parent;
  return mesh;
}

function tree(scene: Scene, materials: Materials, x: number, z: number, scale = 1) {
  const root = new TransformNode("tree-root", scene);
  root.position = new Vector3(x, 0, z);
  const trunk = MeshBuilder.CreateCylinder("tree-trunk", { diameter: 0.42 * scale, height: 1.8 * scale, tessellation: 8 }, scene);
  trunk.position.y = 0.9 * scale;
  trunk.material = materials.bark;
  trunk.parent = root;
  const canopy = MeshBuilder.CreateSphere("tree-canopy", { diameter: 2.3 * scale, segments: 8 }, scene);
  canopy.position.y = 2.15 * scale;
  canopy.material = materials.leaf;
  canopy.parent = root;
  const canopy2 = MeshBuilder.CreateSphere("tree-canopy-small", { diameter: 1.6 * scale, segments: 8 }, scene);
  canopy2.position.set(0.55 * scale, 2.7 * scale, 0.1 * scale);
  canopy2.material = materials.leaf2;
  canopy2.parent = root;
  return root;
}

function building(scene: Scene, materials: Materials, x: number, z: number, color: StandardMaterial, labelColor: StandardMaterial, scale = 1) {
  const root = new TransformNode("building", scene);
  root.position = new Vector3(x, 0, z);
  box(scene, "building-body", { w: 3.2 * scale, h: 2.4 * scale, d: 2.8 * scale }, new Vector3(0, 1.2 * scale, 0), color, root);
  const roof = MeshBuilder.CreateCylinder("building-roof", { diameter: 3.5 * scale, height: 0.75 * scale, tessellation: 4 }, scene);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 2.72 * scale;
  roof.material = labelColor;
  roof.parent = root;
  box(scene, "door", { w: 0.55 * scale, h: 1.05 * scale, d: 0.12 * scale }, new Vector3(0, 0.55 * scale, -1.44 * scale), materials.door, root);
  [-0.9, 0.9].forEach((wx) => box(scene, "window", { w: 0.5 * scale, h: 0.55 * scale, d: 0.1 * scale }, new Vector3(wx * scale, 1.5 * scale, -1.44 * scale), materials.window, root));
  return root;
}

function createPlayer(scene: Scene, materials: Materials) {
  const root = new TransformNode("explorer", scene);
  root.position = new Vector3(0, 0, 5.5);
  const feet = box(scene, "explorer-feet", { w: 0.72, h: 0.25, d: 0.48 }, new Vector3(0, 0.14, 0), materials.shoes, root);
  feet.rotation.y = Math.PI / 2;
  const body = MeshBuilder.CreateCapsule("explorer-body", { height: 1.25, radius: 0.43, tessellation: 8 }, scene);
  body.position.y = 1.02;
  body.material = materials.shirt;
  body.parent = root;
  const head = MeshBuilder.CreateSphere("explorer-head", { diameter: 0.9, segments: 12 }, scene);
  head.position.y = 1.95;
  head.material = materials.skin;
  head.parent = root;
  const hair = MeshBuilder.CreateSphere("explorer-hair", { diameter: 0.94, segments: 12 }, scene);
  hair.scaling.y = 0.52;
  hair.position.set(0, 2.3, 0.02);
  hair.material = materials.hair;
  hair.parent = root;
  const backpack = box(scene, "explorer-backpack", { w: 0.68, h: 0.82, d: 0.25 }, new Vector3(0, 1.15, 0.46), materials.backpack, root);
  backpack.rotation.x = -0.08;
  const eye1 = MeshBuilder.CreateSphere("eye", { diameter: 0.11 }, scene);
  eye1.position.set(-0.18, 2, -0.4);
  eye1.material = materials.eye;
  eye1.parent = root;
  const eye2 = eye1.clone("eye2");
  if (eye2) { eye2.position.x = 0.18; eye2.parent = root; }
  return root;
}

function createPet(scene: Scene, materials: Materials) {
  const root = new TransformNode("pet", scene);
  root.position = new Vector3(1.45, 0, 6.15);
  const body = MeshBuilder.CreateSphere("pet-body", { diameter: 0.9, segments: 10 }, scene);
  body.scaling.y = 0.72;
  body.position.y = 0.52;
  body.material = materials.pet;
  body.parent = root;
  const head = MeshBuilder.CreateSphere("pet-head", { diameter: 0.78, segments: 10 }, scene);
  head.position.set(0, 1.02, -0.03);
  head.material = materials.pet;
  head.parent = root;
  [-0.3, 0.3].forEach((x) => {
    const ear = MeshBuilder.CreateCylinder("pet-ear", { diameter: 0.25, height: 0.36, tessellation: 6 }, scene);
    ear.position.set(x, 1.4, 0);
    ear.rotation.z = x < 0 ? -0.3 : 0.3;
    ear.material = materials.petAccent;
    ear.parent = root;
  });
  return root;
}

function coin(scene: Scene, materials: Materials, pos: Vector3) {
  const c = MeshBuilder.CreateCylinder("wonder-coin", { diameter: 0.48, height: 0.12, tessellation: 16 }, scene);
  c.rotation.x = Math.PI / 2;
  c.position = pos;
  c.material = materials.coin;
  return c;
}

function star(scene: Scene, materials: Materials, pos: Vector3) {
  const s = MeshBuilder.CreateTorus("lost-star", { diameter: 0.48, thickness: 0.14, tessellation: 8 }, scene);
  s.position = pos;
  s.rotation.x = Math.PI / 2;
  s.material = materials.star;
  return s;
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.54, 0.82, 0.98, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.012;
  scene.fogColor = new Color3(0.54, 0.82, 0.98);

  const materials: Materials = {
    grass: mat(scene, "grass", "#8bdc9b"),
    plaza: mat(scene, "plaza", "#f5d9c3"),
    road: mat(scene, "road", "#a7c1cf"),
    water: mat(scene, "water", "#49c8df", 0.25),
    bark: mat(scene, "bark", "#9a674b"),
    leaf: mat(scene, "leaf", "#49b97e"),
    leaf2: mat(scene, "leaf2", "#8bdc86"),
    coral: mat(scene, "coral", "#f08f7c"),
    mint: mat(scene, "mint", "#83d8c4"),
    yellow: mat(scene, "yellow", "#ffd36a"),
    purple: mat(scene, "purple", "#a894df"),
    door: mat(scene, "door", "#416176"),
    window: mat(scene, "window", "#a9eff3", 0.2),
    coin: mat(scene, "coin", "#ffd24d", 0.3),
    star: mat(scene, "star", "#fff2a1", 0.2),
    snow: mat(scene, "snow", "#f4fbff"),
    shirt: mat(scene, "shirt", "#2db6aa"),
    shoes: mat(scene, "shoes", "#f2a661"),
    skin: mat(scene, "skin", "#f1b58a"),
    hair: mat(scene, "hair", "#634a55"),
    backpack: mat(scene, "backpack", "#f1bd44"),
    eye: mat(scene, "eye", "#23334c"),
    pet: mat(scene, "pet", "#e8995d"),
    petAccent: mat(scene, "petAccent", "#f7d1a2"),
    white: mat(scene, "white", "#ffffff"),
  };

  const hemi = new HemisphericLight("sunny-fill", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.62;
  hemi.diffuse = new Color3(1, 0.94, 0.84);
  const sun = new DirectionalLight("sun", new Vector3(-0.45, -1, 0.55), scene);
  sun.position = new Vector3(-15, 24, -18);
  sun.intensity = 0.72;

  const camera = new ArcRotateCamera("camera", -Math.PI / 2.1, 1.08, 25, new Vector3(0, 1.4, 0), scene);
  camera.lowerRadiusLimit = 19;
  camera.upperRadiusLimit = 32;
  camera.lowerBetaLimit = 0.72;
  camera.upperBetaLimit = 1.35;
  camera.wheelPrecision = 120;
  camera.attachControl(canvas, true);

  const ground = MeshBuilder.CreateGround("wonderworld-ground", { width: 42, height: 30, subdivisions: 2 }, scene);
  ground.material = materials.grass;
  const plaza = MeshBuilder.CreateGround("town-plaza", { width: 17, height: 14 }, scene);
  plaza.position.y = 0.015;
  plaza.material = materials.plaza;
  const roadH = box(scene, "road-h", { w: 40, h: 0.04, d: 1.6 }, new Vector3(0, 0.02, 1), materials.road);
  const roadV = box(scene, "road-v", { w: 1.6, h: 0.04, d: 29 }, new Vector3(-5, 0.025, 0), materials.road);
  roadH.material = materials.road; roadV.material = materials.road;

  const fountainBase = MeshBuilder.CreateCylinder("fountain-base", { diameter: 4.1, height: 0.55, tessellation: 24 }, scene);
  fountainBase.position.set(0, 0.28, 0.2); fountainBase.material = materials.white;
  const fountainWater = MeshBuilder.CreateCylinder("fountain-water", { diameter: 3.45, height: 0.12, tessellation: 24 }, scene);
  fountainWater.position.set(0, 0.59, 0.2); fountainWater.material = materials.water;
  const fountainStem = MeshBuilder.CreateCylinder("fountain-stem", { diameter: 0.55, height: 1.2, tessellation: 12 }, scene);
  fountainStem.position.set(0, 1.15, 0.2); fountainStem.material = materials.mint;
  const fountainGem = MeshBuilder.CreateSphere("fountain-gem", { diameter: 0.65, segments: 8 }, scene);
  fountainGem.position.set(0, 1.85, 0.2); fountainGem.material = materials.star;

  building(scene, materials, -8, -3.7, materials.coral, materials.yellow, 1.05);
  building(scene, materials, -8.5, 5.5, materials.mint, materials.purple, 0.88);
  building(scene, materials, 7.5, -4.2, materials.yellow, materials.coral, 0.95);
  building(scene, materials, 7.8, 5.3, materials.purple, materials.mint, 0.9);

  // Forest zone
  [-15, -12, -9, -14, -11, -7].forEach((x, i) => tree(scene, materials, x, -8.5 + (i % 2) * 1.8, 0.9 + (i % 3) * 0.12));
  [-16, -13, -10].forEach((x, i) => tree(scene, materials, x, 9 + (i % 2) * 1.4, 1.0));
  // Beach zone
  const beach = MeshBuilder.CreateGround("sunny-beach", { width: 14, height: 8 }, scene);
  beach.position.set(13, 0.02, -5.5); beach.material = materials.yellow;
  const ocean = MeshBuilder.CreateGround("ocean", { width: 18, height: 8 }, scene);
  ocean.position.set(16, 0, 4.5); ocean.material = materials.water;
  [11, 15, 18].forEach((x, i) => tree(scene, materials, x, -8.5 + i * 0.9, 0.8));
  // Mountain silhouette
  const mountain = MeshBuilder.CreateCylinder("sky-mountain", { diameter: 8.5, height: 5.5, tessellation: 4 }, scene);
  mountain.position.set(14, 2.6, 10); mountain.rotation.y = Math.PI / 4; mountain.material = materials.purple;
  const snowcap = MeshBuilder.CreateCylinder("snow-cap", { diameter: 4.4, height: 1.6, tessellation: 4 }, scene);
  snowcap.position.set(14, 6.1, 10); snowcap.rotation.y = Math.PI / 4; snowcap.material = materials.snow;
  // Park trees & benches
  [2.5, 5, 7.5].forEach((x) => tree(scene, materials, x, 9.8, 0.7));
  box(scene, "bench-seat", { w: 2.2, h: 0.22, d: 0.6 }, new Vector3(3, 0.8, 4.5), materials.bark);
  box(scene, "bench-back", { w: 2.2, h: 0.75, d: 0.15 }, new Vector3(3, 1.1, 4.75), materials.bark);

  const player = createPlayer(scene, materials);
  const pet = createPet(scene, materials);
  camera.lockedTarget = player;

  const coins = [new Vector3(-4, 0.45, -1.2), new Vector3(4, 0.45, -1.2), new Vector3(2.7, 0.45, 5.7), new Vector3(-2.6, 0.45, 6.5), new Vector3(9.5, 0.45, -2.1), new Vector3(13, 0.45, -4.4)];
  const coinMeshes = coins.map((p) => coin(scene, materials, p));
  const stars = [new Vector3(-10.3, 1.15, -6.8), new Vector3(-13.2, 1.2, -7.9), new Vector3(-15.1, 1.15, 8.2), new Vector3(-10.1, 1.1, 9.5), new Vector3(-6.8, 1.2, -8.2)].map((p) => star(scene, materials, p));

  const keys = new Set<string>();
  let jumpTime = 0;
  let totalCoins = 620;
  let starsFound = 0;
  let disposed = false;
  let speed = 3.6;
  const onKeyDown = (e: KeyboardEvent) => { keys.add(e.key.toLowerCase()); if (e.key === " ") jumpTime = 0.42; };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const onAction = (event: Event) => {
    const detail = (event as CustomEvent<ActionDetail>).detail;
    if (!detail) return;
    if (detail.type === "move") {
      const dx = Number(detail.value?.split(",")[0] ?? 0);
      const dz = Number(detail.value?.split(",")[1] ?? 0);
      player.position.x += dx * 0.45;
      player.position.z += dz * 0.45;
    }
    if (detail.type === "teleport") {
      const spots: Record<string, Vector3> = { town: new Vector3(0, 0, 5.5), forest: new Vector3(-11, 0, -7), beach: new Vector3(12, 0, -5), mountain: new Vector3(14, 0, 9) };
      const spot = spots[detail.value ?? "town"] ?? spots.town;
      player.position.copyFrom(spot);
      emit("ww-toast", { message: `Welcome to ${detail.value === "forest" ? "Adventure Forest" : detail.value === "beach" ? "Sunny Beach" : detail.value === "mountain" ? "Sky Mountain" : "WonderTown"}!` });
    }
    if (detail.type === "outfit") {
      const outfit = detail.value ?? "teal";
      materials.shirt.diffuseColor = Color3.FromHexString(outfit === "coral" ? "#f08f7c" : outfit === "sunny" ? "#ffd36a" : "#2db6aa");
      emit("ww-toast", { message: "Outfit updated! Looking brilliant, Explorer." });
    }
    if (detail.type === "reward") {
      const amount = Number(detail.value ?? 50);
      totalCoins += amount;
      emit("ww-coins", { coins: totalCoins });
    }
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("ww-action", onAction);
  emit("ww-coins", { coins: totalCoins });
  emit("ww-world-ready", { ready: true });

  const observer = scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
    const move = new Vector3(0, 0, 0);
    if (keys.has("w") || keys.has("arrowup")) move.z -= 1;
    if (keys.has("s") || keys.has("arrowdown")) move.z += 1;
    if (keys.has("a") || keys.has("arrowleft")) move.x -= 1;
    if (keys.has("d") || keys.has("arrowright")) move.x += 1;
    if (move.lengthSquared() > 0) {
      move.normalize().scaleInPlace(speed * dt);
      player.position.addInPlace(move);
      player.rotation.y = Math.atan2(move.x, move.z);
    }
    player.position.x = Math.max(-18, Math.min(18, player.position.x));
    player.position.z = Math.max(-12, Math.min(12, player.position.z));
    if (jumpTime > 0) {
      jumpTime -= dt;
      player.position.y = Math.sin(Math.max(0, jumpTime) / 0.42 * Math.PI) * 0.9;
    } else player.position.y = 0;
    pet.position.x += (player.position.x + 1.2 - pet.position.x) * Math.min(1, dt * 3.5);
    pet.position.z += (player.position.z + 1.0 - pet.position.z) * Math.min(1, dt * 3.5);
    pet.position.y = Math.sin(performance.now() / 380) * 0.04;
    coinMeshes.forEach((c, i) => { c.rotation.y += dt * 3; if (c.isVisible && Vector3.Distance(c.position, player.position) < 1.1) { c.isVisible = false; totalCoins += 25; emit("ww-coins", { coins: totalCoins }); emit("ww-toast", { message: "+25 Wonder Coins!" }); } });
    stars.forEach((s) => { s.rotation.y += dt * 2; if (s.isVisible && Vector3.Distance(s.position, player.position) < 1.25) { s.isVisible = false; starsFound += 1; totalCoins += 20; emit("ww-quest-progress", { stars: starsFound }); emit("ww-coins", { coins: totalCoins }); emit("ww-toast", { message: `Lost Star found! ${starsFound}/5` }); } });
  });

  return {
    scene,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      scene.onBeforeRenderObservable.remove(observer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("ww-action", onAction);
      camera.detachControl();
      scene.dispose();
    },
  };
}
