import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Download,
    Plus,
    Info,
    Briefcase,
    BookOpen,
    Calendar,
    Loader2,
    Clock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AttendanceModal from '../../../components/dashboard/shared/AttendanceModal';
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
        if (user?.id) {
            fetchMySchedule();
        }
    }, [user?.id]);

    const fetchMySchedule = async () => {
        setLoading(true);
        try {
            const instId = user?.institution?.id;
            const [scheduleRes, configRes] = await Promise.all([
                api.get(`/timetable/teacher/${user?.id}`),
                api.get(`/timetable/config/institution/${instId}`)
            ]);
            setEntries(scheduleRes.data);
            setTimetableConfig(configRes.data);
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
        const subTitle = `Année Académique 2025-2026 - NB-MIND SCHOOL`;

        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text(title, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(subTitle, 14, 26);
        doc.text(`Généré le: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: fr })}`, 14, 32);

        // Prep data for autoTable with row spanning
        const tableColumn = ["Heures", ...DAYS];
        const bodyRows: any[] = [];
        const spannedCells: Set<string> = new Set(); // format: "day-slotIdx"

        timeSlots.slice(0, -1).forEach((time, slotIdx) => {
            const nextTime = timeSlots[slotIdx + 1];
            const isBreak = timetableConfig.breaks.some(b => b.startTime === time);

            // Col 0: Time slot
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

                        // Calculate rowSpan
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
                            content: `${entry.subjectName}\n(Classe: ${entry.classeName})\nSala: ${entry.room}`,
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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Calendar className="text-blue-600" size={32} />
                        Mon Planning
                    </h2>
                    <p className="text-slate-500 font-medium">Visualisez vos cours et gérez votre temps de travail.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={generatePDF}
                        className="bg-blue-600   px-6 py-3.5  font-bold text-white flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                    >
                        <Download size={18} /> Télécharger PDF
                    </button>
                </div>
            </div>

            <div className="bg-white ] shadow-2xl   overflow-hidden relative mb-12">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
                    </div>
                )}

                <div className="h-14 bg-slate-50   flex items-center">
                    <div className="w-20   h-full flex items-center justify-center">
                        <Clock size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 grid grid-cols-6 h-full items-center text-center">
                        {DAYS.map(day => (
                            <div key={day} className="py-2 font-black text-[10px] text-slate-400 uppercase tracking-widest   first:">
                                {day}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex relative" style={{ height: `${timeSlots.length * 100}px` }}>
                    <div className="w-20 flex-shrink-0   relative z-20 bg-slate-50/50">
                        {timeSlots.map(time => {
                            const { top } = calculatePositionAndHeight(time, time);
                            return (
                                <div key={time} style={{ top }} className="absolute inset-x-0 h-4 -mt-2 text-[10px] font-black text-slate-400 text-center">
                                    <span className="bg-white px-2 py-0.5    shadow-sm">{time}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute inset-0 flex">
                        <div className="w-20"></div>
                        <div className="grid grid-cols-6 flex-1">
                            {DAYS.map((_, i) => (
                                <div key={i} className="  h-full relative">
                                    {timeSlots.slice(0, -1).map((time, j) => (
                                        <div key={j} className="h-[100px]  "></div>
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
                                        <div key={`break-${i}`} className="absolute inset-x-0 bg-slate-100/40   flex items-center justify-center z-0" style={{ top, height }}>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pause</span>
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
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute inset-x-0  p-4 shadow-xl  overflow-hidden group hover:z-20 hover:scale-[1.03] transition-all cursor-pointer"
                                                style={{ top, height, backgroundColor: `${entry.subjectColor}15`, borderColor: entry.subjectColor }}
                                            >
                                                <div className="flex flex-col h-full uppercase tracking-tighter">
                                                    <span className="text-[10px] font-black px-2 py-1  bg-white/80 text-slate-600 shadow-sm w-fit mb-2">
                                                        {entry.startTime} - {entry.endTime}
                                                    </span>
                                                    <h5 className="font-black text-slate-800 text-xs leading-tight mb-2" style={{ color: entry.subjectColor }}>
                                                        {entry.subjectName}
                                                    </h5>
                                                    <div className="space-y-1 mt-auto">
                                                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><BookOpen size={10} /> {entry.classeName}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><MapPin size={10} /> {entry.room}</p>
                                                    </div>
                                                    <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-md p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setAttendanceEntry({ entry, date: getNearestDateForDay(entry.dayOfWeek) }); }}
                                                            className="w-full py-2 bg-blue-600 text-white  text-[10px] font-black tracking-widest uppercase"
                                                        >
                                                            Faire l'appel
                                                        </button>
                                                    </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-8 ] text-white shadow-2xl relative overflow-hidden">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Briefcase size={22} className="text-blue-400" /> Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-5   ">
                            <p className="text-blue-200 text-[10px] font-black uppercase mb-1">Volume</p>
                            <p className="text-2xl font-black">{entries.length * 2}h</p>
                        </div>
                        <div className="bg-white/5 p-5   ">
                            <p className="text-blue-200 text-[10px] font-black uppercase mb-1">Classes</p>
                            <p className="text-2xl font-black">{new Set(entries.map(e => e.classeId)).size}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-600 p-8 ] text-white shadow-2xl relative overflow-hidden">
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Info size={22} /> Outils</h3>
                    <p className="text-blue-100 text-sm font-medium mb-6 uppercase tracking-tighter">Accès rapide.</p>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('/dashboard/teacher/book')} className="flex-1 bg-white text-blue-600 px-6 py-3  font-black text-xs uppercase tracking-widest shadow-lg">Cahier</button>
                        <button onClick={() => navigate('/dashboard/teacher/attendance')} className="flex-1 bg-blue-700 text-white px-6 py-3  font-black text-xs uppercase tracking-widest shadow-lg">Appel</button>
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
        </>
    );
};

export default Schedule;
