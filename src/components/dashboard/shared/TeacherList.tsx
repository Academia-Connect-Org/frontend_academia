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
            setInstitutions(instRes.data);
            setCycles(cycleRes.data);
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
            setTeachers(res.data);
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
                <div className={`p-4  mb-6 font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600  ' : 'bg-red-50 text-red-600  '}`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                </div>
            )}

            <div className="bg-white p-6 ] shadow-sm   flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, matière ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50    text-sm font-bold text-slate-700 focus:bg-white focus: outline-none transition-all"
                    />
                </div>
                {ceoId && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <select
                            className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2.5 text-xs sm:text-sm font-bold outline-none focus:border-indigo-500 w-full sm:w-auto"
                            value={filterInstitutionId}
                            onChange={(e) => setFilterInstitutionId(e.target.value)}
                        >
                            <option value="">Tous les établissements</option>
                            {institutions.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                        <select
                            className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2.5 text-xs sm:text-sm font-bold outline-none focus:border-indigo-500 w-full sm:w-auto"
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
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700  text-xs font-black uppercase tracking-widest  ">
                        {filteredTeachers.length} Enseignants
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-12 h-12     animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Chargement des enseignants...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map(teacher => (
                        <div
                            key={teacher.id}
                            onClick={() => setSelectedTeacher(teacher)}
                            className="bg-white ] p-6 shadow-sm   hover:shadow-xl hover: transition-all group cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50  blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-100/50 transition-colors"></div>

                            <div className="flex items-start gap-4 mb-6 relative z-10">
                                <div className="w-16 h-16  bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-xl uppercase shadow-lg shadow-indigo-600/20 group-hover:rotate-3 transition-transform">
                                    {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                                        {teacher.lastName} {teacher.firstName}
                                    </h4>
                                    {!institutionId && teacher.institution && (
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest truncate mt-0.5">
                                            {teacher.institution.name}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={8} fill={i < Math.floor(teacher.rating || 4.5) ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400">{teacher.rating || 4.5}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2.5">
                                        {teacher.cycles?.map((c: any) => (
                                            <span key={c.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-600    text-[8px] font-black uppercase tracking-tighter">
                                                {c.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5 mb-6 relative z-10">
                                <div className="flex items-center gap-3 text-slate-500 group/item">
                                    <div className="w-8 h-8  bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-indigo-500 group-hover/item:bg-indigo-50 transition-colors">
                                        <Mail size={14} />
                                    </div>
                                    <span className="text-xs font-bold truncate tracking-tight">{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 group/item">
                                    <div className="w-8 h-8  bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-indigo-500 group-hover/item:bg-indigo-50 transition-colors">
                                        <Phone size={14} />
                                    </div>
                                    <span className="text-xs font-bold tracking-tight">{teacher.phone || "Non renseigné"}</span>
                                </div>
                            </div>

                            <div className="pt-4   relative z-10 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {teacher.specialties?.slice(0, 3).map((s: string, i: number) => (
                                        <div key={i} className="w-8 h-8  bg-white   flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm" title={s}>
                                            {s.charAt(0)}
                                        </div>
                                    ))}
                                    {teacher.specialties?.length > 3 && (
                                        <div className="w-8 h-8  bg-slate-100   flex items-center justify-center text-[9px] font-black text-slate-400 shadow-sm">
                                            +{teacher.specialties.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteTeacher(teacher.id); }}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50  transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Teacher Details Slide-over/Panel */}
            {selectedTeacher && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTeacher(null)}></div>
                    <div className="fixed inset-y-0 right-0 max-w-2xl w-full flex">
                        <div className="h-full w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                            {/* Header */}
                            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10  blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <button onClick={() => setSelectedTeacher(null)} className="w-10 h-10 bg-white/10  flex items-center justify-center hover:bg-white/20 transition-all">
                                        <X size={20} />
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="bg-indigo-600 px-6 py-2  text-sm font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                                        >
                                            <Edit size={16} /> Modifier
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-24 h-24  bg-white/10   flex items-center justify-center text-4xl font-black shadow-2xl backdrop-blur-xl">
                                        {selectedTeacher.firstName?.charAt(0)}{selectedTeacher.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tight">{selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
                                        <div className="flex items-center gap-3 mt-2 text-slate-400">
                                            <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1  text-[10px] font-black tracking-widest uppercase  ">
                                                Enseignant
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-bold">
                                                <Star size={14} className="text-amber-400" fill="currentColor" /> {selectedTeacher.rating || 4.5}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                                {/* Bio & Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <InfoCard label="Sexe" value={selectedTeacher.gender || 'N/A'} icon={<UserCheck size={18} />} color="text-blue-600" bg="bg-blue-50" />
                                    <InfoCard label="Presence" value={(selectedTeacher.attendanceRate || 98) + '%'} icon={<CheckCircle2 size={18} />} color="text-emerald-600" bg="bg-emerald-50" />
                                    <InfoCard label="Matières" value={selectedTeacher.specialties?.length || 0} icon={<BookOpen size={18} />} color="text-indigo-600" bg="bg-indigo-50" />
                                    <InfoCard label="Classes" value={selectedTeacher.classes?.length || 0} icon={<Layers size={18} />} color="text-purple-600" bg="bg-purple-50" />
                                </div>

                                {/* Information Sections */}
                                <div className="space-y-8">
                                    <Section title="Informations Personnelles">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <DetailItem label="Email" value={selectedTeacher.email} icon={<Mail size={16} />} />
                                            <DetailItem label="Téléphone" value={selectedTeacher.phone || 'Non renseigné'} icon={<Phone size={16} />} />
                                            <DetailItem label="Status" value="Actif" icon={<UserCheck size={16} />} />
                                        </div>
                                    </Section>

                                    <Section title="Spécialités & Matières">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTeacher.specialties?.map((s: string) => (
                                                <span key={s} className="px-4 py-2 bg-indigo-50 text-indigo-700  text-xs font-black   uppercase tracking-tighter">
                                                    {s}
                                                </span>
                                            ))}
                                            {(!selectedTeacher.specialties || selectedTeacher.specialties.length === 0) && (
                                                <p className="text-slate-400 italic text-sm">Aucune spécialité renseignée</p>
                                            )}
                                        </div>
                                    </Section>

                                    <Section title="Cycles d'Enseignement">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTeacher.cycles?.map((c: any) => (
                                                <span key={c.id} className="px-4 py-2 bg-slate-900 text-white  text-xs font-black uppercase tracking-widest shadow-lg">
                                                    {c.name}
                                                </span>
                                            ))}
                                            {(!selectedTeacher.cycles || selectedTeacher.cycles.length === 0) && (
                                                <p className="text-slate-400 italic text-sm">Aucun cycle renseigné</p>
                                            )}
                                        </div>
                                    </Section>

                                    <Section title="Classes d'Intervention">
                                        <div className="flex flex-wrap gap-3">
                                            {selectedTeacher.classes?.map((c: any) => (
                                                <div key={c.id} className="flex flex-col bg-slate-50    p-4 min-w-[160px]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-2 h-2  bg-emerald-500"></div>
                                                        <span className="text-xs font-black text-slate-800 uppercase">{c.name}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedTeacher.classSubjects && selectedTeacher.classSubjects[c.id] ? (
                                                            selectedTeacher.classSubjects[c.id].map((subj: string) => (
                                                                <span key={subj} className="px-2 py-0.5 bg-white text-[9px] font-bold text-slate-500    italic">
                                                                    {subj}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[9px] text-slate-400 italic">Matière à définir</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {(!selectedTeacher.classes || selectedTeacher.classes.length === 0) && (
                                            <p className="text-slate-400 italic text-sm">Aucune classe pour cet enseignant</p>
                                        )}
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
    <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
            <div className="w-8 h-px bg-slate-200"></div> {title}
        </h4>
        <div className="bg-slate-50/50 p-6 ]  ">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, icon }: any) => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10  bg-white   shadow-sm flex items-center justify-center text-indigo-600">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-700">{value}</p>
        </div>
    </div>
);

const InfoCard = ({ label, value, icon, color, bg }: any) => (
    <div className="bg-white p-5    shadow-sm flex flex-col items-center justify-center text-center group transition-all hover:scale-105">
        <div className={`w-10 h-10 ${bg} ${color}  flex items-center justify-center mb-3 transition-transform group-hover:rotate-6`}>
            {icon}
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-slate-800 tracking-tight">{value}</p>
    </div>
);

export default TeacherList;
