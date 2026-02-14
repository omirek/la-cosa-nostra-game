import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'MAGIC'>('LOGIN')

  // Funkcja logowania hasłem
  const handleAuth = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    
    let error;

    if (mode === 'REGISTER') {
        const res = await supabase.auth.signUp({ email, password });
        error = res.error;
        if (!error) alert("Konto stworzone! Możesz się zalogować.");
    } else if (mode === 'LOGIN') {
        const res = await supabase.auth.signInWithPassword({ email, password });
        error = res.error;
    } else {
        const res = await supabase.auth.signInWithOtp({ email });
        error = res.error;
        if (!error) alert("Wysłano Magic Link!");
    }

    if (error) alert(error.message);
    setLoading(false)
  }

  // Szybkie logowanie dla developera
  const devLogin = async (num: number) => {
      setLoading(true);
      const email = `gracz${num}@test.pl`;
      const password = 'password123';
      
      // Najpierw spróbuj się zalogować
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      // Jak błąd (pewnie nie ma konta), to zarejestruj i zaloguj
      if (error) {
          console.log("Tworzę konto dev...");
          await supabase.auth.signUp({ email, password });
          await supabase.auth.signInWithPassword({ email, password });
      }
      setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-white w-full max-w-md">
      <div className="p-8 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500 uppercase tracking-widest">
            {mode === 'LOGIN' ? 'Logowanie' : mode === 'REGISTER' ? 'Rejestracja' : 'Magic Link'}
        </h2>
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            className="p-3 rounded bg-gray-900 border border-gray-600 focus:border-red-500 outline-none"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {mode !== 'MAGIC' && (
              <input
                className="p-3 rounded bg-gray-900 border border-gray-600 focus:border-red-500 outline-none"
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
          )}

          <button
            disabled={loading}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            {loading ? 'Przetwarzanie...' : 'Wykonaj'}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-xs text-gray-400">
            <button onClick={() => setMode('LOGIN')} className={mode === 'LOGIN' ? 'text-white font-bold' : ''}>Logowanie</button>
            <button onClick={() => setMode('REGISTER')} className={mode === 'REGISTER' ? 'text-white font-bold' : ''}>Rejestracja</button>
            <button onClick={() => setMode('MAGIC')} className={mode === 'MAGIC' ? 'text-white font-bold' : ''}>Magic Link</button>
        </div>

        {/* --- SEKCJA DEV --- */}
        <div className="mt-8 pt-4 border-t border-gray-700">
            <p className="text-center text-[10px] uppercase text-gray-500 mb-2">Szybkie logowanie (Dev Mode)</p>
            <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                    <button 
                        key={n}
                        onClick={() => devLogin(n)}
                        className="flex-1 bg-blue-900/50 hover:bg-blue-800 text-blue-200 py-2 rounded text-xs font-mono border border-blue-800"
                    >
                        Gracz {n}
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  )
}