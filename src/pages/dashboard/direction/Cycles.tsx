import React, { useState, useEffect } from 'react';
import { Layers, Plus, X, AlertCircle, CheckCircle2, Users, GraduationCap, BookOpen, UserCheck, Trash2 } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';

const CYCLE_COLORS = [
    { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-600' },
    { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', accent: 'bg-purple-600' },
    { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', accent: 'bg-emerald-600' },
    { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400', accent: 'bg-orange-600' },
    { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-600 dark:text-pink-400', accent: 'bg-pink-600' },
    { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', accent: 'bg-indigo-600' },
];

interface CyclesProps {
    institutionId?: number;
    hideLayout?: boolean;
}

const Cycles: React.FC<CyclesProps> = ({ institutionId, hideLayout = false }) => {
    const { user } = useAuth();
    const role = user?.role || 'Direction';
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [institutionType, setInstitutionType] = useState<string | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [promptDialog, setPromptDialog] = useState<{ isOpen: boolean, title: string, placeholder: string, onSubmit: (val: string) => void }>({ isOpen: false, title: '', placeholder: '', onSubmit: () => { } });
    const [promptValue, setPromptValue] = useState('');

    useEffect(() => {
        fetchData();
        if (institutionId) {
            fetchInstitutionType();
        } else if (user?.institution?.id) {
            fetchInstitutionType(user.institution.id);
        }
    }, [institutionId, user?.institution?.id]);

    const fetchInstitutionType = async (id?: number) => {
        const targetId = id || institutionId;
        if (!targetId) return;
        try {
            const res = await api.get(`/institutions/${targetId}`);
            setInstitutionType(res.data.type);
        } catch (error) {
            console.error("Error fetching institution type", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        const targetId = institutionId || user?.institution?.id;
        if (!targetId) {
            setLoading(false);
            return;
        }

        try {
            const cyclesRes = await api.get('/cycles/stats', { params: { institutionId: targetId } });
            setCycles(cyclesRes.data || []);
        } catch (error) {
            try {
                const cyclesRes = await api.get('/cycles', { params: { institutionId: targetId } });
                setCycles(cyclesRes.data || []);
            } catch (err) {
                console.error("Error fetching cycles", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddCyclePrompt = () => {
        setPromptValue('');
        setPromptDialog({
            isOpen: true,
            title: "Nom du nouveau cycle",
            placeholder: "ex: Primaire",
            onSubmit: async (name) => {
                if (!name || name.trim() === "") return;
                const normalizedName = name.trim().toLowerCase();
                const targetId = institutionId || user?.institution?.id;

                if (institutionType === 'ECOLE') {
                    if (normalizedName.includes('collège') || normalizedName.includes('college') ||
                        normalizedName.includes('lycée') || normalizedName.includes('lycee')) {
                        setMessage({ type: 'error', text: 'Une ÉCOLE ne peut pas avoir de cycle Collège ou Lycée.' });
                        return;
                    }
                } else if (institutionType === 'ETABLISSEMENT') {
                    if (normalizedName.includes('jardin') || normalizedName.includes('primaire')) {
                        setMessage({ type: 'error', text: 'Un ÉTABLISSEMENT ne peut pas avoir de cycle Jardin ou Primaire.' });
                        return;
                    }
                }

                try {
                    await api.post('/cycles', {
                        name: name.trim(),
                        institution: targetId ? { id: targetId } : null
                    });
                    fetchData();
                    setMessage({ type: 'success', text: 'Cycle ajouté avec succès.' });
                } catch (error) {
                    setMessage({ type: 'error', text: 'Erreur lors de la création du cycle.' });
                }
            }
        });
    };

    const handleDeleteCycle = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: "Supprimer ce cycle ?",
            message: "Cette action est irréversible et pourrait affecter les classes associées.",
            onConfirm: async () => {
                try {
                    await api.delete(`/cycles/${id}`);
                    fetchData();
                    setMessage({ type: 'success', text: 'Cycle supprimé avec succès.' });
                } catch (error) {
                    setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
                }
            }
        });
    };

    const canEdit = role === 'DIRECTION' || role === 'PROVISORIAT' || role === 'PDG';

    const content = (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestion des Cycles</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consultez et gérez les cycles académiques de votre établissement.</p>
                </div>
                {canEdit && (
                    <button onClick={handleAddCyclePrompt} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto">
                        <Plus size={16} /> Nouveau Cycle
                    </button>
                )}
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

            {loading && cycles.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des cycles...</p>
                </div>
            ) : cycles.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Layers size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Aucun cycle enregistré</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                        {institutionType === 'ECOLE'
                            ? "Commencez par ajouter les cycles (Jardin, Primaire) de votre école."
                            : "Commencez par ajouter les cycles (Collège, Lycée) de votre établissement."}
                    </p>
                    {canEdit && (
                        <button onClick={handleAddCyclePrompt} className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">Ajouter un cycle maintenant</button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {cycles.map((cycle, index) => {
                        const color = CYCLE_COLORS[index % CYCLE_COLORS.length];
                        return (
                            <motion.div
                                key={cycle.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all relative"
                            >
                                <div className={`h-2 w-full ${color.accent}`} />
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`w-12 h-12 ${color.bg} ${color.text} rounded-xl flex items-center justify-center shrink-0`}>
                                            <Layers size={24} />
                                        </div>
                                        {canEdit && (
                                            <button
                                                onClick={() => handleDeleteCycle(cycle.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 uppercase truncate" title={cycle.name}>{cycle.name}</h3>

                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2 mb-2">
                                                <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Effectif Élèves</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <span className="text-xl font-bold text-slate-900 dark:text-white">{cycle.studentCount || 0}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total</p>
                                                </div>
                                                <div>
                                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{cycle.boysCount || 0}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Garçons</p>
                                                </div>
                                                <div>
                                                    <span className="text-xl font-bold text-pink-600 dark:text-pink-400">{cycle.girlsCount || 0}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Filles</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserCheck size={16} className="text-blue-600 dark:text-blue-400" />
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Corps Enseignant</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <span className="text-xl font-bold text-slate-900 dark:text-white">{cycle.teacherCount || 0}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total</p>
                                                </div>
                                                <div>
                                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{cycle.maleTeachersCount || 0}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">H</p>
                                                </div>
                                                <div>
                                                    <span className="text-xl font-bold text-pink-600 dark:text-pink-400">{cycle.femaleTeachersCount || 0}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">F</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex flex-col justify-between">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Users size={14} className="text-slate-400" />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Classes</span>
                                                </div>
                                                <span className="text-2xl font-bold">{cycle.classCount || 0}</span>
                                            </div>
                                            <div className="p-4 rounded-xl bg-blue-600 text-white flex flex-col justify-between">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <BookOpen size={14} className="text-blue-200" />
                                                    <span className="text-[9px] font-bold text-blue-200 uppercase">Matières</span>
                                                </div>
                                                <span className="text-2xl font-bold">{cycle.subjectCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl"
                    >
                        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{confirmDialog.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{confirmDialog.message}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 py-2 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Annuler</button>
                            <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, isOpen: false }); }} className="flex-1 py-2 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md transition-all">Supprimer</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Prompt Dialog */}
            {promptDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                    >
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{promptDialog.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Entrez le nom du cycle académique à créer.</p>

                        <div className="relative mb-6">
                            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder={institutionType === 'ECOLE' ? "ex: Primaire" : "ex: Collège"}
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { promptDialog.onSubmit(promptValue); setPromptDialog({ ...promptDialog, isOpen: false }); } }}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setPromptDialog({ ...promptDialog, isOpen: false })} className="flex-1 py-2 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Annuler</button>
                            <button onClick={() => { promptDialog.onSubmit(promptValue); setPromptDialog({ ...promptDialog, isOpen: false }); }} className="flex-1 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">Créer le cycle</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );

    if (hideLayout) return content;

    return content;
};

export default Cycles;
