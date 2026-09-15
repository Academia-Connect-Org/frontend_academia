import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    Mail,
    Phone,
    X,
    Trash2,
    Edit,
    CheckCircle2,
    AlertCircle,
    SearchX,
    Download
} from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const Staff: React.FC = () => {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCycle, setSelectedCycle] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        cycle: '',
        specialties: [] as string[]
    });

    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!user?.institution?.id) return;
        setLoading(true);
        try {
            const institutionId = user.institution.id;
            const [teachersRes, cyclesRes, subjectsRes] = await Promise.all([
                api.get(`/teachers?institutionId=${institutionId}`),
                api.get(`/cycles?institutionId=${institutionId}`).catch(() => ({ data: [] })),
                api.get(`/subjects?institutionId=${institutionId}`).catch(() => ({ data: [] }))
            ]);
            setTeachers(teachersRes.data || []);
            setCycles(cyclesRes.data || []);

            const uniqueSubjects = Array.from(new Set((subjectsRes.data || []).map((s: any) => s.name)));
            setSubjects(uniqueSubjects);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            const payload: any = { ...formData };
            payload.institutionId = user?.institution?.id;

            if (formData.cycle) {
                const found = cycles.find(c => c.name === formData.cycle);
                if (found) payload.cycleIds = [found.id];
            }

            if (!isEditing && !payload.password) payload.password = 'Pass1234';

            if (isEditing && editingId) {
                await api.put(`/teachers/${editingId}`, payload);
                setMessage({ type: 'success', text: 'Enseignant mis à jour avec succès.' });
            } else {
                await api.post('/teachers/enroll', payload);
                setMessage({ type: 'success', text: 'Enseignant inscrit avec succès.' });
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Une erreur est survenue.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDialog.id) return;
        try {
            setLoading(true);
            await api.delete(`/teachers/${confirmDialog.id}`);
            setMessage({ type: 'success', text: 'Enseignant supprimé avec succès.' });
            setConfirmDialog({ isOpen: false, id: null });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const instId = user?.institution?.id;
            const response = await api.get(`/teachers/export?institutionId=${instId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'liste_enseignants.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setExporting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            cycle: '',
            specialties: []
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const openEditModal = (teacher: any) => {
        setFormData({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone || '',
            password: '',
            cycle: teacher.cycle || '',
            specialties: teacher.specialties || []
        });
        setIsEditing(true);
        setEditingId(teacher.id);
        setShowModal(true);
    };

    const filteredTeachers = teachers.filter(t => {
        const matchesSearch = `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCycle = selectedCycle === '' ||
            (t.cycles && t.cycles.some((c: any) => c.name === selectedCycle)) ||
            (t.cycle === selectedCycle);

        const matchesSubject = selectedSubject === '' || (t.specialties && t.specialties.includes(selectedSubject));
        return matchesSearch && matchesCycle && matchesSubject;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Corps Enseignant</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gérez les professeurs et leurs spécialités par cycle.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Download size={16} /> {exporting ? 'Exportation...' : 'Exporter Liste'}
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto"
                    >
                        <UserPlus size={16} /> Nouvel Enseignant
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

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={selectedCycle}
                            onChange={(e) => setSelectedCycle(e.target.value)}
                            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                        >
                            <option value="">Tous les Cycles</option>
                            {cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                        >
                            <option value="">Toutes les Matières</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher (Nom, Email)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-[260px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Nom & Prénom</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Cycle</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Spécialités</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Contact</th>
                                <th className="px-5 py-3.5 text-right border-b border-slate-100 dark:border-slate-800">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-xs">{teacher.lastName} {teacher.firstName}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{teacher.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.cycles && teacher.cycles.length > 0 ? teacher.cycles.map((c: any) => (
                                                <span key={c.id} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase">
                                                    {c.name}
                                                </span>
                                            )) : <span className="text-[10px] text-slate-400 italic">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.specialties?.map((s: string) => (
                                                <span key={s} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold">
                                                    {s}
                                                </span>
                                            )) || <span className="text-slate-400 italic text-[10px]">Aucune</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="truncate max-w-[140px]">{teacher.email}</span>
                                        </div>
                                        {teacher.phone && (
                                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-600 dark:text-slate-400">
                                                <Phone size={14} className="text-slate-400" />
                                                <span>{teacher.phone}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditModal(teacher)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDialog({ isOpen: true, id: teacher.id })}
                                                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTeachers.length === 0 && !loading && (
                        <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-800/40 m-4 rounded-xl">
                            <SearchX size={40} className="mx-auto text-slate-400 mb-3" />
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Aucun enseignant trouvé correspondant aux critères.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TEACHER */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isEditing ? "Modifier l'Enseignant" : "Inscrire un Enseignant"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prénom</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Téléphone</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            {!isEditing && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mot de passe</label>
                                    <input
                                        type="password"
                                        placeholder="Optionnel"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle Principal</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    value={formData.cycle}
                                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                                >
                                    <option value="">Choisir un cycle...</option>
                                    {cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Spécialités (Matières)</label>
                                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto">
                                    {subjects.map(subject => (
                                        <label key={subject} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.specialties.includes(subject)}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...formData.specialties, subject]
                                                        : formData.specialties.filter(s => s !== subject);
                                                    setFormData({ ...formData, specialties: updated });
                                                }}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{subject}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateOrUpdate}
                            disabled={loading || !formData.firstName || !formData.lastName || !formData.email}
                            className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                        >
                            {loading ? 'Traitement...' : isEditing ? 'Mettre à jour' : 'Inscrire l\'enseignant'}
                        </button>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Supprimer ?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Êtes-vous sûr de vouloir supprimer ce compte enseignant ? Cette action est irréversible.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDialog({ isOpen: false, id: null })} className="flex-1 py-2 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Annuler</button>
                            <button onClick={handleDelete} className="flex-1 py-2 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md transition-all">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
