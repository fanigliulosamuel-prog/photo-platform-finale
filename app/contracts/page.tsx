"use client"

import { useState, useRef } from 'react';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function ContractsPage() {
  
  // Dati del contratto
  const [clientName, setClientName] = useState("");
  const [photographerName, setPhotographerName] = useState("");
  const [eventType, setEventType] = useState("Servizio Fotografico");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");

  const printRef = useRef(null);

  // Funzione per stampare/salvare PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden">
      
      {/* Sfondo Aurora */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 print:p-0 print:block">
        
        {/* --- COLONNA SINISTRA: INPUT (Non visibile in stampa) --- */}
        <div className="w-full md:w-1/3 space-y-8 print:hidden">
          
          <div>
            <Link href="/dashboard" className="text-indigo-300 hover:text-white flex items-center gap-2 mb-6 transition">
              ← Torna alla Dashboard
            </Link>
            <h1 className={`${playfair.className} text-4xl font-bold text-white mb-2`}>
              Crea Contratto
            </h1>
            <p className="text-gray-400 text-sm">
              Compila i campi per generare automaticamente un contratto professionale pronto per la firma.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
            
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Il tuo Nome</label>
              <input type="text" value={photographerName} onChange={e => setPhotographerName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="Es. Mario Rossi" />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Nome Cliente</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="Es. Azienda SPA" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Data Evento</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Tipo Servizio</label>
                <input type="text" value={eventType} onChange={e => setEventType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="Es. Matrimonio" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Prezzo Totale (€)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="1000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Acconto (€)</label>
                <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="300" />
              </div>
            </div>

          </div>

          <button onClick={handlePrint} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition transform hover:scale-[1.02]">
            🖨️ Stampa / Scarica PDF
          </button>

        </div>

        {/* --- COLONNA DESTRA: ANTEPRIMA CARTA (Visibile in stampa) --- */}
        <div className="flex-1 flex justify-center items-start print:w-full print:absolute print:top-0 print:left-0">
          
          <div ref={printRef} className="bg-white text-black p-12 md:p-16 rounded-sm shadow-2xl w-full max-w-[21cm] min-h-[29.7cm] relative print:shadow-none print:w-full">
            
            {/* Intestazione Contratto */}
            <div className="border-b-2 border-black pb-8 mb-8 flex justify-between items-end">
              <div>
                <h2 className={`${playfair.className} text-4xl font-bold`}>Contratto di Servizio</h2>
                <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">Fotografia Professionale</p>
              </div>
              <div className="text-right text-sm">
                <p>Data: {new Date().toLocaleDateString()}</p>
                <p className="font-bold">Rif: {Math.floor(Math.random() * 10000)}</p>
              </div>
            </div>

            {/* Corpo */}
            <div className="space-y-6 text-sm md:text-base leading-relaxed">
              <p>
                Il seguente accordo viene stipulato tra <strong>{photographerName || "[Nome Fotografo]"}</strong> (di seguito "Il Fotografo") 
                e <strong>{clientName || "[Nome Cliente]"}</strong> (di seguito "Il Cliente").
              </p>

              <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 my-6">
                <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-gray-500">Dettagli del Servizio</h3>
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-gray-600">Evento:</span> <span className="font-bold">{eventType}</span>
                  <span className="text-gray-600">Data:</span> <span className="font-bold">{date || "__/__/____"}</span>
                  <span className="text-gray-600">Compenso Totale:</span> <span className="font-bold">€ {price || "0,00"}</span>
                  <span className="text-gray-600">Acconto Richiesto:</span> <span className="font-bold">€ {deposit || "0,00"}</span>
                </div>
              </div>

              <h3 className="font-bold text-lg mt-6">1. Oggetto del Servizio</h3>
              <p className="text-gray-700">
                Il Fotografo si impegna a realizzare il servizio fotografico per l'evento specificato, fornendo le immagini finali in formato digitale ad alta risoluzione entro 30 giorni lavorativi.
              </p>

              <h3 className="font-bold text-lg">2. Diritti d'Autore</h3>
              <p className="text-gray-700">
                Il Fotografo mantiene la proprietà intellettuale delle immagini. Al Cliente viene concessa una licenza d'uso personale e non commerciale, salvo diversi accordi scritti.
              </p>

              <h3 className="font-bold text-lg">3. Termini di Pagamento</h3>
              <p className="text-gray-700">
                L'acconto di € {deposit || "0,00"} è dovuto alla firma per bloccare la data. Il saldo di € {(Number(price) - Number(deposit)) || "0,00"} dovrà essere versato il giorno dell'evento.
              </p>
            </div>

            {/* Firme */}
            <div className="mt-20 grid grid-cols-2 gap-20">
              <div className="border-t border-black pt-4">
                <p className="font-bold mb-10">{photographerName || "Il Fotografo"}</p>
                <p className="text-xs text-gray-400">Firma</p>
              </div>
              <div className="border-t border-black pt-4">
                <p className="font-bold mb-10">{clientName || "Il Cliente"}</p>
                <p className="text-xs text-gray-400">Firma</p>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-10 left-0 right-0 text-center text-xs text-gray-400">
              Documento generato via Photo Platform - {new Date().getFullYear()}
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
