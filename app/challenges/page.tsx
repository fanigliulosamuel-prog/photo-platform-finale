"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

// --- CONFIGURAZIONE TEMI SFIDE ---
const CHALLENGES_THEMES = [
  { month: 0, title: "Il Calore del Freddo", description: "Racconta l'inverno attraverso i ritratti.", prizeBadge: "❄️ Cuore d'Inverno" }, 
  { month: 1, title: "Geometrie Urbane", description: "Linee, forme e prospettive dell'architettura moderna.", prizeBadge: "📐 Architetto Visivo" }, 
  { month: 2, title: "Risveglio della Natura", description: "I primi fiori, il verde che torna.", prizeBadge: "🌱 Spirito Primaverile" }, 
  { month: 3, title: "Ritratti in Bianco e Nero", description: "L'eleganza delle sfumature senza colore.", prizeBadge: "⚫️ Anima Noir" }, 
  { month: 4, title: "Luci e Ombre", description: "Gioca con il contrasto forte del sole.", prizeBadge: "🌗 Maestro del Contrasto" }, 
  { month: 5, title: "Colori d'Estate", description: "Vibrazioni calde, mare e tramonti.", prizeBadge: "☀️ Re dell'Estate" }, 
  { month: 6, title: "Vita Notturna", description: "La città che non dorme mai.", prizeBadge: "🌙 Gufo Notturno" }, 
  { month: 7, title: "Acqua e Movimento", description: "Onde, cascate e riflessi.", prizeBadge: "💧 Dominatore delle Acque" }, 
  { month: 8, title: "Ritorno alle Origini", description: "Tradizioni, storia e passato.", prizeBadge: "📜 Custode del Tempo" }, 
  { month: 9, title: "Colori d'Autunno", description: "Foglie rosse, nebbia e malinconia.", prizeBadge: "🍂 Poeta Autunnale" }, 
  { month: 10, title: "Minimalismo", description: "Less is more. Pochi elementi, grande impatto.", prizeBadge: "⚪️ Essenzialista" }, 
  { month: 11, title: "Luci nella Notte", description: "Atmosfera natalizia e luci artificiali.", prizeBadge: "✨ Maestro delle Luci" }
];

type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  likes: number;
  user_id: string; // FONDAMENTALE per assegnare il badge
  created_at: string;
}

