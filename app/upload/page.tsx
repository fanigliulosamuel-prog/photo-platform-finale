"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// LISTA CATEGORIE ESTESA
const CATEGORIES = [
  "Ritratti", "Paesaggi", "Street", "Architettura", "Natura",
  "Animali", "Viaggi", "Moda", "Food", "Sport", "Macro",
  "Bianco e Nero", "Eventi", "Astratto"
];

export default function UploadPage() {
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(''); // Sarà riempito in automatico
  const [category, setCategory] = useState('Ritratti');
  const [uploading, setUploading] = useState(false);

  // Dati EXIF
  const [camera, setCamera] = useState('');
  const [shutterSpeed, setShutterSpeed] = useState('');
  const [iso, setIso] = useState('');
  const [aperture, setAperture] = useState('');

  // CARICAMENTO UTENTE
  useEffect(() => {
    async function getUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Preleva lo username reale dal profilo
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
      
      const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('photos').insert([{
          title: title,
          author_name: author, // Usa lo username corretto
          category: category,
          url: publicUrl,
          camera_model: camera,
          shutter_speed: shutterSpeed,
          iso: iso ? parseInt(iso) : null, 
          aperture: aperture,
      }]);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-2 text-center text-white drop-shadow-md">Carica il tuo Scatto</h1>
        <p className="text-indigo-200 text-center mb-8 text-sm">Mostra il tuo talento alla community.</p>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Titolo Opera</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="Titolo" required/>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Nome Fotografo</label>
              {/* Campo Disabilitato e Auto-compilato */}
              <input type="text" value={author} disabled className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-gray-400 cursor-not-allowed" title="Modifica il tuo nome nelle Impostazioni"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Categoria</label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer">
                    {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
              </div>
            </div>
          </div>
          
          {/* EXIF e File Upload invariati... */}
          <div className="pt-4 border-t border-white/10">
             {/* ... (Dati tecnici uguali a prima) ... */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="block text-xs text-gray-400 mb-1">Camera</label><input type="text" value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"/></div>
              <div><label className="block text-xs text-gray-400 mb-1">Tempo</label><input type="text" value={shutterSpeed} onChange={(e) => setShutterSpeed(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"/></div>
              <div><label className="block text-xs text-gray-400 mb-1">ISO</label><input type="number" value={iso} onChange={(e) => setIso(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"/></div>
              <div><label className="block text-xs text-gray-400 mb-1">Apertura</label><input type="text" value={aperture} onChange={(e) => setAperture(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"/></div>
            </div>
          </div>

          <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-purple-500/50 hover:bg-white/5 transition cursor-pointer relative group mt-6">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            <div className="relative z-10">
                {file ? <p className="text-purple-400 font-bold text-lg mb-1">✅ {file.name}</p> : <><p className="text-4xl mb-3">📤</p><p className="text-gray-300">Clicca o trascina qui</p></>}
            </div>
          </div>

          <button disabled={uploading} className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition transform disabled:opacity-50 mt-6">
            {uploading ? "Caricamento..." : "Pubblica Foto 🚀"}
          </button>
        </form>
      </div>
    </main>
  );
}