import React, { useState, useEffect } from 'react';
import {
    Download,
    TrendingUp,
    Award,
    BarChart3,
    Search,
    AlertCircle,
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
            <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des résultats...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isBulletinOpen && selectedChild && (
                <BulletinModal
                    studentId={selectedChild.id}
                    trimester={selectedTrimester}
                    academicYear={selectedYear}
                    onClose={() => setIsBulletinOpen(false)}
                />
            )}

            {/* Header / Filter Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Award className="text-blue-600 dark:text-blue-400" size={24} />
                        Résultats Académiques
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Visualisez les notes certifiées et les bulletins trimestriels de vos enfants.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full md:w-auto">
                    {classes.length > 1 && (
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="bg-white dark:bg-slate-900 px-4 py-2.5 border border-slate-200/80 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white outline-none w-full sm:w-auto"
                        >
                            <option value="all">Toutes les classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}

                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="bg-white dark:bg-slate-900 px-4 py-2.5 border border-slate-200/80 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white outline-none w-full sm:w-auto"
                    >
                        <option value="2024-2025">Année: 2024-2025</option>
                        <option value="2025-2026">Année: 2025-2026</option>
                        <option value="2026-2027">Année: 2026-2027</option>
                    </select>

                    <button
                        onClick={() => setIsBulletinOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider w-full sm:w-auto"
                    >
                        <Download size={16} /> Bulletin PDF
                    </button>
                </div>
            </div>

            {/* Child Selector & Trimester Toggle */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2 max-w-md">
                    <User size={16} className="text-blue-600 dark:text-blue-400 ml-2 shrink-0" />
                    <select
                        value={selectedChild?.id || ''}
                        onChange={(e) => {
                            const child = filteredChildren.find((c: any) => c.id === Number(e.target.value));
                            if (child) setSelectedChild(child);
                        }}
                        className="bg-transparent flex-1 py-1.5 px-2 font-bold text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                        {filteredChildren.map((child: any) => (
                            <option key={child.id} value={child.id}>
                                {child.firstName} {child.lastName} {child.classe?.name ? `— ${child.classe.name}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 self-start">
                    {['1er Trimestre', '2ème Trimestre', '3ème Trimestre'].map(trim => (
                        <button
                            key={trim}
                            onClick={() => setSelectedTrimester(trim)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTrimester === trim ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {trim.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {selectedChild ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Matrix Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <MatrixBlock label="Moyenne Générale" value={`${averageGeneral} / 20`} color="blue" icon={BarChart3} />
                            <MatrixBlock label="Meilleure Note" value={`${bestGrade} / 20`} color="amber" icon={Star} trend="Record" />
                            <MatrixBlock label="Évaluations Rendu" value={filteredGrades.length} color="emerald" icon={Target} trend="Trimestre" />
                        </div>

                        {/* Main Grades Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative">
                            {gradesLoading && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="font-bold text-blue-900 dark:text-blue-300 text-xs uppercase tracking-wider">Chargement des notes...</p>
                                </div>
                            )}

                            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Récapitulatif des Notes & Évaluations</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedTrimester} — {selectedChild.firstName} {selectedChild.lastName}</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold">
                                    <TrendingUp size={20} />
                                </div>
                            </div>

                            <div className="p-4 overflow-x-auto">
                                {filteredGrades.length === 0 && !gradesLoading ? (
                                    <div className="py-16 flex flex-col items-center justify-center text-center px-4 space-y-2">
                                        <Search size={40} className="text-slate-300 dark:text-slate-600" />
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aucune note publiée</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">Les enseignants n'ont pas encore publié de notes pour ce trimestre.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                                <th className="pb-3 px-3 font-bold">Matière / Devoir</th>
                                                <th className="pb-3 px-3 font-bold">Date</th>
                                                <th className="pb-3 px-3 font-bold text-center">Note</th>
                                                <th className="pb-3 px-3 font-bold text-right">Observation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                            {filteredGrades.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                                {row.homework?.subject?.name?.substring(0, 2).toUpperCase() || 'MA'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white text-xs">{row.homework?.subject?.name || 'Matière'}</p>
                                                                <p className="text-[10px] text-slate-400">{row.homework?.title || 'Devoir'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                            <Clock size={12} className="text-slate-400" /> {new Date(row.submittedAt || Date.now()).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-center">
                                                        <span className={`text-sm font-bold ${row.grade >= (row.homework?.maxPoints * 0.7) ? 'text-emerald-600 dark:text-emerald-400' : row.grade >= (row.homework?.maxPoints * 0.5) ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                            {row.grade} <span className="text-[10px] text-slate-400 font-normal">/{row.homework?.maxPoints || 20}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3 text-right">
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
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

                    <div className="space-y-6">
                        {/* Subject Progress Sidebar */}
                        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp size={18} className="text-blue-400" /> Profil par Matière
                            </h3>
                            <div className="space-y-4 pt-2">
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
                                            <div key={s} className="space-y-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-semibold text-slate-300 truncate">{s}</span>
                                                    <span className="font-bold text-white">{avg.toFixed(1)} <span className="text-slate-500 text-[10px]">/{max}</span></span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(avg / max) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                {allGrades.length === 0 && (
                                    <p className="text-xs text-slate-400 italic text-center py-4">Aucune note à analyser.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Moyenne Générale</h4>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                    {averageGeneral} <span className="text-xs text-slate-400 font-medium">/ 20</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsBulletinOpen(true)}
                                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition-colors"
                            >
                                Imprimer le Relevé
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-3">
                    <AlertCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucun enfant sélectionné</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Veuillez sélectionner un enfant pour consulter son bulletin et ses notes.</p>
                </div>
            )}
        </div>
    );
};

const MatrixBlock = ({ label, value, color, icon: Icon, trend }: any) => {
    const colors: any = {
        blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">{value}</h4>
                    {trend && <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">{trend}</span>}
                </div>
            </div>
        </div>
    );
};

export default ParentResults;
