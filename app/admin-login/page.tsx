"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(false);

  // LA TUA PASSWORD SEGRETA
  const ADMIN_SECRET = "admin2025";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret === ADMIN_SECRET) {
      // Salva un "biscotto" temporaneo nel browser per dire che sei admin
      localStorage.setItem('is_super_admin', 'true');
      router.push('/admin');
    } else {
      setError(true);
      setSecret("");
    }
  };

  return (
    // SFONDO CALDO (Stone 500/600)
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali (Toni Rossi/Ambra per Admin) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <div className="relative z-10 w-full max-w-sm bg-stone-400/40 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl shadow-2xl text-center">
        
        <h1 className="text-3xl font-bold text-white mb-2">Area Riservata</h1>
        <p className="text-stone-200 text-sm mb-6">Accesso consentito solo agli amministratori.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            placeholder="Codice Segreto" 
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-4 text-white focus:border-red-500/70 focus:bg-stone-600/70 outline-none text-center tracking-widest transition placeholder-stone-400"
          />
          
          {error && <p className="text-red-200 bg-red-900/50 py-2 rounded-lg text-sm font-bold animate-pulse">⛔ Codice Errato.</p>}

          <button className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02]">
            Accedi al Pannello
          </button>
        </form>
        
        <Link href="/" className="block mt-8 text-stone-300 text-sm hover:text-white transition">
          ← Torna alla Home
        </Link>
      </div>
    </main>
  );
}