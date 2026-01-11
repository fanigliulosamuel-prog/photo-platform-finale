"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// --- TIPI ---
type Photo = {
  id: number;
  title: string;
  category: string;
  url: string;
  likes: number;
}

type Profile = {
  id: string; 
  username: string;
  bio: string;
  city: string;
  avatar_url: string;
  badges?: string; 
}

type Post = {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  image_url: string;
  content: string;
}

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams(); 
  
  // Decodifica il nome (es. "Mario%20Rossi" -> "Mario Rossi")
  const authorName = decodeURIComponent(params?.name as string);
  const fromAdmin = searchParams?.get('from') === 'admin';

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [posts, setPosts] = useState<Post[]>([]); 
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stati per il Follow
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  
  const totalLikes = photos.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalPhotos = photos.length;

  useEffect(() => {
    async function fetchData() {
      if (!authorName) return;

      try {
        // 1. Chi sono io?
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user ? user.id : null);
        
        // 2. Chi è l'autore del profilo?
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', authorName)
          .single();

        if (profileData) {
          setProfile(profileData);

          // 3. Controllo se lo seguo già
          if (user) {
             const { data: followData } = await supabase
                 .from('follows')
                 .select('*')
                 .eq('follower_id', user.id)
                 .eq('following_id', profileData.id)
                 .maybeSingle();
             
             if (followData) setIsFollowing(true);
          }

          // 4. Conta i follower totali
          const { count } = await supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('following_id', profileData.id);
          
          setFollowersCount(count || 0);
        }

        // 5. Prendi le foto (SOLO QUELLE PUBBLICHE)
        const { data: photosData } = await supabase
          .from('photos')
          .select('*')
          .eq('author_name', authorName)
          .is('project_id', null) 
          .order('created_at', { ascending: false });

        if (photosData) setPhotos(photosData);

        // 6. Prendi i POST DEL BLOG dell'autore
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('author', authorName)
          .order('created_at', { ascending: false });

        if (postsData) setPosts(postsData);

      } catch (error) {
        console.error("Errore caricamento profilo:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authorName]);

  // --- GESTIONE FOLLOW (ATOMICA) ---
  async function handleFollow() {
    if (!currentUserId) return alert("Devi accedere per seguire gli utenti.");
    if (!profile) return;

    // Salva stato precedente
    const prevFollowing = isFollowing;
    const prevCount = followersCount;

    // UI Ottimistica
    if (isFollowing) {
        setIsFollowing(false);
        setFollowersCount(Math.max(0, followersCount - 1));
    } else {
        setIsFollowing(true);
        setFollowersCount(followersCount + 1);
    }

    try {
        const { error } = await supabase.rpc('toggle_follow', { 
            target_user_id: profile.id 
        });

        if (error) throw error;

    } catch (error: any) {
        console.error("Errore Follow:", error);
        setIsFollowing(prevFollowing);
        setFollowersCount(prevCount);
        alert("Impossibile seguire l'utente: " + error.message);
    }
  }

  // --- UI DI CARICAMENTO / ERRORE ---
  if (!loading && !profile) {
    return (
        <main className="min-h-screen bg-stone-900 text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Profilo non trovato</h1>
                <Link href="/explore" className="text-amber-400 hover:underline">Torna alla home</Link>
            </div>
        </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigazione */}
      <nav className="relative z-20 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link 
            href={fromAdmin ? "/admin" : "/explore"} 
            className="flex items-center gap-2 text-stone-200 hover:text-white transition bg-stone-400/20 px-5 py-2 rounded-full border border-stone-400/30 backdrop-blur-md"
        >
          {fromAdmin ? "← Torna al Pannello Admin" : "← Indietro"}
        </Link>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        
        {/* --- HEADER PROFILO --- */}
        <div className="flex flex-col md:flex-row items-start gap-10 mb-12 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
          
          {/* Avatar */}
          <div className="w-28 h-28 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(251,191,36,0.3)] border-4 border-stone-800 text-white relative overflow-hidden">
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={authorName} className="w-full h-full object-cover" />
            ) : (
                authorName.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                
                {/* NOME + BADGE */}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-1">
                            {authorName}
                        </h1>
                        
                        {/* --- INIZIO LOGICA BADGE (AGGIORNATA PER LA COLONNA "badges") --- */}
                        {profile?.badges && (
                            <div className="group relative flex items-center justify-center cursor-help ml-1">
                                {/* Immagine Badge dal Database */}
                                <img 
                                    src={profile.badges} 
                                    alt="Badge Utente" 
                                    className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] hover:scale-110 transition-transform duration-300"
                                />
                                
                                {/* Tooltip Badge */}
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-amber-500 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none border border-amber-500/30 z-50">
                                    Badge Ufficiale
                                </span>
                            </div>
                        )}
                        {/* --- FINE LOGICA BADGE --- */}

                    </div>

                    <p className="text-stone-300 flex items-center gap-2 mt-1">
                        Fotografo 
                        {profile?.city && <span className="text-amber-200/80">• {profile.city} 📍</span>}
                    </p>
                </div>
                
                {/* BOTTONE FOLLOW */}
                {currentUserId !== profile?.id && (
                    <button 
                        onClick={handleFollow}
                        className={`mt-4 md:mt-0 px-8 py-3 font-bold rounded-2xl transition shadow-lg text-sm flex items-center gap-2
                        ${isFollowing 
                            ? "bg-white text-stone-900 border border-stone-300 hover:bg-stone-200" 
                            : "bg-amber-600 text-white hover:bg-amber-500"}`}
                    >
                        {isFollowing ? "Seguito ✔" : "Segui +"}
                    </button>
                )}
            </div>

            {/* BIO */}
            {profile?.bio && (
                <p className="text-stone-200 text-sm leading-relaxed max-w-2xl mb-6 bg-stone-900/20 p-4 rounded-xl border border-stone-500/20">
                    "{profile.bio}"
                </p>
            )}
            
            <div className="flex gap-8 border-t border-stone-500/30 pt-6">
              <div>
                <span className="block text-2xl font-bold text-white">{totalPhotos}</span>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-bold">Scatti Pubblici</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">{totalLikes}</span>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-bold">Like Totali</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">{followersCount}</span>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-bold">Follower</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- PORTFOLIO --- */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-white">Portfolio Pubblico</h2>
          <div className="h-px bg-stone-500/30 flex-1"></div>
        </div>

        {loading ? (
          <p className="text-center text-stone-400 py-20">Caricamento portfolio...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {photos.map((photo) => (
              <Link 
                href={`/photo/${photo.id}${fromAdmin ? '?from=admin' : ''}`} 
                key={photo.id} 
                className="group relative aspect-square bg-stone-800 rounded-2xl overflow-hidden cursor-pointer border border-stone-500/30 hover:border-amber-400/50 transition duration-500 shadow-lg"
              >
                <img 
                  src={photo.url} 
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-stone-900/80 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center flex-col gap-2 backdrop-blur-sm">
                   <p className="font-bold text-xl translate-y-4 group-hover:translate-y-0 transition duration-300 text-white">{photo.title}</p>
                   <p className="text-sm text-amber-200 translate-y-4 group-hover:translate-y-0 transition duration-300 delay-75">❤️ {photo.likes} Mi piace</p>
                </div>
              </Link>
            ))}
            
            {photos.length === 0 && (
               <div className="col-span-full text-center py-20 bg-stone-400/10 rounded-3xl border border-dashed border-stone-400/30">
                  <p className="text-stone-300 text-xl font-light">Nessuna foto pubblica trovata per questo utente.</p>
               </div>
            )}
          </div>
        )}

        {/* --- SEZIONE BLOG --- */}
        {posts.length > 0 && (
            <>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-white">Storie & Articoli</h2>
                    <div className="h-px bg-stone-500/30 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {posts.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.id} className="block group bg-stone-400/20 border border-stone-400/30 rounded-2xl overflow-hidden backdrop-blur-md hover:border-amber-400/50 transition duration-300 shadow-lg">
                            <div className="flex h-40">
                                <div className="w-1/3 overflow-hidden relative">
                                    <img 
                                      src={post.image_url || "https://placehold.co/600x400/57534e/d6d3d1?text=Story"} 
                                      alt={post.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                                    />
                                </div>
                                <div className="w-2/3 p-4 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition line-clamp-1">{post.title}</h3>
                                    <p className="text-stone-300 text-sm line-clamp-2 mt-2">
                                        {post.content.substring(0, 150)}...
                                    </p>
                                    <p className="text-stone-500 text-xs mt-3">{new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </>
        )}

      </div>
    </main>
  );
}