import { GameCard } from './components/GameCard';
import cardsData from './data/cards.json';
import type { CardData } from './types/game';

// Rzutowanie typu, bo JSON importuje się jako zwykły obiekt
const cards = cardsData as CardData[];

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-8 text-center border-b border-gray-700 pb-4">
        Stoły Gry (Podgląd Kart)
      </h1>
      
      <div className="flex flex-wrap justify-center gap-4">
        {cards.map((card) => (
          <GameCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}

export default App