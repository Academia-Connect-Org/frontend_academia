import React, { useState, useEffect } from 'react';
import {
    Download,
    ChevronDown,
    TrendingUp,
    Award,
    BarChart3,
    Search,
    AlertCircle,
    GraduationCap,
    Clock,
    Target,
    Star,
    User
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import BulletinModal from '../../../components/dashboard/shared/BulletinModal';

const ParentResults: React.FC = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [selectedChild, setSelectedChild] = useState<any>(null);
    const [allGrades, setAllGrades] = useState<any[]>([]);
    const [classSubjects, setClassSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gradesLoading, setGradesLoading] = useState(false);
    const [isBulletinOpen, setIsBulletinOpen] = useState(false);

    // Filters
    const [selectedTrimester, setSelectedTrimester] = useState('1er Trimestre');
    const [selectedYear, setSelectedYear] = useState('2025-2026');

    useEffect(() => {
        fetchInitialData();
    }, [user?.id]);

    useEffect(() => {
        if (selectedChild?.id) {
            fetchGrades(selectedChild.id, selectedChild.classe?.cycle?.id);
        }
    }, [selectedChild?.id]);

    const fetchInitialData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/dashboard/parent?userId=${user.id}`);
            const childList = res.data.children || [];
            setChildren(childList);

            const uniqueClasses: any[] = [];
            const classIds = new Set();
            childList.forEach((k: any) => {
                if (k.classe && !classIds.has(k.classe.id)) {
                    classIds.add(k.classe.id);
                    uniqueClasses.push(k.classe);
                }
            });
            setClasses(uniqueClasses);

            if (childList.length > 0) setSelectedChild(childList[0]);
        } catch (err) {
            console.error("Error fetching children:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGrades = async (studentId: number, cycleId?: number) => {
        setGradesLoading(true);
        try {
            const res = await api.get(`/submissions/student/${studentId}/results`);
            setAllGrades(res.data);

            if (cycleId) {
                try {
                    const subjRes = await api.get(`/subjects/cycle/${cycleId}`);
                    setClassSubjects(subjRes.data);
                } catch (e) {
                    console.error("Erreur lors du chargement des matières:", e);
                }
            } else {
                setClassSubjects([]);
            }
        } catch (err) {
            console.error("Erreur lors du chargement des notes:", err);
        } finally {
            setGradesLoading(false);
        }
    };

    const filteredGrades = allGrades.filter(g => {
        const matchYear = g.homework?.academicYear === selectedYear;
        const matchTrimestre = g.homework?.trimestre === selectedTrimester;
        const isPublished = g.homework?.gradesPublished;
        return matchYear && matchTrimestre && isPublished;
    });

    const averageGeneral = filteredGrades.length > 0
        ? (filteredGrades.reduce((acc, curr) => acc + (curr.grade || 0), 0) / filteredGrades.length).toFixed(2)
        : "0.00";

    const bestGrade = filteredGrades.length > 0
        ? Math.max(...filteredGrades.map(g => g.grade || 0))
        : "0";

    const filteredChildren = selectedClassId === 'all'
        ? children
        : children.filter(c => String(c.classe?.id) === selectedClassId);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16     animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement du profil parent...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {isBulletinOpen && selectedChild && (
                <BulletinModal
                    studentId={selectedChild.id}
                    trimester={selectedTrimester}
                    academicYear={selectedYear}
                    onClose={() => setIsBulletinOpen(false)}
                />
            )}

            {/* Header / Filter Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Award className="text-blue-600" size={36} />
                        Résultats Académiques
                    </h2>
                    <p className="text-slate-500 font-medium max-w-lg mt-1 italic">
                        Visualisez les notes certifiées et les progrès de vos enfants par trimestre.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full md:w-auto">
                    {classes.length > 1 && (
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="bg-white px-6 py-4 font-bold text-slate-600 outline-none transition-all shadow-sm text-xs uppercase tracking-widest w-full sm:w-auto"
                        >
                            <option value="all">Filtre: Toutes les classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}

                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="bg-white px-6 py-4 font-bold text-slate-600 outline-none transition-all shadow-sm text-xs w-full sm:w-auto"
                    >
                        <option value="2024-2025">Année: 2024-2025</option>
                        <option value="2025-2026">Année: 2025-2026</option>
                        <option value="2026-2027">Année: 2026-2027</option>
                    </select>

                    <button
                        onClick={() => setIsBulletinOpen(true)}
                        className="bg-slate-900 text-white px-6 sm:px-10 py-4 font-black flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all outline-none uppercase text-xs tracking-[0.1em] w-full sm:w-auto"
                    >
                        <Download size={18} /> Télécharger Bulletin
                    </button>
                </div>
            </div>

            {/* Child Selector & Trimester Toggle */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="bg-white p-2 shadow-xl flex items-center w-full lg:w-auto min-w-[250px]">
                    <div className="w-10 h-10 bg-blue-50 flex items-center justify-center text-blue-600 mr-2 shrink-0">
                        <User size={18} />
                    </div>
                    <select
                        value={selectedChild?.id || ''}
                        onChange={(e) => {
                            const child = filteredChildren.find((c: any) => c.id === Number(e.target.value));
                            if (child) setSelectedChild(child);
                        }}
                        className="bg-transparent flex-1 py-3 px-2 font-black text-xs text-slate-700 uppercase tracking-widest outline-none cursor-pointer"
                    >
                        {filteredChildren.map((child: any) => (
                            <option key={child.id} value={child.id}>
                                {child.firstName} {child.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex bg-white p-2 ]   shadow-lg">
                    {['1er Trimestre', '2ème Trimestre', '3ème Trimestre'].map(trim => (
                        <button
                            key={trim}
                            onClick={() => setSelectedTrimester(trim)}
                            className={`px-8 py-4 ] text-[10px] font-black uppercase tracking-widest transition-all ${selectedTrimester === trim ? 'bg-slate-100 text-blue-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {trim.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {selectedChild ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6 sm:space-y-10">
                        {/* Matrix Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <MatrixBlock label="Moyenne" value={averageGeneral} color="blue" icon={BarChart3} />
                            <MatrixBlock label="Meilleure Note" value={bestGrade} color="amber" icon={Star} trend="Record" />
                            <MatrixBlock label="Évaluations" value={filteredGrades.length} color="emerald" icon={Target} trend="Global" />
                        </div>

                        {/* Main Grades Table */}
                        <div className="bg-white shadow-2xl overflow-hidden min-h-[500px] relative">
                            {gradesLoading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center gap-4">
                                    <div className="w-10 h-10 animate-spin"></div>
                                    <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">Calcul des moyennes...</p>
                                </div>
                            )}

                            <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left gap-4 sm:gap-0 bg-slate-50/20">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Récapitulatif des Notes</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Période: {selectedTrimester} de {selectedChild.firstName}</p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white shadow-sm flex items-center justify-center text-blue-600 rounded-full sm:rounded-none">
                                    <TrendingUp size={24} />
                                </div>
                            </div>

                            <div className="p-0 sm:p-6 overflow-x-auto">
                                {filteredGrades.length === 0 && !gradesLoading ? (
                                    <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                                        <div className="w-20 h-20 bg-slate-50 flex items-center justify-center mb-6 grayscale opacity-50 rounded-full">
                                            <Search size={40} className="text-slate-300" />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-300 uppercase tracking-widest">Aucune note publiée</h4>
                                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-2 max-w-xs">Les professeurs n'ont pas encore saisi de notes pour ce trimestre.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="px-8 py-6">Matière / Évaluation</th>
                                                <th className="px-8 py-6">Date</th>
                                                <th className="px-8 py-6 text-center">Résultat</th>
                                                <th className="px-8 py-6 text-right">Observation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredGrades.map((row) => (
                                                <tr key={row.id} className="hover:bg-blue-50/20 group transition-all">
                                                    <td className="px-8 py-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10  bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                                                                {row.homework?.subject?.name?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-800 text-sm uppercase leading-none mb-1.5">{row.homework?.subject?.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{row.homework?.title}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 uppercase">
                                                                <Clock size={12} className="text-slate-300" /> {new Date(row.submittedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8 text-center">
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className={`text-xl font-black tracking-tighter ${row.grade >= (row.homework?.maxPoints * 0.7) ? 'text-emerald-500' : row.grade >= (row.homework?.maxPoints * 0.5) ? 'text-blue-500' : 'text-rose-500'}`}>
                                                                {row.grade}
                                                            </span>
                                                            <span className="text-[9px] font-black text-slate-300 uppercase">/{row.homework?.maxPoints}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8 text-right">
                                                        <span className="text-[11px] font-medium text-slate-400 italic max-w-[180px] block ml-auto truncate uppercase tracking-tighter">
                                                            {row.teacherFeedback || "Sans observation."}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 sm:space-y-10">
                        {/* Subject Progress Chart-like Sidebar */}
                        <div className="bg-slate-950 p-6 sm:p-12 text-white shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px] group-hover:scale-125 transition-transform duration-1000"></div>
                            <h3 className="text-xl font-black mb-6 sm:mb-10 relative z-10 flex items-center gap-4 italic tracking-tight">
                                <TrendingUp size={24} className="text-blue-400" /> Profil par Matière
                            </h3>
                            <div className="space-y-6 sm:space-y-10 relative z-10">
                                {
                                    (classSubjects.length > 0 
                                        ? classSubjects.map((s: any) => s.name)
                                        : Array.from(new Set(allGrades.map(g => g.homework?.subject?.name)))
                                    ).filter(Boolean).slice(0, 6).map((s: string) => {
                                    const subjGrades = filteredGrades.filter(g => g.homework?.subject?.name === s);
                                    const avg = subjGrades.length > 0
                                        ? subjGrades.reduce((acc, curr) => acc + curr.grade, 0) / subjGrades.length
                                        : 0;
                                    const max = subjGrades[0]?.homework?.maxPoints || 20;
                                    return (
                                        <div key={s}>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] italic">{s}</span>
                                                <span className="font-black text-sm text-white">{avg.toFixed(1)}<span className="text-blue-500/50 text-[10px] ml-1">/{max}</span></span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5  overflow-hidden p-0.5 shadow-inner">
                                                <div className="h-full bg-blue-500  shadow-lg transition-all duration-1000" style={{ width: `${(avg / max) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white p-6 sm:p-12 shadow-2xl relative overflow-hidden text-center group">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:rotate-12 transition-transform rounded-full sm:rounded-none">
                                <BarChart3 size={32} />
                            </div>
                            <h4 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 sm:mb-4">Moyenne Générale</h4>
                            <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter mb-6 sm:mb-8">
                                {averageGeneral}<span className="text-lg sm:text-xl text-slate-300 font-bold ml-2">/20</span>
                            </div>
                            <button className="w-full py-4 sm:py-5 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all rounded sm:rounded-none">Imprimer Relevé</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-white ] shadow-xl    p-20 text-center">
                    <AlertCircle size={64} className="text-slate-100 mb-6" />
                    <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Données indisponibles</h3>
                    <p className="text-sm text-slate-300 font-bold uppercase tracking-widest mt-2">Affiliation des enfants en cours de vérification...</p>
                </div>
            )}

            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>
        </div>
    );
};

const MatrixBlock = ({ label, value, color, icon: Icon, trend }: any) => {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        amber: 'text-amber-600 bg-amber-50',
        emerald: 'text-emerald-600 bg-emerald-50',
    };
    return (
        <div className="group bg-white p-4 shadow-lg border border-slate-100 rounded-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex items-center gap-4">
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-inner shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all ${colors[color as keyof typeof colors]}`}>
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{value}</h4>
                    {trend && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">{trend}</span>}
                </div>
            </div>
        </div>
    );
};

export default ParentResults;
