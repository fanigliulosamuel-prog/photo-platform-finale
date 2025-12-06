"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
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
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    let query = supabase.from('profiles').select('*');

    // Filtra per città se l'utente ha scritto qualcosa
    if (searchCity.trim() !== "") {
      query = query.ilike('city', `%${searchCity}%`);
    }

    const { data, error } = await query;
    if (!error) {
      setProfiles(data || []);
    }
    setLoading(false);
  }

  // Ricarica la ricerca quando premi invio o il bottone
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfiles();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* --- MENU DI NAVIGAZIONE --- */}
      <nav className="relative z-20 p-6 flex flex-wrap justify-between items-center max-w-7xl mx-auto w-full border-b border-white/5 gap-4">
        <Link href="/" className={`${playfair.className} text-2xl font-bold text-white tracking-tight hover:text-indigo-300 transition`}>
           Photo Platform
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard">
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs sm:text-sm font-bold text-white transition backdrop-blur-md flex items-center gap-2">
                  🏠 Dashboard
                </button>
            </Link>
            <Link href="/explore">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs sm:text-sm font-bold text-indigo-200 hover:text-white transition">
                  📷 Gallery
                </button>
            </Link>
            <Link href="/">
                <button className="hidden sm:block px-4 py-2 text-xs sm:text-sm font-bold text-indigo-200 hover:text-white transition">
                  Home
                </button>
            </Link>
        </div>
      </nav>

      <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
        
        {/* INTESTAZIONE */}
        <div className="text-center mb-16">
          <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl`}>
            Trova un Fotografo
          </h1>
          <p className="text-indigo-200 text-lg font-light max-w-2xl mx-auto mb-10">
            Cerca talenti vicino a te per il tuo prossimo progetto.
          </p>

          {/* BARRA DI RICERCA CITTÀ */}
          <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-indigo-400 text-xl">📍</span>
            </div>
            <input 
              type="text" 
              placeholder="Cerca per città (es. Milano, Roma)..." 
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-12 pr-32 py-4 bg-white/5 border border-indigo-500/30 rounded-full text-white placeholder-indigo-300 focus:outline-none focus:bg-white/10 focus:border-indigo-400 focus:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
            />
            <button className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition shadow-lg">
              Cerca
            </button>
          </form>
        </div>

        {/* GRIGLIA PROFILI */}
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:border-indigo-500/50 hover:bg-white/10 transition duration-300 group flex flex-col items-center text-center">
                
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 mb-4 shadow-xl group-hover:scale-110 transition duration-300">
                   <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center text-3xl font-bold">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        profile.username?.charAt(0).toUpperCase()
                      )}
                   </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">{profile.username}</h3>
                
                {/* Città */}
                <div className="flex items-center gap-1 text-indigo-300 text-sm font-bold uppercase tracking-wider mb-4 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                   <span>📍</span> {profile.city || "Nessuna città"}
                </div>

                <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                  {profile.bio || "Nessuna biografia disponibile."}
                </p>

                <Link href={`/profile/${profile.username}`} className="w-full">
                  <button className="w-full py-3 bg-white text-indigo-950 font-bold rounded-xl hover:scale-[1.02] transition shadow-lg">
                    Vedi Portfolio
                  </button>
                </Link>

              </div>
            ))}

            {profiles.length === 0 && (
               <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-indigo-200 text-xl font-light">Nessun fotografo trovato a "{searchCity}".</p>
               </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}