"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

// --- CONFIGURAZIONE CALENDARIO SFIDE ---
const CHALLENGES_CALENDAR = [
  {
    month: 11, // Dicembre 2025 (Passata)
    title: "Luci nella Notte",
    description: "Cattura l'atmosfera della città quando il sole tramonta. Neon, lampioni, scie luminose.",
    category: "Sfida del Mese",
    status: "ended", 
    prizeBadge: "✨ Maestro delle Luci"
  },
  {
    month: 0, // Gennaio 2026 (Attuale)
    title: "Il Calore del Freddo",
    description: "Racconta l'inverno attraverso i ritratti. Sciarpe, neve, espressioni che scaldano.",
    category: "Sfida del Mese",
    status: "active", 
    prizeBadge: "❄️ Cuore d'Inverno"
  },
  {
    month: 1, // Febbraio 2026 (Futura)
    title: "Geometrie Urbane",
    description: "Linee, forme e prospettive dell'architettura moderna.",
    category: "Sfida del Mese",
    status: "upcoming",
    prizeBadge: "📐 Architetto Visivo"
  }
];

// Data di fine della sfida di GENNAIO (Attuale)
const CURRENT_DEADLINE = new Date("2026-01-31T23:59:59");

type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  likes: number;
  user_id: string;
  created_at: string;
}

