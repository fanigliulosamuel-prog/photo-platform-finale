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
      <div className="relative z-10 flex flex-col items-center animate-pulse-slow">
        
        <h1 className={`${playfair.className} text-6xl md:text-9xl font-bold text-white mb-4 drop-shadow-2xl tracking-tight`}>
          Photo Platform
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mb-12 font-light tracking-wide shadow-black drop-shadow-md">
          Cattura l'attimo. Condividi la visione. Ispira il mondo.
        </p>

        {/* Pulsanti */}
        <div className="flex flex-col md:flex-row gap-6 mb-16"> {/* Aggiunto margin-bottom per separare dal footer */}
          
          {/* Bottone 1: Registrazione/Inizio */}
          <Link href="/login">
            <button className="px-10 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Inizia a Creare
            </button>
          </Link>
          
          {/* Bottone 2: Galleria */}
          <Link href="/explore">
            <button className="px-10 py-4 backdrop-blur-md bg-white/10 border border-white/30 text-white text-lg font-bold rounded-full hover:bg-white/20 transition duration-300">
              Esplora Gallery
            </button>
          </Link>
          
        </div>

        {/* --- FOOTER SVILUPPATO DA TPC --- */}
        {/* Modificato da bottom-8 a bottom-2 per spostarlo molto più in basso */}
        <div className="absolute bottom-2 flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity duration-500">
            <p className={`${inter.className} text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2`}>Sviluppato da</p>
            <div className="flex items-center gap-3 border border-white/20 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                {/* Logo Quadrato TPC */}
                <div className="w-8 h-8 border border-white flex items-center justify-center bg-transparent">
                    <span className="text-white font-bold text-[10px]">TPC</span>
                </div>
                {/* Testo Esteso */}
                <span className={`${playfair.className} text-white text-sm font-medium tracking-wider`}>
                    Two Photographers of Code
                </span>
            </div>
        </div>

      </div>
    </main>
  );
}