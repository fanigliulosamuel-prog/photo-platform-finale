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

      // Segna tutte come lette (opzionale, semplice per ora)
      if (data && data.length > 0) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
      }
    }

    fetchNotifications();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden p-8">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
             <Link href="/dashboard" className="text-indigo-300 hover:text-white transition">← Dashboard</Link>
             <h1 className={`${playfair.className} text-4xl font-bold`}>Le tue Notifiche</h1>
        </div>

        {loading ? (
            <p className="text-gray-400 text-center py-10">Controllo novità...</p>
        ) : (
            <div className="space-y-4">
                {notifications.map((notif) => (
                    <Link href={`/photo/${notif.photo_id}`} key={notif.id} className="block">
                        <div className={`p-4 rounded-xl border transition flex items-center gap-4 ${notif.is_read ? 'bg-white/5 border-white/5' : 'bg-indigo-900/20 border-indigo-500/50'}`}>
                            <div className="text-2xl">
                                {notif.type === 'like' ? '❤️' : '💬'}
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    <span className="text-indigo-300 font-bold">{notif.actor_name}</span> {notif.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </Link>
                ))}
                {notifications.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-gray-400 text-xl">Nessuna nuova notifica. 😴</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </main>
  );
}