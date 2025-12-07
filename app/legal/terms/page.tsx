import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden p-8">
      
      {/* Sfondo Texture */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto bg-stone-400/40 border border-stone-300/50 p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
        
        <h1 className="text-4xl font-bold mb-4 text-white">Termini e Condizioni d'Uso</h1>
        <p className="text-stone-200 mb-8 text-sm">L'utilizzo di Photo Platform implica l'accettazione di queste regole.</p>

        <div className="text-stone-100 space-y-6 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-2">1. Proprietà dei Contenuti</h2>
            <p>
              Gli utenti mantengono la piena proprietà e i diritti d'autore (copyright) su tutte le foto caricate. Caricando una foto, concedi a Photo Platform una licenza non esclusiva per visualizzarla all'interno del sito (es. nella Galleria o nel Profilo).
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-2">2. Regole di Condotta</h2>
            <p>È severamente vietato caricare:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-stone-300">
              <li>Materiale pornografico, violento o illegale.</li>
              <li>Foto di cui non possiedi i diritti o l'autorizzazione.</li>
              <li>Spam o contenuti pubblicitari non autorizzati.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-2">3. Responsabilità</h2>
            <p>
              Photo Platform non è responsabile per l'uso improprio delle immagini da parte di terzi. Sebbene implementiamo misure come il Watermark per proteggere le tue opere, la pubblicazione online comporta sempre dei rischi che l'utente accetta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-2">4. Sospensione dell'Account</h2>
            <p>
              L'amministrazione si riserva il diritto di sospendere o cancellare senza preavviso gli account che violano questi Termini, eliminando contestualmente tutti i contenuti caricati.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-500/30 text-center">
            <Link href="/login" className="text-amber-200 hover:text-white transition font-bold">
            ← Torna al Login
            </Link>
        </div>
      </div>
    </main>
  );
}