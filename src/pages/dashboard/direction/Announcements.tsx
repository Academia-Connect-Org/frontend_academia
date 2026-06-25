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
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        targetRole: 'ALL',
        targetCycle: ''
    });

    useEffect(() => {
        fetchAnnouncements();
    }, [user?.institution?.id]);

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
            await api.post('/announcements', newAnnouncement);
            setMessage({ type: 'success', text: 'Annonce publiée avec succès.' });
            setNewAnnouncement({ title: '', content: '', targetRole: 'ALL', targetCycle: '' });
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
                    <button className="bg-emerald-600 text-white px-8 py-3  font-extrabold flex items-center gap-2 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 hover:scale-[1.02] transition-all">
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
                    <div className="flex items-center justify-between mb-4 px-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Annonces Actives</h3>
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1  text-xs font-black uppercase tracking-widest shrink-0">{announcements.length} Total</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2.5 bg-white    text-slate-400 hover:text-emerald-600 transition-all shadow-sm"><Search size={18} /></button>
                            <button className="p-2.5 bg-white    text-slate-400 hover:text-emerald-600 transition-all shadow-sm"><Filter size={18} /></button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {announcements.map((ann) => (
                            <div key={ann.id} className="bg-white p-8 ] shadow-xl   hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 group relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600  flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform shadow-sm shadow-emerald-500/10">
                                            <Bell size={24} />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="px-3 py-1 bg-slate-100  text-[10px] font-black uppercase tracking-widest text-slate-400">ADMINISTRATIF</span>
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600  text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-black">
                                                    <Globe size={10} /> {ann.targetRole === 'ALL' ? 'PUBLIC' : ann.targetRole}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors leading-tight uppercase font-black">{ann.title}</h4>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(ann.id)} className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="text-slate-600 text-sm leading-relaxed mb-8 whitespace-pre-wrap   pl-6 py-2">
                                    {ann.content}
                                </div>

                                <div className="pt-6   flex flex-col md:flex-row md:items-center justify-between gap-6">
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

                        {announcements.length === 0 && !loading && (
                            <div className="py-20 text-center bg-white ]   ">
                                <Megaphone size={48} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune annonce actuellement</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Compose Sidebar */}
                <div className="space-y-8">
                    <form onSubmit={handleCreateAnnouncement} className="bg-emerald-900 p-8 ] text-white overflow-hidden relative shadow-2xl  ">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20  blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-emerald-500/20  flex items-center justify-center">
                                    <FileText size={20} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight uppercase">Diffusion</h3>
                            </div>

                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-2 px-1">Titre de l'Alerte</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Avis de vacances..."
                                        className="w-full bg-white/5    py-4 px-5 text-sm font-bold text-white outline-none focus:bg-white/10 focus: transition-all"
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-2 px-1">Cible de diffusion</label>
                                    <select
                                        className="w-full bg-white/5    py-4 px-5 text-sm font-bold text-white outline-none appearance-none cursor-pointer focus:bg-white/10"
                                        value={newAnnouncement.targetRole}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })}
                                    >
                                        <option className="bg-emerald-900" value="ALL">Tout l'établissement</option>
                                        <option className="bg-emerald-900" value="ENSEIGNANT">Enseignants</option>
                                        <option className="bg-emerald-900" value="ELEVE">Élèves & Parents</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-2 px-1">Corps du message</label>
                                    <textarea
                                        placeholder="Rédigez votre message officiel ici..."
                                        className="w-full bg-white/5    p-6 text-sm font-medium text-white placeholder-white/20 outline-none h-48 resize-none focus:bg-white/10 focus: transition-all scrollbar-hide"
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="bg-emerald-800/50  p-4 mb-8  ">
                                <div className="flex gap-3">
                                    <Lock size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Signature Automatique</p>
                                        <p className="text-xs font-bold text-white/80 italic">
                                            {user?.role === 'PDG' ? 'La Direction Générale' :
                                                user?.role === 'DIRECTION' ? "L'Équipe de Direction" :
                                                    user?.role === 'PROVISORIAT' ? "Le Proviseuriat" :
                                                        user?.role === 'SECRETARIAT' ? 'Le Secrétariat Académique' : "L'Administration"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading || !newAnnouncement.title || !newAnnouncement.content}
                                className="w-full py-5 bg-white text-emerald-900  font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group disabled:opacity-50"
                            >
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                DIFFUSER L'ANNONCE
                            </button>
                        </div>
                    </form>

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
