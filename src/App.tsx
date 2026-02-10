import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Lobby from './components/Lobby';
import { GameCard } from './components/GameCard';
import cardsData from './data/cards.json';
import type { CardData } from './types/game';

const cards = cardsData as CardData[];

function App() {
  const [session, setSession] = useState<any>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. Ekran Logowania
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4">
        <h1 className="text-5xl font-black text-red-700 mb-8 tracking-tighter uppercase mt-10">La Cosa Nostra</h1>
        <Auth />
      </div>
    );
  }

  // 2. Ekran Gry (Placeholder na przyszłość)
  if (activeGameId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
           <button onClick={() => setActiveGameId(null)} className="text-gray-400 hover:text-white">
             ← Wyjdź do Lobby
           </button>
           <h2 className="text-xl font-bold">Gra w toku (ID: {activeGameId.slice(0,4)})</h2>
        </div>
        
        {/* Tu na razie wyświetlamy nasze karty testowe */}
        <div className="flex flex-wrap justify-center gap-6">
          {cards.map((card) => (
            <GameCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    );
  }

  // 3. Ekran Lobby
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 flex justify-between items-center bg-gray-800 shadow-md">
        <span className="font-mono text-sm text-gray-300">{session.user.email}</span>
        <button 
            onClick={() => supabase.auth.signOut()}
            className="text-xs border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-900 transition"
          >
            Wyloguj
        </button>
      </div>
      <Lobby onJoinGame={(gameId) => setActiveGameId(gameId)} />
    </div>
  );
}

export default App;