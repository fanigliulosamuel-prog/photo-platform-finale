"use client"

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [city, setCity] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); 

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- REGISTRAZIONE ---
        if (!username || !city) throw new Error("Per registrarti devi inserire Username e Città.");

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        // Creazione Profilo Automatica
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert([
                {
                    id: data.user.id, 
                    username: username,
                    city: city,
                }
            ]);
            
            if (profileError) throw profileError;
        }

        alert("Registrazione completata! Puoi accedere subito.");
        router.push('/dashboard'); 
        
      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard'); 
      }
    } catch (error: any) {
      alert("Errore: " + (error.message || "Errore durante l'autenticazione"));
    } finally {
      setLoading(false);
    }
  }

  return (
    // MODIFICA QUI: Sfondo PIÙ CHIARO E CALDO (stone-600/500)
    <main className="min-h-screen bg-gradient-to-br from-stone-600 via-stone-500 to-stone-600 text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- SFONDO TEXTURE & LUCI (Grana Molto Più Sottile) --- */}
      
      {/* Texture Grana (Opacità ridotta da 20% a 5%) */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde (Ambra chiara) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* CARD CENTRALE (Glassmorphism caldo e chiaro) */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-stone-300/50 p-8 rounded-3xl shadow-2xl">
        
        <h2 className="text-4xl font-bold text-white mb-2 text-center tracking-tight">
          {isSignUp ? "Unisciti a Noi" : "Bentornato"}
        </h2>
        <p className="text-stone-300 text-center mb-8 font-light">
          {isSignUp ? "Crea il tuo portfolio e accedi subito." : "Accedi per gestire i tuoi scatti."}
        </p>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              placeholder="nome@esempio.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 focus:bg-stone-500/60 outline-none transition" 
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 focus:bg-stone-500/60 outline-none transition" 
              required
            />
          </div>
          
          {/* CAMPI EXTRA PER LA REGISTRAZIONE */}
          {isSignUp && (
            <div className="animate-fade-in space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">Username</label>
                <input type="text" placeholder="Es. PhotoAlex" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 focus:bg-stone-500/60 outline-none transition" required={isSignUp}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">Città</label>
                <input type="text" placeholder="Es. Roma" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 focus:bg-stone-500/60 outline-none transition" required={isSignUp}/>
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-4 bg-white text-stone-900 font-bold rounded-xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition transform disabled:opacity-50 mt-6"
          >
            {loading ? "Attendi..." : (isSignUp ? "Registrati Ora" : "Accedi")}
          </button>

        </form>

        {/* Toggle Login/Registrati */}
        <p className="mt-8 text-center text-stone-300 text-sm">
          {isSignUp ? "Hai già un account?" : "Non hai un account?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white font-bold cursor-pointer hover:text-amber-200 hover:underline transition"
          >
            {isSignUp ? "Accedi qui" : "Registrati qui"}
          </button>
        </p>

        <div className="mt-6 text-center border-t border-stone-700 pt-4">
          <Link href="/" className="text-sm text-stone-400 hover:text-white transition flex items-center justify-center gap-2">
            ← Torna alla Home
          </Link>
        </div>
        
        <div className="mt-4 text-center text-xs text-stone-500 space-x-4">
          <Link href="/legal/privacy" className="hover:text-stone-300 transition">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-stone-300 transition">Termini</Link>
        </div>

      </div>
    </main>
  );
}