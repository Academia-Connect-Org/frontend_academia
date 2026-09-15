import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Clock,
    CheckCircle,
    PlayCircle,
    Download,
    Users,
    MessageSquare,
    BookOpen,
    Calendar,
    Award
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const daysMap: Record<number, string[]> = {
    1: ['LUNDI', 'MONDAY', '1'],
    2: ['MARDI', 'TUESDAY', '2'],
    3: ['MERCREDI', 'WEDNESDAY', '3'],
    4: ['JEUDI', 'THURSDAY', '4'],
    5: ['VENDREDI', 'FRIDAY', '5'],
    6: ['SAMEDI', 'SATURDAY', '6'],
    0: ['DIMANCHE', 'SUNDAY', '7']
};

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({ average: 0, rank: 'N/A' });
    const [upcomingCourses, setUpcomingCourses] = useState<any[]>([]);
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [classmates, setClassmates] = useState<any[]>([]);
    const [installments, setInstallments] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [homeworksRes, resultsRes, scheduleRes, classmatesRes, installmentsRes, subjectsRes, statsRes] = await Promise.all([
                api.get(`/homeworks/classe/${user?.classe?.id}`).catch(() => ({ data: [] })),
                api.get(`/submissions/student/${user?.id}/results`).catch(() => ({ data: [] })),
                api.get(`/timetable/classe/${user?.classe?.id}`).catch(() => ({ data: [] })),
                api.get(`/students/classe/${user?.classe?.id}`).catch(() => ({ data: [] })),
                api.get('/finance/my-installments').catch(() => ({ data: [] })),
                user?.classe?.cycle?.id ? api.get(`/subjects/cycle/${user?.classe?.cycle?.id}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                api.get(`/dashboard/student?userId=${user?.id}`).catch(() => ({ data: { average: 0 } }))
            ]);

            setClassmates((classmatesRes.data || []).filter((s: any) => s.id !== user?.id).slice(0, 10));
            setInstallments(installmentsRes.data || []);
            setSubjects(subjectsRes.data || []);

            const publishedResults = (resultsRes.data || []).filter((r: any) => r.homework?.gradesPublished);

            const pendingHw = (homeworksRes.data || [])
                .filter((h: any) => h.published && new Date(h.deadline) > new Date())
                .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

            setHomeworks(pendingHw.slice(0, 3));
            setResults(publishedResults.slice(-3).reverse());

            // Robust Today's Courses filter (handling String vs Integer dayOfWeek)
            const jsDay = new Date().getDay();
            const targetDayStrings = daysMap[jsDay] || ['LUNDI', 'MONDAY'];

            const todayCourses = (scheduleRes.data || [])
                .filter((s: any) => {
                    if (!s.dayOfWeek) return false;
                    const strVal = String(s.dayOfWeek).toUpperCase().trim();
                    return targetDayStrings.includes(strVal);
                })
                .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));

            setUpcomingCourses(todayCourses);
            setStats({ average: statsRes.data?.average || 0, rank: 'N/A' });

        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    const financialStatus = useMemo(() => {
        if (!installments || installments.length === 0) return { label: 'Aucun Frais', color: 'blue' };
        let hasOverdue = false;
        let allPaid = true;
        const now = new Date();

        for (const inst of installments) {
            const isPaid = inst.paidAmount >= inst.dueAmount;
            if (!isPaid) allPaid = false;
            if (!isPaid && inst.dueDate && new Date(inst.dueDate) < now) {
                hasOverdue = true;
            }
        }

        if (allPaid) return { label: 'À Jour', color: 'emerald' };
        if (hasOverdue) return { label: 'En Retard', color: 'rose' };
        return { label: 'En Cours', color: 'amber' };
    }, [installments]);

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

    const targetBase = getBaseScore(user?.classe?.cycle?.name);

    const nextCourse = useMemo(() => {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        return upcomingCourses.find(c => {
            if (!c.startTime) return false;
            const [hours, minutes] = c.startTime.split(':').map(Number);
            const courseMins = hours * 60 + minutes;
            return courseMins > currentMins;
        });
    }, [upcomingCourses]);

    const getCourseStatus = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return 'upcoming';
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;

        if (currentMins >= startMins && currentMins < endMins) return 'current';
        if (currentMins >= endMins) return 'passed';
        return 'upcoming';
    };

    if (loading) {
        return (
            <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement de ton espace...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Stats / Welcome */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1 tracking-tight">Salut, {user?.firstName} ! 👋</h2>
                        <p className="text-xs text-blue-100/80">Content de te revoir. Voici le programme de ta journée.</p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="bg-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                <p className="text-[10px] font-bold uppercase text-blue-200">Moyenne Actuelle</p>
                                <p className="text-base font-bold">{stats.average > 0 ? `${stats.average}/${targetBase}` : '0'}</p>
                            </div>
                            <div className="bg-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                <p className="text-[10px] font-bold uppercase text-blue-200">Ma Classe</p>
                                <p className="text-base font-bold">{user?.classe?.name || 'Non rattaché'}</p>
                            </div>
                            <div className="bg-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                <p className="text-[10px] font-bold uppercase text-blue-200">Statut Financier</p>
                                <p className="text-xs font-bold mt-0.5">
                                    <span className="px-2 py-0.5 rounded-md bg-white/20 uppercase text-[10px]">{financialStatus.label}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {nextCourse ? (
                        <div className="w-full md:w-auto p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-center space-y-1">
                            <p className="text-[10px] font-bold uppercase text-blue-200">Ton prochain cours</p>
                            <h4 className="text-base font-bold text-white">{nextCourse.subjectName || nextCourse.subject?.name || 'Cours'}</h4>
                            <p className="text-xs text-blue-100/80 font-medium">{nextCourse.startTime} - {nextCourse.endTime} {nextCourse.room ? `• Salle ${nextCourse.room}` : ''}</p>
                            <button
                                onClick={() => navigate('/dashboard/student/schedule')}
                                className="w-full mt-2 py-2 bg-white text-blue-600 rounded-xl font-bold text-xs shadow-sm hover:bg-blue-50 transition-colors"
                            >
                                Emploi du temps
                            </button>
                        </div>
                    ) : (
                        <div className="w-full md:w-auto p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-center space-y-1">
                            <p className="text-[10px] font-bold uppercase text-blue-200">Journée de cours</p>
                            <h4 className="text-base font-bold text-white">
                                {upcomingCourses.length > 0 ? "Cours du jour terminés 🎉" : "Aucun cours aujourd'hui"}
                            </h4>
                            <p className="text-xs text-blue-100/80 font-medium">Bonne révision !</p>
                            <button
                                onClick={() => navigate('/dashboard/student/homework')}
                                className="w-full mt-2 py-2 bg-white text-blue-600 rounded-xl font-bold text-xs shadow-sm hover:bg-blue-50 transition-colors"
                            >
                                Consulter mes devoirs
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Courses & Homework */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cours du jour */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock size={18} className="text-blue-600 dark:text-blue-400" /> Cours du Jour
                            </h3>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {upcomingCourses.length} cours prévu(s)
                            </span>
                        </div>
                        <div className="space-y-2">
                            {upcomingCourses.length > 0 ? upcomingCourses.map((c, i) => (
                                <ScheduleRow
                                    key={i}
                                    subject={c.subjectName || c.subject?.name || 'Matière'}
                                    time={`${c.startTime} - ${c.endTime}${c.room ? ` (Salle ${c.room})` : ''}`}
                                    teacher={c.teacherName || (c.teacher ? `Prof. ${c.teacher.lastName}` : 'Prof. Titulaire')}
                                    status={getCourseStatus(c.startTime, c.endTime)}
                                />
                            )) : (
                                <div className="py-8 text-center space-y-1">
                                    <Calendar size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold italic">Aucun cours au programme aujourd'hui.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Devoirs à Rendre */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen size={18} className="text-blue-600 dark:text-blue-400" /> Devoirs à Rendre
                            </h3>
                            {homeworks.length > 0 && <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold uppercase">{homeworks.length} À rendre</span>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {homeworks.length > 0 ? homeworks.map((h, i) => (
                                <HomeworkCard
                                    key={i}
                                    subject={h.subject?.name}
                                    task={h.title}
                                    due={new Date(h.deadline).toLocaleDateString('fr-FR')}
                                    color={i === 0 ? 'blue' : i === 1 ? 'amber' : 'emerald'}
                                    onClick={() => navigate('/dashboard/student/homework')}
                                />
                            )) : (
                                <p className="col-span-2 text-center py-6 text-slate-400 text-xs font-semibold italic">Aucun devoir à rendre pour le moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Mes Matières */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Mes Matières ({subjects.length})</h3>
                            <button onClick={() => navigate('/dashboard/student/courses')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Voir tout</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {subjects.length > 0 ? subjects.map((subj, i) => (
                                <div key={i} onClick={() => navigate('/dashboard/student/courses')} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-2xl hover:border-blue-500/30 transition-colors cursor-pointer">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{subj.name}</h4>
                                    {subj.teacher && <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">Prof. {subj.teacher.lastName}</p>}
                                </div>
                            )) : (
                                <p className="col-span-full text-center py-4 text-slate-400 text-xs italic">Aucune matière affectée.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Results & Resources */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Award size={18} className="text-blue-600 dark:text-blue-400" /> Dernières Notes
                        </h3>
                        <div className="space-y-3">
                            {results.length > 0 ? results.map((r, i) => (
                                <GradeItem
                                    key={i}
                                    subject={r.homework.subject?.name}
                                    grade={`${r.grade}/${r.homework.maxPoints}`}
                                    date={new Date(r.submittedAt).toLocaleDateString('fr-FR')}
                                />
                            )) : (
                                <p className="text-center py-4 text-slate-400 text-xs italic">Aucune note publiée.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/student/results')}
                            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-colors"
                        >
                            Voir mes notes & relevés
                        </button>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-3xl text-white border border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <PlayCircle size={18} className="text-blue-400" /> Ressources
                        </h3>
                        <div className="space-y-2 cursor-pointer" onClick={() => navigate('/dashboard/student/courses')}>
                            <ResourceItem title="Syllabus & Programmes" type="PDF" />
                            <ResourceItem title="Méthodologies de révision" type="VIDEO" />
                            <ResourceItem title="Annales Concours & Sujets" type="LINK" />
                        </div>
                    </div>

                    {/* Mes Tranches de Paiement */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Frais Scolaires</h3>
                            <button onClick={() => navigate('/dashboard/student/payments')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                Tout voir
                            </button>
                        </div>
                        <div className="space-y-3">
                            {installments && installments.length > 0 ? (
                                installments.slice(0, 3).map((inst: any, idx: number) => {
                                    const isPaid = inst.paidAmount >= inst.dueAmount;
                                    const remaining = inst.dueAmount - inst.paidAmount;
                                    const progress = Math.min(100, (inst.paidAmount / inst.dueAmount) * 100) || 0;

                                    return (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[65%]">{inst.name || 'Tranche'}</h4>
                                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${isPaid ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'}`}>
                                                    {isPaid ? 'Payé' : 'À payer'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs mb-2">
                                                <span className="text-[10px] text-slate-400">Échéance: {inst.dueDate || '—'}</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{(remaining || 0).toLocaleString()} FCFA</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                <div className={`h-full ${isPaid ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-slate-400 text-xs italic py-2">Aucun plan de paiement actif.</p>
                            )}
                        </div>
                    </div>

                    {/* Classmates Widget */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={18} className="text-indigo-600 dark:text-indigo-400" /> Mes Camarades de Classe
                        </h3>
                        <div className="space-y-3">
                            {classmates.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                                            {c.firstName?.[0]}{c.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{c.firstName} {c.lastName}</p>
                                            <p className="text-[10px] text-slate-400">{user?.classe?.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/dashboard/student/messages?contactId=${c.id}`)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Envoyer un message"
                                    >
                                        <MessageSquare size={14} />
                                    </button>
                                </div>
                            ))}
                            {classmates.length === 0 && (
                                <p className="text-slate-400 text-xs italic">Aucun camarade de classe trouvé.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScheduleRow = ({ subject, time, teacher, status }: { subject: string, time: string, teacher: string, status: string }) => {
    const isCurrent = status === 'current';
    return (
        <div className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${isCurrent ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${isCurrent ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                    {isCurrent ? <Clock size={18} /> : <CheckCircle size={18} className={status === 'passed' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'} />}
                </div>
                <div>
                    <h5 className={`font-bold text-xs ${isCurrent ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>{subject}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{teacher} • {time}</p>
                </div>
            </div>
            {isCurrent && <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase rounded-lg animate-pulse">En cours</span>}
        </div>
    );
};

const HomeworkCard = ({ subject, task, due, color, onClick }: { subject: string, task: string, due: string, color: 'blue' | 'amber' | 'emerald', onClick?: () => void }) => {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400',
        amber: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400'
    };
    return (
        <div onClick={onClick} className={`p-4 rounded-2xl border ${colors[color as keyof typeof colors]} hover:shadow-sm transition-all cursor-pointer`}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">{subject}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {due}</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">{task}</p>
        </div>
    );
};

const GradeItem = ({ subject, grade, date }: { subject: string, grade: string, date: string }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 shrink-0">
                <TrendingUp size={16} />
            </div>
            <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">{subject}</h5>
                <p className="text-[10px] text-slate-400">{date}</p>
            </div>
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{grade}</span>
    </div>
);

const ResourceItem = ({ title, type }: { title: string, type: 'PDF' | 'VIDEO' | 'LINK' }) => (
    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 transition-colors">
        <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                {type === 'PDF' && <Download size={14} />}
                {type === 'VIDEO' && <PlayCircle size={14} />}
                {type === 'LINK' && <Download size={14} />}
            </div>
            <span className="text-xs font-medium text-slate-200">{title}</span>
        </div>
        <Download size={14} className="text-slate-500" />
    </div>
);

export default StudentDashboard;
