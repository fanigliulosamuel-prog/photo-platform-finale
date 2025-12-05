"use client"

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'] });

type Project = {
  id: number;
  name: string;
  status: string;
  created_at: string;
};

export default function PrivateProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Caricamento Progetti
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login'); // Reindirizza se non loggato
        return;
      }
      setUserId(user.id);

      // Prende SOLO i progetti collegati al tuo ID
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setProjects(data || []);
      }
      setLoading(false);
    }

    fetchProjects();
  }, [router]);
  
  // Funzione Aggiungi Progetto
  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim() || !userId) return;

    setIsCreating(true);

    const { data: newRow, error } = await supabase
      .from('projects')
      .insert([
        { name: newProjectName, status: 'In Corso', user_id: userId }
      ])
      .select('*')
      .single();

    if (!error && newRow) {
      setProjects([newRow as Project, ...projects]);
      setNewProjectName("");
    } else {
        // Aggiunto log per debug se l'errore persiste
        console.error("Errore nella creazione del progetto:", error);
        alert("Errore nella creazione del progetto. Controlla i permessi o la console.");
    }
    setIsCreating(false);
  }

  // Funzione Elimina Progetto
  async function handleDeleteProject(projectId: number) {
    // Uso un div personalizzato anziché alert() o confirm() per compatibilità con iFrame
    if (!window.confirm('Vuoi davvero eliminare questo progetto? L\'azione è irreversibile.')) return;
    
    // Aggiorna l'interfaccia subito
    const originalProjects = projects;
    setProjects(projects.filter(p => p.id !== projectId));

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      alert("Errore nell'eliminazione.");
      setProjects(originalProjects); // Se fallisce, rimetti il progetto
    }
  }


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden p-8">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold text-white mb-2`}>
          I Miei Progetti
        </h1>
        <p className="text-indigo-200 text-xl mb-10">
          Il tuo spazio di lavoro privato: bozze, clienti e lavori in corso.
        </p>

        {/* Form Creazione Progetto */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl mb-10">
            <h3 className="text-xl font-bold mb-4">Nuovo Progetto</h3>
            <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-4">
                <input 
                    type="text" 
                    placeholder="Nome progetto (es. Matrimonio Rossi, Servizio Studio)"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    disabled={isCreating}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                />
                <button 
                    disabled={isCreating}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition disabled:opacity-50"
                >
                    {isCreating ? 'Creazione...' : 'Crea'}
                </button>
            </form>
        </div>


        {/* Lista Progetti */}
        <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">
            Lista ({projects.length})
        </h2>

        {loading ? (
            <p className="text-gray-400 py-10 text-center">Caricamento...</p>
        ) : (
            <div className="space-y-4">
                {projects.map(project => (
                    <div key={project.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 transition">
                        
                        <div>
                            <h3 className="text-xl font-bold text-white">{project.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">Creato il {new Date(project.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-4 mt-3 sm:mt-0">
                            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                                project.status === 'In Corso' ? 'bg-yellow-500/20 text-yellow-300' : 
                                project.status === 'Consegnato' ? 'bg-green-500/20 text-green-300' :
                                'bg-gray-500/20 text-gray-300'
                            }`}>
                                {project.status}
                            </span>
                            
                            {/* Bottone Elimina */}
                            <button 
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-red-400 text-sm hover:text-red-200 transition"
                            >
                                Elimina
                            </button>
                        </div>
                    </div>
                ))}
                
                {projects.length === 0 && (
                     <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-gray-400 text-lg">Nessun progetto attivo. Iniziane uno nuovo!</p>
                     </div>
                )}
            </div>
        )}

      </div>
    </main>
  );
}