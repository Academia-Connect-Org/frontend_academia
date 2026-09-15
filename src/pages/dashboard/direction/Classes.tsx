import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, CheckCircle2, AlertCircle, X, Edit, Download, Loader2, Users } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const ACADEMIC_DEGREES = [
    { code: 'DEG_1', name: 'CP1 (Primaire)', cycleType: 'PRIMAIRE', levelOrder: 1 },
    { code: 'DEG_2', name: 'CP2 (Primaire)', cycleType: 'PRIMAIRE', levelOrder: 2 },
    { code: 'DEG_3', name: 'CE1 (Primaire)', cycleType: 'PRIMAIRE', levelOrder: 3 },
    { code: 'DEG_4', name: 'CE2 (Primaire)', cycleType: 'PRIMAIRE', levelOrder: 4 },
    { code: 'DEG_5', name: 'CM1 (Primaire)', cycleType: 'PRIMAIRE', levelOrder: 5 },
    { code: 'DEG_6', name: 'CM2 (Primaire)', cycleType: 'PRIMAIRE', levelOrder: 6 },
    { code: 'DEG_7', name: '6ème (Collège)', cycleType: 'COLLEGE', levelOrder: 7 },
    { code: 'DEG_8', name: '5ème (Collège)', cycleType: 'COLLEGE', levelOrder: 8 },
    { code: 'DEG_9', name: '4ème (Collège)', cycleType: 'COLLEGE', levelOrder: 9 },
    { code: 'DEG_10', name: '3ème (Collège - Orientation S/L)', cycleType: 'COLLEGE', levelOrder: 10 },
    { code: 'DEG_11L', name: 'Seconde L (Lycée Littéraire)', cycleType: 'LYCEE', levelOrder: 11 },
    { code: 'DEG_12L', name: 'Première L (Lycée Littéraire)', cycleType: 'LYCEE', levelOrder: 12 },
    { code: 'DEG_13L', name: 'Terminale A (Lycée Littéraire)', cycleType: 'LYCEE', levelOrder: 13 },
    { code: 'DEG_11S', name: 'Seconde S (Lycée Scientifique)', cycleType: 'LYCEE', levelOrder: 11 },
    { code: 'DEG_12S', name: 'Première S (Lycée Scientifique)', cycleType: 'LYCEE', levelOrder: 12 },
    { code: 'DEG_13S_C', name: 'Terminale C (Lycée Scientifique)', cycleType: 'LYCEE', levelOrder: 13 },
    { code: 'DEG_13S_D', name: 'Terminale D (Lycée Scientifique)', cycleType: 'LYCEE', levelOrder: 13 },
    { code: 'DEG_13S_E', name: 'Terminale E (Lycée Scientifique)', cycleType: 'LYCEE', levelOrder: 13 },
];

