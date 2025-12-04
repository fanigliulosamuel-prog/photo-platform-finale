import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden">
      
      {/* --- TEXTURE SFONDO (Effetto Pellicola) --- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* --- LUCI AMBIENTALI --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- CONTENUTO (z-10 per stare sopra lo sfondo) --- */}
      <div className="flex w-full relative z-10 h-screen">
        
        {/* --- SIDEBAR (Menu Laterale) --- */}
        <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col p-6 h-full">
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">
            Photo Platform
          </h2>

          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            
            <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-white font-medium shadow-lg">
              🏠 Dashboard
            </Link>
            
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            
            <Link href="/explore" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              📷 Galleria Pubblica
            </Link>
            {/* LINK MAPPA COMMUNITY */}
            <Link href="/community" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              🌍 Mappa Community
            </Link>
            {/* LINK SFIDE DEL MESE */}
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              🏆 Sfide del Mese
            </Link>
            {/* LINK BLOG */}
            <Link href="/blog" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              📘 Blog Storie
            </Link>

            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>

            <Link href="/upload" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              📤 Carica Foto
            </Link>
            <Link href="/contracts" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              📄 Genera Contratti
            </Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              🔒 Area Clienti
            </Link>

            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>

            <Link href="/settings" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              ⚙️ Impostazioni
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <Link href="/" className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-lg transition">
              🚪 Esci
            </Link>
          </div>
        </aside>


        {/* --- AREA PRINCIPALE --- */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* Intestazione */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-1 text-white drop-shadow-md">Bentornato, Creativo</h1>
              <p className="text-indigo-200">Il tuo hub personale per gestire l'arte.</p>
            </div>
            
            {/* BOTTONE UPLOAD RAPIDO */}
            <Link href="/upload">
              <button className="bg-white text-indigo-950 px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                + Nuovo Progetto
              </button>
            </Link>
          </div>

          {/* Card Statistiche */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition hover:bg-white/10 group">
              <h3 className="text-indigo-200 text-sm mb-2 uppercase tracking-wider font-bold">Visualizzazioni</h3>
              <p className="text-4xl font-bold text-white group-hover:text-indigo-400 transition">12.4K</p>
              <p className="text-green-400 text-xs mt-2 bg-green-400/10 inline-block px-2 py-1 rounded">↑ +12% sett.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-purple-500/30 transition hover:bg-white/10 group">
              <h3 className="text-indigo-200 text-sm mb-2 uppercase tracking-wider font-bold">Apprezzamenti</h3>
              <p className="text-4xl font-bold text-white group-hover:text-purple-400 transition">843</p>
              <p className="text-green-400 text-xs mt-2 bg-green-400/10 inline-block px-2 py-1 rounded">↑ +5% sett.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-yellow-500/30 transition hover:bg-white/10 group">
              <h3 className="text-indigo-200 text-sm mb-2 uppercase tracking-wider font-bold">Guadagni</h3>
              <p className="text-4xl font-bold text-white group-hover:text-yellow-400 transition">€ 120,00</p>
              <p className="text-gray-400 text-xs mt-2">Nessuna vendita oggi</p>
            </div>

          </div>

          {/* Sezione Progetti Recenti */}
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            Caricamenti Recenti <span className="text-sm font-normal text-indigo-300 ml-2">(Ultimi 30 giorni)</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Shortcut Upload */}
            <Link href="/upload" className="aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-white hover:bg-white/10 transition cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition group-hover:bg-indigo-600 shadow-lg">
                  <span className="text-3xl">+</span>
                </div>
                <span className="font-medium tracking-wide">Carica Foto</span>
            </Link>

            {/* Finto Post 1 */}
            <div className="aspect-square bg-slate-800 rounded-3xl overflow-hidden relative group border border-white/5 shadow-xl">
              <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-10 backdrop-blur-sm">
                <span className="text-white font-bold border border-white/30 bg-white/10 px-6 py-2 rounded-full hover:bg-white hover:text-black transition cursor-pointer">Gestisci</span>
              </div>
              <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80" className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
            </div>

            {/* Finto Post 2 */}
            <div className="aspect-square bg-slate-800 rounded-3xl overflow-hidden relative group border border-white/5 shadow-xl">
              <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-10 backdrop-blur-sm">
                <span className="text-white font-bold border border-white/30 bg-white/10 px-6 py-2 rounded-full hover:bg-white hover:text-black transition cursor-pointer">Gestisci</span>
              </div>
              <img src="https://images.unsplash.com/photo-1470093851219-69951fcbb533?w=800&q=80" className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}