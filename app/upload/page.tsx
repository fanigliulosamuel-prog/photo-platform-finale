"use client"

import { useState, useEffect, ChangeEvent, FormEvent, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// LISTA CATEGORIE ESTESA
const CATEGORIES = [
  "Ritratti", "Paesaggi", "Street", "Architettura", "Natura",
  "Animali", "Viaggi", "Moda", "Food", "Sport", "Macro",
  "Bianco e Nero", "Eventi", "Astratto", "Sfida del Mese"
];

// 1. COMPONENTE INTERNO PER IL CONTENUTO
function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [category, setCategory] = useState('Ritratti');
  const [uploading, setUploading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Dati EXIF
  const [camera, setCamera] = useState('');
  const [shutterSpeed, setShutterSpeed] = useState('');
  const [iso, setIso] = useState('');
  const [aperture, setAperture] = useState('');

  // 1. Controlla se c'è una categoria nell'URL
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setCategory(decodeURIComponent(urlCategory));
    }
  }, [searchParams]);

  // 2. Caricamento Profilo Utente
  useEffect(() => {
    async function getUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();
          
          if (profile && profile.username) {
            setAuthor(profile.username);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Errore profilo:", error);
      } finally {
        setLoadingProfile(false);
      }
    }
    getUserProfile();
  }, [router]);

  // Gestione selezione file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !title || !author) return alert("Compila i campi principali!");
    if (!userId) return alert("Errore utente: Effettua nuovamente il login.");

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`; 
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Errore Storage: ${uploadError.message}`);

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);
      
      const publicUrl = data.publicUrl;

      let safeIso: number | null = null;
      if (iso && !isNaN(parseInt(iso, 10))) {
        safeIso = parseInt(iso, 10);
      }

      const { error: dbError } = await supabase
        .from('photos')
        .insert([
          {
            title: title,
            author_name: author,
            user_id: userId,
            category: category,
            url: publicUrl,
            camera_model: camera,
            shutter_speed: shutterSpeed,
            iso: safeIso, 
            aperture: aperture,
          }
        ]);

      if (dbError) throw new Error(`Errore Database: ${dbError.message}`);

      alert("Foto caricata con successo!");
      
      if (category === "Sfida del Mese") {
          router.push('/challenges');
      } else {
          router.push('/explore');
      }

    } catch (error: unknown) {
      console.error("Upload Failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
      alert("Errore durante il caricamento: " + errorMessage);
    } finally {
      setUploading(false);
    }
  }

  if (loadingProfile) {
    return <div className="min-h-screen bg-stone-600 flex items-center justify-center text-white">Caricamento profilo...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex w-full relative z-10 min-h-screen flex-col md:flex-row">

        {/* --- SIDEBAR --- */}
        <aside className={`fixed md:relative w-64 bg-stone-700/40 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 h-screen transition-transform duration-300 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">Photo Platform</h2>
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">✕</button>
            <nav className="flex flex-col gap-3 overflow-y-auto flex-1">
              <Link href="/dashboard" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏠 Dashboard</Link>
              <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
              <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
              <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
              <Link href="/challenges" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏆 Sfide</Link>
              <Link href="/blog" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>
              <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
              <Link href="/upload" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
              <Link href="/contracts" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📄 Genera Contratti</Link>
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

        {/* --- AREA PRINCIPALE (Modificata per scroll) --- */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10 flex flex-col items-center py-12">
            
            <div className="absolute top-4 left-4 md:hidden z-20">
                <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl">☰</button>
            </div>

            <div className="relative z-10 w-full max-w-2xl bg-stone-400/40 backdrop-blur-xl border border-stone-300/50 p-6 md:p-8 rounded-3xl shadow-2xl mt-8 md:mt-0 mb-8">
                <div className="flex justify-center items-center mb-4 text-center px-2">
                    <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md break-words leading-tight">
                        Carica il tuo Scatto
                    </h1>
                </div>
                <p className="text-stone-100 mb-8 text-sm text-center">Mostra il tuo talento alla community.</p>

                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Titolo Opera</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none placeholder-stone-300" placeholder="Titolo" required/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Nome Fotografo</label>
                            <input type="text" value={author} disabled className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-3 text-stone-300 cursor-not-allowed"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Categoria</label>
                            <div className="relative">
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none appearance-none cursor-pointer">
                                    {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-stone-800">{cat}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-200">▼</div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-stone-400/30">
                        <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider mb-4">Dati Tecnici (EXIF)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs text-stone-300 mb-1">Camera</label>
                                <input type="text" value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none" placeholder="Es. Canon R6"/>
                            </div>
                            <div>
                                <label className="block text-xs text-stone-300 mb-1">Tempo</label>
                                <input type="text" value={shutterSpeed} onChange={(e) => setShutterSpeed(e.target.value)} className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none" placeholder="Es. 1/125s"/>
                            </div>
                            <div>
                                <label className="block text-xs text-stone-300 mb-1">ISO</label>
                                <input type="number" value={iso} onChange={(e) => setIso(e.target.value)} className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none" placeholder="Es. 400"/>
                            </div>
                            <div>
                                <label className="block text-xs text-stone-300 mb-1">Apertura</label>
                                <input type="text" value={aperture} onChange={(e) => setAperture(e.target.value)} className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none" placeholder="Es. f/4.0"/>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-stone-400/50 rounded-2xl p-8 text-center hover:border-amber-400/50 hover:bg-stone-400/20 transition cursor-pointer relative group mt-6">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                        <div className="relative z-10">
                            {file ? <p className="text-amber-300 font-bold text-lg mb-1">✅ {file.name}</p> : (
                                <>
                                    <p className="text-4xl mb-3">📤</p>
                                    <p className="text-stone-200 font-medium">Clicca o trascina qui</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button disabled={uploading} className="w-full py-4 bg-stone-100 text-stone-900 font-bold rounded-xl hover:scale-[1.02] hover:shadow-lg transition transform disabled:opacity-50 mt-6">
                        {uploading ? "Caricamento..." : "Pubblica Foto 🚀"}
                    </button>
                </form>
            </div>
        </main>
      </div>
    </div>
  );
}

// 2. COMPONENTE PRINCIPALE (WRAPPER PER SUSPENSE)
export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">Inizializzazione caricamento...</div>}>
      <UploadContent />
    </Suspense>
  );
}