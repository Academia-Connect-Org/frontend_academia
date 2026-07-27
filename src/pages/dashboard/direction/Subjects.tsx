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
            setSubjects(subjectsRes.data);
            setClasses(classesRes.data);
            setCycles(cyclesRes.data);
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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {institutionType === 'ECOLE' ? "Catalogue des Matières" : "Matières et Disciplines"}
                    </h2>
                    <p className="text-slate-500">
                        {institutionType === 'ECOLE'
                            ? "Configurez les disciplines fondamentales du primaire."
                            : "Gérez les matières spécialisées du collège et du lycée."}
                    </p>
                </div>
                <button onClick={() => { resetForm(); setShowSubjectModal(true); }} className="bg-blue-600 text-white px-6 py-3  font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={18} /> Ajouter une Matière
                </button>
            </div>

            <div className="flex bg-white  p-4 shadow-sm   mb-6 items-center gap-4 w-fit">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtrer par Cycle</label>
                <select
                    className="px-5 py-2.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none w-64 focus:bg-white focus:"
                    value={selectedCycleFilter}
                    onChange={(e) => setSelectedCycleFilter(e.target.value)}
                >
                    <option value="">Tous les cycles</option>
                    {cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>

            {message.text && (
                <div className={`p-4  mb-6 font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600  ' : 'bg-red-50 text-red-600  '}`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                </div>
            )}

            <div className="bg-white ]   shadow-sm overflow-hidden scrollbar-hide">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <tr>
                                <th className="px-10 py-6">Matière</th>
                                <th className="px-10 py-6">Cycle / Niveau</th>
                                <th className="px-10 py-6">Affectation</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(selectedCycleFilter ? subjects.filter(s => s.cycle?.name === selectedCycleFilter) : subjects).map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600  flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-800 tracking-tight">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col gap-2 items-start">
                                            <span className={`px-4 py-1.5  text-[10px] font-black tracking-widest uppercase ${!s.cycle ? 'bg-indigo-50/50 text-indigo-700' : 'bg-blue-50/50 text-blue-700'}`}>{s.cycle?.name || 'Tous Les Cycles'}</span>
                                            {institutionType !== 'ECOLE' && s.category && (
                                                <span className={`px-3 py-1  text-[9px] font-bold uppercase tracking-widest ${s.category === 'SCIENTIFIQUE' ? 'bg-emerald-50 text-emerald-600  ' :
                                                    s.category === 'ADDITIONNELLE' ? 'bg-amber-50 text-amber-600  ' :
                                                        'bg-purple-50 text-purple-600  '
                                                    }`}>
                                                    {s.category}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        {s.classes && s.classes.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 max-w-xs">
                                                {s.classes.map((c: any) => (
                                                    <div key={c.id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1  text-[10px] font-black uppercase tracking-tight  ">
                                                        <div className="w-1.2 h-1.2 bg-blue-400 "></div>
                                                        {c.name}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 font-medium text-[10px] uppercase font-black tracking-widest italic">
                                                <div className="w-1.5 h-1.5 bg-purple-200 "></div>
                                                Tronc commun
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditSubject(s)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50  transition-all">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteSubject(s.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50  transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {subjects.length === 0 && !loading && (
                    <div className="p-20 text-center animate-in fade-in zoom-in-95 duration-500">
                        <BookOpen size={64} className="mx-auto text-slate-200 mb-6 stroke-[1]" />
                        <p className="text-slate-400 font-black tracking-tight uppercase text-xs tracking-[0.2em] mb-2">Catalogue vide</p>
                        <p className="text-slate-300 text-sm">Commencez par ajouter une matière pour ce cycle.</p>
                    </div>
                )}
            </div>

            {showSubjectModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col ] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

                        {/* Header fixe */}
                        <div className="p-8 pb-6   flex justify-between items-center shrink-0 bg-white">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? "Modifier la Matière" : "Nouvelle Matière"}</h3>
                                <p className="text-slate-400 text-sm mt-1">{isEditing ? "Ajustez les détails de l'enseignement." : "Ajoutez une discipline au programme."}</p>
                            </div>
                            <button onClick={() => setShowSubjectModal(false)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600  flex items-center justify-center transition-colors"><X size={20} /></button>
                        </div>

                        {/* Corps scrollable */}
                        <div className="p-8 overflow-y-auto scrollbar-hide space-y-8 flex-1 bg-slate-50/30">

                            <div className="bg-white p-6 ]   shadow-sm space-y-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <BookOpen size={14} className="text-blue-500" /> Informations Générales
                                </h4>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Intitulé de l'enseignement</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Mathématiques, SVT, Anglais..."
                                        className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 focus:bg-white focus: focus:ring-4 focus:ring-blue-400/10 outline-none transition-all"
                                        value={newSubject.name}
                                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cycle d'enseignement</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none focus:bg-white focus: focus:ring-4 focus:ring-blue-400/10 appearance-none cursor-pointer transition-all"
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
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Catégorie</label>
                                            <select
                                                className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none focus:bg-white focus: focus:ring-4 focus:ring-blue-400/10 appearance-none cursor-pointer transition-all"
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

                            <div className="bg-white p-6 ]   shadow-sm space-y-4">
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Vérification d'Affectation
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
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline bg-blue-50 px-3 py-1.5 "
                                        >
                                            {classes.filter(c => newSubject.cycle.id === 'all' || String(c.cycle?.id) === String(newSubject.cycle.id)).every(c => newSubject.classeIds.includes(String(c.id))) ? "Tout décocher" : "Tout cocher"}
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium pb-2">Sélectionnez les classes qui suivront cette matière. Laissez vide pour l'assigner au tronc commun de tout le cycle.</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {classes.filter(c => newSubject.cycle.id && newSubject.cycle.id !== 'all' ? String(c.cycle?.id) === String(newSubject.cycle.id) : true).map(c => (
                                        <label key={c.id} className={`flex items-center gap-3 p-3.5  cursor-pointer  transition-all shadow-sm ${newSubject.classeIds.includes(String(c.id)) ? 'bg-blue-50  text-blue-700' : 'bg-white  text-slate-600 hover:'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={newSubject.classeIds.includes(String(c.id))}
                                                onChange={(e) => {
                                                    if (e.target.checked) setNewSubject({ ...newSubject, classeIds: [...newSubject.classeIds, String(c.id)] });
                                                    else setNewSubject({ ...newSubject, classeIds: newSubject.classeIds.filter((id: string) => id !== String(c.id)) });
                                                }}
                                            />
                                            <div className={`w-5 h-5 shrink-0 ]  flex items-center justify-center transition-all ${newSubject.classeIds.includes(String(c.id)) ? 'bg-blue-600 ' : 'bg-slate-100 '}`}>
                                                {newSubject.classeIds.includes(String(c.id)) && <CheckCircle2 size={12} className="text-white" />}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-tight truncate">{c.name}</span>
                                        </label>
                                    ))}
                                    {classes.filter(c => newSubject.cycle.id && newSubject.cycle.id !== 'all' ? String(c.cycle?.id) === String(newSubject.cycle.id) : true).length === 0 && (
                                        <div className="col-span-full py-6 text-center bg-slate-50    ">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Aucune classe disponible.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer fixe */}
                        <div className="p-8 pt-6   shrink-0 bg-white">
                            <button
                                onClick={handleCreateOrUpdateSubject}
                                disabled={loading || !newSubject.name || !newSubject.cycle.id}
                                className="w-full py-4 bg-blue-600 text-white  font-black shadow-lg shadow-blue-600/20 hover:scale-[1.02] hover:shadow-blue-600/40 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-blue-600/30 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loading ? 'Traitement en cours...' : isEditing ? 'Appliquer les modifications' : 'Enregistrer la matière'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm ] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500  flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-110 ease-out duration-500"><AlertCircle size={32} /></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{confirmDialog.title}</h3>
                        <p className="text-slate-500 text-sm mb-10 leading-relaxed">{confirmDialog.message}</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 py-4  font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all">Annuler</button>
                            <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, isOpen: false }); }} className="flex-1 py-4  font-black bg-red-500 text-white shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Subjects;
