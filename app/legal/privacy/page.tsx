import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden p-8">
      
      {/* Sfondo Texture */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto bg-stone-400/40 border border-stone-300/50 p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
        
        <h1 className="text-4xl font-bold mb-4 text-white">Informativa sulla Privacy</h1>
        <p className="text-stone-200 mb-8 text-sm">Ultimo aggiornamento: Dicembre 2025</p>

        <div className="text-stone-100 space-y-6 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-2">1. Titolare del Trattamento</h2>
            <p>
              Il Titolare del Trattamento dei dati è <strong>Photo Platform</strong>. Questa applicazione è un progetto dimostrativo/educativo. Nessun dato reale viene venduto a terzi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-2">2. Dati Raccolti</h2>
            <p>Per fornire il servizio, raccogliamo i seguenti dati:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-stone-300">
              <li><strong>Dati di Account:</strong> Username, Email e Password (crittografata).</li>
              <li><strong>Contenuti:</strong> Le fotografie caricate, i metadati (EXIF) e i testi associati (titoli, commenti).</li>
              <li><strong>Dati Tecnici:</strong> Indirizzi IP e log di sistema necessari per la sicurezza (gestiti da Supabase e Vercel).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-2">3. Finalità del Trattamento</h2>
            <p>
              I dati sono utilizzati esclusivamente per:
              <br/>- Permettere l'accesso all'area riservata.
              <br/>- Mostrare il tuo portfolio agli altri utenti.
              <br/>- Gestire le funzionalità sociali (like, commenti, follow).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-amber-200 mb-2">4. Conservazione dei Dati</h2>
            <p>
              I tuoi dati sono ospitati sui server sicuri di <strong>Supabase</strong> (Database) e <strong>Vercel</strong> (Hosting). Puoi richiedere la cancellazione completa del tuo account e di tutti i dati associati in qualsiasi momento tramite il pannello Impostazioni o contattando l'amministratore.
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