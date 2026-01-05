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
  const [username, setUsername] = useState<string>(""); 
  const [loading, setLoading] = useState(true);

  // Stati Progetti
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Stati Dettaglio Progetto
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectPhotos, setProjectPhotos] = useState<Photo[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Stato per il Link Condivisione
  const [copied, setCopied] = useState(false);

  // Caricamento Iniziale
  useEffect(() => {
    async function initData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      if (profile) setUsername(profile.username);

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

  // Carica Foto Progetto
  useEffect(() => {
    async function fetchProjectPhotos() {
      if (!selectedProject) return;
       
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: false });
       
      setProjectPhotos(data || []);
      setCopied(false); // Reset stato copia quando cambio progetto
    }
    fetchProjectPhotos();
  }, [selectedProject]);
   
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
        alert("Errore nella creazione del progetto.");
    }
    setIsCreating(false);
  }

  async function handleDeleteProject(projectId: number) {
    if (!window.confirm('Vuoi davvero eliminare questo progetto e tutte le sue foto?')) return;
     
    const originalProjects = projects;
    setProjects(projects.filter(p => p.id !== projectId));

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      alert("Errore nell'eliminazione.");
      setProjects(originalProjects);
    }
  }

  async function handleUploadPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhotoFile || !selectedProject || !username) return alert("Seleziona un file!");

    setUploadingPhoto(true);
    try {
        const fileExt = newPhotoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, newPhotoFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);

        const { data: newPhoto, error: dbError } = await supabase
            .from('photos')
            .insert([{
                title: newPhotoTitle || "Senza Titolo",
                author_name: username,
                url: publicUrl,
                project_id: selectedProject.id, 
                category: 'Privato' 
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
      if(!window.confirm("Eliminare questa foto dal progetto?")) return;
      setProjectPhotos(projectPhotos.filter(p => p.id !== photoId));
      await supabase.from('photos').delete().eq('id', photoId);
  }

  // Funzione per generare e copiare il link
  const getShareLink = () => {
    if (typeof window !== 'undefined' && selectedProject) {
       // NOTA: Assicurati di avere una pagina /share/[id] o /client-view/[id] nel tuo routing
       return `${window.location.origin}/share/${selectedProject.id}`;
    }
    return '';
  };

  const copyToClipboard = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-500 via-stone-600 to-stone-500 text-white relative overflow-hidden">
      
      {/* Texture Sfondo */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Luci Ambientali Calde */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none"></div>

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
            {/* Link Attivo */}
            <Link href="/private" className="flex items-center gap-3 p-3 bg-stone-100/10 border border-stone-400/30 rounded-xl text-white font-medium shadow-lg" onClick={() => setIsMenuOpen(false)}>🔒 Area Clienti</Link>

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
      
      {isMenuOpen && <div className="fixed inset-0 bg-stone-900/80 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      {/* --- CONTENUTO PRINCIPALE --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        
        {/* Intestazione Mobile */}
        <div className="flex items-center mb-6 md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="text-white text-3xl mr-4">☰</button>
            <h1 className={`${playfair.className} text-2xl font-bold text-white`}>Area Clienti</h1>
        </div>

        <div className="max-w-6xl mx-auto">
            
            {!selectedProject && (
                <div className="animate-fade-in">
                    <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold text-white mb-2 hidden md:block`}>
                      I Miei Progetti
                    </h1>
                    <p className="text-stone-200 text-xl mb-10 hidden md:block">
                      Il tuo spazio di lavoro privato: bozze, clienti e lavori in corso.
                    </p>

                    {/* Form Creazione Progetto (Caldo) */}
                    <div className="bg-stone-400/40 p-6 rounded-3xl border border-stone-300/50 backdrop-blur-xl mb-10 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-white">Nuovo Progetto</h3>
                        <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-4">
                            <input 
                              type="text" 
                              placeholder="Nome progetto (es. Matrimonio Rossi, Servizio Studio)" 
                              value={newProjectName} 
                              onChange={(e) => setNewProjectName(e.target.value)} 
                              disabled={isCreating} 
                              className="flex-1 bg-stone-600/50 border border-stone-500/50 rounded-xl p-3 text-white focus:border-amber-400 outline-none placeholder-stone-300" 
                            />
                            <button 
                              disabled={isCreating} 
                              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition disabled:opacity-50 shadow-lg"
                            >
                              {isCreating ? '...' : 'Crea'}
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {projects.map(project => (
                            <div key={project.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-stone-400/20 p-5 rounded-2xl border border-stone-400/30 hover:border-amber-400/50 transition group shadow-md">
                                <div className="mb-3 sm:mb-0">
                                    <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition">{project.name}</h3>
                                    <p className="text-xs text-stone-300">Creato il {new Date(project.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button onClick={() => setSelectedProject(project)} className="flex-1 sm:flex-none px-5 py-2 bg-stone-100 text-stone-900 text-sm font-bold rounded-full hover:scale-105 transition shadow-sm">
                                      📂 Apri
                                    </button>
                                    <button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-red-200 p-2 transition">
                                      🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                        {projects.length === 0 && !loading && (
                          <div className="text-center py-10 bg-stone-400/10 rounded-2xl border border-dashed border-stone-400/30">
                            <p className="text-stone-300 text-lg">Nessun progetto attivo. Iniziane uno nuovo!</p>
                          </div>
                        )}
                    </div>
                </div>
            )}

            {selectedProject && (
                <div className="animate-fade-in">
                    <button onClick={() => setSelectedProject(null)} className="mb-6 text-stone-200 hover:text-white flex items-center gap-2 transition">
                      ← Torna alla lista progetti
                    </button>

                    <div className="flex justify-between items-end mb-8 border-b border-stone-400/30 pb-6">
                        <div>
                          <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Spazio di Lavoro</span>
                          <h1 className={`${playfair.className} text-4xl md:text-6xl font-bold text-white`}>{selectedProject.name}</h1>
                        </div>
                        <div className="text-right">
                          <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold uppercase border border-green-500/30">Attivo</span>
                        </div>
                    </div>

                    {/* --- NUOVA SEZIONE: CONDIVISIONE LINK CLIENTE --- */}
                    <div className="bg-stone-500/30 border border-stone-400/30 p-6 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner">
                        <div>
                            <h3 className="font-bold text-lg text-amber-100 flex items-center gap-2">🔗 Condivisione Cliente</h3>
                            <p className="text-stone-300 text-sm mt-1">
                                Condividi questo link per permettere al cliente di vedere il progetto.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                             <div className="relative flex-1">
                                <input 
                                    readOnly 
                                    value={getShareLink()} 
                                    className="w-full md:w-80 bg-stone-800/50 border border-stone-600 rounded-xl px-4 py-3 text-stone-300 text-sm outline-none font-mono"
                                />
                             </div>
                             <div className="flex gap-2">
                                <button 
                                    onClick={copyToClipboard}
                                    className={`px-5 py-2 font-bold rounded-xl transition shadow-md flex items-center gap-2 whitespace-nowrap
                                        ${copied 
                                            ? 'bg-green-600 text-white hover:bg-green-500' 
                                            : 'bg-stone-200 text-stone-800 hover:bg-white'}`}
                                >
                                    {copied ? 'Copiato! ✓' : 'Copia Link'}
                                </button>
                                <a 
                                    href={getShareLink()} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 border border-stone-400/50 hover:bg-stone-500/30 rounded-xl text-stone-200 flex items-center justify-center transition"
                                    title="Apri anteprima"
                                >
                                    ↗
                                </a>
                             </div>
                        </div>
                    </div>
                    {/* ------------------------------------------------ */}

                    <div className="bg-stone-400/20 border border-stone-400/30 p-6 rounded-2xl mb-10 shadow-xl backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">📤 Aggiungi Materiale</h3>
                        <form onSubmit={handleUploadPhoto} className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                              <label className="text-xs text-stone-300 mb-1 block">Titolo Foto</label>
                              <input type="text" value={newPhotoTitle} onChange={e => setNewPhotoTitle(e.target.value)} className="w-full bg-stone-600/50 border border-stone-500/50 rounded-lg p-2 text-white outline-none focus:border-amber-400 placeholder-stone-400"/>
                            </div>
                            <div className="flex-1 w-full">
                              <label className="text-xs text-stone-300 mb-1 block">File</label>
                              <input type="file" onChange={e => setNewPhotoFile(e.target.files?.[0] || null)} className="w-full text-sm text-stone-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-900 hover:file:bg-white cursor-pointer"/>
                            </div>
                            <button disabled={uploadingPhoto} className="w-full sm:w-auto px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition disabled:opacity-50 h-[42px] shadow-md">
                              {uploadingPhoto ? '...' : 'Carica'}
                            </button>
                        </form>
                    </div>

                    <h3 className="text-xl font-bold mb-4 text-white">File ({projectPhotos.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
                        {projectPhotos.map(photo => (
                            <div key={photo.id} className="group relative aspect-square bg-stone-800 rounded-xl overflow-hidden border border-stone-500/30 shadow-lg">
                                <img src={photo.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 transition-opacity duration-300 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
                                    <span className="text-xs font-bold text-white px-2 text-center">{photo.title}</span>
                                    <div className="flex gap-2">
                                      <a href={photo.url} target="_blank" className="bg-stone-100 text-stone-900 px-3 py-1 rounded-full text-xs font-bold hover:bg-white">Vedi</a>
                                      <button onClick={() => handleDeletePhoto(photo.id)} className="bg-red-500/20 text-red-300 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white">Elimina</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {projectPhotos.length === 0 && (
                          <div className="col-span-full text-center py-10 text-stone-400 border-2 border-dashed border-stone-400/30 rounded-xl">
                            Nessuna foto in questo progetto.
                          </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}