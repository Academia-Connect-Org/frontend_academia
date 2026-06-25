import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, CheckCircle2, AlertCircle, X, Edit, Download, Loader2, Users } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

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
    const [newClass, setNewClass] = useState<any>({ name: '', cycle: { id: '' }, capacity: 30, mainTeacher: { id: '' } });
    const [teachers, setTeachers] = useState<any[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [exporting, setExporting] = useState(false);

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
            setClasses(classesRes.data);
            setCycles(cyclesRes.data);
            setTeachers(teachersRes.data);
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
                cycle: { id: Number(newClass.cycle.id) },
                mainTeacher: newClass.mainTeacher.id ? { id: Number(newClass.mainTeacher.id) } : null,
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
        setNewClass({ name: '', cycle: { id: '' }, capacity: 30, mainTeacher: { id: '' } });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEditClass = (classe: any) => {
        setNewClass({
            name: classe.name,
            cycle: { id: String(classe.cycle?.id || '') },
            capacity: classe.capacity,
            mainTeacher: { id: String(classe.mainTeacher?.id || '') }
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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {institutionType === 'ECOLE' ? "Classes de l'École" : "Classes de l'Établissement"}
                    </h2>
                    <p className="text-slate-500">
                        {institutionType === 'ECOLE'
                            ? "Gérez les classes du primaire et du jardin d'enfants."
                            : "Gérez les sections du collège et du lycée."}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {exporting ? 'Exportation...' : 'Exporter Liste'}
                    </button>
                    <button onClick={() => { resetForm(); setShowClassModal(true); }} className="bg-indigo-600 text-white px-6 py-3  font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-indigo-600/20">
                        <Plus size={18} /> Ajouter une Classe
                    </button>
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedCycleFilter ? classes.filter(c => c.cycle?.name === selectedCycleFilter) : classes).map(c => (
                    <div key={c.id} className="bg-white p-6 ]   shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600  flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <Layers size={24} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditClass(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50  transition-all">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteClass(c.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50  transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{c.name}</h4>
                        <div className="mt-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{c.cycle?.name || 'N/A'}</p>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600  text-[10px] font-black  ">
                                    {c.capacity} PLACES
                                </div>
                            </div>

                            <div className="flex items-center gap-2 py-2 px-3 bg-blue-50/50   ">
                                <Users size={14} className="text-blue-500" />
                                <div className="flex-1">
                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-0.5">
                                        {institutionType === 'ECOLE' ? 'Titulaire' : 'Prof. Principal'}
                                    </p>
                                    <p className="text-xs font-black text-slate-700 truncate">
                                        {c.mainTeacher ? `${c.mainTeacher.lastName} ${c.mainTeacher.firstName}` : 'Non assigné'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8  bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">G</div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Garçons</p>
                                        <p className="text-sm font-black text-slate-700">{c.boysCount || 0}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8  bg-rose-50 text-rose-500 flex items-center justify-center font-black text-[10px]">F</div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Filles</p>
                                        <p className="text-sm font-black text-slate-700">{c.girlsCount || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 text-[9px] font-black text-center text-slate-300 uppercase tracking-widest bg-slate-50/50 py-1.5   ">
                                Total: {(c.boysCount || 0) + (c.girlsCount || 0)} élèves
                            </div>
                        </div>
                    </div>
                ))}
                {classes.length === 0 && !loading && (
                    <div className="col-span-full py-20 bg-slate-50/50 ]    text-center">
                        <Layers size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold tracking-tight">Aucune classe configurée.</p>
                    </div>
                )}
            </div>

            {showClassModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md ] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? "Modifier la Classe" : "Nouvelle Classe"}</h3>
                            <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la classe</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 6ème A"
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 focus:bg-white focus: outline-none transition-all"
                                    value={newClass.name}
                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle Académique</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:"
                                    value={newClass.cycle.id}
                                    onChange={(e) => setNewClass({ ...newClass, cycle: { id: e.target.value } })}
                                >
                                    <option value="" disabled>Sélectionner un cycle...</option>
                                    {cycles.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacité (Nombre de places)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 30"
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 focus:bg-white focus: outline-none transition-all"
                                    value={newClass.capacity}
                                    onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enseignant Principal</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:"
                                    value={newClass.mainTeacher.id}
                                    onChange={(e) => setNewClass({ ...newClass, mainTeacher: { id: e.target.value } })}
                                >
                                    <option value="">Non assigné</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.lastName} {t.firstName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateOrUpdateClass}
                            disabled={loading || !newClass.name || !newClass.cycle.id}
                            className="w-full mt-10 py-5 bg-indigo-600 text-white  font-black shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 tracking-tight"
                        >
                            {loading ? 'Traitement...' : isEditing ? 'Mettre à jour la classe' : 'Créer la classe'}
                        </button>

                    </div>
                </div>
            )}

            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm ] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500  flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} /></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{confirmDialog.title}</h3>
                        <p className="text-slate-500 text-sm mb-8">{confirmDialog.message}</p>
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

export default Classes;
