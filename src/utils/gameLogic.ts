import cardsData from '../data/cards.json';
import type { CardData } from '../types/game';
import type { GameState, PlayerState } from '../types/gameState';

const ALL_CARDS = cardsData as CardData[];

// Definicje zestawów startowych (wg Instrukcji str. 4)
const FAMILIES = {
  'Blundetto': { color: 'yellow', starterIds: ['162', '160', '161'] }, // Lichwiarz, Gliniarz, Zakład
  'DiMaggio':  { color: 'green',  starterIds: ['157', '158', '159'] }, // Diler, Prawnik, Budowlana
  'Calmuti':   { color: 'red',    starterIds: ['155', '154', '156'] }, // Alfons, Polityk, Garaż
  'LaServa':   { color: 'purple', starterIds: ['165', '166'] },        // Alfons, Kasyno (tylko 2? Sprawdźmy instrukcję: tak, fioletowy ma 2) + 1 losowa? Instrukcja mówi: "1x alfons, 1x kasyno". Może to błąd w CSV albo ma mniej? Przyjmijmy te co są.
  'Caruso':    { color: 'blue',   starterIds: ['163', '164'] }         // Prawnik, Kasyno
};

const FAMILY_NAMES = ['Blundetto', 'DiMaggio', 'Calmuti', 'LaServa', 'Caruso'];

// Helper tasowania
const shuffle = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const initializeGame = (playersInfo: { id: string, email: string }[]): GameState => {
  // 1. Przygotuj talie Główne (tylko te, które NIE są defaultowe/startowe)
  // Rozdzielamy Rozkazy na rundy
  const deckOrdersI   = shuffle(ALL_CARDS.filter(c => c.type === 'ORDER' && c.round === '1').map(c => c.id));
  const deckOrdersII  = shuffle(ALL_CARDS.filter(c => c.type === 'ORDER' && c.round === '2').map(c => c.id));
  const deckOrdersIII = shuffle(ALL_CARDS.filter(c => c.type === 'ORDER' && c.round === '3').map(c => c.id));
  const deckOrdersIV  = shuffle(ALL_CARDS.filter(c => c.type === 'ORDER' && c.round === '4').map(c => c.id));
  
  // Wpływy (Wspólna talia)
  const deckInfluences = shuffle(ALL_CARDS.filter(c => c.type === 'INFLUENCE' && !c.isDefault).map(c => c.id));

  // Karty Interesów (Miasto) - te które nie są startowe (isDefault=false)
  const marketDeck = shuffle(ALL_CARDS.filter(c => c.type === 'BUSINESS' && !c.isDefault).map(c => c.id));

  // 2. Przypisz Rodziny graczom
  const availableFamilies = [...FAMILY_NAMES]; // Kopia
  
  const players: PlayerState[] = playersInfo.map((info, index) => {
    // Pobierz rodzinę (jeśli graczy > 5, to błąd, ale zakładamy max 5)
    const familyName = availableFamilies[index] || 'Blundetto'; 
    const familyConfig = FAMILIES[familyName as keyof typeof FAMILIES];

    // Pobierz Gangsterów tej rodziny (Startowych)
    const myGangsters = ALL_CARDS
        .filter(c => c.type === 'GANGSTER' && c.family === familyName && c.isDefault)
        .map(c => c.id);

    // Pobierz Karty Startowe (Interesy) z CSV po ID
    // Uwaga: W CSV masz konkretne ID dla tych kart (np. 162 dla Blundetto Lichwiarza)
    const myTableCards = [...myGangsters, ...familyConfig.starterIds];

    // Karty startowe Wpływów: 1x Kapuś, 1x Intrygant, 1x Stronnik (Str. 2 instrukcji)
    // Musimy znaleźć ID tych kart w bazie. Szukamy po nazwie i Rodzinie
    const kapus = ALL_CARDS.find(c => c.name === 'Kapuś' && c.family === familyName)?.id;
    const intrygant = ALL_CARDS.find(c => c.name === 'Intrygant' && c.family === familyName)?.id;
    const stronnik = ALL_CARDS.find(c => c.name === 'Stronnik' && c.family === familyName)?.id;

    const startingHand: string[] = [];
    if (kapus) startingHand.push(kapus);
    if (intrygant) startingHand.push(intrygant);
    if (stronnik) startingHand.push(stronnik);

    // Dobranie 4 Rozkazów z I rundy (Str. 5 tabelka)
    // Runda 1: 4 Rozkazy, 0 Wpływów (ale mamy startowe 3 wpływy)
    for(let i=0; i<4; i++) {
        const card = deckOrdersI.pop();
        if(card) startingHand.push(card);
    }

    return {
      id: info.id,
      email: info.email,
      money: 2000, 
      hand: startingHand, 
      table: myTableCards,
      isReady: false,
      dealTokens: 5, // 5 Żetonów Umów na start
      family: familyName // Dodajemy info o rodzinie do stanu gracza
    };
  });

  // 3. Wyłóż 4 karty na Miasto
  const market: string[] = [];
  for(let i=0; i<4; i++) {
      const card = marketDeck.pop();
      if(card) market.push(card);
  }

  return {
    round: 1,
    phase: 'PLANNING',
    activePlayerIndex: 0,
    players,
    market,
    deckOrders: [...deckOrdersI, ...deckOrdersII, ...deckOrdersIII, ...deckOrdersIV], // Tu uproszczenie: trzymamy wszystko w jednym worku, ale logika dobierania powinna brać z odpowiednich rund. 
    // TODO: W przyszłości rozdzielić deckOrders w GameState na deckOrdersI, deckOrdersII itd.
    deckInfluences,
    trash: []
  };
};