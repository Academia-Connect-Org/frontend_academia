import React, { useState, useEffect } from 'react';
import { Layers, Plus, X, AlertCircle, CheckCircle2, Users, GraduationCap, BookOpen, UserCheck, Trash2 } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';

const CYCLE_COLORS = [
    { bg: 'bg-blue-50', border: '', text: 'text-blue-600', hover: 'hover:bg-blue-100', accent: 'bg-blue-600', lightAccent: 'text-blue-500' },
    { bg: 'bg-purple-50', border: '', text: 'text-purple-600', hover: 'hover:bg-purple-100', accent: 'bg-purple-600', lightAccent: 'text-purple-500' },
    { bg: 'bg-emerald-50', border: '', text: 'text-emerald-600', hover: 'hover:bg-emerald-100', accent: 'bg-emerald-600', lightAccent: 'text-emerald-500' },
    { bg: 'bg-orange-50', border: '', text: 'text-orange-600', hover: 'hover:bg-orange-100', accent: 'bg-orange-600', lightAccent: 'text-orange-500' },
    { bg: 'bg-pink-50', border: '', text: 'text-pink-600', hover: 'hover:bg-pink-100', accent: 'bg-pink-600', lightAccent: 'text-pink-500' },
    { bg: 'bg-indigo-50', border: '', text: 'text-indigo-600', hover: 'hover:bg-indigo-100', accent: 'bg-indigo-600', lightAccent: 'text-indigo-500' },
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

    // Custom Dialogs
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
            setCycles(cyclesRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
            try {
                const cyclesRes = await api.get('/cycles', { params: { institutionId: targetId } });
                setCycles(cyclesRes.data);
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

                // Restriction logic
                if (institutionType === 'ECOLE') {
                    if (normalizedName.includes('collège') || normalizedName.includes('college') ||
                        normalizedName.includes('lycée') || normalizedName.includes('lycee')) {
                        setMessage({ type: 'error', text: 'Une ECOLE ne peut pas avoir de cycle Collège ou Lycée.' });
                        return;
                    }
                } else if (institutionType === 'ETABLISSEMENT') {
                    if (normalizedName.includes('jardin') || normalizedName.includes('primaire')) {
                        setMessage({ type: 'error', text: 'Un ETABLISSEMENT ne peut pas avoir de cycle Jardin ou Primaire.' });
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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Cycles</h2>
                    <p className="text-slate-500 font-medium mt-1">Consultez et gérez les cycles académiques de votre établissement.</p>
                </div>
                {canEdit && (
                    <button onClick={handleAddCyclePrompt} className="bg-indigo-600 text-white px-8 py-4 ] font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                        <Plus size={20} /> Nouveau Cycle
                    </button>
                )}
            </div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-5 ] mb-8 font-bold flex items-center justify-between gap-3 shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600  ' : 'bg-red-50 text-red-600  '}`}
                >
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <span className="text-lg">{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="hover:bg-black/5 p-2  transition-colors"><X size={20} /></button>
                </motion.div>
            )}

            {loading && cycles.length === 0 ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin  h-12 w-12  "></div>
                </div>
            ) : cycles.length === 0 ? (
                <div className="bg-white ] p-16 text-center   ">
                    <div className="w-20 h-20 bg-slate-50  flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Layers size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Aucun cycle enregistré</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        {institutionType === 'ECOLE'
                            ? "Commencez par ajouter les cycles (Jardin, Primaire) de votre école."
                            : "Commencez par ajouter les cycles (Collège, Lycée) de votre établissement."}
                    </p>
                    {canEdit && (
                        <button onClick={handleAddCyclePrompt} className="text-indigo-600 font-black hover:underline">Ajouter un cycle maintenant</button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {cycles.map((cycle, index) => {
                        const color = CYCLE_COLORS[index % CYCLE_COLORS.length];
                        return (
                            <motion.div
                                key={cycle.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative group bg-white ]  ${color.border} overflow-hidden shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 hover:-translate-y-1`}
                            >
                                {/* Header Color Strip */}
                                <div className={`h-3 w-full ${color.accent}`}></div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-16 h-16 ${color.bg} ${color.text}  flex items-center justify-center shadow-inner`}>
                                            <Layers size={32} />
                                        </div>
                                        {canEdit && (
                                            <button
                                                onClick={() => handleDeleteCycle(cycle.id)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50  transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <h3 className="text-3xl font-black text-slate-800 mb-8 tracking-tight truncate uppercase" title={cycle.name}>{cycle.name}</h3>

                                    <div className="space-y-4">
                                        <div className="p-6 ] bg-slate-50/80   shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <GraduationCap size={20} className={color.lightAccent} />
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Effectif Élèves</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="flex flex-col">
                                                    <span className="text-3xl font-black text-slate-900">{cycle.studentCount || 0}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                                </div>
                                                <div className="flex flex-col  ">
                                                    <span className="text-3xl font-black text-blue-600">{cycle.boysCount || 0}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Garçons</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-3xl font-black text-pink-600">{cycle.girlsCount || 0}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filles</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 ] bg-slate-50/80   shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <UserCheck size={20} className={color.lightAccent} />
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Corps Enseignant</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="flex flex-col">
                                                    <span className="text-3xl font-black text-slate-900">{cycle.teacherCount || 0}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                                </div>
                                                <div className="flex flex-col  ">
                                                    <span className="text-3xl font-black text-blue-600">{cycle.maleTeachersCount || 0}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">H</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-3xl font-black text-pink-600">{cycle.femaleTeachersCount || 0}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">F</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mt-2">
                                            <div className="p-6 ] bg-slate-900 text-white flex flex-col shadow-xl shadow-slate-900/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users size={16} className="text-white/60" />
                                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Classes</span>
                                                </div>
                                                <span className="text-4xl font-black">{cycle.classCount || 0}</span>
                                            </div>
                                            <div className="p-6 ] bg-indigo-600 text-white flex flex-col shadow-xl shadow-indigo-600/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen size={16} className="text-white/60" />
                                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Matières</span>
                                                </div>
                                                <span className="text-4xl font-black">{cycle.subjectCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white w-full max-w-sm ] p-10 shadow-2xl text-center"
                    >
                        <div className="w-20 h-20 bg-red-50 text-red-500  flex items-center justify-center mx-auto mb-8 shadow-inner"><Trash2 size={40} /></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">{confirmDialog.title}</h3>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed">{confirmDialog.message}</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 py-5 ] font-black bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Annuler</button>
                            <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, isOpen: false }); }} className="flex-1 py-5 ] font-black bg-red-500 text-white shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all">Supprimer</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {promptDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white w-full max-w-md ] p-10 shadow-2xl"
                    >
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{promptDialog.title}</h3>
                        <p className="text-slate-500 mb-8 font-medium">Entrez le nom du cycle académique à créer.</p>

                        <div className="relative mb-10">
                            <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder={institutionType === 'ECOLE' ? "ex: Primaire" : "ex: Collège"}
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { promptDialog.onSubmit(promptValue); setPromptDialog({ ...promptDialog, isOpen: false }); } }}
                                className="w-full pl-14 pr-6 py-5 bg-slate-50    text-lg font-bold text-slate-700 focus:bg-white focus: outline-none transition-all placeholder:text-slate-300"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setPromptDialog({ ...promptDialog, isOpen: false })} className="flex-1 py-5 ] font-black bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-lg">Annuler</button>
                            <button onClick={() => { promptDialog.onSubmit(promptValue); setPromptDialog({ ...promptDialog, isOpen: false }); }} className="flex-1 py-5 ] font-black bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all text-lg">Créer le cycle</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );

    if (hideLayout) return content;

    return (
        <>
            {content}
        </>
    );
};

export default Cycles;
