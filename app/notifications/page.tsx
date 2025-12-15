"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const playfair = Playfair_Display({ subsets: ['latin'] });

type Notification = {
  id: number;
  created_at: string;
  actor_name: string;
  type: string;
  message: string;
  photo_id: number;
  is_read: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carica le notifiche per l'utente loggato
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setNotifications(data || []);
      setLoading(false);

      // Segna tutte come lette quando apri la pagina
      if (data && data.length > 0) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
      }
    }

    fetchNotifications();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

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
            <Link href="/challenges" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🏆 Sfide</Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📘 Blog Storie</Link>

            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Strumenti</p>
            <Link href="/upload" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📤 Carica Foto</Link>
            <Link href="/contracts" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>📄 Genera Contratti</Link>
            <Link href="/private" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>🔒 Area Clienti</Link>

            <p className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-4 mb-2 px-2">Account</p>
            {/* Link Attivo */}
            <Link href="/notifications" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🔔 Notifiche</Link>
            <Link href="/settings" className="flex items-center gap-3 p-3 text-stone-200 hover:bg-white/10 hover:text-white rounded-xl transition" onClick={() => setIsMenuOpen(false)}>⚙️ Impostazioni</Link>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-stone-500/30">
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-stone-400 hover:text-stone-100 text-sm flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition w-full text-left">
              🚪 Esci
            </button>
          </div>
      </aside>
      
      {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      {/* --- CONTENUTO PRINCIPALE --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        
        <div className="flex items-center mb-6 md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button>
            <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Notifiche</h1>
        </div>

        <div className="max-w-3xl mx-auto">
            <h1 className={`${playfair.className} text-4xl font-bold text-white mb-8 hidden md:block`}>Le tue Notifiche</h1>

            {loading ? (
                <p className="text-stone-400 text-center py-10">Controllo novità...</p>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <Link href={`/photo/${notif.photo_id}`} key={notif.id} className="block">
                            <div className={`p-4 rounded-xl border transition flex items-center gap-4 hover:scale-[1.01] 
                                ${notif.is_read 
                                    ? 'bg-stone-400/10 border-stone-400/20' // Letta
                                    : 'bg-amber-500/20 border-amber-400/40 shadow-lg' // Nuova
                                }`}>
                                <div className="text-3xl">
                                    {notif.type === 'like' ? '❤️' : '💬'}
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        <span className="text-amber-200 font-bold">{notif.actor_name}</span> {notif.message}
                                    </p>
                                    <p className="text-xs text-stone-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {notifications.length === 0 && (
                        <div className="text-center py-20 bg-stone-400/10 rounded-2xl border border-dashed border-stone-400/30">
                            <p className="text-stone-200 text-xl">Nessuna nuova notifica. 😴</p>
                            <p className="text-sm text-stone-400 mt-2">Carica nuove foto per interagire con la community!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}