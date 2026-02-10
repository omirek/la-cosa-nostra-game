import React from 'react';
import type { CardData } from '../types/game';
import { 
  Briefcase, DollarSign, Crosshair, Skull, Gavel, ShieldAlert, 
  Building2, User, Banknote, Sparkles, AlertTriangle,
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 
} from 'lucide-react';
import clsx from 'clsx';

interface GameCardProps {
  card: CardData;
  scale?: number;
  onClick?: () => void;
}

// Helper do wyświetlania kostek
const DiceIcon = ({ value, size = 16 }: { value: number, size?: number }) => {
  switch (value) {
    case 1: return <Dice1 size={size} />;
    case 2: return <Dice2 size={size} />;
    case 3: return <Dice3 size={size} />;
    case 4: return <Dice4 size={size} />;
    case 5: return <Dice5 size={size} />;
    case 6: return <Dice6 size={size} />;
    default: return <div className="font-bold">?</div>;
  }
};

// Helper do wyboru głównej ikony karty
const getMainIcon = (card: CardData) => {
  if (card.type === 'GANGSTER') return <Skull size={56} className="opacity-20" />;
  
  if (card.type === 'BUSINESS') {
    // Rozróżnienie Firma vs Biznesmen
    if (card.subtype === 'FIRMA') return <Building2 size={56} className="opacity-20" />;
    return <User size={56} className="opacity-20" />;
  }
  
  if (card.type === 'ORDER') {
    if (card.subtype === 'ATAK') return <Crosshair size={56} className="opacity-20" />;
    if (card.subtype === 'ZLECENIE') return <Banknote size={56} className="opacity-20" />;
    if (card.subtype === 'REAKCJA') return <ShieldAlert size={56} className="opacity-20" />;
    return <Sparkles size={56} className="opacity-20" />; // Specjalne
  }
  
  if (card.type === 'INFLUENCE') {
      if (card.subtype === 'UTRUDNIENIE') return <AlertTriangle size={56} className="opacity-20" />;
      return <Briefcase size={56} className="opacity-20" />;
  }

  return <Gavel size={56} className="opacity-20" />;
};

