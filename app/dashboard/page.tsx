"use client" // Rende la pagina interattiva

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Profile = {
  username: string;
  avatar_url: string;
  city: string;
};

type Photo = {
  id: number;
  url: string;
  likes: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calcola statistiche reali (basate sulle foto dell'utente)
  const totalLikes = userPhotos.reduce((acc, photo) => acc + (photo.likes || 0), 0);
  const totalPhotos = userPhotos.length;
  
  const [isAuthReady, setIsAuthReady] = useState(false); 

  useEffect(() => {
    async function fetchUserData() {
      // 1. Controlla l'utente loggato
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Se non c'è utente, reindirizza al login
        router.push('/login');
        return;
      }
      
      // 2. Prendi il Profilo (Username, Città, Avatar)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData as Profile);
        
        // 3. Prendi le FOTO caricate dall'utente (usando il suo username)
        const { data: photosData } = await supabase
          .from('photos')
          .select('id, url, likes')
          .eq('author_name', profileData.username)
          .order('created_at', { ascending: false })
          .limit(3); 

        setUserPhotos(photosData || []);
      }
      
      setLoading(false);
      setIsAuthReady(true);
    }

    fetchUserData();
  }, [router]);
  
  if (loading && !isAuthReady) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Caricamento Dashboard...</div>;
  if (!profile) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Completa il tuo profilo in Impostazioni.</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden">
      
      {/* --- TEXTURE SFONDO --- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* --- CONTENUTO (z-10 per stare sopra lo sfondo) --- */}
      <div className="flex w-full relative z-10 h-screen">
        
        {/* --- SIDEBAR (Menu Laterale) --- */}
        <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col p-6 h-full">
          <h2 className="text-2xl font-bold text-white mb-10 tracking-tight">
            Photo Platform
          </h2>

          <nav className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            
            <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-white font-medium shadow-lg">
              🏠 Dashboard
            </Link>
            
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Esplora</p>
            
            <Link href="/explore" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              📷 Galleria Pubblica
            </Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              🌍 Mappa Community
            </Link>
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              🏆 Sfide del Mese
            </Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              📘 Blog Storie
            </Link>

            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>

            <Link href="/upload" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              📤 Carica Foto
            </Link>
            <Link href="/contracts" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              📄 Genera Contratti
            </Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              🔒 Area Clienti
            </Link>

            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>

            <Link href="/settings" className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition">
              ⚙️ Impostazioni
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <a href="#" onClick={() => supabase.auth.signOut()} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-lg transition">
              🚪 Esci
            </a>
          </div>
        </aside>


        {/* --- AREA PRINCIPALE --- */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* Intestazione DINAMICA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-1 text-white drop-shadow-md">Bentornato, {profile.username}</h1>
              <p className="text-indigo-200">Il tuo hub personale per gestire l'arte.</p>
            </div>
            
            <Link href="/upload">
              <button className="bg-white text-indigo-950 px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                + Nuovo Progetto
              </button>
            </Link>
          </div>

          {/* Card Statistiche (SOLO Visualizzazioni e Apprezzamenti) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            
            {/* 1. Statistiche Foto Caricate */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition hover:bg-white/10 group">
              <h3 className="text-indigo-200 text-sm mb-2 uppercase tracking-wider font-bold">Foto Caricate</h3>
              <p className="text-4xl font-bold text-white group-hover:text-indigo-400 transition">{totalPhotos}</p>
              <p className="text-gray-400 text-xs mt-2">Aggiornato in tempo reale</p>
            </div>

            {/* 2. Apprezzamenti (Like Totali) */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-purple-500/30 transition hover:bg-white/10 group">
              <h3 className="text-indigo-200 text-sm mb-2 uppercase tracking-wider font-bold">Like Totali</h3>
              <p className="text-4xl font-bold text-white group-hover:text-purple-400 transition">{totalLikes}</p>
              <p className="text-gray-400 text-xs mt-2">Conteggio Like sui tuoi scatti</p>
            </div>

          </div>

          {/* Sezione Progetti Recenti */}
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            I tuoi ultimi scatti
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Shortcut Upload */}
            <Link href="/upload" className="aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-white hover:bg-white/10 transition cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition group-hover:bg-indigo-600 shadow-lg">
                  <span className="text-3xl">+</span>
                </div>
                <span className="font-medium tracking-wide">Carica Foto</span>
            </Link>
            
            {/* Foto dell'utente (Dinamiche) */}
            {userPhotos.map(photo => (
                <div key={photo.id} className="aspect-square bg-slate-800 rounded-3xl overflow-hidden relative group border border-white/5 shadow-xl">
                  <Link href={`/photo/${photo.id}`}>
                    <div className="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-10 backdrop-blur-sm">
                      <span className="text-white font-bold border border-white/30 bg-white/10 px-6 py-2 rounded-full hover:bg-white hover:text-black transition cursor-pointer">Vedi/Modifica</span>
                    </div>
                    <img src={photo.url} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                  </Link>
                </div>
            ))}
            
            {/* Se non ci sono foto */}
            {userPhotos.length === 0 && (
                <div className="col-span-2 aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center">
                    <p className="text-gray-400">Non hai ancora caricato scatti. Inizia subito!</p>
                </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}
