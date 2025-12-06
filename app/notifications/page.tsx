"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
    // SFONDO CALDO (Stone 500/600)
    <main className="min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden p-8">
      
      {/* Texture Grana */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
             <Link href="/dashboard" className="text-stone-200 hover:text-white transition">← Dashboard</Link>
             <h1 className={`${playfair.className} text-4xl font-bold text-white`}>Le tue Notifiche</h1>
        </div>

        {loading ? (
            <p className="text-stone-400 text-center py-10">Controllo novità...</p>
        ) : (
            <div className="space-y-4">
                {notifications.map((notif) => (
                    <Link href={`/photo/${notif.photo_id}`} key={notif.id} className="block">
                        <div className={`p-4 rounded-xl border transition flex items-center gap-4 hover:scale-[1.01] 
                            ${notif.is_read 
                                ? 'bg-stone-400/10 border-stone-400/20' // Letta: grigia/trasparente
                                : 'bg-amber-500/20 border-amber-400/40 shadow-lg' // Nuova: evidenziata ambra
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
  );
}