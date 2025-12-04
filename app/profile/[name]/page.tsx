"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Photo = {
  id: number;
  title: string;
  category: string;
  url: string;
  likes: number;
}

export default function ProfilePage() {
  const params = useParams();
  const authorName = decodeURIComponent(params?.name as string);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calcolo statistiche
  const totalLikes = photos.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalPhotos = photos.length;

  useEffect(() => {
    async function fetchAuthorPhotos() {
      if (!authorName) return;
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('author_name', authorName);

      if (!error) {
        setPhotos(data || []);
      }
      setLoading(false);
    }

    fetchAuthorPhotos();
  }, [authorName]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        
        {/* --- HEADER PROFILO (Compatto) --- */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
          
          {/* Avatar (Rimpicciolito) */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(99,102,241,0.4)] border-4 border-slate-900 text-white relative">
            {authorName.charAt(0).toUpperCase()}
            {/* Badge Pro */}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-4 border-slate-900"></div>
          </div>

          <div className="text-center md:text-left flex-1">
            {/* Nome (Ridimensionato) */}
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white tracking-tight">{authorName}</h1>
            <p className="text-indigo-200">Fotografo della Community</p>
            
            {/* Statistiche */}
            <div className="flex gap-6 mt-6 justify-center md:justify-start">
              <div className="text-center bg-white/5 p-4 rounded-2xl min-w-[90px]">
                <span className="block text-2xl font-bold text-white">{totalPhotos}</span>
                <span className="text-xs text-indigo-200 uppercase tracking-wider font-bold">Scatti</span>
              </div>
              <div className="text-center bg-white/5 p-4 rounded-2xl min-w-[90px]">
                <span className="block text-2xl font-bold text-white">{totalLikes}</span>
                <span className="text-xs text-indigo-200 uppercase tracking-wider font-bold">Like Totali</span>
              </div>
            </div>
          </div>

          <button className="px-8 py-3 bg-white text-indigo-950 font-bold rounded-2xl hover:scale-105 transition shadow-lg text-sm">
            Segui +
          </button>
        </div>

        {/* --- PORTFOLIO --- */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-white">Portfolio</h2>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-20">Caricamento portfolio...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Link href={`/photo/${photo.id}`} key={photo.id} className="group relative aspect-square bg-slate-800 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-indigo-500/50 transition duration-500 shadow-lg">
                <img 
                  src={photo.url} 
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center flex-col gap-2 backdrop-blur-sm">
                   <p className="font-bold text-xl translate-y-4 group-hover:translate-y-0 transition duration-300">{photo.title}</p>
                   <p className="text-sm text-indigo-300 translate-y-4 group-hover:translate-y-0 transition duration-300 delay-75">❤️ {photo.likes} Mi piace</p>
                </div>
              </Link>
            ))}
            
            {photos.length === 0 && (
               <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                  <p className="text-gray-400 text-xl">Questo utente non ha ancora caricato foto.</p>
               </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}