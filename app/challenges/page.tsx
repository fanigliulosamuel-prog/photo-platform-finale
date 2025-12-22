"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const playfair = Playfair_Display({ subsets: ['latin'] });

// --- CONFIGURAZIONE SFIDA ---
const CURRENT_CHALLENGE = {
  id: 1,
  title: "Luci nella Notte",
  description: "Cattura l'atmosfera della città quando il sole tramonta. Neon, lampioni, scie luminose. Mostraci il lato nascosto della tua metropoli.",
  // Imposta una data futura per vedere la sfida attiva
  deadline: new Date("2025-12-31T23:59:59"), 
  // FIX: Usiamo una categoria speciale ed esclusiva per la sfida
  category: "Sfida del Mese", 
  prize: "🏆 Badge 'Master of Light' sul profilo + 1 settimana in Home Page"
};

type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  likes: number;
  user_id: string;
}

export default function ChallengesPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEnded, setIsEnded] = useState(false); 
  const [winner, setWinner] = useState<Photo | null>(null); 

  // 1. Timer alla rovescia
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = CURRENT_CHALLENGE.deadline.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setIsEnded(true); 
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

  // 2. Carica le foto della sfida
  useEffect(() => {
    async function fetchChallengePhotos() {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('category', CURRENT_CHALLENGE.category) // Filtra solo per "Sfida del Mese"
        .order('likes', { ascending: false });

      if (!error && data) {
        setPhotos(data);
        if (data.length > 0) {
            setWinner(data[0]); 
        }
      }
      setLoading(false);
    }
    fetchChallengePhotos();
  }, []);

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
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">🚪 Esci</button>
          </div>
      </aside>
      
      {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        
        <div className="flex items-center mb-8 md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button>
            <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Sfide</h1>
        </div>

        {/* --- HERO SECTION --- */}
        <div className="relative z-10 p-8 md:p-12 text-center max-w-5xl mx-auto">
          
          <span className={`inline-block py-1 px-4 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border animate-pulse 
            ${isEnded ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
            {isEnded ? "● Sfida Terminata" : "● Sfida Attiva"}
          </span>

          <h1 className={`${playfair.className} text-5xl md:text-8xl font-bold text-white mb-6 drop-shadow-xl`}>
            {CURRENT_CHALLENGE.title}
          </h1>
          
          <p className="text-xl text-stone-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            {CURRENT_CHALLENGE.description}
          </p>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 max-w-lg mx-auto mb-12 backdrop-blur-md">
            <h3 className="text-amber-200 font-bold uppercase text-sm tracking-wider mb-2">🎁 Premio per il vincitore</h3>
            <p className="text-white font-medium text-lg">{CURRENT_CHALLENGE.prize}</p>
          </div>

          {!isEnded ? (
            <>
                <div className="flex justify-center gap-4 md:gap-8 mb-12">
                {['Giorni', 'Ore', 'Minuti', 'Secondi'].map((label, i) => {
                    const values = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];
                    return (
                    <div key={label} className="text-center">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-stone-400/20 backdrop-blur-md rounded-2xl border border-stone-300/30 flex items-center justify-center text-2xl md:text-4xl font-bold shadow-lg text-amber-100">
                        {values[i]}
                        </div>
                        <p className="text-[10px] md:text-xs text-stone-300 uppercase mt-3 font-bold tracking-wider">{label}</p>
                    </div>
                    );
                })}
                </div>

                {/* FIX: Link che pre-imposta la categoria */}
                <Link href={`/upload?category=${encodeURIComponent(CURRENT_CHALLENGE.category)}`}>
                  <button className="px-10 py-4 bg-stone-100 text-stone-900 text-lg font-bold rounded-full hover:scale-105 transition transform shadow-lg hover:shadow-amber-500/20">
                      Partecipa Ora 📸
                  </button>
                </Link>
                <p className="text-stone-400 text-xs mt-4">
                    La categoria <strong>"{CURRENT_CHALLENGE.category}"</strong> verrà selezionata automaticamente.
                </p>
            </>
          ) : (
             winner && (
                <div className="mb-16 animate-bounce-slow">
                    <h2 className="text-4xl font-bold text-amber-300 mb-6 drop-shadow-md">🏆 Il Vincitore è {winner.author_name}!</h2>
                    <div className="relative inline-block group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative aspect-[4/5] h-96 rounded-xl overflow-hidden shadow-2xl border-4 border-amber-500/50">
                            <img src={winner.url} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                                <p className="text-white font-bold text-xl">{winner.title}</p>
                                <p className="text-amber-300 text-sm">con {winner.likes} voti</p>
                            </div>
                        </div>
                    </div>
                </div>
             )
          )}

        </div>

        {/* CLASSIFICA */}
        <div className="relative z-10 max-w-7xl mx-auto p-8 bg-stone-800/50 backdrop-blur-xl rounded-t-[3rem] border-t border-stone-500/30 min-h-[500px]">
          
          <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3 text-stone-100">
            📊 Classifica {isEnded ? "Finale" : "Provvisoria"}
          </h2>

          {loading ? (
            <p className="text-center text-stone-400">Caricamento classifica...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {photos.map((photo, index) => (
                <Link href={`/photo/${photo.id}`} key={photo.id} className="group relative block break-inside-avoid">
                  
                  {index === 0 && <div className="absolute -top-4 -right-4 z-20 text-5xl drop-shadow-xl animate-pulse">🥇</div>}
                  {index === 1 && <div className="absolute -top-4 -right-4 z-20 text-4xl drop-shadow-lg">🥈</div>}
                  {index === 2 && <div className="absolute -top-4 -right-4 z-20 text-4xl drop-shadow-lg">🥉</div>}

                  <div className={`aspect-[4/5] bg-stone-700 rounded-2xl overflow-hidden cursor-pointer border transition duration-500 shadow-xl
                    ${index === 0 ? "border-amber-400/80 ring-4 ring-amber-500/20 scale-105" : "border-stone-500/30 group-hover:border-amber-400/50 group-hover:scale-105"}`}>
                    
                    <img 
                      src={photo.url} 
                      className="w-full h-full object-cover transition duration-700" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent flex flex-col justify-end p-6">
                      <p className="font-bold text-lg text-white mb-1">{photo.title}</p>
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
                  <div className="col-span-full text-center py-20">
                      <p className="text-stone-400 text-lg">Nessuna foto partecipante ancora. Sii il primo!</p>
                  </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}