import React, { useEffect, useState } from 'react';
import {
    School,
    CheckCircle,
    Clock,
    Search,
    MoreVertical,
    Activity,
    Mail,
    Crown,
    Loader2,
    Trash2,
    Calendar,
    Eye,
    Building,
    User,
    GraduationCap,
    Users,
    Layers,
    Phone,
    MapPin,
    ShieldCheck,
    CheckCircle2,
    X,
    Sparkles
} from 'lucide-react';
import api, { getFileUrl } from '../../api/axios';
import PlansManager from '../../components/dashboard/admin/PlansManager';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'institutions' | 'subscribers' | 'plans'>('institutions');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteInstId, setDeleteInstId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal States
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedDetailInst, setSelectedDetailInst] = useState<any | null>(null);
    const [instStats, setInstStats] = useState<any | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    const [assignDurationInst, setAssignDurationInst] = useState<any | null>(null);
    const [assignMonthsInput, setAssignMonthsInput] = useState<number>(12);
    const [assignPlanTypeInput, setAssignPlanTypeInput] = useState<string>('PREMIUM');
    const [isAssigning, setIsAssigning] = useState<boolean>(false);

    useEffect(() => {
        fetchInstitutions();
        fetchSubscribers();
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/public/plans');
            setPlans(res.data || []);
        } catch (err) {
            console.error("Erreur lors de la récupération des plans d'abonnement:", err);
        }
    };

    const fetchInstitutions = async () => {
        try {
            const res = await api.get('/institutions');
            setInstitutions(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscribers = async () => {
        try {
            const res = await api.get('/newsletter/subscribers');
            setSubscribers(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenDetailModal = async (inst: any) => {
        setSelectedDetailInst(inst);
        setInstStats(null);
        setLoadingStats(true);
        try {
            const statsRes = await api.get(`/institutions/${inst.id}/stats`);
            setInstStats(statsRes.data);
        } catch (err) {
            console.error("Erreur chargement des stats de l'établissement:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleExecuteAssignDuration = async () => {
        if (!assignDurationInst) return;
        setIsAssigning(true);
        try {
            await api.post('/subscription/admin/assign-duration', null, {
                params: {
                    institutionId: assignDurationInst.id,
                    months: assignMonthsInput,
                    planType: assignPlanTypeInput
                }
            });
            toast.success(`Accès de ${assignMonthsInput} mois attribué avec succès à ${assignDurationInst.name} !`);
            setAssignDurationInst(null);
            fetchInstitutions();
            if (selectedDetailInst && selectedDetailInst.id === assignDurationInst.id) {
                // Refresh detail modal if open
                const res = await api.get('/institutions');
                const updated = (res.data || []).find((i: any) => i.id === assignDurationInst.id);
                if (updated) setSelectedDetailInst(updated);
            }
        } catch (err: any) {
            console.error('Assign duration error:', err);
            toast.error(err.response?.data?.message || "Erreur lors de l'attribution de la durée d'accès.");
        } finally {
            setIsAssigning(false);
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await api.patch(`/institutions/${id}/activate`);
            fetchInstitutions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeactivate = async (id: number) => {
        try {
            await api.patch(`/institutions/${id}/deactivate`);
            fetchInstitutions();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePermanentDelete = async () => {
        if (!deleteInstId) return;
        setIsDeleting(true);
        try {
            await api.delete(`/institutions/${deleteInstId}/permanent`);
            setDeleteInstId(null);
            fetchInstitutions();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression définitive de l'établissement.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredInstitutions = institutions.filter(inst =>
        inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.uaiNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${inst.ceo?.firstName || ''} ${inst.ceo?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = institutions.filter(i => i.active).length;
    const pendingCount = institutions.filter(i => !i.active).length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tableau de bord Administrateur</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Gérez la liste des établissements, leurs détails complets et leurs durées d'accès.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, UAI ou fondateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white pl-12 pr-6 py-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none w-full md:w-[350px] font-bold text-sm shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar pb-1">
                <button
                    onClick={() => setActiveTab('institutions')}
                    className={`whitespace-nowrap shrink-0 pb-4 px-3 font-bold transition-all border-b-2 flex items-center gap-2 text-sm ${activeTab === 'institutions' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <School size={18} /> Établissements ({institutions.length})
                </button>
                <button
                    onClick={() => setActiveTab('subscribers')}
                    className={`whitespace-nowrap shrink-0 pb-4 px-3 font-bold transition-all border-b-2 flex items-center gap-2 text-sm ${activeTab === 'subscribers' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Mail size={18} /> Abonnés Newsletter
                </button>
                <button
                    onClick={() => setActiveTab('plans')}
                    className={`whitespace-nowrap shrink-0 pb-4 px-3 font-bold transition-all border-b-2 flex items-center gap-2 text-sm ${activeTab === 'plans' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Crown size={18} /> Plans d'Abonnement
                </button>
            </div>

            {activeTab === 'institutions' && (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:scale-[1.01] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                <School size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total Établissements</p>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{institutions.length || 0}</h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:scale-[1.01] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                                <CheckCircle size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Écoles Actives</p>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{activeCount || 0}</h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:scale-[1.01] transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                                <Clock size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">En attente / Inactives</p>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{pendingCount || 0}</h4>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Chargement des données...</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Établissement</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Type</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">CEO / PDG</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Offre & Expiration</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Statut</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                        {filteredInstitutions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-16 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <Activity size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                                                        <p className="text-slate-500 dark:text-slate-400 font-bold">Aucun établissement trouvé</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredInstitutions.map((inst) => {
                                                const isExpired = inst.subscriptionEndDate && new Date(inst.subscriptionEndDate) < new Date();
                                                const hasSub = inst.subscriptionType && inst.subscriptionType !== 'NONE';

                                                return (
                                                    <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center shrink-0">
                                                                    {inst.logoUrl ? (
                                                                        <img src={getFileUrl(inst.logoUrl)} alt={inst.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <School size={20} className="text-slate-400 dark:text-slate-500" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">{inst.name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{inst.city ? `${inst.city} - ` : ''}{inst.address || 'Adresse N/C'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${inst.type === 'ECOLE' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' : 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400'}`}>
                                                                {inst.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-[10px] uppercase shrink-0">
                                                                    {inst.ceo?.firstName?.[0]}{inst.ceo?.lastName?.[0]}
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                                                        {inst.ceo ? `${inst.ceo.firstName || ''} ${inst.ceo.lastName || ''}`.trim() : 'Non assigné'}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 block">{inst.ceo?.email || ''}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="space-y-0.5">
                                                                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase">
                                                                    {inst.subscriptionType || 'Aucune'}
                                                                </span>
                                                                {inst.subscriptionEndDate && (
                                                                    <p className={`text-[11px] font-mono font-bold ${isExpired ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                        Expire le {new Date(inst.subscriptionEndDate).toLocaleDateString('fr-FR')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${!hasSub ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : isExpired ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${!hasSub ? 'bg-slate-400' : isExpired ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                                                {!hasSub ? 'Inactif' : isExpired ? 'Expiré' : 'Actif'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {/* Full details modal button */}
                                                                <button
                                                                    onClick={() => handleOpenDetailModal(inst)}
                                                                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                                                    title="Voir les détails complets"
                                                                >
                                                                    <Eye size={15} /> Détails
                                                                </button>

                                                                {/* Assign duration months button */}
                                                                <button
                                                                    onClick={() => {
                                                                        setAssignDurationInst(inst);
                                                                        setAssignMonthsInput(12);
                                                                        setAssignPlanTypeInput(inst.subscriptionType && inst.subscriptionType !== 'NONE' ? inst.subscriptionType : 'PREMIUM');
                                                                    }}
                                                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                                                                    title="Attribuer des mois d'accès"
                                                                >
                                                                    <Clock size={15} /> Accès
                                                                </button>

                                                                {/* Toggle status */}
                                                                {inst.active ? (
                                                                    <button
                                                                        onClick={() => handleDeactivate(inst.id)}
                                                                        className="p-2 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                                        title="Désactiver l'école"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleActivate(inst.id)}
                                                                        className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                        title="Activer l'école"
                                                                    >
                                                                        <CheckCircle2 size={16} />
                                                                    </button>
                                                                )}

                                                                {/* Delete */}
                                                                <button
                                                                    onClick={() => setDeleteInstId(inst.id)}
                                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                                                                    title="Supprimer définitivement"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'subscribers' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"><Mail size={20} className="text-blue-500" /> Liste des Abonnés</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Personnes ayant souscrit à la newsletter.</p>
                        </div>
                        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-xl">
                            {subscribers.length || 0} Abonné(s)
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Email</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Date d'inscription</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <Mail size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                                                <p className="text-slate-500 dark:text-slate-400 font-bold">Aucun abonné pour le moment</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub: any) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-8 py-6 text-sm font-bold text-slate-500 dark:text-slate-400">#{sub.id}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-900 dark:text-white">{sub.email}</td>
                                            <td className="px-8 py-6 text-sm font-medium text-slate-500 dark:text-slate-400">{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString('fr-FR') : 'N/A'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'plans' && (
                <PlansManager />
            )}

            {/* FULL DETAILS POPUP MODAL FOR INSTITUTION */}
            <AnimatePresence>
                {selectedDetailInst && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 overflow-hidden flex items-center justify-center text-blue-600 shrink-0">
                                        {selectedDetailInst.logoUrl ? (
                                            <img src={getFileUrl(selectedDetailInst.logoUrl)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedDetailInst.name}</h3>
                                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">
                                                {selectedDetailInst.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {selectedDetailInst.city ? `${selectedDetailInst.city}, ` : ''}{selectedDetailInst.country || 'Pays non spécifié'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedDetailInst(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Detailed Content */}
                            <div className="space-y-6">
                                {/* General Specs */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Code UAI</span>
                                        <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">{selectedDetailInst.uaiNumber || 'Non renseigné'}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Téléphone</span>
                                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{selectedDetailInst.phone || 'N/C'}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Officiel</span>
                                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate block">{selectedDetailInst.email || 'N/C'}</span>
                                    </div>
                                </div>

                                {/* Description & Motto */}
                                {(selectedDetailInst.description || selectedDetailInst.motto) && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                                        {selectedDetailInst.motto && (
                                            <p className="font-bold text-blue-600 dark:text-blue-400 italic">« {selectedDetailInst.motto} »</p>
                                        )}
                                        {selectedDetailInst.description && (
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedDetailInst.description}</p>
                                        )}
                                    </div>
                                )}

                                {/* Founder CEO Box */}
                                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Fondateur / PDG de l'établissement</span>
                                    {selectedDetailInst.ceo ? (
                                        <div className="flex items-center justify-between text-xs">
                                            <div>
                                                <h5 className="font-bold text-slate-900 dark:text-white text-sm">{selectedDetailInst.ceo.firstName} {selectedDetailInst.ceo.lastName}</h5>
                                                <p className="text-slate-500 dark:text-slate-400">{selectedDetailInst.ceo.email} {selectedDetailInst.ceo.phone ? `• ${selectedDetailInst.ceo.phone}` : ''}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase">PDG</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Aucun fondateur lié pour le moment.</p>
                                    )}
                                </div>

                                {/* User Statistics Counts */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Membres et Effectifs de l'Équipement</h4>
                                    {loadingStats ? (
                                        <div className="p-4 text-center text-slate-400 text-xs font-bold animate-pulse">Chargement des effectifs...</div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center">
                                                <GraduationCap size={20} className="text-emerald-600 mx-auto mb-1" />
                                                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{instStats?.studentCount || 0}</span>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Élèves</p>
                                            </div>
                                            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-100 dark:border-sky-900/40 text-center">
                                                <Users size={20} className="text-sky-600 mx-auto mb-1" />
                                                <span className="text-lg font-black text-sky-700 dark:text-sky-300">{instStats?.teacherCount || 0}</span>
                                                <p className="text-[10px] font-bold text-sky-600 uppercase">Enseignants</p>
                                            </div>
                                            <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-100 dark:border-violet-900/40 text-center">
                                                <User size={20} className="text-violet-600 mx-auto mb-1" />
                                                <span className="text-lg font-black text-violet-700 dark:text-violet-300">{instStats?.staffCount || 0}</span>
                                                <p className="text-[10px] font-bold text-violet-600 uppercase">Personnel</p>
                                            </div>
                                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900/40 text-center">
                                                <Layers size={20} className="text-amber-600 mx-auto mb-1" />
                                                <span className="text-lg font-black text-amber-700 dark:text-amber-300">{instStats?.classCount || 0}</span>
                                                <p className="text-[10px] font-bold text-amber-600 uppercase">Classes</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Subscription & Expiration status */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-400">Statut de l'Abonnement</p>
                                        <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                                            Offre : <span className="text-blue-600 dark:text-blue-400 font-black">{selectedDetailInst.subscriptionType || 'Aucune'}</span>
                                        </h5>
                                        {selectedDetailInst.subscriptionEndDate && (
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                                                Date d'expiration : {new Date(selectedDetailInst.subscriptionEndDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setAssignDurationInst(selectedDetailInst);
                                            setAssignMonthsInput(12);
                                            setAssignPlanTypeInput(selectedDetailInst.subscriptionType && selectedDetailInst.subscriptionType !== 'NONE' ? selectedDetailInst.subscriptionType : 'PREMIUM');
                                        }}
                                        className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                                    >
                                        <Clock size={16} /> Attribuer des Mois d'Accès
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setSelectedDetailInst(null)}
                                    className="py-2.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ASSIGN DURATION POPUP MODAL */}
            <AnimatePresence>
                {assignDurationInst && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Attribuer la Durée d'Accès</h3>
                                        <p className="text-xs text-slate-400">{assignDurationInst.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setAssignDurationInst(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Formule / Plan Select */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Formule d'Abonnement</label>
                                    <select
                                        value={assignPlanTypeInput}
                                        onChange={(e) => setAssignPlanTypeInput(e.target.value)}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    >
                                        {plans.length > 0 ? (
                                            plans.map((p) => (
                                                <option key={p.type} value={p.type}>
                                                    {p.title} ({p.type}) {p.monthlyPrice > 0 ? `- ${p.monthlyPrice.toLocaleString('fr-FR')} FCFA/mois` : '- Gratuit'}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="PREMIUM">PREMIUM (Recommandé - Illimité)</option>
                                                <option value="STANDARD">STANDARD (Bulletins inclus)</option>
                                                <option value="SIMPLE">SIMPLE (Basique)</option>
                                                <option value="FREE_TRIAL">ESSAI GRATUIT</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                {/* Number of Months Input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre de Mois d'Accès</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={assignMonthsInput}
                                        onChange={(e) => setAssignMonthsInput(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black font-mono text-slate-900 dark:text-white outline-none"
                                    />

                                    {/* Presets */}
                                    <div className="flex gap-2 pt-2 flex-wrap">
                                        {[3, 6, 12, 24, 36].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setAssignMonthsInput(m)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${assignMonthsInput === m ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                                            >
                                                {m} mois {m >= 12 ? `(${m / 12} an${m > 12 ? 's' : ''})` : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Calculated Dates Preview */}
                                <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 text-xs space-y-1">
                                    <div className="flex justify-between text-blue-900 dark:text-blue-200 font-semibold">
                                        <span>Date de début (Aujourd'hui) :</span>
                                        <span className="font-mono font-bold">{new Date().toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex justify-between text-blue-900 dark:text-blue-200 font-bold">
                                        <span>Nouvelle date d'expiration :</span>
                                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                            {new Date(new Date().setMonth(new Date().getMonth() + assignMonthsInput)).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAssignDurationInst(null)}
                                    className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    disabled={isAssigning}
                                    onClick={handleExecuteAssignDuration}
                                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isAssigning ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                    Valider l'Accès ({assignMonthsInput} Mois)
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal suppression définitive école */}
            {deleteInstId && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Suppression Définitive</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Voulez-vous vraiment supprimer définitivement cet établissement ? Cette opération est irréversible.</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeleteInstId(null)}
                                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handlePermanentDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-2xl font-black text-xs bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
