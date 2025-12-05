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

type Photo = {
  id: number;
  title: string;
  url: string;
  project_id: number;
}

export default function PrivateProjectsPage() {
  const router = useRouter();
  
  // Stati Generali
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(""); // Serve per l'upload
  const [loading, setLoading] = useState(true);

  // Stati Progetti
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Stati Dettaglio Progetto (Quando ne apri uno)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectPhotos, setProjectPhotos] = useState<Photo[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoTitle, setNewPhotoTitle] = useState("");

  // 1. Caricamento Iniziale (Utente e Progetti)
  useEffect(() => {
    async function initData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Prendiamo anche lo username dal profilo per poter caricare le foto correttamente
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      if (profile) setUsername(profile.username);

      // Carica Progetti
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);
      setLoading(false);
    }

    initData();
  }, [router]);

  // 2. Carica Foto quando si apre un progetto
  useEffect(() => {
    async function fetchProjectPhotos() {
      if (!selectedProject) return;
      
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: false });
      
      setProjectPhotos(data || []);
    }
    fetchProjectPhotos();
  }, [selectedProject]);
  
  // --- FUNZIONI PROGETTI ---

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim() || !userId) return;
    setIsCreating(true);

    const { data: newRow, error } = await supabase
      .from('projects')
      .insert([{ name: newProjectName, status: 'In Corso', user_id: userId }])
      .select('*')
      .single();

    if (!error && newRow) {
      setProjects([newRow as Project, ...projects]);
      setNewProjectName("");
    } else {
        alert("Errore creazione progetto.");
    }
    setIsCreating(false);
  }

  async function handleDeleteProject(projectId: number) {
    if (!window.confirm('Eliminare il progetto e tutte le sue foto?')) return;
    const originalProjects = projects;
    setProjects(projects.filter(p => p.id !== projectId)); // UI ottimistica

    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
        alert("Errore eliminazione.");
        setProjects(originalProjects);
    }
  }

  // --- FUNZIONI FOTO NEL PROGETTO ---

  async function handleUploadPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhotoFile || !selectedProject || !username) return alert("Seleziona un file!");

    setUploadingPhoto(true);
    try {
        const fileExt = newPhotoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        // Upload Storage
        const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, newPhotoFile);
        if (uploadError) throw uploadError;

        // URL Pubblico
        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);

        // Save to DB (con project_id)
        const { data: newPhoto, error: dbError } = await supabase
            .from('photos')
            .insert([{
                title: newPhotoTitle || "Senza Titolo",
                author_name: username,
                url: publicUrl,
                project_id: selectedProject.id, // Collegamento fondamentale!
                category: 'Privato' // Categoria fittizia per non mostrarle in home se si filtra
            }])
            .select('*')
            .single();

        if (dbError) throw dbError;

        if (newPhoto) setProjectPhotos([newPhoto as Photo, ...projectPhotos]);
        setNewPhotoFile(null);
        setNewPhotoTitle("");
        alert("Foto aggiunta al progetto!");

    } catch (error) {
        console.error(error);
        alert("Errore caricamento foto.");
    } finally {
        setUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto(photoId: number) {
      if(!confirm("Eliminare questa foto dal progetto?")) return;
      setProjectPhotos(projectPhotos.filter(p => p.id !== photoId));
      await supabase.from('photos').delete().eq('id', photoId);
  }


  // --- RENDER ---

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a1b4b] to-slate-900 text-white relative overflow-hidden p-8">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* VISTA 1: LISTA PROGETTI (Se nessun progetto è selezionato) */}
        {!selectedProject && (
            <>
                <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold text-white mb-2`}>I Miei Progetti</h1>
                <p className="text-indigo-200 text-xl mb-10">Gestisci i tuoi lavori privati e i clienti.</p>

                {/* Form Nuovo Progetto */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl mb-10">
                    <h3 className="text-xl font-bold mb-4">Crea Nuovo Spazio di Lavoro</h3>
                    <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-4">
                        <input type="text" placeholder="Nome progetto (es. Shooting Modella)" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} disabled={isCreating} className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" />
                        <button disabled={isCreating} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition disabled:opacity-50">{isCreating ? '...' : 'Crea'}</button>
                    </form>
                </div>

                {/* Lista */}
                <div className="grid grid-cols-1 gap-4">
                    {projects.map(project => (
                        <div key={project.id} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition group">
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">{project.name}</h3>
                                <p className="text-xs text-gray-400">{new Date(project.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedProject(project)} className="px-5 py-2 bg-white text-indigo-950 text-sm font-bold rounded-full hover:scale-105 transition">
                                    📂 Apri
                                </button>
                                <button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-red-200 p-2">🗑️</button>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && !loading && <p className="text-center text-gray-500 py-10">Nessun progetto.</p>}
                </div>
            </>
        )}

        {/* VISTA 2: DETTAGLIO PROGETTO (Se un progetto è selezionato) */}
        {selectedProject && (
            <div className="animate-fade-in">
                <button onClick={() => setSelectedProject(null)} className="mb-6 text-indigo-300 hover:text-white flex items-center gap-2 transition">
                    ← Torna alla lista progetti
                </button>

                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                    <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Spazio di Lavoro</span>
                        <h1 className={`${playfair.className} text-4xl md:text-6xl font-bold text-white`}>{selectedProject.name}</h1>
                    </div>
                    <div className="text-right">
                         <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold uppercase border border-green-500/30">Attivo</span>
                    </div>
                </div>

                {/* Area Upload Foto nel Progetto */}
                <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl mb-10">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📤 Aggiungi Materiale</h3>
                    <form onSubmit={handleUploadPhoto} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs text-gray-400 mb-1 block">Titolo Foto</label>
                            <input type="text" value={newPhotoTitle} onChange={e => setNewPhotoTitle(e.target.value)} placeholder="Es. Scatto 1" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"/>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs text-gray-400 mb-1 block">File</label>
                            <input type="file" onChange={e => setNewPhotoFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"/>
                        </div>
                        <button disabled={uploadingPhoto} className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition disabled:opacity-50 h-[42px]">
                            {uploadingPhoto ? 'Caricamento...' : 'Carica'}
                        </button>
                    </form>
                </div>

                {/* Griglia Foto del Progetto */}
                <h3 className="text-xl font-bold mb-4">File del Progetto ({projectPhotos.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {projectPhotos.map(photo => (
                        <div key={photo.id} className="group relative aspect-square bg-black/40 rounded-xl overflow-hidden border border-white/5">
                            <img src={photo.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                                <span className="text-xs font-bold">{photo.title}</span>
                                <div className="flex gap-2">
                                    <a href={photo.url} target="_blank" className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-200">Vedi</a>
                                    <button onClick={() => handleDeletePhoto(photo.id)} className="bg-red-500/20 text-red-300 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white">Elimina</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {projectPhotos.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                            Nessuna foto in questo progetto.
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </main>
  );
}