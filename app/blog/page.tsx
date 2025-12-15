"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Stato per il menu laterale

  // Stati per il modulo di scrittura
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); 
  const [previewUrl, setPreviewUrl] = useState(""); 
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  async function handleCreatePost(e: React.FormEvent) {
      e.preventDefault();
      if (!username) return alert("Devi essere loggato e avere un username per scrivere.");
      if (!newTitle || !newContent) return alert("Inserisci almeno un titolo e un contenuto.");

      setIsSubmitting(true);

      try {
        let uploadedImageUrl = "";

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `blog_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName);
            
            uploadedImageUrl = publicUrl;
        }

        const slug = newTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();

        const { error } = await supabase.from('posts').insert([{
            title: newTitle,
            content: newContent,
            image_url: uploadedImageUrl,
            author: username,
            slug: slug
        }]);

        if (error) throw error;

        alert("Storia pubblicata con successo!");
        setNewTitle("");
        setNewContent("");
        setImageFile(null);
        setPreviewUrl("");
        fetchPosts(); 

      } catch (error: any) {
          console.error(error);
          alert("Errore: " + error.message);
      } finally {
          setIsSubmitting(false);
      }
  }

  async function handleDeletePost(postId: number) {
    if (!confirm("Sei sicuro di voler eliminare questa storia?")) return;

    try {
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) throw error;
        setPosts(posts.filter(p => p.id !== postId));
        alert("Storia eliminata.");
    } catch (error: any) {
        alert("Errore nell'eliminazione: " + error.message);
    }
  }

  return (
    // Layout Flex per Sidebar + Contenuto
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* --- SIDEBAR --- */}
      <aside className={`fixed md:relative w-64 bg-stone-700/40 backdrop-blur-xl border-r border-stone-500/30 flex flex-col p-6 h-full transition-transform duration-300 z-50
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">
            Photo Platform
          </h2>
          
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 md:hidden text-stone-300 hover:text-white text-xl">
            ✕
          </button>

          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>
              🏠 Dashboard
            </Link>
            
            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            <Link href="/explore" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📷 Galleria Pubblica</Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🌍 Mappa Community</Link>
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏆 Sfide del Mese</Link>
            
            {/* Link Attivo */}
            <Link href="/blog" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>

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

      {/* --- AREA PRINCIPALE --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        
        {/* Intestazione Mobile con Hamburger */}
        <div className="flex items-center mb-8 md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button>
            <h1 className={`${playfair.className} text-3xl font-bold text-white`}>Blog</h1>
        </div>

        <div className="max-w-5xl mx-auto">
            {/* Titolo Desktop */}
            <h1 className={`${playfair.className} text-6xl font-bold text-white mb-4 drop-shadow-xl text-center hidden md:block`}>
              Dietro le Quinte
            </h1>
            <p className="text-stone-200 text-center mb-12 text-lg hidden md:block">
              Storie, tecniche e segreti dei fotografi di Photo Platform.
            </p>

            {/* --- SEZIONE SCRITTURA --- */}
            {username ? (
                <div className="bg-stone-400/20 border border-stone-300/30 p-6 md:p-8 rounded-3xl backdrop-blur-md mb-16 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">✍️ Scrivi una nuova storia</h3>
                    
                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Titolo della storia..." 
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 outline-none transition"
                                />
                                
                                <div className="relative group">
                                    <label className="block w-full bg-stone-600/50 border border-stone-400/50 rounded-xl p-4 text-stone-300 cursor-pointer hover:bg-stone-600/70 transition border-dashed text-center">
                                        {imageFile ? `📁 ${imageFile.name}` : "Clicca per caricare copertina"}
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>

                                <textarea 
                                    placeholder="Racconta la tua esperienza..." 
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    className="w-full h-32 bg-stone-600/50 border border-stone-400/50 rounded-xl p-4 text-white placeholder-stone-300 focus:border-amber-400/50 outline-none transition resize-none"
                                ></textarea>
                            </div>

                            <div className="w-full md:w-1/3 aspect-video md:aspect-auto bg-stone-800/50 rounded-2xl border-2 border-dashed border-stone-500/30 flex items-center justify-center overflow-hidden relative min-h-[200px]">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Anteprima" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <span className="text-4xl block mb-2">🖼️</span>
                                        <p className="text-stone-400 text-sm">Anteprima qui</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            disabled={isSubmitting}
                            className="w-full md:w-auto px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02] disabled:opacity-50"
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
            <div className="space-y-8 md:space-y-10 pb-20">
                {posts.map((post) => (
                <div key={post.id} className="relative group block bg-stone-400/20 border border-stone-400/30 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl hover:border-amber-400/50 transition duration-300">
                    
                    <Link href={`/blog/${post.slug}`} className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-64 overflow-hidden relative">
                        <img 
                            src={post.image_url || "https://placehold.co/600x400/57534e/d6d3d1?text=Story"} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                        />
                        <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-transparent transition"></div>
                    </div>
                    
                    <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                        <p className="text-xs text-amber-200 font-bold uppercase tracking-wider mb-2">Articolo</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-amber-100 transition mb-3">{post.title}</h2>
                        <p className="text-stone-300 line-clamp-2 mb-4 text-sm md:text-base">{post.content}</p>
                        <div className="flex items-center gap-2 text-xs text-stone-400 mt-auto pt-4 border-t border-stone-500/30">
                            <span>Scritto da <strong className="text-stone-200">{post.author}</strong></span>
                            <span>•</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    </Link>

                    {username === post.author && (
                        <button 
                            onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                handleDeletePost(post.id);
                            }}
                            className="absolute top-4 right-4 z-20 bg-red-600 text-white p-3 rounded-full shadow-lg transition transform active:scale-90"
                            title="Elimina la tua storia"
                        >
                            🗑️
                        </button>
                    )}
                </div>
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
    </div>
  );
}