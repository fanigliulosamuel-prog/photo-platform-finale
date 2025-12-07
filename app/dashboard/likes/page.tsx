"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type LikeDetail = {
    id: number;
    created_at: string;
    photo: {
        id: number;
        title: string;
        url: string;
    };
    user: {
        username: string;
        avatar_url: string;
    };
}

export default function LikesPage() {
  const [likes, setLikes] = useState<LikeDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLikes() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Trova le foto dell'utente corrente
      // Usiamo il nome utente o l'ID per trovare le foto. L'ID è più sicuro se salvato.
      // Qui recuperiamo prima le foto di cui l'utente è proprietario.
      const { data: myPhotos } = await supabase
        .from('photos')
        .select('id, title, url')
        .eq('user_id', user.id); // Assumiamo che user_id sia salvato nelle foto (come da ultimo fix)
      
      // Fallback: se user_id è null (foto vecchie), cerchiamo per nome
      let photoIds: number[] = [];
      if (myPhotos && myPhotos.length > 0) {
         photoIds = myPhotos.map(p => p.id);
      } else {
         // Cerca per username
         const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
         if (profile) {
             const { data: photosByName } = await supabase.from('photos').select('id').eq('author_name', profile.username);
             if (photosByName) photoIds = photosByName.map(p => p.id);
         }
      }

      if (photoIds.length === 0) {
          setLoading(false);
          return;
      }

      // 2. Trova i voti per quelle foto
      const { data: votes } = await supabase
        .from('votes')
        .select('id, created_at, user_id, photo_id')
        .in('photo_id', photoIds)
        .order('created_at', { ascending: false });

      if (votes && votes.length > 0) {
          // 3. Arricchisci i dati (chi ha votato e quale foto)
          const enrichedLikes: LikeDetail[] = [];
          
          for (const vote of votes) {
              // Dati Foto
              const photoInfo = myPhotos?.find(p => p.id === vote.photo_id) || { id: vote.photo_id, title: 'Foto', url: '' };
              
              // Dati Utente che ha votato
              const { data: voterProfile } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', vote.user_id)
                .single();
              
              if (voterProfile) {
                  enrichedLikes.push({
                      id: vote.id,
                      created_at: vote.created_at,
                      photo: photoInfo,
                      user: voterProfile
                  });
              }
          }
          setLikes(enrichedLikes);
      }
      setLoading(false);
    }

    fetchLikes();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white p-8">
      {/* Sfondo */}
      <div className="fixed inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-stone-200 hover:text-white mb-8 block transition flex items-center gap-2">← Torna alla Dashboard</Link>
        <h1 className="text-4xl font-bold mb-8 text-white">Apprezzamenti Ricevuti</h1>

        {loading ? <p className="text-center text-stone-400">Caricamento...</p> : (
            <div className="grid grid-cols-1 gap-4">
                {likes.map((like) => (
                    <div key={like.id} className="flex items-center justify-between p-4 bg-white/5 border border-stone-400/20 rounded-xl hover:bg-white/10 transition backdrop-blur-md shadow-sm">
                        
                        <div className="flex items-center gap-4">
                            {/* Chi ha messo like */}
                            <Link href={`/profile/${like.user.username}`} className="flex items-center gap-3 group">
                                <div className="w-12 h-12 rounded-full bg-stone-700 overflow-hidden border border-stone-500 group-hover:border-amber-400 transition">
                                    {like.user.avatar_url ? <img src={like.user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                                </div>
                                <div>
                                    <p className="text-white font-bold group-hover:text-amber-200 transition">{like.user.username}</p>
                                    <p className="text-stone-400 text-xs">ha messo Mi Piace</p>
                                </div>
                            </Link>
                        </div>

                        {/* A quale foto */}
                        <Link href={`/photo/${like.photo.id}`} className="flex items-center gap-4 group text-right">
                            <div className="hidden sm:block">
                                <p className="text-stone-300 text-sm font-medium group-hover:text-white transition">{like.photo.title || "Senza titolo"}</p>
                                <p className="text-stone-500 text-xs">{new Date(like.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-stone-500/30 group-hover:border-amber-400/50 transition">
                                <img src={like.photo.url} className="w-full h-full object-cover" />
                            </div>
                        </Link>

                    </div>
                ))}
                {likes.length === 0 && <div className="text-center py-20 bg-stone-400/10 rounded-2xl border border-dashed border-stone-400/30"><p className="text-stone-200 text-xl">Ancora nessun like ricevuto.</p></div>}
            </div>
        )}
      </div>
    </main>
  );
}