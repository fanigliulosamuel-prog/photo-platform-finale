"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

// Configuriamo la sfida attuale
const CURRENT_CHALLENGE = {
  title: "Luci nella Notte",
  description: "Cattura l'atmosfera della città quando il sole tramonta. Neon, lampioni, scie luminose.",
  deadline: new Date("2025-12-31T23:59:59"), 
  category: "Street" // Categoria che partecipa automaticamente
};

type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  likes: number;
}

export default function ChallengesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 1. Timer alla rovescia
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = CURRENT_CHALLENGE.deadline.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
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
        .eq('category', CURRENT_CHALLENGE.category)
        .order('likes', { ascending: false });

      if (!error) {
        setPhotos(data || []);
      }
      setLoading(false);
    }
    fetchChallengePhotos();
  }, []);

  return (
    // SFONDO CALDO (Stone 500/600)
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigazione */}
      <nav className="relative z-20 p-8">
        <Link href="/dashboard" className="text-stone-200 hover:text-white transition flex items-center gap-2">
            ← Torna alla Dashboard
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 p-8 md:p-20 text-center">
        
        <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/30 animate-pulse">
          ● Sfida Attiva
        </span>

        <h1 className={`${playfair.className} text-5xl md:text-8xl font-bold text-white mb-6 drop-shadow-xl`}>
          {CURRENT_CHALLENGE.title}
        </h1>
        
        <p className="text-xl text-stone-200 max-w-2xl mx-auto mb-12 leading-relaxed">
          {CURRENT_CHALLENGE.description}
        </p>

        {/* Timer Caldo */}
        <div className="flex justify-center gap-4 md:gap-8 mb-12">
          {['Giorni', 'Ore', 'Minuti', 'Secondi'].map((label, i) => {
            const values = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];
            return (
              <div key={label} className="text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-stone-400/20 backdrop-blur-md rounded-2xl border border-stone-300/30 flex items-center justify-center text-3xl md:text-4xl font-bold shadow-lg text-amber-100">
                  {values[i]}
                </div>
                <p className="text-xs text-stone-300 uppercase mt-3 font-bold tracking-wider">{label}</p>
              </div>
            );
          })}
        </div>

        <Link href="/upload">
          <button className="px-10 py-4 bg-white text-stone-900 text-lg font-bold rounded-full hover:scale-105 transition transform shadow-lg hover:shadow-amber-500/20">
            Partecipa Ora 📸
          </button>
        </Link>

      </div>

      {/* Classifica */}
      <div className="relative z-10 max-w-7xl mx-auto p-8 bg-stone-800/50 backdrop-blur-xl rounded-t-[3rem] border-t border-stone-500/30 min-h-screen">
        
        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3 text-stone-100">
          🏆 Classifica Provvisoria
        </h2>

        {loading ? (
          <p className="text-center text-stone-400">Caricamento classifica...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {photos.map((photo, index) => (
              <Link href={`/photo/${photo.id}`} key={photo.id} className="group relative">
                
                {/* Podio */}
                {index === 0 && <div className="absolute -top-4 -right-4 z-20 text-4xl drop-shadow-lg animate-bounce">🥇</div>}
                {index === 1 && <div className="absolute -top-4 -right-4 z-20 text-4xl drop-shadow-lg">🥈</div>}
                {index === 2 && <div className="absolute -top-4 -right-4 z-20 text-4xl drop-shadow-lg">🥉</div>}

                <div className="aspect-[4/5] bg-stone-700 rounded-2xl overflow-hidden cursor-pointer border border-stone-500/30 group-hover:border-amber-400/50 transition duration-500 shadow-xl">
                  <img 
                    src={photo.url} 
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent flex flex-col justify-end p-6">
                    <p className="font-bold text-lg text-white mb-1">{photo.title}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-stone-300">by {photo.author_name}</p>
                      <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1 border border-white/20">
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
  );
}