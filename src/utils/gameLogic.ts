// src/utils/gameLogic.ts
import cardsData from '../data/cards.json';
import type { CardData } from '../types/game';
import type { GameState, PlayerState } from '../types/gameState';

// Rzutowanie JSONa na typ
const ALL_CARDS = cardsData as CardData[];

// Algorytm tasowania (Fisher-Yates)
const shuffle = (array: string[]) => {
  const newArray = [...array];
  let currentIndex = newArray.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

export const initializeGame = (playersInfo: { id: string, email: string }[]): GameState => {
  // 1. Podział kart na talie
  const gangsters = ALL_CARDS.filter(c => c.type === 'GANGSTER').map(c => c.id);
  const businesses = ALL_CARDS.filter(c => c.type === 'BUSINESS').map(c => c.id);
  const orders = shuffle(ALL_CARDS.filter(c => c.type === 'ORDER').map(c => c.id));
  const influences = shuffle(ALL_CARDS.filter(c => c.type === 'INFLUENCE').map(c => c.id));
  
  // 2. Przygotowanie graczy
  const players: PlayerState[] = playersInfo.map(info => {
    // Na start dajemy losowego gangstera
    const startingGangster = gangsters.splice(Math.floor(Math.random() * gangsters.length), 1)[0];
    
    return {
      id: info.id,
      email: info.email,
      money: 2000, 
      hand: [orders.pop()!, orders.pop()!, orders.pop()!, orders.pop()!], 
      table: [startingGangster],
      isReady: false
    };
  });

  // 3. Rynek (Miasto) - 4 losowe biznesy
  const market: string[] = [];
  for(let i=0; i<4; i++) {
      if (businesses.length > 0) {
        const randIdx = Math.floor(Math.random() * businesses.length);
        market.push(businesses[randIdx]);
        businesses.splice(randIdx, 1);
      }
  }

  // 4. Zwracamy gotowy stan gry
  return {
    round: 1,
    phase: 'PLANNING',
    activePlayerIndex: 0,
    players,
    market,
    deckOrders: orders,
    deckInfluences: influences,
    trash: []
  };
};