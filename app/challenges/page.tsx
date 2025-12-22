"use client"

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Dati Mock per simulare lo stato della sfida
const MOCK_CHALLENGE = {
  theme: "Luci e Ombre",
  description: "Cattura il contrasto drammatico tra luce e oscurità. Gioca con le silhouette e i tagli di luce per creare composizioni emotive e potenti.",
  endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Fine mese corrente
  status: "active",
  participants: 142,
  daysLeft: 12,
  prizeBadge: "🌓 Maestro di Luci" 
};

function ChallengesContent() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = MOCK_CHALLENGE.endDate;
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Sfida terminata!");
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

  // Funzione semplice per generare i giorni del calendario (mese corrente)
  const generateCalendarDays = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Domenica
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Aggiustamento per far partire la settimana da Lunedì (opzionale, qui standard Domenica-Sabato per semplicità o Lun-Dom)
    // Facciamo standard Lunedì = 0 per array visuale
    const startingBlankDays = firstDay === 0 ? 6 : firstDay - 1; 

    const days = [];
    for (let i = 0; i < startingBlankDays; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date().getDate();
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

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
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10 flex flex-col items-center justify-center">
           <div className="absolute top-4 left-4 md:hidden z-20"><button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl">☰</button></div>

           <div className="max-w-4xl mx-auto w-full text-center">
             
             {/* HEADER SFIDA */}
             <div className="mb-4">
               <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-wider uppercase mb-6 border border-amber-500/30">Sfida del Mese</span>
               <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">{MOCK_CHALLENGE.theme}</h1>
               <p className="text-xl md:text-2xl text-stone-200 max-w-2xl mx-auto font-light leading-relaxed mb-8">{MOCK_CHALLENGE.description}</p>
               
               {/* --- RIQUADRO PREMI --- */}
               <div className="inline-block bg-stone-800/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 shadow-xl shadow-amber-900/10 transform hover:scale-[1.01] transition-transform mb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-amber-500/20 p-4 rounded-full text-3xl mb-3">🏆</div>
                    <h3 className="text-amber-300 font-bold text-xl">In Palio: Badge Esclusivo "{MOCK_CHALLENGE.prizeBadge}"</h3>
                    <p className="text-stone-300 text-base mt-2 max-w-lg">
                      Oltre alla visibilità in Home Page per 24h. <br/>
                      <span className="text-stone-400 italic text-sm mt-1 block">(Il badge viene assegnato automaticamente al vincitore al termine della sfida)</span>
                    </p>
                  </div>
               </div>
               
               {/* --- STATS BAR --- */}
               <div className="flex justify-center gap-6 mb-8">
                 <div className="flex flex-col items-center">
                   <span className="text-xs text-stone-400 uppercase tracking-widest mb-1">Tempo Rimasto</span>
                   <span className="text-2xl font-mono font-bold text-amber-400">{timeLeft}</span>
                 </div>
                 <div className="w-px bg-stone-600/50 h-12"></div>
                 <div className="flex flex-col items-center">
                   <span className="text-xs text-stone-400 uppercase tracking-widest mb-1">Partecipanti</span>
                   <span className="text-2xl font-mono font-bold text-white">{MOCK_CHALLENGE.participants}</span>
                 </div>
               </div>

               {/* --- ACTION BUTTONS --- */}
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href={`/upload?category=${encodeURIComponent("Sfida del Mese")}`} className="inline-flex items-center gap-3 px-10 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-lg rounded-full transition-all hover:scale-105 shadow-2xl shadow-amber-500/30">
                    📸 Carica la tua Foto
                  </Link>
                  <button 
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-stone-700/50 hover:bg-stone-600/50 border border-stone-500/30 text-stone-200 font-bold text-lg rounded-full transition-all"
                  >
                    📅 {showCalendar ? "Nascondi Calendario" : "Vedi Calendario"}
                  </button>
               </div>

               {/* --- CALENDARIO (TOGGLE) --- */}
               {showCalendar && (
                 <div className="mt-8 bg-stone-800/80 backdrop-blur-xl border border-stone-600/50 rounded-2xl p-6 max-w-md mx-auto animate-fadeIn shadow-2xl">
                    <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm border-b border-stone-600/50 pb-2 flex justify-between">
                      <span>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <span className="text-stone-400 text-xs">Scadenze</span>
                    </h3>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-stone-400 font-bold">
                      <div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {calendarDays.map((day, idx) => {
                        const isToday = day === today;
                        const isDeadline = day === lastDay;
                        // Simuliamo che il 1° del mese dopo (o fine mese) sia importante. Qui visualizziamo mese corrente.
                        
                        return (
                          <div key={idx} className={`aspect-square flex items-center justify-center rounded-lg text-sm relative
                            ${day === null ? 'invisible' : ''}
                            ${isToday ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold' : 'text-stone-300 hover:bg-stone-700/50'}
                            ${isDeadline ? 'bg-red-500/20 text-red-300 border border-red-500/50 font-bold' : ''}
                          `}>
                            {day}
                            {isToday && <span className="absolute -bottom-1 w-1 h-1 bg-amber-500 rounded-full"></span>}
                            {isDeadline && <span className="absolute top-0 right-0 -mt-1 -mr-1 text-[10px]">🏁</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-center gap-4 text-xs text-stone-400">
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Oggi</div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Fine Sfida</div>
                    </div>
                 </div>
               )}

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