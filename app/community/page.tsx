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

    if (searchCity.trim() !== "") {
      query = query.ilike('city', `%${searchCity}%`);
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
    // FIX MOBILE: min-h-screen assicura l'altezza minima, ma lasciamo lo scroll naturale
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative">
      
      {/* Texture Sfondo FISSATA (FIXED) - rimane ferma mentre scorri */}
      <div className="fixed inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali FISSATE */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* Menu Navigazione */}
      <nav className="relative z-20 p-6 flex flex-wrap justify-between items-center max-w-7xl mx-auto w-full border-b border-stone-400/30 gap-4">
        <Link href="/" className={`${playfair.className} text-2xl font-bold text-white tracking-tight hover:text-amber-200 transition`}>
           Photo Platform
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard">
                <button className="px-4 py-2 bg-stone-100/10 hover:bg-stone-100/20 border border-stone-300/20 rounded-full text-xs sm:text-sm font-bold text-white transition backdrop-blur-md flex items-center gap-2">
                  🏠 Dashboard
                </button>
            </Link>
            <Link href="/explore">
                <button className="px-4 py-2 bg-stone-400/10 hover:bg-stone-400/20 border border-stone-300/20 rounded-full text-xs sm:text-sm font-bold text-stone-200 hover:text-white transition">
                  📷 Gallery
                </button>
            </Link>
            <Link href="/">
                <button className="hidden sm:block px-4 py-2 text-xs sm:text-sm font-bold text-stone-200 hover:text-white transition">
                  Home
                </button>
            </Link>
        </div>
      </nav>

      <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl`}>
            Trova un Fotografo
          </h1>
          <p className="text-stone-200 text-lg font-light max-w-2xl mx-auto mb-10">
            Cerca talenti vicino a te per il tuo prossimo progetto.
          </p>

          <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-stone-400 text-xl">📍</span>
            </div>
            <input 
              type="text" 
              placeholder="Cerca per città (es. Milano, Roma)..." 
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-12 pr-32 py-4 bg-stone-400/30 border border-stone-300/30 rounded-full text-white placeholder-stone-300 focus:outline-none focus:bg-stone-400/50 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all"
            />
            <button className="absolute right-2 top-2 bottom-2 px-6 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full transition shadow-lg">
              Cerca
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <p className="text-stone-200 text-xl font-light">Nessun fotografo trovato a "{searchCity}".</p>
               </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}