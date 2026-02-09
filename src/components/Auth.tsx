import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Logowanie "Magic Link" - bez hasła, tylko email
    const redirectTo = import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
    
    if (error) {
      alert(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
      <div className="p-8 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Dołącz do Rodziny</h2>
        
        {sent ? (
          <div className="text-center text-green-400">
            <p>Sprawdź swoją skrzynkę mailową!</p>
            <p className="text-sm text-gray-400 mt-2">Wysłaliśmy link logowania na {email}</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              className="p-3 rounded bg-gray-900 border border-gray-600 focus:border-red-500 outline-none text-white placeholder-gray-500"
              type="email"
              placeholder="Twój email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              disabled={loading}
              className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Wysyłanie...' : 'Wyślij Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}