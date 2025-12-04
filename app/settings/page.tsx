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

  // Carica dati
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login'); 
        return;
      }
      setUser(user);

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

  // Upload Foto
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

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert('Errore upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // Salva Profilo
  async function updateProfile() {
    try {
      setLoading(true);
      const updates = {
        id: user.id,
        username,
        bio,
        city,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      // Usa upsert con onConflict per evitare errori di duplicati
      const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      alert("Profilo aggiornato con successo!");
    } catch (error: any) {
      // QUI VEDREMO L'ERRORE VERO
      alert("Errore nel salvataggio: " + error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Caricamento...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Modifica Profilo</h1>
            <Link href="/dashboard" className="text-sm text-indigo-300 hover:text-white transition">Torna alla Dashboard</Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-lg relative group bg-black/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
              )}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                <span className="text-xs font-bold">CAMBIA</span>
                <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs text-indigo-300 animate-pulse">Caricamento...</p>}
          </div>

          {/* Dati */}
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Nome d'Arte</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="Nome" />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Città</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" placeholder="Città" />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-32 resize-none" placeholder="Bio..." />
            </div>

            <button onClick={updateProfile} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02]">
              Salva Modifiche
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
