"use client"

import { useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function PrivateGalleryPage() {
  
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  // Simuliamo un album segreto
  const secretPhotos = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?w=800&q=80",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=800&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    "https://images.unsplash.com/photo-1522673607200-1645062cd495?w=800&q=80",
  ];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // PIN segreto di prova: 2025
    if (pin === "2025") {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin(""); // Resetta il campo se sbagli
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        
        {/* --- STATO 1: BLOCCATO (Lucchetto) --- */}
        {!unlocked ? (
          <div className="flex flex-col items-center animate-fade-in-up">
            
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <span className="text-4xl">🔒</span>
            </div>

            <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-4 text-center`}>
              Area Clienti Privata
            </h1>
            <p className="text-indigo-200 mb-10 text-center max-w-md">
              Questa galleria è protetta. Inserisci il codice PIN fornito dal fotografo per visualizzare l'album "Matrimonio Elena & Luca".
            </p>

            <form onSubmit={handleUnlock} className="flex flex-col items-center gap-4 w-full max-w-xs">
              <input 
                type="password" 
                placeholder="Inserisci PIN (es. 2025)" 
                className="w-full text-center text-2xl tracking-[0.5em] py-4 bg-black/40 border border-white/20 rounded-2xl focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.5)] outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-gray-500"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
              />
              
              {error && <p className="text-red-400 text-sm font-bold animate-bounce">PIN Errato. Riprova.</p>}

              <button className="w-full py-4 bg-white text-indigo-950 font-bold rounded-2xl hover:scale-105 transition shadow-lg mt-2">
                SBLOCCA 🔓
              </button>
            </form>

            <Link href="/" className="mt-12 text-gray-500 hover:text-white transition text-sm">
              ← Torna alla Home
            </Link>

          </div>
        ) : (
          
          /* --- STATO 2: SBLOCCATO (Galleria) --- */
          <div className="animate-fade-in">
            <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
              <div>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">Album Privato</p>
                <h1 className={`${playfair.className} text-4xl font-bold`}>Matrimonio Elena & Luca</h1>
              </div>
              <button onClick={() => setUnlocked(false)} className="text-sm text-gray-400 hover:text-white transition border border-white/10 px-4 py-2 rounded-full">
                Esci 🔒
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secretPhotos.map((src, index) => (
                <div key={index} className="group relative aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition duration-500">
                  <img src={src} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                  
                  {/* Azioni Cliente */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                    <button className="bg-white text-black w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition" title="Scarica">
                      ⬇️
                    </button>
                    <button className="bg-white/20 backdrop-blur-md text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/40 transition border border-white/30" title="Aggiungi ai preferiti">
                      ❤️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
               <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105">
                 Scarica Tutte le Foto (.zip)
               </button>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
