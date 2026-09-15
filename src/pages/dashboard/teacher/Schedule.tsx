import React, { useState, useEffect } from 'react';
import {
    Download,
    Plus,
    Info,
    Briefcase,
    Calendar,
    Loader2,
    Clock,
    Edit2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AttendanceModal from '../../../components/dashboard/shared/AttendanceModal';
import TimetableEntryDetailsModal from '../../../components/dashboard/shared/TimetableEntryDetailsModal';
import TeacherEditScheduleModal from '../../../components/dashboard/teacher/TeacherEditScheduleModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

const Schedule: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [attendanceEntry, setAttendanceEntry] = useState<{ entry: TimetableEntry, date: string } | null>(null);
    const [detailsEntry, setDetailsEntry] = useState<TimetableEntry | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEntryForEdit, setEditingEntryForEdit] = useState<TimetableEntry | null>(null);
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

    const [viewMode, setViewMode] = useState<'me' | 'class'>('me');
    const [classes, setClasses] = useState<{ id: number, name: string, cycle: { name: string } }[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

    const timeSlots = React.useMemo(() => {
        const [startH, startM] = timetableConfig.startHour.split(':').map(Number);
        const [endH, endM] = timetableConfig.endHour.split(':').map(Number);
        const endTotalM = endH * 60 + endM;
        const duration = timetableConfig.slotDuration || 60;
        const labels = new Set<string>();
        let curr = startH * 60 + startM;
        while (curr < endTotalM) {
            const h = Math.floor(curr / 60);
            const m = curr % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            const brk = timetableConfig.breaks.find(b => b.startTime === timeStr);
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

    useEffect(() => {
        if (viewMode === 'me' && user?.id) {
            fetchMySchedule();
        } else if (viewMode === 'class') {
            fetchClasses();
        }
    }, [viewMode, user?.id]);

    useEffect(() => {
        if (viewMode === 'class' && selectedClassId) {
            fetchClassSchedule(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            const res = await api.get(`/classes?institutionId=${user?.institution?.id}`);
            setClasses(res.data || []);
            if (res.data && res.data.length > 0) {
                setSelectedClassId(res.data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch classes", error);
        }
    };

    const fetchClassSchedule = async (classId: number) => {
        setLoading(true);
        try {
            const [scheduleRes, configRes] = await Promise.all([
                api.get(`/timetable/classe/${classId}`),
                api.get(`/timetable/config/institution/${user?.institution?.id}`)
            ]);
            setEntries(scheduleRes.data || []);
            setTimetableConfig(configRes.data || { startHour: '08:00', endHour: '18:00', slotDuration: 60, breaks: [] });
        } catch (error) {
            console.error("Failed to fetch class schedule", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMySchedule = async () => {
        setLoading(true);
        try {
            const instId = user?.institution?.id;
            const [scheduleRes, configRes] = await Promise.all([
                api.get(`/timetable/teacher/${user?.id}`),
                api.get(`/timetable/config/institution/${instId}`)
            ]);
            setEntries(scheduleRes.data || []);
            setTimetableConfig(configRes.data || { startHour: '08:00', endHour: '18:00', slotDuration: 60, breaks: [] });
        } catch (error) {
            console.error("Failed to fetch teacher schedule", error);
        } finally {
            setLoading(false);
        }
    };

    const getNearestDateForDay = (dayOfWeek: string): string => {
        const days = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
        const targetIdx = days.indexOf(dayOfWeek.toUpperCase());
        const today = new Date();
        const currentIdx = today.getDay();
        let diff = currentIdx - targetIdx;
        if (diff < 0) diff += 7;
        const date = new Date(today);
        date.setDate(today.getDate() - diff);
        return date.toISOString().split('T')[0];
    };

    const getEntriesForDay = (day: string) => {
        return entries.filter(e => e.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const calculatePositionAndHeight = (start: string, end: string) => {
        const startHour = parseInt(start.split(':')[0]);
        const startMin = parseInt(start.split(':')[1]);
        const endHour = parseInt(end.split(':')[0]);
        const endMin = parseInt(end.split(':')[1]);
        const baseHour = parseInt(timetableConfig.startHour.split(':')[0]);
        const baseMin = parseInt(timetableConfig.startHour.split(':')[1]);
        const top = ((startHour - baseHour) * 100) + (((startMin - baseMin) / 60) * 100);
        const height = (endHour - startHour) * 100 + ((endMin - startMin) / 60) * 100;
        return { top: `${top}px`, height: `${height}px` };
    };

    const generatePDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        const title = `EMPLOI DU TEMPS - ${user?.firstName} ${user?.lastName}`;
        const subTitle = `Année Académique 2025-2026 - Academia Connect`;

        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text(title, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(subTitle, 14, 26);
        doc.text(`Généré le: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: fr })}`, 14, 32);

        const tableColumn = ["Heures", ...DAYS];
        const bodyRows: any[] = [];
        const spannedCells: Set<string> = new Set();

        timeSlots.slice(0, -1).forEach((time, slotIdx) => {
            const nextTime = timeSlots[slotIdx + 1];
            const isBreak = timetableConfig.breaks.some(b => b.startTime === time);

            const row: any[] = [{
                content: `${time} - ${nextTime}`,
                styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [100, 116, 139] }
            }];

            DAYS.forEach(day => {
                const key = `${day}-${slotIdx}`;
                if (spannedCells.has(key)) return;

                if (isBreak) {
                    row.push({
                        content: "PAUSE",
                        styles: { halign: 'center', valign: 'middle', fillColor: [241, 245, 249], textColor: [203, 213, 225] }
                    });
                } else {
                    const entriesStartingHere = getEntriesForDay(day).filter(e => e.startTime === time);
                    if (entriesStartingHere.length > 0) {
                        const entry = entriesStartingHere[0];

                        let span = 1;
                        let checkIdx = slotIdx + 1;
                        while (checkIdx < timeSlots.length - 1) {
                            const checkTime = timeSlots[checkIdx];
                            if (entry.endTime > checkTime) {
                                span++;
                                spannedCells.add(`${day}-${checkIdx}`);
                                checkIdx++;
                            } else {
                                break;
                            }
                        }

                        row.push({
                            content: `${entry.subjectName}\n(Classe: ${entry.classeName})\nSalle: ${entry.room}`,
                            rowSpan: span,
                            styles: {
                                fontStyle: 'bold',
                                valign: 'middle',
                                halign: 'center'
                            }
                        });
                    } else {
                        row.push("");
                    }
                }
            });
            bodyRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: bodyRows,
            startY: 40,
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255],
                fontSize: 10,
                halign: 'center',
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 8,
                valign: 'top',
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 30 },
            },
            styles: {
                lineColor: [226, 232, 240],
                lineWidth: 0.1,
            }
        });

        doc.save(`Emploi_du_Temps_${user?.lastName}_${user?.firstName}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                        {viewMode === 'me' ? 'Mon Planning' : 'Planning par Classe'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Visualisez vos cours et gérez votre temps de travail.</p>

                    <div className="flex gap-1.5 mt-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-max border border-slate-200/80 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode('me')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${viewMode === 'me' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Mon Planning
                        </button>
                        <button
                            onClick={() => setViewMode('class')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${viewMode === 'class' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Planning Par Classe
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    {viewMode === 'class' && (
                        <select
                            value={selectedClassId || ''}
                            onChange={(e) => setSelectedClassId(Number(e.target.value))}
                            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none"
                        >
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.cycle?.name ? `[${cls.cycle.name}] ` : ''}{cls.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {viewMode === 'me' && (
                        <button
                            onClick={() => { setEditingEntryForEdit(null); setEditModalOpen(true); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <Plus size={16} /> Nouvelle Session
                        </button>
                    )}
                    <button
                        onClick={generatePDF}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    >
                        <Download size={16} /> Imprimer PDF
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={36} />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="h-12 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center">
                            <div className="w-16 border-r border-slate-100 dark:border-slate-800 h-full flex items-center justify-center">
                                <Clock size={14} className="text-slate-400" />
                            </div>
                            <div className="flex-1 grid grid-cols-6 h-full items-center text-center">
                                {DAYS.map(day => (
                                    <div key={day} className="py-2 font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider border-l border-slate-100 dark:border-slate-800 first:border-0">
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex relative" style={{ height: `${timeSlots.length * 100}px` }}>
                            <div className="w-16 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 relative z-20 bg-slate-50/50 dark:bg-slate-800/40">
                                {timeSlots.map(time => {
                                    const { top } = calculatePositionAndHeight(time, time);
                                    return (
                                        <div key={time} style={{ top }} className="absolute inset-x-0 h-4 -mt-2 text-[10px] font-bold text-slate-400 text-center">
                                            <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{time}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="absolute inset-0 flex">
                                <div className="w-16"></div>
                                <div className="grid grid-cols-6 flex-1">
                                    {DAYS.map((_, i) => (
                                        <div key={i} className="border-l border-slate-100 dark:border-slate-800 h-full relative">
                                            {timeSlots.slice(0, -1).map((time, j) => (
                                                <div key={j} className="h-[100px] border-b border-slate-100/60 dark:border-slate-800/60"></div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-6 relative z-10">
                                {DAYS.map((day) => (
                                    <div key={day} className="relative h-full mx-1">
                                        {timetableConfig.breaks.map((b, i) => {
                                            const { top, height } = calculatePositionAndHeight(
                                                b.startTime,
                                                (() => {
                                                    const [h, m] = b.startTime.split(':').map(Number);
                                                    const totalM = h * 60 + m + b.duration;
                                                    return `${Math.floor(totalM / 60).toString().padStart(2, '0')}:${(totalM % 60).toString().padStart(2, '0')}`;
                                                })()
                                            );
                                            return (
                                                <div key={`break-${i}`} className="absolute inset-x-0 bg-slate-100/50 dark:bg-slate-800/50 border-y border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center z-0" style={{ top, height }}>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pause</span>
                                                </div>
                                            );
                                        })}

                                        <AnimatePresence>
                                            {getEntriesForDay(day).map(entry => {
                                                const { top, height } = calculatePositionAndHeight(entry.startTime, entry.endTime);
                                                return (
                                                    <motion.div
                                                        key={entry.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        onClick={() => setDetailsEntry(entry)}
                                                        className="absolute inset-x-0 rounded-xl p-3 shadow-sm border-l-4 overflow-hidden group hover:z-20 hover:shadow-md transition-all cursor-pointer"
                                                        style={{ top, height, backgroundColor: `${entry.subjectColor}15`, borderColor: entry.subjectColor }}
                                                    >
                                                        <div className="flex flex-col h-full uppercase relative">
                                                            {viewMode === 'me' && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setEditingEntryForEdit(entry); setEditModalOpen(true); }}
                                                                    className="absolute top-0 right-0 p-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors z-30 shadow-sm"
                                                                    title="Modifier"
                                                                >
                                                                    <Edit2 size={12} />
                                                                </button>
                                                            )}
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 w-fit mb-1">
                                                                {entry.startTime} - {entry.endTime}
                                                            </span>
                                                            <h5 className="font-bold text-xs truncate mb-1" style={{ color: entry.subjectColor }}>
                                                                [{viewMode === 'class' ? (entry.teacherName || 'N/A') : entry.classeName}] {entry.subjectName}
                                                            </h5>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-sm">
                    <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-400" /> Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800 p-3 rounded-xl">
                            <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Volume</p>
                            <p className="text-xl font-bold">{entries.length * 2}h</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-xl">
                            <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Classes</p>
                            <p className="text-xl font-bold">{new Set(entries.map(e => e.classeId)).size}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Info size={18} className="text-blue-600 dark:text-blue-400" /> Accès Rapide</h3>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => navigate('/dashboard/teacher/book')} className="flex-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">Cahier de Texte</button>
                        <button onClick={() => navigate('/dashboard/teacher/attendance')} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">Historique d'appels</button>
                    </div>
                </div>
            </div>

            {attendanceEntry && (
                <AttendanceModal
                    isOpen={!!attendanceEntry}
                    onClose={() => setAttendanceEntry(null)}
                    classeId={attendanceEntry.entry.classeId}
                    classeName={attendanceEntry.entry.classeName}
                    timetableEntryId={attendanceEntry.entry.id}
                    date={attendanceEntry.date}
                    subjectName={attendanceEntry.entry.subjectName}
                />
            )}

            <TeacherEditScheduleModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                entry={editingEntryForEdit}
                onSuccess={() => {
                    setEditModalOpen(false);
                    fetchMySchedule();
                }}
            />

            <TimetableEntryDetailsModal
                isOpen={!!detailsEntry}
                onClose={() => setDetailsEntry(null)}
                entry={detailsEntry}
                onAttendanceClick={() => {
                    if (detailsEntry) {
                        setAttendanceEntry({ entry: detailsEntry, date: getNearestDateForDay(detailsEntry.dayOfWeek) });
                    }
                }}
            />
        </div>
    );
};

export default Schedule;
