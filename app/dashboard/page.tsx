"use client" 

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

type Profile = {
  username: string;
  avatar_url: string;
  city: string;
  badges?: string; 
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
      if (fileName) await supabase.storage.from('uploads').remove([fileName]);
      alert("Foto eliminata con successo!");
    } catch (error: any) {
      setUserPhotos(originalPhotos);
      alert("Errore: " + error.message);
    }
  }

  if (loading && !isAuthReady) return <div className="min-h-screen bg-stone-600 flex items-center justify-center text-white">Caricamento...</div>;
  if (!profile) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative">
      
      <div className="fixed inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex w-full relative z-10">
        
        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-stone-700/90 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 z-50 transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">Photo Platform</h2>
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">✕</button>

          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🏠 Dashboard</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏆 Sfida del Mese</Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
            <Link href="/upload" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
            <Link href="/contracts" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📄 Genera Contratti</Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔒 Area Clienti</Link>
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>
            <Link href="/notifications" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔔 Notifiche</Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>⚙️ Impostazioni</Link>
          </nav>
          <div className="mt-auto pt-6 border-t border-stone-500/30"><button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">🚪 Esci</button></div>
        </aside>
        
        {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 w-full">
          <div className="flex items-center mb-10">
            <button onClick={() => setIsMenuOpen(true)} className="text-white md:hidden text-3xl mr-4">☰</button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-white drop-shadow-md">Bentornato/a, {profile.username}</h1>
              <p className="text-stone-200">Il tuo hub personale per gestire l'arte.</p>
            </div>
          </div>

          {/* --- BADGE SECTION (Solo Stemma + Titolo + Mese) --- */}
          {profile?.badges && (
             <div className="mb-10 inline-flex items-center gap-5 bg-stone-800/40 p-5 rounded-2xl border border-stone-700/50 min-w-[300px]">
                {/* Immagine Stemma */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                    <img 
                        src={profile.badges} 
                        alt="Badge" 
                        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                    />
                </div>
                
                {/* Scritte */}
                <div>
                    <h3 className={`${playfair.className} text-xl font-bold text-amber-400 leading-tight`}>
                       Maestro delle Luci
                    </h3>
                    <p className="text-stone-400 text-xs uppercase tracking-widest font-bold mt-1">
                       Dicembre
                    </p>
                </div>
             </div>
          )}
          {/* --- FINE BADGE --- */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Link href="/dashboard/followers" className="block transform transition hover:scale-[1.02]">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-stone-400/20 hover:border-amber-400/40 transition hover:bg-white/10 h-full">
                <h3 className="text-stone-300 text-sm mb-2 uppercase tracking-wider font-bold">Follower</h3>
                <p className="text-4xl font-bold text-white">{totalFollowers}</p>
                </div>
            </Link>
            <Link href="/dashboard/photos" className="block transform transition hover:scale-[1.02]">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-stone-400/20 hover:border-amber-400/40 transition hover:bg-white/10 h-full">
                <h3 className="text-stone-300 text-sm mb-2 uppercase tracking-wider font-bold">Foto Caricate</h3>
                <p className="text-4xl font-bold text-white">{totalPhotos}</p>
                </div>
            </Link>
            <Link href="/dashboard/likes" className="block transform transition hover:scale-[1.02]">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-stone-400/20 hover:border-amber-400/40 transition hover:bg-white/10 h-full">
                <h3 className="text-stone-300 text-sm mb-2 uppercase tracking-wider font-bold">Like Totali</h3>
                <p className="text-4xl font-bold text-white">{totalLikes}</p>
                </div>
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-white">I tuoi scatti</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-10">
            <Link href="/upload" className="aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-stone-400/30 flex flex-col items-center justify-center text-stone-400 hover:border-amber-200 hover:text-white hover:bg-white/10 transition">
                <span className="text-3xl mb-2">+</span>
                <span className="font-medium">Carica Foto</span>
            </Link>
            
            {userPhotos.map(photo => (
                <div key={photo.id} className="aspect-square bg-stone-800 rounded-3xl overflow-hidden relative group border border-stone-500/30 shadow-xl">
                  <img src={photo.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 transition-opacity duration-300 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
                      <Link href={`/photo/${photo.id}`}><button className="text-white border border-white/30 bg-white/10 px-5 py-2 rounded-full text-sm">Visualizza</button></Link>
                      <button onClick={(e) => { e.preventDefault(); handleDeletePhoto(photo.id, photo.url); }} className="text-red-400 text-sm border border-red-500/20 px-4 py-2 rounded-full">🗑️ Elimina</button>
                  </div>
                </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}