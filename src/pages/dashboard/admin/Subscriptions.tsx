import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, CheckCircle2, ShieldCheck, CreditCard, X, Save } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

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
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState<SubscriptionPlan | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Popup states
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
    const [notification, setNotification] = useState<{ isOpen: boolean; message: string; type: 'error' | 'success' } | null>(null);

    useEffect(() => {
        fetchPlans();
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

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <CreditCard className="text-blue-600" size={32} />
                        Gestion des Abonnements
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Créez et modifiez les offres proposées aux PDG.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                    <PlusCircle size={20} />
                    Nouveau Plan
                </button>
            </header>

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
                        <div key={plan.type} className={`bg-white border-2 p-6 flex flex-col relative ${plan.isFeatured ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-slate-100 shadow-sm'}`}>
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-4 py-1 uppercase tracking-widest">
                                    {plan.highlight}
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{plan.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{plan.type}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(plan)} className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(plan.type)} className="p-2 bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6 pb-6 border-b border-slate-100">
                                <div className="text-3xl font-black text-slate-900">{plan.monthlyPrice.toLocaleString()} FCFA <span className="text-sm font-medium text-slate-400">/ mois</span></div>
                                <div className="text-sm font-bold text-slate-500 mt-1">{plan.yearlyPrice.toLocaleString()} FCFA / an</div>
                            </div>

                            <div className="space-y-3 flex-1 mb-6">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
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
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2">
                                    <ShieldCheck size={14} className={plan.hasReportCards ? "text-green-500" : "text-slate-300"} />
                                    Bulletins: {plan.hasReportCards ? "Inclus" : "Non Inclus"}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2">
                                    <ShieldCheck size={14} className={plan.hasOnlineExams ? "text-green-500" : "text-slate-300"} />
                                    Examens en ligne: {plan.hasOnlineExams ? "Inclus" : "Non Inclus"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
