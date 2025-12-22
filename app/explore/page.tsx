"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  likes: number;
}

// LISTA CATEGORIE ESTESA (Esclusa "Sfida del Mese" che è a parte)
const CATEGORIES = [
  "Tutti", "Ritratti", "Paesaggi", "Street", "Architettura", 
  "Natura", "Animali", "Viaggi", "Moda", "Food", 
  "Sport", "Macro", "Bianco e Nero", "Eventi", "Astratto"
];

export default function ExplorePage() {
  const router = useRouter();
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState("Tutti");
  const [search, setSearch] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Stato per il menu laterale

  async function fetchPhotos() {
    setLoading(true);
    
    let query = supabase.from('photos').select('*');

    // 1. FILTRO SICUREZZA: Mostra solo foto PUBBLICHE (senza progetto privato)
    query = query.is('project_id', null);

    // 2. ESCLUDI SFIDE: Le foto della sfida vanno nella pagina Sfide
    query = query.neq('category', 'Sfida del Mese');

    // 3. Filtri Utente
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
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex w-full relative z-10 h-screen">

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
              {/* Link Attivo */}
              <Link href="/explore" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
              <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
              <Link href="/challenges" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏆 Sfide</Link>
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
        
        {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

        {/* --- AREA PRINCIPALE --- */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10 flex flex-col">
            
            {/* Tasto Hamburger Mobile */}
            <div className="flex items-center mb-6 md:hidden">
                <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">
                ☰
                </button>
                <h1 className="text-2xl font-bold text-white font-serif">Galleria</h1>
            </div>

            <div className="max-w-7xl mx-auto w-full">
                
                <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl tracking-tight hidden md:block font-serif">
                    Esplora Visioni
                </h1>
                <p className="text-stone-200 text-lg font-light max-w-2xl mx-auto hidden md:block">
                    Cerca ispirazione tra migliaia di scatti unici della nostra community.
                </p>
                </div>

                {/* --- BARRA DI RICERCA & FILTRI --- */}
                <div className="flex flex-col items-center gap-8 mb-16">
                <div className="relative w-full max-w-lg group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="text-stone-400 text-xl">🔍</span>
                    </div>
                    <input 
                    type="text" 
                    placeholder="Cerca 'Tramonto', 'Mario', 'Neon'..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-stone-400/30 border border-stone-300/30 rounded-full text-white placeholder-stone-300 focus:outline-none focus:bg-stone-400/40 focus:border-amber-300/50 focus:shadow-[0_0_20px_rgba(217,119,6,0.2)] transition-all"
                    />
                </div>

                {/* Filtri Categorie Scorrevoli */}
                <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex flex-nowrap gap-3 justify-start md:justify-center min-w-max px-4">
                        {CATEGORIES.map((tag) => (
                        <button 
                            key={tag} 
                            onClick={() => setCategory(tag)}
                            className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border whitespace-nowrap ${
                            category === tag 
                                ? "bg-stone-100 text-stone-900 border-white shadow-lg scale-105" 
                                : "bg-stone-400/20 text-stone-200 border-stone-300/20 hover:bg-stone-400/30"
                            }`}
                        >
                            {tag}
                        </button>
                        ))}
                    </div>
                </div>
                </div>

                {/* --- GRIGLIA FOTO --- */}
                {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                ) : (
                <div className="columns-1 md:columns-3 lg:columns-4 gap-6 space-y-6 pb-20">
                    {photos.map((photo) => (
                    <Link href={`/photo/${photo.id}`} key={photo.id} className="block break-inside-avoid group cursor-pointer">
                        <div className="relative overflow-hidden rounded-2xl bg-stone-800 border border-stone-500/30 shadow-lg group-hover:border-amber-400/50 transition-all duration-500">
                        <img 
                            src={photo.url} 
                            alt={photo.title} 
                            className="w-full h-auto object-cover transform group-hover:scale-110 transition duration-700 ease-in-out" 
                        />
                        
                        {/* Overlay Info + Watermark */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-800/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-5">
                            <div className="absolute top-4 left-4 text-white/70 text-xs font-bold bg-black/30 px-2 py-1 rounded backdrop-blur-sm opacity-80">
                                © {photo.author_name}
                            </div>
                            <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition duration-300">{photo.title}</h3>
                            <div className="flex justify-between items-center mt-2 translate-y-4 group-hover:translate-y-0 transition duration-300 delay-75">
                            <span className="text-stone-300 text-xs">{photo.category}</span>
                            <span className="text-white text-xs bg-white/10 px-2 py-1 rounded-full">❤️ {photo.likes || 0}</span>
                            </div>
                        </div>
                        </div>
                    </Link>
                    ))}
                    
                    {photos.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-stone-400/20 rounded-3xl border border-dashed border-stone-400/30">
                        <p className="text-stone-200 text-xl font-light">Nessun risultato trovato.</p>
                        <button onClick={() => {setSearch(""); setCategory("Tutti")}} className="mt-4 text-white underline hover:text-indigo-400">Resetta filtri</button>
                    </div>
                    )}
                </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
}