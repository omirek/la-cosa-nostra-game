// src/types/gameState.ts

export interface PlayerState {
  id: string;          // ID gracza (z Supabase)
  email: string;       // E-mail (do wyświetlania)
  money: number;       // Gotówka
  hand: string[];      // Lista ID kart na ręce
  table: string[];     // Lista ID kart na stole (Gangsterzy)
  isReady: boolean;    // Czy gotowy
}

export interface GameState {
  round: number;
  phase: 'LOBBY' | 'PLANNING' | 'ACTION' | 'PAYOUT';
  activePlayerIndex: number;
  players: PlayerState[];
  market: string[];    // Karty w Mieście
  deckOrders: string[];
  deckInfluences: string[];
  trash: string[];
}