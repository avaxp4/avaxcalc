import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { Terminal, Activity, ChevronRight, Calculator, Triangle, Settings, Delete, X, ExternalLink, ArrowLeft, MessageCircle, Send } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

// ========================================================
// 1. STANDALONE CHART COMPONENT
// ========================================================
const StandaloneChart = () => {
  const params = new URLSearchParams(window.location.search);
  const angleDeg = parseFloat(params.get('angle')) || 0;
  const coordsLatex = params.get('coords');

  const rad = (angleDeg * Math.PI) / 180;
  const size = 800;
  const center = size / 2;
  const radius = 300;

  const x = center + radius * Math.cos(rad);
  const y = center + radius * Math.sin(-rad);

  const handleBack = () => {
    window.close();
    if (!window.closed) {
      window.location.href = window.location.origin;
    }
  };

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <button onClick={handleBack} className="absolute top-6 left-6 bg-matrix-dim/50 text-matrix-green border border-matrix-green px-6 py-3 rounded-full flex items-center gap-2 hover:bg-matrix-green hover:text-black transition-all font-bold z-50">
        <ArrowLeft size={20} /> RETURN TO SYSTEM
      </button>
      <h1 className="absolute top-6 right-6 text-matrix-dim font-bold text-xl font-mono select-none">VISUAL_ANALYSIS_MODE</h1>

      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <marker id="arrow" markerWidth="12" markerHeight="12" refX="11" refY="4" orient="auto"><path d="M0,0 L0,8 L11,4 z" fill="#005500" /></marker>
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#001a00" strokeWidth="1" /></pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <line x1={center} y1="0" x2={center} y2={size} stroke="#005500" strokeWidth="2" markerEnd="url(#arrow)" />
        <line x1="0" y1={center} x2={size} y2={center} stroke="#005500" strokeWidth="2" markerEnd="url(#arrow)" />
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#00ff41" strokeWidth="2" strokeDasharray="8,4" opacity="0.5" />
        <line x1={x} y1={y} x2={x} y2={center} stroke="gray" strokeWidth="1" strokeDasharray="6" />
        <line x1={x} y1={y} x2={center} y2={y} stroke="gray" strokeWidth="1" strokeDasharray="6" />
        <line x1={center} y1={center} x2={x} y2={center} stroke="#00ff41" strokeWidth="4" opacity="0.3" />
        <line x1={center} y1={center} x2={x} y2={y} stroke="#ff4b4b" strokeWidth="5" filter="url(#glow)" />
        <circle cx={x} cy={y} r="8" fill="#ff4b4b" stroke="black" strokeWidth="2" />
        <path d={`M ${center + 50} ${center} A 50 50 0 ${angleDeg > 180 ? 1 : 0} 0 ${center + 50 * Math.cos(-rad)} ${center + 50 * Math.sin(-rad)}`} fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <text x={size - 20} y={center + 30} fill="#005500" fontSize="16" fontFamily="monospace">X</text>
        <text x={center + 20} y={30} fill="#005500" fontSize="16" fontFamily="monospace">Y</text>
      </svg>

      <div className="absolute bottom-10 bg-black/80 border border-matrix-green p-8 rounded-2xl text-center backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,65,0.2)]">
        <div className="text-gray-400 text-sm font-mono mb-3 tracking-widest">TERMINAL POINT COORDINATES</div>
        {coordsLatex ? (
          <div className="text-5xl font-bold text-matrix-green"><Latex>{`$P ${coordsLatex}$`}</Latex></div>
        ) : (
          <div className="text-4xl font-bold text-matrix-green">θ = {angleDeg}°</div>
        )}
        <div className="mt-4 text-xs text-gray-500">UNIT CIRCLE PROJECTION v2.0</div>
      </div>
    </div>
  );
};

