import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    PlayCircle,
    Download,
    Users,
    MessageSquare
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = React.useState({ average: 0, rank: 'N/A' });
    const [upcomingCourses, setUpcomingCourses] = React.useState<any[]>([]);
    const [homeworks, setHomeworks] = React.useState<any[]>([]);
    const [results, setResults] = React.useState<any[]>([]);
    const [classmates, setClassmates] = React.useState<any[]>([]);
    const [installments, setInstallments] = React.useState<any[]>([]);
    const [subjects, setSubjects] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [homeworksRes, resultsRes, scheduleRes, classmatesRes, installmentsRes, subjectsRes] = await Promise.all([
                api.get(`/homeworks/classe/${user?.classe?.id}`),
                api.get(`/submissions/student/${user?.id}/results`),
                api.get(`/timetable/classe/${user?.classe?.id}`),
                api.get(`/students/classe/${user?.classe?.id}`),
                api.get('/finance/my-installments').catch(() => ({ data: [] })),
                user?.classe?.cycle?.id ? api.get(`/subjects/cycle/${user?.classe?.cycle?.id}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
            ]);

            setClassmates(classmatesRes.data.filter((s: any) => s.id !== user?.id).slice(0, 10));
            setInstallments(installmentsRes.data || []);
            setSubjects(subjectsRes.data || []);

            const publishedResults = resultsRes.data.filter((r: any) => r.homework?.gradesPublished);

            // Filter pending homeworks
            const pendingHw = homeworksRes.data
                .filter((h: any) => h.published && new Date(h.deadline) > new Date())
                .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

            setHomeworks(pendingHw.slice(0, 3));

            // Set results (latest 3)
            setResults(publishedResults.slice(-3).reverse());

            // Set schedule for today
            const today = new Date().getDay(); // 0 is Sunday, 1 is Monday...
            // Map 0-6 to 1-7 (assuming 1 is Monday in DB)
            const dbDay = today === 0 ? 7 : today;
            const todayCourses = scheduleRes.data
                .filter((s: any) => s.dayOfWeek === dbDay)
                .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

            setUpcomingCourses(todayCourses);

            // Calculate average if results exist
            if (publishedResults.length > 0) {
                const sum = publishedResults.reduce((acc: number, curr: any) => acc + (curr.grade / curr.homework.maxPoints * 20), 0);
                const avg = sum / publishedResults.length;
                setStats({ average: parseFloat(avg.toFixed(2)), rank: 'N/A' });
            }

        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    const financialStatus = React.useMemo(() => {
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

    if (loading) {
        return (
            <>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-16 h-16     animate-spin"></div>
                </div>
            </>
        );
    }

    const nextCourse = upcomingCourses.find(c => {
        const now = new Date();
        const [hours, minutes] = c.startTime.split(':');
        const courseTime = new Date();
        courseTime.setHours(parseInt(hours), parseInt(minutes), 0);
        return courseTime > now;
    });

    return (
        <>
            {/* Main Stats / Welcome */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 ] p-8 text-white shadow-2xl mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10  blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Salut, {user?.firstName} ! 👋</h2>
                        <p className="text-blue-100/70 font-medium">Content de te revoir. Voici un aperçu de ta journée.</p>
                        <div className="flex gap-4 mt-8">
                            <div className="bg-white/10 px-4 py-2  backdrop-blur-md  ">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Moyenne Actuelle</p>
                                <p className="text-xl font-black">{stats.average > 0 ? `${stats.average}/20` : '...'}</p>
                            </div>
                            <div className="bg-white/10 px-4 py-2  backdrop-blur-md  ">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Ma Classe</p>
                                <p className="text-xl font-black">{user?.classe?.name || 'N/A'}</p>
                            </div>
                            <div className="bg-white/10 px-4 py-2 backdrop-blur-md">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Statut Financier</p>
                                <p className="text-sm font-black mt-1">
                                    {financialStatus.label === 'À Jour' ? (
                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-200 uppercase tracking-widest text-[10px]">{financialStatus.label}</span>
                                    ) : financialStatus.label === 'En Retard' ? (
                                        <span className="px-2 py-1 bg-rose-500/20 text-rose-200 uppercase tracking-widest text-[10px]">{financialStatus.label}</span>
                                    ) : financialStatus.label === 'En Cours' ? (
                                        <span className="px-2 py-1 bg-amber-500/20 text-amber-200 uppercase tracking-widest text-[10px]">{financialStatus.label}</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-200 uppercase tracking-widest text-[10px]">{financialStatus.label}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    {nextCourse ? (
                        <div className="w-full md:w-auto p-6 bg-white/10  backdrop-blur-md   text-center">
                            <p className="text-xs font-black uppercase tracking-widest mb-4">Ton prochain cours</p>
                            <h4 className="text-lg font-bold mb-1 text-white">{nextCourse.subject?.name}</h4>
                            <p className="text-sm text-blue-100/60 mb-4">{nextCourse.startTime} • Salle {nextCourse.room || 'N/A'}</p>
                            <button
                                onClick={() => navigate('/dashboard/student/schedule')}
                                className="w-full py-3 bg-white text-blue-600  font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-50 transition-all"
                            >
                                Voir l'emploi du temps
                            </button>
                        </div>
                    ) : (
                        <div className="w-full md:w-auto p-6 bg-white/10  backdrop-blur-md   text-center">
                            <p className="text-xs font-black uppercase tracking-widest mb-4">Journée terminée</p>
                            <h4 className="text-lg font-bold mb-1 text-white">Plus de cours !</h4>
                            <p className="text-sm text-blue-100/60 mb-4">Repose-toi bien.</p>
                            <button
                                onClick={() => navigate('/dashboard/student/homework')}
                                className="w-full py-3 bg-white text-blue-600  font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-50 transition-all"
                            >
                                Avancer mes devoirs
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Courses & Homework */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 ] shadow-xl   dark:">
                        <h3 className="text-xl font-black text-slate-800 dark:text-blue-400 mb-8 tracking-tight">Cours du Jour</h3>
                        <div className="space-y-4">
                            {upcomingCourses.length > 0 ? upcomingCourses.map((c, i) => (
                                <ScheduleRow
                                    key={i}
                                    subject={c.subject?.name}
                                    time={`${c.startTime} - ${c.endTime}`}
                                    teacher={c.teacher?.lastName}
                                    status={new Date().getHours() >= parseInt(c.startTime.split(':')[0]) ? (new Date().getHours() < parseInt(c.endTime.split(':')[0]) ? 'current' : 'passed') : 'upcoming'}
                                />
                            )) : (
                                <p className="text-center py-4 text-slate-400 font-bold italic">Aucun cours prévu aujourd'hui.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 ] shadow-xl   dark:">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800 dark:text-blue-400 tracking-tight">Devoirs à Rendre</h3>
                            {homeworks.length > 0 && <span className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400  text-xs font-black uppercase tracking-widest">{homeworks.length} Urgents</span>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {homeworks.length > 0 ? homeworks.map((h, i) => (
                                <HomeworkCard
                                    key={i}
                                    subject={h.subject?.name}
                                    task={h.title}
                                    due={new Date(h.deadline).toLocaleDateString()}
                                    color={i === 0 ? 'blue' : i === 1 ? 'amber' : 'emerald'}
                                />
                            )) : (
                                <p className="col-span-2 text-center py-4 text-slate-400 font-bold italic">Aucun devoir à rendre.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 shadow-xl">
                        <h3 className="text-xl font-black text-slate-800 dark:text-blue-400 mb-8 tracking-tight">Mes Matières ({subjects.length})</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {subjects.length > 0 ? subjects.map((subj, i) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 transition-colors">{subj.name}</h4>
                                    {subj.teacher && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{subj.teacher.lastName}</p>}
                                </div>
                            )) : (
                                <p className="col-span-full text-center py-4 text-slate-400 font-bold italic">Aucune matière trouvée.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Results & Resources */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 ] shadow-xl   dark:">
                        <h3 className="text-xl font-black text-slate-800 dark:text-blue-400 mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-600" /> Dernières Notes
                        </h3>
                        <div className="space-y-4">
                            {results.length > 0 ? results.map((r, i) => (
                                <GradeItem
                                    key={i}
                                    subject={r.homework.subject?.name}
                                    grade={`${r.grade}/${r.homework.maxPoints}`}
                                    date={new Date(r.submittedAt).toLocaleDateString()}
                                    trend="up"
                                />
                            )) : (
                                <p className="text-center py-4 text-slate-400 font-bold italic">Aucune note publiée.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/student/results')}
                            className="w-full mt-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400  font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all   dark:"
                        >
                            Voir mon bulletin
                        </button>
                    </div>

                    <div className="bg-slate-900 ] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-500/20  blur-2xl"></div>
                        <h3 className="text-xl font-black mb-6 relative z-10 flex items-center gap-2">
                            <PlayCircle size={20} className="text-blue-400" /> Ressources
                        </h3>
                        <div className="space-y-4 relative z-10 cursor-pointer" onClick={() => navigate('/dashboard/student/courses')}>
                            <ResourceItem title="Cours PDF - Trigonométrie" type="PDF" />
                            <ResourceItem title="Vidéo - Synthèse Protéines" type="VIDEO" />
                            <ResourceItem title="Exercices Corrigés - Anglais" type="LINK" />
                        </div>
                    </div>

                    {/* Mes Tranches de Paiement */}
                    <div className="bg-white p-8 ] shadow-xl  mt-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Mes Frais Scolaires</h3>
                            <button onClick={() => navigate('/dashboard/student/payments')} className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1">
                                Tout voir <TrendingUp size={14} className="rotate-45" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {installments && installments.length > 0 ? (
                                installments.slice(0, 3).map((inst: any, idx: number) => {
                                    const isPaid = inst.paidAmount >= inst.dueAmount;
                                    const remaining = inst.dueAmount - inst.paidAmount;
                                    const progress = Math.min(100, (inst.paidAmount / inst.dueAmount) * 100) || 0;
                                    
                                    return (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/30 transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-600 transition-colors truncate max-w-[65%]">{inst.name || 'Tranche'}</h4>
                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
                                                    {isPaid ? 'Payé' : 'À payer'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 mb-2">
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">Échéance: {inst.dueDate || 'N/A'}</span>
                                                <span className={`text-sm font-black tracking-tight ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {remaining} FCFA
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 overflow-hidden">
                                                <div className={`h-full transition-all duration-1000 ${isPaid ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-slate-400 font-bold italic py-4">Aucun plan de paiement actif.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Classmates & Performance */}
                <div className="space-y-8">
                    {/* Performance Widget */}
                    <div className="bg-slate-900 ] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20  blur-3xl"></div>
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2 tracking-tight">
                            <TrendingUp size={20} className="text-blue-400" /> Moyenne
                        </h3>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-black tracking-tighter">{stats.average}</span>
                            <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">/ 20</span>
                        </div>
                        <p className="text-blue-100/50 text-xs font-medium mb-6 uppercase tracking-wider">Moyenne générale calculée</p>

                        <div className="h-2 w-full bg-white/5  overflow-hidden mb-6">
                            <div className="h-full bg-blue-500 " style={{ width: `${(stats.average / 20) * 100}%` }}></div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button onClick={() => navigate('/dashboard/student/results')} className="w-full py-4 bg-white/10 hover:bg-white/20    font-black text-[10px] uppercase tracking-widest transition-all">Consulter le bulletin</button>
                            <button onClick={() => navigate('/dashboard/student/payments')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest transition-all">Paiements & Reçus</button>
                        </div>
                    </div>

                    {/* Classmates Widget */}
                    <div className="bg-white p-8 ] shadow-xl  ">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Users size={20} className="text-indigo-500" /> Mes Amis
                        </h3>
                        <div className="space-y-4">
                            {classmates.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100  flex items-center justify-center font-black text-xs text-slate-400 group-hover:scale-110 transition-transform">
                                            {c.firstName[0]}{c.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.firstName} {c.lastName}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{user?.classe?.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/dashboard/student/messages?contactId=${c.id}`)}
                                        className="p-2 bg-slate-50 text-slate-300 hover:bg-blue-50 hover:text-blue-600  transition-all"
                                    >
                                        <MessageSquare size={14} />
                                    </button>
                                </div>
                            ))}
                            {classmates.length === 0 && (
                                <p className="text-slate-400 text-xs italic">Aucun camarade de classe trouvé.</p>
                            )}
                        </div>
                        <button className="w-full mt-6 py-4 bg-slate-50 hover:bg-slate-100  font-black text-[10px] uppercase tracking-widest text-slate-400 transition-all">Voir tout le groupe</button>
                    </div>
                </div>
            </div>
        </>
    );
};

