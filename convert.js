import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. PARSER CSV (Znak po znaku) ---
const parseCSVLine = (text) => {
    const result = [];
    let currentCell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(currentCell.trim());
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    result.push(currentCell.trim());
    return result;
};

// --- 2. LOGIKA ---
const parseDice = (symbol) => {
    if (!symbol) return null; // Zmieniono na null, żeby odróżnić brak kości od pustej tablicy
    const dice = [];
    for (const char of symbol) {
        if (char === '⠊') dice.push(2);
        if (char === '⠕') dice.push(3);
        if (char === '⠛') dice.push(4);
        if (char === '?') dice.push(0);
    }
    return dice.length > 0 ? dice : null;
};

const mapType = (t) => {
    const clean = t?.toLowerCase() || '';
    if (clean.includes('gangster')) return 'GANGSTER';
    if (clean.includes('interes')) return 'BUSINESS';
    if (clean.includes('wplyw') || clean.includes('wpływ')) return 'INFLUENCE';
    if (clean.includes('rozkaz')) return 'ORDER';
    return 'UNKNOWN';
};

const run = () => {
    const csvPath = path.join(__dirname, 'baza.csv');
    
    try {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
        const dataLines = lines.slice(1); // Pomiń nagłówek
        
        const cards = dataLines.map((line) => {
            const cols = parseCSVLine(line);
            
            /* MAPOWANIE KOLUMN (0-24):
            0:ID, 1:Typ, 2:Rodzaj, 3:Default, 4:Nazwa, 5:Rodzina, 6:Sila, 7:Cena, 
            8:OpcjeCount, 9:Runda, 10:Kosc1, 11:Kosc2, 12:Cel, 
            13:Akcja1, 14:Akcja2, 15:Kwota1, 16:Kwota2, 
            17-21:Warunki, 22:Komentarz, 23:Dochód, 24:Faza */

            const type = mapType(cols[1]);
            
            const card = {
                id: cols[0],
                type: type,
                subtype: cols[2] ? cols[2].toUpperCase() : 'NONE',
                isDefault: cols[3] === 'Y',
                name: cols[4],
                family: cols[5] || null,
                description: cols[22] || null, // Komentarz ogólny
                phase: cols[24] || null,       // Faza zagrania
                cost: parseInt(cols[7]) || 0,
                specialCost: isNaN(parseInt(cols[7])) ? cols[7] : null,
                income: parseInt(cols[23]) || 0,
                strength: parseInt(cols[6]) || 0,
                strengthText: isNaN(parseInt(cols[6])) ? cols[6] : null,
                target: cols[12] || null,
                round: cols[9] || null,
                options: [] // Tu trafią Akcje
            };

            // --- EKSTRAKCJA OPCJI (Dla Rozkazów ORAZ Wpływów) ---
            // Sprawdzamy, czy w kolumnach z Akcjami (13, 14) coś jest.
            
            // Opcja 1
            if (cols[13] || cols[10]) { // Jeśli jest tekst akcji LUB symbol kości
                card.options.push({
                    id: 1,
                    text: cols[13] || null,       // Akcja1
                    amount: parseInt(cols[15]) || null, // Kwota1
                    diceSymbol: cols[10] || null, // Kosc1
                    diceReq: parseDice(cols[10])
                });
            }

            // Opcja 2
            if (cols[14] || cols[11]) {
                card.options.push({
                    id: 2,
                    text: cols[14] || null,       // Akcja2
                    amount: parseInt(cols[16]) || null, // Kwota2
                    diceSymbol: cols[11] || null, // Kosc2
                    diceReq: parseDice(cols[11])
                });
            }

            // Warunki (Requirements)
            const reqs = [cols[17], cols[18], cols[19], cols[20], cols[21]].filter(Boolean);
            if (reqs.length > 0) card.requirements = reqs;

            return card;
        });

        const outputPath = path.join(__dirname, 'src/data/cards.json');
        fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2));
        console.log(`✅ Przekonwertowano ${cards.length} kart!`);
        
        // Test dla Intryganta (ID 45)
        const intrygant = cards.find(c => c.id === '45');
        if (intrygant) {
            console.log('\n--- Test: Karta 45 (Intrygant) ---');
            console.log(JSON.stringify(intrygant, null, 2));
        }

    } catch (error) {
        console.error("❌ Błąd:", error);
    }
};

run();