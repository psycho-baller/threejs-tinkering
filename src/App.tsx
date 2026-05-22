import { useState } from "react";
import { Sparkles, Sliders, RefreshCw, Activity, Compass, Flame, Info, EyeOff, Eye } from "lucide-react";
import Scene from "./components/Scene";

// Curated Luminous Amber & Gold Color Palettes
interface Palette {
  name: string;
  amber: string;
  gold: string;
  standout: string;
}

const PALETTES: Palette[] = [
  {
    name: "Classic Amber & Gold",
    amber: "#ff7b00",
    gold: "#ffd700",
    standout: "#ffffff"
  },
  {
    name: "Solar Flares",
    amber: "#e65100",
    gold: "#fff59d",
    standout: "#ffd54f"
  },
  {
    name: "Champagne Luminary",
    amber: "#c5a059",
    gold: "#e5c158",
    standout: "#f4f4f6"
  },
  {
    name: "Cosmic Ignition",
    amber: "#b23b00",
    gold: "#ffaa00",
    standout: "#ffeaaa"
  }
];

interface SimulationPreset {
  name: string;
  chaos: number;
  noiseStrength: number;
  noiseFrequency: number;
  returnSpeed: number;
  baseSize: number;
  description: string;
}

const PRESETS: SimulationPreset[] = [
  {
    name: "Structured Assembly",
    chaos: 0.0,
    noiseStrength: 0.12,
    noiseFrequency: 0.35,
    returnSpeed: 1.2,
    baseSize: 0.056,
    description: "Particles are tightly drawn to their human skeletal targets with slight organic breathing."
  },
  {
    name: "Lively Fluidity",
    chaos: 0.15,
    noiseStrength: 0.45,
    noiseFrequency: 0.5,
    returnSpeed: 0.9,
    baseSize: 0.060,
    description: "Particles drift in soft fluid currents, forming loose and alive golden structures."
  },
  {
    name: "Cosmic Ascension",
    chaos: 1.0,
    noiseStrength: 0.85,
    noiseFrequency: 0.7,
    returnSpeed: 0.5,
    baseSize: 0.048,
    description: "The entire crowd completely dissolves and swirls upwards into a glowing double-helix vortex."
  },
  {
    name: "Nebulous Dissolution",
    chaos: 0.45,
    noiseStrength: 1.6,
    noiseFrequency: 1.1,
    returnSpeed: 0.6,
    baseSize: 0.052,
    description: "The structures melt and evaporate into an active space storm of shimmering gold."
  }
];

