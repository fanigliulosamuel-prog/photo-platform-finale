"use client"

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // Import per logout
import { useRouter } from 'next/navigation'; // Import per redirect
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function ContractsPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [photographerName, setPhotographerName] = useState("");
  const [eventType, setEventType] = useState("Servizio Fotografico");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const printRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePrint = () => { window.print(); };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* SIDEBAR (Nascondi in stampa con print:hidden) */}
      <aside className={`print:hidden fixed md:relative w-64 bg-stone-700/40 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 h-full transition-transform duration-300 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">Photo Platform</h2>
          
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">✕</button>
          
          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏠 Dashboard</Link>
            
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏆 Sfide</Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>

            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
            <Link href="/upload" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
            {/* Link Attivo */}
            <Link href="/contracts" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>📄 Genera Contratti</Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔒 Area Clienti</Link>

            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>
            <Link href="/notifications" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔔 Notifiche</Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>⚙️ Impostazioni</Link>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-stone-500/30">
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">🚪 Esci</button>
          </div>
      </aside>
      
      {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      {/* --- CONTENUTO PRINCIPALE --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10 print:h-auto print:overflow-visible">
        
        {/* Intestazione Mobile */}
        <div className="flex items-center mb-6 md:hidden print:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button>
            <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Contratti</h1>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 print:block">
            
            {/* Form (Sinistra) */}
            <div className="w-full md:w-1/3 space-y-8 print:hidden">
              <div>
                <h1 className={`${playfair.className} text-4xl font-bold text-white mb-2 hidden md:block`}>Crea Contratto</h1>
                <p className="text-stone-200 text-sm hidden md:block">Genera automaticamente un contratto professionale.</p>
              </div>
              
              <div className="bg-stone-400/40 p-6 rounded-3xl border border-stone-300/50 backdrop-blur-xl space-y-4 shadow-xl">
                <div><label className="block text-xs font-bold text-stone-200 uppercase mb-2">Il tuo Nome</label><input type="text" value={photographerName} onChange={e => setPhotographerName(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none" placeholder="Es. Mario Rossi" /></div>
                <div><label className="block text-xs font-bold text-stone-200 uppercase mb-2">Nome Cliente</label><input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none" placeholder="Es. Azienda SPA" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-stone-200 uppercase mb-2">Data</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none" /></div>
                  <div><label className="block text-xs font-bold text-stone-200 uppercase mb-2">Servizio</label><input type="text" value={eventType} onChange={e => setEventType(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none" placeholder="Es. Matrimonio" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-stone-200 uppercase mb-2">Prezzo (€)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none" placeholder="1000" /></div>
                  <div><label className="block text-xs font-bold text-stone-200 uppercase mb-2">Acconto (€)</label><input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none" placeholder="300" /></div>
                </div>
              </div>
              <button onClick={handlePrint} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-lg transition transform hover:scale-[1.02]">🖨️ Stampa / Scarica PDF</button>
            </div>

            {/* Anteprima (Destra - Stampabile) */}
            <div className="flex-1 flex justify-center items-start print:w-full print:absolute print:top-0 print:left-0">
              <div ref={printRef} className="bg-white text-black p-12 md:p-16 rounded-sm shadow-2xl w-full max-w-[21cm] min-h-[29.7cm] relative print:shadow-none print:w-full">
                <div className="border-b-2 border-black pb-8 mb-8 flex justify-between items-end">
                  <div><h2 className={`${playfair.className} text-4xl font-bold`}>Contratto di Servizio</h2><p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">Fotografia Professionale</p></div>
                  <div className="text-right text-sm"><p>Data: {new Date().toLocaleDateString()}</p><p className="font-bold">Rif: {Math.floor(Math.random() * 10000)}</p></div>
                </div>
                <div className="space-y-6 text-sm md:text-base leading-relaxed">
                  <p>Il seguente accordo viene stipulato tra <strong>{photographerName || "[Nome Fotografo]"}</strong> e <strong>{clientName || "[Nome Cliente]"}</strong>.</p>
                  <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 my-6">
                    <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-gray-500">Dettagli</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-gray-600">Evento:</span> <span className="font-bold">{eventType}</span>
                      <span className="text-gray-600">Data:</span> <span className="font-bold">{date || "__/__/____"}</span>
                      <span className="text-gray-600">Totale:</span> <span className="font-bold">€ {price || "0,00"}</span>
                      <span className="text-gray-600">Acconto:</span> <span className="font-bold">€ {deposit || "0,00"}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mt-6">Termini</h3>
                  <p className="text-gray-700">Il Fotografo si impegna a realizzare il servizio per l'evento specificato. Il Cliente accetta i costi e le condizioni qui riportate.</p>
                </div>
                <div className="mt-20 grid grid-cols-2 gap-20">
                  <div className="border-t border-black pt-4"><p className="font-bold mb-10">{photographerName || "Firma Fotografo"}</p></div>
                  <div className="border-t border-black pt-4"><p className="font-bold mb-10">{clientName || "Firma Cliente"}</p></div>
                </div>
                <div className="absolute bottom-10 left-0 right-0 text-center text-xs text-gray-400">Documento generato via Photo Platform - {new Date().getFullYear()}</div>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}