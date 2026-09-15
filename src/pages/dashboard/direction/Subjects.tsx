import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, AlertCircle, X, Edit } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const Subjects: React.FC = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedCycleFilter, setSelectedCycleFilter] = useState<string>('');
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newSubject, setNewSubject] = useState<any>({ name: '', cycle: { id: '', name: '' }, classeIds: [], category: 'LITTERAIRE' });
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!user?.institution?.id) return;
        setLoading(true);
        try {
            const institutionId = user.institution.id;
            const [subjectsRes, classesRes, cyclesRes] = await Promise.all([
                api.get(`/subjects?institutionId=${institutionId}`),
                api.get(`/classes?institutionId=${institutionId}`),
                api.get(`/cycles?institutionId=${institutionId}`).catch(() => ({ data: [] }))
            ]);
            setSubjects(subjectsRes.data || []);
            setClasses(classesRes.data || []);
            setCycles(cyclesRes.data || []);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateSubject = async () => {
        try {
            setLoading(true);
            const payload = {
                name: newSubject.name,
                cycle: newSubject.cycle.id === 'all' ? null : { id: Number(newSubject.cycle.id) },
                classes: newSubject.classeIds.map((id: string) => ({ id: parseInt(id) })),
                institution: { id: user?.institution?.id },
                category: newSubject.category
            };

            if (isEditing && editingId) {
                await api.put(`/subjects/${editingId}`, payload);
                setMessage({ type: 'success', text: 'Matière mise à jour avec succès.' });
            } else {
                await api.post('/subjects', payload);
                setMessage({ type: 'success', text: 'Matière créée avec succès.' });
            }
            setShowSubjectModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: `Erreur lors de la ${isEditing ? 'mise à jour' : 'création'} de la matière.` });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewSubject({ name: '', cycle: { id: '', name: '' }, classeIds: [], category: 'LITTERAIRE' });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEditSubject = (subject: any) => {
        setNewSubject({
            name: subject.name,
            cycle: { id: subject.cycle ? String(subject.cycle.id) : 'all', name: subject.cycle?.name || 'Tous les Cycles' },
            classeIds: subject.classes ? subject.classes.map((c: any) => String(c.id)) : [],
            category: subject.category || 'LITTERAIRE'
        });
        setIsEditing(true);
        setEditingId(subject.id);
        setShowSubjectModal(true);
    };

    const handleDeleteSubject = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: "Supprimer cette matière ?",
            message: "Cette action est irréversible et retirera la matière des emplois du temps.",
            onConfirm: async () => {
                try {
                    await api.delete(`/subjects/${id}`);
                    fetchData();
                    setMessage({ type: 'success', text: 'Matière supprimée avec succès.' });
                } catch (error) {
                    setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
                }
            }
        });
    };

    const institutionType = user?.institution?.type;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {institutionType === 'ECOLE' ? "Catalogue des Matières" : "Matières et Disciplines"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {institutionType === 'ECOLE'
                            ? "Configurez les disciplines fondamentales du primaire."
                            : "Gérez les matières spécialisées du collège et du lycée."}
                    </p>
                </div>
                <button onClick={() => { resetForm(); setShowSubjectModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto">
                    <Plus size={16} /> Ajouter une Matière
                </button>
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

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Matière</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Cycle / Niveau</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Affectation</th>
                                <th className="px-5 py-3.5 text-right border-b border-slate-100 dark:border-slate-800">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {(selectedCycleFilter ? subjects.filter(s => s.cycle?.name === selectedCycleFilter) : subjects).map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${!s.cycle ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>{s.cycle?.name || 'Tous Les Cycles'}</span>
                                            {institutionType !== 'ECOLE' && s.category && (
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${s.category === 'SCIENTIFIQUE' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                                                    s.category === 'ADDITIONNELLE' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' :
                                                        'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                                                    }`}>
                                                    {s.category}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {s.classes && s.classes.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {s.classes.map((c: any) => (
                                                    <span key={c.id} className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                                                        {c.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                                                Tronc commun
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleEditSubject(s)} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteSubject(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {subjects.length === 0 && !loading && (
                    <div className="p-12 text-center bg-slate-50/50 dark:bg-slate-800/40 m-4 rounded-xl">
                        <BookOpen size={40} className="mx-auto text-slate-400 mb-3" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Catalogue vide</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Commencez par ajouter une matière pour ce cycle.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showSubjectModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEditing ? "Modifier la Matière" : "Nouvelle Matière"}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{isEditing ? "Ajustez les détails de l'enseignement." : "Ajoutez une discipline au programme."}</p>
                            </div>
                            <button onClick={() => setShowSubjectModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={18} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-4">
                                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <BookOpen size={14} /> Informations Générales
                                </h4>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Intitulé de l'enseignement</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Mathématiques, SVT, Anglais..."
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={newSubject.name}
                                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle d'enseignement</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            value={newSubject.cycle.id}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const cycle = cycles.find(c => String(c.id) === val);
                                                setNewSubject({ ...newSubject, cycle: { id: val, name: cycle?.name || 'Tous les Cycles' }, classeIds: [] });
                                            }}
                                        >
                                            <option value="" disabled>Choisir un cycle...</option>
                                            <option value="all">Tous (Tous les cycles)</option>
                                            {cycles.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {institutionType !== 'ECOLE' && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catégorie</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                value={newSubject.category}
                                                onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
                                            >
                                                <option value="LITTERAIRE">Littéraire</option>
                                                <option value="SCIENTIFIQUE">Scientifique</option>
                                                <option value="ADDITIONNELLE">Additionnelle / Optionnelle</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Affectation des Classes
                                    </h4>
                                    {newSubject.cycle.id && classes.filter(c => newSubject.cycle.id === 'all' || String(c.cycle?.id) === String(newSubject.cycle.id)).length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const cycleClasses = classes.filter(c => newSubject.cycle.id === 'all' || String(c.cycle?.id) === String(newSubject.cycle.id)).map(c => String(c.id));
                                                const allSelected = cycleClasses.every((id: string) => newSubject.classeIds.includes(id));
                                                if (allSelected) {
                                                    setNewSubject({ ...newSubject, classeIds: newSubject.classeIds.filter((id: string) => !cycleClasses.includes(id)) });
                                                } else {
                                                    setNewSubject({ ...newSubject, classeIds: Array.from(new Set([...newSubject.classeIds, ...cycleClasses])) });
                                                }
                                            }}
                                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase hover:underline"
                                        >
                                            {classes.filter(c => newSubject.cycle.id === 'all' || String(c.cycle?.id) === String(newSubject.cycle.id)).every(c => newSubject.classeIds.includes(String(c.id))) ? "Tout décocher" : "Tout cocher"}
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Sélectionnez les classes qui suivront cette matière (Laissez vide pour le tronc commun).</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {classes.filter(c => newSubject.cycle.id && newSubject.cycle.id !== 'all' ? String(c.cycle?.id) === String(newSubject.cycle.id) : true).map(c => (
                                        <label key={c.id} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${newSubject.classeIds.includes(String(c.id)) ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={newSubject.classeIds.includes(String(c.id))}
                                                onChange={(e) => {
                                                    if (e.target.checked) setNewSubject({ ...newSubject, classeIds: [...newSubject.classeIds, String(c.id)] });
                                                    else setNewSubject({ ...newSubject, classeIds: newSubject.classeIds.filter((id: string) => id !== String(c.id)) });
                                                }}
                                            />
                                            <div className={`w-4 h-4 rounded flex items-center justify-center ${newSubject.classeIds.includes(String(c.id)) ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                {newSubject.classeIds.includes(String(c.id)) && <CheckCircle2 size={12} />}
                                            </div>
                                            <span className="text-xs font-bold truncate">{c.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-850/50 flex justify-end gap-2">
                            <button
                                onClick={handleCreateOrUpdateSubject}
                                disabled={loading || !newSubject.name || !newSubject.cycle.id}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                            >
                                {loading ? 'Traitement...' : isEditing ? 'Appliquer les modifications' : 'Enregistrer la matière'}
                            </button>
                        </div>
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

export default Subjects;
