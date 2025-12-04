import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden flex flex-col items-center justify-center p-8 text-center">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10">
        
        <h1 className="text-9xl font-extrabold text-indigo-500 mb-4 drop-shadow-xl">
          404
        </h1>
        
        <h2 className="text-4xl font-bold mb-6">
          Pagina Non Trovata
        </h2>
        
        <p className="text-indigo-200 mb-10 max-w-md mx-auto">
          Oops! Sembra che tu abbia seguito un link rotto o che l'indirizzo sia stato digitato male. Non c'è nulla qui.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explore">
                <button className="px-8 py-3 bg-white text-indigo-950 font-bold rounded-full hover:scale-105 transition shadow-lg">
                    Esplora Galleria
                </button>
            </Link>
            <Link href="/">
                <button className="px-8 py-3 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition">
                    Vai alla Home
                </button>
            </Link>
        </div>

      </div>
    </main>
  );
}