import React from 'react';
import type { CardData } from '../types/game';
import { Briefcase, DollarSign, Crosshair, Skull } from 'lucide-react';
// Z powyższego importu na razie usuwam ShieldAlert i Gavel, bo są nieużywane i wywala błąd
import clsx from 'clsx';

interface GameCardProps {
  card: CardData;
  scale?: number;
}

export const GameCard: React.FC<GameCardProps> = ({ card, scale = 1 }) => {
  
  // Kolory tła w zależności od typu
  const bgColors = {
    GANGSTER: 'bg-stone-800 text-stone-100 border-stone-600',
    BUSINESS: 'bg-emerald-900 text-emerald-50 border-emerald-600',
    ORDER: 'bg-red-900 text-red-50 border-red-700',
    INFLUENCE: 'bg-blue-900 text-blue-50 border-blue-700',
    BOSS: 'bg-yellow-900 text-yellow-50 border-yellow-600',
  };

  return (
    <div 
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      className={clsx(
        "w-48 h-72 rounded-xl border-4 relative shadow-xl flex flex-col p-3 select-none transition-all hover:brightness-110 cursor-pointer m-2",
        bgColors[card.type]
      )}
    >
      {/* GÓRA: Nazwa i Koszt */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm leading-tight uppercase flex-1">{card.name}</h3>
        {card.cost !== undefined && (
          <div className="bg-black/40 px-2 py-1 rounded text-green-400 font-mono text-xs border border-green-800">
            ${card.cost}
          </div>
        )}
      </div>

      {/* ŚRODEK: Ikona */}
      <div className="flex-1 bg-black/20 rounded border border-white/10 flex items-center justify-center mb-2">
        {card.type === 'GANGSTER' && <Skull size={64} className="opacity-20" />}
        {card.type === 'BUSINESS' && <Briefcase size={64} className="opacity-20" />}
        {card.type === 'ORDER' && <Crosshair size={64} className="opacity-20" />}
      </div>

      {/* Opis */}
      <div className="text-xs opacity-80 text-center h-12 overflow-hidden">
        {card.description}
      </div>

      {/* DÓŁ: Statystyki */}
      <div className="mt-auto border-t border-white/20 pt-2 flex justify-between items-center h-8">
        {/* Siła Gangstera */}
        {card.type === 'GANGSTER' && card.strength && (
          <div className="flex gap-1 text-red-400 mx-auto">
            {Array.from({ length: card.strength }).map((_, i) => (
              <Crosshair key={i} size={16} fill="currentColor" />
            ))}
          </div>
        )}
        {/* Dochód Biznesu */}
        {card.type === 'BUSINESS' && card.income && (
          <div className="flex items-center gap-1 text-yellow-400 font-bold mx-auto">
            <DollarSign size={16} /> +{card.income}
          </div>
        )}
      </div>
    </div>
  );
};