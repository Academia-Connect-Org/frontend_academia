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
            // If student but no class yet, show empty
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
            setEntries(scheduleRes.data);
            setTimetableConfig(configRes.data);
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
        <>
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Calendar className="text-blue-600" size={32} />
                        Mon Emploi du Temps
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Classe de <span className="text-blue-600 font-black uppercase">{user?.classe?.name || 'Non assigné'}</span>
                    </p>
                </div>
                <button className="bg-white   px-6 py-3.5  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={18} /> Télécharger
                </button>
            </div>

            <div className="bg-white shadow-2xl overflow-x-auto relative mb-12">
                <div className="min-w-[800px] relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
                    </div>
                )}

                {/* Top bar with days */}
                <div className="bg-slate-50/50   p-2 flex">
                    <div className="w-20 flex-shrink-0"></div>
                    <div className="grid grid-cols-6 flex-1 text-center">
                        {DAYS.map(day => (
                            <div key={day} className="py-4 font-black text-[11px] text-slate-400 uppercase tracking-widest   first: ">
                                {day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex relative" style={{ height: `${timeSlots.length * 100}px` }}>
                    {/* Time labels */}
                    <div className="w-20 flex-shrink-0    relative z-20">
                        {timeSlots.map(time => {
                            const { top } = calculatePositionAndHeight(time, time);
                            return (
                                <div key={time} style={{ top }} className="absolute inset-x-0 h-4 -mt-2 text-[10px] font-black text-slate-400 text-center flex flex-col justify-start">
                                    <span className="bg-slate-50 mx-2 py-1   ">{time}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex">
                        <div className="w-20"></div>
                        <div className="grid grid-cols-6 flex-1">
                            {DAYS.map((_, i) => (
                                <div key={i} className="   h-full relative">
                                    {timeSlots.slice(0, -1).map((time, j) => {
                                        const isBreakStart = timetableConfig.breaks.some(b => b.startTime === time);
                                        if (isBreakStart) return null;
                                        const nextTime = timeSlots[j + 1];
                                        const { height } = calculatePositionAndHeight(time, nextTime);
                                        return (
                                            <div key={j} style={{ height }} className="  "></div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Entries Overlay */}
                    <div className="flex-1 grid grid-cols-6 relative z-10">
                        {DAYS.map((day) => (
                            <div key={day} className="relative h-full mx-1">
                                {/* Render Breaks */}
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
                                        <div
                                            key={`break-${i}`}
                                            className="absolute inset-x-0 bg-slate-100/40 backdrop-blur-[1px]   flex flex-col items-center justify-center pointer-events-none z-0"
                                            style={{ top, height }}
                                        >
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pause</span>
                                            <span className="text-[8px] font-bold text-slate-300/80">
                                                {b.startTime} - {(() => {
                                                    const [h, m] = b.startTime.split(':').map(Number);
                                                    const totalM = h * 60 + m + b.duration;
                                                    return `${Math.floor(totalM / 60).toString().padStart(2, '0')}:${(totalM % 60).toString().padStart(2, '0')}`;
                                                })()}
                                            </span>
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
                                                onClick={() => setSelectedEntry(entry)}
                                                className="absolute inset-x-0  p-5 shadow-xl  overflow-hidden group hover:z-20 hover:scale-[1.02] transition-all cursor-pointer backdrop-blur-md active:scale-95"
                                                style={{
                                                    top,
                                                    height,
                                                    backgroundColor: `${entry.subjectColor}15`,
                                                    borderColor: entry.subjectColor
                                                }}
                                            >
                                                <div className="flex flex-col h-full uppercase">
                                                    <span className="text-[10px] font-black px-2 py-1  bg-white/80 text-slate-500 shadow-sm w-fit mb-3 tracking-tighter">
                                                        {entry.startTime} - {entry.endTime}
                                                    </span>
                                                    <h5 className="font-extrabold text-slate-800 text-sm leading-tight mb-2 tracking-tight">
                                                        {entry.subjectName}
                                                    </h5>
                                                    <div className="space-y-2 mt-auto">
                                                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                                            <User size={12} className="text-blue-500" /> {entry.teacherName}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                                            <MapPin size={12} className="text-emerald-500" /> {entry.room}
                                                        </p>
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

            {/* Bottom Section: Summary & Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-slate-900 p-8 ] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[220px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10  blur-3xl"></div>
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <BookOpen size={22} className="text-blue-400" /> Résumé
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4   ">
                            <p className="text-blue-300 text-[9px] font-black uppercase mb-1">Matières</p>
                            <p className="text-2xl font-black">{new Set(entries.map(e => e.subjectId)).size}</p>
                        </div>
                        <div className="bg-white/5 p-4   ">
                            <p className="text-blue-300 text-[9px] font-black uppercase mb-1">Charge Horaires</p>
                            <p className="text-2xl font-black">{entries.length * 2}h</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-blue-600 p-8 ] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-800 opacity-90 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <h4 className="text-xl font-black mb-4 flex items-center gap-2 tracking-tight">
                            <Info size={24} /> Note Importante
                        </h4>
                        <p className="text-blue-100 text-sm font-bold leading-relaxed max-w-2xl uppercase tracking-tighter">
                            Ton emploi du temps est un outil précieux. En cas de chevauchement ou d'erreur, veuillez contacter l'administration de l'établissement via ton portail.
                        </p>
                    </div>
                </div>
            </div>

            {/* Session Detail Popup */}
            <AnimatePresence>
                {selectedEntry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setSelectedEntry(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white ] w-full max-w-lg overflow-hidden shadow-2xl relative z-10  "
                        >
                            <div className="p-8 pb-0 flex justify-between items-start">
                                <div className="w-16 h-16  flex items-center justify-center shadow-lg mb-6" style={{ backgroundColor: `${selectedEntry.subjectColor}15`, color: selectedEntry.subjectColor }}>
                                    <BookOpen size={32} />
                                </div>
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600  transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 pt-0">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Détails du cours</span>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-8" style={{ color: selectedEntry.subjectColor }}>
                                    {selectedEntry.subjectName}
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-5 p-5 bg-slate-50   ">
                                        <div className="w-12 h-12 bg-white  flex items-center justify-center shadow-sm text-blue-600">
                                            <Clock size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horaire</p>
                                            <p className="font-black text-slate-700">{selectedEntry.dayOfWeek} • {selectedEntry.startTime} - {selectedEntry.endTime}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 p-5 bg-slate-50   ">
                                        <div className="w-12 h-12 bg-white  flex items-center justify-center shadow-sm text-indigo-600">
                                            <User size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enseignant</p>
                                            <p className="font-black text-slate-700">{selectedEntry.teacherName}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-5 p-5 bg-slate-50   ">
                                            <div className="w-12 h-12 bg-white  flex items-center justify-center shadow-sm text-purple-600">
                                                <Layers size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classe</p>
                                                <p className="font-black text-slate-700">{selectedEntry.classeName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 p-5 bg-slate-50   ">
                                            <div className="w-12 h-12 bg-white  flex items-center justify-center shadow-sm text-emerald-600">
                                                <MapPin size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salle</p>
                                                <p className="font-black text-slate-700">{selectedEntry.room}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="w-full mt-10 bg-slate-900 text-white py-5 ] font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default StudentSchedule;
