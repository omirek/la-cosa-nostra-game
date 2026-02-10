import React from 'react';
import type { CardData } from '../types/game';
import { 
  Briefcase, DollarSign, Crosshair, Skull, Gavel, ShieldAlert, 
  Building2, User, Sparkles,
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  ArrowDown, ArrowUp, Plus, Minus, Eye, FileText, Files
} from 'lucide-react';
import clsx from 'clsx';

interface GameCardProps {
  card: CardData;
  scale?: number;
  onClick?: () => void;
}

// Helper: Wyświetlanie kostek
const DiceIcon = ({ value, size = 20 }: { value: number, size?: number }) => {
  switch (value) {
    case 1: return <Dice1 size={size} />;
    case 2: return <Dice2 size={size} />;
    case 3: return <Dice3 size={size} />;
    case 4: return <Dice4 size={size} />;
    case 5: return <Dice5 size={size} />;
    case 6: return <Dice6 size={size} />;
    default: return <div className="font-bold text-lg">?</div>;
  }
};

// Helper: Dobór tła głównego (Ikona)
const getMainIcon = (card: CardData) => {
  const opacity = "opacity-10";
  const size = 64;

  if (card.type === 'INFLUENCE') {
    const name = card.name.toLowerCase();
    if (name.includes('stronnik')) return <div className={`flex items-center ${opacity}`}><Dice6 size={40} /><ArrowDown size={40} /></div>;
    if (name.includes('sabotaż')) return <div className={`flex items-center ${opacity}`}><Dice1 size={40} /><ArrowUp size={40} /></div>;
    if (name.includes('pistolet')) return <div className={`flex items-center ${opacity}`}><Plus size={40} /><Crosshair size={40} /></div>;
    if (name.includes('rozproszenie')) return <div className={`flex items-center ${opacity}`}><Minus size={40} /><Crosshair size={40} /></div>;
    if (name.includes('kapuś')) return <div className={`flex items-center ${opacity}`}><FileText size={40} /><Eye size={40} /></div>;
    if (name.includes('szpieg')) return <div className={`flex items-center ${opacity}`}><Files size={40} /><Eye size={40} /></div>;
    return <Briefcase size={size} className={opacity} />;
  }
  
  if (card.type === 'GANGSTER') return <Skull size={size} className={opacity} />;
  
  if (card.type === 'BUSINESS') {
    if (card.subtype === 'FIRMA') return <Building2 size={size} className={opacity} />;
    return <User size={size} className={opacity} />;
  }
  
  if (card.type === 'ORDER') {
    if (card.subtype === 'ATAK') return <Crosshair size={size} className={opacity} />;
    if (card.subtype === 'ZLECENIE') return <DollarSign size={size} className={opacity} />;
    if (card.subtype === 'REAKCJA') return <ShieldAlert size={size} className={opacity} />;
    return <Sparkles size={size} className={opacity} />;
  }

  return <Gavel size={size} className={opacity} />;
};

