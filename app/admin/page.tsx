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
    // CONTROLLO ACCESSO: Verifica solo se hai messo il codice segreto
    const adminToken = localStorage.getItem('is_super_admin');
    
    if (adminToken !== 'true') {
      router.push('/admin-login'); // Se non hai il pass, vai al login admin
    } else {
      setIsAuthorized(true);
      fetchData();
    }
  }, [router]);

  async function fetchData() {
    setLoading(true);
    const { data: usersData } = await supabase.from('profiles').select('*');
    if (usersData) setUsers(usersData);

    const { data: photosData } = await supabase.from('photos').select('*').order('created_at', { ascending: false });
    if (photosData) setPhotos(photosData);
    setLoading(false);
  }

  async function deletePhoto(id: number) {
      if(!confirm("Sei sicuro di voler eliminare questa foto?")) return;
      const { error } = await supabase.from('photos').delete().eq('id', id);
      if(error) alert("Errore DB: " + error.message);
      else {
          setPhotos(photos.filter(p => p.id !== id));
          alert("Foto rimossa.");
      }
  }

  async function banUser(id: string) {
      if(!confirm("ATTENZIONE: Stai per cancellare un utente e tutti i suoi dati.")) return;
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if(error) alert("Errore DB: " + error.message);
      else {
          setUsers(users.filter(u => u.id !== id));
          alert("Utente rimosso.");
      }
  }

  function logoutAdmin() {
      localStorage.removeItem('is_super_admin');
      router.push('/');
  }

  if (!isAuthorized) return <div className="min-h-screen bg-stone-600 text-white flex items-center justify-center">Verifica accesso...</div>;

  return (
    // SFONDO CALDO (Coerente con il resto del sito)
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white p-8 relative overflow-hidden">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali (Un tocco di rosso per ricordare che è Admin, ma su base calda) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className={`${playfair.className} text-4xl font-bold text-white`}>Pannello Admin</h1>
                <p className="text-stone-200 text-sm">Accesso Segreto Attivo</p>
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

        <div className="bg-stone-400/20 backdrop-blur-xl rounded-3xl p-6 border border-stone-300/30 shadow-2xl">
            {activeTab === 'photos' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="relative group aspect-square bg-stone-800 rounded-lg overflow-hidden border border-stone-500/30 shadow-md">
                            <img src={photo.url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/80 opacity-0 group-hover:opacity-100 transition p-2 text-center">
                                <p className="text-xs font-bold mb-2 line-clamp-1 text-white">{photo.title}</p>
                                <p className="text-[10px] text-stone-300 mb-2">di {photo.author_name}</p>
                                <button onClick={() => deletePhoto(photo.id)} className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-500 font-bold shadow-lg transform hover:scale-105 transition">ELIMINA</button>
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
                            <button onClick={() => banUser(user.id)} className="bg-red-600/20 text-red-300 border border-red-500/50 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition">BANNA</button>
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