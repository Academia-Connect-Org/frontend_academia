import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, UserX, MapPin, X, Calendar, GraduationCap, Edit, Trash2, AlertCircle, CheckCircle2, MessageSquare, FileText, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import BulletinModal from './BulletinModal';

interface StudentListProps {
    role: 'DIRECTION' | 'PROVISORIAT' | 'SECRETARIAT' | 'PDG';
    institutionId?: number;
}

const StudentList: React.FC<StudentListProps> = ({ role, institutionId }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    // Filters
    const [selectedCycle, setSelectedCycle] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const [loading, setLoading] = useState<boolean>(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // CRUD Modals
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
    const [isBulletinOpen, setIsBulletinOpen] = useState(false);
    const [viewingStudent, setViewingStudent] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        birthDate: '',
        gender: '',
        address: '',
        studentIdNumber: '',
        classeId: '' as string | number,
        cycleId: '' as string | number,
        motherFirstName: '',
        motherLastName: '',
        motherEmail: '',
        motherPhone: '',
        fatherFirstName: '',
        fatherLastName: '',
        fatherEmail: '',
        fatherPhone: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, [institutionId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const params = institutionId ? `?institutionId=${institutionId}` : '';
            const [cyclesRes, classesRes, studentsRes] = await Promise.all([
                api.get(`/cycles${params}`).catch(() => ({ data: [] })),
                api.get(`/classes${params}`).catch(() => ({ data: [] })),
                api.get(`/students${params}`).catch(() => ({ data: [] }))
            ]);
            setCycles(cyclesRes.data);
            setClasses(classesRes.data);
            setStudents(studentsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            setLoading(true);
            const payload = {
                ...formData,
                cycleId: formData.cycleId ? Number(formData.cycleId) : null,
                classeId: formData.classeId ? Number(formData.classeId) : null,
                institutionId: institutionId
            };
            if (isEditing && editingId) {
                await api.put(`/students/${editingId}`, payload);
                setMessage({ type: 'success', text: 'Profil élève mis à jour.' });
            } else {
                if (!payload.password) payload.password = 'Pass1234';
                await api.post('/students/enroll', payload);
                setMessage({ type: 'success', text: 'Élève inscrit avec succès.' });
            }
            setShowModal(false);
            resetForm();
            fetchInitialData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Une erreur est survenue.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            setLoading(true);
            await api.delete(`/students/${confirmDelete.id}`);
            setMessage({ type: 'success', text: 'Élève supprimé.' });
            setConfirmDelete({ isOpen: false, id: null });
            fetchInitialData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            birthDate: '',
            gender: '',
            address: '',
            studentIdNumber: '',
            classeId: '',
            cycleId: '',
            motherFirstName: '',
            motherLastName: '',
            motherEmail: '',
            motherPhone: '',
            fatherFirstName: '',
            fatherLastName: '',
            fatherEmail: '',
            fatherPhone: ''
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const openEditModal = (student: any) => {
        setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            email: student.email || '',
            phone: student.phone || '',
            password: '',
            birthDate: student.birthDate || '',
            gender: student.gender || '',
            address: student.address || '',
            studentIdNumber: student.studentIdNumber || '',
            classeId: student.classe?.id || '',
            cycleId: student.classe?.cycle?.id || '',
            motherFirstName: student.motherFirstName || '',
            motherLastName: student.motherLastName || '',
            motherEmail: student.motherEmail || '',
            motherPhone: student.motherPhone || '',
            fatherFirstName: student.fatherFirstName || '',
            fatherLastName: student.fatherLastName || '',
            fatherEmail: student.fatherEmail || '',
            fatherPhone: student.fatherPhone || ''
        });
        setIsEditing(true);
        setEditingId(student.id);
        setShowModal(true);
    };

    const filteredClasses = selectedCycle ? classes.filter((c: any) => c.cycle?.name === selectedCycle) : classes;
    const formFilteredClasses = formData.cycleId ? classes.filter((c: any) => String(c.cycle?.id) === String(formData.cycleId)) : classes;

    const filteredStudents = Array.isArray(students) ? students.filter(student => {
        const matchCycle = selectedCycle ? student.classe?.cycle?.name === selectedCycle : true;
        const matchClass = selectedClass ? student.classe?.id?.toString() === selectedClass : true;
        const searchLower = searchQuery.toLowerCase();
        const matchSearch = (student.firstName?.toLowerCase() + ' ' + student.lastName?.toLowerCase()).includes(searchLower) ||
            student.studentIdNumber?.toLowerCase().includes(searchLower);
        return matchCycle && matchClass && matchSearch;
    }) : [];

    const closePopup = () => setSelectedStudent(null);

    return (
        <div className="space-y-6">
            {isBulletinOpen && viewingStudent && (
                <BulletinModal
                    studentId={viewingStudent}
                    trimester="1er Trimestre" // Default, could be made selectable
                    academicYear="2025-2026"
                    onClose={() => setIsBulletinOpen(false)}
                />
            )}
            {message.text && (
                <div className={`p-4 rounded-2xl mb-6 font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                </div>
            )}


            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-end justify-between">
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recherche</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Nom, prénom, matricule..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-200 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle</label>
                        <select
                            value={selectedCycle}
                            onChange={(e) => { setSelectedCycle(e.target.value); setSelectedClass(''); }}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-blue-200"
                        >
                            <option value="">Tous les cycles</option>
                            {cycles.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classe</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-blue-200 disabled:opacity-50"
                        >
                            <option value="">Toutes les classes</option>
                            {filteredClasses.map((c: any) => (
                                <option key={c.id} value={c.id.toString()}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading && students.length === 0 ? (
                <div className="py-20 text-center animate-pulse">
                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 border-4 border-slate-50 border-t-indigo-500 animate-spin"></div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Chargement des données...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-2 overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                                    <th className="px-10 py-6">Matricule</th>
                                    <th className="px-10 py-6">Profil Élève</th>
                                    <th className="px-10 py-6">Affectation</th>
                                    <th className="px-10 py-6">Responsables Légaux</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.map((student: any) => (
                                    <tr key={student.id} className="hover:bg-slate-50/80 group transition-all cursor-pointer">
                                        <td className="px-10 py-6" onClick={() => setSelectedStudent(student)}>
                                            <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg tracking-widest uppercase border border-slate-100">
                                                {student.studentIdNumber || '—'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6" onClick={() => setSelectedStudent(student)}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-sm uppercase shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                                                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase text-xs tracking-tight group-hover:text-indigo-600 transition-colors">{student.lastName} {student.firstName}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{student.gender || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6" onClick={() => setSelectedStudent(student)}>
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black tracking-tight border border-indigo-100">{student.classe?.name || 'Non assignée'}</span>
                                                <span className="text-[9px] uppercase font-black tracking-[0.1em] text-slate-300 ml-1">{student.classe?.cycle?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6" onClick={() => setSelectedStudent(student)}>
                                            <div className="text-[11px] space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1 rounded bg-rose-50 text-rose-500 font-black text-[8px] uppercase">M</span>
                                                    <span className="font-bold text-slate-600 truncate max-w-[120px]">{student.motherFirstName} {student.motherLastName || ''}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1 rounded bg-blue-50 text-blue-500 font-black text-[8px] uppercase">P</span>
                                                    <span className="font-bold text-slate-600 truncate max-w-[120px]">{student.fatherFirstName} {student.fatherLastName || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingStudent(student.id);
                                                        setIsBulletinOpen(true);
                                                    }}
                                                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    title="Voir Bulletin"
                                                >
                                                    <ClipboardList size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(student); }}
                                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete({ isOpen: true, id: student.id }); }}
                                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredStudents.length === 0 && !loading && (
                            <div className="py-24 text-center bg-slate-50/30 rounded-[32px] m-4 border-2 border-dashed border-slate-100">
                                <UserX size={48} className="mx-auto text-slate-200 mb-6 stroke-[1]" />
                                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Aucun dossier trouvé</p>
                                <p className="text-slate-300 text-sm mt-1">Ajustez vos filtres ou inscrivez un nouvel élève.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL STUDENT CRUD */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-3xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-200 relative">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{isEditing ? "Mise à jour Dossier" : "Fiche d'Inscription"}</h3>
                                <p className="text-slate-400 text-sm mt-1 font-medium italic">Les champs avec * sont recommandés pour le suivi administratif.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all hover:bg-red-50"><X size={24} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-h-[60vh] overflow-y-auto px-2 scrollbar-hide pb-6">
                            <SectionTitle title="État Civil de l'Élève" />
                            <Input label="Prénom" value={formData.firstName} onChange={(v: string) => setFormData({ ...formData, firstName: v })} />
                            <Input label="Nom de famille" value={formData.lastName} onChange={(v: string) => setFormData({ ...formData, lastName: v })} />
                            <Input label="Email de l'élève (Si applicable)" type="email" placeholder="élève@école.com" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} />
                            <Input label="Matricule / ID École" placeholder="MAT-2024-XXX" value={formData.studentIdNumber} onChange={(v: string) => setFormData({ ...formData, studentIdNumber: v })} />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sexe</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Masculin', 'Féminin'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            className={`py-3.5 rounded-xl border font-black text-xs transition-all ${formData.gender === g ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                        >
                                            {g.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Input label="Date de Naissance" type="date" value={formData.birthDate} onChange={(v: string) => setFormData({ ...formData, birthDate: v })} />
                            <div className="col-span-full">
                                <Input label="Adresse Résidentielle" placeholder="Quartier, Rue, Porte..." value={formData.address} onChange={(v: string) => setFormData({ ...formData, address: v })} />
                            </div>

                            <SectionTitle title="Parcours Scolaire" />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle d'affectation</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-indigo-200"
                                    value={formData.cycleId}
                                    onChange={(e) => setFormData({ ...formData, cycleId: e.target.value, classeId: '' })}
                                >
                                    <option value="">Choisir un cycle...</option>
                                    {cycles.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Niveau / Classe précis</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-indigo-200 disabled:opacity-50"
                                    value={formData.classeId}
                                    disabled={!formData.cycleId}
                                    onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                                >
                                    <option value="">Choisir une classe...</option>
                                    {formFilteredClasses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <SectionTitle title="Contacts Parents (Optionnels - Recommandés)" />
                            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                                <div className="space-y-4">
                                    <h5 className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Dossier Mère
                                    </h5>
                                    <Input label="Prénom" value={formData.motherFirstName} onChange={(v: string) => setFormData({ ...formData, motherFirstName: v })} />
                                    <Input label="Nom" value={formData.motherLastName} onChange={(v: string) => setFormData({ ...formData, motherLastName: v })} />
                                    <Input label="Email *" type="email" placeholder="mère@email.com" value={formData.motherEmail} onChange={(v: string) => setFormData({ ...formData, motherEmail: v })} />
                                    <Input label="Téléphone *" placeholder="+235 ..." value={formData.motherPhone} onChange={(v: string) => setFormData({ ...formData, motherPhone: v })} />
                                </div>
                                <div className="space-y-4 border-l border-slate-100 pl-8">
                                    <h5 className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Dossier Père
                                    </h5>
                                    <Input label="Prénom" value={formData.fatherFirstName} onChange={(v: string) => setFormData({ ...formData, fatherFirstName: v })} />
                                    <Input label="Nom" value={formData.fatherLastName} onChange={(v: string) => setFormData({ ...formData, fatherLastName: v })} />
                                    <Input label="Email *" type="email" placeholder="père@email.com" value={formData.fatherEmail} onChange={(v: string) => setFormData({ ...formData, fatherEmail: v })} />
                                    <Input label="Téléphone *" placeholder="+235 ..." value={formData.fatherPhone} onChange={(v: string) => setFormData({ ...formData, fatherPhone: v })} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-3xl font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">Abandonner</button>
                            <button
                                onClick={handleCreateOrUpdate}
                                disabled={loading || !formData.firstName || !formData.lastName || !formData.classeId}
                                className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 tracking-tight"
                            >
                                {loading ? 'Enregistrement en cours...' : isEditing ? 'Appliquer les modifications' : 'Finaliser l\'inscription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE */}
            {confirmDelete.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-all"><AlertCircle size={40} /></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Suprimer ce dossier ?</h3>
                        <p className="text-slate-500 text-sm mb-10 leading-relaxed italic">Attention : cette action est définitive et supprimera toutes les notes, absences et données liées à cet élève.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDelete({ isOpen: false, id: null })} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Annuler</button>
                            <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl font-black bg-red-500 text-white shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-widest">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Detail Popup (Read Only View) */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-10 text-white relative">
                            <button onClick={closePopup} className="absolute top-8 right-8 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all backdrop-blur-md">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-8">
                                <div className="w-28 h-28 rounded-[36px] bg-white/10 flex items-center justify-center font-black text-5xl shadow-2xl backdrop-blur-xl border border-white/10 uppercase ring-4 ring-white/10">
                                    {selectedStudent.firstName?.charAt(0)}{selectedStudent.lastName?.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-black uppercase tracking-tight leading-tight">{selectedStudent.lastName} <br /> {selectedStudent.firstName}</h3>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <span className="flex items-center gap-2 bg-emerald-400/20 text-emerald-300 border border-emerald-400/20 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase backdrop-blur-md">
                                            <CheckCircle2 size={12} /> Scolarisé
                                        </span>
                                        <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase backdrop-blur-md">
                                            {selectedStudent.studentIdNumber || 'ID PROVISOIRE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 grid grid-cols-2 gap-10 bg-slate-50/20">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                        <div className="w-6 h-px bg-slate-200"></div> Données Personnelles
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                            <DetailItem icon={<Mail size={16} />} label="Identifiant" value={selectedStudent.email || 'Non généré'} />
                                            {selectedStudent.id && (
                                                <button
                                                    onClick={() => {
                                                        const prefill = encodeURIComponent(`Bonjour ${selectedStudent.firstName}, je vous contacte concernant votre dossier scolaire...`);
                                                        navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${selectedStudent.id}&prefill=${prefill}`);
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all"
                                                    title="Envoyer un message à l'élève"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <DetailItem icon={<Calendar size={16} />} label="Naissance" value={selectedStudent.birthDate ? new Date(selectedStudent.birthDate).toLocaleDateString('fr-FR') : 'Non renseigné'} />
                                        <DetailItem icon={<MapPin size={16} />} label="Demeure à" value={selectedStudent.address || 'Adresse inconnue'} />
                                        <DetailItem icon={<GraduationCap size={16} />} label="Classe" value={selectedStudent.classe?.name || 'Non rattaché'} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                    <div className="w-6 h-px bg-slate-200"></div> Responsables Parents
                                </h4>
                                <div className="space-y-4">
                                    <ParentCard
                                        gender="F"
                                        name={`${selectedStudent.motherFirstName} ${selectedStudent.motherLastName}`}
                                        email={selectedStudent.motherEmail}
                                        phone={selectedStudent.motherPhone}
                                        onMessage={() => {
                                            const prefill = encodeURIComponent(`Bonjour, je vous contacte concernant le dossier de votre enfant ${selectedStudent.firstName} ${selectedStudent.lastName}...`);
                                            navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${selectedStudent.motherAccount?.id}&prefill=${prefill}`);
                                        }}
                                        parentId={selectedStudent.motherAccount?.id}
                                    />
                                    <ParentCard
                                        gender="M"
                                        name={`${selectedStudent.fatherFirstName} ${selectedStudent.fatherLastName}`}
                                        email={selectedStudent.fatherEmail}
                                        phone={selectedStudent.fatherPhone}
                                        onMessage={() => {
                                            const prefill = encodeURIComponent(`Bonjour, je vous contacte concernant le dossier de votre enfant ${selectedStudent.firstName} ${selectedStudent.lastName}...`);
                                            navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${selectedStudent.fatherAccount?.id}&prefill=${prefill}`);
                                        }}
                                        parentId={selectedStudent.fatherAccount?.id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// UI Helpers
const SectionTitle = ({ title }: { title: string }) => (
    <div className="col-span-full mt-6 first:mt-0 flex items-center gap-4">
        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap">
            {title}
        </h4>
        <div className="h-px bg-slate-100 flex-1"></div>
    </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder = '' }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-300 outline-none transition-all placeholder:text-slate-300 shadow-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const DetailItem = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-4 animate-in slide-in-from-left-2 duration-300">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-indigo-500">
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-700 tracking-tight">{value}</p>
        </div>
    </div>
);

const ParentCard = ({ gender, name, email, phone, onMessage, parentId }: any) => (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${gender === 'M' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                    {gender}
                </span>
                <p className="text-xs font-black text-slate-800 uppercase group-hover:text-indigo-600 transition-colors truncate">{name || 'Non renseigné'}</p>
            </div>
            <button
                onClick={onMessage}
                disabled={!parentId}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-lg ${parentId ? 'bg-indigo-600 text-white shadow-indigo-600/30 hover:scale-110' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                title={parentId ? "Contacter le parent" : "Compte parent non disponible"}
            >
                <MessageSquare size={16} />
            </button>
        </div>
        <div className="space-y-1.5 pl-1 relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <Mail size={12} className="text-slate-200" /> {email || 'Aucun email'}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <Phone size={12} className="text-slate-200" /> {phone || 'Pas de numéro'}
            </div>
        </div>
        {!parentId && (
            <div className="absolute top-0 right-0 p-1">
                <span className="text-[7px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Pas de compte</span>
            </div>
        )}
    </div>
);

export default StudentList;