export default function ChallengesPage() {
  const router = useRouter();
  
  const [prevMonthWinner, setPrevMonthWinner] = useState<Photo | null>(null);
  const [currentMonthPhotos, setCurrentMonthPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const now = new Date();
  const currentMonthIndex = now.getMonth(); 
  const currentYear = now.getFullYear();

  const activeChallenge = CHALLENGES_THEMES.find(c => c.month === currentMonthIndex) || CHALLENGES_THEMES[0];
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const prevChallenge = CHALLENGES_THEMES.find(c => c.month === prevMonthIndex) || CHALLENGES_THEMES[11];

  const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const currentMonthName = monthNames[currentMonthIndex];
  const prevMonthName = monthNames[prevMonthIndex];

  // --- TIMER ---
  useEffect(() => {
    const deadline = new Date(currentYear, currentMonthIndex + 1, 0, 23, 59, 59);
    const timer = setInterval(() => {
      const nowTs = new Date().getTime();
      const distance = deadline.getTime() - nowTs;
      if (distance < 0) setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      else setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentMonthIndex, currentYear]);

  // --- FUNZIONE PER ASSEGNARE IL BADGE ---
  const assignBadgeToWinner = async (winnerId: string, badgeName: string) => {
    try {
        // 1. Prendi i badge attuali dell'utente
        const { data: profile } = await supabase
            .from('profiles')
            .select('badges')
            .eq('id', winnerId)
            .single();

        const currentBadges: string[] = profile?.badges || [];

        // 2. Se NON ha già il badge, aggiungilo
        if (!currentBadges.includes(badgeName)) {
            const newBadges = [...currentBadges, badgeName];
            
            const { error } = await supabase
                .from('profiles')
                .update({ badges: newBadges })
                .eq('id', winnerId);

            if (!error) {
                console.log(`Badge "${badgeName}" assegnato con successo all'utente ${winnerId}`);
            }
        }
    } catch (error) {
        console.error("Errore assegnazione badge:", error);
    }
  };

  // --- FETCH DATI E ASSEGNAZIONE ---
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Vincitore Mese Scorso
        const prevYearRef = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
        const startOfPrev = new Date(prevYearRef, prevMonthIndex, 1).toISOString();
        const endOfPrev = new Date(prevYearRef, prevMonthIndex + 1, 0, 23, 59, 59).toISOString();

        const { data: winnerData } = await supabase
            .from('photos')
            .select('*')
            .eq('category', 'Sfida del Mese')
            .gte('created_at', startOfPrev)
            .lte('created_at', endOfPrev)
            .order('likes', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (winnerData) {
            setPrevMonthWinner(winnerData);
            // --- QUI SCATTA L'ASSEGNAZIONE AUTOMATICA ---
            if (winnerData.user_id) {
                assignBadgeToWinner(winnerData.user_id, prevChallenge.prizeBadge);
            }
        }

        // 2. Foto Mese Corrente
        const startOfCurr = new Date(currentYear, currentMonthIndex, 1).toISOString();
        const endOfCurr = new Date(currentYear, currentMonthIndex + 1, 0, 23, 59, 59).toISOString();

        const { data: currData } = await supabase
          .from('photos')
          .select('*')
          .eq('category', 'Sfida del Mese')
          .gte('created_at', startOfCurr) 
          .lte('created_at', endOfCurr)
          .order('likes', { ascending: false });

        setCurrentMonthPhotos(currData || []);

      } catch (err) {
        console.error("Errore caricamento dati:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentMonthIndex, currentYear, prevMonthIndex]);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] md:-translate-y-4 z-10 scale-105"; 
      case 1: return "border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.4)] z-0"; 
      case 2: return "border-orange-700 shadow-[0_0_20px_rgba(194,65,12,0.4)] z-0"; 
      default: return "border-stone-700";
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <aside className={`fixed md:relative w-64 bg-stone-700/40 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 h-full transition-transform duration-300 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">Photo Platform</h2>
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">✕</button>
          
          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏠 Dashboard</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
            <Link href="/challenges" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🏆 Sfide del Mese</Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
            <Link href="/upload" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>⚙️ Impostazioni</Link>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-stone-500/30">
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">🚪 Esci</button>
          </div>
      </aside>
      
      {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        <div className="flex items-center mb-8 md:hidden"><button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button><h1 className={`${playfair.className} text-2xl font-bold text-white`}>Sfide</h1></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {prevMonthWinner ? (
              <div className="mb-12 animate-fade-in-down bg-stone-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-stone-500/30 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden border-2 border-amber-400 relative group shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                          <img src={prevMonthWinner.url} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                          <div className="absolute top-3 right-3 bg-amber-500 text-black font-bold px-3 py-1 rounded-full text-xs shadow-lg">🥇 Vincitore {prevMonthName}</div>
                      </div>
                      <div className="text-left flex-1">
                          <h3 className="text-amber-400 font-bold text-lg mb-2 uppercase tracking-wider">Hall of Fame</h3>
                          <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold text-white mb-4`}>{prevMonthWinner.title}</h2>
                          <div className="flex items-center gap-4 mb-6">
                              <span className="text-stone-300">Foto di <span className="text-white font-bold">{prevMonthWinner.author_name}</span></span>
                              <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold">❤️ {prevMonthWinner.likes} Likes</span>
                          </div>
                          <div className="inline-flex items-center gap-3 bg-amber-500 text-stone-900 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-amber-400 transition cursor-default">
                              <span className="text-xl">🏆</span>
                              <div>
                                  <span className="block text-[10px] uppercase tracking-wider opacity-80">Badge Assegnato</span>
                                  <span>{prevChallenge.prizeBadge}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          ) : (<div className="mb-12"></div>)}

          <div className="bg-stone-400/10 rounded-[3rem] border border-stone-400/20 backdrop-blur-xl shadow-2xl p-8 md:p-12 mb-16 text-center">
              <span className="inline-block py-1 px-4 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/30 animate-pulse">● Sfida di {currentMonthName} Attiva</span>
              <h1 className={`${playfair.className} text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-xl`}>{activeChallenge.title}</h1>
              <p className="text-xl text-stone-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">{activeChallenge.description}</p>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
                  <div className="bg-stone-800/60 backdrop-blur-sm border border-stone-600 rounded-2xl p-5 flex items-center gap-4 min-w-[280px]">
                      <div className="bg-amber-500/20 p-3 rounded-full text-2xl">🏆</div>
                      <div className="text-left"><p className="text-stone-400 text-xs uppercase font-bold">In palio il Badge</p><p className="text-amber-300 font-bold">{activeChallenge.prizeBadge}</p></div>
                  </div>
                  <div className="flex gap-3">
                      {['Giorni', 'Ore', 'Minuti', 'Secondi'].map((label, i) => {
                          const values = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];
                          return (<div key={label} className="text-center"><div className="w-14 h-14 bg-stone-800/50 backdrop-blur-md rounded-xl border border-stone-500/30 flex items-center justify-center text-xl font-bold text-white shadow-inner">{values[i]}</div><p className="text-[9px] text-stone-400 uppercase mt-2 font-bold tracking-wider">{label}</p></div>);
                      })}
                  </div>
              </div>
              <Link href={`/upload?category=${encodeURIComponent("Sfida del Mese")}`}><button className="px-10 py-4 bg-white text-stone-900 text-lg font-bold rounded-full hover:scale-105 transition transform shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-amber-500/30">Partecipa Ora 📸</button></Link>
          </div>

          <div className="bg-stone-900/40 backdrop-blur-xl rounded-[2.5rem] border border-stone-600/30 min-h-[500px] shadow-2xl p-8">
              <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3 text-stone-100">🏆 Classifica Provvisoria ({currentMonthName})</h2>
              {loading ? <p className="text-center text-stone-400 animate-pulse py-10">Aggiornamento classifica...</p> : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-2">
                  {currentMonthPhotos.map((photo, index) => (
                  <Link href={`/photo/${photo.id}`} key={photo.id} className={`group relative block break-inside-avoid rounded-2xl transition-all duration-300 ${index === 0 ? 'order-first md:order-2' : index === 1 ? 'order-2 md:order-1' : 'order-3'}`}>
                      {index === 0 && <div className="absolute -top-6 -right-4 z-20 text-6xl drop-shadow-xl animate-bounce">🥇</div>}
                      {index === 1 && <div className="absolute -top-5 -right-3 z-20 text-5xl drop-shadow-lg">🥈</div>}
                      {index === 2 && <div className="absolute -top-5 -right-3 z-20 text-5xl drop-shadow-lg">🥉</div>}
                      <div className={`aspect-[4/5] bg-stone-900 rounded-2xl overflow-hidden cursor-pointer border-2 transition duration-500 shadow-xl ${getRankStyle(index)}`}>
                          <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent flex flex-col justify-end p-6">
                              <p className="font-bold text-lg text-white mb-1 line-clamp-1">{photo.title}</p>
                              <div className="flex justify-between items-center"><p className="text-sm text-stone-300">by {photo.author_name}</p><div className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1 border border-white/20 backdrop-blur-md">❤️ {photo.likes || 0}</div></div>
                          </div>
                      </div>
                  </Link>
                  ))}
                  {currentMonthPhotos.length === 0 && <div className="col-span-full text-center py-24 bg-stone-400/5 rounded-3xl border border-dashed border-stone-500/30"><p className="text-4xl mb-4">🧊</p><p className="text-stone-300 text-xl font-light">Nessuna foto in gara per {currentMonthName}.</p><p className="text-stone-500 text-sm mt-2">Carica la tua foto e inaugura la classifica!</p></div>}
              </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}