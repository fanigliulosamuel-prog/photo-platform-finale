import { Playfair_Display, Inter } from 'next/font/google'; // Aggiunto Inter
import Link from 'next/link';

// Carichiamo i font
const playfair = Playfair_Display({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] }); // Font moderno per i dettagli tecnici/team

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-10 text-center overflow-hidden">
      
      {/* --- SFONDO FOTOGRAFICO --- */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2548&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Velo scuro per leggere meglio il testo */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* --- CONTENUTO --- */}
      <div className="relative z-10 flex flex-col items-center animate-pulse-slow w-full max-w-4xl mx-auto">
        
        <h1 className={`${playfair.className} text-6xl md:text-9xl font-bold text-white mb-6 drop-shadow-2xl tracking-tight leading-tight`}>
          Photo Platform
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mb-16 font-light tracking-wide shadow-black drop-shadow-md leading-relaxed">
          Cattura l'attimo. Condividi la visione. Ispira il mondo.
        </p>

        {/* Pulsanti */}
        <div className="flex flex-col md:flex-row gap-6 w-full justify-center px-4">
          
          {/* Bottone 1: Registrazione/Inizio - LINK DIRETTO SENZA BUTTON */}
          <Link 
            href="/login"
            className="w-full md:w-auto px-10 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center"
          >
            Inizia a Creare
          </Link>
          
          {/* Bottone 2: Galleria - LINK DIRETTO SENZA BUTTON */}
          <Link 
            href="/explore"
            className="w-full md:w-auto px-10 py-4 backdrop-blur-md bg-white/10 border border-white/30 text-white text-lg font-bold rounded-full hover:bg-white/20 transition duration-300 flex items-center justify-center"
          >
            Esplora Gallery
          </Link>
          
        </div>

      </div>

      {/* --- FOOTER SVILUPPATO DA TPC (POSIZIONATO IN BASSO) --- */}
      <div className="absolute bottom-8 w-full flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none">
          <p className={`${inter.className} text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3 font-semibold`}>Sviluppato da</p>
          
          {/* Box Logo + Nome */}
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl shadow-2xl">
              {/* Logo Quadrato TPC Minimal */}
              <div className="w-10 h-10 border-2 border-white flex items-center justify-center bg-transparent shrink-0">
                  <span className={`${inter.className} text-white font-black text-xs tracking-tighter`}>TPC</span>
              </div>
              
              {/* Testo Esteso con Separatore */}
              <div className="flex flex-col text-left">
                  <span className={`${playfair.className} text-white text-lg font-medium leading-none mb-1`}>
                      Two Photographers
                  </span>
                  <span className={`${inter.className} text-amber-500 text-[10px] font-bold uppercase tracking-widest`}>
                      of Code
                  </span>
              </div>
          </div>
      </div>

    </main>
  );
}