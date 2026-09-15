import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    User,
    PlayCircle,
    FileText,
    TrendingUp,
    BarChart3,
    MessageSquare,
    Clock,
    GraduationCap,
    Award
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

const StudentCourses: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
    const [cycleSubjects, setCycleSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.classe?.id) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user?.classe?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const classeId = user?.classe?.id;
            const requests: Promise<any>[] = [
                api.get(`/timetable/classe/${classeId}`).catch(() => ({ data: [] }))
            ];
            if (user?.classe?.cycleId) {
                requests.push(api.get(`/subjects/cycle/${user.classe.cycleId}`).catch(() => ({ data: [] })));
            }
            const [tbRes, subRes] = await Promise.all(requests);
            setTimetableEntries(tbRes.data || []);
            if (subRes) setCycleSubjects(subRes.data || []);
        } catch (err) {
            console.error("Erreur chargement matières:", err);
        } finally {
            setLoading(false);
        }
    };

    // Group entries into unique subject & teacher cards with schedules & room
    const subjectCards = useMemo(() => {
        const map: Record<string, {
            id: string;
            subjectName: string;
            teacherName: string;
            teacherId?: number;
            classeName: string;
            coefficient?: number;
            schedules: string[];
        }> = {};

        timetableEntries.forEach((e: any) => {
            const key = `${e.subjectName}-${e.teacherName}`;
            if (!map[key]) {
                map[key] = {
                    id: key,
                    subjectName: e.subjectName || 'Matière',
                    teacherName: e.teacherName || 'Professeur Titulaire',
                    teacherId: e.teacherId,
                    classeName: e.classeName || user?.classe?.name || 'Ma Classe',
                    schedules: []
                };
            }
            if (e.dayOfWeek && e.startTime && e.endTime) {
                const dayName = e.dayOfWeek.charAt(0) + e.dayOfWeek.slice(1).toLowerCase();
                const roomInfo = e.room ? ` (Salle ${e.room})` : '';
                map[key].schedules.push(`${dayName} ${e.startTime}-${e.endTime}${roomInfo}`);
            }
        });

        // Add subjects from cycle if not present in timetable
        cycleSubjects.forEach((sub: any) => {
            const exists = Object.values(map).some(m => m.subjectName.toLowerCase() === sub.name?.toLowerCase());
            if (!exists) {
                map[`sub-${sub.id}`] = {
                    id: `sub-${sub.id}`,
                    subjectName: sub.name,
                    teacherName: 'Professeur Titulaire',
                    classeName: user?.classe?.name || 'Ma Classe',
                    coefficient: sub.coefficient || 1,
                    schedules: []
                };
            }
        });

        return Object.values(map);
    }, [timetableEntries, cycleSubjects, user?.classe?.name]);

    if (loading) {
        return (
            <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement de tes matières...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
                        Mes Matières & Enseignants
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Consulte tes matières, les horaires de cours, les professeurs de ta classe ({user?.classe?.name || 'Élève'}) et contacte-les directement.
                    </p>
                </div>
            </div>

            {/* Subjects Grid (NO Cahier de Texte / NO Journal) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectCards.length > 0 ? subjectCards.map((card) => (
                    <div key={card.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    {card.subjectName.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                    {card.classeName}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{card.subjectName}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <User size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Prof. {card.teacherName}
                                    </p>
                                </div>
                            </div>

                            {/* Schedules Summary */}
                            {card.schedules.length > 0 && (
                                <div className="space-y-1 pt-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> Horaires de cours :
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {card.schedules.map((sch, sIdx) => (
                                            <span key={sIdx} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold text-[10px] rounded-md border border-slate-200/60 dark:border-slate-700">
                                                {sch}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Direct Contact Teacher Button */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            {card.teacherId ? (
                                <button
                                    onClick={() => {
                                        const prefill = encodeURIComponent(`Bonjour M./Mme ${card.teacherName}, je vous contacte concernant le cours de ${card.subjectName}...`);
                                        navigate(`/dashboard/student/messages?contactId=${card.teacherId}&prefill=${prefill}`);
                                    }}
                                    className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-900/60 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <MessageSquare size={14} /> Contacter le Professeur
                                </button>
                            ) : (
                                <div className="w-full py-2 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[11px] font-semibold text-slate-400 italic">Enseignant référent</span>
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                        <BookOpen size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Aucune matière enregistrée</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Les matières de ta classe n'ont pas encore été définies par l'établissement.</p>
                    </div>
                )}
            </div>

            {/* Overview & Useful Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl text-white border border-slate-800 shadow-sm flex flex-col justify-center space-y-4">
                    <h3 className="text-base font-bold flex items-center gap-2">
                        <BarChart3 size={18} className="text-blue-400" /> Vue d'ensemble
                    </h3>
                    <div className="space-y-3">
                        <SmallLegendItem label="Matières Suivies" value={`${subjectCards.length}`} color="bg-emerald-500" percent={100} />
                        <SmallLegendItem label="Classe Active" value={user?.classe?.name || 'Inscrit'} color="bg-blue-500" percent={100} />
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Ressources & Programmes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ResourceBox title="Syllabus Annuel" description="Programme complet 2025-2026." icon={FileText} type="PDF" />
                        <ResourceBox title="Méthodologie" description="Comment réviser efficacement." icon={PlayCircle} type="VIDEO" />
                        <ResourceBox title="Annales & Sujets" description="Sujets des années précédentes." icon={TrendingUp} type="LINK" />
                        <ResourceBox title="Règlement Intérieur" description="Droits et devoirs de l'élève." icon={User} type="PDF" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResourceBox = ({ title, description, icon: Icon, type }: { title: string, description: string, icon: any, type: string }) => (
    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
        <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
            <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{title}</h5>
            <p className="text-[10px] text-slate-400 truncate">{description}</p>
        </div>
        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">{type}</span>
    </div>
);

const SmallLegendItem = ({ label, value, color, percent }: { label: string, value: string, color: string, percent: number }) => (
    <div>
        <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="font-bold text-white">{value}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default StudentCourses;
