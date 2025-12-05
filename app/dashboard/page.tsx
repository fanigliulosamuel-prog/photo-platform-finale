"use client" // Rende la pagina interattiva

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Profile = {
  username: string;
  avatar_url: string;
  city: string;
};

type Photo = {
  id: number;
  url: string;
  likes: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  
  const totalLikes = userPhotos.reduce((acc, photo) => acc + (photo.likes || 0), 0);
  const totalPhotos = userPhotos.length;
  
  const [isAuthReady, setIsAuthReady] = useState(false); 

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData as Profile);
        
        const { data: photosData } = await supabase
          .from('photos')
          .select('id, url, likes')
          .eq('author_name', profileData.username)
          .order('created_at', { ascending: false });

        setUserPhotos(photosData || []);
      }
      
      setLoading(false);
      setIsAuthReady(true);
    }

    fetchUserData();
  }, [router]);
  
  async function handleDeletePhoto(photoId: number, photoUrl: string) {
    if (!confirm('Sei sicuro di voler eliminare questo scatto? L\'azione è irreversibile.')) {
      return;
    }

    const originalPhotos = [...userPhotos];
    setUserPhotos(userPhotos.filter(p => p.id !== photoId));

    try {
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;
      
      const fileName = photoUrl.split('/').pop();
      if (fileName) {
         const { error: storageError } = await supabase.storage.from('uploads').remove([fileName]);
         if (storageError) console.warn("Errore cancellazione file fisico:", storageError);
      }

      alert("Foto eliminata con successo!");

    } catch (error) {
      setUserPhotos(originalPhotos);
      alert("Errore nell'eliminazione. Riprova.");
      console.error(error);
    }
  }


  if (loading && !isAuthReady) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Caricamento Dashboard...</div>;
  
  if (!profile) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <p>Profilo incompleto.</p>
        <Link href="/settings" className="bg-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-500 transition">Vai alle Impostazioni</Link>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex w-full relative z-10 h-screen">
        
        {/* SIDEBAR */}
        <aside className={`fixed md:relative w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 h-full transition-transform duration-300 z-50
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">
            Photo Platform
          </h2>
          
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white text-xl">
            ✕
          </button>

          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>
              🏠 Dashboard
            </Link>
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              📷 Galleria Pubblica
            </Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              🌍 Mappa Community
            </Link>
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              🏆 Sfide del Mese
            </Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              📘 Blog Storie
            </Link>
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
            <Link href="/upload" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              📤 Carica Foto
            </Link>
            <Link href="/contracts" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              📄 Genera Contratti
            </Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              🔒 Area Clienti
            </Link>
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>
            <Link href="/settings" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              ⚙️ Impostazioni
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-lg transition w-full text-left">
              🚪 Esci
            </button>
          </div>
        </aside>
        
        {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

        {/* AREA PRINCIPALE */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          
          <div className="flex justify-between items-center mb-10">
            <button onClick={() => setIsMenuOpen(true)} className="text-white md:hidden text-3xl mr-4">
              ☰
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-white drop-shadow-md">Bentornato, {profile.username}</h1>
              <p className="text-indigo-200">Il tuo hub personale per gestire l'arte.</p>
            </div>
            <Link href="/upload" className="hidden sm:block">
              <button className="bg-white text-indigo-950 px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                + Nuovo Progetto
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition hover:bg-white/10 group">
              <h3 className="text-indigo-200 text-sm mb-2 uppercase tracking-wider font-bold">Foto Caricate</h3>
              <p className="text-4xl font-bold text-white group-hover:text-indigo-400 transition">{totalPhotos}</p>
              <p className="text-gray-400 text-xs mt-2">Aggiornato in tempo reale</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-purple-500/30 transition hover:bg-white/10 group">
              <h3 className="text-indigo-200 text-sm mb-2 uppercase tracking-wider font-bold">Like Totali</h3>
              <p className="text-4xl font-bold text-white group-hover:text-purple-400 transition">{totalLikes}</p>
              <p className="text-gray-400 text-xs mt-2">Conteggio Like sui tuoi scatti</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            I tuoi scatti (Gestione)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            <Link href="/upload" className="aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-white hover:bg-white/10 transition cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition group-hover:bg-indigo-600 shadow-lg">
                  <span className="text-3xl">+</span>
                </div>
                <span className="font-medium tracking-wide">Carica Foto</span>
            </Link>
            
            {userPhotos.map(photo => (
                <div key={photo.id} className="aspect-square bg-slate-800 rounded-3xl overflow-hidden relative group border border-white/5 shadow-xl">
                  
                  <img src={photo.url} className="w-full h-full object-cover" />
                  
                  {/* MODIFICA PER MOBILE:
                      Su mobile (default) -> opacity-100 (sempre visibile)
                      Su PC (md:) -> opacity-0 (invisibile) e group-hover:opacity-100
                  */}
                  <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 transition-opacity duration-300
                                  opacity-100 md:opacity-0 md:group-hover:opacity-100">
                      
                      <Link href={`/photo/${photo.id}`}>
                        <button className="text-white font-bold border border-white/30 bg-white/10 px-5 py-2 rounded-full hover:bg-white hover:text-black transition cursor-pointer text-sm">
                            Visualizza
                        </button>
                      </Link>
                      
                      <button 
                        onClick={(e) => {
                           e.preventDefault(); 
                           handleDeletePhoto(photo.id, photo.url);
                        }}
                        className="text-red-400 text-sm font-bold hover:text-red-200 hover:bg-red-500/20 px-4 py-2 rounded-full transition border border-red-500/20"
                      >
                        🗑️ Elimina
                      </button>

                  </div>
                </div>
            ))}
            
            {userPhotos.length === 0 && (
                <div className="col-span-2 aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center p-4 text-center">
                    <p className="text-gray-400 text-sm">Non hai ancora caricato scatti.<br/>Inizia subito a creare il tuo portfolio!</p>
                </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}