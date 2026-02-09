// src/types/game.ts

export type CardType = 'GANGSTER' | 'BUSINESS' | 'ORDER' | 'INFLUENCE' | 'BOSS';

export interface CardData {
  id: string;
  name: string;
  type: CardType;
  description?: string;
  strength?: number;      // Siła gangstera
  cost?: number;          // Cena zakupu
  income?: number;        // Dochód
  diceReq?: number[];     // Wymagane kości (dla Rozkazów)
}