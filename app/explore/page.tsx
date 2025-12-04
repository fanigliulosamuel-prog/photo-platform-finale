"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  likes: number;
}

export default function ExplorePage() {
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState("Tutti");
  const [search, setSearch] = useState(""); 
  const [loading, setLoading] = useState(true);

  async function fetchPhotos() {
    setLoading(true);
    
    let query = supabase.from('photos').select('*');

    if (category !== "Tutti") {
      query = query.eq('category', category);
    }

    if (search.trim() !== "") {
      query = query.or(`title.ilike.%${search}%,author_name.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (!error) {
      setPhotos(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPhotos();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, search]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden">
      
      {/* --- SFONDO TEXTURE & LUCI (Stile Aurora) --- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
        
        {/* INTESTAZIONE */}
        <div className="text-center mb-12">
          <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl tracking-tight`}>
            Esplora Visioni
          </h1>
          <p className="text-indigo-200 text-lg font-light max-w-2xl mx-auto">
            Cerca ispirazione tra migliaia di scatti unici della nostra community.
          </p>
        </div>

        {/* --- BARRA DI RICERCA & FILTRI --- */}
        <div className="flex flex-col items-center gap-8 mb-16">
          
          {/* Input Ricerca */}
          <div className="relative w-full max-w-lg group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-indigo-400 text-xl">🔍</span>
            </div>
            <input 
              type="text" 
              placeholder="Cerca 'Tramonto', 'Mario Rossi', 'Neon'..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-indigo-500/30 rounded-full text-white placeholder-indigo-300 focus:outline-none focus:bg-white/10 focus:border-indigo-400 focus:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
            />
          </div>

          {/* Filtri Categorie */}
          <div className="flex flex-wrap justify-center gap-3">
            {['Tutti', 'Ritratti', 'Paesaggi', 'Street', 'Architettura'].map((tag) => (
              <button 
                key={tag} 
                onClick={() => setCategory(tag)}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border ${
                  category === tag 
                    ? "bg-white text-indigo-950 border-white shadow-lg scale-105" 
                    : "bg-white/5 text-indigo-300 border-white/10 hover:bg-white/10 hover:border-white/30"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRIGLIA FOTO --- */}
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="columns-1 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {photos.map((photo) => (
              <Link href={`/photo/${photo.id}`} key={photo.id} className="block break-inside-avoid group cursor-pointer">
                
                <div className="relative overflow-hidden rounded-2xl bg-slate-800 border border-white/10 shadow-lg group-hover:border-indigo-500/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-500">
                  
                  <img 
                    src={photo.url} 
                    alt={photo.title} 
                    className="w-full h-auto object-cover transform group-hover:scale-110 transition duration-700 ease-in-out" 
                  />
                  
                  {/* Overlay Info + Watermark */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-5">
                    
                    {/* Watermark in alto */}
                    <div className="absolute top-4 left-4 text-white/70 text-xs font-bold bg-black/30 px-2 py-1 rounded backdrop-blur-sm opacity-80">
                        © {photo.author_name}
                    </div>

                    <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition duration-300">{photo.title}</h3>
                    <div className="flex justify-between items-center mt-2 translate-y-4 group-hover:translate-y-0 transition duration-300 delay-75">
                      <span className="text-indigo-200 text-xs">{photo.author_name}</span>
                      <span className="text-white text-xs bg-white/10 px-2 py-1 rounded-full">❤️ {photo.likes || 0}</span>
                    </div>
                  </div>

                </div>

              </Link>
            ))}
            
            {photos.length === 0 && (
               <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-indigo-200 text-xl font-light">Nessun risultato trovato per "{search}" in {category}.</p>
                  <button onClick={() => {setSearch(""); setCategory("Tutti")}} className="mt-4 text-white underline hover:text-indigo-400">Resetta filtri</button>
               </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}