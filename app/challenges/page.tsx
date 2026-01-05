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
    month: 11, // Dicembre 2025
    title: "Luci nella Notte",
    description: "Cattura l'atmosfera della città quando il sole tramonta. Neon, lampioni, scie luminose.",
    category: "Sfida del Mese",
    status: "ended", // Segniamo come finita per logica
    prizeBadge: "✨ Maestro delle Luci"
  },
  {
    month: 0, // Gennaio 2026
    title: "Il Calore del Freddo",
    description: "Racconta l'inverno attraverso i ritratti. Sciarpe, neve, espressioni che scaldano.",
    category: "Sfida del Mese",
    status: "active", // Questa diventa la nuova attiva
    prizeBadge: "❄️ Cuore d'Inverno"
  },
  {
    month: 1, // Febbraio 2026
    title: "Geometrie Urbane",
    description: "Linee, forme e prospettive dell'architettura moderna.",
    category: "Sfida del Mese",
    status: "upcoming",
    prizeBadge: "📐 Architetto Visivo"
  }
];

// Data di fine della sfida di DICEMBRE
const PREVIOUS_DEADLINE = new Date("2025-12-31T23:59:59");
// 24 Ore di tempo per il calcolo
const CALCULATION_TIME = 24 * 60 * 60 * 1000; 

// Data di fine della NUOVA sfida (Gennaio)
const CURRENT_DEADLINE = new Date("2026-01-31T23:59:59");

type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  likes: number;
  user_id: string; // Aggiunto user_id per l'assegnazione badge
}

