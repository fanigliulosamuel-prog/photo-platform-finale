import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

// Carichiamo il font elegante
const playfair = Playfair_Display({ subsets: ['latin'] });

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
        <div className="flex flex-col md:flex-row gap-6">
          
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

      </div>
    </main>
  );
}