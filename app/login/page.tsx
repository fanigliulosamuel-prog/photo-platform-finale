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
  const [view, setView] = useState<'login' | 'signup' | 'reset'>('login'); // Gestisce le 3 viste

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'signup') {
        // --- REGISTRAZIONE ---
        if (!username || !city) throw new Error("Per registrarti devi inserire Username e Città.");

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
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
        router.refresh(); 
        router.push('/dashboard'); 
        
      } else if (view === 'login') {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        router.refresh(); 
        router.push('/dashboard'); 

      } else if (view === 'reset') {
        // --- RESET PASSWORD ---
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/settings`, // Dopo il click nella mail, porta alle impostazioni per cambiare pass
        });
        if (error) throw error;
        alert("Ti abbiamo inviato un'email per reimpostare la password. Controlla la posta!");
        setView('login');
      }

    } catch (error: any) {
      alert("Errore: " + (error.message || "Operazione fallita"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* CARD CENTRALE */}
      <div className="relative z-10 w-full max-w-md bg-stone-400/40 backdrop-blur-xl border border-stone-300/50 p-8 rounded-3xl shadow-2xl">
        
        <h2 className="text-4xl font-bold text-white mb-2 text-center tracking-tight">
          {view === 'signup' ? "Unisciti a Noi" : view === 'reset' ? "Recupera Password" : "Bentornato"}
        </h2>
        <p className="text-stone-100 text-center mb-8 font-light">
          {view === 'signup' ? "Crea il tuo portfolio e accedi subito." : view === 'reset' ? "Inserisci la tua email per ricevere le istruzioni." : "Accedi per gestire i tuoi scatti."}
        </p>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              placeholder="nome@esempio.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-stone-400/50 border border-stone-300/50 rounded-xl p-4 text-white placeholder-stone-200 focus:border-amber-300/70 focus:bg-stone-400/70 outline-none transition" 
              required
            />
          </div>

          {view !== 'reset' && (
            <div>
                <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Password</label>
                <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-stone-400/50 border border-stone-300/50 rounded-xl p-4 text-white placeholder-stone-200 focus:border-amber-300/70 focus:bg-stone-400/70 outline-none transition" 
                required
                />
            </div>
          )}
          
          {/* CAMPI EXTRA PER LA REGISTRAZIONE */}
          {view === 'signup' && (
            <div className="animate-fade-in space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Username</label>
                <input type="text" placeholder="Es. PhotoAlex" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-stone-400/50 border border-stone-300/50 rounded-xl p-4 text-white placeholder-stone-200 focus:border-amber-300/70 focus:bg-stone-400/70 outline-none transition" required/>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Città</label>
                <input type="text" placeholder="Es. Roma" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-stone-400/50 border border-stone-300/50 rounded-xl p-4 text-white placeholder-stone-200 focus:border-amber-300/70 focus:bg-stone-400/70 outline-none transition" required/>
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-4 bg-stone-100 text-stone-900 font-bold rounded-xl hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition transform disabled:opacity-50 mt-6"
          >
            {loading ? "Attendi..." : (view === 'signup' ? "Registrati Ora" : view === 'reset' ? "Invia Link di Reset" : "Accedi")}
          </button>

        </form>

        {/* Toggle Viste */}
        <div className="mt-8 text-center text-stone-300 text-sm space-y-2">
          {view === 'login' && (
             <>
                <p>
                    Non hai un account? <button onClick={() => setView('signup')} className="text-white font-bold hover:text-amber-100 hover:underline">Registrati qui</button>
                </p>
                <p>
                    <button onClick={() => setView('reset')} className="text-stone-200 hover:text-white text-xs underline">Password dimenticata?</button>
                </p>
             </>
          )}

          {view === 'signup' && (
             <p>
                Hai già un account? <button onClick={() => setView('login')} className="text-white font-bold hover:text-amber-100 hover:underline">Accedi qui</button>
             </p>
          )}

          {view === 'reset' && (
             <p>
                Ti sei ricordato? <button onClick={() => setView('login')} className="text-white font-bold hover:text-amber-100 hover:underline">Torna al Login</button>
             </p>
          )}
        </div>

        <div className="mt-6 text-center border-t border-stone-400/50 pt-4">
          <Link href="/" className="text-sm text-stone-400 hover:text-white transition flex items-center justify-center gap-2">
            ← Torna alla Home
          </Link>
        </div>
        
        <div className="mt-4 text-center text-xs text-stone-400 space-x-4">
          <Link href="/legal/privacy" className="hover:text-stone-300 transition">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-stone-300 transition">Termini</Link>
        </div>

      </div>
    </main>
  );
}