export default function ChallengesPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // La sfida attiva è quella di Gennaio (Indice 1 nell'array)
  const activeChallengeData = CHALLENGES_CALENDAR[1];

  // --- TIMER COUNTDOWN ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = CURRENT_DEADLINE.getTime() - now;
      
      if (distance < 0) {
        // Sfida finita
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- FETCH FOTO (SOLO GENNAIO) ---
  useEffect(() => {
    async function fetchJanuaryPhotos() {
      try {
        // Definiamo i limiti temporali per Gennaio 2026
        const startOfJan = new Date("2026-01-01T00:00:00").toISOString();
        const endOfJan = new Date("2026-01-31T23:59:59").toISOString();

        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('category', 'Sfida del Mese')
          // --- FILTRO CRUCIALE: Solo foto create a Gennaio ---
          .gte('created_at', startOfJan) 
          .lte('created_at', endOfJan)
          // --------------------------------------------------
          .order('likes', { ascending: false });

        if (error) throw error;
        setPhotos(data || []);
      } catch (err) {
        console.error("Errore caricamento classifica:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJanuaryPhotos();
  }, []);

  // Stili per le medaglie
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] md:-translate-y-4 z-10 scale-105"; // Oro
      case 1: return "border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.4)] z-0"; // Argento
      case 2: return "border-orange-700 shadow-[0_0_20px_rgba(194,65,12,0.4)] z-0"; // Bronzo
      default: return "border-stone-700";
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* SIDEBAR */}
      <aside className={`fixed md:relative w-64 bg-stone-700/40 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 h-full transition-transform duration-300 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">Photo Platform</h2>
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">✕</button>
          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏠 Dashboard</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
            {/* Link Attivo */}
            <Link href="/challenges" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🏆 Sfide</Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
            <Link href="/upload" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
            <Link href="/contracts" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📄 Genera Contratti</Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔒 Area Clienti</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>
            <Link href="/notifications" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔔 Notifiche</Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>⚙️ Impostazioni</Link>
          </nav>
          <div className="mt-auto pt-6 border-t border-stone-500/30"><button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">🚪 Esci</button></div>
      </aside>
      
      {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        <div className="flex items-center mb-8 md:hidden"><button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button><h1 className={`${playfair.className} text-2xl font-bold text-white`}>Sfide</h1></div>

        <div className="relative z-10 p-8 md:p-12 text-center max-w-5xl mx-auto bg-stone-400/10 rounded-3xl border border-stone-400/20 backdrop-blur-xl shadow-2xl mb-12">
          
          {/* HEADER SFIDA ATTIVA */}
            <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/30 animate-pulse">● Sfida di Gennaio Attiva</span>
            <h1 className={`${playfair.className} text-4xl md:text-7xl font-bold text-white mb-4 drop-shadow-xl`}>{activeChallengeData.title}</h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto mb-8 leading-relaxed">{activeChallengeData.description}</p>

            {/* RIQUADRO PREMIO */}
            <div className="inline-block bg-stone-800/40 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-5 mb-10 max-w-xl hover:border-amber-400/50 transition-colors">
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="bg-amber-500/20 p-4 rounded-full text-3xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">🏆</div>
                <div>
                    <h3 className="text-amber-300 font-bold text-lg">Premio: Badge "{activeChallengeData.prizeBadge}"</h3>
                    <p className="text-stone-300 text-sm mt-1 leading-snug">
                    Partecipa entro fine mese. Il vincitore sarà deciso dai Mi Piace della community.
                    </p>
                </div>
                </div>
            </div>

            {/* TIMER */}
            <div className="flex justify-center gap-3 md:gap-6 mb-10">
                {['Giorni', 'Ore', 'Minuti', 'Secondi'].map((label, i) => {
                    const values = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];
                    return (<div key={label} className="text-center"><div className="w-14 h-14 md:w-20 md:h-20 bg-stone-800/50 backdrop-blur-md rounded-xl border border-stone-500/30 flex items-center justify-center text-xl md:text-3xl font-bold text-white shadow-inner">{values[i]}</div><p className="text-[10px] text-stone-400 uppercase mt-2 font-bold tracking-wider">{label}</p></div>);
                })}
            </div>
            
            <Link href={`/upload?category=${encodeURIComponent("Sfida del Mese")}`}>
            <button className="px-8 py-3 md:px-12 md:py-4 bg-white text-stone-900 text-lg font-bold rounded-full hover:scale-105 transition transform shadow-xl hover:shadow-amber-500/20">Partecipa Ora 📸</button>
            </Link>
            <p className="text-stone-400 text-xs mt-4">La categoria verrà impostata automaticamente su <strong>"Sfida del Mese"</strong>.</p>
        </div>

        {/* --- CLASSIFICA GENNAIO --- */}
        <div className="relative z-10 max-w-7xl mx-auto p-8 bg-stone-800/50 backdrop-blur-xl rounded-[2.5rem] border border-stone-600/30 min-h-[500px] shadow-2xl">
            <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3 text-stone-100">
                🏆 Classifica di Gennaio
            </h2>
            
            {loading ? (
                <p className="text-center text-stone-400 animate-pulse py-10">Caricamento classifica in corso...</p>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-4">
                {photos.map((photo, index) => (
                <Link href={`/photo/${photo.id}`} key={photo.id} className={`group relative block break-inside-avoid rounded-2xl transition-all duration-300 ${index === 0 ? 'order-first md:order-2' : index === 1 ? 'order-2 md:order-1' : 'order-3'}`}>
                    
                    {/* MEDAGLIE */}
                    {index === 0 && <div className="absolute -top-6 -right-4 z-20 text-6xl drop-shadow-xl animate-bounce">🥇</div>}
                    {index === 1 && <div className="absolute -top-5 -right-3 z-20 text-5xl drop-shadow-lg">🥈</div>}
                    {index === 2 && <div className="absolute -top-5 -right-3 z-20 text-5xl drop-shadow-lg">🥉</div>}
                    
                    <div className={`aspect-[4/5] bg-stone-900 rounded-2xl overflow-hidden cursor-pointer border-2 transition duration-500 shadow-xl ${getRankStyle(index)}`}>
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                        
                        {/* Overlay info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent flex flex-col justify-end p-6">
                            <p className="font-bold text-lg text-white mb-1 line-clamp-1">{photo.title}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-stone-300">by {photo.author_name}</p>
                                <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1 border border-white/20 backdrop-blur-md">
                                    ❤️ {photo.likes || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
                ))}
                
                {photos.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-stone-400/5 rounded-3xl border border-dashed border-stone-500/30">
                        <p className="text-2xl mb-2">🧊</p>
                        <p className="text-stone-300 text-lg">Nessuna foto caricata a Gennaio.</p>
                        <p className="text-stone-500 text-sm">Sii il primo a partecipare!</p>
                    </div>
                )}
            </div>
            )}
        </div>
      </main>
    </div>
  );
}