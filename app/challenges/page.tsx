"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <--- 1. IMPORT AGGIUNTO
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

// --- CALENDARIO SFIDE ---
// Il sistema sceglierà automaticamente la sfida in base al mese corrente
const CHALLENGES_CALENDAR = [
  {
    month: 11, // Dicembre (i mesi in JS partono da 0)
    year: 2025,
    title: "Luci nella Notte",
    description: "Cattura l'atmosfera della città quando il sole tramonta. Neon, lampioni, scie luminose.",
    category: "Street",
    prize: "🏆 Badge 'Master of Light'"
  },
  {
    month: 0, // Gennaio
    year: 2026,
    title: "Il Calore del Freddo",
    description: "Racconta l'inverno attraverso i ritratti. Sciarpe, neve, espressioni che scaldano.",
    category: "Ritratti",
    prize: "🏆 Badge 'Winter Soul'"
  },
  {
    month: 1, // Febbraio
    year: 2026,
    title: "Geometrie Urbane",
    description: "Linee, forme e prospettive dell'architettura moderna.",
    category: "Architettura",
    prize: "🏆 Badge 'Architect Eye'"
  }
];

type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  likes: number;
}

export default function ChallengesPage() {
  // <--- 2. INIZIALIZZAZIONE ROUTER (Deve stare PRIMA di qualsiasi if/return)
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Stati dinamici
  const [activeChallenge, setActiveChallenge] = useState(CHALLENGES_CALENDAR[0]);
  const [mode, setMode] = useState<'ACTIVE' | 'PODIUM'>('ACTIVE');
  const [podiumPhotos, setPodiumPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    // 1. Determina che giorno è oggi e quale sfida mostrare
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate(); // Giorno del mese (1-31)

    // Se è il primo giorno del mese, mostriamo il PODIO del mese scorso
    if (currentDay === 1) {
        setMode('PODIUM');
        // Trova la sfida del mese precedente (gestendo Gennaio -> Dicembre)
        const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevChallenge = CHALLENGES_CALENDAR.find(c => c.month === prevMonthIndex) || CHALLENGES_CALENDAR[0];
        
        // Carica i vincitori della sfida passata
        fetchPhotos(prevChallenge.category, true);
    } else {
        // Altrimenti mostra la sfida ATTIVA di questo mese
        setMode('ACTIVE');
        const currentChallenge = CHALLENGES_CALENDAR.find(c => c.month === currentMonth) || CHALLENGES_CALENDAR[0];
        setActiveChallenge(currentChallenge);
        fetchPhotos(currentChallenge.category, false);
    }

    // Timer (Calcola tempo rimanente alla fine del mese corrente)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
    
    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const distance = endOfMonth - currentTime;

      if (distance > 0) {
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

  async function fetchPhotos(category: string, isForPodium: boolean) {
    setLoading(true);
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('category', category)
      .order('likes', { ascending: false }); // I primi sono i vincitori

    if (data) {
        if (isForPodium) setPodiumPhotos(data);
        else setPhotos(data);
    }
    setLoading(false);
  }

  // --- VISTA PODIO (Solo il 1° del mese) ---
  if (mode === 'PODIUM') {
    return (
      <div className="flex min-h-screen bg-stone-900 text-white relative overflow-hidden items-center justify-center p-4">
           {/* Sfondo Celebration */}
           <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 to-stone-950 z-0"></div>
           <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
           
           <div className="relative z-10 max-w-5xl w-full text-center">
               <Link href="/dashboard" className="absolute top-0 left-0 text-stone-400 hover:text-white transition">← Esci</Link>
               
               <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold text-amber-200 mb-2 drop-shadow-xl animate-fade-in-up`}>
                 Vincitori del Mese!
               </h1>
               <p className="text-xl text-stone-300 mb-12">Ecco il podio della sfida appena conclusa.</p>

               {loading ? <p>Calcolo risultati...</p> : (
                   <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-10 pb-10">
                       {/* 2° Posto */}
                       {podiumPhotos[1] && (
                           <div className="order-2 md:order-1 flex flex-col items-center">
                               <div className="relative w-40 h-40 rounded-full border-4 border-stone-400 overflow-hidden shadow-2xl mb-4">
                                   <img src={podiumPhotos[1].url} className="w-full h-full object-cover" />
                                   <div className="absolute bottom-0 inset-x-0 bg-stone-400 text-stone-900 font-bold text-sm py-1">2° POSTO</div>
                               </div>
                               <p className="font-bold text-lg text-stone-300">{podiumPhotos[1].author_name}</p>
                               <p className="text-sm text-stone-500">{podiumPhotos[1].likes} Voti</p>
                           </div>
                       )}

                       {/* 1° Posto (Più grande) */}
                       {podiumPhotos[0] && (
                           <div className="order-1 md:order-2 flex flex-col items-center transform -translate-y-10">
                               <div className="text-6xl mb-2 animate-bounce">👑</div>
                               <div className="relative w-64 h-64 rounded-2xl border-4 border-amber-400 overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.3)] mb-6">
                                   <img src={podiumPhotos[0].url} className="w-full h-full object-cover" />
                                   <div className="absolute bottom-0 inset-x-0 bg-amber-400 text-amber-950 font-bold text-lg py-2">VINCITORE</div>
                               </div>
                               <h2 className="text-3xl font-bold text-white">{podiumPhotos[0].author_name}</h2>
                               <p className="text-amber-200 font-bold text-xl">{podiumPhotos[0].likes} Voti</p>
                           </div>
                       )}

                       {/* 3° Posto */}
                       {podiumPhotos[2] && (
                           <div className="order-3 flex flex-col items-center">
                               <div className="relative w-32 h-32 rounded-full border-4 border-orange-700 overflow-hidden shadow-2xl mb-4">
                                   <img src={podiumPhotos[2].url} className="w-full h-full object-cover" />
                                   <div className="absolute bottom-0 inset-x-0 bg-orange-700 text-orange-100 font-bold text-xs py-1">3° POSTO</div>
                               </div>
                               <p className="font-bold text-lg text-stone-400">{podiumPhotos[2].author_name}</p>
                               <p className="text-sm text-stone-500">{podiumPhotos[2].likes} Voti</p>
                           </div>
                       )}
                   </div>
               )}
               
               <div className="mt-12">
                  <p className="text-stone-400 text-sm">La nuova sfida inizierà domani!</p>
               </div>
           </div>
      </div>
    );
  }

  // --- VISTA NORMALE (SFIDA ATTIVA) ---
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- SIDEBAR --- */}
      <aside className={`fixed md:relative w-64 bg-stone-700/40 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 h-full transition-transform duration-300 z-50
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">Photo Platform</h2>
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">✕</button>
          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏠 Dashboard</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
            {/* Link Attivo */}
            <Link href="/challenges" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🏆 Sfide del Mese</Link>
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
            {/* QUI SI USAVA ROUTER SENZA AVERLO DICHIARATO */}
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">🚪 Esci</button>
          </div>
      </aside>
      
      {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        
        <div className="flex items-center mb-8 md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button>
            <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Sfide</h1>
        </div>

        {/* --- HALL OF FAME (Vincitore Scorsa Sfida) --- */}
        {/* Mostriamo la Hall of Fame solo se NON siamo nel giorno del podio */}
        <div className="relative z-10 mb-10 max-w-5xl mx-auto">
             <div className="bg-stone-800/40 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 md:gap-6 backdrop-blur-md shadow-lg transform hover:scale-[1.01] transition duration-300">
                <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">🏆</div>
                <div className="flex-1">
                    <p className="text-[10px] md:text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">Hall of Fame</p>
                    <h3 className="text-sm md:text-lg font-bold text-white mb-0 leading-tight">Il vincitore di "{CHALLENGES_CALENDAR[activeChallenge.month === 0 ? 11 : activeChallenge.month - 1].title}" sarà annunciato il 1° del mese!</h3>
                </div>
            </div>
        </div>

        {/* --- SFIDA ATTUALE --- */}
        <div className="relative z-10 p-8 md:p-12 text-center max-w-5xl mx-auto bg-stone-400/10 rounded-3xl border border-stone-400/20 backdrop-blur-xl shadow-2xl mb-12">
          
          <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/30 animate-pulse">
            ● Sfida Attiva: {activeChallenge.month + 1}/{activeChallenge.year}
          </span>

          <h1 className={`${playfair.className} text-4xl md:text-7xl font-bold text-white mb-4 drop-shadow-xl`}>{activeChallenge.title}</h1>
          <p className="text-lg text-stone-200 max-w-2xl mx-auto mb-8 leading-relaxed">{activeChallenge.description}</p>

          {/* Premio */}
          <div className="inline-block bg-amber-900/30 border border-amber-500/30 rounded-xl px-6 py-3 mb-10">
            <p className="text-amber-100 text-sm font-medium">{activeChallenge.prize}</p>
          </div>

          <div className="flex justify-center gap-3 md:gap-6 mb-10">
            {['Giorni', 'Ore', 'Minuti', 'Secondi'].map((label, i) => {
              const values = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];
              return (<div key={label} className="text-center"><div className="w-14 h-14 md:w-20 md:h-20 bg-stone-800/50 backdrop-blur-md rounded-xl border border-stone-500/30 flex items-center justify-center text-xl md:text-3xl font-bold text-white shadow-inner">{values[i]}</div><p className="text-[10px] text-stone-400 uppercase mt-2 font-bold tracking-wider">{label}</p></div>);
            })}
          </div>

          <Link href={`/upload?category=${encodeURIComponent(activeChallenge.category)}`}>
            <button className="px-8 py-3 md:px-12 md:py-4 bg-white text-stone-900 text-lg font-bold rounded-full hover:scale-105 transition transform shadow-xl hover:shadow-amber-500/20">Partecipa Ora 📸</button>
          </Link>
        </div>

        {/* Classifica Live */}
        <div className="relative z-10 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-stone-100 flex items-center gap-2">🔥 Classifica Live: {activeChallenge.category}</h2>
            {loading ? <p className="text-center text-stone-400">Caricamento...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
                {photos.map((photo, index) => (
                <Link href={`/photo/${photo.id}`} key={photo.id} className="group relative block">
                    {index === 0 && <div className="absolute -top-3 -right-3 z-20 text-4xl drop-shadow-lg">🥇</div>}
                    {index === 1 && <div className="absolute -top-3 -right-3 z-20 text-4xl drop-shadow-lg">🥈</div>}
                    {index === 2 && <div className="absolute -top-3 -right-3 z-20 text-4xl drop-shadow-lg">🥉</div>}

                    <div className={`aspect-[4/5] bg-stone-700 rounded-2xl overflow-hidden cursor-pointer border transition duration-500 shadow-xl ${index === 0 ? "border-amber-400/80 ring-2 ring-amber-500/20" : "border-stone-500/30 group-hover:border-amber-400/50"}`}>
                        <img src={photo.url} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent flex flex-col justify-end p-5">
                            <p className="font-bold text-lg text-white mb-1 line-clamp-1">{photo.title}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-stone-300">by {photo.author_name}</p>
                                <div className="bg-white/10 px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 border border-white/20">❤️ {photo.likes || 0}</div>
                            </div>
                        </div>
                    </div>
                </Link>
                ))}
                {photos.length === 0 && <div className="col-span-full text-center py-10 text-stone-400 border-2 border-dashed border-stone-500/30 rounded-xl">Ancora nessun partecipante. Sii il primo!</div>}
            </div>
            )}
        </div>

      </main>
    </div>
  );
}