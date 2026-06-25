import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Download,
    MapPin,
    User,
    SearchX,
    Filter,
    Calendar,
    Trash2,
    Loader2,
    Layout,
    CheckCircle2,
    Copy,
    Settings,
    X
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

const Schedule: React.FC = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);

    const [timetableConfig, setTimetableConfig] = useState<{
        startHour: string;
        endHour: string;
        slotDuration: number;
        breaks: { startTime: string; duration: number }[];
    }>({
        startHour: '08:00',
        endHour: '18:00',
        slotDuration: 60,
        breaks: [{ startTime: '10:00', duration: 15 }, { startTime: '12:00', duration: 60 }]
    });
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    const timeSlots = React.useMemo(() => {
        const [startH, startM] = timetableConfig.startHour.split(':').map(Number);
        const [endH, endM] = timetableConfig.endHour.split(':').map(Number);
        const startTotalM = startH * 60 + startM;
        const endTotalM = endH * 60 + endM;
        const duration = timetableConfig.slotDuration || 60;

        const labels = new Set<string>();
        let curr = startTotalM;

        while (curr < endTotalM) {
            const h = Math.floor(curr / 60);
            const m = curr % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            // Is there a break starting exactly at 'curr'?
            const brk = timetableConfig.breaks.find(b => b.startTime === timeStr);
            if (brk) {
                labels.add(timeStr);
                curr += brk.duration;
                // After adding break duration, the new 'curr' is the end of the break
                const endH_brk = Math.floor(curr / 60);
                const endM_brk = curr % 60;
                labels.add(`${endH_brk.toString().padStart(2, '0')}:${endM_brk.toString().padStart(2, '0')}`);
                continue;
            }

            labels.add(timeStr);
            curr += duration;
        }

        // Always add the very beginning and very end
        const finalEndH = Math.floor(endTotalM / 60);
        const finalEndM = endTotalM % 60;
        labels.add(`${finalEndH.toString().padStart(2, '0')}:${finalEndM.toString().padStart(2, '0')}`);

        return Array.from(labels).sort();
    }, [timetableConfig]);

    const [selectedClasse, setSelectedClasse] = useState<string>('');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const gridRef = useRef<HTMLDivElement>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: any, type: 'success' | 'error' = 'success') => {
        const msg = typeof message === 'string' ? message : (message?.message || "Une erreur est survenue");
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Form State
    const [form, setForm] = useState({
        classeId: '',
        subjectId: '',
        teacherId: '',
        dayOfWeek: 'LUNDI',
        startTime: '08:00',
        endTime: '10:00',
        room: '',
        cycle: ''
    });

    const filteredSubjectsForForm = React.useMemo(() => {
        let filtered = subjects;

        // Filter by Teacher specialties
        if (form.teacherId) {
            const teacher = teachers.find(t => t.id.toString() === form.teacherId);
            if (teacher && teacher.specialties && teacher.specialties.length > 0) {
                filtered = filtered.filter(s =>
                    teacher.specialties.some((spec: string) =>
                        spec.toLowerCase() === s.name.toLowerCase()
                    )
                );
            }
        }

        // Filter by Cycle
        if (form.cycle) {
            filtered = filtered.filter(s => !s.cycle || s.cycle.name === form.cycle);
        }

        return filtered;
    }, [form.teacherId, form.cycle, subjects, teachers]);

    // Reset subject if not in filtered list anymore
    useEffect(() => {
        if (form.subjectId && !filteredSubjectsForForm.some(s => s.id.toString() === form.subjectId)) {
            setForm(prev => ({ ...prev, subjectId: '' }));
        }
    }, [form.teacherId, filteredSubjectsForForm]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        refreshEntries();
    }, [selectedClasse, selectedTeacher]);

    const refreshEntries = async () => {
        if (selectedClasse) {
            await fetchEntriesByClasse(selectedClasse);
        } else if (selectedTeacher) {
            await fetchEntriesByTeacher(selectedTeacher);
        } else {
            setEntries([]);
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        const instId = user?.institution?.id;
        try {
            const [classesRes, teachersRes, subjectsRes, cyclesRes, roomsRes, timetableConfigRes] = await Promise.all([
                api.get('/classes', { params: { institutionId: instId } }),
                api.get('/teachers', { params: { institutionId: instId } }),
                api.get('/subjects', { params: { institutionId: instId } }),
                api.get('/cycles', { params: { institutionId: instId } }),
                api.get(`/rooms/institution/${instId}`),
                api.get(`/timetable/config/institution/${instId}`)
            ]);
            setClasses(classesRes.data);
            setTeachers(teachersRes.data);
            setSubjects(subjectsRes.data);
            setCycles(cyclesRes.data);
            setRooms(roomsRes.data);
            setTimetableConfig(timetableConfigRes.data);

            if (classesRes.data.length > 0) {
                setSelectedClasse(classesRes.data[0].id.toString());
            }

            if (cyclesRes.data.length > 0) {
                setForm(prev => ({ ...prev, cycle: cyclesRes.data[0].name }));
            }
            if (roomsRes.data.length > 0) {
                setForm(prev => ({ ...prev, room: roomsRes.data[0].name }));
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const fetchEntriesByClasse = async (id: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/timetable/classe/${id}`);
            setEntries(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEntriesByTeacher = async (id: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/timetable/teacher/${id}`);
            setEntries(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const prevEntries = [...entries];

        // Optimistic UI: Close modal immediately
        setIsAddModalOpen(false);
        const isEditing = !!editingEntry;
        const currentEditId = editingEntry?.id;

        try {
            if (isEditing && currentEditId) {
                // Optimistic state update for edit
                const updated = { ...editingEntry, ...form, id: currentEditId };
                setEntries(prev => prev.map(ent => ent.id === currentEditId ? updated as any : ent));

                const res = await api.put(`/timetable/${currentEditId}`, form);
                setEntries(prev => prev.map(ent => ent.id === currentEditId ? res.data : ent));
                showToast("Session modifiée avec succès");
            } else {
                const res = await api.post('/timetable', form);
                setEntries(prev => [...prev, res.data]);
                showToast("Session ajoutée avec succès");
            }
            setEditingEntry(null);
        } catch (error: any) {
            console.error("Schedule error:", error.response?.data);
            showToast(error.response?.data || "Erreur de planification", 'error');
            setEntries(prevEntries);
            refreshEntries();
            if (isEditing) setIsAddModalOpen(true); // Re-open on error for correction
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGridClick = (day: string, time: string) => {
        setEditingEntry(null);
        const hour = parseInt(time.split(':')[0]);
        const endHour = Math.min(hour + 2, 18);
        setForm({
            ...form,
            classeId: selectedClasse || '',
            teacherId: selectedTeacher || '',
            dayOfWeek: day,
            startTime: time,
            endTime: `${endHour.toString().padStart(2, '0')}:00`,
            subjectId: '',
            room: rooms.length > 0 ? rooms[0].name : '',
            cycle: cycles.length > 0 ? cycles[0].name : ''
        });
        setIsAddModalOpen(true);
    };

    const handleDragEnd = async (entry: TimetableEntry, info: any) => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();

        const x = info.point.x - rect.left - 80;
        const y = info.point.y - rect.top;

        const dayWidth = (rect.width - 80) / 6;
        const dayIndex = Math.floor(x / dayWidth);
        const hourIndex = Math.floor(y / 100);

        if (dayIndex >= 0 && dayIndex < 6 && hourIndex >= 0 && hourIndex < 11) {
            const newDay = DAYS[dayIndex];
            const newStartHour = 8 + hourIndex;
            const newStartTime = `${newStartHour.toString().padStart(2, '0')}:00`;

            const durationHours = parseInt(entry.endTime.split(':')[0]) - parseInt(entry.startTime.split(':')[0]);
            const newEndTime = `${(newStartHour + durationHours).toString().padStart(2, '0')}:00`;

            if (newDay === entry.dayOfWeek && newStartTime === entry.startTime) return;

            try {
                await api.put(`/timetable/${entry.id}`, {
                    ...entry,
                    dayOfWeek: newDay,
                    startTime: newStartTime,
                    endTime: newEndTime
                });
                await refreshEntries();
                showToast("Session déplacée");
            } catch (error: any) {
                showToast(error.response?.data || "Conflit détecté", 'error');
                await refreshEntries(); // Trigger re-render to snap back
            }
        } else {
            setEntries(prev => [...prev]);
        }
    };

    const openEditModal = (entry: TimetableEntry) => {
        setEditingEntry(entry);
        setForm({
            classeId: entry.classeId.toString(),
            subjectId: entry.subjectId.toString(),
            teacherId: entry.teacherId.toString(),
            dayOfWeek: entry.dayOfWeek,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room,
            cycle: entry.cycle
        });
        setIsAddModalOpen(true);
    };

    const confirmDelete = (id: number) => {
        setEntryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteEntry = async () => {
        if (!entryToDelete) return;
        setIsSubmitting(true);
        const prevEntries = [...entries];

        // Optimistic delete
        setEntries(prev => prev.filter(e => e.id !== entryToDelete));
        setIsDeleteModalOpen(false);

        try {
            await api.delete(`/timetable/${entryToDelete}`);
            setEntryToDelete(null);
            showToast("Session supprimée avec succès");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data || "Erreur lors de la suppression", 'error');
            setEntries(prevEntries);
            refreshEntries();
        } finally {
            setIsSubmitting(false);
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
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Calendar className="text-purple-600" size={32} />
                        Planning Académique
                    </h2>
                    <p className="text-slate-500 font-medium">Gestion sophistiquée des emplois du temps et occupation des salles.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="bg-white   p-3  font-bold text-slate-400 hover:text-indigo-600 hover: transition-all shadow-sm"
                        title="Configurer le planning"
                    >
                        <Settings size={22} />
                    </button>
                    <button className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Exporter PDF
                    </button>
                    <button
                        onClick={() => {
                            setEditingEntry(null);
                            setForm({
                                classeId: selectedClasse || '',
                                subjectId: '',
                                teacherId: selectedTeacher || '',
                                dayOfWeek: 'LUNDI',
                                startTime: timetableConfig.startHour,
                                endTime: `${(parseInt(timetableConfig.startHour.split(':')[0]) + 2).toString().padStart(2, '0')}:00`,
                                room: rooms.length > 0 ? rooms[0].name : '',
                                cycle: cycles.length > 0 ? cycles[0].name : ''
                            });
                            setIsAddModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white px-8 py-3  font-black flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={20} /> Nouvelle Session
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                {/* Left Controls */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-8 ] shadow-xl shadow-slate-200/50   ring-1 ring-slate-400/5">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Filter size={16} /> Filtres Vue
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Par Classe</label>
                                <select
                                    className="w-full bg-slate-50   focus: focus:bg-white  py-4 px-5 text-sm font-bold text-slate-700 transition-all outline-none appearance-none"
                                    value={selectedClasse}
                                    onChange={(e) => {
                                        setSelectedClasse(e.target.value);
                                        setSelectedTeacher('');
                                    }}
                                >
                                    <option value="">Sélectionner une classe</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full  "></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase font-black text-slate-300">
                                    <span className="bg-white px-3">OU</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Par Enseignant</label>
                                <select
                                    className="w-full bg-slate-50   focus: focus:bg-white  py-4 px-5 text-sm font-bold text-slate-700 transition-all outline-none appearance-none"
                                    value={selectedTeacher}
                                    onChange={(e) => {
                                        setSelectedTeacher(e.target.value);
                                        setSelectedClasse('');
                                    }}
                                >
                                    <option value="">Sélectionner un enseignant</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 ] text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10  -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                        <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Layout size={20} /> Vue d'ensemble
                        </h4>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center bg-white/10 p-4  backdrop-blur-sm  ">
                                <span className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Total Cours</span>
                                <span className="text-2xl font-black">{entries.length}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/10 p-4  backdrop-blur-sm  ">
                                <span className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Matières</span>
                                <span className="text-2xl font-black">{new Set(entries.map(e => e.subjectName)).size}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Timetable Grid */}
                <div className="lg:col-span-9">
                    <div className="bg-white ] shadow-2xl shadow-slate-200/40   overflow-hidden relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                <Loader2 className="animate-spin text-indigo-600" size={48} />
                            </div>
                        )}

                        {/* Top bar with days */}
                        <div className="bg-slate-50/50   p-2 flex">
                            <div className="w-20 flex-shrink-0"></div>
                            <div className="grid grid-cols-6 flex-1 text-center">
                                {DAYS.map(day => (
                                    <div key={day} className="py-4 font-black text-[11px] text-slate-400 uppercase tracking-widest   first:">
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div ref={gridRef} className="flex relative" style={{ height: `${timeSlots.length * 100}px` }}>
                            {/* Time labels */}
                            <div className="w-20 flex-shrink-0   relative z-20 bg-white/50 backdrop-blur-sm">
                                {timeSlots.map(time => {
                                    const { top } = calculatePositionAndHeight(time, time); // Hack to get top only
                                    return (
                                        <div key={time} style={{ top }} className="absolute inset-x-0 h-4 -mt-2 text-[10px] font-black text-slate-400 text-center flex flex-col justify-start">
                                            <span className="bg-slate-100/50 mx-2 py-1    tracking-tighter shadow-sm">{time}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Background Grid Lines */}
                            <div className="absolute inset-0 flex">
                                <div className="w-20"></div>
                                <div className="grid grid-cols-6 flex-1">
                                    {DAYS.map((day, i) => (
                                        <div key={i} className="  h-full relative">
                                            {timeSlots.slice(0, -1).map((time, j) => {
                                                const isBreakStart = timetableConfig.breaks.some(b => b.startTime === time);
                                                if (isBreakStart) return null;

                                                // Find the next label to determine height
                                                const nextTime = timeSlots[j + 1];
                                                const { height } = calculatePositionAndHeight(time, nextTime);

                                                return (
                                                    <div
                                                        key={j}
                                                        onClick={() => handleGridClick(day, time)}
                                                        style={{ height }}
                                                        className="  cursor-pointer hover:bg-slate-50/50 transition-colors"
                                                    ></div>
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
                                                    className="absolute inset-x-0 bg-slate-100/40 backdrop-blur-[1px]   flex items-center justify-center pointer-events-none z-0"
                                                    style={{ top, height }}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pause</span>
                                                        <span className="text-[8px] font-bold text-slate-300/80">
                                                            {b.startTime} - {(() => {
                                                                const [h, m] = b.startTime.split(':').map(Number);
                                                                const totalM = h * 60 + m + b.duration;
                                                                return `${Math.floor(totalM / 60).toString().padStart(2, '0')}:${(totalM % 60).toString().padStart(2, '0')}`;
                                                            })()}
                                                        </span>
                                                    </div>
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
                                                        drag
                                                        dragConstraints={gridRef}
                                                        dragElastic={0.05}
                                                        dragMomentum={false}
                                                        onDragEnd={(e, info) => handleDragEnd(entry, info)}
                                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        onClick={() => openEditModal(entry)}
                                                        className="absolute inset-x-0  p-4 shadow-xl shadow-slate-200/50  overflow-hidden group hover:z-20 hover:scale-[1.03] transition-all cursor-pointer backdrop-blur-md active:z-30 active:scale-105 active:shadow-2xl"
                                                        style={{
                                                            top,
                                                            height,
                                                            backgroundColor: `${entry.subjectColor || '#6366f1'}15`,
                                                            borderColor: entry.subjectColor || '#6366f1'
                                                        }}
                                                    >
                                                        <div className="flex flex-col h-full">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-[10px] font-black px-2 py-1  bg-white/80 text-slate-600 shadow-sm uppercase tracking-tighter">
                                                                    {entry.startTime} - {entry.endTime}
                                                                </span>
                                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setForm({
                                                                                classeId: entry.classeId.toString(),
                                                                                subjectId: entry.subjectId.toString(),
                                                                                teacherId: entry.teacherId.toString(),
                                                                                dayOfWeek: entry.dayOfWeek,
                                                                                startTime: entry.startTime,
                                                                                endTime: entry.endTime,
                                                                                room: entry.room,
                                                                                cycle: entry.cycle
                                                                            });
                                                                            setEditingEntry(null); // Clear editing to make it a "new" entry
                                                                            setIsAddModalOpen(true);
                                                                        }}
                                                                        className="p-1.5 bg-white/60 text-indigo-400 hover:text-indigo-600    shadow-sm transition-colors"
                                                                        title="Dupliquer"
                                                                    >
                                                                        <Copy size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            confirmDelete(entry.id);
                                                                        }}
                                                                        className="p-1.5 bg-white/60 text-slate-400 hover:text-rose-600    shadow-sm transition-colors"
                                                                        title="Supprimer"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <h5 className="font-black text-slate-800 text-sm leading-tight mb-1 truncate" style={{ color: entry.subjectColor }}>
                                                                {entry.subjectName}
                                                            </h5>
                                                            <p className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 truncate">
                                                                <User size={10} className="text-slate-300" /> {selectedTeacher ? entry.classeName : entry.teacherName}
                                                            </p>
                                                            <div className="mt-auto flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 bg-white/50 px-2 py-1 ">
                                                                    <MapPin size={10} /> {entry.room}
                                                                </span>
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

                        {!selectedClasse && !selectedTeacher && (
                            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-center p-10">
                                <div className="p-8 bg-white  shadow-2xl shadow-indigo-100 mb-6 motion-safe:animate-bounce">
                                    <SearchX size={48} className="text-indigo-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Aucune sélection</h3>
                                <p className="text-slate-500 max-w-xs font-medium">Veuillez sélectionner une classe ou un enseignant pour afficher son emploi du temps.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Entry Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white ] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10  "
                        >
                            <div className="p-10   bg-slate-50/50">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                                    {editingEntry ? 'Modifier la Session' : 'Nouvelle Session'}
                                </h3>
                                <p className="text-slate-500 font-medium mt-1">
                                    {editingEntry ? 'Ajustez les détails de ce cours.' : 'Planifiez un nouveau cours dans l\'emploi du temps.'}
                                </p>
                            </div>

                            <form onSubmit={handleAddEntry} className="p-10">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="col-span-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Classe</label>
                                        <select
                                            required
                                            className="form-input-sophisticated"
                                            value={form.classeId}
                                            onChange={e => setForm({ ...form, classeId: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Enseignant</label>
                                        <select
                                            required
                                            className="form-input-sophisticated"
                                            value={form.teacherId}
                                            onChange={e => setForm({ ...form, teacherId: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Matière</label>
                                        <select
                                            required
                                            className="form-input-sophisticated"
                                            value={form.subjectId}
                                            onChange={e => setForm({ ...form, subjectId: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {filteredSubjectsForForm.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cycle?.name})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Cycle</label>
                                        <select
                                            required
                                            className="form-input-sophisticated"
                                            value={form.cycle}
                                            onChange={e => setForm({ ...form, cycle: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Salle</label>
                                        <select
                                            required
                                            className="form-input-sophisticated"
                                            value={form.room}
                                            onChange={e => setForm({ ...form, room: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {rooms.map(r => <option key={r.id} value={r.name}>{r.name} ({r.type})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 grid grid-cols-4 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Jour</label>
                                            <select
                                                className="form-input-sophisticated"
                                                value={form.dayOfWeek}
                                                onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                                            >
                                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Début</label>
                                            <select
                                                className="form-input-sophisticated"
                                                value={form.startTime}
                                                onChange={e => setForm({ ...form, startTime: e.target.value })}
                                            >
                                                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Fin</label>
                                            <select
                                                className="form-input-sophisticated"
                                                value={form.endTime}
                                                onChange={e => setForm({ ...form, endTime: e.target.value })}
                                            >
                                                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 bg-slate-100 text-slate-600 py-4  font-black hover:bg-slate-200 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-indigo-600 text-white py-4  font-black shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setIsDeleteModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white ] p-10 w-full max-w-md shadow-2xl relative z-10   text-center"
                        >
                            <div className="w-20 h-20 bg-rose-50 text-rose-600  flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Supprimer la session ?</h3>
                            <p className="text-slate-500 font-medium mb-8">Cette action est irréversible. Voulez-vous vraiment continuer ?</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 bg-slate-100 text-slate-600 py-4  font-black hover:bg-slate-200 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteEntry}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-rose-600 text-white py-4  font-black shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Supprimer"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-4  shadow-2xl flex items-center gap-3  backdrop-blur-md ${toast.type === 'success'
                            ? 'bg-emerald-500/90  text-white'
                            : 'bg-rose-500/90  text-white'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
                        <span className="font-black text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Schedule Configuration Modal */}
            <ScheduleConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                config={timetableConfig}
                onSave={async (newConfig) => {
                    setLoading(true);
                    try {
                        const res = await api.post(`/timetable/config/institution/${user?.institution?.id}`, newConfig);
                        setTimetableConfig(res.data);
                        showToast("Configuration mise à jour");
                        setIsConfigModalOpen(false);
                    } catch (error) {
                        showToast("Erreur lors de la mise à jour", "error");
                    } finally {
                        setLoading(false);
                    }
                }}
            />

            <style>
                {`
                    .form-input-sophisticated {
                        width: 100%;
                        background-color: #f8fafc;
                        border: 2px solid transparent;
                        -radius: 1.25rem;
                        padding: 1rem 1.25rem;
                        font-size: 0.875rem;
                        font-weight: 700;
                        color: #334155;
                        transition: all 0.3s;
                        outline: none;
                    }
                    .form-input-sophisticated:focus {
                        -color: #6366f133;
                        background-color: #ffffff;
                        box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.05);
                    }
                `}
            </style>
        </>
    );
};

interface ScheduleConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: any;
    onSave: (config: any) => Promise<void>;
}

const ScheduleConfigModal: React.FC<ScheduleConfigModalProps> = ({ isOpen, onClose, config, onSave }) => {
    const [localConfig, setLocalConfig] = useState({ ...config, breakDuration: config.breakDuration || 15 });
    const [showBreakAdd, setShowBreakAdd] = useState(false);
    const [newBreak, setNewBreak] = useState({ startTime: '10:00', duration: 15 });

    useEffect(() => {
        setLocalConfig({ ...config, breakDuration: config.breakDuration || 15 });
    }, [config]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white ] w-full max-w-xl overflow-hidden shadow-2xl relative z-10  "
            >
                <div className="p-8   bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Configuration Académique</h3>
                        <p className="text-slate-500 font-medium text-sm">Définissez les paramètres globaux de l'établissement.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200  transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Début de journée</label>
                            <input
                                type="time"
                                className="form-input-sophisticated"
                                value={localConfig.startHour}
                                onChange={e => setLocalConfig({ ...localConfig, startHour: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Fin de journée</label>
                            <input
                                type="time"
                                className="form-input-sophisticated"
                                value={localConfig.endHour}
                                onChange={e => setLocalConfig({ ...localConfig, endHour: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                            Durée d'un cours / créneau (minutes)
                        </label>
                        <p className="text-[10px] text-slate-400 mb-2 ml-1 font-medium">Un créneau est la durée par défaut d'une heure de cours.</p>
                        <input
                            type="number"
                            className="form-input-sophisticated"
                            placeholder="60"
                            value={localConfig.slotDuration}
                            onChange={e => setLocalConfig({ ...localConfig, slotDuration: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-4 pt-4  ">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Heures de récréation / Pauses</label>
                            <button
                                onClick={() => setShowBreakAdd(true)}
                                className="text-indigo-600 text-xs font-black flex items-center gap-1 hover:text-indigo-700 hover:scale-105 transition-all"
                            >
                                <Plus size={14} /> Ajouter une pause
                            </button>
                        </div>
                        <div className="grid gap-3">
                            {localConfig.breaks.map((b: any, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-slate-50 p-4    group hover: hover:bg-white transition-all">
                                    <div className="flex gap-4 items-center">
                                        <div className="bg-indigo-600 text-white p-2 ">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-700">Début à {b.startTime}</p>
                                            <p className="text-xs font-medium text-slate-400">Durée : {b.duration} minutes</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setLocalConfig({ ...localConfig, breaks: localConfig.breaks.filter((_: any, idx: number) => idx !== i) })}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {localConfig.breaks.length === 0 && (
                                <div className="text-center py-6    ">
                                    <p className="text-slate-400 text-sm font-medium">Aucune pause définie</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8   flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-100 text-slate-600 py-4  font-black hover:bg-slate-200 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => onSave(localConfig)}
                        className="flex-[2] bg-indigo-600 text-white py-4  font-black shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Enregistrer
                    </button>
                </div>

                {/* Break Add Popup */}
                <AnimatePresence>
                    {showBreakAdd && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={() => setShowBreakAdd(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white ] p-8 w-full max-w-sm shadow-2xl relative z-10  "
                            >
                                <h4 className="text-xl font-black text-slate-800 mb-6">Ajouter une pause</h4>
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Heure de début</label>
                                        <input
                                            type="time"
                                            className="form-input-sophisticated"
                                            value={newBreak.startTime}
                                            onChange={e => setNewBreak({ ...newBreak, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Durée (min)</label>
                                        <input
                                            type="number"
                                            className="form-input-sophisticated"
                                            value={newBreak.duration}
                                            onChange={e => setNewBreak({ ...newBreak, duration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowBreakAdd(false)}
                                        className="flex-1 bg-slate-50 text-slate-600 py-3  font-bold hover:bg-slate-100 transition-all"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => {
                                            setLocalConfig({ ...localConfig, breaks: [...localConfig.breaks, newBreak].sort((a, b) => a.startTime.localeCompare(b.startTime)) });
                                            setShowBreakAdd(false);
                                        }}
                                        className="flex-[2] bg-indigo-600 text-white py-3  font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                                    >
                                        Confirmer
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Schedule;
