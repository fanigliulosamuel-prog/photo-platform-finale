"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Dati del form
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // 1. Carica i dati esistenti appena apri la pagina
  useEffect(() => {
    async function getProfile() {
      // Chi è loggato?
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login'); // Se non sei loggato, via!
        return;
      }
      setUser(user);

      // Prendi i dati dalla tabella profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setUsername(data.username || "");
        setBio(data.bio || "");
        setCity(data.city || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    }

    getProfile();
  }, [router]);

  // 2. Funzione per caricare la foto profilo
  async function uploadAvatar(event: any) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Seleziona un file!');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Carica su Storage
      const { error: uploadError } = await supabase.storage
        .from('uploads') // Usiamo lo stesso bucket 'uploads'
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ottieni URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl); // Aggiorna l'anteprima
    } catch (error: any) {
      alert('Errore upload immagine: ' + error.message);
      console.log(error);
    } finally {
      setUploading(false);
    }
  }

  // 3. Salva tutto nel database
  async function updateProfile() {
    try {
      setLoading(true);
      const updates = {
        id: user.id, // Importante: l'ID deve coincidere con l'utente loggato
        username,
        bio,
        city,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      alert("Profilo aggiornato con successo!");
    } catch (error: any) {
      alert("Errore nel salvataggio: " + error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-stone-600 flex items-center justify-center text-white">Caricamento...</div>;

  return (
    // SFONDO CALDO (Stone 500/600)
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl bg-stone-400/40 backdrop-blur-xl border border-stone-300/50 p-8 rounded-3xl shadow-2xl">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Modifica Profilo</h1>
            <Link href="/dashboard" className="text-sm text-stone-200 hover:text-white transition flex items-center gap-2">
                ← Torna alla Dashboard
            </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* COLONNA SINISTRA: AVATAR */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-stone-300/50 shadow-lg relative group bg-stone-600">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">👤</div>
              )}
              
              {/* Overlay per upload */}
              <label className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                <span className="text-xs font-bold text-white">CAMBIA</span>
                <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs text-amber-200 animate-pulse">Caricamento...</p>}
          </div>

          {/* COLONNA DESTRA: DATI */}
          <div className="flex-1 space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-stone-200 uppercase mb-2">Nome d'Arte / Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none placeholder-stone-300"
                placeholder="Come vuoi farti chiamare?"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-200 uppercase mb-2">Città</label>
              <input 
                type="text" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none placeholder-stone-300"
                placeholder="Roma, Milano..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-200 uppercase mb-2">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none h-32 resize-none placeholder-stone-300"
                placeholder="Raccontaci qualcosa di te..."
              />
            </div>

            <button 
              onClick={updateProfile}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02]"
            >
              Salva Modifiche
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}