const Classes: React.FC = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedCycleFilter, setSelectedCycleFilter] = useState<string>('');
    const [showClassModal, setShowClassModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newClass, setNewClass] = useState<any>({ name: '', cycle: { id: '' }, degree: '', capacity: 30, mainTeacher: { id: '' } });
    const [teachers, setTeachers] = useState<any[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [exporting, setExporting] = useState(false);

    const filteredDegrees = React.useMemo(() => {
        if (!newClass.cycle?.id) return ACADEMIC_DEGREES;
        const selectedCycleObj = cycles.find(c => String(c.id) === String(newClass.cycle.id));
        if (!selectedCycleObj) return ACADEMIC_DEGREES;
        const cycleName = selectedCycleObj.name.toLowerCase();

        if (cycleName.includes('prim')) {
            return ACADEMIC_DEGREES.filter(d => d.cycleType === 'PRIMAIRE');
        } else if (cycleName.includes('coll')) {
            return ACADEMIC_DEGREES.filter(d => d.cycleType === 'COLLEGE');
        } else if (cycleName.includes('lyc')) {
            return ACADEMIC_DEGREES.filter(d => d.cycleType === 'LYCEE');
        }
        return ACADEMIC_DEGREES;
    }, [newClass.cycle?.id, cycles]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!user?.institution?.id) return;
        setLoading(true);
        try {
            const institutionId = user.institution.id;
            const [classesRes, cyclesRes, teachersRes] = await Promise.all([
                api.get(`/classes?institutionId=${institutionId}`),
                api.get(`/cycles?institutionId=${institutionId}`).catch(() => ({ data: [] })),
                api.get(`/teachers?institutionId=${institutionId}`).catch(() => ({ data: [] }))
            ]);
            setClasses(classesRes.data || []);
            setCycles(cyclesRes.data || []);
            setTeachers(teachersRes.data || []);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateClass = async () => {
        try {
            setLoading(true);
            const payload = {
                ...newClass,
                degree: newClass.degree || null,
                cycle: newClass.cycle?.id ? { id: Number(newClass.cycle.id) } : null,
                mainTeacher: newClass.mainTeacher?.id ? { id: Number(newClass.mainTeacher.id) } : null,
                nextClasse: newClass.nextClasse?.id ? { id: Number(newClass.nextClasse.id) } : null,
                levelOrder: Number(newClass.levelOrder) || 1,
                isTerminalClass: Boolean(newClass.isTerminalClass),
                institution: { id: user?.institution?.id }
            };

            if (isEditing && editingId) {
                await api.put(`/classes/${editingId}`, payload);
                setMessage({ type: 'success', text: 'Classe mise à jour avec succès.' });
            } else {
                await api.post('/classes', payload);
                setMessage({ type: 'success', text: 'Classe créée avec succès.' });
            }
            setShowClassModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: `Erreur lors de la ${isEditing ? 'mise à jour' : 'création'} de la classe.` });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewClass({
            name: '',
            cycle: { id: '' },
            degree: '',
            capacity: 30,
            mainTeacher: { id: '' },
            levelOrder: 1,
            isTerminalClass: false,
            nextClasse: { id: '' }
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEditClass = (classe: any) => {
        setNewClass({
            name: classe.name,
            cycle: { id: String(classe.cycle?.id || '') },
            degree: classe.degree || '',
            capacity: classe.capacity,
            mainTeacher: { id: String(classe.mainTeacher?.id || '') },
            levelOrder: classe.levelOrder || 1,
            isTerminalClass: Boolean(classe.isTerminalClass),
            nextClasse: { id: String(classe.nextClasse?.id || '') }
        });
        setIsEditing(true);
        setEditingId(classe.id);
        setShowClassModal(true);
    };


    const handleDeleteClass = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: "Supprimer cette classe ?",
            message: "Cette action est irréversible et pourrait affecter les élèves assignés.",
            onConfirm: async () => {
                try {
                    await api.delete(`/classes/${id}`);
                    fetchData();
                    setMessage({ type: 'success', text: 'Classe supprimée avec succès.' });
                } catch (error) {
                    setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
                }
            }
        });
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const instId = user?.institution?.id;
            const response = await api.get(`/classes/export?institutionId=${instId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'liste_classes.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setExporting(false);
        }
    };

    const institutionType = user?.institution?.type;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {institutionType === 'ECOLE' ? "Classes de l'École" : "Classes de l'Établissement"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {institutionType === 'ECOLE'
                            ? "Gérez les classes du primaire et du jardin d'enfants."
                            : "Gérez les sections du collège et du lycée."}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {exporting ? 'Exportation...' : 'Exporter Liste'}
                    </button>
                    <button onClick={() => { resetForm(); setShowClassModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all">
                        <Plus size={16} /> Ajouter une Classe
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3 w-fit">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filtrer par Cycle</label>
                <select
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    value={selectedCycleFilter}
                    onChange={(e) => setSelectedCycleFilter(e.target.value)}
                >
                    <option value="">Tous les cycles</option>
                    {cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedCycleFilter ? classes.filter(c => c.cycle?.name === selectedCycleFilter) : classes).map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                <Layers size={20} />
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleEditClass(c)} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteClass(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">{c.name}</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{c.cycle?.name || 'N/A'}</span>
                                <div className="flex items-center gap-1.5">
                                    {c.degree && (
                                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[9px] font-extrabold rounded-md uppercase">
                                            {ACADEMIC_DEGREES.find(d => d.code === c.degree)?.name || c.degree}
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold rounded-md uppercase">
                                        {c.capacity || 0} PLACES
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                                <Users size={14} className="text-blue-600 dark:text-blue-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase leading-none mb-0.5">
                                        {institutionType === 'ECOLE' ? 'Titulaire' : 'Prof. Principal'}
                                    </p>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {c.mainTeacher ? `${c.mainTeacher.lastName} ${c.mainTeacher.firstName}` : 'Non assigné'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">G</div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Garçons</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{c.boysCount || 0}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-[10px]">F</div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Filles</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{c.girlsCount || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] font-bold text-center text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 py-1.5 rounded-lg">
                                Total: {(c.boysCount || 0) + (c.girlsCount || 0)} élèves
                            </div>
                        </div>
                    </div>
                ))}
                {classes.length === 0 && !loading && (
                    <div className="col-span-full py-16 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl text-center">
                        <Layers size={40} className="mx-auto text-slate-400 mb-3" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Aucune classe configurée.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showClassModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{isEditing ? "Modifier la Classe" : "Nouvelle Classe"}</h3>
                            <button onClick={() => setShowClassModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            {/* 1. Nom de la Classe */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de la classe</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 6ème A, 3ème 1, 2nde S2"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    value={newClass.name}
                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                />
                            </div>

                            {/* 2. Cycle Académique (Prioritaire pour filtrage) */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle Académique</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    value={newClass.cycle?.id || ''}
                                    onChange={(e) => {
                                        const newCycleId = e.target.value;
                                        setNewClass({
                                            ...newClass,
                                            cycle: { id: newCycleId },
                                            degree: '' // Reset degree selection when cycle changes
                                        });
                                    }}
                                >
                                    <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sélectionner un cycle...</option>
                                    {cycles.map(c => (
                                        <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1 font-semibold">{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 3. Degré / Niveau d'étude (Filtré dynamiquement selon le Cycle) */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Degré / Niveau d'étude (Standard)</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-950 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
                                    value={newClass.degree || ''}
                                    onChange={(e) => {
                                        const selectedDegCode = e.target.value;
                                        const foundDeg = ACADEMIC_DEGREES.find(d => d.code === selectedDegCode);
                                        setNewClass({
                                            ...newClass,
                                            degree: selectedDegCode,
                                            levelOrder: foundDeg ? foundDeg.levelOrder : newClass.levelOrder,
                                            isTerminalClass: foundDeg ? (foundDeg.levelOrder === 6 || foundDeg.levelOrder === 13) : newClass.isTerminalClass
                                        });
                                    }}
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sélectionner un degré standard...</option>
                                    {filteredDegrees.map(d => (
                                        <option key={d.code} value={d.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1 font-semibold">
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 4. Enseignant Principal */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enseignant Principal (Optionnel)</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    value={newClass.mainTeacher?.id || ''}
                                    onChange={(e) => setNewClass({ ...newClass, mainTeacher: { id: e.target.value } })}
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Non assigné</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1 font-semibold">{t.lastName} {t.firstName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 5. Capacité */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Capacité (Nombre d'élèves max)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 30"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    value={newClass.capacity}
                                    onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCreateOrUpdateClass}
                            disabled={loading || !newClass.name || !newClass.cycle.id}
                            className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                        >
                            {loading ? 'Traitement...' : isEditing ? 'Mettre à jour la classe' : 'Créer la classe'}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{confirmDialog.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{confirmDialog.message}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 py-2 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Annuler</button>
                            <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, isOpen: false }); }} className="flex-1 py-2 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md transition-all">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;
