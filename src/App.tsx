import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  ChevronRight, 
  RotateCcw, 
  ArrowRight,
  Zap,
  Smile,
  Weight,
  MessageSquare,
  Trophy,
  History,
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";

import { CASES as INITIAL_CASES, WEEKLY_CHALLENGES } from './constants';
import { Case, Challenge, Choice, SimulationState } from './types';
import { cn } from './lib/utils';

// --- Gemini API Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateNewCases = async (): Promise<Case[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate 2 unique and diverse patient case studies for a weight management coach. One should be a younger adult and one an older adult. Ensure their lifestyles and goals are realistic and varied.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["id", "name", "age", "initialWeight", "energy", "mood", "lifestyle", "avatar", "goal"],
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            age: { type: Type.NUMBER },
            initialWeight: { type: Type.NUMBER, description: "Weight in kg, range 60-120" },
            energy: { type: Type.NUMBER, description: "0-100 initial energy" },
            mood: { type: Type.NUMBER, description: "0-100 initial mood" },
            lifestyle: { type: Type.STRING },
            avatar: { type: Type.STRING, description: "A single emoji representing the person" },
            goal: { type: Type.STRING }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return INITIAL_CASES;
  }
};

// --- Components ---

const MetricBar = ({ 
  label, 
  value, 
  icon: Icon, 
  colorClass 
}: { 
  label: string; 
  value: number; 
  icon: any; 
  colorClass: string;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      <div className="flex items-center gap-1">
        <Icon size={12} /> {label}
      </div>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        className={cn("h-full", colorClass)}
      />
    </div>
  </div>
);

const StatCard = ({ label, value, unit, subtext }: { label: string; value: string | number; unit?: string; subtext?: string }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-800">
      {value} <span className="text-xs font-normal text-slate-400 uppercase">{unit}</span>
    </div>
    {subtext && <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase">{subtext}</div>}
  </div>
);

export default function App() {
  const [availableCases, setAvailableCases] = useState<Case[]>(INITIAL_CASES);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [gameState, setGameState] = useState<SimulationState | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const startSimulation = (c: Case) => {
    setSelectedCase(c);
    setGameState({
      currentWeek: 0,
      weight: c.initialWeight,
      energy: c.energy,
      mood: c.mood,
      history: [{ week: 0, weight: c.initialWeight, energy: c.energy, mood: c.mood, choiceLabel: 'Baseline' }]
    });
    setLastFeedback(null);
    setShowSummary(false);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    const newCases = await generateNewCases();
    setAvailableCases(newCases);
    setIsGenerating(false);
  };

  const handleChoice = (choice: Choice) => {
    if (!gameState) return;

    const nextWeight = gameState.weight + choice.impactWeight;
    const nextEnergy = Math.min(100, Math.max(0, gameState.energy + choice.impactEnergy));
    const nextMood = Math.min(100, Math.max(0, gameState.mood + choice.impactMood));
    const nextWeek = gameState.currentWeek + 1;

    const newState = {
      currentWeek: nextWeek,
      weight: nextWeight,
      energy: nextEnergy,
      mood: nextMood,
      history: [
        ...gameState.history,
        {
          week: nextWeek,
          weight: nextWeight,
          energy: nextEnergy,
          mood: nextMood,
          choiceLabel: choice.label
        }
      ]
    };

    setGameState(newState);
    setLastFeedback(choice.feedback);

    if (nextWeek === WEEKLY_CHALLENGES.length) {
      setTimeout(() => setShowSummary(true), 1500);
    }
  };

  const reset = () => {
    setSelectedCase(null);
    setGameState(null);
    setLastFeedback(null);
    setShowSummary(false);
  };

  if (!selectedCase || !gameState) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-20">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest">
              Nutrition Simulation Lab
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">ScaleWise Lab</h1>
              <button 
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Regenerate AI Case Studies
              </button>
            </div>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              Explore dynamic weight management scenarios. Use AI to generate new client profiles and test your intervention strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {availableCases.map((c, idx) => (
              <motion.button
                key={c.id || idx}
                whileHover={{ y: -5 }}
                onClick={() => startSimulation(c)}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 text-left space-y-6 hover:shadow-2xl hover:border-indigo-200 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                   <Info size={120} />
                </div>
                <div className="text-6xl">{c.avatar}</div>
                <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-bold text-slate-800">{c.name}, {c.age}</h3>
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{c.goal}</div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {c.lifestyle}
                  </p>
                </div>
                <div className="flex items-center text-sm font-bold text-indigo-600">
                  Select Case <ChevronRight size={16} className="ml-1" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentChallenge = WEEKLY_CHALLENGES[gameState.currentWeek];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Metrics and Progress */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white">
              <BarChart3 size={18} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">ScaleWise</span>
          </div>
          <button onClick={reset} className="text-slate-400 hover:text-slate-600"><RotateCcw size={18} /></button>
        </div>

        <div className="flex-1 p-8 space-y-10 overflow-y-auto">
          <div className="space-y-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Profile</div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
               <div className="text-4xl">{selectedCase.avatar}</div>
               <div>
                  <div className="font-bold text-slate-800">{selectedCase.name}</div>
                  <div className="text-xs text-slate-400">Week {gameState.currentWeek + 1} of 4</div>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vital Metrics</div>
            <MetricBar label="Energy Level" value={gameState.energy} icon={Zap} colorClass="bg-amber-400" />
            <MetricBar label="Emotional Mood" value={gameState.mood} icon={Smile} colorClass="bg-indigo-400" />
            <StatCard 
              label="Body Weight" 
              value={gameState.weight.toFixed(1)} 
              unit="kg" 
              subtext={gameState.currentWeek > 0 ? `${(gameState.weight - selectedCase.initialWeight).toFixed(1)}kg Total Change` : "Baseline Established"}
            />
          </div>

          <div className="space-y-4">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulation Log</div>
             <div className="space-y-3">
               {gameState.history.slice(1).map((h, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                     <span className="font-bold text-slate-300">W{h.week}</span>
                     <span className="text-slate-500 font-medium truncate">{h.choiceLabel}</span>
                  </div>
               ))}
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto scrollbar-hide relative bg-bg-base">
        <AnimatePresence mode="wait">
          {showSummary ? (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-10"
            >
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy size={32} />
                 </div>
                 <h2 className="text-4xl font-bold">Lab Result: Month Complete</h2>
                 <p className="text-slate-500">You've successfully piloted {selectedCase.name} through 4 weeks of lifestyle challenges.</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Final Weight</div>
                    <div className="text-3xl font-bold text-slate-800">{gameState.weight.toFixed(1)}kg</div>
                    <div className={cn("text-xs font-bold mt-1", (gameState.weight - selectedCase.initialWeight) <= 0 ? "text-emerald-500" : "text-red-500")}>
                       {(gameState.weight - selectedCase.initialWeight).toFixed(1)}kg Over Month
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Final Energy</div>
                    <div className="text-3xl font-bold text-slate-800">{Math.round(gameState.energy)}%</div>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Final Mood</div>
                    <div className="text-3xl font-bold text-slate-800">{Math.round(gameState.mood)}%</div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <h3 className="text-xl font-bold flex items-center gap-2"><BarChart3 size={20} className="text-indigo-600" /> Data Visualisation</h3>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={gameState.history}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="week" hide />
                         <YAxis domain={['auto', 'auto']} hide />
                         <Tooltip />
                         <Area type="monotone" dataKey="weight" stroke="#6366f1" fill="#6366f120" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <button 
                onClick={reset}
                className="w-full py-4 gradient-bg text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                Restart New Lab <RotateCcw size={18} />
              </button>
            </motion.div>
          ) : currentChallenge ? (
            <motion.div 
               key={currentChallenge.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
            >
               <div className="max-w-3xl space-y-10">
                  <div className="space-y-4">
                    <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Case Study Challenge: Week {gameState.currentWeek + 1}</div>
                    <h2 className="text-4xl font-bold text-slate-800 leading-tight">{currentChallenge.title}</h2>
                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                      {currentChallenge.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Choose Your Path</div>
                    <div className="grid gap-4">
                      {currentChallenge.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChoice(option)}
                          className="group bg-white p-6 rounded-3xl border border-slate-200 text-left hover:border-indigo-600 hover:shadow-xl transition-all flex justify-between items-center"
                        >
                          <span className="text-lg font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {option.label}
                          </span>
                          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <ArrowRight size={20} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {lastFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-200 flex gap-6 items-start"
                      >
                        <div className="p-3 bg-white/20 rounded-2xl shrink-0">
                           <MessageSquare size={24} />
                        </div>
                        <div className="space-y-2">
                           <div className="text-xs font-bold uppercase tracking-widest opacity-70">Clinical Explanation</div>
                           <p className="text-lg leading-relaxed font-medium italic">
                             "{lastFeedback}"
                           </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
