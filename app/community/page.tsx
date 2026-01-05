"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

type Profile = {
  id: string;
  username: string;
  bio: string;
  city: string;
  avatar_url: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  // --- STATI DI RICERCA ---
  const [searchCity, setSearchCity] = useState("");
  const [searchName, setSearchName] = useState(""); // <--- Nuovo stato per il nome
  
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    let query = supabase.from('profiles').select('*');

    // Filtra per Città (se inserita)
    if (searchCity.trim() !== "") {
      query = query.ilike('city', `%${searchCity}%`);
    }

    // Filtra per Nome Utente (se inserito)
    if (searchName.trim() !== "") {
        query = query.ilike('username', `%${searchName}%`);
    }

    const { data, error } = await query;
    if (!error) {
      setProfiles(data || []);
    }
    setLoading(false);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfiles();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* --- SIDEBAR --- */}
      <aside className={`fixed md:relative w-64 bg-stone-700/40 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 h-full transition-transform duration-300 z-50
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">
            Photo Platform
          </h2>
          
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">
            ✕
          </button>

          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              🏠 Dashboard
            </Link>
            
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
            {/* Link Attivo */}
            <Link href="/community" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏆 Sfide del Mese</Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>

            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
            <Link href="/upload" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
            <Link href="/contracts" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📄 Genera Contratti</Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔒 Area Clienti</Link>

            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>
            <Link href="/notifications" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔔 Notifiche</Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>⚙️ Impostazioni</Link>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-stone-500/30">
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">
              🚪 Esci
            </button>
          </div>
      </aside>
      
      {/* Overlay Mobile */}
      {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      {/* --- CONTENUTO PRINCIPALE --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        
        {/* Intestazione Mobile con Hamburger */}
        <div className="flex items-center mb-6 md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button>
            <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Community</h1>
        </div>

        <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-16">
                <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl tracking-tight hidden md:block`}>
                    Trova un Fotografo
                </h1>
                <p className="text-stone-200 text-lg font-light max-w-2xl mx-auto mb-10 hidden md:block">
                    Cerca talenti per città o per nome per il tuo prossimo progetto.
                </p>

                {/* --- NUOVA BARRA DI RICERCA DOPPIA --- */}
                <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                    
                    {/* INPUT CITTA' */}
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="text-stone-400 text-xl">📍</span>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cerca per città..." 
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-stone-400/30 border border-stone-300/30 rounded-full text-white placeholder-stone-300 focus:outline-none focus:bg-stone-400/50 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all"
                        />
                    </div>

                    {/* INPUT NOME */}
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="text-stone-400 text-xl">👤</span>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cerca per nome..." 
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-stone-400/30 border border-stone-300/30 rounded-full text-white placeholder-stone-300 focus:outline-none focus:bg-stone-400/50 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all"
                        />
                    </div>

                    {/* BOTTONE CERCA */}
                    <button className="w-full md:w-auto px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full transition shadow-lg whitespace-nowrap">
                        Cerca 🔎
                    </button>
                </form>
            </div>

            {/* Griglia Profili */}
            {loading ? (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {profiles.map((profile) => (
                <div key={profile.id} className="bg-stone-400/20 border border-stone-400/30 p-8 rounded-3xl backdrop-blur-md hover:border-amber-400/50 hover:bg-stone-400/30 transition duration-300 group flex flex-col items-center text-center shadow-lg">
                    
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-1 mb-4 shadow-xl group-hover:scale-110 transition duration-300">
                        <div className="w-full h-full rounded-full overflow-hidden bg-stone-800 flex items-center justify-center text-3xl font-bold">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                                profile.username?.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">{profile.username}</h3>
                    
                    <div className="flex items-center gap-1 text-stone-200 text-sm font-bold uppercase tracking-wider mb-4 bg-stone-600/30 px-3 py-1 rounded-full border border-stone-500/30">
                        <span>📍</span> {profile.city || "Nessuna città"}
                    </div>

                    <p className="text-stone-300 text-sm mb-6 line-clamp-2 min-h-[40px]">
                        {profile.bio || "Nessuna biografia disponibile."}
                    </p>

                    <Link href={`/profile/${profile.username}`} className="w-full">
                        <button className="w-full py-3 bg-white text-stone-900 font-bold rounded-xl hover:scale-[1.02] transition shadow-lg">
                            Vedi Portfolio
                        </button>
                    </Link>

                </div>
                ))}

                {profiles.length === 0 && (
                <div className="col-span-full text-center py-20 bg-stone-400/20 rounded-3xl border border-dashed border-stone-400/30">
                    <p className="text-stone-200 text-xl font-light">
                        Nessun fotografo trovato. Prova a modificare i filtri.
                    </p>
                </div>
                )}
            </div>
            )}
        </div>
      </main>
    </div>
  );
}