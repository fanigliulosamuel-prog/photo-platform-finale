"use client" 

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

type Follower = {
    id: string;
    username: string;
    avatar_url: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const totalLikes = userPhotos.reduce((acc, photo) => acc + (photo.likes || 0), 0);
  const totalPhotos = userPhotos.length;
  const totalFollowers = followers.length; 
  
  const [isAuthReady, setIsAuthReady] = useState(false); 

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      
      // 1. Profilo
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData as Profile);
        
        // 2. Foto
        const { data: photosData } = await supabase
          .from('photos')
          .select('id, url, likes')
          .eq('author_name', profileData.username)
          .order('created_at', { ascending: false });

        setUserPhotos(photosData || []);

        // 3. Followers
        const { data: followsData } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('following_id', user.id);
        
        if (followsData && followsData.length > 0) {
            const followerIds = followsData.map(f => f.follower_id);
            const { data: followersProfiles } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', followerIds);
            
            setFollowers(followersProfiles as Follower[] || []);
        } else {
            setFollowers([]);
        }
      }
      
      setLoading(false);
      setIsAuthReady(true);
    }

    fetchUserData();
  }, [router]);
  
  async function handleDeletePhoto(photoId: number, photoUrl: string) {
    if (!window.confirm('Sei sicuro di voler eliminare questo scatto? L\'azione è irreversibile.')) {
      return;
    }

    const originalPhotos = [...userPhotos];
    setUserPhotos(userPhotos.filter(p => p.id !== photoId));

    try {
      const { error: dbError } = await supabase.from('photos').delete().eq('id', photoId);
      if (dbError) throw dbError;
      
      const fileName = photoUrl.split('/').pop();
      if (fileName) {
         const { error: storageError } = await supabase.storage.from('uploads').remove([fileName]);
         if (storageError) console.warn("Nota: Errore cancellazione file fisico (non bloccante):", storageError);
      }

      alert("Foto eliminata con successo!");

    } catch (error: any) {
      setUserPhotos(originalPhotos);
      alert("Errore nell'eliminazione: " + error.message);
      console.error(error);
    }
  }

  if (loading && !isAuthReady) return <div className="min-h-screen bg-stone-600 flex items-center justify-center text-white">Caricamento Dashboard...</div>;
  
  if (!profile) return (
    <div className="min-h-screen bg-stone-600 flex flex-col items-center justify-center text-white gap-4">
        <p>Profilo incompleto.</p>
        <Link href="/settings" className="bg-stone-100 text-stone-900 px-6 py-2 rounded-full hover:bg-white transition">Vai alle Impostazioni</Link>
    </div>
  );

  return (
    // FIX SCROLL: Rimosso overflow-hidden, usiamo min-h-screen per permettere lo scroll naturale
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative">
      
      {/* Texture Sfondo FISSATA (Fixed) */}
      <div className="fixed inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali FISSATE */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Container Principale */}
      <div className="flex w-full relative z-10">
        
        {/* --- SIDEBAR --- */}
        {/* FIX SIDEBAR: Su mobile è fixed e nascosta. Su Desktop è STICKY (rimane ferma mentre scorri) */}
        <aside className={`
          fixed inset-y-0 left-0 w-64 bg-stone-700/90 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 z-50 transition-transform duration-300
          md:sticky md:top-0 md:h-screen md:translate-x-0
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">
            Photo Platform
          </h2>
          
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">
            ✕
          </button>

          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🏠 Dashboard</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏆 Sfide del Mese</Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>

            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
            <Link href="/upload" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
            <Link href="/contracts" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📄 Genera Contratti</Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔒 Area Clienti</Link>

            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>
            <Link href="/notifications" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔔 Notifiche</Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>⚙️ Impostazioni</Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-stone-500/30">
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">
              🚪 Esci
            </button>
          </div>
        </aside>
        
        {/* Overlay Mobile */}
        {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

        {/* --- AREA PRINCIPALE (Scroll naturale) --- */}
        <main className="flex-1 p-4 md:p-8 w-full">
          
          <div className="flex items-center mb-10">
            <button onClick={() => setIsMenuOpen(true)} className="text-white md:hidden text-3xl mr-4">☰</button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-white drop-shadow-md">Bentornato, {profile.username}</h1>
              <p className="text-stone-200">Il tuo hub personale per gestire l'arte.</p>
            </div>
            {/* PULSANTE RIMOSSO QUI */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Link href="/dashboard/followers" className="block transform transition hover:scale-[1.02]">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-stone-400/20 hover:border-amber-400/40 transition hover:bg-white/10 group h-full cursor-pointer">
                <h3 className="text-stone-300 text-sm mb-2 uppercase tracking-wider font-bold">Follower</h3>
                <p className="text-4xl font-bold text-white group-hover:text-amber-200 transition">{totalFollowers}</p>
                <p className="text-stone-400 text-xs mt-2">Vedi lista completa →</p>
                </div>
            </Link>

            <Link href="/dashboard/photos" className="block transform transition hover:scale-[1.02]">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-stone-400/20 hover:border-amber-400/40 transition hover:bg-white/10 group h-full cursor-pointer">
                <h3 className="text-stone-300 text-sm mb-2 uppercase tracking-wider font-bold">Foto Caricate</h3>
                <p className="text-4xl font-bold text-white group-hover:text-amber-200 transition">{totalPhotos}</p>
                <p className="text-stone-400 text-xs mt-2">Gestisci tutti i tuoi scatti →</p>
                </div>
            </Link>

            <Link href="/dashboard/likes" className="block transform transition hover:scale-[1.02]">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-stone-400/20 hover:border-amber-400/40 transition hover:bg-white/10 group h-full">
                <h3 className="text-stone-300 text-sm mb-2 uppercase tracking-wider font-bold">Like Totali</h3>
                <p className="text-4xl font-bold text-white group-hover:text-amber-200 transition">{totalLikes}</p>
                <p className="text-stone-400 text-xs mt-2">Vedi chi ti ha votato →</p>
                </div>
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            I tuoi scatti (Anteprima)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-10">
            {/* Card per caricare nuove foto - mantenuta */}
            <Link href="/upload" className="aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-stone-400/30 flex flex-col items-center justify-center text-stone-400 hover:border-amber-200 hover:text-white hover:bg-white/10 transition cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition group-hover:bg-amber-700/50 shadow-lg"><span className="text-3xl">+</span></div>
                <span className="font-medium tracking-wide">Carica Foto</span>
            </Link>
            
            {userPhotos.map(photo => (
                <div key={photo.id} className="aspect-square bg-stone-800 rounded-3xl overflow-hidden relative group border border-stone-500/30 shadow-xl">
                  
                  <img src={photo.url} className="w-full h-full object-cover" />
                  
                  {/* FIX TABLET E MOBILE: Sempre visibile su touch, hover su PC */}
                  <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 transition-opacity duration-300
                                  opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
                      
                      <Link href={`/photo/${photo.id}`}>
                        <button className="text-white font-bold border border-white/30 bg-white/10 px-5 py-2 rounded-full hover:bg-white hover:text-stone-900 transition cursor-pointer text-sm">
                            Visualizza
                        </button>
                      </Link>
                      
                      <button 
                        onClick={(e) => {
                           e.preventDefault(); 
                           e.stopPropagation(); 
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
                <div className="col-span-2 aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-stone-400/30 flex items-center justify-center p-4 text-center">
                    <p className="text-stone-400 text-sm">Non hai ancora caricato scatti.<br/>Inizia subito a creare il tuo portfolio!</p>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}