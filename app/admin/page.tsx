"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

type User = {
  id: string;
  username: string;
  email: string;
}

type Photo = {
  id: number;
  title: string;
  url: string;
  author_name: string;
}

export default function AdminPage() {
  const router = useRouter();
  
  // STATI
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [secretInput, setSecretInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  
  // PASSWORD
  const ADMIN_SECRET = "admin2025"; 

  // DATI
  const [users, setUsers] = useState<User[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'photos'>('photos');

  useEffect(() => {
    // Controllo se hai già fatto login in questa sessione
    const adminToken = sessionStorage.getItem('is_super_admin');
    
    if (adminToken === 'true') {
      setIsAuthorized(true);
      fetchData();
    }
    setTimeout(() => setIsChecking(false), 500);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (secretInput === ADMIN_SECRET) {
          sessionStorage.setItem('is_super_admin', 'true');
          setIsAuthorized(true);
          fetchData();
      } else {
          setLoginError(true);
          setSecretInput("");
      }
  };

  async function fetchData() {
    // Carica utenti
    const { data: usersData } = await supabase.from('profiles').select('*');
    if (usersData) setUsers(usersData);

    // Carica foto
    const { data: photosData } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
    if (photosData) setPhotos(photosData);
  }

  // --- ELIMINAZIONE FOTO CON NOTIFICA ---
  async function deletePhoto(photo: Photo) {
      if(!confirm(`Sei sicuro di voler eliminare la foto "${photo.title}"?`)) return;

      try {
          // 1. Cerca l'autore per notificargli la rimozione
          const { data: author } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', photo.author_name)
            .single();

          if (author) {
             // Invia notifica di sistema
             // Nota: photo_id è null perché la foto viene cancellata
             await supabase.from('notifications').insert([{
                 user_id: author.id,
                 actor_name: "Admin",
                 type: "alert", 
                 message: `ha rimosso la tua foto "${photo.title}" per violazione delle linee guida.`,
                 is_read: false
             }]);
          }

          // 2. Cancella foto dal DB
          const { error } = await supabase.from('photos').delete().eq('id', photo.id);
          if (error) throw error;
          
          // 3. Cancella file fisico
          const fileName = photo.url.split('/').pop();
          if (fileName) await supabase.storage.from('uploads').remove([fileName]);
          
          // 4. Aggiorna UI
          setPhotos(photos.filter(p => p.id !== photo.id));
          alert("Foto rimossa e utente notificato.");

      } catch (error: any) {
          alert("Errore eliminazione: " + error.message);
      }
  }

  // --- ELIMINAZIONE UTENTE CON EMAIL SIMULATA ---
  async function deleteUser(user: User) {
      if(!confirm(`ATTENZIONE: Stai per eliminare l'utente ${user.username}. Procedere?`)) return;
      
      try {
          // 1. Simulazione invio Email
          // In un'app reale qui useresti un servizio come Resend o SendGrid
          alert(`📧 SISTEMA: Email di avviso inviata all'ID ${user.id}.\nOggetto: Cancellazione Account\nMessaggio: "Gentile utente, il tuo account è stato rimosso per violazione dei termini."`);

          // 2. Cancella profilo dal DB
          const { error } = await supabase.from('profiles').delete().eq('id', user.id);
          if (error) throw error;
          
          setUsers(users.filter(u => u.id !== user.id));
          alert("Utente eliminato dal database.");

      } catch (error: any) {
          alert("Errore eliminazione utente: " + error.message);
      }
  }

  function logoutAdmin() {
      sessionStorage.removeItem('is_super_admin');
      setIsAuthorized(false);
      setSecretInput("");
  }

  // --- LOADING ---
  if (isChecking) return <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">Caricamento...</div>;

  // --- VISTA 1: LOGIN ---
  if (!isAuthorized) return (
    <main className="min-h-screen bg-stone-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-stone-800 border border-red-900/50 p-8 rounded-2xl shadow-2xl text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Area Riservata</h1>
            <p className="text-stone-400 text-sm mb-6">Inserisci la password amministratore.</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
                <input 
                    type="password" 
                    placeholder="Codice Segreto" 
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    className="w-full bg-black/50 border border-stone-600 rounded-lg p-3 text-white focus:border-red-500 outline-none text-center tracking-widest transition"
                />
                
                {loginError && <p className="text-red-400 text-sm font-bold animate-pulse">⛔ Codice Errato.</p>}

                <button className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition transform hover:scale-[1.02]">
                    Accedi
                </button>
            </form>
            
            <Link href="/dashboard" className="block mt-8 text-stone-500 text-sm hover:text-white transition">
                ← Torna alla Dashboard
            </Link>
        </div>
    </main>
  );

  // --- VISTA 2: PANNELLO ---
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white p-8 relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className={`${playfair.className} text-4xl font-bold text-white`}>Pannello Admin</h1>
                <p className="text-stone-200 text-sm">Accesso Segreto Attivo</p>
            </div>
            <div className="flex gap-4">
                <Link href="/dashboard"><button className="px-6 py-2 bg-stone-100/10 hover:bg-stone-100/20 rounded-full transition text-sm text-white">Torna alla Dashboard</button></Link>
                <button onClick={logoutAdmin} className="px-6 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-full transition text-sm shadow-lg">Esci da Admin</button>
            </div>
        </div>

        <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('photos')} className={`px-6 py-2 rounded-xl font-bold transition shadow-md ${activeTab === 'photos' ? 'bg-red-700 text-white' : 'bg-stone-400/30 text-stone-100 hover:bg-stone-400/50'}`}>Foto ({photos.length})</button>
            <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl font-bold transition shadow-md ${activeTab === 'users' ? 'bg-red-700 text-white' : 'bg-stone-400/30 text-stone-100 hover:bg-stone-400/50'}`}>Utenti ({users.length})</button>
        </div>

        <div className="bg-stone-400/20 backdrop-blur-xl rounded-3xl p-6 border border-stone-300/30 shadow-2xl min-h-[400px]">
            {activeTab === 'photos' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="relative group aspect-square bg-stone-800 rounded-lg overflow-hidden border border-stone-500/30 shadow-md">
                            <img src={photo.url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/80 opacity-0 group-hover:opacity-100 transition p-2 text-center">
                                <p className="text-xs font-bold mb-2 line-clamp-1 text-white">{photo.title}</p>
                                <p className="text-[10px] text-stone-300 mb-2">di {photo.author_name}</p>
                                <button onClick={() => deletePhoto(photo)} className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-500 font-bold shadow-lg transform hover:scale-105 transition">ELIMINA</button>
                            </div>
                        </div>
                    ))}
                     {photos.length === 0 && <p className="col-span-full text-center text-stone-200 py-10">Nessuna foto nel database.</p>}
                </div>
            ) : (
                <div className="space-y-2">
                    {users.map(user => (
                        <div key={user.id} className="flex justify-between items-center bg-stone-600/30 p-4 rounded-xl border border-stone-500/30 hover:bg-stone-600/50 transition">
                            <div>
                                <p className="font-bold text-lg text-white">{user.username || "Senza Nome"}</p>
                                <p className="text-xs text-stone-300 font-mono">{user.id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Link al profilo utente */}
                                <Link href={`/profile/${user.username}`} target="_blank" className="text-xs bg-stone-500 hover:bg-stone-400 text-white px-3 py-2 rounded-lg font-bold transition">
                                    Vedi Profilo
                                </Link>
                                <button onClick={() => deleteUser(user)} className="bg-red-600/20 text-red-400 border border-red-600/50 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition">ELIMINA UTENTE</button>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && <p className="text-center text-stone-200 py-10">Nessun utente registrato.</p>}
                </div>
            )}
        </div>
      </div>
    </main>
  );
}