// ========================================================
// 2. MAIN APP COMPONENT
// ========================================================
function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'chart') {
    return <StandaloneChart />;
  }

  const [activeTab, setActiveTab] = useState('algebra');
  const [trigMode, setTrigMode] = useState('angle');
  const [angleVal, setAngleVal] = useState("");
  const [isRadians, setIsRadians] = useState(false);
  const [trigFunc, setTrigFunc] = useState('sin');
  const [trigVal, setTrigVal] = useState("");
  const [trigQuad, setTrigQuad] = useState(1);
  const [input, setInput] = useState("");
  const [showVars, setShowVars] = useState(false);
  const [variables, setVariables] = useState({ A: '', B: '', C: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const trigValRef = useRef(null);
  const angleInputRef = useRef(null);

  const openChartInNewTab = (angle, coords) => {
    const url = `${window.location.origin}?mode=chart&angle=${angle}&coords=${encodeURIComponent(coords || '')}`;
    window.open(url, '_blank');
  };

  const MiniChart = ({ angleDeg, coordsLatex }) => {
    const rad = (angleDeg * Math.PI) / 180;
    const size = 160;
    const center = size / 2;
    const radius = 60;
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(-rad);

    return (
      <div className="relative flex flex-col items-center justify-center p-4 bg-black border border-matrix-dim rounded-lg group hover:border-matrix-green transition-colors cursor-pointer" onClick={() => openChartInNewTab(angleDeg, coordsLatex)}>
        <div className="absolute top-2 right-2 p-1 bg-matrix-dim/30 text-matrix-green rounded opacity-0 group-hover:opacity-100 transition"><ExternalLink size={14} /></div>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <line x1={center} y1="0" x2={center} y2={size} stroke="#004400" strokeWidth="1" />
          <line x1="0" y1={center} x2={size} y2={center} stroke="#004400" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#00ff41" strokeWidth="1" strokeDasharray="4" opacity="0.6" />
          <line x1={center} y1={center} x2={x} y2={y} stroke="#ff4b4b" strokeWidth="2" />
          <circle cx={x} cy={y} r="3" fill="#ff4b4b" />
        </svg>
        <div className="text-[10px] text-gray-500 mt-2">CLICK TO EXPAND</div>
      </div>
    );
  };

  const getActiveField = () => {
    if (activeTab === 'trig') {
      if (trigMode === 'angle') return { val: angleVal, set: setAngleVal, ref: angleInputRef };
      return { val: trigVal, set: setTrigVal, ref: trigValRef };
    }
    return { val: input, set: setInput, ref: inputRef };
  };

  const focusInput = () => {
    const { ref } = getActiveField();
    ref.current?.focus();
  };

  const handleKeypad = (key) => {
    const { val, set, ref } = getActiveField();
    const inputEl = ref.current;
    if (!inputEl) return;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    let newVal = val;
    let newCursorPos = start;
    if (key === 'DEL') {
      if (start === end && start > 0) {
        newVal = val.slice(0, start - 1) + val.slice(start);
        newCursorPos = start - 1;
      } else if (start !== end) {
        newVal = val.slice(0, start) + val.slice(end);
        newCursorPos = start;
      }
    } else if (key === 'CLR') {
      newVal = "";
      newCursorPos = 0;
      setResult(null);
    } else {
      newVal = val.slice(0, start) + key + val.slice(end);
      newCursorPos = start + key.length;
    }
    set(newVal);
    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const processVariables = (rawInput) => {
    let processed = rawInput;
    Object.entries(variables).forEach(([key, val]) => {
      if (val && val.trim() !== '') {
        processed = processed.replaceAll(key, `(${val})`);
      }
    });
    return processed;
  };

  const handleSolve = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let response;
      if (activeTab === 'trig') {
        if (trigMode === 'angle') {
          const { val } = getActiveField();
          if (!val) { setLoading(false); return; }
          const processedAngle = processVariables(val);
          response = await axios.post(`${API_URL}/solve/trig/analyze`, {
            angle: processedAngle,
            is_radians: isRadians
          });
        } else {
          if (!trigVal) { setLoading(false); return; }
          const processedVal = processVariables(trigVal);
          response = await axios.post(`${API_URL}/solve/trig/functions`, {
            func: trigFunc,
            value: processedVal,
            quadrant: parseInt(trigQuad)
          });
        }
      } else {
        if (!input) { setLoading(false); return; }
        const processedExpression = processVariables(input);
        const endpoint = activeTab === 'algebra' ? "/solve/algebra" : "/solve/equation";
        response = await axios.post(`${API_URL}${endpoint}`, { expression: processedExpression });
      }
      if (response.data.status === 'error') {
        setError(response.data.message);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.detail || err.message;
      setError(`SERVER_ERROR: ${serverMsg}`);
    }
    setLoading(false);
  };

  useEffect(() => { setResult(null); setError(null); focusInput(); }, [activeTab, trigMode]);

  return (
    <div className="min-h-screen bg-black text-matrix-green p-2 md:p-6 flex flex-col items-center font-mono selection:bg-matrix-green selection:text-black pb-12">

      <header className="w-full max-w-3xl mb-4 border-b border-matrix-dim pb-2 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 animate-pulse text-shadow-glow">
          <Terminal size={28} />
          OBSOLETE_FINAL
        </h1>
        <button onClick={() => setShowVars(!showVars)} className={`p-2 border rounded transition-all ${showVars ? 'bg-matrix-green text-black border-matrix-green' : 'border-matrix-dim text-matrix-green'}`}>
          <Settings size={20} />
        </button>
      </header>

      {showVars && (
        <div className="w-full max-w-3xl mb-6 border border-matrix-green p-4 bg-matrix-dim/20 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold">MEMORY BANKS</h3>
            <button onClick={() => setShowVars(false)}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['A', 'B', 'C'].map((v) => (
              <div key={v} className="flex items-center gap-2">
                <span className="font-bold text-lg">{v}:</span>
                <input type="text" value={variables[v]} onChange={(e) => setVariables({ ...variables, [v]: e.target.value })} placeholder="..." className="w-full bg-black border border-matrix-dim p-2 text-center focus:border-matrix-green outline-none text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl flex gap-1 mb-4 overflow-x-auto">
        {[
          { id: 'algebra', label: 'ANALYSIS', icon: <Terminal size={14} /> },
          { id: 'equation', label: 'SOLVER', icon: <Calculator size={14} /> },
          { id: 'trig', label: 'TRIGONOMETRY', icon: <Triangle size={14} /> }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 p-3 border border-matrix-green transition-all font-bold text-xs md:text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-matrix-green text-black shadow-glow' : 'bg-black text-matrix-green hover:bg-matrix-dim'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <main className="w-full max-w-3xl relative">
        {activeTab === 'trig' && (
          <div className="flex gap-4 mb-4 justify-center">
            <button onClick={() => setTrigMode('angle')} className={`px-4 py-1 border rounded-full text-xs ${trigMode === 'angle' ? 'bg-matrix-dim border-matrix-green' : 'border-gray-800 text-gray-500'}`}>Angle Analysis</button>
            <button onClick={() => setTrigMode('func')} className={`px-4 py-1 border rounded-full text-xs ${trigMode === 'func' ? 'bg-matrix-dim border-matrix-green' : 'border-gray-800 text-gray-500'}`}>Find Functions</button>
          </div>
        )}

        <div className="mb-4">
          {activeTab === 'trig' ? (
            trigMode === 'angle' ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-4 justify-end text-xs">
                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={!isRadians} onChange={() => setIsRadians(false)} className="accent-matrix-green" /> Deg (°)</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={isRadians} onChange={() => setIsRadians(true)} className="accent-matrix-green" /> Rad (π)</label>
                </div>
                <input ref={angleInputRef} type="text" value={angleVal} onChange={(e) => setAngleVal(e.target.value)} placeholder="Angle..." className="w-full bg-matrix-black border border-matrix-green p-3 text-xl outline-none focus:shadow-glow font-mono text-right" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                <select value={trigFunc} onChange={(e) => setTrigFunc(e.target.value)} className="col-span-1 bg-matrix-black border border-matrix-green p-2 outline-none text-sm"><option value="sin">sin</option><option value="cos">cos</option><option value="tan">tan</option></select>
                <input ref={trigValRef} type="text" value={trigVal} onChange={(e) => setTrigVal(e.target.value)} placeholder="Val" className="col-span-2 bg-matrix-black border border-matrix-green p-2 text-lg outline-none text-right" />
                <select value={trigQuad} onChange={(e) => setTrigQuad(e.target.value)} className="col-span-1 bg-matrix-black border border-matrix-green p-2 outline-none text-sm"><option value={1}>Q1</option><option value={2}>Q2</option><option value={3}>Q3</option><option value={4}>Q4</option></select>
              </div>
            )
          ) : (
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={activeTab === 'algebra' ? "Expression..." : "Equation..."} className="w-full bg-matrix-black border border-matrix-green p-4 text-xl outline-none focus:shadow-glow font-mono text-right tracking-widest" />
          )}
        </div>

        <div className="grid grid-cols-5 gap-1 md:gap-2 mb-6 select-none">
          <button onClick={() => handleKeypad('A')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-matrix-green font-bold">A</button>
          <button onClick={() => handleKeypad('B')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-matrix-green font-bold">B</button>
          <button onClick={() => handleKeypad('C')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-matrix-green font-bold">C</button>
          <button onClick={() => handleKeypad('CLR')} className="p-3 bg-red-900/30 border border-red-900 hover:border-red-500 text-red-500 font-bold col-span-2">AC</button>
          <button onClick={() => handleKeypad('x')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-white italic">x</button>
          <button onClick={() => handleKeypad('(')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-white">(</button>
          <button onClick={() => handleKeypad(')')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-white">)</button>
          <button onClick={() => handleKeypad('/')} className="p-3 bg-matrix-green/10 border border-matrix-dim hover:bg-matrix-green hover:text-black text-matrix-green font-bold text-xl">÷</button>
          <button onClick={() => handleKeypad('DEL')} className="p-3 bg-red-900/30 border border-red-900 hover:border-red-500 text-red-500 flex justify-center items-center"><Delete size={20} /></button>
          <button onClick={() => handleKeypad('^')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-white">^</button>
          <button onClick={() => handleKeypad('7')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">7</button>
          <button onClick={() => handleKeypad('8')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">8</button>
          <button onClick={() => handleKeypad('9')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">9</button>
          <button onClick={() => handleKeypad('*')} className="p-3 bg-matrix-green/10 border border-matrix-dim hover:bg-matrix-green hover:text-black text-matrix-green font-bold text-xl">×</button>
          <button onClick={() => handleKeypad('√')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-white">√</button>
          <button onClick={() => handleKeypad('4')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">4</button>
          <button onClick={() => handleKeypad('5')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">5</button>
          <button onClick={() => handleKeypad('6')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">6</button>
          <button onClick={() => handleKeypad('-')} className="p-3 bg-matrix-green/10 border border-matrix-dim hover:bg-matrix-green hover:text-black text-matrix-green font-bold text-xl">-</button>
          <button onClick={() => handleKeypad('π')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-white">π</button>
          <button onClick={() => handleKeypad('1')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">1</button>
          <button onClick={() => handleKeypad('2')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">2</button>
          <button onClick={() => handleKeypad('3')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">3</button>
          <button onClick={() => handleKeypad('+')} className="p-3 bg-matrix-green/10 border border-matrix-dim hover:bg-matrix-green hover:text-black text-matrix-green font-bold text-xl">+</button>
          <button onClick={() => handleKeypad('θ')} className="p-3 bg-matrix-dim/30 border border-matrix-dim hover:border-matrix-green text-white">θ</button>
          <button onClick={() => handleKeypad('.')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">.</button>
          <button onClick={() => handleKeypad('0')} className="p-3 border border-matrix-dim hover:border-matrix-green text-white font-bold text-xl">0</button>
          <button onClick={handleSolve} className="col-span-2 bg-matrix-green text-black font-bold text-xl hover:shadow-glow flex justify-center items-center gap-2">{loading ? <Activity className="animate-spin" /> : "EXECUTE"}</button>
        </div>

        {error && <div className="mb-8 p-4 border border-red-500 text-red-500 bg-red-900/10 font-bold">>> ERROR: {error}</div>}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="border border-matrix-green p-4 shadow-glow relative bg-matrix-dim/20 backdrop-blur-sm">
              <div className="absolute top-0 right-0 bg-matrix-green text-black text-xs px-2 py-1 font-bold">COMPUTED</div>

              {activeTab === 'trig' ? (
                <div className="space-y-6">
                  {trigMode === 'angle' && (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0 flex justify-center">
                        <MiniChart angleDeg={result.base_deg} coordsLatex={result.coords_latex} />
                      </div>
                      <div className="flex-grow space-y-4">
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-800 pb-4">
                          <div><div className="text-xs text-gray-500">Quadrant</div><div className="text-lg font-bold text-matrix-green">{result.quadrant}</div></div>
                          <div><div className="text-xs text-gray-500">Radian</div><div className="text-lg"><Latex>{`$\\displaystyle ${result.base_rad}$`}</Latex></div></div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Coterminal Angles</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-1 border border-matrix-dim"><span className="text-gray-600">Pos:</span> <Latex>{`$${result.base_deg}^\\circ$`}</Latex></div>
                            <div className="p-1 border border-matrix-dim"><span className="text-gray-600">Neg:</span> <Latex>{`$${result.neg_deg}^\\circ$`}</Latex></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {trigMode === 'func' && (
                    <>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 flex justify-center">
                          {/* التعديل الجديد: تمرير الإحداثيات result.coords_latex هنا أيضاً */}
                          <MiniChart
                            angleDeg={result.angles_analysis?.find(q => q.is_selected)?.angle_float || 45}
                            coordsLatex={result.coords_latex}
                          />
                        </div>
                        <div className="flex-grow grid grid-cols-3 gap-3 text-center">
                          {[{ l: 'sin', v: result.sin }, { l: 'cos', v: result.cos }, { l: 'tan', v: result.tan },
                          { l: 'csc', v: result.csc }, { l: 'sec', v: result.sec }, { l: 'cot', v: result.cot }].map((f) => (
                            <div key={f.l} className="border border-matrix-dim p-2 hover:bg-matrix-dim/40 transition">
                              <div className="text-xs text-gray-500 mb-1">{f.l}</div>
                              <div className="text-sm md:text-base"><Latex>{`$\\displaystyle ${f.v}$`}</Latex></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-xs text-gray-500 mb-2">SOLUTIONS IN QUADRANTS:</div>
                        <div className="grid grid-cols-4 gap-2">
                          {result.angles_analysis && result.angles_analysis.map((q) => (
                            <div key={q.quad} className={`p-2 border text-center ${q.is_selected ? 'border-matrix-green bg-matrix-green/10 shadow-glow-sm' : 'border-gray-800 text-gray-600'}`}>
                              <div className="text-[10px] font-bold">Q{q.quad}</div>
                              <div className="text-xs my-1"><Latex>{`$${q.angle_latex}^\\circ$`}</Latex></div>
                              <div className="text-[10px] text-gray-400"><Latex>{`$${q.value_latex}$`}</Latex></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-lg mb-4 border-b border-gray-800 pb-2 overflow-x-auto"><Latex>{`$${result.original_latex}$`}</Latex></div>
                  <div className="text-2xl font-bold text-center py-4 overflow-x-auto"><Latex>{`$${result.final_latex}$`}</Latex></div>
                  <div className="text-xs text-gray-500 mt-2">TYPE: {result.type}</div>
                </div>
              )}

              {result.benchmarks && (
                <div className="mt-8 pt-4 border-t border-gray-800 animate-pulse">
                  <h3 className="text-[10px] text-gray-500 mb-2 tracking-widest">EFFICIENCY REPORT:</h3>
                  <div className="flex justify-between items-end">
                    <div><div className="text-xs text-gray-600">HUMAN ESTIMATE Average</div><div className="text-sm font-bold text-red-400">{result.benchmarks.human_time}s</div></div>
                    <div className="text-right"><div className="text-xs text-gray-600">MACHINE TIME</div><div className="text-sm font-bold text-matrix-green">{result.benchmarks.machine_time}s</div></div>
                  </div>
                  <div className="w-full bg-gray-900 h-2 mt-2 rounded-full overflow-hidden"><div className="bg-matrix-green h-full w-full shadow-[0_0_10px_#00ff41]"></div></div>
                  <div className="text-center mt-2 text-xs font-bold text-matrix-green">>> MACHINE IS {result.benchmarks.speedup.toLocaleString()}x FASTER</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- FOOTER / DESIGNER IDENTITY --- */}
      <footer className="w-full max-w-3xl mt-12 pt-6 border-t border-matrix-dim flex flex-col items-center gap-4">
        <div className="text-matrix-green font-bold tracking-widest text-sm">
          DESIGNED BY <span className="text-white">ABDELRAHMAN ABDELKARIM</span> | AVA43
        </div>
        <div className="flex gap-6">
          <a href="https://wa.me/+201093216167" target="_blank" className="flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors text-xs">
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a href="https://t.me/avax43" target="_blank" className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors text-xs">
            <Send size={16} /> Telegram
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;