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
  const [hasVoted, setHasVoted] = useState(false); // NUOVO: se l'utente ha votato
  const [userId, setUserId] = useState<string | null>(null); // ID utente loggato

  // Carica Dati e Stato Voto
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      const photoId = parseInt(id as string);
      
      // 1. Ottieni l'utente loggato
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user ? user.id : null);

      // 2. Prendi la foto
      const { data: photoData } = await supabase
        .from('photos')
        .select('*')
        .eq('id', photoId)
        .single();

      if (photoData) setPhoto(photoData as Photo);

      // 3. Controlla se l'utente ha già votato (solo se loggato)
      if (user) {
        const { count } = await supabase
          .from('votes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('photo_id', photoId);

        if (count && count > 0) {
          setHasVoted(true);
        }
      }

      // 4. Prendi i commenti
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

  // Gestione Like Unico
  async function handleLike() {
    if (!photo || !userId || hasVoted) return; // Blocco se non loggato o ha già votato

    const photoId = photo.id;

    try {
      // 1. Registra il voto nella tabella 'votes'
      const { error: voteError } = await supabase.from('votes').insert([
        { user_id: userId, photo_id: photoId }
      ]);
      if (voteError) throw voteError;

      // 2. Aggiorna il contatore 'likes' nella tabella 'photos'
      const newLikes = (photo.likes || 0) + 1;
      const { error: updateError } = await supabase
        .from('photos')
        .update({ likes: newLikes })
        .eq('id', photoId);

      if (updateError) throw updateError;
      
      // 3. Aggiorna lo stato locale
      setPhoto({ ...photo, likes: newLikes });
      setHasVoted(true);

    } catch (error: any) {
        // Se l'errore è dovuto alla violazione dell'unicità (doppio voto)
        if (error.code === '23505') { 
            alert("Hai già votato questa foto.");
            setHasVoted(true);
        } else {
            alert("Errore nel registrare il voto.");
            console.error(error);
        }
    }
  }

  // Gestione Invio Commento
  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment || !commentAuthor || !photo) return alert("Scrivi un nome e un commento!");

    // Logica di invio commento... (invariata)
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
      alert("Commento pubblicato!");
      window.location.reload(); 
    } else {
      alert("Errore nell'invio del commento");
    }
  }
  
  // Gestione Acquisto Simulato
  const handlePurchase = () => {
    if (!photo) return;
    alert(`Ordine simulato inviato per: ${photo.title} (€${photo.price}). Il fotografo ${photo.author_name} sarà contattato.`);
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Caricamento...</div>;
  if (!photo) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Foto non trovata.</div>;

  const likeButtonText = userId 
    ? (hasVoted ? "Voto Già Registrato ✅" : "❤️ Lascia un Voto")
    : "Accedi per Votare";


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-y-auto">
      
      {/* Sfondo Texture */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <nav className="relative z-20 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/explore" className="flex items-center gap-2 text-indigo-200 hover:text-white transition bg-white/5 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
          ← Indietro
        </Link>
        <span className="text-indigo-300 font-bold tracking-widest text-xs uppercase border border-indigo-400/30 px-4 py-2 rounded-full bg-indigo-900/40">
          {photo.category}
        </span>
      </nav>

      <div className="relative z-10 flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-10 p-6 pb-20 justify-center items-start">
        
        {/* --- COLONNA SINISTRA: FOTO --- */}
        <div className="flex-1 w-full relative sticky top-10">
           <div className="relative bg-slate-900/50 rounded-2xl border border-white/10 p-1 backdrop-blur-sm shadow-2xl">
            <img 
              src={photo.url} 
              alt={photo.title} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl" 
            />
            
            {/* WATERMARK FISSO */}
            <div className="absolute bottom-5 right-5 text-white/50 text-sm font-bold bg-black/50 p-2 rounded backdrop-blur-sm">
                © {photo.author_name} - Photo Platform
            </div>
          </div>
          
          {/* DETTAGLI TECNICI */}
          <div className="mt-8 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
             <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                ⚙️ Dettagli Tecnici (EXIF)
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {/* 1. Modello Camera */}
                <div className="bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20">
                   <p className="text-indigo-300 text-xs uppercase mb-1 font-bold">Fotocamera</p>
                   <p className="text-white text-sm font-medium">{photo.camera_model || 'N/D'}</p>
                </div>
                {/* 2. ISO */}
                <div className="bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20">
                   <p className="text-indigo-300 text-xs uppercase mb-1 font-bold">ISO</p>
                   <p className="text-white text-sm font-medium">{photo.iso || 'N/D'}</p>
                </div>
                {/* 3. Tempo di Scatto */}
                <div className="bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20">
                   <p className="text-indigo-300 text-xs uppercase mb-1 font-bold">Tempo</p>
                   <p className="text-white text-sm font-medium">{photo.shutter_speed || 'N/D'}</p>
                </div>
                {/* 4. Apertura */}
                <div className="bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20">
                   <p className="text-indigo-300 text-xs uppercase mb-1 font-bold">Apertura</p>
                   <p className="text-white text-sm font-medium">{photo.aperture || 'N/D'}</p>
                </div>
             </div>
          </div>
        </div>

        {/* --- COLONNA DESTRA: INFO & COMMENTI --- */}
        <div className="w-full md:w-96 flex flex-col gap-6">
          
          {/* Info Box */}
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
            <h1 className="text-3xl font-bold mb-2 text-white">{photo.title}</h1>
            
            {/* Link Profilo */}
            <p className="text-indigo-200 text-sm mb-4">
              by <Link href={`/profile/${photo.author_name}`} className="font-bold text-white hover:text-purple-400 hover:underline transition cursor-pointer">{photo.author_name}</Link>
            </p>
            
            <div className="flex justify-between items-center bg-indigo-900/30 p-4 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-indigo-300">VOTI COMMUNITY</span>
                <span className="text-2xl font-bold text-white">{photo.likes || 0}</span>
            </div>

            {/* SEZIONE ACQUISTO */}
            {photo.price > 0 && (
                <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-indigo-200 font-bold uppercase text-xs tracking-wider">Acquista Licenza</span>
                        <span className="text-3xl font-bold text-white">€ {photo.price.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handlePurchase}
                        className="w-full py-3 bg-green-500 text-slate-900 font-bold rounded-xl hover:bg-green-400 transition transform flex items-center justify-center gap-2 shadow-lg"
                    >
                        Acquista e Scarica 🛍️
                    </button>
                </div>
            )}


            <button 
              onClick={handleLike}
              disabled={!userId || hasVoted} // Disabilita se non loggato o ha già votato
              className={`w-full py-3 mt-4 font-bold rounded-xl transition transform flex items-center justify-center gap-2 
                ${!userId 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : hasVoted
                    ? 'bg-indigo-800 text-indigo-300 cursor-not-allowed'
                    : 'bg-white text-indigo-950 hover:scale-[1.02] shadow-lg'
                }`}
            >
              {likeButtonText}
            </button>
          </div>

          {/* SEZIONE COMMENTI */}
          <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              💬 Critiche & Pareri
              <span className="bg-white/10 text-xs px-2 py-1 rounded-full">{comments.length}</span>
            </h3>

            {/* Lista dei commenti */}
            <div className="flex flex-col gap-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Sii il primo a commentare questo scatto.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-indigo-300 text-xs font-bold mb-1">{c.author}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Form per scrivere */}
            <form onSubmit={handlePostComment} className="flex flex-col gap-3 border-t border-white/10 pt-4">
              <input 
                type="text" 
                placeholder="Il tuo nome..."
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
              />
              <textarea 
                placeholder="Scrivi una critica costruttiva..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none h-20 resize-none"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition text-sm">
                Invia Commento
              </button>
            </form>

          </div>

        </div>

      </div>
    </main>
  );
}