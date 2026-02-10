import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Game {
  id: string;
  host_id: string;
  status: string;
  created_at: string;
}

export default function Lobby({ onJoinGame }: { onJoinGame: (gameId: string) => void }) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [myId, setMyId] = useState<string>('');

  useEffect(() => {
    // 1. Pobierz moje ID
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setMyId(data.user.id);
    });

    // 2. Pobierz listę gier
    fetchGames();

    // 3. Nasłuchuj nowych gier (Realtime!)
    const channel = supabase
      .channel('public:games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => {
        fetchGames();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'LOBBY') // Pokaż tylko oczekujące gry
      .order('created_at', { ascending: false });
    
    if (data) setGames(data);
  };

  const createGame = async () => {
    setLoading(true);
    if (!myId) return;

    // Utwórz grę
    const { data: newGame, error } = await supabase
      .from('games')
      .insert([{ host_id: myId, status: 'LOBBY' }])
      .select()
      .single();

    if (error) {
      alert('Błąd tworzenia gry: ' + error.message);
    } else if (newGame) {
        // Automatycznie dołącz hosta do gry
        await supabase.from('game_players').insert([{ game_id: newGame.id, player_id: myId }]);
        onJoinGame(newGame.id);
    }
    setLoading(false);
  };

  const joinGame = async (gameId: string) => {
    setLoading(true);
    // Sprawdź czy już tam nie jestem
    const { error } = await supabase
        .from('game_players')
        .insert([{ game_id: gameId, player_id: myId }]);

    if (!error || error.code === '23505') { // 23505 to błąd "już istnieje" (czyli ok)
        onJoinGame(gameId);
    } else {
        alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-red-500 border-b border-gray-700 pb-4">
        Dostępne Stoły
      </h2>

      <div className="flex justify-end mb-8">
        <button
          onClick={createGame}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded shadow-lg transition transform hover:scale-105"
        >
          {loading ? 'Tworzenie...' : '+ Nowa Gra'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {games.length === 0 && (
          <p className="text-gray-400 col-span-2 text-center py-10">Brak aktywnych gier. Utwórz nową!</p>
        )}
        
        {games.map((game) => (
          <div key={game.id} className="bg-gray-800 border border-gray-600 p-6 rounded-lg flex justify-between items-center shadow-md">
            <div>
              <p className="text-lg font-bold text-gray-200">Stół #{game.id.slice(0, 4)}</p>
              <p className="text-sm text-gray-400">Status: {game.status}</p>
            </div>
            <button
              onClick={() => joinGame(game.id)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold transition"
            >
              Dołącz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}