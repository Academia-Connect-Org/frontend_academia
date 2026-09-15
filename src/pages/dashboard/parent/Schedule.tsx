import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Download,
    User as UserIcon,
    MapPin,
    BookOpen,
    Loader2,
    Info,
    ChevronRight,
    Clock,
    MessageSquare,
    GraduationCap,
    School
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TimetableEntry {
    id: number;
    classeId: number;
    classeName: string;
    subjectId: number;
    subjectName: string;
    subjectColor: string;
    teacherId: number;
    teacherName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    cycle: string;
}

const DAYS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

const ParentSchedule: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [children, setChildren] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timetableConfig, setTimetableConfig] = useState<{
        startHour: string;
        endHour: string;
        slotDuration: number;
        breaks: { startTime: string; duration: number }[];
    }>({
        startHour: '08:00',
        endHour: '18:00',
        slotDuration: 60,
        breaks: []
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/dashboard/parent?userId=${user.id}`);
                const kids = res.data?.childrenDetails || [];
                setChildren(kids);

                const uniqueClasses: any[] = [];
                const classIds = new Set();
                kids.forEach((k: any) => {
                    if (k.classeId && !classIds.has(k.classeId)) {
                        classIds.add(k.classeId);
                        uniqueClasses.push({ id: k.classeId, name: k.classeName });
                    }
                });
                setClasses(uniqueClasses);

                if (kids.length > 0) {
                    setSelectedChildId(String(kids[0].id));
                }
            } catch (err) {
                console.error("Error fetching parent dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user?.id]);

    useEffect(() => {
        const child = children.find(c => String(c.id) === selectedChildId);
        if (child?.classeId) {
            fetchChildSchedule(child.classeId, child.cycleId, child.institutionId);
        } else {
            setEntries([]);
            setSubjects([]);
        }
    }, [selectedChildId]);

    const fetchChildSchedule = async (classeId: number, cycleId?: number, instId?: number) => {
        setLoading(true);
        try {
            const requests: Promise<any>[] = [
                api.get(`/timetable/classe/${classeId}`),
                instId ? api.get(`/timetable/config/institution/${instId}`) : Promise.resolve({ data: { startHour: '08:00', endHour: '18:00', slotDuration: 60, breaks: [] } })
            ];

            if (cycleId) {
                requests.push(api.get(`/subjects/cycle/${cycleId}`).catch(() => ({ data: [] })));
            }

            const results = await Promise.all(requests);

            setEntries(results[0].data || []);
            setTimetableConfig(results[1].data || { startHour: '08:00', endHour: '18:00', slotDuration: 60, breaks: [] });

            if (results[2]) {
                setSubjects(results[2].data || []);
            } else {
                setSubjects([]);
            }
        } catch (error) {
            console.error("Failed to fetch child schedule", error);
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = React.useMemo(() => {
        const [startH, startM] = (timetableConfig.startHour || '08:00').split(':').map(Number);
        const [endH, endM] = (timetableConfig.endHour || '18:00').split(':').map(Number);
        const endTotalM = endH * 60 + endM;
        const duration = timetableConfig.slotDuration || 60;
        const labels = new Set<string>();
        let curr = startH * 60 + startM;
        while (curr < endTotalM) {
            const h = Math.floor(curr / 60);
            const m = curr % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            const brk = timetableConfig.breaks?.find(b => b.startTime === timeStr);
            if (brk) {
                labels.add(timeStr);
                curr += brk.duration;
                const endH_brk = Math.floor(curr / 60);
                const endM_brk = curr % 60;
                labels.add(`${endH_brk.toString().padStart(2, '0')}:${endM_brk.toString().padStart(2, '0')}`);
                continue;
            }
            labels.add(timeStr);
            curr += duration;
        }
        labels.add(`${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`);
        return Array.from(labels).sort();
    }, [timetableConfig]);

    // Group subjects with their respective teachers from timetable entries
    const subjectTeacherList = React.useMemo(() => {
        const map: Record<string, {
            subjectName: string;
            teacherName: string;
            teacherId?: number;
            classeName: string;
            schedules: string[];
            coefficient?: number;
        }> = {};

        entries.forEach((e) => {
            const key = `${e.subjectName}-${e.teacherName}`;
            if (!map[key]) {
                map[key] = {
                    subjectName: e.subjectName || 'Matière',
                    teacherName: e.teacherName || 'Enseignant non assigné',
                    teacherId: e.teacherId,
                    classeName: e.classeName || 'Classe',
                    schedules: []
                };
            }
            if (e.dayOfWeek && e.startTime && e.endTime) {
                const dayName = e.dayOfWeek.charAt(0) + e.dayOfWeek.slice(1).toLowerCase();
                const roomInfo = e.room ? ` (Salle ${e.room})` : '';
                map[key].schedules.push(`${dayName} ${e.startTime}-${e.endTime}${roomInfo}`);
            }
        });

        // Also add subjects from cycle if not present in timetable
        subjects.forEach((sub) => {
            const exists = Object.values(map).some(m => m.subjectName.toLowerCase() === sub.name?.toLowerCase());
            if (!exists) {
                map[`sub-${sub.id}`] = {
                    subjectName: sub.name,
                    teacherName: 'Professeur Titulaire',
                    classeName: 'Classe de l\'enfant',
                    schedules: [],
                    coefficient: sub.coefficient || 1
                };
            }
        });

        return Object.values(map);
    }, [entries, subjects]);

    const activeChild = children.find(c => String(c.id) === selectedChildId);

    if (loading && children.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement de l'emploi du temps...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Calendar size={24} className="text-purple-600 dark:text-purple-400" />
                        Emploi du Temps & Enseignants
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Consultez le planning des cours, la liste des matières et contactez directement les professeurs de vos enfants.
                    </p>
                </div>

                {/* Child Selector */}
                {children.length > 0 && (
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
                        {children.map((child: any) => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildId(String(child.id))}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${String(child.id) === selectedChildId
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <GraduationCap size={14} />
                                {child.firstName} {child.lastName}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Timetable Grid */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Planning Hebdomadaire</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Classe : {activeChild?.classeName || 'Non rattaché'}</p>
                    </div>
                    <button
                        onClick={() => {
                            if (activeChild?.classeId) fetchChildSchedule(activeChild.classeId, activeChild.cycleId, activeChild.institutionId);
                        }}
                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
                    >
                        <Clock size={14} /> Actualiser
                    </button>
                </div>

                {entries.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                        <Calendar size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Aucun cours planifié</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">L'emploi du temps de la classe n'a pas encore été publié par l'établissement.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-200/80 dark:border-slate-800">
                                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jour / Horaire</th>
                                    {DAYS.map(day => (
                                        <th key={day} className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {timeSlots.slice(0, -1).map((slotTime, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-50/50 dark:bg-slate-800/30">
                                            {slotTime} - {timeSlots[idx + 1]}
                                        </td>
                                        {DAYS.map(day => {
                                            const entry = entries.find(e => e.dayOfWeek?.toUpperCase() === day && e.startTime <= slotTime && e.endTime > slotTime);
                                            return (
                                                <td key={day} className="p-2 text-center align-top">
                                                    {entry ? (
                                                        <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 space-y-1">
                                                            <p className="font-bold text-purple-900 dark:text-purple-300 text-xs">{entry.subjectName}</p>
                                                            <p className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">{entry.teacherName}</p>
                                                            {entry.room && <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-md">Salle {entry.room}</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-300 dark:text-slate-700 font-medium">—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Matières & Professeurs Section (NO CAHIER DE TEXTE / NO JOURNAL) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <BookOpen size={18} className="text-purple-600 dark:text-purple-400" />
                            Matières & Corps Enseignant de la Classe
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Consultez les détails des matières enseignées et contactez directement chaque professeur.
                        </p>
                    </div>
                </div>

                {subjectTeacherList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        Aucune matière répertoriée pour cette classe.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjectTeacherList.map((item, i) => (
                            <div
                                key={i}
                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-purple-500/50 transition-all"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                                                {item.subjectName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.subjectName}</h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                    Prof. {item.teacherName}
                                                </p>
                                            </div>
                                        </div>
                                        {item.coefficient && (
                                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg">
                                                Coeff: {item.coefficient}
                                            </span>
                                        )}
                                    </div>

                                    {/* Schedules summary if any */}
                                    {item.schedules.length > 0 && (
                                        <div className="space-y-1 pt-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plages Horaires :</p>
                                            <div className="flex flex-wrap gap-1">
                                                {item.schedules.map((sch, sIdx) => (
                                                    <span key={sIdx} className="px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold text-[10px] rounded-md border border-slate-200 dark:border-slate-700">
                                                        {sch}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Direct Contact Teacher Button */}
                                {item.teacherId && (
                                    <button
                                        onClick={() => {
                                            const childName = activeChild ? `${activeChild.firstName} ${activeChild.lastName}` : 'mon enfant';
                                            const prefill = encodeURIComponent(`Bonjour M./Mme ${item.teacherName}, je vous contacte concernant les cours de ${item.subjectName} de ${childName}...`);
                                            navigate(`/dashboard/parent/messages?contactId=${item.teacherId}&prefill=${prefill}`);
                                        }}
                                        className="w-full py-2 px-3 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-purple-600 dark:text-purple-400 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-900/60 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        <MessageSquare size={14} /> Contacter l'Enseignant
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentSchedule;
