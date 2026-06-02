import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Download,
    User as UserIcon,
    MapPin,
    BookOpen,
    Loader2,
    Info,
    ChevronRight,
    Clock
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
    const [children, setChildren] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
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
                const kids = res.data?.children || [];
                setChildren(kids);

                const uniqueClasses: any[] = [];
                const classIds = new Set();
                kids.forEach((k: any) => {
                    if (k.classe && !classIds.has(k.classe.id)) {
                        classIds.add(k.classe.id);
                        uniqueClasses.push(k.classe);
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
        if (child?.classe?.id) {
            fetchChildSchedule(child.classe.id);
        } else {
            setEntries([]);
        }
    }, [selectedChildId]);

    const fetchChildSchedule = async (classeId: number) => {
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
            console.error("Failed to fetch child schedule", error);
        } finally {
            setLoading(false);
        }
    };

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

    const downloadPDF = () => {
        const child = children.find(c => String(c.id) === selectedChildId);
        if (!child) return;

        const doc = new jsPDF('l', 'mm', 'a4');
        const schoolName = user?.institution?.name || "ÉTABLISSEMENT SCOLAIRE";

        doc.setFillColor(88, 28, 135); // Purple-900
        doc.rect(0, 0, 297, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text(`EMPLOI DU TEMPS - ${child.firstName} ${child.lastName}`.toUpperCase(), 148, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(schoolName, 148, 22, { align: 'center' });

        const tableBody: any[] = [];
        DAYS.forEach(day => {
            const dayEntries = getEntriesForDay(day);
            dayEntries.forEach(e => {
                tableBody.push([
                    day,
                    `${e.startTime} - ${e.endTime}`,
                    e.subjectName,
                    e.teacherName,
                    e.room
                ]);
            });
        });

        autoTable(doc, {
            startY: 40,
            head: [['Jour', 'Heure', 'Matière', 'Enseignant', 'Salle']],
            body: tableBody,
            headStyles: { fillColor: [88, 28, 135] },
            styles: { fontSize: 8 }
        });

        doc.save(`Emploi_du_temps_${child.firstName}.pdf`);
    };

    const filteredChildren = selectedClassId === 'all'
        ? children
        : children.filter(c => String(c.classe?.id) === selectedClassId);

    return (
        <div className="space-y-10">
            {/* Header section with restricted class selection */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Calendar className="text-purple-600" size={36} />
                        Planning Hebdomadaire
                    </h2>
                    <p className="text-slate-500 font-medium max-w-lg mt-1">
                        Consultez l'emploi du temps détaillé de vos enfants. La sélection est sécurisée et limitée à leur parcours scolaire.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {classes.length > 1 && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Trier par Classe</label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="bg-white border-2 border-slate-100 px-6 py-3.5 rounded-2xl font-bold text-slate-600 outline-none focus:border-purple-500 transition-all shadow-sm"
                            >
                                <option value="all">Toutes les classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={downloadPDF}
                        className="bg-white border-2 border-slate-100 hover:border-purple-200 px-8 py-4 rounded-[28px] font-black text-slate-700 flex items-center gap-3 hover:bg-purple-50 transition-all shadow-sm uppercase text-[10px] tracking-widest self-end"
                    >
                        <Download size={18} className="text-purple-600" /> Exporter PDF
                    </button>
                </div>
            </div>

            {/* Child Toggle Bar */}
            <div className="bg-white p-2.5 rounded-[36px] shadow-xl border border-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {filteredChildren.map((child: any) => (
                    <button
                        key={child.id}
                        onClick={() => setSelectedChildId(String(child.id))}
                        className={`px-8 py-4.5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.15em] transition-all flex items-center gap-4 whitespace-nowrap
                            ${selectedChildId === String(child.id)
                                ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/30 scale-105 active:scale-95'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] ${selectedChildId === String(child.id) ? 'bg-white/20' : 'bg-slate-100'}`}>
                            {child.firstName[0]}
                        </div>
                        {child.firstName} {child.lastName}
                        <span className={`ml-2 px-3 py-1 rounded-lg text-[9px] font-bold ${selectedChildId === String(child.id) ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {child.classe?.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main Schedule Visualizer */}
            <div className="bg-white rounded-[56px] shadow-2xl border border-slate-50 overflow-x-auto relative mb-12 custom-scrollbar">
                <div className="min-w-[1200px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] z-50 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-purple-600" size={48} />
                            <p className="font-black text-purple-900 text-xs uppercase tracking-widest">Génération du planning...</p>
                        </div>
                    )}

                    {!selectedChildId && !loading && (
                        <div className="p-32 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-slate-200">
                                <UserIcon className="text-slate-300" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Sélectionnez un enfant</h3>
                            <p className="text-slate-400 mt-2 font-medium">Pour afficher l'emploi du temps correspondant.</p>
                        </div>
                    )}

                    {selectedChildId && (
                        <>
                            {/* Days Header */}
                            <div className="bg-slate-50/50 border-b border-slate-100 p-2 flex">
                                <div className="w-24 flex-shrink-0"></div>
                                <div className="grid grid-cols-6 flex-1 text-center">
                                    {DAYS.map(day => (
                                        <div key={day} className="py-6 font-black text-[12px] text-slate-400 uppercase tracking-[0.2em] border-l border-slate-100 first:border-0 border-dashed">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Body */}
                            <div className="flex relative" style={{ height: `${timeSlots.length * 120}px` }}>
                                {/* Hour markers */}
                                <div className="w-24 flex-shrink-0 border-r border-slate-100 border-dashed relative z-20">
                                    {timeSlots.map(time => {
                                        const { top } = calculatePositionAndHeight(time, time);
                                        return (
                                            <div key={time} style={{ top: `calc(${top} * 1.2)` }} className="absolute inset-x-0 h-6 -mt-3 text-[11px] font-black text-slate-500 text-center flex items-center justify-center">
                                                <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">{time}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Columns */}
                                <div className="flex-1 grid grid-cols-6 relative z-10">
                                    {DAYS.map((day) => (
                                        <div key={day} className="relative h-full mx-1.5 border-l border-slate-100/50 first:border-0 border-dashed">
                                            {/* Breaks BG */}
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
                                                        className="absolute inset-x-0 bg-slate-50/80 backdrop-blur-[1px] border-y border-slate-200/40 flex flex-col items-center justify-center pointer-events-none z-0"
                                                        style={{ top: `calc(${top} * 1.2)`, height: `calc(${height} * 1.2)` }}
                                                    >
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pause</span>
                                                    </div>
                                                );
                                            })}

                                            <AnimatePresence>
                                                {getEntriesForDay(day).map(entry => {
                                                    const { top, height } = calculatePositionAndHeight(entry.startTime, entry.endTime);
                                                    return (
                                                        <motion.div
                                                            key={entry.id}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            whileHover={{ scale: 1.02, zIndex: 30 }}
                                                            className="absolute inset-x-0 rounded-[32px] p-6 shadow-2xl border-l-[6px] overflow-hidden group transition-all cursor-default backdrop-blur-xl"
                                                            style={{
                                                                top: `calc(${top} * 1.2)`,
                                                                height: `calc(${height} * 1.2)`,
                                                                backgroundColor: `${entry.subjectColor}12`,
                                                                borderColor: entry.subjectColor
                                                            }}
                                                        >
                                                            <div className="flex flex-col h-full uppercase gap-1">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-white text-slate-500 shadow-sm tracking-tighter">
                                                                        {entry.startTime} - {entry.endTime}
                                                                    </span>
                                                                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Info size={14} className="text-slate-400" />
                                                                    </div>
                                                                </div>
                                                                <h5 className="font-black text-slate-900 text-[13px] leading-tight mb-4 tracking-tight">
                                                                    {entry.subjectName}
                                                                </h5>
                                                                <div className="space-y-2 mt-auto">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-7 h-7 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
                                                                            <UserIcon size={12} className="text-purple-600" />
                                                                        </div>
                                                                        <p className="text-[10px] font-bold text-slate-600 truncate">{entry.teacherName}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-7 h-7 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
                                                                            <MapPin size={12} className="text-emerald-500" />
                                                                        </div>
                                                                        <p className="text-[10px] font-bold text-slate-600 italic">Salle: {entry.room}</p>
                                                                    </div>
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
                        </>
                    )}
                </div>
            </div>

            {/* Matrix Footer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-slate-950 p-12 rounded-[56px] text-white shadow-3xl relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black mb-8 flex items-center gap-4">
                            <BookOpen size={36} className="text-purple-500" /> Synthèse Hebdomadaire
                        </h4>
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-2">
                                <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest pl-1">Volume Horaire</p>
                                <p className="text-5xl font-black text-white tracking-tighter">
                                    {entries.length * 2} <span className="text-2xl text-purple-500/50">H</span>
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest pl-1">Matières actives</p>
                                <p className="text-5xl font-black text-white tracking-tighter">
                                    {new Set(entries.map(e => e.subjectId)).size} <span className="text-2xl text-purple-500/50">S</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[56px] shadow-2xl border-2 border-slate-50 relative overflow-hidden flex flex-col justify-center items-start group min-h-[300px]">
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="w-20 h-20 bg-purple-50 rounded-[28px] flex items-center justify-center mb-8 border border-purple-100/50">
                        <Clock className="text-purple-600" size={32} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-4">
                        Suivi en temps réel <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20"></div>
                    </h4>
                    <p className="text-slate-500 font-bold leading-relaxed max-w-sm uppercase tracking-tighter text-sm mb-10">
                        L'emploi du temps est mis à jour instantanément par la direction. Tout changement de salle ou de professeur apparaîtra ici.
                    </p>
                    <button className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 hover:bg-purple-700 transition-all flex items-center gap-4">
                        Synchroniser <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                `}
            </style>
        </div>
    );
};

export default ParentSchedule;
