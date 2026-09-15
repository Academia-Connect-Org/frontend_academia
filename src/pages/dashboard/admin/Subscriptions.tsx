import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, CheckCircle2, ShieldCheck, CreditCard, X, Save, Building, Clock, Calendar, Search, Award, Loader2 } from 'lucide-react';
import api, { getFileUrl } from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface SubscriptionPlan {
    id?: number;
    type: string;
    title: string;
    monthlyPrice: number;
    yearlyPrice: number;
    duration: string | null;
    highlight: string | null;
    isFeatured: boolean;
    features: string[];
    missingFeatures: string[];
    hasReportCards: boolean;
    hasOnlineExams: boolean;
}

const AdminSubscriptions: React.FC = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'INSTITUTIONS' | 'PLANS'>('INSTITUTIONS');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [searchInstQuery, setSearchInstQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<SubscriptionPlan | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Assign Duration Modal State
    const [assignDurationModal, setAssignDurationModal] = useState<any | null>(null);
    const [assignMonthsInput, setAssignMonthsInput] = useState<number>(12);
    const [assignPlanTypeInput, setAssignPlanTypeInput] = useState<string>('PREMIUM');
    const [isAssigning, setIsAssigning] = useState<boolean>(false);
    
    // Popup states
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
    const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'error' | 'success' } | null>(null);

    useEffect(() => {
        fetchPlans();
        fetchInstitutions();
    }, []);

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/public/plans');
            setPlans(res.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInstitutions = async () => {
        try {
            const res = await api.get('/institutions');
            if (Array.isArray(res.data)) {
                setInstitutions(res.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des établissements:', error);
        }
    };

    const handleExecuteAssignDuration = async () => {
        if (!assignDurationModal) return;
        setIsAssigning(true);
        try {
            await api.post('/subscription/admin/assign-duration', null, {
                params: {
                    institutionId: assignDurationModal.id,
                    months: assignMonthsInput,
                    planType: assignPlanTypeInput
                }
            });
            toast.success(`Accès de ${assignMonthsInput} mois attribué avec succès !`);
            setNotification({
                isOpen: true,
                message: `Accès de ${assignMonthsInput} mois attribué avec succès à l'établissement "${assignDurationModal.name}" !`,
                type: 'success'
            });
            setAssignDurationModal(null);
            fetchInstitutions();
        } catch (err: any) {
            console.error('Assign duration error:', err);
            setNotification({
                isOpen: true,
                message: err.response?.data?.message || "Erreur lors de l'attribution de la durée d'accès.",
                type: 'error'
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const handleSave = async (plan: SubscriptionPlan) => {
        try {
            if (isEditing) {
                await api.put(`/admin/plans/${plan.type}`, plan, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await api.post('/admin/plans', plan, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchPlans();
            setIsEditing(null);
            setIsCreating(false);
            setNotification({ isOpen: true, message: "Plan sauvegardé avec succès !", type: "success" });
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setNotification({ isOpen: true, message: "Erreur lors de la sauvegarde du plan.", type: "error" });
        }
    };

    const handleDeleteClick = (type: string) => {
        setConfirmDialog({
            isOpen: true,
            message: "Êtes-vous sûr de vouloir supprimer ce plan ?",
            onConfirm: () => executeDelete(type)
        });
    };

    const executeDelete = async (type: string) => {
        try {
            await api.delete(`/admin/plans/${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPlans();
            setNotification({ isOpen: true, message: "Plan supprimé avec succès !", type: "success" });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setNotification({ isOpen: true, message: "Erreur lors de la suppression du plan.", type: "error" });
        } finally {
            setConfirmDialog(null);
        }
    };

    const filteredInstitutions = institutions.filter(inst =>
        `${inst.name} ${inst.city || ''} ${inst.ceo?.firstName || ''} ${inst.ceo?.lastName || ''}`.toLowerCase().includes(searchInstQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <CreditCard className="text-blue-600" size={32} />
                        Gestion des Abonnements & Accès
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Attribuez des mois d'accès aux établissements et gérez les formules tarifaires.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('INSTITUTIONS')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'INSTITUTIONS'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Building size={16} /> Attribution aux Établissements ({institutions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('PLANS')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'PLANS'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Award size={16} /> Plans Tarifaires ({plans.length})
                    </button>
                </div>
            </header>

            {/* TAB 1: INSTITUTION ACCESS DURATION ASSIGNMENT */}
            {activeTab === 'INSTITUTIONS' && (
                <div className="space-y-6">
                    {/* Control Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchInstQuery}
                                onChange={(e) => setSearchInstQuery(e.target.value)}
                                placeholder="Rechercher une école, un fondateur ou une ville..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            />
                        </div>
                    </div>

                    {/* Institutions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInstitutions.map((inst) => {
                            const isExpired = inst.subscriptionEndDate && new Date(inst.subscriptionEndDate) < new Date();
                            const hasSubscription = inst.subscriptionType && inst.subscriptionType !== 'NONE';

                            return (
                                <div key={inst.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
                                    <div className="space-y-4">
                                        {/* Header & Status */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 overflow-hidden shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {inst.logoUrl ? <img src={getFileUrl(inst.logoUrl)} alt="" className="w-full h-full object-cover" /> : <Building size={24} />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{inst.name}</h3>
                                                    <p className="text-xs text-slate-400">{inst.city || 'Ville N/C'}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 ${!hasSubscription ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : isExpired ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'}`}>
                                                {!hasSubscription ? 'Inactif' : isExpired ? 'Expiré' : 'Actif'}
                                            </span>
                                        </div>

                                        {/* Submitter/CEO Details */}
                                        {inst.ceo && (
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-0.5">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Fondateur / PDG</span>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{inst.ceo.firstName} {inst.ceo.lastName}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{inst.ceo.email}</p>
                                            </div>
                                        )}

                                        {/* Dates Info */}
                                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Offre actuelle :</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">{inst.subscriptionType || 'Aucune'}</span>
                                            </div>
                                            {inst.subscriptionEndDate && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Date d'expiration :</span>
                                                    <span className={`font-mono font-bold ${isExpired ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {new Date(inst.subscriptionEndDate).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => {
                                            setAssignDurationModal(inst);
                                            setAssignMonthsInput(12);
                                            setAssignPlanTypeInput(inst.subscriptionType && inst.subscriptionType !== 'NONE' ? inst.subscriptionType : 'PREMIUM');
                                        }}
                                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        <Clock size={16} /> Attribuer des Mois d'Accès
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 2: PLANS CONFIGURATION */}
            {activeTab === 'PLANS' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all rounded-2xl text-xs"
                        >
                            <PlusCircle size={18} /> Nouveau Plan
                        </button>
                    </div>

                    <AnimatePresence>
                        {(isEditing || isCreating) && (
                            <PlanEditorModal
                                plan={isEditing || {
                                    type: '',
                                    title: '',
                                    monthlyPrice: 0,
                                    yearlyPrice: 0,
                                    duration: null,
                                    highlight: null,
                                    isFeatured: false,
                                    features: [],
                                    missingFeatures: [],
                                    hasReportCards: false,
                                    hasOnlineExams: false
                                }}
                                onSave={handleSave}
                                onClose={() => { setIsEditing(null); setIsCreating(false); }}
                                isNew={isCreating}
                            />
                        )}
                    </AnimatePresence>

                    {isLoading ? (
                        <div className="text-center py-20 text-slate-400 font-medium animate-pulse">Chargement des abonnements...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {plans.map((plan) => (
                                <div key={plan.type} className={`bg-white dark:bg-slate-900 border-2 p-6 flex flex-col relative rounded-3xl ${plan.isFeatured ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                                    {plan.highlight && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-4 py-1 uppercase tracking-widest rounded-full">
                                            {plan.highlight}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.title}</h3>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{plan.type}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditing(plan)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 transition-colors rounded-xl">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(plan.type)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 transition-colors rounded-xl">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                        <div className="text-3xl font-black text-slate-900 dark:text-white">{plan.monthlyPrice.toLocaleString()} FCFA <span className="text-sm font-medium text-slate-400">/ mois</span></div>
                                        <div className="text-sm font-bold text-slate-500 mt-1">{plan.yearlyPrice.toLocaleString()} FCFA / an</div>
                                    </div>

                                    <div className="space-y-3 flex-1 mb-6">
                                        {plan.features.map((feat, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                                                {feat}
                                            </div>
                                        ))}
                                        {plan.missingFeatures.map((feat, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-400 line-through">
                                                <X size={16} className="text-slate-300 shrink-0 mt-0.5" />
                                                {feat}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 mt-auto">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                                            <ShieldCheck size={14} className={plan.hasReportCards ? "text-green-500" : "text-slate-300"} />
                                            Bulletins: {plan.hasReportCards ? "Inclus" : "Non Inclus"}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                                            <ShieldCheck size={14} className={plan.hasOnlineExams ? "text-green-500" : "text-slate-300"} />
                                            Examens en ligne: {plan.hasOnlineExams ? "Inclus" : "Non Inclus"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* POPUP MODAL: ASSIGN DURATION IN MONTHS TO INSTITUTION */}
            <AnimatePresence>
                {assignDurationModal && (
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
                                        <p className="text-xs text-slate-400">{assignDurationModal.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setAssignDurationModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
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
                                        <option value="PREMIUM">PREMIUM (Recommandé - Illimité)</option>
                                        <option value="STANDARD">STANDARD (Bulletins inclus)</option>
                                        <option value="SIMPLE">SIMPLE (Basique)</option>
                                        <option value="FREE_TRIAL">ESSAI GRATUIT</option>
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
                                    onClick={() => setAssignDurationModal(null)}
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

            {/* Notification Modal */}
            <AnimatePresence>
                {notification?.isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle2 size={48} className="text-green-500 mb-4" />
                            ) : (
                                <X size={48} className="text-red-500 mb-4" />
                            )}
                            <h3 className="text-xl font-black text-slate-900 mb-2">
                                {notification.type === 'success' ? 'Succès' : 'Erreur'}
                            </h3>
                            <p className="text-slate-500 font-medium mb-6">{notification.message}</p>
                            <button
                                onClick={() => setNotification(null)}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 font-bold w-full"
                            >
                                Fermer
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Dialog */}
            <AnimatePresence>
                {confirmDialog?.isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-6 max-w-sm w-full shadow-2xl"
                        >
                            <h3 className="text-xl font-black text-slate-900 mb-4">Confirmation</h3>
                            <p className="text-slate-500 font-medium mb-8">{confirmDialog.message}</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setConfirmDialog(null)}
                                    className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDialog.onConfirm}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-bold shadow-lg shadow-red-600/30"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PlanEditorModal = ({ plan, onSave, onClose, isNew }: { plan: SubscriptionPlan, onSave: (p: SubscriptionPlan) => void, onClose: () => void, isNew: boolean }) => {
    const [formData, setFormData] = useState<SubscriptionPlan>({ ...plan });
    const [featureInput, setFeatureInput] = useState("");
    const [missingFeatureInput, setMissingFeatureInput] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl flex flex-col"
            >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-black text-slate-900">{isNew ? 'Créer un plan' : 'Modifier le plan'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                </div>

                <div className="space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Identifiant Unique (Type)</label>
                            <input
                                type="text"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                disabled={!isNew}
                                placeholder="ex: PREMIUM_PLUS"
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 font-bold focus:border-blue-500 focus:outline-none disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nom du Plan</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="ex: Premium Plus"
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 font-bold focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Prix Mensuel (FCFA)</label>
                            <input
                                type="number"
                                value={formData.monthlyPrice}
                                onChange={e => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 font-bold focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Prix Annuel (FCFA)</label>
                            <input
                                type="number"
                                value={formData.yearlyPrice}
                                onChange={e => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })}
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 font-bold focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mise en avant (Badge)</label>
                            <input
                                type="text"
                                value={formData.highlight || ''}
                                onChange={e => setFormData({ ...formData, highlight: e.target.value || null })}
                                placeholder="ex: Recommandé"
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 font-bold focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="w-5 h-5 accent-blue-600"
                            />
                            <label htmlFor="isFeatured" className="font-bold text-slate-700">Plan Populaire (Bordure bleue)</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="hasReportCards"
                                checked={formData.hasReportCards}
                                onChange={e => setFormData({ ...formData, hasReportCards: e.target.checked })}
                                className="w-5 h-5 accent-blue-600"
                            />
                            <label htmlFor="hasReportCards" className="font-bold text-slate-700">Inclure Bulletins</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="hasOnlineExams"
                                checked={formData.hasOnlineExams}
                                onChange={e => setFormData({ ...formData, hasOnlineExams: e.target.checked })}
                                className="w-5 h-5 accent-blue-600"
                            />
                            <label htmlFor="hasOnlineExams" className="font-bold text-slate-700">Inclure Examens en ligne</label>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Fonctionnalités Incluses</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={featureInput}
                                onChange={e => setFeatureInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && featureInput.trim()) {
                                        setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
                                        setFeatureInput('');
                                    }
                                }}
                                placeholder="Ajouter une fonctionnalité..."
                                className="flex-1 bg-slate-50 border-2 border-slate-200 p-2 text-sm focus:border-blue-500 outline-none"
                            />
                            <button
                                onClick={() => {
                                    if (featureInput.trim()) {
                                        setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
                                        setFeatureInput('');
                                    }
                                }}
                                className="bg-slate-200 px-4 font-bold text-sm hover:bg-slate-300"
                            >
                                Ajouter
                            </button>
                        </div>
                        <ul className="space-y-1">
                            {formData.features.map((f, i) => (
                                <li key={i} className="flex justify-between items-center bg-slate-50 p-2 text-sm font-medium">
                                    <span>{f}</span>
                                    <button onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })} className="text-red-500 hover:bg-red-50 p-1"><X size={14} /></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="border-t pt-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Fonctionnalités Manquantes (Barrées)</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={missingFeatureInput}
                                onChange={e => setMissingFeatureInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && missingFeatureInput.trim()) {
                                        setFormData({ ...formData, missingFeatures: [...formData.missingFeatures, missingFeatureInput.trim()] });
                                        setMissingFeatureInput('');
                                    }
                                }}
                                placeholder="Ajouter une fonctionnalité manquante..."
                                className="flex-1 bg-slate-50 border-2 border-slate-200 p-2 text-sm focus:border-blue-500 outline-none"
                            />
                            <button
                                onClick={() => {
                                    if (missingFeatureInput.trim()) {
                                        setFormData({ ...formData, missingFeatures: [...formData.missingFeatures, missingFeatureInput.trim()] });
                                        setMissingFeatureInput('');
                                    }
                                }}
                                className="bg-slate-200 px-4 font-bold text-sm hover:bg-slate-300"
                            >
                                Ajouter
                            </button>
                        </div>
                        <ul className="space-y-1">
                            {formData.missingFeatures.map((f, i) => (
                                <li key={i} className="flex justify-between items-center bg-slate-50 p-2 text-sm font-medium">
                                    <span>{f}</span>
                                    <button onClick={() => setFormData({ ...formData, missingFeatures: formData.missingFeatures.filter((_, idx) => idx !== i) })} className="text-red-500 hover:bg-red-50 p-1"><X size={14} /></button>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                <div className="mt-8 pt-4 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100">Annuler</button>
                    <button
                        onClick={() => onSave(formData)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                        <Save size={18} />
                        Sauvegarder
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminSubscriptions;