export const GameCard: React.FC<GameCardProps> = ({ card, scale = 1, onClick }) => {
  
  // --- 1. ZAKTUALIZOWANA LOGIKA KOLORÓW ---
  const getColors = () => {
    let bg = 'bg-stone-900 border-stone-600';
    let header = 'bg-stone-800';
    let text = 'text-stone-100';

    if (card.type === 'GANGSTER') {
        bg = 'bg-stone-900 border-stone-600';
        header = 'bg-stone-800';
    } else if (card.type === 'BUSINESS') {
        bg = 'bg-emerald-950 border-emerald-700';
        header = 'bg-emerald-900';
        text = 'text-emerald-50';
    } else if (card.type === 'INFLUENCE') {
        bg = 'bg-slate-900 border-slate-600';
        header = 'bg-slate-800';
        text = 'text-slate-50';
    } else if (card.type === 'ORDER') {
        // Wszystkie rozkazy mają to samo ciało (ciemnoczerwone/bordowe)
        bg = 'bg-red-950 border-red-800';
        text = 'text-red-50';

        // Tylko belka nagłówka się zmienia
        if (card.subtype === 'ZLECENIE') {
            header = 'bg-amber-700'; // Złoty/Bursztynowy dla Zleceń ($)
        } else if (card.subtype === 'REAKCJA') {
            header = 'bg-indigo-900'; // Granatowy dla Reakcji (Obrona)
        } else if (card.subtype === 'NONE' || card.subtype === 'SPECJALNA') {
            header = 'bg-fuchsia-900'; // Fioletowy dla Specjalnych
        } else {
            header = 'bg-red-900'; // Czerwony dla Ataków (Domyślny)
        }
    }
    return { bg, header, text };
  };

  const { bg, header, text } = getColors();
  const isNameLong = card.name.length > 18;

  const getSubtypeLabel = () => {
      if (card.type === 'INFLUENCE') return null;
      if (card.type === 'ORDER' && card.subtype === 'NONE') return 'SPECJALNA';
      return card.subtype;
  };

  return (
    <div 
      onClick={onClick}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className={clsx(
        "w-56 h-80 rounded-xl border-[3px] relative shadow-2xl flex flex-col select-none transition-all hover:brightness-110 cursor-pointer overflow-hidden font-sans group",
        bg, text
      )}
    >
      {/* --- NAGŁÓWEK --- */}
      <div className={clsx("h-8 flex items-center relative overflow-hidden border-b border-white/20", header)}>
         {isNameLong ? (
             <div className="whitespace-nowrap font-bold uppercase tracking-wide text-sm animate-marquee pl-2 text-white shadow-sm">
                {card.name} &nbsp; • &nbsp; {card.name} &nbsp; • &nbsp;
             </div>
         ) : (
             <div className="w-full text-center font-bold uppercase tracking-wide text-sm text-white shadow-sm">
                {card.name}
             </div>
         )}
      </div>

      {/* --- SUB-NAGŁÓWEK --- */}
      {(getSubtypeLabel() || card.target || card.family) && (
        <div className="flex justify-center items-center px-1 py-0.5 text-[9px] uppercase font-bold tracking-widest bg-black/30 border-b border-white/5">
            {getSubtypeLabel() && <span className="opacity-90">{getSubtypeLabel()}</span>}
            
            {card.target && (
                <>
                  {getSubtypeLabel() && <span className="mx-1 opacity-50">•</span>}
                  <span className="text-yellow-500">{card.target}</span>
                </>
            )}

            {card.family && (
                <>
                  <span className="mx-1 opacity-50">•</span>
                  <span className="text-yellow-500">{card.family}</span>
                </>
            )}
        </div>
      )}

      {/* --- TREŚĆ --- */}
      <div className="flex-1 flex flex-col p-2 relative">
        <div className="absolute inset-0 flex items-start pt-8 justify-center pointer-events-none z-0">
           {getMainIcon(card)}
        </div>

        <div className="z-10 flex flex-col h-full gap-2">
            {(card.description || card.specialCost) && (
                <div className="bg-black/50 p-1.5 rounded text-[10px] italic text-center leading-tight border border-white/5 shadow-sm mt-1">
                    {card.type === 'GANGSTER' && card.specialCost ? (
                        <span className="font-bold text-yellow-200 not-italic block mb-1 uppercase text-[9px]">
                            {card.specialCost}
                        </span>
                    ) : null}
                    {card.description}
                </div>
            )}

            {card.requirements && (
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {card.requirements.map((req, i) => (
                        <span key={i} className="bg-gray-800 border border-gray-500 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-gray-300">
                            {req}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-auto space-y-1">
                {card.options && card.options.map((opt, index) => (
                    <div key={opt.id}>
                        {index > 0 && (
                            <div className="flex items-center justify-center my-0.5 opacity-70">
                                <div className="h-px bg-current w-full opacity-30"></div>
                                <span className="text-[8px] font-bold px-1 uppercase">LUB</span>
                                <div className="h-px bg-current w-full opacity-30"></div>
                            </div>
                        )}

                        <div className={clsx(
                            "bg-black/70 rounded border flex flex-col p-1.5 shadow-md backdrop-blur-sm",
                            card.type === 'ORDER' ? "border-white/20" : "border-white/10"
                        )}>
                            {(opt.diceReq || opt.amount) && (
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex gap-1 text-yellow-400">
                                        {opt.diceReq ? opt.diceReq.map((val, i) => (
                                            <DiceIcon key={i} value={val} size={22} />
                                        )) : opt.diceSymbol && (
                                            <span className="text-lg tracking-widest font-bold">{opt.diceSymbol}</span>
                                        )}
                                    </div>
                                    {opt.amount && (
                                        <span className="text-green-400 font-bold text-sm bg-black/60 px-1.5 rounded border border-green-900">
                                            ${opt.amount}
                                        </span>
                                    )}
                                </div>
                            )}
                            {opt.text && (
                                <div className="text-[10px] leading-tight font-medium opacity-90 text-center">
                                    {opt.text}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- STOPKA --- */}
      <div className="mt-auto bg-black/50 border-t border-white/10 px-3 h-7 flex justify-between items-center text-xs font-bold relative">
         <div className="w-1/3">
            {card.cost && card.cost > 0 ? (
                <span className="text-red-400">${card.cost}</span>
            ) : null}
         </div>

         <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase text-gray-400 tracking-wider">
             {card.type === 'GANGSTER' && card.strength && card.strength > 0 ? (
                 <div className="flex gap-0.5 text-red-500">
                     {Array.from({ length: card.strength }).map((_, i) => <Crosshair key={i} size={18} strokeWidth={3} />)}
                 </div>
             ) : (
                 card.phase
             )}
         </div>

         <div className="w-1/3 text-right">
            {card.income && card.income > 0 ? (
                <div className="flex items-center justify-end gap-1 text-green-400">
                     <DollarSign size={14} strokeWidth={3} /><span>{card.income}</span>
                </div>
            ) : null}
         </div>
      </div>
    </div>
  );
};