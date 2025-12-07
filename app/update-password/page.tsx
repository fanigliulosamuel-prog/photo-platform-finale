"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verifica che l'utente sia arrivato qui tramite un link valido (deve essere autenticato dalla mail)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Se non c'è sessione (link scaduto o accesso diretto), rimanda al login
        router.push('/login');
      }
    });
  }, [router]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      alert("Errore: " + error.message);
      setLoading(false);
    } else {
      alert("Password modificata con successo! Ora puoi accedere.");
      // Disconnettiamo l'utente per forzarlo a fare il login pulito con la nuova password
      await supabase.auth.signOut();
      router.push('/login');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="relative z-10 w-full max-w-md bg-stone-400/40 backdrop-blur-xl border border-stone-300/50 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Imposta Nuova Password</h1>
        <p className="text-stone-100 text-center mb-8 text-sm">Inserisci la tua nuova password sicura.</p>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Nuova Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-4 text-white placeholder-stone-200 focus:border-amber-400 outline-none transition" 
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Aggiornamento..." : "Salva Nuova Password"}
          </button>
        </form>
        
        <div className="mt-6 text-center border-t border-stone-400/50 pt-4">
          <Link href="/login" className="text-sm text-stone-200 hover:text-white transition">
            Annulla
          </Link>
        </div>
      </div>
    </main>
  );
}