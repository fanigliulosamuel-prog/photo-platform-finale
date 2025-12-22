"use client"

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Dati Mock per simulare lo stato della sfida (da sostituire con chiamate DB reali)
const MOCK_CHALLENGE = {
  theme: "Luci e Ombre",
  description: "Cattura il contrasto drammatico tra luce e oscurità. Gioca con le silhouette e i tagli di luce.",
  endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Fine mese corrente
  status: "active", // 'active', 'calculating', 'completed'
  participants: 142,
  daysLeft: 12
};

const PAST_WINNER = {
  username: "MarcoRossi_Ph",
  image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  title: "Riflessi Urbani",
  month: "Novembre",
  badge: "🏆"
};

function ChallengesContent() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = MOCK_CHALLENGE.endDate;
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Sfida terminata! Calcolo vincitori...");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`${days}g ${hours}h rimanenti`);
      }
    }, 1000 * 60);

    // Init immediato
    const now = new Date();
    const end = MOCK_CHALLENGE.endDate;
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    setTimeLeft(`${days}g ${hours}h rimanenti`);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="flex w-full relative z-10 h-screen">

        {/* --- SIDEBAR --- */}
        <aside className={`fixed md:relative w-64 bg-stone-700/40 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 h-full transition-transform duration-300 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">Photo Platform</h2>
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">✕</button>
            <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
              <Link href="/dashboard" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏠 Dashboard</Link>
              <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
              <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
              {/* Link Attivo */}
              <Link href="/challenges" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🏆 Sfide</Link>
              <Link href="/upload" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
            </nav>
             <div className="mt-auto pt-6 border-t border-stone-500/30">
              <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">🚪 Esci</button>
            </div>
        </aside>

        {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
           <div className="absolute top-4 left-4 md:hidden z-20"><button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl">☰</button></div>

           <div className="max-w-5xl mx-auto">
             
             {/* HEADER SFIDA */}
             <div className="mb-12 text-center relative">
               <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-wider uppercase mb-3 border border-amber-500/30">Sfida del Mese</span>
               <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">{MOCK_CHALLENGE.theme}</h1>
               <p className="text-xl text-stone-200 max-w-2xl mx-auto font-light leading-relaxed">{MOCK_CHALLENGE.description}</p>
               
               <div className="mt-8 flex justify-center gap-4">
                 <div className="bg-stone-800/50 backdrop-blur-md border border-stone-600 rounded-xl px-6 py-3 flex flex-col items-center">
                   <span className="text-xs text-stone-400 uppercase">Tempo Rimasto</span>
                   <span className="text-xl font-mono font-bold text-amber-400">{timeLeft}</span>
                 </div>
                 <div className="bg-stone-800/50 backdrop-blur-md border border-stone-600 rounded-xl px-6 py-3 flex flex-col items-center">
                   <span className="text-xs text-stone-400 uppercase">Partecipanti</span>
                   <span className="text-xl font-mono font-bold text-white">{MOCK_CHALLENGE.participants}</span>
                 </div>
               </div>

               <Link href={`/upload?category=${encodeURIComponent("Sfida del Mese")}`} className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-full transition-transform hover:scale-105 shadow-xl shadow-amber-500/20">
                 📸 Partecipa Ora
               </Link>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* COLONNA SX: HALL OF FAME (Vincitore Mese Scorso) */}
               <div className="lg:col-span-1">
                 <div className="bg-gradient-to-b from-stone-700/40 to-stone-800/40 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 bg-amber-500 text-stone-900 text-xs font-bold px-3 py-1 rounded-bl-xl z-20">Vincitore {PAST_WINNER.month}</div>
                   <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
                   
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">👑 Hall of Fame</h3>
                   
                   <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 relative shadow-2xl">
                     <img src={PAST_WINNER.image} alt="Winner" className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                     <div className="absolute bottom-4 left-4">
                       <p className="text-white font-bold text-lg leading-tight">{PAST_WINNER.title}</p>
                       <p className="text-amber-300 text-sm flex items-center gap-1">
                         {PAST_WINNER.username} 
                         <span title="Badge Vincitore" className="bg-amber-400 text-stone-900 text-[10px] px-1 rounded-full">{PAST_WINNER.badge}</span>
                       </p>
                     </div>
                   </div>
                   <p className="text-stone-300 text-xs italic text-center">"Una composizione magistrale che ha catturato l'essenza dell'autunno."</p>
                 </div>
               </div>

               {/* COLONNA DX: GRID FOTO CORRENTI (Placeholder) */}
               <div className="lg:col-span-2">
                 <h3 className="text-lg font-bold text-white mb-4">In Gara ({MOCK_CHALLENGE.participants} scatti)</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {/* Generazione fake di card per demo */}
                   {[1,2,3,4,5,6].map((i) => (
                     <div key={i} className="aspect-square bg-stone-700/50 rounded-xl border border-stone-600/50 overflow-hidden relative group cursor-pointer hover:border-stone-400 transition">
                       <div className="absolute inset-0 flex items-center justify-center text-stone-500 text-xs">Foto {i}</div>
                       <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 translate-y-full group-hover:translate-y-0 transition">
                          <p className="text-xs text-white">Fotografo {i}</p>
                       </div>
                     </div>
                   ))}
                 </div>
                 <div className="mt-6 text-center">
                   <button className="text-stone-400 text-sm hover:text-white underline">Vedi tutte le partecipazioni</button>
                 </div>
               </div>
             </div>

           </div>
        </main>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">Caricamento Sfide...</div>}>
      <ChallengesContent />
    </Suspense>
  );
}