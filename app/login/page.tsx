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
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- SFONDO FOTOGRAFICO IMMERSIVO (Stile Home Page) --- */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          // Un'immagine elegante, scura e minimale (Paesaggio Notturno/Montagne)
          backgroundImage: 'url("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2670&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
         {/* Velo scuro e leggera sfocatura per eleganza e leggibilità */}
         <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* CARD CENTRALE (Glassmorphism raffinato) */}
      <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        <h2 className="text-4xl font-bold text-white mb-2 text-center tracking-tight">
          {isSignUp ? "Unisciti a Noi" : "Bentornato"}
        </h2>
        <p className="text-gray-300 text-center mb-8 font-light">
          {isSignUp ? "Crea il tuo portfolio e accedi subito." : "Accedi per gestire i tuoi scatti."}
        </p>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              placeholder="nome@esempio.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-white focus:bg-white/10 outline-none transition" 
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-white focus:bg-white/10 outline-none transition" 
              required
            />
          </div>
          
          {/* CAMPI EXTRA PER LA REGISTRAZIONE */}
          {isSignUp && (
            <div className="animate-fade-in space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                <input type="text" placeholder="Es. PhotoAlex" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-white focus:bg-white/10 outline-none transition" required={isSignUp}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Città</label>
                <input type="text" placeholder="Es. Roma" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-white focus:bg-white/10 outline-none transition" required={isSignUp}/>
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition transform disabled:opacity-50 mt-6"
          >
            {loading ? "Attendi..." : (isSignUp ? "Registrati Ora" : "Accedi")}
          </button>

        </form>

        {/* Toggle Login/Registrati */}
        <p className="mt-8 text-center text-gray-400 text-sm">
          {isSignUp ? "Hai già un account?" : "Non hai un account?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white font-bold cursor-pointer hover:underline transition"
          >
            {isSignUp ? "Accedi qui" : "Registrati qui"}
          </button>
        </p>

        <div className="mt-6 text-center border-t border-white/10 pt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition flex items-center justify-center gap-2">
            ← Torna alla Home
          </Link>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-600 space-x-4">
          <Link href="/legal/privacy" className="hover:text-gray-400 transition">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-gray-400 transition">Termini</Link>
        </div>

      </div>
    </main>
  );
}