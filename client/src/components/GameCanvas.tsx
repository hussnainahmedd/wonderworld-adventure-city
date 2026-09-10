import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const [coins, setCoins] = useState(620);
  const [stars, setStars] = useState(0);
  const [panel, setPanel] = useState<"home" | "quests" | "games" | "style" | "pets" | null>(null);
  const [toast, setToast] = useState("Welcome to WonderTown, Explorer!");
  const [outfit, setOutfit] = useState("teal");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    createGameScene(engine, canvas).then((h) => { handle = h; engine.runRenderLoop(() => h.scene.render()); });
    const onResize = () => engine.resize();
    const onCoins = (event: Event) => setCoins((event as CustomEvent<{ coins: number }>).detail.coins);
    const onStars = (event: Event) => setStars((event as CustomEvent<{ stars: number }>).detail.stars);
    const onToast = (event: Event) => { setToast((event as CustomEvent<{ message: string }>).detail.message); window.setTimeout(() => setToast("Explore, collect, and make WonderWorld yours."), 2600); };
    window.addEventListener("resize", onResize);
    window.addEventListener("ww-coins", onCoins);
    window.addEventListener("ww-quest-progress", onStars);
    window.addEventListener("ww-toast", onToast);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("ww-coins", onCoins); window.removeEventListener("ww-quest-progress", onStars); window.removeEventListener("ww-toast", onToast); handle?.dispose(); engine.dispose(); startedRef.current = false; };
  }, []);

  const action = (type: string, value?: string) => window.dispatchEvent(new CustomEvent("ww-action", { detail: { type, value } }));
  const reward = (amount: number) => action("reward", String(amount));

  return <div className="game-shell">
    <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} />
    <div className="art-wash" aria-hidden="true" />
    <div className="game-ui">
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark"><span>✦</span></div><div><div className="brand-name">WonderWorld</div><div className="brand-sub">ADVENTURE CITY</div></div></div>
        <div className="top-pills"><div className="pill level-pill"><span className="pill-icon">✹</span><span>LEVEL 3</span></div><div className="pill coin-pill"><span className="coin-dot">●</span><strong>{coins.toLocaleString()}</strong><span>WONDER COINS</span></div><button className="icon-button" onClick={() => setPanel("style")} aria-label="Open profile">☺</button></div>
      </header>
      <div className="left-rail">
        <div className="zone-card glass-card"><div className="eyebrow">YOU ARE HERE</div><div className="zone-title">WonderTown</div><div className="zone-copy">A sunny place to start your next big adventure.</div><div className="mini-progress"><span style={{ width: `${Math.min(100, stars * 20)}%` }} /></div><div className="progress-caption"><span>Forest star quest</span><strong>{stars}/5</strong></div></div>
        <div className="guide-card glass-card"><div className="guide-avatar">M</div><div><strong>Mayor Mallow</strong><p>“The town is brighter with you here!”</p></div></div>
        <div className="travel-card glass-card"><div className="eyebrow">TRAVEL MAP</div><div className="travel-grid"><button onClick={() => action("teleport", "forest")}><span>🌲</span>Forest</button><button onClick={() => action("teleport", "beach")}><span>☀</span>Beach</button><button onClick={() => action("teleport", "mountain")}><span>⛰</span>Mountain</button><button onClick={() => action("teleport", "town")}><span>✦</span>Town</button></div></div>
      </div>
      <div className="toast"><span className="toast-spark">✦</span>{toast}</div>
      <div className="controls-help"><span className="keycap">W</span><span className="keycap">A</span><span className="keycap">S</span><span className="keycap">D</span><span>to explore</span><span className="keycap space-key">SPACE</span><span>to hop</span></div>
      <div className="bottom-dock">
        <button className="dock-card quest-dock" onClick={() => setPanel("quests")}><span className="dock-icon">✧</span><span><strong>Quest Board</strong><small>3 adventures waiting</small></span><span className="dock-arrow">→</span></button>
        <button className="dock-card game-dock" onClick={() => setPanel("games")}><span className="dock-icon">▶</span><span><strong>Play Mini-Games</strong><small>Beat your best score</small></span><span className="dock-arrow">→</span></button>
        <button className="dock-card home-dock" onClick={() => setPanel("home")}><span className="dock-icon">⌂</span><span><strong>My Cozy Home</strong><small>Decorate your space</small></span><span className="dock-arrow">→</span></button>
        <button className="dock-card style-dock" onClick={() => setPanel("style")}><span className="dock-icon">✿</span><span><strong>Style Studio</strong><small>Make your look yours</small></span><span className="dock-arrow">→</span></button>
      </div>
      <div className="jump-pad"><button onPointerDown={() => action("move", "0,-1")} aria-label="Move up">▲</button><div><button onPointerDown={() => action("move", "-1,0")} aria-label="Move left">◀</button><button className="jump-button" onPointerDown={() => action("move", "0,1")} aria-label="Hop">✦</button><button onPointerDown={() => action("move", "1,0")} aria-label="Move right">▶</button></div><button onPointerDown={() => action("move", "0,1")} aria-label="Move down">▼</button></div>
      {panel && <Panel panel={panel} close={() => setPanel(null)} stars={stars} reward={reward} outfit={outfit} setOutfit={(value) => { setOutfit(value); action("outfit", value); }} />}
    </div>
  </div>;
}

