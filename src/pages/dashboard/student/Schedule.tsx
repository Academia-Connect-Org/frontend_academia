import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Download,
    Info,
    BookOpen,
    User,
    Calendar,
    Loader2,
    X,
    Clock,
    Layers
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

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

const StudentSchedule: React.FC = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
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
        if (user?.classe?.id) {
            fetchClasseSchedule(user.classe.id);
        } else if (user?.role === 'ELEVE') {
            setLoading(false);
        }
    }, [user]);

    const fetchClasseSchedule = async (classeId: number) => {
        setLoading(true);
        try {
            const instId = user?.institution?.id;
            const [scheduleRes, configRes] = await Promise.all([
                api.get(`/timetable/classe/${classeId}`),
                api.get(`/timetable/config/institution/${instId}`)
            ]);
            setEntries(scheduleRes.data || []);
            setTimetableConfig(configRes.data || { startHour: '08:00', endHour: '18:00', slotDuration: 60, breaks: [] });
        } catch (error) {
            console.error("Failed to fetch class schedule", error);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                        Mon Emploi du Temps
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Classe: <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{user?.classe?.name || 'Non assigné'}</span>
                    </p>
                </div>
                <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <Download size={16} /> Télécharger
                </button>
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
                                                        onClick={() => setSelectedEntry(entry)}
                                                        className="absolute inset-x-0 rounded-xl p-3 shadow-sm border-l-4 overflow-hidden group hover:z-20 hover:shadow-md transition-all cursor-pointer"
                                                        style={{ top, height, backgroundColor: `${entry.subjectColor}15`, borderColor: entry.subjectColor }}
                                                    >
                                                        <div className="flex flex-col h-full uppercase">
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 w-fit mb-1">
                                                                {entry.startTime} - {entry.endTime}
                                                            </span>
                                                            <h5 className="font-bold text-xs truncate mb-1" style={{ color: entry.subjectColor }}>
                                                                {entry.subjectName}
                                                            </h5>
                                                            <div className="mt-auto text-[10px] text-slate-500 dark:text-slate-400">
                                                                <p className="truncate"><User size={10} className="inline mr-1" />{entry.teacherName}</p>
                                                                <p className="truncate"><MapPin size={10} className="inline mr-1" />{entry.room}</p>
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
                </div>
            </div>

            {/* Bottom Section: Summary & Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl text-white border border-slate-800 shadow-sm space-y-3">
                    <h3 className="text-base font-bold flex items-center gap-2">
                        <BookOpen size={18} className="text-blue-400" /> Résumé
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800 p-3 rounded-xl">
                            <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Matières</p>
                            <p className="text-xl font-bold">{new Set(entries.map(e => e.subjectId)).size}</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-xl">
                            <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Charge Horaires</p>
                            <p className="text-xl font-bold">{entries.length * 2}h</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-blue-600 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-center">
                    <h4 className="text-base font-bold mb-2 flex items-center gap-2">
                        <Info size={18} /> Note Importante
                    </h4>
                    <p className="text-xs text-blue-100 font-medium leading-relaxed">
                        Ton emploi du temps est un outil précieux. En cas de chevauchement ou d'erreur, veuillez contacter l'administration de l'établissement.
                    </p>
                </div>
            </div>

            {/* Session Detail Popup */}
            <AnimatePresence>
                {selectedEntry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xl w-full max-w-md space-y-4"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white" style={{ color: selectedEntry.subjectColor }}>
                                    {selectedEntry.subjectName}
                                </h3>
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-2">
                                    <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                                    <span>{selectedEntry.dayOfWeek} • {selectedEntry.startTime} - {selectedEntry.endTime}</span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-2">
                                    <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                                    <span>{selectedEntry.teacherName}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-2">
                                        <Layers size={16} className="text-purple-600 dark:text-purple-400" />
                                        <span>{selectedEntry.classeName}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-2">
                                        <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        <span>{selectedEntry.room}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="w-full py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Fermer
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentSchedule;
