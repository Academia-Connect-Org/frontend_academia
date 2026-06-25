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

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCycle, setSelectedCycle] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    // Modals
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
            setTeachers(teachersRes.data);
            setCycles(cyclesRes.data);

            // Get unique subjects
            const uniqueSubjects = Array.from(new Set(subjectsRes.data.map((s: any) => s.name)));
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

            // Map cycle name to cycle ID for backend compatibility
            if (formData.cycle) {
                const found = cycles.find(c => c.name === formData.cycle);
                if (found) payload.cycleIds = [found.id];
            }

            if (!isEditing && !payload.password) payload.password = 'Pass1234'; // Default password

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
            password: '', // Don't show password
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

        // Handle cycles array from backend
        const matchesCycle = selectedCycle === '' ||
            (t.cycles && t.cycles.some((c: any) => c.name === selectedCycle)) ||
            (t.cycle === selectedCycle); // Fallback for old data

        const matchesSubject = selectedSubject === '' || (t.specialties && t.specialties.includes(selectedSubject));
        return matchesSearch && matchesCycle && matchesSubject;
    });

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Corps Enseignant</h2>
                    <p className="text-slate-500">Gérez les professeurs et leurs spécialités par cycle.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        <Download size={18} /> {exporting ? 'Exportation...' : 'Exporter Liste'}
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-600 text-white px-8 py-3  font-extrabold flex items-center gap-2 shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <UserPlus size={18} /> Nouvel Enseignant
                    </button>
                </div>
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

            <div className="bg-white ] shadow-xl   overflow-hidden mb-10">
                <div className="p-8   flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <select
                            value={selectedCycle}
                            onChange={(e) => setSelectedCycle(e.target.value)}
                            className="bg-slate-50 border-none  px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                        >
                            <option value="">Tous les Cycles</option>
                            {cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="bg-slate-50 border-none  px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                        >
                            <option value="">Toutes les Matières</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher (Nom, Email)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-50 border-none  pl-12 pr-6 py-3 text-sm focus:ring-4 focus:ring-blue-600/5 transition-all outline-none w-full md:w-[300px]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-4">Nom & Prénom</th>
                                <th className="px-8 py-4">Cycle</th>
                                <th className="px-8 py-4">Spécialités</th>
                                <th className="px-8 py-4">Contact</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10  bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                                {teacher.firstName[0]}{teacher.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 uppercase text-xs">{teacher.lastName} {teacher.firstName}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{teacher.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.cycles && teacher.cycles.length > 0 ? teacher.cycles.map((c: any) => (
                                                <span key={c.id} className="px-3 py-1 bg-slate-100 text-slate-600  text-[10px] font-black uppercase">
                                                    {c.name}
                                                </span>
                                            )) : <span className="text-[10px] text-slate-400 italic">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.specialties?.map((s: string) => (
                                                <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600  text-[9px] font-bold">
                                                    {s}
                                                </span>
                                            )) || <span className="text-slate-300 italic text-[10px]">Aucune</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="text-xs text-slate-500">{teacher.email}</span>
                                        </div>
                                        {teacher.phone && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone size={14} className="text-slate-400" />
                                                <span className="text-xs text-slate-500">{teacher.phone}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(teacher)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50  transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDialog({ isOpen: true, id: teacher.id })}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50  transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTeachers.length === 0 && !loading && (
                        <div className="p-20 text-center">
                            <SearchX size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">Aucun enseignant trouvé correspondant aux critères.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TEACHER */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg ] p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800">{isEditing ? "Modifier l'Enseignant" : "Inscrire un Enseignant"}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none focus:bg-white focus:"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none focus:bg-white focus:"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none focus:bg-white focus:"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none focus:bg-white focus:"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            {!isEditing && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
                                    <input
                                        type="password"
                                        placeholder="Optionnel"
                                        className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none focus:bg-white focus:"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle Principal</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50    text-sm font-bold text-slate-700 outline-none focus:bg-white focus:"
                                    value={formData.cycle}
                                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                                >
                                    <option value="">Choisir un cycle...</option>
                                    {cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spécialités (Matières)</label>
                                <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50  max-h-40 overflow-y-auto">
                                    {subjects.map(subject => (
                                        <label key={subject} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.specialties.includes(subject)}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...formData.specialties, subject]
                                                        : formData.specialties.filter(s => s !== subject);
                                                    setFormData({ ...formData, specialties: updated });
                                                }}
                                                className="  text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">{subject}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateOrUpdate}
                            disabled={loading || !formData.firstName || !formData.lastName || !formData.email}
                            className="w-full mt-8 py-4 bg-blue-600 text-white  font-black shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Traitement...' : isEditing ? 'Mettre à jour' : 'Inscrire l\'enseignant'}
                        </button>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm ] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500  flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} /></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Supprimer ?</h3>
                        <p className="text-slate-500 text-sm mb-8">Êtes-vous sûr de vouloir supprimer ce compte enseignant ? Cette action est irréversible.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDialog({ isOpen: false, id: null })} className="flex-1 py-4  font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all">Annuler</button>
                            <button onClick={handleDelete} className="flex-1 py-4  font-black bg-red-500 text-white shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Staff;
