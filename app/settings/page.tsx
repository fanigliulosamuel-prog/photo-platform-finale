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

  // Dati Profilo
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); 

  // Dati Sicurezza
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setNewEmail(user.email || ""); 

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
        if (data.is_admin) setIsAdmin(true); 
      }
      setLoading(false);
    }
    getProfile();
  }, [router]);

  // Upload Avatar
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

      const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert('Errore upload immagine: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // Salva Profilo (Info Pubbliche) con Controllo Unicità
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

      const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });
      
      if (error) throw error;
      
      alert("Profilo aggiornato con successo!");
    } catch (error: any) {
      if (error.code === '23505') {
          alert("⚠️ Questo username è già in uso. Per favore scegline un altro.");
      } else {
          alert("Errore nel salvataggio: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Cambia Password
  async function updatePassword() {
    if (!newPassword) return alert("Inserisci una nuova password.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Errore cambio password: " + error.message);
    else {
        alert("Password aggiornata! Effettua nuovamente il login.");
        await supabase.auth.signOut();
        router.push('/login');
    }
  }

  // Cambia Email
  async function updateEmail() {
    if (!newEmail || newEmail === user.email) return alert("Inserisci una nuova email diversa dalla precedente.");
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) alert("Errore cambio email: " + error.message);
    else alert("Controlla la TUA NUOVA e la TUA VECCHIA casella di posta per confermare il cambio indirizzo.");
  }

  if (loading) return <div className="min-h-screen bg-stone-600 flex items-center justify-center text-white">Caricamento...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-y-auto p-4 md:p-8">
      
      <div className="fixed inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Impostazioni Account</h1>
            <div className="flex gap-4 items-center">
                {isAdmin && (
                    <Link href="/admin">
                        <button className="text-sm bg-red-600 hover:bg-red-500 px-4 py-2 rounded-full text-white font-bold transition shadow-lg flex items-center gap-2">
                            ⚠️ Pannello Admin
                        </button>
                    </Link>
                )}
                <Link href="/dashboard" className="text-sm text-stone-200 hover:text-white transition flex items-center gap-2">← Dashboard</Link>
            </div>
        </div>

        {/* --- SEZIONE 1: PROFILO PUBBLICO --- */}
        <div className="bg-stone-400/40 backdrop-blur-xl border border-stone-300/50 p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold text-amber-100 mb-6 border-b border-stone-500/30 pb-2">Profilo Pubblico</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-stone-300/50 shadow-lg relative group bg-stone-600">
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">👤</div>}
                    <label className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition"><span className="text-xs font-bold text-white">CAMBIA</span><input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} /></label>
                    </div>
                    {uploading && <p className="text-xs text-amber-200 animate-pulse">Caricamento...</p>}
                </div>

                <div className="flex-1 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-200 uppercase mb-2">Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none"
                        />
                        <p className="text-[10px] text-stone-300 mt-1">Deve essere unico.</p>
                    </div>
                    <div><label className="block text-xs font-bold text-stone-200 uppercase mb-2">Città</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none"/></div>
                    <div><label className="block text-xs font-bold text-stone-200 uppercase mb-2">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none h-24 resize-none"/></div>
                    <button onClick={updateProfile} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition">Salva Profilo</button>
                </div>
            </div>
        </div>

        {/* --- SEZIONE 2: SICUREZZA --- */}
        <div className="bg-stone-400/20 backdrop-blur-md border border-stone-300/30 p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold text-amber-100 mb-6 border-b border-stone-500/30 pb-2">Sicurezza & Accesso</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cambio Email */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-stone-300 uppercase">Cambia Email</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-stone-600/30 border border-stone-500/30 rounded-xl p-3 text-white focus:border-amber-400 outline-none" />
                    <button onClick={updateEmail} className="w-full py-2 border border-stone-400 text-stone-200 font-bold rounded-xl hover:bg-stone-500/30 transition text-sm">Aggiorna Email</button>
                </div>

                {/* Cambio Password */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-stone-300 uppercase">Nuova Password</label>
                    <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-stone-600/30 border border-stone-500/30 rounded-xl p-3 text-white focus:border-amber-400 outline-none" />
                    <button onClick={updatePassword} className="w-full py-2 border border-stone-400 text-stone-200 font-bold rounded-xl hover:bg-stone-500/30 transition text-sm">Aggiorna Password</button>
                </div>
            </div>
        </div>

      </div>
    </main>
  );
}