export default function ChallengesPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stati della sfida: 'active' | 'calculating' | 'winner_announced'
  const [challengeState, setChallengeState] = useState<'active' | 'calculating' | 'winner_announced'>('active');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determiniamo quale sfida mostrare in base allo stato
  const activeChallengeData = challengeState === 'winner_announced' ? CHALLENGES_CALENDAR[1] : CHALLENGES_CALENDAR[0];
  const activeDeadline = challengeState === 'winner_announced' ? CURRENT_DEADLINE : PREVIOUS_DEADLINE;

  // Funzione per assegnare il badge al vincitore
  const assignWinnerBadge = async (winnerUserId: string, badgeName: string) => {
    try {
      // 1. Recupera il profilo attuale
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('badges')
        .eq('id', winnerUserId)
        .single();

      if (profileError) throw profileError;

      // 2. Controlla se ha già il badge
      const currentBadges = profile.badges || [];
      if (!currentBadges.includes(badgeName)) {
        // 3. Aggiungi il nuovo badge
        const updatedBadges = [...currentBadges, badgeName];

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ badges: updatedBadges })
          .eq('id', winnerUserId);

        if (updateError) throw updateError;
        console.log(`Badge "${badgeName}" assegnato con successo all'utente ${winnerUserId}`);
      } else {
        console.log(`L'utente ha già il badge "${badgeName}"`);
      }

    } catch (error) {
      console.error("Errore nell'assegnazione del badge:", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const prevEnd = PREVIOUS_DEADLINE.getTime();
      const calcEnd = prevEnd + CALCULATION_TIME;

      if (now < prevEnd) {
        // FASE 1: Sfida Dicembre ancora in corso
        setChallengeState('active');
        calculateTimeLeft(prevEnd - now);
      } else if (now >= prevEnd && now < calcEnd) {
        // FASE 2: Calcolo in corso (24 ore cuscinetto)
        setChallengeState('calculating');
        calculateTimeLeft(0); // Timer a zero
      } else {
        // FASE 3: Calcolo finito -> Mostra vincitore e Nuova Sfida
        setChallengeState('winner_announced');
        // Ora il countdown punta alla fine di Gennaio
        calculateTimeLeft(CURRENT_DEADLINE.getTime() - now);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Effetto separato per gestire l'assegnazione del badge quando lo stato cambia
  useEffect(() => {
    if (challengeState === 'winner_announced' && photos.length > 0) {
      const winner = photos[0];
      const badgeToAssign = CHALLENGES_CALENDAR[0].prizeBadge; // Badge della sfida passata
      
      if (winner && winner.user_id) {
        assignWinnerBadge(winner.user_id, badgeToAssign);
      }
    }
  }, [challengeState, photos]);


  const calculateTimeLeft = (distance: number) => {
    if (distance < 0) distance = 0;
    setTimeLeft({
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    });
  };

  useEffect(() => {
    async function fetchChallengePhotos() {
      // Carichiamo le foto (assumiamo siano quelle della sfida appena conclusa o in corso)
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('category', 'Sfida del Mese') 
        .order('likes', { ascending: false }); // Ordine per Like per determinare il vincitore

      if (!error) setPhotos(data || []);
      setLoading(false);
    }
    fetchChallengePhotos();
  }, []);

  // Il vincitore è il primo della lista (più likes)
  const winner = photos.length > 0 ? photos[0] : null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
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
          
          {/* STATO: CALCOLO IN CORSO (24h) */}
          {challengeState === 'calculating' && (
             <div className="text-center py-10 animate-pulse">
                <span className="text-5xl mb-4 block">⏳</span>
                <h2 className="text-3xl font-bold text-amber-300 mb-2">Sfida Terminata!</h2>
                <p className="text-stone-300">Stiamo calcolando i vincitori... torna tra poco!</p>
             </div>
          )}

          {/* STATO: NUOVA SFIDA + VINCITORE PASSATO */}
          {challengeState === 'winner_announced' && (
             <div className="mb-10">
                {/* Banner Vincitore */}
                {winner && (
                  <div className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/50 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                     <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden border-2 border-amber-400 relative group">
                        <img src={winner.url} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                        <div className="absolute top-2 right-2 bg-amber-500 text-black font-bold px-3 py-1 rounded-full text-xs shadow-lg">🥇 Vincitore Dicembre</div>
                     </div>
                     <div className="text-left flex-1">
                        <h3 className="text-amber-400 font-bold text-lg mb-1 uppercase tracking-wider">Hall of Fame</h3>
                        <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold text-white mb-2`}>{winner.title}</h2>
                        <p className="text-stone-300 mb-4">by <span className="text-white font-bold">{winner.author_name}</span></p>
                        <div className="inline-flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-full font-bold text-sm">
                           <span>{CHALLENGES_CALENDAR[0].prizeBadge}</span>
                           <span>Assegnato ✅</span>
                        </div>
                     </div>
                  </div>
                )}
                <div className="h-px w-full bg-stone-600/50 mb-10"></div>
             </div>
          )}

          {/* CONTENUTO SFIDA ATTIVA (O Nuova o Vecchia se non scaduta) */}
          {(challengeState === 'active' || challengeState === 'winner_announced') && (
            <>
                <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/30 animate-pulse">● Sfida Attiva</span>
                <h1 className={`${playfair.className} text-4xl md:text-7xl font-bold text-white mb-4 drop-shadow-xl`}>{activeChallengeData.title}</h1>
                <p className="text-lg text-stone-200 max-w-2xl mx-auto mb-8 leading-relaxed">{activeChallengeData.description}</p>

                {/* RIQUADRO PREMIO */}
                <div className="inline-block bg-stone-800/40 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-5 mb-10 max-w-xl hover:border-amber-400/50 transition-colors">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <div className="bg-amber-500/20 p-4 rounded-full text-3xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">🏆</div>
                    <div>
                        <h3 className="text-amber-300 font-bold text-lg">Premio: Badge "{activeChallengeData.prizeBadge}"</h3>
                        <p className="text-stone-300 text-sm mt-1 leading-snug">
                        Il badge verrà assegnato <strong>automaticamente</strong> al vincitore allo scadere del timer.
                        </p>
                    </div>
                    </div>
                </div>

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
            </>
          )}
        </div>

        {/* CLASSIFICA (Sempre visibile per trasparenza) */}
        <div className="relative z-10 max-w-7xl mx-auto p-8 bg-stone-800/50 backdrop-blur-xl rounded-t-[3rem] border-t border-stone-500/30 min-h-[500px]">
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3 text-stone-100">
                {challengeState === 'winner_announced' ? '🏆 Classifica Finale (Dicembre)' : '📊 Classifica Provvisoria'}
            </h2>
            {loading ? <p className="text-center text-stone-400">Caricamento...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {photos.map((photo, index) => (
                <Link href={`/photo/${photo.id}`} key={photo.id} className="group relative block break-inside-avoid">
                    {index === 0 && <div className="absolute -top-3 -right-3 z-20 text-5xl drop-shadow-xl animate-pulse">🥇</div>}
                    {index === 1 && <div className="absolute -top-3 -right-3 z-20 text-4xl drop-shadow-lg">🥈</div>}
                    {index === 2 && <div className="absolute -top-3 -right-3 z-20 text-4xl drop-shadow-lg">🥉</div>}
                    <div className="aspect-[4/5] bg-stone-700 rounded-2xl overflow-hidden cursor-pointer border border-stone-500/30 group-hover:border-amber-400/50 transition duration-500 shadow-xl">
                        <img src={photo.url} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent flex flex-col justify-end p-6">
                            <p className="font-bold text-lg text-white mb-1 line-clamp-1">{photo.title}</p>
                            <div className="flex justify-between items-center"><p className="text-sm text-stone-300">by {photo.author_name}</p><div className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1 border border-white/20">❤️ {photo.likes || 0}</div></div>
                        </div>
                    </div>
                </Link>
                ))}
                {photos.length === 0 && <div className="col-span-full text-center py-20 bg-stone-400/10 rounded-2xl border border-dashed border-stone-400/30"><p className="text-stone-300 text-lg">Nessun partecipante. Sii il primo!</p></div>}
            </div>
            )}
        </div>
      </main>
    </div>
  );
}