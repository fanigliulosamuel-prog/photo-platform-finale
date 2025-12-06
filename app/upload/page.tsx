"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// LISTA CATEGORIE ESTESA (Deve corrispondere a quella di explore.page.tsx)
const CATEGORIES = [
  "Ritratti",
  "Paesaggi",
  "Street",
  "Architettura",
  "Natura",
  "Animali",
  "Viaggi",
  "Moda",
  "Food",
  "Sport",
  "Macro",
  "Bianco e Nero",
  "Eventi",
  "Astratto"
];

export default function UploadPage() {
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Ritratti');
  const [uploading, setUploading] = useState(false);

  // Dati EXIF
  const [camera, setCamera] = useState('');
  const [shutterSpeed, setShutterSpeed] = useState('');
  const [iso, setIso] = useState('');
  const [aperture, setAperture] = useState('');

  // Caricamento Utente
  useEffect(() => {
    async function getUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
    }
    getUserProfile();
  }, [router]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title || !author) return alert("Compila i campi principali!");

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`; 
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('photos')
        .insert([
          {
            title: title,
            author_name: author,
            category: category,
            url: publicUrl,
            camera_model: camera,
            shutter_speed: shutterSpeed,
            iso: iso ? parseInt(iso) : null, 
            aperture: aperture,
          }
        ]);

      if (dbError) throw dbError;

      alert("Foto caricata con successo!");
      router.push('/explore');

    } catch (error) {
      console.error("Upload Failed:", error);
      alert("Errore durante il caricamento.");
    } finally {
      setUploading(false);
    }
  }

  return (
    // SFONDO CALDO (Stone 500/600)
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-2xl bg-stone-400/40 backdrop-blur-xl border border-stone-300/50 p-8 rounded-3xl shadow-2xl">
        
        <h1 className="text-4xl font-bold mb-2 text-center text-white drop-shadow-md">
          Carica il tuo Scatto
        </h1>
        <p className="text-stone-100 text-center mb-8 text-sm">Mostra il tuo talento alla community.</p>

        <form onSubmit={handleUpload} className="space-y-6">
          
          {/* Sezione Dati Principali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Titolo Opera</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none placeholder-stone-300" placeholder="Titolo" required/>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Nome Fotografo</label>
              <input type="text" value={author} disabled className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-3 text-stone-300 cursor-not-allowed"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider mb-2">Categoria</label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none appearance-none cursor-pointer">
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-stone-800">{cat}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-200">▼</div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-stone-400/30">
            <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider mb-4">Dati Tecnici (EXIF)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="block text-xs text-stone-300 mb-1">Camera</label><input type="text" value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none" placeholder="Es. Canon R6"/></div>
              <div><label className="block text-xs text-stone-300 mb-1">Tempo</label><input type="text" value={shutterSpeed} onChange={(e) => setShutterSpeed(e.target.value)} className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none" placeholder="Es. 1/125s"/></div>
              <div><label className="block text-xs text-stone-300 mb-1">ISO</label><input type="number" value={iso} onChange={(e) => setIso(e.target.value)} className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none" placeholder="Es. 400"/></div>
              <div><label className="block text-xs text-stone-300 mb-1">Apertura</label><input type="text" value={aperture} onChange={(e) => setAperture(e.target.value)} className="w-full bg-stone-500/40 border border-stone-400/50 rounded-xl p-3 text-white focus:border-amber-400/50 outline-none" placeholder="Es. f/4.0"/></div>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-stone-400/50 rounded-2xl p-8 text-center hover:border-amber-400/50 hover:bg-stone-400/20 transition cursor-pointer relative group mt-6">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
            />
            <div className="relative z-10">
                {file ? (
                  <><p className="text-amber-300 font-bold text-lg mb-1">✅ {file.name}</p></>
                ) : (
                  <><p className="text-4xl mb-3 group-hover:scale-110 transition duration-300">📤</p><p className="text-stone-200 font-medium">Clicca o trascina qui</p></>
                )}
            </div>
          </div>

          {/* Bottone */}
          <button 
            disabled={uploading}
            className="w-full py-4 bg-stone-100 text-stone-900 font-bold rounded-xl hover:scale-[1.02] hover:shadow-lg transition transform disabled:opacity-50 mt-6"
          >
            {uploading ? "Caricamento..." : "Pubblica Foto 🚀"}
          </button>

        </form>
      </div>
    </main>
  );
}