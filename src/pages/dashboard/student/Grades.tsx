import React from 'react';
import {
    TrendingUp,
    Search,
    Award,
    Target,
    BarChart3,
    Clock,
    Download,
    Star,
    AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import BulletinModal from '../../../components/dashboard/shared/BulletinModal';

const StudentGrades: React.FC = () => {
    const { user } = useAuth();
    const [allGrades, setAllGrades] = React.useState<any[]>([]);
    const [classSubjects, setClassSubjects] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Filters state
    const [selectedYear, setSelectedYear] = React.useState('2025-2026');
    const [selectedTrimestre, setSelectedTrimestre] = React.useState('Tous');
    const [selectedSubject, setSelectedSubject] = React.useState('Tous');
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
        const fetchGrades = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const [resSubmissions, resGrades] = await Promise.all([
                    api.get(`/submissions/student/${user.id}/results`).catch(() => ({ data: [] })),
                    api.get(`/grades/student/${user.id}`).catch(() => ({ data: [] }))
                ]);

                const subs = resSubmissions.data || [];
                const manual = (resGrades.data || []).map((g: any) => ({
                    id: `manual_${g.id}`,
                    grade: g.value,
                    homework: {
                        id: null,
                        title: g.type || "Évaluation",
                        subject: g.subject,
                        trimestre: g.trimester,
                        academicYear: g.academicYear || '2025-2026',
                        gradesPublished: true,
                        maxPoints: g.maxPoints
                    }
                }));

                setAllGrades([...subs, ...manual]);

                if (user?.classe?.cycle?.id) {
                    try {
                        const subjRes = await api.get(`/subjects/cycle/${user.classe.cycle.id}`);
                        setClassSubjects(subjRes.data || []);
                    } catch (e) {
                        console.error("Erreur lors du chargement des matières:", e);
                    }
                }
            } catch (err) {
                console.error("Erreur lors du chargement des notes:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, [user?.id]);

    const filteredGrades = allGrades.filter(g => {
        const matchYear = g.homework?.academicYear === selectedYear;
        const matchTrimestre = selectedTrimestre === 'Tous' || g.homework?.trimestre === selectedTrimestre;
        const matchSubject = selectedSubject === 'Tous' || g.homework?.subject?.name === selectedSubject;
        const matchSearch = g.homework?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.homework?.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const isPublished = g.homework?.gradesPublished;
        return matchYear && matchTrimestre && matchSubject && matchSearch && isPublished;
    });

    const subjects = classSubjects.length > 0
        ? classSubjects.map((s: any) => s.name).filter(Boolean)
        : Array.from(new Set(allGrades.map(g => g.homework?.subject?.name).filter(Boolean)));
    const years = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

    const getBaseScore = (cycleName: string | undefined): number => {
        if (!cycleName) return 20.0;
        const lower = cycleName.toLowerCase();
        if (lower.includes("prim") || lower.includes("matern") ||
            lower.includes("jardin") || lower.includes("présco") ||
            lower.includes("presco") || lower.includes("école de base")) {
            return 10.0;
        }
        return 20.0;
    };

    const normalizeGrade = (value: number, maxPoints: number | undefined, targetBase: number): number => {
        if (!maxPoints || maxPoints <= 0) {
            return Math.min(value, targetBase);
        }
        return (value / maxPoints) * targetBase;
    };

    const targetBase = getBaseScore(user?.classe?.cycle?.name);

    const averageGeneral = filteredGrades.length > 0
        ? (filteredGrades.reduce((acc, curr) => acc + normalizeGrade(curr.grade || 0, curr.homework?.maxPoints, targetBase), 0) / filteredGrades.length).toFixed(2)
        : "0.00";

    const bestGrade = filteredGrades.length > 0
        ? Math.max(...filteredGrades.map(g => normalizeGrade(g.grade || 0, g.homework?.maxPoints, targetBase)))
        : 0;

    const [isBulletinOpen, setIsBulletinOpen] = React.useState(false);

    return (
        <div className="space-y-6">
            {isBulletinOpen && (
                <BulletinModal
                    studentId={user!.id}
                    trimester={selectedTrimestre === 'Tous' ? '1er Trimestre' : selectedTrimestre}
                    academicYear={selectedYear}
                    onClose={() => setIsBulletinOpen(false)}
                />
            )}

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mes Résultats</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consultez vos notes publiées par vos professeurs.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button
                        onClick={() => setIsBulletinOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                    >
                        <Download size={16} /> Bulletin Complet
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3 no-print">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-1.5 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trimestre:</span>
                    <select value={selectedTrimestre} onChange={e => setSelectedTrimestre(e.target.value)} className="text-xs font-bold text-slate-900 dark:text-white bg-transparent outline-none">
                        <option value="Tous">Tous</option>
                        <option value="1er Trimestre">1er</option>
                        <option value="2ème Trimestre">2ème</option>
                        <option value="3ème Trimestre">3ème</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-1.5 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Matière:</span>
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="text-xs font-bold text-slate-900 dark:text-white bg-transparent outline-none">
                        <option value="Tous">Toutes</option>
                        {subjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[240px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print-section">
                <MatrixItem label={`Moyenne (/${targetBase})`} value={averageGeneral} icon={BarChart3} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/40" />
                <MatrixItem label={`Meilleure Note (/${targetBase})`} value={bestGrade.toFixed(1)} icon={Star} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/40" />
                <MatrixItem label="Évaluations" value={filteredGrades.length.toString()} icon={Target} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/40" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Notes Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden print-full">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Dernières Évaluations Publiées</h3>
                        <Award size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="p-4 overflow-x-auto">
                        {loading ? (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase text-xs">
                                Chargement des résultats...
                            </div>
                        ) : filteredGrades.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 italic text-xs">
                                <AlertCircle size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                Aucun résultat trouvé.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th className="pb-2 font-bold">Matière & Devoir</th>
                                        <th className="pb-2 font-bold">Date</th>
                                        <th className="pb-2 text-center font-bold">Note / {filteredGrades[0]?.homework?.maxPoints || 20}</th>
                                        <th className="pb-2 text-right font-bold">Feedback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {filteredGrades.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-blue-600 dark:text-blue-400 shrink-0">
                                                        {(row.homework?.subject?.name || '??').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white uppercase">{row.homework?.subject?.name}</p>
                                                        <p className="text-[10px] text-slate-400">{row.homework?.title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                                                    {new Date(row.submittedAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] text-slate-400">{row.homework?.trimestre}</div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${row.grade >= ((row.homework?.maxPoints || 20) * 0.5) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                                                    {row.grade} / {row.homework?.maxPoints || 20}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-slate-500 dark:text-slate-400 italic">
                                                {row.teacherFeedback || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-4 no-print">
                    <div className="bg-slate-900 p-5 rounded-2xl text-white border border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-400" /> Progression par Matière
                        </h3>
                        <div className="space-y-3">
                            {subjects.slice(0, 5).map(s => {
                                const subjGrades = filteredGrades.filter(g => g.homework?.subject?.name === s);
                                const avg = subjGrades.length > 0
                                    ? subjGrades.reduce((acc, curr) => acc + normalizeGrade(curr.grade || 0, curr.homework?.maxPoints, targetBase), 0) / subjGrades.length
                                    : 0;
                                return (
                                    <SubjectBar key={s as string} label={s as string} value={avg} max={targetBase} color="bg-blue-500" />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MatrixItem = ({ label, value, icon: Icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{value}</h4>
        </div>
        <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
            <Icon size={24} />
        </div>
    </div>
);

const SubjectBar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => (
    <div>
        <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300 font-medium">{label}</span>
            <span className="font-bold text-white">{value.toFixed(1)}<span className="text-slate-400 text-[10px]">/{max}</span></span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${(value / max) * 100}%` }}></div>
        </div>
    </div>
);

export default StudentGrades;
