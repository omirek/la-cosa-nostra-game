import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { GameCard } from './GameCard';
import cardsData from '../data/cards.json';
import type { GameState } from '../types/gameState';
import type { CardData } from '../types/game';
import { Handshake } from 'lucide-react';

const ALL_CARDS = cardsData as CardData[];
const getCard = (id: string) => ALL_CARDS.find(c => c.id === id);

interface GameBoardProps {
  gameId: string;
  myId: string;
  initialState: GameState;
  isHost: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameId, myId, initialState, isHost }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);

  useEffect(() => {
    const channel = supabase.channel(`game_board:${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, 
      (payload) => { if (payload.new.game_state) setGameState(payload.new.game_state); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameId]);

  const myPlayer = gameState.players.find(p => p.id === myId);
  const opponents = gameState.players.filter(p => p.id !== myId);

  const nextPhase = async () => {
      let nextPhase = gameState.phase;
      let nextRound = gameState.round;
      if (gameState.phase === 'PLANNING') nextPhase = 'ACTION';
      else if (gameState.phase === 'ACTION') nextPhase = 'PAYOUT';
      else if (gameState.phase === 'PAYOUT') {
          nextPhase = 'PLANNING';
          nextRound += 1;
      }
      await supabase.from('games').update({
          game_state: { ...gameState, phase: nextPhase, round: nextRound }
      }).eq('id', gameId);
  };

  if (!myPlayer) return <div className="text-white">Błąd gracza</div>;

  return (
    <div className="h-screen bg-stone-900 text-white flex flex-col overflow-hidden relative font-sans">
      
      {/* 1. GÓRNY PASEK */}
      <div className="bg-black text-center py-1 border-b border-red-900 flex justify-between px-4 items-center shrink-0 h-10">
          <div className="font-mono text-yellow-500 font-bold text-xs">RUNDA {gameState.round}</div>
          <div className="text-sm font-bold uppercase tracking-widest">
              {gameState.phase === 'PLANNING' && 'Faza Planowania'}
              {gameState.phase === 'ACTION' && 'Faza Działania'}
              {gameState.phase === 'PAYOUT' && 'Wypłata'}
          </div>
          <div>
              {isHost && (
                  <button onClick={nextPhase} className="bg-red-700 hover:bg-red-600 text-[10px] px-2 py-1 rounded">
                      DALEJ {'>'}{'>'}
                  </button>
              )}
          </div>
      </div>

      {/* 2. GŁÓWNY OBSZAR (Scrollowany w pionie) */}
      <div className="flex-1 flex flex-col overflow-y-auto p-2 gap-2">
          
          {/* MIESTO */}
          <div className="bg-stone-800/50 p-2 rounded border border-white/5 shrink-0">
             <h3 className="text-[10px] text-center mb-1 text-gray-500 uppercase">Miasto</h3>
             <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                {gameState.market.map(cid => {
                    const c = getCard(cid);
                    return c ? <div key={cid} className="shrink-0"><GameCard card={c} scale={0.5} /></div> : null;
                })}
             </div>
          </div>

          {/* PRZECIWNICY (Flex-wrap zapobiega uciekaniu) */}
          <div className="flex flex-wrap justify-center gap-2 shrink-0">
             {opponents.map(opp => (
                 <div key={opp.id} className="bg-black/40 p-2 rounded border border-white/10 w-[140px] flex flex-col">
                     <div className="text-[10px] flex justify-between mb-1">
                         <span className="text-gray-300 truncate">{opp.email.split('@')[0]}</span>
                         <span className="text-green-400">${opp.money}</span>
                     </div>
                     <div className="flex gap-1 mb-1 text-[9px] text-blue-300 items-center">
                         <Handshake size={10} /> x{opp.dealTokens || 5}
                     </div>
                     {/* Karty Stołu Przeciwnika */}
                     <div className="flex flex-wrap justify-center gap-0.5">
                        {opp.table.map(cid => {
                             const c = getCard(cid);
                             return c ? <GameCard key={cid} card={c} scale={0.3} /> : null;
                        })}
                     </div>
                 </div>
             ))}
          </div>
      </div>

      {/* 3. DÓŁ: MOJE PODWÓRKO (Fixed at bottom) */}
      <div className="bg-stone-950 border-t-2 border-red-900 shrink-0 h-[280px] flex flex-col">
         {/* Belka Info */}
         <div className="flex justify-between items-center px-2 py-1 bg-black/50">
             <div className="font-bold text-yellow-500 text-xs">
                 RODZINA {myPlayer.family?.toUpperCase() || 'MAFIA'} 
                 <span className="text-green-400 ml-2 text-sm">${myPlayer.money}</span>
             </div>
             <div className="flex items-center gap-1 text-[10px] text-blue-200">
                 <Handshake size={12}/> {myPlayer.dealTokens || 5} umów
             </div>
         </div>
         
         <div className="flex flex-1 overflow-hidden">
             {/* MOJA RĘKA (Lewa strona, scrollowana) */}
             <div className="w-1/2 border-r border-white/10 flex flex-col">
                <div className="text-[9px] text-center text-gray-500 uppercase py-1">Twoja Ręka</div>
                <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-4 -space-x-12 pb-4 scrollbar-thin">
                    {myPlayer.hand.map(cid => {
                        const c = getCard(cid);
                        return c ? (
                            <div key={cid} className="shrink-0 hover:-translate-y-6 transition-transform duration-200 hover:z-50 relative z-0 origin-bottom">
                                <GameCard card={c} scale={0.7} />
                            </div>
                        ) : null;
                    })}
                </div>
             </div>

             {/* MÓJ STÓŁ (Prawa strona, scrollowany) */}
             <div className="w-1/2 flex flex-col">
                <div className="text-[9px] text-center text-gray-500 uppercase py-1">Twój Stół</div>
                <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-2 gap-2 scrollbar-thin">
                    {myPlayer.table.map(cid => {
                        const c = getCard(cid);
                        return c ? <div key={cid} className="shrink-0"><GameCard card={c} scale={0.65} /></div> : null;
                    })}
                </div>
             </div>
         </div>
      </div>

    </div>
  );
};