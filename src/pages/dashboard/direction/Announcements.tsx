import React, { useState, useEffect } from 'react';
import {
    Bell,
    Megaphone,
    Send,
    Search,
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
    Trash2,
    Building2
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

    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('ALL');

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        targetRole: 'ALL',
        targetCycle: '',
        institutionId: ''
    });

    useEffect(() => {
        if (user?.role === 'PDG' && user?.id) {
            fetchInstitutions();
        }
    }, [user?.id]);

    useEffect(() => {
        fetchAnnouncements();
    }, [user?.institution?.id, user?.id, selectedInstitutionId]);

    const fetchInstitutions = async () => {
        try {
            const res = await api.get(`/institutions/ceo/${user?.id}`);
            setInstitutions(res.data || []);
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
                if (selectedInstitutionId && selectedInstitutionId !== 'ALL') {
                    params.params.institutionId = selectedInstitutionId;
                }
            } else if (user?.institution?.id) {
                params.params.institutionId = user.institution.id;
            }
            const res = await api.get('/announcements', params);
            setAnnouncements(res.data || []);
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
            } else if (user?.institution?.id) {
                payload.institution = { id: user.institution.id };
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Communication Officielle</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Diffusez des messages avec signature automatique de l'administration.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <MessageSquare size={16} /> Historique
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto"
                    >
                        <Megaphone size={16} /> Nouvelle Annonce
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl font-bold text-xs flex items-center justify-between gap-3 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={16} /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Announcement List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Annonces Actives</h3>
                            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase">{announcements.length} Total</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {user?.role === 'PDG' && (
                                <select
                                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    value={selectedInstitutionId}
                                    onChange={(e) => setSelectedInstitutionId(e.target.value)}
                                >
                                    <option value="ALL">Tous mes établissements</option>
                                    {institutions.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                    ))}
                                </select>
                            )}
                            <div className="relative flex-1 sm:w-48">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="ALL">Tous les publics</option>
                                <option value="ENSEIGNANT">Enseignants</option>
                                <option value="ELEVE">Élèves & Parents</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredAnnouncements.map((ann) => (
                            <div
                                key={ann.id}
                                onClick={() => setSelectedAnnouncement(ann)}
                                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3 items-center min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                            <Bell size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold rounded-md uppercase">ADMINISTRATIF</span>
                                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold rounded-md uppercase flex items-center gap-1">
                                                    <Globe size={10} /> {ann.targetRole === 'ALL' ? 'PUBLIC' : ann.targetRole}
                                                </span>
                                                {ann.institution?.name && (
                                                    <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-[9px] font-bold rounded-md uppercase flex items-center gap-1">
                                                        <Building2 size={10} /> {ann.institution.name}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate uppercase">{ann.title}</h4>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-4 line-clamp-3">
                                    {ann.content}
                                </p>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <User size={12} />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Émis par: </span>
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    {ann.signature || "L'Administration"} {ann.institution?.name ? `(${ann.institution.name})` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar size={14} />
                                            <span className="text-xs font-medium">{new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                        <Eye size={12} />
                                        <span>Diffusé</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredAnnouncements.length === 0 && !loading && (
                            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                <Megaphone size={40} className="mx-auto text-slate-400 mb-3" />
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Aucune annonce actuellement</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Impact Statistique
                        </h4>
                        <div className="space-y-4">
                            <StatProgress label="Taux de Lecture Académique" percent={0} color="bg-emerald-500" />
                            <StatProgress label="Engagement Parents" percent={0} color="bg-amber-500" />
                            <StatProgress label="Réactivité Élèves" percent={0} color="bg-indigo-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de création d'annonce */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
                    <div className="relative w-full max-w-2xl bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden my-8 p-6">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white uppercase">Nouvelle Diffusion</h3>
                                    <p className="text-xs text-slate-400">Rédigez et envoyez une annonce officielle.</p>
                                </div>
                            </div>

                            {user?.role === 'PDG' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Établissement Cible</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
                                        value={newAnnouncement.institutionId}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, institutionId: e.target.value })}
                                    >
                                        <option value="">Tous mes établissements</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Titre de l'Alerte</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Avis de vacances..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Cible de diffusion</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none"
                                        value={newAnnouncement.targetRole}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })}
                                    >
                                        <option value="ALL">Tout l'établissement</option>
                                        <option value="ENSEIGNANT">Enseignants</option>
                                        <option value="ELEVE">Élèves & Parents</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-300">Corps du message</label>
                                <textarea
                                    placeholder="Rédigez votre message officiel ici..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs font-medium text-white placeholder-slate-500 outline-none h-40 resize-y focus:ring-2 focus:ring-emerald-500/20"
                                    value={newAnnouncement.content}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-3 border-t border-slate-800">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Lock size={16} className="text-emerald-400" />
                                    <span className="text-[11px] font-medium">
                                        Signature: <strong className="text-white">{user?.role === 'PDG' ? 'Le Fondateur' : user?.role === 'DIRECTION' ? "La Direction" : "L'Administration"}</strong>
                                    </span>
                                </div>

                                <div className="flex w-full sm:w-auto gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        disabled={loading || !newAnnouncement.title || !newAnnouncement.content}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                                    >
                                        <Send size={14} /> DIFFUSER L'ANNONCE
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de lecture d'annonce */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedAnnouncement(null)}>
                    <div
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md uppercase">
                                    {selectedAnnouncement.targetRole === 'ALL' ? 'PUBLIC' : selectedAnnouncement.targetRole}
                                </span>
                                {selectedAnnouncement.institution?.name && (
                                    <span className="px-2.5 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-[10px] font-bold rounded-md uppercase flex items-center gap-1">
                                        <Building2 size={12} /> {selectedAnnouncement.institution.name}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedAnnouncement(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                                {selectedAnnouncement.title}
                            </h2>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(selectedAnnouncement.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>

                            <div className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
                                {selectedAnnouncement.content}
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <User size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Émis par</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                                        {selectedAnnouncement.signature || "L'Administration"}
                                        {selectedAnnouncement.institution?.name ? ` — ${selectedAnnouncement.institution.name}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatProgress = ({ label, percent, color }: any) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percent}%` }} />
        </div>
    </div>
);

export default Announcements;