export default function App() {
  // Preset state & customization parameters
  const [chaos, setChaos] = useState(0.0);
  const [noiseStrength, setNoiseStrength] = useState(0.12);
  const [noiseFrequency, setNoiseFrequency] = useState(0.35);
  const [returnSpeed, setReturnSpeed] = useState(1.2);
  const [baseSize, setBaseSize] = useState(0.056);
  const [interactionRadius, setInteractionRadius] = useState(1.8);
  const [mouseStrength, setMouseStrength] = useState(4.5);

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [selectedPalette, setSelectedPalette] = useState(0);

  // Reshuffle signal to explode particles
  const [resetSignal, setResetSignal] = useState(0);

  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  // Hook preset clicks
  const applyPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESETS[idx];
    setChaos(p.chaos);
    setNoiseStrength(p.noiseStrength);
    setNoiseFrequency(p.noiseFrequency);
    setReturnSpeed(p.returnSpeed);
    setBaseSize(p.baseSize);
  };

  // Trigger initial blast explosion
  const triggerBlastExplosion = () => {
    setResetSignal((prev) => prev + 1);
  };

  // Sync preset index when sliders match a preset manually, or just keep it custom
  const currentPalette = PALETTES[selectedPalette];

  return (
    <div id="application-container" className="fixed inset-0 w-screen h-screen bg-[#030305] text-zinc-100 flex overflow-hidden font-sans select-none">
      
      {/* 3D WebGL Canvas Layer */}
      <div id="webgl-viewport" className="absolute inset-0 w-full h-full z-0">
        <Scene
          chaos={chaos}
          noiseStrength={noiseStrength}
          noiseFrequency={noiseFrequency}
          returnSpeed={returnSpeed}
          baseSize={baseSize}
          interactionRadius={interactionRadius}
          mouseStrength={mouseStrength}
          amberColor={currentPalette.amber}
          goldColor={currentPalette.gold}
          standoutColor={currentPalette.standout}
          resetSignal={resetSignal}
        />
      </div>

      {/* Interactive Floating Interface Layout */}
      <div id="hud-ui-layer" className="absolute inset-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-4 md:p-6">
        
        {/* Top Header Row */}
        <header id="hud-header" className="w-full flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 backdrop-blur-md bg-zinc-950/45 border border-zinc-900/60 p-3 rounded-xl shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center animate-pulse">
              <Flame id="logo-icon" className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 id="app-title" className="text-sm font-semibold tracking-wide text-zinc-100 font-sans">
                LUSION CROWD STUDY
              </h1>
              <p id="app-subtitle" className="text-[10px] font-mono text-amber-500 tracking-wider">
                GPGPU SIMULATION LAYER • 524,288 PARTICLES
              </p>
            </div>
          </div>

          <div id="header-utilities" className="flex items-center gap-2">
            <button
              id="info-toggle"
              onClick={() => setInfoOpen(!infoOpen)}
              className={`p-3 rounded-xl border backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 ${
                infoOpen 
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300" 
                  : "bg-zinc-950/45 border-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-800"
              }`}
            >
              <Info className="w-4 h-4" />
              <span className="text-xs font-mono font-medium hidden md:inline">Technical Spec</span>
            </button>

            <button
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 bg-zinc-950/45 border border-zinc-900/60 hover:border-zinc-800 backdrop-blur-md rounded-xl text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
            >
              {sidebarOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Floating Controls Sidebar - Collapsible with slide animations */}
        <div id="hud-body" className="flex-1 flex justify-between gap-6 my-4 overflow-hidden items-stretch">
          
          {/* Main Controls Panel */}
          <div
            id="sidebar-panel"
            className={`w-full max-w-sm h-full backdrop-blur-lg bg-zinc-950/65 border border-zinc-900/80 rounded-2xl shadow-2xl flex flex-col pointer-events-auto transition-all duration-300 ${
              sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-[420px] opacity-0"
            }`}
          >
            {/* Scrollable Control Segment */}
            <div id="controls-scroller" className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
              
              {/* Presets segment */}
              <div id="presets-section" className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500 tracking-widest uppercase">
                  <Compass className="w-3.5 h-3.5" />
                  <span>State Presets</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p, idx) => (
                    <button
                      id={`preset-btn-${idx}`}
                      key={p.name}
                      onClick={() => applyPreset(idx)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group cursor-pointer ${
                        selectedPreset === idx
                          ? "bg-amber-600/15 border-amber-500/80 text-amber-200"
                          : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/60 text-zinc-400"
                      }`}
                    >
                      <span className="text-xs font-medium tracking-tight group-hover:text-zinc-100 font-sans truncate">{p.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500 leading-snug mt-1 line-clamp-2">
                        {p.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders customizing parameters */}
              <div id="sliders-section" className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500 tracking-widest uppercase">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Fine-Tuning Sliders</span>
                </div>

                {/* Chaos Slider */}
                <div id="chaos-control" className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Morph / Chaos Factor</span>
                    <span className="text-amber-500 font-semibold">{chaos.toFixed(2)}</span>
                  </div>
                  <input
                    id="chaos-slider"
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    value={chaos}
                    onChange={(e) => {
                      setChaos(parseFloat(e.target.value));
                      setSelectedPreset(-1); // Set to custom
                    }}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                    <span>Crowd Silhouettes</span>
                    <span>Cosmic Spiral</span>
                  </div>
                </div>

                {/* Noise Strength Slider */}
                <div id="noise-strength-control" className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Curl Noise Turbulence</span>
                    <span className="text-amber-500 font-semibold">{noiseStrength.toFixed(2)}</span>
                  </div>
                  <input
                    id="noise-strength-slider"
                    type="range"
                    min="0.0"
                    max="2.5"
                    step="0.05"
                    value={noiseStrength}
                    onChange={(e) => {
                      setNoiseStrength(parseFloat(e.target.value));
                      setSelectedPreset(-1);
                    }}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Noise Frequency Slider */}
                <div id="noise-frequency-control" className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Noise Frequency (Detail)</span>
                    <span className="text-amber-500 font-semibold">{noiseFrequency.toFixed(2)}</span>
                  </div>
                  <input
                    id="noise-frequency-slider"
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.02"
                    value={noiseFrequency}
                    onChange={(e) => {
                      setNoiseFrequency(parseFloat(e.target.value));
                      setSelectedPreset(-1);
                    }}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Align Snap Speed */}
                <div id="return-speed-control" className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Target Recall Speed</span>
                    <span className="text-amber-500 font-semibold">{returnSpeed.toFixed(2)}</span>
                  </div>
                  <input
                    id="return-speed-slider"
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.05"
                    value={returnSpeed}
                    onChange={(e) => {
                      setReturnSpeed(parseFloat(e.target.value));
                      setSelectedPreset(-1);
                    }}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Particle Size */}
                <div id="particle-size-control" className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Base Particle Size</span>
                    <span className="text-amber-500 font-semibold">{baseSize.toFixed(3)}</span>
                  </div>
                  <input
                    id="particle-size-slider"
                    type="range"
                    min="0.01"
                    max="0.06"
                    step="0.001"
                    value={baseSize}
                    onChange={(e) => setBaseSize(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Interaction Radius */}
                <div id="interaction-radius-control" className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Mouse Warp Radius</span>
                    <span className="text-amber-500 font-semibold">{interactionRadius.toFixed(1)}m</span>
                  </div>
                  <input
                    id="interaction-radius-slider"
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={interactionRadius}
                    onChange={(e) => setInteractionRadius(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Interaction Strength */}
                <div id="interaction-strength-control" className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Mouse Repel Force</span>
                    <span className="text-amber-500 font-semibold">{mouseStrength.toFixed(1)}</span>
                  </div>
                  <input
                    id="interaction-strength-slider"
                    type="range"
                    min="0.0"
                    max="10.0"
                    step="0.5"
                    value={mouseStrength}
                    onChange={(e) => setMouseStrength(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* Color Palettes Selection */}
              <div id="palettes-section" className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500 tracking-widest uppercase">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Spectral Palette</span>
                </div>
                <div className="space-y-2">
                  {PALETTES.map((pal, idx) => (
                    <button
                      id={`palette-btn-${idx}`}
                      key={pal.name}
                      onClick={() => setSelectedPalette(idx)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedPalette === idx
                          ? "bg-amber-600/10 border-amber-500/80"
                          : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-xs font-medium text-zinc-300">{pal.name}</span>
                      <div className="flex gap-1.5">
                        <span className="w-5 h-5 rounded-full border border-black/50" style={{ background: pal.amber }} />
                        <span className="w-5 h-5 rounded-full border border-black/50" style={{ background: pal.gold }} />
                        <span className="w-5 h-5 rounded-full border border-black/50" style={{ background: pal.standout }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Explode / Blast Button Static Footer */}
            <div id="sidebar-footer" className="p-4 border-t border-zinc-900/80 bg-zinc-950/80 flex flex-col gap-2 rounded-b-2xl">
              <button
                id="blast-trigger-btn"
                onClick={triggerBlastExplosion}
                className="w-full py-3.5 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 pointer-events-auto"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow text-black" />
                <span>Explode & Reshuffle (Blast)</span>
              </button>
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 px-1 mt-1">
                <span>Hold click to drag orbit view</span>
                <span>Move cursor to repel particles</span>
              </div>
            </div>
          </div>

          {/* Technical Specs Drawer (Right floating panel toggleable) */}
          <div
            id="technical-docs-panel"
            className={`w-full max-w-sm backdrop-blur-lg bg-zinc-950/75 border border-zinc-900/80 rounded-2xl shadow-2xl p-6 overflow-y-auto pointer-events-auto transition-all duration-300 flex flex-col space-y-4 text-xs select-text ${
              infoOpen ? "translate-x-0 opacity-100" : "translate-x-[420px] opacity-0 pointer-events-none absolute right-0"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-mono text-amber-500 tracking-widest uppercase border-b border-zinc-900 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>GPGPU Architecture Specs</span>
            </div>

            <div className="space-y-4 leading-relaxed font-sans text-zinc-300">
              <section className="space-y-1">
                <h3 className="font-semibold text-zinc-100 font-mono text-xs text-amber-400">Total Particles: 524,288</h3>
                <p>
                  No meshes are handled on the CPU. Coordinates are loaded into double-buffered 512 x 1024 32-bit floating-point textures. All transformation loops run entirely on the GPU.
                </p>
              </section>

              <section className="space-y-1">
                <h3 className="font-semibold text-zinc-100 font-mono text-xs text-amber-400">The "Standout Figure" Segment</h3>
                <p>
                  The first 65,536 coordinates represent the central standout figure. High-precision shader branching multiplies their luminance by 2.2x and drives them in a faster, higher-frequency curl noise to create an active focal point.
                </p>
              </section>

              <section className="space-y-1">
                <h3 className="font-semibold text-zinc-100 font-mono text-xs text-amber-400">Ashima Curl Noise Vector Field</h3>
                <p>
                  Calculates true analytical curl derivatives from 3D Simplex GPGPU noise. This creates the highly aesthetic organic wind velocity turbulence with zero CPU lag.
                </p>
              </section>

              <section className="space-y-1">
                <h3 className="font-semibold text-zinc-100 font-mono text-xs text-amber-400">Bloom Post-Processing</h3>
                <p>
                  We utilize multi-pass mip-mapped Gaussian blur and high-pass additive color buffers. This builds glowing halos without hard edges around concentrated particle clusters.
                </p>
              </section>

              <div className="bg-zinc-900/40 border border-zinc-850 px-3 py-2.5 rounded-xl font-mono text-[10px] text-zinc-400 space-y-1 leading-snug">
                <span className="block font-semibold text-[11px] text-zinc-300 pb-1 border-b border-zinc-800">PERFORMANCE TELEMETRY</span>
                <span className="block">• Draw calls to screen: ~3 (Optimized)</span>
                <span className="block">• Simulation: GPU GPGPU Frame Buffer Ping-Pong</span>
                <span className="block">• Memory: 512x1024 Float32 texture (RGBA)</span>
                <span className="block">• Framerate: Bound to 60fps / 120fps (V-Sync)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer HUD Indicators */}
        <footer id="hud-footer" className="w-full flex justify-between items-center text-[10px] font-mono text-zinc-500">
          <span>WebGL 2.0 • @react-three/fiber</span>
          <span className="hidden md:inline">Hold [SHIFT] + orbit to pan (optional) • Drag controls adjust real-time uniforms</span>
          <span>© LUSION AESTHETIC study</span>
        </footer>

      </div>
    </div>
  );
}
