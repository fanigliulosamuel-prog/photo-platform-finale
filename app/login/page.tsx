"use client"

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Per cambiare tra Login e Registrazione

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- REGISTRAZIONE ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Registrazione completata! Controlla la tua email per confermare (o accedi se Supabase è impostato senza conferma).");
      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard'); // Porta alla dashboard se login ok
      }
    } catch (error: any) {
      alert(error.message || "Errore durante l'autenticazione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>

      {/* CARD CENTRALE */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        <h2 className="text-4xl font-bold text-white mb-2 text-center">
          {isSignUp ? "Unisciti a Noi" : "Bentornato"}
        </h2>
        <p className="text-indigo-200 text-center mb-8">
          {isSignUp ? "Crea il tuo portfolio oggi stesso." : "Accedi per gestire i tuoi scatti."}
        </p>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              placeholder="nome@esempio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:bg-black/40 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:bg-black/40 outline-none transition"
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-white text-indigo-950 font-bold rounded-xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition transform disabled:opacity-50 mt-4"
          >
            {loading ? "Attendi..." : (isSignUp ? "Registrati Ora" : "Accedi")}
          </button>

        </form>

        {/* Toggle Login/Registrati */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          {isSignUp ? "Hai già un account?" : "Non hai un account?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white font-bold cursor-pointer hover:text-indigo-300 hover:underline transition"
          >
            {isSignUp ? "Accedi qui" : "Registrati qui"}
          </button>
        </p>

        <div className="mt-6 text-center border-t border-white/5 pt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition flex items-center justify-center gap-2">
            ← Torna alla Home
          </Link>
        </div>
        
        {/* Link Legali nel Footer (NUOVO) */}
        <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-gray-500 space-x-4">
          <Link href="/legal/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-white transition">Termini d'Uso</Link>
        </div>

      </div>
    </main>
  );
}