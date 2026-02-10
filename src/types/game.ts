// src/types/game.ts

export type CardType = 'GANGSTER' | 'BUSINESS' | 'ORDER' | 'INFLUENCE' | 'UNKNOWN';

export interface CardOption {
  id: number;
  text: string | null;       // Tekst akcji (np. "Wpłata do banku" lub "Zostajesz ominięty")
  amount: number | null;     // Kwota (jeśli dotyczy)
  diceSymbol: string | null; // Symbol braille'a (tylko dla Rozkazów)
  diceReq: number[] | null;  // Tablica liczb (np. [4, 4])
}

export interface CardData {
  id: string;
  type: CardType;
  subtype: string;
  isDefault: boolean;
  name: string;
  
  family?: string | null;
  description?: string | null; // Główny opis (np. "Zagraj w fazie...")
  phase?: string | null;       // Faza (np. "Planowanie")
  
  // Gangster / Biznes
  strength?: number;
  strengthText?: string | null;
  cost?: number;
  specialCost?: string | null;
  income?: number;

  // Rozkaz / Wpływ
  target?: string | null;      // Cel (np. "Biznesmen przeciwnika")
  round?: string | null;
  requirements?: string[];     // Warunki (np. "Diler")
  
  // Lista efektów/opcji (Dla Rozkazów to są wyniki rzutu, dla Wpływów to wybór efektu)
  options: CardOption[];
}