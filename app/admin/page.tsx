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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'photos'>('photos');

  useEffect(() => {
    // CONTROLLO ACCESSO BASATO SUL CODICE SEGRETO (localStorage)
    // Non dipende dal database, quindi è infallibile se hai fatto il login admin.
    const adminToken = localStorage.getItem('is_super_admin');
    
    if (adminToken !== 'true') {
      // Se non hai il pass, prova a reindirizzare
      router.push('/admin-login'); 
    } else {
      // Se hai il pass, entra subito
      setIsAuthorized(true);
      fetchData();
    }
  }, [router]);

  async function fetchData() {
    setLoading(true);
    // Recupera profili
    const { data: usersData } = await supabase.from('profiles').select('*');
    if (usersData) setUsers(usersData);

    // Recupera foto
    const { data: photosData } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
    if (photosData) setPhotos(photosData);
    setLoading(false);
  }

  async function deletePhoto(photo: Photo) {
      if(!confirm(`Eliminare la foto "${photo.title}"?`)) return;
      
      // Rimuove visivamente subito
      setPhotos(photos.filter(p => p.id !== photo.id));

      try {
          // 1. Cancella dal DB (tabella foto)
          const { error } = await supabase.from('photos').delete().eq('id', photo.id);
          if (error) throw error;
          
          // 2. Cancella file dallo Storage
          const fileName = photo.url.split('/').pop();
          if (fileName) {
              await supabase.storage.from('uploads').remove([fileName]);
          }

          // 3. Notifica l'utente (opzionale, se fallisce non importa)
          const { data: author } = await supabase.from('profiles').select('id').eq('username', photo.author_name).single();
          if (author) {
             await supabase.from('notifications').insert([{
                 user_id: author.id,
                 actor_name: "Admin",
                 type: "alert",
                 message: `ha rimosso la tua foto "${photo.title}".`,
                 is_read: false
             }]);
          }
          alert("Foto rimossa correttamente.");

      } catch (error: any) {
          alert("Errore eliminazione: " + error.message);
          // Ricarica i dati reali in caso di errore
          fetchData();
      }
  }

  async function deleteUser(user: User) {
      if(!confirm(`ATTENZIONE: Eliminare l'utente ${user.username}?`)) return;
      
      try {
          // Cancella profilo (a cascata dovrebbe cancellare auth se configurato, o viceversa)
          // Nota: Cancellare da 'profiles' non cancella da 'auth.users' se non hai messo il trigger, 
          // ma rimuove l'utente dal sito visibile.
          const { error } = await supabase.from('profiles').delete().eq('id', user.id);
          
          if(error) throw error;

          setUsers(users.filter(u => u.id !== user.id));
          alert("Utente rimosso.");
      } catch (error: any) {
          alert("Errore eliminazione utente: " + error.message);
      }
  }

  function logoutAdmin() {
      localStorage.removeItem('is_super_admin');
      router.push('/');
  }

  // SCHERMATA DI BLOCCO / CARICAMENTO
  if (!isAuthorized) return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center gap-6 p-4 text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-2xl font-bold">Verifica permessi in corso...</h2>
        <p className="text-stone-400 max-w-md">Se questa schermata rimane bloccata, significa che non hai effettuato l'accesso all'area riservata.</p>
        
        {/* BOTTONE DI EMERGENZA SE IL REDIRECT SI BLOCCA */}
        <Link href="/admin-login">
            <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg">
                Vai al Login Admin 🔐
            </button>
        </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white p-8 relative overflow-hidden">
      
      {/* Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className={`${playfair.className} text-4xl font-bold text-white`}>Pannello Admin</h1>
                <p className="text-stone-200 text-sm">Gestione Totale Piattaforma</p>
            </div>
            <div className="flex gap-4">
                <Link href="/dashboard">
                    <button className="px-6 py-2 bg-stone-100/10 hover:bg-stone-100/20 rounded-full transition text-sm text-white">
                        Torna alla Dashboard
                    </button>
                </Link>
                <button onClick={logoutAdmin} className="px-6 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-full transition text-sm shadow-lg">
                    Esci da Admin
                </button>
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
                            <button onClick={() => deleteUser(user)} className="bg-red-600/20 text-red-400 border border-red-600/50 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition">ELIMINA UTENTE</button>
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