import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden p-8">
      
      {/* Sfondo Texture */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
        
        <h1 className="text-4xl font-bold mb-4 text-white">Termini e Condizioni d'Uso</h1>
        <p className="text-gray-400 mb-8">Accettazione obbligatoria per l'uso del Servizio.</p>

        <div className="text-gray-300 space-y-6">
          
          <h2 className="text-2xl font-bold pt-4 text-white">1. Account Utente</h2>
          <p>
            Devi avere almeno 18 anni per utilizzare il Servizio. Sei responsabile del mantenimento della sicurezza della tua password. Photo Platform non sarà responsabile per eventuali perdite o danni derivanti dal mancato mantenimento della sicurezza del tuo account e della password.
          </p>
          
          <h2 className="text-2xl font-bold pt-4 text-white">2. Contenuti Caricati (UGC)</h2>
          <p>
            **Diritti:** Mantenete tutti i diritti sui contenuti che caricate sul Servizio (le vostre foto).
          </p>
          <p>
            **Licenza:** Caricando le foto, concedete a Photo Platform una licenza non esclusiva e royalty-free per visualizzare, distribuire e riprodurre i Contenuti unicamente per la promozione del Servizio stesso (es. miniature in Galleria).
          </p>
          <p>
            **Garanzia:** Garantite di essere i proprietari dei diritti d'autore o di avere l'autorizzazione per utilizzare il materiale che caricate. È vietato caricare materiale illegale, offensivo o protetto da copyright altrui.
          </p>

          <h2 className="text-2xl font-bold pt-4 text-white">3. Risoluzione</h2>
          <p>
            Photo Platform ha il diritto di sospendere o cancellare il tuo account immediatamente, senza preavviso, in caso di violazione dei Termini.
          </p>
        </div>

        <Link href="/" className="mt-10 block text-indigo-300 hover:text-white transition">
          ← Torna alla Home
        </Link>
      </div>
    </main>
  );
}