import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { GameCard } from './GameCard';
import cardsData from '../data/cards.json';
import type { GameState } from '../types/gameState';
import type { CardData } from '../types/game';
import { Handshake } from 'lucide-react'; // Ikona uścisku dłoni (Umowa)

const ALL_CARDS = cardsData as CardData[];
const getCard = (id: string) => ALL_CARDS.find(c => c.id === id);

interface GameBoardProps {
  gameId: string;
  myId: string;
  initialState: GameState;
  isHost: boolean; // Przekazujemy info czy jestem hostem
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

  // Funkcja zmiany fazy (Tylko Host)
  const nextPhase = async () => {
      let nextPhase = gameState.phase;
      let nextRound = gameState.round;

      if (gameState.phase === 'PLANNING') nextPhase = 'ACTION';
      else if (gameState.phase === 'ACTION') nextPhase = 'PAYOUT';
      else if (gameState.phase === 'PAYOUT') {
          nextPhase = 'PLANNING'; // Wróć do planowania
          nextRound += 1; // Nowa runda
          // Tu powinna być logika dobierania nowych kart!
      }

      await supabase.from('games').update({
          game_state: { ...gameState, phase: nextPhase, round: nextRound }
      }).eq('id', gameId);
  };

  if (!myPlayer) return <div className="text-white">Błąd gracza</div>;

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col overflow-hidden relative">
      
      {/* GÓRNY PASEK STANU */}
      <div className="bg-black text-center py-2 border-b border-red-900 flex justify-between px-4 items-center">
          <div className="font-mono text-yellow-500 font-bold">
              RUNDA {gameState.round}
          </div>
          <div className="text-xl font-bold uppercase tracking-widest">
              {gameState.phase === 'PLANNING' && 'Faza Planowania'}
              {gameState.phase === 'ACTION' && 'Faza Działania'}
              {gameState.phase === 'PAYOUT' && 'Wypłata'}
          </div>
          <div>
              {isHost && (
                  <button onClick={nextPhase} className="bg-red-700 hover:bg-red-600 text-xs px-3 py-1 rounded">
                      NASTĘPNA FAZA {'>'}{'>'}
                  </button>
              )}
          </div>
      </div>

      {/* ŚRODEK (MIESTO + PRZECIWNICY) */}
      <div className="flex-1 p-2 flex flex-col gap-4 overflow-y-auto">
          
          {/* MIESTO */}
          <div className="bg-stone-800/50 p-2 rounded border border-white/5 mx-auto">
             <h3 className="text-[10px] text-center mb-1 text-gray-500 uppercase">Miasto</h3>
             <div className="flex gap-2">
                {gameState.market.map(cid => {
                    const c = getCard(cid);
                    return c ? <GameCard key={cid} card={c} scale={0.55} /> : null;
                })}
             </div>
          </div>

          {/* PRZECIWNICY */}
          <div className="flex justify-center gap-4 flex-wrap">
             {opponents.map(opp => (
                 <div key={opp.id} className="bg-black/40 p-2 rounded border border-white/10 min-w-[150px]">
                     <div className="text-xs flex justify-between mb-1">
                         <span className="text-gray-300">{opp.email.split('@')[0]}</span>
                         <span className="text-green-400">${opp.money}</span>
                     </div>
                     {/* Tokeny Umów */}
                     <div className="flex gap-1 mb-1 text-[10px] text-blue-300 items-center">
                         <Handshake size={12} /> x{opp.dealTokens || 5}
                     </div>
                     {/* Karty Stołu */}
                     <div className="flex gap-1 justify-center flex-wrap">
                        {opp.table.map(cid => {
                             const c = getCard(cid);
                             return c ? <GameCard key={cid} card={c} scale={0.35} /> : null;
                        })}
                     </div>
                 </div>
             ))}
          </div>
      </div>

      {/* DÓŁ (JA) */}
      <div className="bg-stone-950 p-3 border-t-2 border-red-900 pb-safe">
         <div className="flex justify-between items-center mb-2">
             <div className="font-bold text-yellow-500 text-sm">
                 RODZINA {myPlayer.family?.toUpperCase() || 'MAFIA'} 
                 <span className="text-green-400 ml-3 text-lg">${myPlayer.money}</span>
             </div>
             <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-1 rounded border border-blue-500/30">
                 <Handshake size={16} className="text-blue-400"/>
                 <span className="text-blue-200 font-bold">{myPlayer.dealTokens || 5} umów</span>
             </div>
         </div>
         
         <div className="flex gap-6 items-end">
             {/* Mój stół */}
             <div className="flex gap-2">
                 {myPlayer.table.map(cid => {
                     const c = getCard(cid);
                     return c ? <GameCard key={cid} card={c} scale={0.7} /> : null;
                 })}
             </div>
             
             {/* Moja ręka */}
             <div className="flex -space-x-12 pb-2 pl-4">
                 {myPlayer.hand.map(cid => {
                     const c = getCard(cid);
                     return c ? (
                         <div key={cid} className="hover:-translate-y-10 transition-transform duration-200 hover:scale-110 z-0 hover:z-50">
                             <GameCard card={c} scale={0.75} />
                         </div>
                     ) : null;
                 })}
             </div>
         </div>
      </div>

    </div>
  );
};