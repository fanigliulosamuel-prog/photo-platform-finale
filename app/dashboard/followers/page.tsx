"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Follower = {
    id: string;
    username: string;
    avatar_url: string;
}

export default function FollowersPage() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowers() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      }
      setLoading(false);
    }
    fetchFollowers();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-stone-200 hover:text-white mb-8 block transition">← Torna alla Dashboard</Link>
        <h1 className="text-4xl font-bold mb-8">Tutti i tuoi Follower</h1>

        {loading ? <p className="text-center">Caricamento...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followers.map(follower => (
                    <Link href={`/profile/${follower.username}`} key={follower.id} className="flex items-center gap-4 p-4 bg-white/5 border border-stone-400/20 rounded-xl hover:bg-white/10 transition">
                        <div className="w-12 h-12 rounded-full bg-stone-700 overflow-hidden border border-stone-500">
                            {follower.avatar_url ? <img src={follower.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">👤</div>}
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">{follower.username}</p>
                            <p className="text-stone-400 text-sm">Visualizza Profilo</p>
                        </div>
                    </Link>
                ))}
                {followers.length === 0 && <p className="col-span-2 text-center text-stone-400 py-10">Non hai ancora follower.</p>}
            </div>
        )}
      </div>
    </main>
  );
}