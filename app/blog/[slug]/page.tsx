"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

type Post = {
  id: number;
  title: string;
  author: string;
  created_at: string;
  image_url: string;
  content: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug; 

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error) {
        setPost(data as Post);
      }
      setLoading(false);
    }

    fetchPost();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-stone-600 flex items-center justify-center text-white">Caricamento...</div>;
  
  if (!post) return (
    <div className="min-h-screen bg-stone-600 flex flex-col items-center justify-center text-white p-4 text-center">
        <h1 className="text-4xl mb-4">Articolo non trovato 😕</h1>
        <Link href="/blog" className="text-amber-200 hover:underline">Torna al Blog</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto p-8">

        <Link href="/blog" className="text-stone-200 hover:text-white flex items-center gap-2 mb-10 transition">
          ← Torna al Blog
        </Link>
        
        {/* Immagine di Copertina */}
        <div className="w-full h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl border border-stone-400/20 relative">
            <img src={post.image_url || "https://placehold.co/800x400/57534e/d6d3d1?text=Blog"} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent"></div>
        </div>

        {/* Intestazione */}
        <div className="mb-12 border-b border-stone-500/30 pb-8">
            <p className="text-sm text-amber-200 font-bold uppercase mb-4 tracking-widest">Storie & Visioni</p>
            <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold text-white mb-6 leading-tight`}>
            {post.title}
            </h1>
            <div className="flex items-center gap-4 text-stone-300 text-sm">
                <span className="bg-stone-500/30 px-3 py-1 rounded-full border border-stone-500/50">✍️ {post.author}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
        </div>

        {/* Contenuto */}
        <div className="prose prose-invert prose-lg max-w-none text-stone-200 leading-relaxed">
          <p className="whitespace-pre-line">{post.content}</p>
        </div>

      </div>
    </main>
  );
}