const ScheduleRow = ({ subject, time, teacher, status }: { subject: string, time: string, teacher: string, status: string }) => {
    const isCurrent = status === 'current';
    return (
        <div className={`flex items-center justify-between p-5  transition-all ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/10   dark: shadow-lg scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800   dark: hover:bg-white dark:hover:bg-slate-900/50 hover:shadow-md'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12  flex items-center justify-center font-bold ${isCurrent ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-400 shadow-sm'}`}>
                    {isCurrent ? <Clock size={24} /> : <CheckCircle size={24} className={status === 'passed' ? 'text-emerald-500' : 'text-slate-200 dark:text-slate-600'} />}
                </div>
                <div>
                    <h5 className={`font-black ${isCurrent ? 'text-blue-900 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{subject}</h5>
                    <p className="text-xs text-slate-400 font-bold">{teacher} • {time}</p>
                </div>
            </div>
            {isCurrent && <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest  animate-pulse">En cours</span>}
        </div>
    );
};

const HomeworkCard = ({ subject, task, due, color }: { subject: string, task: string, due: string, color: 'blue' | 'amber' | 'emerald' }) => {
    const colors = {
        blue: ' bg-blue-50/50 text-blue-600',
        amber: ' bg-amber-50/50 text-amber-600',
        emerald: ' bg-emerald-50/50 text-emerald-600'
    };
    return (
        <div className={`p-6   ${colors[color as keyof typeof colors]} hover:shadow-lg transition-all cursor-pointer`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest">{subject}</span>
                <span className="text-[10px] font-bold opacity-60 flex items-center gap-1"><Clock size={12} /> {due}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{task}</p>
        </div>
    );
};

const GradeItem = ({ subject, grade, date, trend }: { subject: string, grade: string, date: string, trend: 'up' | 'down' }) => (
    <div className="flex items-center justify-between group cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10  bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                <TrendingUp size={18} className={trend === 'down' ? 'rotate-180' : ''} />
            </div>
            <div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-white">{subject}</h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{date}</p>
            </div>
        </div>
        <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{grade}</span>
    </div>
);

const ResourceItem = ({ title, type }: { title: string, type: 'PDF' | 'VIDEO' | 'LINK' }) => (
    <div className="flex items-center justify-between p-3  hover:bg-white/10 transition-all cursor-pointer group   hover:">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8  bg-white/10 flex items-center justify-center text-blue-400">
                {type === 'PDF' && <Download size={16} />}
                {type === 'VIDEO' && <PlayCircle size={16} />}
                {type === 'LINK' && <AlertCircle size={16} />}
            </div>
            <span className="text-xs font-medium text-blue-100">{title}</span>
        </div>
        <Download size={14} className="text-white/20 group-hover:text-white transition-colors" />
    </div>
);

export default StudentDashboard;
