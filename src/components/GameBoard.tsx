// src/components/GameBoard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { GameCard } from './GameCard';
import cardsData from '../data/cards.json';
import type { GameState } from '../types/gameState';
import type { CardData } from '../types/game';

const ALL_CARDS = cardsData as CardData[];

const getCard = (id: string) => ALL_CARDS.find(c => c.id === id);

interface GameBoardProps {
  gameId: string;
  myId: string;
  initialState: GameState;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameId, myId, initialState }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);

  useEffect(() => {
    console.log("Subskrybuję zmiany w grze:", gameId);
    const channel = supabase
      .channel(`game_board:${gameId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'games', 
        filter: `id=eq.${gameId}` 
      }, (payload) => {
        if (payload.new.game_state) {
          console.log("Nowy stan gry!", payload.new.game_state);
          setGameState(payload.new.game_state as GameState);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [gameId]);

  const myPlayer = gameState.players.find(p => p.id === myId);
  const opponents = gameState.players.filter(p => p.id !== myId);

  if (!myPlayer) return <div className="text-white p-10">Ładowanie stołu... (lub błąd: nie ma Cię w grze)</div>;

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col p-2 overflow-hidden">
      
      {/* 1. GÓRA: MIESTO */}
      <div className="bg-stone-800 p-2 rounded-lg mb-2 shadow-lg border border-white/10">
        <h3 className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">Miasto (Rynek)</h3>
        <div className="flex justify-center gap-2">
          {gameState.market.map((cardId) => {
            const card = getCard(cardId);
            return card ? <GameCard key={cardId} card={card} scale={0.6} /> : null;
          })}
        </div>
      </div>

      {/* 2. ŚRODEK: PRZECIWNICY */}
      <div className="flex-1 flex justify-center gap-4 items-start py-4">
        {opponents.map((opp) => (
          <div key={opp.id} className="bg-black/40 p-3 rounded-lg border border-white/10 min-w-[200px]">
             <div className="text-xs font-bold text-gray-300 mb-2 flex justify-between">
                <span>{opp.email.split('@')[0]}</span>
                <span className="text-green-400">${opp.money}</span>
             </div>
             
             {/* Karty na stole */}
             <div className="flex gap-1 flex-wrap justify-center mb-2">
                {opp.table.map((cardId) => {
                    const card = getCard(cardId);
                    return card ? <GameCard key={cardId} card={card} scale={0.45} /> : null;
                })}
             </div>
             
             {/* Karty na ręce (Rewersy) */}
             <div className="flex justify-center -space-x-8">
                {opp.hand.map((_, i) => (
                    <div key={i} className="w-10 h-14 bg-red-900 border border-white/20 rounded shadow-md relative z-0" style={{ zIndex: i }}></div>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* 3. DÓŁ: MOJE PODWÓRKO */}
      <div className="mt-auto bg-black/60 p-4 border-t border-red-900/50 backdrop-blur-sm rounded-t-2xl">
        <div className="flex justify-between items-end gap-8">
            
            {/* STÓŁ */}
            <div className="flex-1">
                <h3 className="text-xs font-bold text-yellow-500 mb-2 uppercase tracking-widest">
                    Twój Stół <span className="text-green-400 ml-2">${myPlayer.money}</span>
                </h3>
                <div className="flex gap-2">
                    {myPlayer.table.map((cardId) => {
                        const card = getCard(cardId);
                        return card ? <GameCard key={cardId} card={card} scale={0.8} /> : null;
                    })}
                </div>
            </div>

            {/* RĘKA */}
            <div>
                <h3 className="text-[10px] font-bold text-gray-400 mb-2 text-center uppercase">Twoja Ręka</h3>
                <div className="flex -space-x-12 px-4 pb-4">
                    {myPlayer.hand.map((cardId) => {
                        const card = getCard(cardId);
                        return card ? (
                            <div key={cardId} className="hover:-translate-y-6 transition-transform duration-200 z-10 hover:z-50 hover:scale-110">
                                <GameCard card={card} scale={0.85} />
                            </div>
                        ) : null;
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};