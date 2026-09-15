import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, UserCheck, X, Edit, Trash2, AlertCircle, CheckCircle2, Star, BookOpen, Layers } from 'lucide-react';
import api from '../../../api/axios';
import TeacherEditModal from './TeacherEditModal';

interface TeacherListProps {
    role: 'DIRECTION' | 'PROVISORIAT' | 'PDG';
    institutionId?: number;
    ceoId?: number;
}

const TeacherList: React.FC<TeacherListProps> = ({ institutionId, ceoId }) => {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterInstitutionId, setFilterInstitutionId] = useState('');
    const [filterCycleId, setFilterCycleId] = useState('');
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);

    const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchTeachers();
        if (ceoId) {
            fetchFiltersData();
        }
    }, []);

    const fetchFiltersData = async () => {
        try {
            const [instRes, cycleRes] = await Promise.all([
                api.get(`/institutions/ceo/${ceoId}`),
                api.get(`/cycles?ceoId=${ceoId}`)
            ]);
            setInstitutions(instRes.data || []);
            setCycles(cycleRes.data || []);
        } catch (error) {
            console.error("Error fetching filter data", error);
        }
    };

    const availableCycles = filterInstitutionId
        ? cycles.filter(c => c.institution?.id === Number(filterInstitutionId))
        : cycles;

    useEffect(() => {
        if (filterCycleId && !availableCycles.find(c => c.id === Number(filterCycleId))) {
            setFilterCycleId('');
        }
    }, [filterInstitutionId, availableCycles, filterCycleId]);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (institutionId) params.append('institutionId', institutionId.toString());
            if (ceoId) params.append('ceoId', ceoId.toString());
            const qs = params.toString() ? `?${params.toString()}` : '';

            const res = await api.get(`/teachers${qs}`);
            setTeachers(res.data || []);
        } catch (error) {
            console.error("Error fetching teachers:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTeacher = async (id: number) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet enseignant ?")) return;
        try {
            await api.delete(`/teachers/${id}`);
            setMessage({ type: 'success', text: 'Enseignant supprimé avec succès.' });
            fetchTeachers();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        }
    };

    const filteredTeachers = teachers.filter(t => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (t.firstName?.toLowerCase() + ' ' + t.lastName?.toLowerCase()).includes(searchLower) ||
            t.email?.toLowerCase().includes(searchLower) ||
            t.specialties?.some((s: string) => s.toLowerCase().includes(searchLower));

        const matchesInst = filterInstitutionId ? t.institution?.id === Number(filterInstitutionId) : true;
        const matchesCycle = filterCycleId ? t.cycles?.some((c: any) => c.id === Number(filterCycleId)) : true;

        return matchesSearch && matchesInst && matchesCycle;
    });

    return (
        <div className="space-y-6">
            {message.text && (
                <div className={`p-4 rounded-xl font-bold text-xs flex items-center justify-between gap-3 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={16} /></button>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, matière ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                {ceoId && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <select
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2.5 text-xs font-bold rounded-xl outline-none"
                            value={filterInstitutionId}
                            onChange={(e) => setFilterInstitutionId(e.target.value)}
                        >
                            <option value="">Tous les établissements</option>
                            {institutions.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                        <select
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2.5 text-xs font-bold rounded-xl outline-none"
                            value={filterCycleId}
                            onChange={(e) => setFilterCycleId(e.target.value)}
                        >
                            <option value="">Tous les cycles</option>
                            {availableCycles.map(cycle => (
                                <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl uppercase tracking-wider whitespace-nowrap">
                    {filteredTeachers.length} Enseignants
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des enseignants...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map(teacher => (
                        <div
                            key={teacher.id}
                            onClick={() => setSelectedTeacher(teacher)}
                            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg uppercase shadow-md shrink-0">
                                    {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {teacher.lastName} {teacher.firstName}
                                    </h4>
                                    {!institutionId && teacher.institution && (
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate mt-0.5">
                                            {teacher.institution.name}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < Math.floor(teacher.rating || 4.5) ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{teacher.rating || 4.5}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {teacher.cycles?.map((c: any) => (
                                            <span key={c.id} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md text-[9px] font-bold uppercase">
                                                {c.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 text-xs text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-slate-400 shrink-0" />
                                    <span>{teacher.phone || "Non renseigné"}</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex -space-x-1.5">
                                    {teacher.specialties?.slice(0, 3).map((s: string, i: number) => (
                                        <div key={i} className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold border border-white dark:border-slate-900" title={s}>
                                            {s.charAt(0)}
                                        </div>
                                    ))}
                                    {teacher.specialties?.length > 3 && (
                                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[9px] font-bold border border-white dark:border-slate-900">
                                            +{teacher.specialties.length - 3}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteTeacher(teacher.id); }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Teacher Details Modal */}
            {selectedTeacher && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setSelectedTeacher(null)} />
                    <div className="fixed inset-y-0 right-0 max-w-2xl w-full flex">
                        <div className="h-full w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                            {/* Header */}
                            <div className="bg-slate-900 p-6 text-white relative">
                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={() => setSelectedTeacher(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                                        <X size={18} />
                                    </button>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                                    >
                                        <Edit size={14} /> Modifier
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold shadow-lg backdrop-blur-xl">
                                        {selectedTeacher.firstName?.charAt(0)}{selectedTeacher.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold uppercase tracking-tight">{selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-slate-400">
                                            <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase">
                                                Enseignant
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                                <Star size={12} fill="currentColor" /> {selectedTeacher.rating || 4.5}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <InfoCard label="Sexe" value={selectedTeacher.gender || 'N/A'} icon={<UserCheck size={16} />} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/40" />
                                    <InfoCard label="Présence" value={(selectedTeacher.attendanceRate || 98) + '%'} icon={<CheckCircle2 size={16} />} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/40" />
                                    <InfoCard label="Matières" value={selectedTeacher.specialties?.length || 0} icon={<BookOpen size={16} />} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-950/40" />
                                    <InfoCard label="Classes" value={selectedTeacher.classes?.length || 0} icon={<Layers size={16} />} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-950/40" />
                                </div>

                                <div className="space-y-6">
                                    <Section title="Informations Personnelles">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <DetailItem label="Email" value={selectedTeacher.email} icon={<Mail size={16} />} />
                                            <DetailItem label="Téléphone" value={selectedTeacher.phone || 'Non renseigné'} icon={<Phone size={16} />} />
                                        </div>
                                    </Section>

                                    <Section title="Spécialités & Matières">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTeacher.specialties?.map((s: string) => (
                                                <span key={s} className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg uppercase">
                                                    {s}
                                                </span>
                                            ))}
                                            {(!selectedTeacher.specialties || selectedTeacher.specialties.length === 0) && (
                                                <p className="text-slate-400 italic text-xs">Aucune spécialité renseignée</p>
                                            )}
                                        </div>
                                    </Section>

                                    <Section title="Cycles d'Enseignement">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTeacher.cycles?.map((c: any) => (
                                                <span key={c.id} className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase">
                                                    {c.name}
                                                </span>
                                            ))}
                                            {(!selectedTeacher.cycles || selectedTeacher.cycles.length === 0) && (
                                                <p className="text-slate-400 italic text-xs">Aucun cycle renseigné</p>
                                            )}
                                        </div>
                                    </Section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedTeacher && (
                <TeacherEditModal
                    teacher={selectedTeacher}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        fetchTeachers();
                        setSelectedTeacher(null);
                    }}
                />
            )}
        </div>
    );
};

const Section = ({ title, children }: any) => (
    <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" /> {title}
        </h4>
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, icon }: any) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const InfoCard = ({ label, value, icon, color, bg }: any) => (
    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col items-center text-center">
        <div className={`w-8 h-8 ${bg} ${color} rounded-xl flex items-center justify-center mb-2`}>
            {icon}
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-base font-black text-slate-900 dark:text-white">{value}</p>
    </div>
);

export default TeacherList;