function Panel({ panel, close, stars, reward, outfit, setOutfit }: { panel: "home" | "quests" | "games" | "style" | "pets"; close: () => void; stars: number; reward: (amount: number) => void; outfit: string; setOutfit: (value: string) => void }) {
  return <div className="panel-backdrop" onClick={close}><section className="side-panel" onClick={(e) => e.stopPropagation()}>
    <button className="close-button" onClick={close}>×</button>
    {panel === "quests" && <Quests stars={stars} reward={reward} />}
    {panel === "games" && <MiniGames reward={reward} />}
    {panel === "style" && <StyleStudio outfit={outfit} setOutfit={setOutfit} />}
    {panel === "pets" && <Pets reward={reward} />}
    {panel === "home" && <HomePanel reward={reward} />}
  </section></div>;
}

function PanelHead({ kicker, title, copy }: { kicker: string; title: string; copy: string }) { return <div className="panel-head"><div className="eyebrow">{kicker}</div><h2>{title}</h2><p>{copy}</p></div>; }
function Quests({ stars, reward }: { stars: number; reward: (amount: number) => void }) { const [claimed, setClaimed] = useState<string[]>([]); const items = [{ id: "stars", icon: "✧", title: "Find the Lost Stars", copy: "Explore the greenbelt and bring 5 stars home.", progress: `${stars}/5`, amount: 100 }, { id: "shells", icon: "◌", title: "Sunny Beachcomber", copy: "Collect 10 colorful shells at the coast.", progress: "3/10", amount: 150 }, { id: "trail", icon: "➜", title: "Town Trailblazer", copy: "Visit all four WonderWorld zones.", progress: "2/4", amount: 200 }]; return <><PanelHead kicker="ADVENTURE LOG" title="Your next little wins" copy="Every quest is a new story. No pressure—just play your way." /><div className="quest-list">{items.map((item) => <div className="quest-row" key={item.id}><div className="quest-icon">{item.icon}</div><div className="quest-info"><strong>{item.title}</strong><p>{item.copy}</p><div className="quest-progress"><span><i style={{ width: item.id === "stars" ? `${stars * 20}%` : item.id === "shells" ? "30%" : "50%" }} /></span><b>{item.progress}</b></div></div><button className="claim-button" disabled={claimed.includes(item.id)} onClick={() => { reward(item.amount); setClaimed([...claimed, item.id]); }}>{claimed.includes(item.id) ? "Done" : `+${item.amount}`}</button></div>)}</div><div className="safe-note">✦ Clear rewards, kind goals, and no loot boxes.</div></>; }
function MiniGames({ reward }: { reward: (amount: number) => void }) { const [game, setGame] = useState("Coin Dash"); const [score, setScore] = useState(0); const [done, setDone] = useState(false); const names = ["Coin Dash", "Treasure Hunt", "Sky Race"]; const descriptions: Record<string, string> = { "Coin Dash": "Hop through the cloud course and grab every coin.", "Treasure Hunt": "Spot the bright treasures before the timer twinkles out.", "Sky Race": "Fly through the floating rings. Smooth moves win!" }; const hit = () => { const next = Math.min(5, score + 1); setScore(next); if (next === 5) { setDone(true); reward(75); } }; return <><PanelHead kicker="PLAYGROUND PORTAL" title="Pick a mini-game" copy="Short, friendly challenges built for one more try." /><div className="game-tabs">{names.map((name, i) => <button className={game === name ? "active" : ""} key={name} onClick={() => { setGame(name); setScore(0); setDone(false); }}><span>{["✦", "⌕", "➜"][i]}</span>{name}</button>)}</div><div className="mini-stage"><div className="stage-sky"><div className="stage-cloud cloud-one" /><div className="stage-cloud cloud-two" /><div className="stage-player">{game === "Sky Race" ? "✈" : game === "Treasure Hunt" ? "⌕" : "●"}</div><div className="stage-path">{[0, 1, 2, 3, 4].map((n) => <span className={n < score ? "hit" : ""} key={n}>{n < score ? "✦" : "○"}</span>)}</div></div><strong>{done ? "You did it! New best!" : descriptions[game]}</strong><p>{done ? "+75 Wonder Coins added to your pocket." : `Checkpoint ${score + 1} of 5`}</p><button className="primary-button" onClick={() => { if (done) { setScore(0); setDone(false); } else hit(); }}>{done ? "Play again" : `Hit checkpoint ${score + 1}`}</button></div></>; }
function StyleStudio({ outfit, setOutfit }: { outfit: string; setOutfit: (value: string) => void }) { const looks = [{ id: "teal", name: "Lagoon Loop", color: "#2db6aa", price: "Ready" }, { id: "coral", name: "Coral Comet", color: "#f08f7c", price: "120 coins" }, { id: "sunny", name: "Sunbeam Scout", color: "#ffd36a", price: "240 coins" }]; return <><PanelHead kicker="STYLE STUDIO" title="Make your adventure look yours" copy="Mix cheerful colors and collect new pieces as you explore." /><div className="avatar-preview"><div className={`avatar-blob ${outfit}`}><span>●</span></div><div><strong>Nova the Explorer</strong><p>Level 3 • Town Adventurer</p></div></div><div className="look-grid">{looks.map((look) => <button className={outfit === look.id ? "look-card selected" : "look-card"} key={look.id} onClick={() => setOutfit(look.id)}><span className="look-swatch" style={{ background: look.color }} /><strong>{look.name}</strong><small>{look.price}</small>{outfit === look.id && <b>✓</b>}</button>)}</div><div className="customize-tags"><span>Hair: Cloud Curl</span><span>Hat: Starter Cap</span><span>Backpack: Sunny Pack</span></div></>; }
function Pets({ reward }: { reward: (amount: number) => void }) { const pets = [{ icon: "🐶", name: "Pip", type: "Puppy", active: true }, { icon: "🐱", name: "Miso", type: "Kitten" }, { icon: "🐰", name: "Pebble", type: "Bunny" }, { icon: "🦊", name: "Roo", type: "Fox" }]; return <><PanelHead kicker="PET PARADE" title="Choose your adventure buddy" copy="Pets grow happier when you explore together." /><div className="pet-list">{pets.map((pet, i) => <div className="pet-row" key={pet.name}><div className="pet-face">{pet.icon}</div><div><strong>{pet.name}</strong><p>{pet.type} • Happiness {pet.active ? "92" : 78 + i}</p></div><button className="small-button" onClick={() => reward(10)}>{pet.active ? "Following" : "Visit"}</button></div>)}</div><div className="safe-note">New friends unlock through quests and kind play.</div></>; }
function HomePanel({ reward }: { reward: (amount: number) => void }) { const [placed, setPlaced] = useState(3); return <><PanelHead kicker="YOUR COZY HOME" title="A little space for big ideas" copy="Your starter home is ready for a few finishing touches." /><div className="home-room"><div className="room-wall" /><div className="room-floor" /><div className="room-rug" /><div className="room-sofa" /><div className="room-plant">✿</div><div className="room-lamp">◒</div></div><div className="furniture-row">{["Sofa", "Plant", "Lamp", "Rug"].map((item, i) => <button key={item} onClick={() => { setPlaced((v) => v + 1); reward(5); }}><span>{["▰", "❀", "◒", "▱"][i]}</span>{item}</button>)}</div><div className="home-stat"><span><strong>{placed}</strong> pieces placed</span><span><strong>1</strong> pet nook</span><span><strong>✦</strong> cozy rating</span></div></>; }
