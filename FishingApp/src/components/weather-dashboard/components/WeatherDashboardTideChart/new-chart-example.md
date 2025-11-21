{/* --- ADVANCED TIDE CHART --- */}
        <div className="mb-5">
          <div className="flex justify-between items-end mb-3 px-1">
             <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2"><Waves size={14} className="text-blue-400" /> Παλίρροια</h3>
             
             {/* 4-State Controls */}
             <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
               {['low', 'rising', 'high', 'falling'].map((t) => (
                 <button 
                  key={t} 
                  onClick={(e) => { e.stopPropagation(); setTideState(t); }} 
                  className={`px-2 py-0.5 text-[8px] rounded-md uppercase font-bold transition-all ${tideState === t ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   {t === 'low' ? 'Χαμηλή' : t === 'rising' ? 'Ανεβαίνει' : t === 'high' ? 'Υψηλή' : 'Κατεβαίνει'}
                 </button>
               ))}
             </div>
          </div>
          
          <div className="w-full bg-slate-900/40 border border-slate-800 rounded-3xl relative overflow-hidden group">
            
            {/* Header for Next Tides */}
            <div className="p-3 pb-0 flex justify-between text-[9px] text-slate-400 font-mono uppercase tracking-wider border-b border-white/5 bg-black/20">
               <div>Επομενη Πλημμυριδα: <span className="text-white">{currentData.nextHighTide}</span></div>
               <div>Επομενη Αμπωτη: <span className="text-white">{currentData.nextLowTide}</span></div>
            </div>

            {/* Restored height: h-32 */}
            <div className="h-32 w-full relative">
                <svg className="w-full h-full absolute bottom-0 transition-all duration-500" preserveAspectRatio="none" viewBox="0 0 300 100">
                   <defs><linearGradient id="tideGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
                   
                   {/* Curve */}
                   <path d="M0,80 C60,80 90,20 150,20 S240,80 300,80 V100 H0 Z" fill="url(#tideGradient)" />
                   <path d="M0,80 C60,80 90,20 150,20 S240,80 300,80" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                   
                   {/* Indicator Line */}
                   <line x1={svgMarkerX} y1="0" x2={svgMarkerX} y2="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" className="transition-all duration-500 ease-out" />
                   
                   {/* Indicator Dots */}
                   <circle cx={svgMarkerX} cy={svgMarkerY} r="8" fill="#10b981" opacity="0.3" className="transition-all duration-500 ease-out animate-pulse" />
                   <circle cx={svgMarkerX} cy={svgMarkerY} r="4" fill="white" stroke="#10b981" strokeWidth="2" className="transition-all duration-500 ease-out" />
                </svg>
                
                {/* Centered Dynamic Label - MOVED DOWN (mt-10 added) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-10">
                   <div className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 backdrop-blur-md shadow-lg flex flex-col items-center animate-fade-in z-10">
                      <span className="text-[7px] text-slate-400 uppercase tracking-widest">Τωρα</span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                        {tideLabel} <span className="text-white text-[9px] font-mono ml-0.5">{tideTime}</span>
                      </span>
                   </div>
                </div>

                {/* Axis Labels */}
                <div className="absolute bottom-2 left-3 text-[8px] text-slate-500 font-mono">0m</div>
                <div className="absolute top-8 left-3 text-[8px] text-slate-500 font-mono">1.5m</div>
            </div>
          </div>
        </div>


        THis is how it should look like, the interpolation and anything only affect the animation of the ball , not the lines (wave)