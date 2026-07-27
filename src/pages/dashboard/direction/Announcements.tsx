import React, { useState, useEffect } from 'react';
import {
    Bell,
    Megaphone,
    Send,
    Search,
    Filter,
    User,
    Calendar,
    MessageSquare,
    Eye,
    Globe,
    Lock,
    CheckCircle2,
    AlertCircle,
    X,
    FileText,
    Trash2
} from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const Announcements: React.FC = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
    const [filterText, setFilterText] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');

    // Form state
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        targetRole: 'ALL',
        targetCycle: '',
        institutionId: ''
    });

    useEffect(() => {
        fetchAnnouncements();
        if (user?.role === 'PDG' && user?.id) {
            fetchInstitutions();
        }
    }, [user?.institution?.id, user?.id]);

    const fetchInstitutions = async () => {
        try {
            const res = await api.get(`/institutions/ceo/${user?.id}`);
            setInstitutions(res.data);
        } catch (error) {
            console.error("Error fetching institutions", error);
        }
    };

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const params: any = { params: {} };
            if (user?.role === 'PDG' && user?.id) {
                params.params.ceoId = user.id;
            } else if (user?.institution?.id) {
                params.params.institutionId = user.institution.id;
            }
            const res = await api.get('/announcements', params);
            setAnnouncements(res.data);
        } catch (error) {
            console.error("Error fetching announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnouncement.title || !newAnnouncement.content) return;

        setLoading(true);
        try {
            const payload: any = { ...newAnnouncement };
            if (user?.role === 'PDG' && newAnnouncement.institutionId) {
                payload.institution = { id: parseInt(newAnnouncement.institutionId) };
            }
            await api.post('/announcements', payload);
            setMessage({ type: 'success', text: 'Annonce publiée avec succès.' });
            setNewAnnouncement({ title: '', content: '', targetRole: 'ALL', targetCycle: '', institutionId: '' });
            setShowModal(false);
            fetchAnnouncements();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la publication.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Supprimer cette annonce ?")) return;
        try {
            await api.delete(`/announcements/${id}`);
            fetchAnnouncements();
            setMessage({ type: 'success', text: 'Annonce supprimée.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        }
    };

    const filteredAnnouncements = announcements.filter(ann => {
        const matchesText = ann.title.toLowerCase().includes(filterText.toLowerCase()) || ann.content.toLowerCase().includes(filterText.toLowerCase());
        const matchesRole = filterRole === 'ALL' || ann.targetRole === filterRole || ann.targetRole === 'ALL';
        return matchesText && matchesRole;
    });

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Communication Officielle</h2>
                    <p className="text-slate-500">Diffusez des messages avec signature automatique de l'administration.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <MessageSquare size={18} /> Historique
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-600 text-white px-8 py-3  font-extrabold flex items-center gap-2 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 hover:scale-[1.02] transition-all"
                    >
                        <Megaphone size={18} /> Nouvelle Annonce
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4  mb-8 font-bold flex items-center justify-between gap-3 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600  ' : 'bg-red-50 text-red-600  '}`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Announcement List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 px-4 gap-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Annonces Actives</h3>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 text-[10px] md:text-xs font-black uppercase tracking-widest shrink-0">{announcements.length} Total</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher..." 
                                    className="pl-8 pr-3 py-2 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm w-full sm:w-48 focus:sm:w-64"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                            </div>
                            <select 
                                className="px-3 py-2 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm cursor-pointer w-full sm:w-auto"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="ALL">Tous les publics</option>
                                <option value="ENSEIGNANT">Enseignants</option>
                                <option value="ELEVE">Élèves & Parents</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {filteredAnnouncements.map((ann) => (
                            <div 
                                key={ann.id} 
                                onClick={() => setSelectedAnnouncement(ann)}
                                className="bg-white p-5 sm:p-8 ] shadow-xl hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 group relative cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4 sm:mb-6">
                                    <div className="flex gap-3 sm:gap-4 items-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600  flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform shadow-sm shadow-emerald-500/10">
                                            <Bell size={24} />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="px-3 py-1 bg-slate-100  text-[10px] font-black uppercase tracking-widest text-slate-400">ADMINISTRATIF</span>
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600  text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-black">
                                                    <Globe size={10} /> {ann.targetRole === 'ALL' ? 'PUBLIC' : ann.targetRole}
                                                </span>
                                            </div>
                                            <h4 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors leading-tight uppercase font-black">{ann.title}</h4>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }} 
                                        className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 whitespace-pre-wrap line-clamp-3 pl-0 sm:pl-6 py-2">
                                    {ann.content}
                                </div>

                                <div className="pt-4 sm:pt-6   flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8  bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signé par</span>
                                                <span className="text-xs font-black text-emerald-700 uppercase">{ann.signature || "L'Administration"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-300" />
                                            <span className="text-xs font-bold text-slate-400">{new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 ">
                                        <Eye size={12} className="text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diffusé sur le réseau</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredAnnouncements.length === 0 && !loading && (
                            <div className="py-20 text-center bg-white ]   ">
                                <Megaphone size={48} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune annonce actuellement</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Compose Sidebar */}
                <div className="space-y-8">

                    <div className="bg-white p-8 ] shadow-xl  ">
                        <h4 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500  animate-pulse"></div>
                            Impact Statistique
                        </h4>
                        <div className="space-y-6">
                            <StatProgress label="Taux de Lecture Académique" percent={88} color="bg-emerald-500" />
                            <StatProgress label="Engagement Parents" percent={64} color="bg-amber-500" />
                            <StatProgress label="Réactivité Élèves" percent={95} color="bg-indigo-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de création d'annonce */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="relative w-full max-w-4xl bg-emerald-900 text-white shadow-2xl overflow-hidden my-8">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 text-emerald-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                        
                        <form onSubmit={handleCreateAnnouncement} className="relative z-10 p-8 md:p-12">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-emerald-500/20 flex items-center justify-center">
                                    <FileText size={28} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight uppercase">Nouvelle Diffusion</h3>
                                    <p className="text-emerald-400/80 text-sm">Rédigez et envoyez une annonce officielle à l'établissement.</p>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                {user?.role === 'PDG' && (
                                    <div>
                                        <label className="text-xs font-black text-emerald-400/80 uppercase tracking-widest block mb-3 px-1">Établissement Cible</label>
                                        <select
                                            className="w-full bg-white/5 py-5 px-6 text-base font-bold text-white outline-none appearance-none cursor-pointer focus:bg-white/10 transition-all border border-transparent focus:border-emerald-500/30"
                                            value={newAnnouncement.institutionId}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, institutionId: e.target.value })}
                                        >
                                            <option className="bg-emerald-900" value="">Tous mes établissements</option>
                                            {institutions.map(inst => (
                                                <option key={inst.id} className="bg-emerald-900" value={inst.id}>{inst.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-black text-emerald-400/80 uppercase tracking-widest block mb-3 px-1">Titre de l'Alerte</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Avis de vacances..."
                                            className="w-full bg-white/5 py-5 px-6 text-base font-bold text-white outline-none focus:bg-white/10 transition-all border border-transparent focus:border-emerald-500/30"
                                            value={newAnnouncement.title}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-emerald-400/80 uppercase tracking-widest block mb-3 px-1">Cible de diffusion</label>
                                        <select
                                            className="w-full bg-white/5 py-5 px-6 text-base font-bold text-white outline-none appearance-none cursor-pointer focus:bg-white/10 transition-all border border-transparent focus:border-emerald-500/30"
                                            value={newAnnouncement.targetRole}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })}
                                        >
                                            <option className="bg-emerald-900" value="ALL">Tout l'établissement</option>
                                            <option className="bg-emerald-900" value="ENSEIGNANT">Enseignants</option>
                                            <option className="bg-emerald-900" value="ELEVE">Élèves & Parents</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-black text-emerald-400/80 uppercase tracking-widest block mb-3 px-1">Corps du message</label>
                                    <textarea
                                        placeholder="Rédigez votre message officiel ici..."
                                        className="w-full bg-white/5 p-6 text-base font-medium text-white placeholder-white/30 outline-none h-[400px] resize-y focus:bg-white/10 transition-all border border-transparent focus:border-emerald-500/30"
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="bg-emerald-800/50 p-5 w-full md:w-auto flex-1 border border-emerald-700/50">
                                    <div className="flex gap-4 items-center">
                                        <Lock size={18} className="text-emerald-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Signature Automatique</p>
                                            <p className="text-sm font-bold text-white/90 italic">
                                                {user?.role === 'PDG' ? 'Fondateur' :
                                                    user?.role === 'DIRECTION' ? "L'Équipe de Direction" :
                                                        user?.role === 'PROVISORIAT' ? "Le Proviseuriat" :
                                                            user?.role === 'SECRETARIAT' ? 'Le Secrétariat Académique' : "L'Administration"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full md:w-auto gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-8 py-5 bg-emerald-800/50 text-white font-black hover:bg-emerald-700 transition-all flex-1 md:flex-none"
                                    >
                                        ANNULER
                                    </button>
                                    <button
                                        disabled={loading || !newAnnouncement.title || !newAnnouncement.content}
                                        className="px-10 py-5 bg-white text-emerald-900 font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group disabled:opacity-50 flex-1 md:flex-none"
                                    >
                                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        DIFFUSER L'ANNONCE
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de lecture d'annonce */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedAnnouncement(null)}>
                    <div 
                        className="relative w-full max-w-3xl bg-white shadow-2xl overflow-hidden rounded-xl flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-end p-4 border-b border-slate-100 shrink-0 relative z-20 bg-white">
                            <button 
                                onClick={() => setSelectedAnnouncement(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest w-fit">
                                    {selectedAnnouncement.targetRole === 'ALL' ? 'PUBLIC' : selectedAnnouncement.targetRole}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                    {new Date(selectedAnnouncement.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-8">
                                {selectedAnnouncement.title}
                            </h2>
                            
                            <div className="text-slate-700 text-base leading-relaxed mb-12 whitespace-pre-wrap">
                                {selectedAnnouncement.content}
                            </div>
                            
                            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-400 rounded-full">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signé par</p>
                                    <p className="text-sm font-black text-slate-800 uppercase">{selectedAnnouncement.signature || "L'Administration"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Sub-components
const StatProgress = ({ label, percent, color }: any) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
            <span className="text-xs font-black text-slate-800">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-50  overflow-hidden">
            <div className={`h-full ${color}  shadow-sm`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default Announcements;
