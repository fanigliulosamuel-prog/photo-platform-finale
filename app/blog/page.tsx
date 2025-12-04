"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

type Post = {
  id: number;
  title: string;
  author: string;
  created_at: string;
  image_url: string;
  slug: string;
}

export default function BlogPage() {
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setPosts(data || []);
      }
      setLoading(false);
    }

    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden p-8">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className={`${playfair.className} text-6xl font-bold text-white mb-4 drop-shadow-xl text-center`}>
          Dietro le Quinte
        </h1>
        <p className="text-indigo-200 text-center mb-12">
          Storie, tecniche e segreti dei fotografi di Photo Platform.
        </p>

        {loading ? (
          <p className="text-center text-gray-500">Caricamento articoli...</p>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="block group bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md hover:border-indigo-500/50 transition duration-300 shadow-xl">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Immagine */}
                  <div className="md:w-1/3 h-64 overflow-hidden">
                    <img src={post.image_url || "https://placehold.co/600x400/1e293b/a5b4fc?text=Blog"} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  
                  {/* Testo */}
                  <div className="md:w-2/3 p-6 flex flex-col justify-center">
                    <p className="text-sm text-indigo-300 font-bold uppercase mb-2">Articolo</p>
                    <h2 className="text-3xl font-bold text-white group-hover:text-indigo-300 transition">{post.title}</h2>
                    <p className="text-sm text-gray-400 mt-3">di {post.author} • {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
            {posts.length === 0 && (
                 <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-400 text-xl">Nessun articolo del blog ancora. Scrivine uno!</p>
                 </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}