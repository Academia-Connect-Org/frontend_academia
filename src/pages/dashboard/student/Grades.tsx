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
                const res = await api.get(`/submissions/student/${user.id}/results`);
                setAllGrades(res.data);
                
                if (user?.classe?.cycle?.id) {
                    try {
                        const subjRes = await api.get(`/subjects/cycle/${user.classe.cycle.id}`);
                        setClassSubjects(subjRes.data);
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

    const averageGeneral = filteredGrades.length > 0
        ? (filteredGrades.reduce((acc, curr) => acc + (curr.grade || 0), 0) / filteredGrades.length).toFixed(2)
        : "0.00";

    const bestGrade = filteredGrades.length > 0
        ? Math.max(...filteredGrades.map(g => g.grade || 0))
        : "0";

    const [isBulletinOpen, setIsBulletinOpen] = React.useState(false);

    return (
        <>
            {isBulletinOpen && (
                <BulletinModal
                    studentId={user!.id}
                    trimester={selectedTrimestre === 'Tous' ? '1er Trimestre' : selectedTrimestre}
                    academicYear={selectedYear}
                    onClose={() => setIsBulletinOpen(false)}
                />
            )}
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 no-print">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 uppercase">Mes Résultats</h2>
                    <p className="text-slate-500 font-medium">Consultez vos notes publiées par vos professeurs.</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="bg-white   px-6 py-3.5  font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button
                        onClick={() => setIsBulletinOpen(true)}
                        className="bg-slate-900 text-white px-8 py-3.5  font-black flex items-center gap-3 shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all outline-none"
                    >
                        <Download size={18} /> Voir Bulletin Complet
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4 mb-10 no-print">
                <div className="flex items-center gap-2 bg-white px-6 py-3  shadow-sm  ">
                    <span className="text-[10px] font-black uppercase text-slate-400">Trimestre:</span>
                    <select value={selectedTrimestre} onChange={e => setSelectedTrimestre(e.target.value)} className="text-xs font-bold text-slate-600 bg-transparent border-none outline-none">
                        <option value="Tous">Tous</option>
                        <option value="1er Trimestre">1er</option>
                        <option value="2ème Trimestre">2ème</option>
                        <option value="3ème Trimestre">3ème</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-white px-6 py-3  shadow-sm  ">
                    <span className="text-[10px] font-black uppercase text-slate-400">Matière:</span>
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="text-xs font-bold text-slate-600 bg-transparent border-none outline-none">
                        <option value="Tous">Toutes</option>
                        {subjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une évaluation ou un sujet..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white    pl-16 pr-6 py-4 text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 print-section">
                <MatrixItem label="Moyenne" value={averageGeneral} trend={`${filteredGrades.length} Notes`} icon={BarChart3} color="bg-blue-600" />
                <MatrixItem label="Meilleure Note" value={String(bestGrade)} trend="Max" icon={Star} color="bg-amber-600" />
                <MatrixItem label="Evaluations" value={filteredGrades.length.toString()} trend="Global" icon={Target} color="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Notes Table */}
                <div className="lg:col-span-2 bg-white ] shadow-2xl   overflow-hidden print-full">
                    <div className="p-8   flex justify-between items-center bg-gradient-to-r from-slate-50 to-transparent">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dernières Évaluations Publiées</h3>
                        <Award size={24} className="text-blue-600" />
                    </div>

                    <div className="p-4 overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-12 h-12     animate-spin"></div>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Chargement des résultats...</p>
                            </div>
                        ) : filteredGrades.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-50  flex items-center justify-center mb-6 text-slate-200">
                                    <AlertCircle size={40} />
                                </div>
                                <h4 className="text-slate-800 font-black uppercase mb-2">Aucun résultat trouvé</h4>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs">Essayez de modifier vos filtres ou contactez votre professeur.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400  ">
                                        <th className="px-8 py-6">Matière & Devoir</th>
                                        <th className="px-8 py-6">Date</th>
                                        <th className="px-8 py-6 text-center">Note / {filteredGrades[0]?.homework?.maxPoints}</th>
                                        <th className="px-8 py-6 text-right">Feedback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredGrades.map((row) => (
                                        <tr key={row.id} className="hover:bg-blue-50/30 group transition-all">
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12  bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center font-black text-sm text-blue-600 group-hover:scale-110 transition-transform">
                                                        {(row.homework?.subject?.name || '??').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 leading-none mb-1.5 uppercase tracking-tight text-sm">{row.homework?.subject?.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.homework?.title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-tight">
                                                        <Clock size={12} className="text-slate-300" /> {new Date(row.submittedAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">{row.homework?.trimestre}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className={`text-xl font-black tracking-tighter ${row.grade >= (row.homework?.maxPoints * 0.7) ? 'text-emerald-500' : row.grade >= (row.homework?.maxPoints * 0.5) ? 'text-blue-500' : 'text-rose-500'}`}>
                                                        {row.grade}
                                                    </span>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase">/{row.homework?.maxPoints}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 text-right">
                                                <span className="text-[11px] font-medium text-slate-400 italic max-w-xs block ml-auto truncate">
                                                    {row.teacherFeedback || "Pas de feedback particulier."}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-8 no-print">
                    <div className="bg-slate-900 p-10 ] text-white shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20  blur-[80px] group-hover:bg-blue-600/30 transition-all duration-500"></div>
                        <h3 className="text-xl font-black mb-10 relative z-10 flex items-center gap-3 uppercase tracking-tight italic">
                            <TrendingUp size={24} className="text-blue-400" /> Progression
                        </h3>
                        <div className="space-y-10 relative z-10">
                            {subjects.slice(0, 5).map(s => {
                                const subjGrades = filteredGrades.filter(g => g.homework?.subject?.name === s);
                                const avg = subjGrades.length > 0
                                    ? subjGrades.reduce((acc, curr) => acc + curr.grade, 0) / subjGrades.length
                                    : 0;
                                const max = subjGrades[0]?.homework?.maxPoints || 20;
                                return (
                                    <SubjectBar key={s as string} label={s as string} value={avg} max={max} color="bg-blue-500" />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Sub-components
const MatrixItem = ({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: string }) => (
    <div className="group bg-white p-10 ] shadow-2xl   transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50  -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
        <div className={`w-16 h-16 ${color} text-white  flex items-center justify-center mb-8 relative z-10 shadow-xl shadow-slate-900/10 group-hover:rotate-12 transition-transform duration-500`}>
            <Icon size={30} />
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">{label}</p>
        <div className="flex items-end justify-between relative z-10">
            <h4 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{value}</h4>
            <span className="px-3 py-1.5 bg-slate-50 text-slate-400  text-[10px] font-black uppercase tracking-widest   italic">
                {trend}
            </span>
        </div>
    </div>
);

const SubjectBar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => (
    <div>
        <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest italic">{label}</span>
            <span className="font-black text-sm text-white">{value.toFixed(1)}<span className="text-blue-400 text-[10px] ml-0.5">/{max}</span></span>
        </div>
        <div className="h-2.5 w-full bg-white/5  overflow-hidden   p-0.5 shadow-inner">
            <div className={`h-full ${color}  shadow-lg transition-all duration-1000 ease-out`} style={{ width: `${(value / max) * 100}%` }}></div>
        </div>
    </div>
);

export default StudentGrades;
