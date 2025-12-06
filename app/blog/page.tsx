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
  content: string;
}

export default function BlogPage() {
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Stati per il modulo di scrittura
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchUser();
  }, []);

  async function fetchUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
        if (data) setUsername(data.username);
    }
  }

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

  async function handleCreatePost(e: React.FormEvent) {
      e.preventDefault();
      if (!username) return alert("Devi essere loggato e avere un username per scrivere.");
      if (!newTitle || !newContent) return alert("Inserisci almeno un titolo e un contenuto.");

      setIsSubmitting(true);

      // Crea uno slug semplice dal titolo
      const slug = newTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();

      const { error } = await supabase.from('posts').insert([{
          title: newTitle,
          content: newContent,
          image_url: newImageUrl,
          author: username,
          slug: slug
      }]);

      if (!error) {
          alert("Storia pubblicata con successo!");
          setNewTitle("");
          setNewContent("");
          setNewImageUrl("");
          fetchPosts(); // Ricarica la lista
      } else {
          console.error(error);
          alert("Errore nella pubblicazione.");
      }
      setIsSubmitting(false);
  }

  return (
    // SFONDO CALDO (Stone 500/600)
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden p-8">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <Link href="/dashboard" className="text-stone-200 hover:text-white mb-8 block transition flex items-center gap-2">
            ← Torna alla Dashboard
        </Link>
        
        <h1 className={`${playfair.className} text-6xl font-bold text-white mb-4 drop-shadow-xl text-center`}>
          Dietro le Quinte
        </h1>
        <p className="text-stone-200 text-center mb-12 text-lg">
          Storie, tecniche e segreti dei fotografi di Photo Platform.
        </p>

        {/* --- SEZIONE SCRITTURA NUOVO POST --- */}
        {username ? (
            <div className="bg-stone-400/20 border border-stone-300/30 p-8 rounded-3xl backdrop-blur-md mb-16 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">✍️ Scrivi una nuova storia</h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="Titolo della storia..." 
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 outline-none transition"
                        />
                        <input 
                            type="text" 
                            placeholder="URL Immagine Copertina (opzionale)" 
                            value={newImageUrl}
                            onChange={e => setNewImageUrl(e.target.value)}
                            className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 outline-none transition"
                        />
                    </div>
                    <textarea 
                        placeholder="Racconta la tua esperienza..." 
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                        className="w-full h-32 bg-stone-600/50 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 outline-none transition resize-none"
                    ></textarea>
                    <button 
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02] disabled:opacity-50"
                    >
                        {isSubmitting ? "Pubblicazione..." : "Pubblica Storia"}
                    </button>
                </form>
            </div>
        ) : (
            <div className="text-center mb-16 p-6 bg-stone-400/10 rounded-2xl border border-stone-400/20">
                <p className="text-stone-300">Accedi per condividere le tue storie.</p>
                <Link href="/login" className="text-amber-200 hover:underline mt-2 inline-block">Vai al Login</Link>
            </div>
        )}

        {/* --- LISTA ARTICOLI --- */}
        {loading ? (
          <p className="text-center text-stone-400 py-10">Caricamento articoli...</p>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="block group bg-stone-400/20 border border-stone-400/30 rounded-2xl overflow-hidden backdrop-blur-md hover:border-amber-400/50 transition duration-300 shadow-xl">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Immagine */}
                  <div className="md:w-1/3 h-64 overflow-hidden relative">
                    <img 
                        src={post.image_url || "https://placehold.co/600x400/57534e/d6d3d1?text=Story"} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                    />
                    <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-transparent transition"></div>
                  </div>
                  
                  {/* Testo */}
                  <div className="md:w-2/3 p-8 flex flex-col justify-center">
                    <p className="text-xs text-amber-200 font-bold uppercase tracking-wider mb-3">Articolo</p>
                    <h2 className="text-3xl font-bold text-white group-hover:text-amber-100 transition mb-4">{post.title}</h2>
                    <p className="text-stone-300 line-clamp-2 mb-4">{post.content}</p>
                    <div className="flex items-center gap-2 text-xs text-stone-400 mt-auto pt-4 border-t border-stone-500/30">
                        <span>Scritto da <strong className="text-stone-200">{post.author}</strong></span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {posts.length === 0 && (
                 <div className="text-center py-20 bg-stone-400/10 rounded-2xl border border-dashed border-stone-400/30">
                    <p className="text-stone-300 text-xl font-light">Nessun articolo del blog ancora. Scrivine uno!</p>
                 </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}