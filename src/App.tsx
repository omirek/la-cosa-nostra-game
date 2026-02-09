import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import { GameCard } from './components/GameCard' // Zachowujemy import
import cardsData from './data/cards.json'
import type { CardData } from './types/game'

const cards = cardsData as CardData[];

function App() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Sprawdź czy użytkownik jest już zalogowany
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Nasłuchuj zmian (np. wylogowanie)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Jeśli NIE ma sesji -> pokaż logowanie
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4">
        <h1 className="text-5xl font-black text-red-700 mb-8 tracking-tighter uppercase mt-10">La Cosa Nostra</h1>
        <Auth />
      </div>
    )
  }

  // Jeśli JEST sesja -> pokaż grę (karty)
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
       <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <p className="text-gray-400">Zalogowany jako: <span className="text-white">{session.user.email}</span></p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-xs border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-900 transition"
          >
            Wyloguj
          </button>
       </div>

      <div className="flex flex-wrap justify-center gap-6">
        {cards.map((card) => (
          <GameCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}

export default App