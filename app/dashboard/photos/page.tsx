"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Photo = {
  id: number;
  url: string;
  title: string;
  likes: number;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Serve lo username per trovare le foto
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      
      if (profile) {
        const { data } = await supabase.from('photos').select('*').eq('author_name', profile.username).order('created_at', { ascending: false });
        setPhotos(data || []);
      }
      setLoading(false);
    }
    fetchPhotos();
  }, []);

  async function handleDelete(id: number) {
      if(!confirm("Eliminare definitivamente?")) return;
      setPhotos(photos.filter(p => p.id !== id));
      await supabase.from('photos').delete().eq('id', id);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="text-stone-200 hover:text-white mb-8 block transition">← Torna alla Dashboard</Link>
        <h1 className="text-4xl font-bold mb-8">Gestisci i tuoi Scatti ({photos.length})</h1>

        {loading ? <p className="text-center">Caricamento...</p> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {photos.map(photo => (
                    <div key={photo.id} className="relative group aspect-square bg-stone-800 rounded-xl overflow-hidden border border-stone-500/30">
                        <img src={photo.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-stone-900/80 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-3">
                            <Link href={`/photo/${photo.id}`} className="px-4 py-1 bg-white text-stone-900 rounded-full text-xs font-bold hover:scale-105 transition">Vedi</Link>
                            <button onClick={() => handleDelete(photo.id)} className="px-4 py-1 bg-red-500/20 text-red-300 border border-red-500 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition">Elimina</button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs">❤️ {photo.likes}</div>
                    </div>
                ))}
                {photos.length === 0 && <div className="col-span-full text-center py-20 text-stone-400">Nessuna foto caricata.</div>}
            </div>
        )}
      </div>
    </main>
  );
}