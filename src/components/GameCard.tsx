import React from 'react';
import type { CardData } from '../types/game';
import { Briefcase, DollarSign, Crosshair, Skull, Gavel } from 'lucide-react';
import clsx from 'clsx';

interface GameCardProps {
  card: CardData;
  scale?: number;
  onClick?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ card, scale = 1, onClick }) => {
  
  const bgColors = {
    GANGSTER: 'bg-stone-800 text-stone-100 border-stone-600',
    BUSINESS: 'bg-emerald-900 text-emerald-50 border-emerald-600',
    ORDER: 'bg-red-900 text-red-50 border-red-700',
    INFLUENCE: 'bg-blue-900 text-blue-50 border-blue-700',
    UNKNOWN: 'bg-gray-700 text-gray-300 border-gray-500',
  };

  return (
    <div 
      onClick={onClick}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className={clsx(
        "w-48 h-72 rounded-xl border-4 relative shadow-xl flex flex-col p-2 select-none transition-all hover:brightness-110 cursor-pointer overflow-hidden text-xs",
        bgColors[card.type] || 'bg-gray-700'
      )}
    >
      {/* NAGŁÓWEK */}
      <div className="flex justify-between items-start mb-1 pb-1 border-b border-white/20">
        <span className="font-bold leading-none uppercase truncate pr-1">{card.name}</span>
        {card.cost && (
           <span className="text-green-400 font-mono font-bold">${card.cost}</span>
        )}
      </div>

      {/* TYP / PODTYP */}
      <div className="flex justify-between text-[10px] opacity-70 mb-2 uppercase tracking-wider">
         <span>{card.subtype !== 'NONE' ? card.subtype : card.type}</span>
         {card.family && <span>{card.family}</span>}
      </div>

      {/* ILUSTRACJA (Ikona) */}
      <div className="flex justify-center mb-2">
         {card.type === 'GANGSTER' && <Skull size={48} className="opacity-30" />}
         {card.type === 'BUSINESS' && <Briefcase size={48} className="opacity-30" />}
         {card.type === 'ORDER' && <Crosshair size={48} className="opacity-30" />}
         {card.type === 'INFLUENCE' && <Gavel size={48} className="opacity-30" />}
      </div>

      {/* TREŚĆ KARTY */}
        <div className="flex-1 overflow-y-auto space-y-2">
          
          {/* Opis ogólny */}
          {card.description && (
            <p className="italic opacity-80 text-center px-1 leading-tight text-[10px]">{card.description}</p>
          )}

          {/* Wymagania */}
          {card.requirements && (
            <div className="bg-black/30 p-1 rounded">
               <span className="block text-[9px] text-gray-400">WYMAGA:</span>
               <div className="flex flex-wrap gap-1">
                 {card.requirements.map((req, i) => (
                   <span key={i} className="bg-gray-700 px-1 rounded text-[10px]">{req}</span>
                 ))}
               </div>
            </div>
          )}

          {/* OPCJE (Uniwersalne dla Rozkazów i Wpływów) */}
          {card.options && card.options.length > 0 && (
            <div className="space-y-1">
              {card.options.map((opt) => (
                <div key={opt.id} className="bg-black/20 p-1 rounded border border-white/10 flex flex-col gap-0.5">
                   {/* Nagłówek opcji (Kości lub Kwota) */}
                   {(opt.diceSymbol || opt.amount) && (
                     <div className="flex justify-between items-center">
                        {opt.diceSymbol && (
                          <div className="text-yellow-400 font-bold text-sm tracking-widest">{opt.diceSymbol}</div>
                        )}
                        {opt.amount && (
                          <div className="text-green-400 font-bold ml-auto">${opt.amount}</div>
                        )}
                     </div>
                   )}
                   
                   {/* Tekst akcji */}
                   {opt.text && (
                     <div className="leading-tight opacity-90 text-[10px]">{opt.text}</div>
                   )}
                </div>
              ))}
            </div>
          )}
        </div>

      {/* STOPKA */}
      <div className="mt-auto border-t border-white/20 pt-1 flex justify-between items-center h-6">
         {/* Siła Gangstera */}
         {card.strength && (
           <div className="flex gap-0.5 text-red-500">
             {Array.from({ length: card.strength }).map((_, i) => <Crosshair key={i} size={14} />)}
           </div>
         )}
         {/* Dochód */}
         {card.income && (
            <div className="flex items-center gap-1 text-yellow-400 font-bold ml-auto">
              <DollarSign size={14} /> {card.income}
            </div>
         )}
      </div>

    </div>
  );
};