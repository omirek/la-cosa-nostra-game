// src/App.tsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Lobby from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { initializeGame } from './utils/gameLogic';
import type { GameState } from './types/gameState';

function App() {
  const [session, setSession] = useState<any>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string>('LOBBY'); // LOBBY, PLAYING
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isHost, setIsHost] = useState(false);

  // 1. Obsługa sesji
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2. Obsługa aktywnej gry (Realtime)
  useEffect(() => {
    if (!activeGameId) return;

    // Pobierz stan początkowy
    const fetchGameData = async () => {
        const { data } = await supabase.from('games').select('*').eq('id', activeGameId).single();
        if (data) {
            setGameStatus(data.status);
            setGameState(data.game_state);
            if (session && data.host_id === session.user.id) setIsHost(true);
        }
    };
    fetchGameData();

    // Nasłuchuj zmian statusu i stanu
    const channel = supabase
      .channel(`room:${activeGameId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'games', 
        filter: `id=eq.${activeGameId}` 
      }, (payload) => {
        console.log("Aktualizacja gry:", payload.new.status);
        setGameStatus(payload.new.status);
        if (payload.new.game_state) {
            setGameState(payload.new.game_state);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeGameId, session]);

  // 3. Funkcja START GRY (tylko dla Hosta)
  const handleStartGame = async () => {
    if (!activeGameId) return;

    // Pobierz listę graczy z bazy
    const { data: playersData } = await supabase
        .from('game_players')
        .select('player_id, profiles(username)')
        .eq('game_id', activeGameId);
    
    if (!playersData || playersData.length === 0) return;

    // Mapujemy dane graczy
    const playersInfo = playersData.map((p: any) => ({
        id: p.player_id,
        email: p.profiles?.username || 'Nieznany'
    }));

    // Logika rozdania kart
    const initialState = initializeGame(playersInfo);

    // Zapisz w bazie i zmień status
    const { error } = await supabase
        .from('games')
        .update({ 
            status: 'PLAYING',
            game_state: initialState 
        })
        .eq('id', activeGameId);

    if (error) console.error("Błąd startu:", error);
  };

  // --- WIDOKI ---

  // A. Logowanie
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4 text-white">
        <h1 className="text-5xl font-black text-red-700 mb-8 tracking-tighter uppercase mt-10">La Cosa Nostra</h1>
        <Auth />
      </div>
    );
  }

  // B. Stół Gry (PLAYING)
  if (activeGameId && gameStatus === 'PLAYING' && gameState) {
    return (
        <GameBoard 
            gameId={activeGameId} 
            myId={session.user.id} 
            initialState={gameState} 
        />
    );
  }

  // C. Poczekalnia (LOBBY - wewnątrz gry)
  if (activeGameId && gameStatus === 'LOBBY') {
    return (
        <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold mb-4">Pokój Oczekiwania</h2>
            <p className="text-gray-400 mb-8">Czekamy na rozpoczęcie gry...</p>
            
            <div className="bg-black/30 p-8 rounded border border-white/10 text-center">
                <p className="mb-4">ID Stołu: <span className="font-mono text-yellow-500">{activeGameId.slice(0,4)}</span></p>
                
                {isHost ? (
                    <button 
                        onClick={handleStartGame}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded shadow-lg transition-transform hover:scale-105"
                    >
                        ROZDAJ KARTY I GRAJ
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-blue-300 animate-pulse">
                        <span>Czekam na Hosta...</span>
                    </div>
                )}
            </div>

            <button 
                onClick={() => { setActiveGameId(null); setIsHost(false); }}
                className="mt-8 text-gray-500 hover:text-white underline"
            >
                Wyjdź do listy gier
            </button>
        </div>
    );
  }

  // D. Lista Gier (LOBBY - główne)
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