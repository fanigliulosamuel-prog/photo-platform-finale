"use client"

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Definiamo i tipi di dati
type Photo = {
  id: number;
  title: string;
  category: string;
  author_name: string;
  url: string;
  created_at: string;
  likes: number;
  price: number; 
  camera_model: string;
  shutter_speed: string;
  iso: number;
  aperture: string;
}

type Comment = {
  id: number;
  text: string;
  author: string;
  created_at: string;
}

export default function PhotoDetailPage() {
  const params = useParams();
  const id = params?.id; 

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false); 
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState(""); 

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const photoId = parseInt(id as string);
      
      // 1. Utente loggato
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user ? user.id : null);

      // 2. Carica Foto
      const { data: photoData } = await supabase
        .from('photos')
        .select('*')
        .eq('id', photoId)
        .single();

      if (photoData) setPhoto(photoData as Photo);

      // 3. Controlla voto e prendi username
      if (user) {
        // Prendi il TUO username per firmare la notifica
        const { data: myProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
        if (myProfile) setCurrentUsername(myProfile.username);

        const { data: voteData } = await supabase
          .from('votes')
          .select('id')
          .eq('user_id', user.id)
          .eq('photo_id', photoId)
          .maybeSingle();

        if (voteData) {
            setHasVoted(true);
        }
      }

      // 4. Carica Commenti
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('photo_id', photoId)
        .order('created_at', { ascending: false });

      if (commentsData) setComments(commentsData);
      
      setLoading(false);
    }

    fetchData();
  }, [id]);

  // --- FUNZIONE PER INVIARE NOTIFICA (MANUALE) ---
  async function sendNotification(type: 'like' | 'comment', message: string) {
    if (!photo) return;
    
    // Cerca l'ID del proprietario della foto usando il nome autore
    const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', photo.author_name)
        .single();
    
    // Se troviamo il proprietario e non sei tu stesso (evita auto-notifiche)
    if (ownerProfile && ownerProfile.id !== userId) {
        const { error } = await supabase.from('notifications').insert([{
            user_id: ownerProfile.id, // Destinatario
            actor_name: currentUsername || "Un utente", // Chi fa l'azione
            type: type,
            photo_id: photo.id,
            message: message
        }]);
        
        if (error) console.error("Errore invio notifica:", error);
    }
  }

  // --- GESTIONE LIKE ---
  async function handleLike() {
    if (!photo || !userId) return; 

    const previousLikes = photo.likes;
    const previousHasVoted = hasVoted;

    // UI Ottimistica
    if (hasVoted) {
        setPhoto({ ...photo, likes: Math.max(0, (photo.likes || 0) - 1) });
        setHasVoted(false);
    } else {
        setPhoto({ ...photo, likes: (photo.likes || 0) + 1 });
        setHasVoted(true);
    }

    try {
      // Chiama la funzione SQL Toggle
      const { data: action, error } = await supabase.rpc('toggle_vote', { 
        photo_id_input: photo.id, 
        user_id_input: userId 
      });

      if (error) throw error;

      // SE IL LIKE È STATO AGGIUNTO -> MANDA NOTIFICA
      if (action === 'added') {
        await sendNotification('like', 'ha messo Mi Piace al tuo scatto.');
      }

    } catch (error: any) {
        console.error("Errore Like:", error);
        setPhoto({ ...photo, likes: previousLikes });
        setHasVoted(previousHasVoted);
        alert("Errore di connessione. Riprova.");
    }
  }

  // --- GESTIONE COMMENTI ---
  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment || !commentAuthor || !photo) return alert("Scrivi un nome e un commento!");

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          text: newComment,
          author: commentAuthor,
          photo_id: photo.id
        }
      ]);

    if (!error) {
      // COMMENTO INSERITO -> MANDA NOTIFICA
      await sendNotification('comment', `ha commentato: "${newComment.substring(0, 20)}..."`);
      
      alert("Commento pubblicato!");
      window.location.reload(); 
    } else {
      alert("Errore nell'invio del commento");
    }
  }
  
  const handlePurchase = () => {
    if (!photo) return;
    alert(`Ordine simulato inviato per: ${photo.title} (€${photo.price}). Il fotografo ${photo.author_name} sarà contattato.`);
  };

  if (loading) return <div className="min-h-screen bg-stone-600 flex items-center justify-center text-white">Caricamento...</div>;
  if (!photo) return <div className="min-h-screen bg-stone-600 flex items-center justify-center text-white">Foto non trovata.</div>;

  return (
    // SFONDO CALDO (Stone 500/600)
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-y-auto">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <nav className="relative z-20 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/explore" className="flex items-center gap-2 text-stone-200 hover:text-white transition bg-stone-400/20 px-5 py-2 rounded-full border border-stone-400/30 backdrop-blur-md">
          ← Indietro
        </Link>
        <span className="text-amber-200 font-bold tracking-widest text-xs uppercase border border-amber-400/30 px-4 py-2 rounded-full bg-amber-900/40">
          {photo.category}
        </span>
      </nav>

      <div className="relative z-10 flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-10 p-6 pb-20 justify-center items-start">
        
        {/* FOTO */}
        <div className="flex-1 w-full relative sticky top-10">
           <div className="relative bg-stone-700/50 rounded-2xl border border-stone-500/30 p-1 backdrop-blur-sm shadow-2xl">
            <img 
              src={photo.url} 
              alt={photo.title} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl" 
            />
            
            {/* WATERMARK */}
            <div className="absolute bottom-5 right-5 text-white/50 text-sm font-bold bg-black/50 p-2 rounded backdrop-blur-sm pointer-events-none select-none">
                © {photo.author_name} - Photo Platform
            </div>
          </div>
          
          {/* EXIF */}
          <div className="mt-8 bg-stone-400/20 p-6 rounded-3xl border border-stone-400/30 backdrop-blur-xl">
             <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">⚙️ Dettagli Tecnici</h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-stone-600/40 p-3 rounded-xl border border-stone-500/40"><p className="text-amber-200 text-xs uppercase mb-1 font-bold">Camera</p><p className="text-white text-sm">{photo.camera_model || 'N/D'}</p></div>
                <div className="bg-stone-600/40 p-3 rounded-xl border border-stone-500/40"><p className="text-amber-200 text-xs uppercase mb-1 font-bold">ISO</p><p className="text-white text-sm">{photo.iso || 'N/D'}</p></div>
                <div className="bg-stone-600/40 p-3 rounded-xl border border-stone-500/40"><p className="text-amber-200 text-xs uppercase mb-1 font-bold">Tempo</p><p className="text-white text-sm">{photo.shutter_speed || 'N/D'}</p></div>
                <div className="bg-stone-600/40 p-3 rounded-xl border border-stone-500/40"><p className="text-amber-200 text-xs uppercase mb-1 font-bold">Apertura</p><p className="text-white text-sm">{photo.aperture || 'N/D'}</p></div>
             </div>
          </div>
        </div>

        {/* INFO & COMMENTI */}
        <div className="w-full md:w-96 flex flex-col gap-6">
          <div className="bg-stone-400/20 p-6 rounded-3xl border border-stone-400/30 backdrop-blur-xl">
            <h1 className="text-3xl font-bold mb-2 text-white">{photo.title}</h1>
            
            {/* Link Profilo */}
            <p className="text-stone-200 text-sm mb-4">
              by <Link href={`/profile/${photo.author_name}`} className="font-bold text-white hover:text-amber-200 hover:underline transition cursor-pointer">{photo.author_name}</Link>
            </p>
            
            <div className="flex justify-between items-center bg-stone-600/40 p-4 rounded-xl border border-stone-500/40">
                <span className="text-sm font-bold text-stone-300">VOTI COMMUNITY</span>
                <span className="text-2xl font-bold text-white">{photo.likes || 0}</span>
            </div>

            {/* SEZIONE ACQUISTO */}
            {photo.price > 0 && (
                <div className="mt-6 border-t border-stone-500/50 pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-amber-200 font-bold uppercase text-xs tracking-wider">Acquista Licenza</span>
                        <span className="text-3xl font-bold text-white">€ {photo.price.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handlePurchase}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 shadow-lg transition transform hover:scale-105"
                    >
                        Acquista 🛍️
                    </button>
                </div>
            )}


            <button 
              onClick={handleLike}
              disabled={!userId} 
              className={`w-full py-3 mt-4 font-bold rounded-xl transition transform flex items-center justify-center gap-2 
                ${!userId 
                  ? 'bg-stone-600 text-stone-400 cursor-not-allowed'
                  : hasVoted
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg scale-105'
                    : 'bg-stone-100 text-stone-900 hover:scale-[1.02] shadow-lg'
                }`}
            >
              {userId ? (hasVoted ? "❤️ Ti piace" : "🤍 Mi piace") : "Accedi per Votare"}
            </button>
            
            {!userId && (
                <p className="text-xs text-center text-stone-300 mt-2">
                    Devi essere registrato per votare. <Link href="/login" className="text-white hover:underline">Accedi</Link>
                </p>
            )}
          </div>

          {/* COMMENTI */}
          <div className="bg-stone-800/40 p-6 rounded-3xl border border-stone-600/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              💬 Critiche & Pareri <span className="bg-stone-600 text-xs px-2 py-1 rounded-full border border-stone-500">{comments.length}</span>
            </h3>
            <div className="flex flex-col gap-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {comments.length === 0 ? <p className="text-stone-400 text-sm italic">Nessun commento ancora.</p> : 
                comments.map((c) => (
                  <div key={c.id} className="bg-stone-600/30 p-3 rounded-xl border border-stone-500/30">
                    <p className="text-amber-200 text-xs font-bold mb-1">{c.author}</p>
                    <p className="text-stone-200 text-sm leading-relaxed">{c.text}</p>
                  </div>
                ))
              }
            </div>
            <form onSubmit={handlePostComment} className="flex flex-col gap-3 border-t border-stone-600/30 pt-4">
              <input 
                type="text" 
                placeholder="Il tuo nome..." 
                value={commentAuthor} 
                onChange={(e) => setCommentAuthor(e.target.value)} 
                className="bg-stone-700/50 border border-stone-500/50 rounded-lg p-3 text-sm text-white focus:border-amber-400/50 outline-none"
              />
              <textarea 
                placeholder="Scrivi una critica costruttiva..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                className="bg-stone-700/50 border border-stone-500/50 rounded-lg p-3 text-sm text-white focus:border-amber-400/50 outline-none h-20 resize-none"
              />
              <button className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition text-sm">
                Invia Commento
              </button>
            </form>

          </div>

        </div>

      </div>
    </main>
  );
}