export const GameCard: React.FC<GameCardProps> = ({ card, scale = 1, onClick }) => {
  
  const bgColors: Record<string, string> = {
    GANGSTER: 'bg-stone-900 text-stone-100 border-stone-600',
    BUSINESS: 'bg-emerald-950 text-emerald-50 border-emerald-600',
    ORDER: 'bg-red-950 text-red-50 border-red-800',
    INFLUENCE: 'bg-slate-900 text-slate-50 border-slate-600',
    UNKNOWN: 'bg-gray-800 text-gray-300 border-gray-500',
  };

  // Kolor belki z nazwą (nieco jaśniejszy od tła)
  const headerColors: Record<string, string> = {
    GANGSTER: 'bg-stone-800',
    BUSINESS: 'bg-emerald-900',
    ORDER: 'bg-red-900',
    INFLUENCE: 'bg-slate-800',
    UNKNOWN: 'bg-gray-700',
  };

  const bgColor = bgColors[card.type] || bgColors.UNKNOWN;
  const headerColor = headerColors[card.type] || headerColors.UNKNOWN;

  return (
    <div 
      onClick={onClick}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className={clsx(
        "w-56 h-80 rounded-xl border-[3px] relative shadow-2xl flex flex-col select-none transition-all hover:brightness-110 cursor-pointer overflow-hidden group font-sans",
        bgColor
      )}
    >
      {/* --- 1. NAGŁÓWEK (Scrolling Text) --- */}
      <div className={clsx("h-8 flex items-center px-2 relative overflow-hidden border-b border-white/20", headerColor)}>
         <div className="whitespace-nowrap font-bold uppercase tracking-wide text-sm group-hover:-translate-x-1/2 transition-transform duration-[3000ms] ease-linear">
            {card.name} {card.name.length > 20 && <span className="opacity-50 mx-4">{card.name}</span>}
         </div>
      </div>

      {/* --- 2. SUB-NAGŁÓWEK (Typ, Faza) --- */}
      <div className="flex justify-between items-center px-2 py-1 text-[9px] uppercase font-bold tracking-widest opacity-80 bg-black/20">
         <div className="flex gap-1">
             <span>{card.subtype !== 'NONE' ? card.subtype : 'SPECJALNA'}</span>
             {card.family && <span className="text-yellow-500"> • {card.family}</span>}
         </div>
         {/* Faza zagrania (Wpływy) */}
         {card.phase && <span className="text-blue-300">{card.phase.replace('Faza ', '')}</span>}
      </div>

      <div className="flex-1 flex flex-col p-2 relative">
        
        {/* TŁO IKONOWE (Zawsze na środku) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
           {getMainIcon(card)}
        </div>

        {/* TREŚĆ (Z-Index wyżej) */}
        <div className="z-10 flex flex-col h-full gap-2">
            
            {/* Opis fabularny/instrukcja */}
            {card.description && (
                <div className="bg-black/40 p-1.5 rounded text-[10px] italic text-center leading-tight border border-white/5 shadow-sm">
                    {card.description}
                </div>
            )}

            {/* Wymagania (Requirements) */}
            {card.requirements && (
                <div className="flex flex-wrap justify-center gap-1">
                    {card.requirements.map((req, i) => (
                        <span key={i} className="bg-gray-800 border border-gray-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                            {req}
                        </span>
                    ))}
                </div>
            )}

            {/* OPCJE (Lista efektów) */}
            <div className="mt-auto space-y-1">
                {card.options && card.options.map((opt, index) => (
                    <div key={opt.id}>
                        {/* Separator LUB */}
                        {index > 0 && (
                            <div className="flex items-center justify-center my-0.5">
                                <div className="h-px bg-white/20 w-full"></div>
                                <span className="text-[9px] font-bold px-1 text-yellow-500">LUB</span>
                                <div className="h-px bg-white/20 w-full"></div>
                            </div>
                        )}

                        <div className={clsx(
                            "bg-black/60 rounded border flex flex-col p-1.5 shadow-md backdrop-blur-sm",
                            card.type === 'ORDER' ? "border-red-500/30" : "border-blue-500/30"
                        )}>
                            {/* Góra opcji: Kostki i Kwota */}
                            <div className="flex justify-between items-center mb-1">
                                {/* Kostki */}
                                <div className="flex gap-0.5 text-yellow-400">
                                    {opt.diceReq && opt.diceReq.map((val, i) => (
                                        <DiceIcon key={i} value={val} size={14} />
                                    ))}
                                    {/* Jeśli nie ma kostek w JSON, a jest symbol braille'a (fallback) */}
                                    {!opt.diceReq && opt.diceSymbol && (
                                        <span className="text-xs tracking-widest">{opt.diceSymbol}</span>
                                    )}
                                </div>
                                {/* Kwota */}
                                {opt.amount && (
                                    <span className="text-green-400 font-bold text-xs bg-black/50 px-1 rounded">
                                        ${opt.amount}
                                    </span>
                                )}
                            </div>
                            
                            {/* Tekst Akcji */}
                            {opt.text && (
                                <div className="text-[10px] leading-tight font-medium opacity-90">
                                    {opt.text}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- 3. STOPKA (Statystyki) --- */}
      <div className="mt-auto bg-black/40 border-t border-white/10 px-2 py-1.5 h-8 flex justify-between items-center text-xs">
         
         {/* LEWA: Koszt */}
         <div className="font-bold">
            {card.specialCost ? (
                <span className="text-[9px] text-gray-400 uppercase leading-none block w-16">{card.specialCost}</span>
            ) : card.cost && card.cost > 0 ? (
                <span className="text-red-400">-${card.cost}</span>
            ) : null}
         </div>

         {/* ŚRODEK: Siła (Tylko Gangster) */}
         {card.type === 'GANGSTER' && card.strength && card.strength > 0 && (
             <div className="flex gap-0.5 text-red-500 absolute left-1/2 -translate-x-1/2">
                 {Array.from({ length: card.strength }).map((_, i) => <Crosshair key={i} size={16} fill="currentColor" />)}
             </div>
         )}

         {/* PRAWA: Dochód */}
         <div className="font-bold text-right">
            {card.income && card.income > 0 ? (
                <div className="flex items-center gap-1 text-green-400">
                     <DollarSign size={12} /><span>{card.income}</span>
                </div>
            ) : null}
         </div>
      </div>
    </div>
  );
};