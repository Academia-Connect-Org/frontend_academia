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
    X,
    Edit2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import TimetableEntryDetailsModal from '../../../components/dashboard/shared/TimetableEntryDetailsModal';

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
    const [detailsEntry, setDetailsEntry] = useState<TimetableEntry | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: any, type: 'success' | 'error' = 'success') => {
        const msg = typeof message === 'string' ? message : (message?.message || "Une erreur est survenue");
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

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

        if (form.cycle) {
            filtered = filtered.filter(s => !s.cycle || s.cycle.name === form.cycle);
        }

        return filtered;
    }, [form.teacherId, form.cycle, subjects, teachers]);

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
            setClasses(classesRes.data || []);
            setTeachers(teachersRes.data || []);
            setSubjects(subjectsRes.data || []);
            setCycles(cyclesRes.data || []);
            setRooms(roomsRes.data || []);
            if (timetableConfigRes.data) setTimetableConfig(timetableConfigRes.data);

            if ((classesRes.data || []).length > 0) {
                setSelectedClasse(classesRes.data[0].id.toString());
            }

            if ((cyclesRes.data || []).length > 0) {
                setForm(prev => ({ ...prev, cycle: cyclesRes.data[0].name }));
            }
            if ((roomsRes.data || []).length > 0) {
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
            setEntries(res.data || []);
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
            setEntries(res.data || []);
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

        setIsAddModalOpen(false);
        const isEditing = !!editingEntry;
        const currentEditId = editingEntry?.id;

        try {
            if (isEditing && currentEditId) {
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
            if (isEditing) setIsAddModalOpen(true);
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
                await refreshEntries();
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                        Planning Académique
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gestion des emplois du temps et occupation des salles.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Settings size={16} /> Configuration
                    </button>
                    <button className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm hidden sm:flex">
                        <Download size={16} /> Exporter PDF
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto"
                    >
                        <Plus size={16} /> Nouvelle Session
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Controls */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Filter size={14} /> Filtres Vue
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Par Classe</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
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

                            <div className="relative text-center">
                                <span className="bg-white dark:bg-slate-900 px-2 text-[10px] font-bold text-slate-400 uppercase">OU</span>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Par Enseignant</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
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
                    <div className="bg-blue-600 dark:bg-blue-900/60 p-5 rounded-2xl text-white shadow-sm space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Layout size={16} /> Vue d'ensemble
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                                <span className="text-[11px] font-bold uppercase">Total Cours</span>
                                <span className="text-lg font-bold">{entries.length}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                                <span className="text-[11px] font-bold uppercase">Matières</span>
                                <span className="text-lg font-bold">{new Set(entries.map(e => e.subjectName)).size}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Timetable Grid */}
                <div className="lg:col-span-9">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-600" size={36} />
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">

                        {/* Top bar with days */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 p-2 flex">
                            <div className="w-16 shrink-0" />
                            <div className="grid grid-cols-6 flex-1 text-center">
                                {DAYS.map(day => (
                                    <div key={day} className="py-2 font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div ref={gridRef} className="flex relative" style={{ height: `${timeSlots.length * 90}px` }}>
                            {/* Time labels */}
                            <div className="w-16 shrink-0 border-r border-slate-100 dark:border-slate-800 relative z-20 bg-white/50 dark:bg-slate-900/50">
                                {timeSlots.map(time => {
                                    const { top } = calculatePositionAndHeight(time, time);
                                    return (
                                        <div key={time} style={{ top }} className="absolute inset-x-0 h-4 -mt-2 text-[10px] font-bold text-slate-400 text-center">
                                            <span>{time}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Background Grid Lines */}
                            <div className="absolute inset-0 flex">
                                <div className="w-16" />
                                <div className="grid grid-cols-6 flex-1">
                                    {DAYS.map((day, i) => (
                                        <div key={i} className="border-l border-slate-100 dark:border-slate-800 h-full relative">
                                            {timeSlots.slice(0, -1).map((time, j) => {
                                                const isBreakStart = timetableConfig.breaks.some(b => b.startTime === time);
                                                if (isBreakStart) return null;

                                                const nextTime = timeSlots[j + 1];
                                                const { height } = calculatePositionAndHeight(time, nextTime);

                                                return (
                                                    <div
                                                        key={j}
                                                        onClick={() => handleGridClick(day, time)}
                                                        style={{ height }}
                                                        className="border-b border-slate-100 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Entries Overlay */}
                            <div className="flex-1 grid grid-cols-6 relative z-10">
                                {DAYS.map((day) => (
                                    <div key={day} className="relative h-full mx-0.5">
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
                                                    className="absolute inset-x-0 bg-slate-100/60 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700 flex items-center justify-center pointer-events-none z-0"
                                                    style={{ top, height }}
                                                >
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Pause</span>
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
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        onClick={() => setDetailsEntry(entry)}
                                                        className="absolute inset-x-0 rounded-xl p-2.5 shadow-sm border-l-4 overflow-hidden group hover:z-20 transition-all cursor-pointer bg-white dark:bg-slate-800"
                                                        style={{
                                                            top,
                                                            height,
                                                            borderColor: entry.subjectColor || '#3b82f6'
                                                        }}
                                                    >
                                                        <div className="flex flex-col h-full">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                                                    {entry.startTime} - {entry.endTime}
                                                                </span>
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                                            setEditingEntry(null);
                                                                            setIsAddModalOpen(true);
                                                                        }}
                                                                        className="p-1 text-slate-400 hover:text-blue-600"
                                                                    >
                                                                        <Copy size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            openEditModal(entry);
                                                                        }}
                                                                        className="p-1 text-slate-400 hover:text-blue-600"
                                                                    >
                                                                        <Edit2 size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            confirmDelete(entry.id);
                                                                        }}
                                                                        className="p-1 text-slate-400 hover:text-red-600"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate" style={{ color: entry.subjectColor }}>
                                                                {entry.subjectName}
                                                            </h5>
                                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                                                {selectedTeacher ? entry.classeName : entry.teacherName}
                                                            </p>
                                                            <div className="mt-auto">
                                                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
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
                            </div>
                        </div>

                        {!selectedClasse && !selectedTeacher && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs z-40 flex flex-col items-center justify-center text-center p-6">
                                <SearchX size={40} className="text-slate-400 mb-2" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Aucune sélection</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">Veuillez sélectionner une classe ou un enseignant pour afficher son emploi du temps.</p>
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
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingEntry ? 'Modifier la Session' : 'Nouvelle Session'}
                                </h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleAddEntry} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe</label>
                                        <select
                                            required
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            value={form.classeId}
                                            onChange={e => setForm({ ...form, classeId: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enseignant</label>
                                        <select
                                            required
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            value={form.teacherId}
                                            onChange={e => setForm({ ...form, teacherId: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Matière</label>
                                        <select
                                            required
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            value={form.subjectId}
                                            onChange={e => setForm({ ...form, subjectId: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {filteredSubjectsForForm.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cycle?.name})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle</label>
                                        <select
                                            required
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            value={form.cycle}
                                            onChange={e => setForm({ ...form, cycle: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {cycles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Salle</label>
                                        <select
                                            required
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            value={form.room}
                                            onChange={e => setForm({ ...form, room: e.target.value })}
                                        >
                                            {rooms.map(r => <option key={r.id} value={r.name}>{r.name} ({r.type})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jour</label>
                                            <select
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                value={form.dayOfWeek}
                                                onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                                            >
                                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Début</label>
                                            <select
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                value={form.startTime}
                                                onChange={e => setForm({ ...form, startTime: e.target.value })}
                                            >
                                                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fin</label>
                                            <select
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                value={form.endTime}
                                                onChange={e => setForm({ ...form, endTime: e.target.value })}
                                            >
                                                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <TimetableEntryDetailsModal
                isOpen={!!detailsEntry}
                onClose={() => setDetailsEntry(null)}
                entry={detailsEntry}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                            onClick={() => setIsDeleteModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative z-10 text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Supprimer la session ?</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Cette action est irréversible. Voulez-vous vraiment continuer ?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteEntry}
                                    disabled={isSubmitting}
                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Supprimer"}
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
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border backdrop-blur-md text-xs font-bold ${toast.type === 'success'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-red-600 border-red-500 text-white'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
                        <span>{toast.message}</span>
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
        </div>
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
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
            >
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Configuration Académique</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Définissez les paramètres globaux de l'établissement.</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Début de journée</label>
                            <input
                                type="time"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                value={localConfig.startHour}
                                onChange={e => setLocalConfig({ ...localConfig, startHour: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fin de journée</label>
                            <input
                                type="time"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                value={localConfig.endHour}
                                onChange={e => setLocalConfig({ ...localConfig, endHour: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Durée d'un cours / créneau (minutes)
                        </label>
                        <input
                            type="number"
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            placeholder="60"
                            value={localConfig.slotDuration}
                            onChange={e => setLocalConfig({ ...localConfig, slotDuration: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Heures de récréation / Pauses</label>
                            <button
                                onClick={() => setShowBreakAdd(true)}
                                className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline"
                            >
                                <Plus size={14} /> Ajouter une pause
                            </button>
                        </div>
                        <div className="space-y-2">
                            {localConfig.breaks.map((b: any, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-3 items-center">
                                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">Début à {b.startTime}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Durée : {b.duration} minutes</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setLocalConfig({ ...localConfig, breaks: localConfig.breaks.filter((_: any, idx: number) => idx !== i) })}
                                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => onSave(localConfig)}
                        className="flex-[2] py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
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
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                                onClick={() => setShowBreakAdd(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative z-10"
                            >
                                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Ajouter une pause</h4>
                                <div className="space-y-3 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Heure de début</label>
                                        <input
                                            type="time"
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            value={newBreak.startTime}
                                            onChange={e => setNewBreak({ ...newBreak, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Durée (min)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            value={newBreak.duration}
                                            onChange={e => setNewBreak({ ...newBreak, duration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowBreakAdd(false)}
                                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => {
                                            setLocalConfig({ ...localConfig, breaks: [...localConfig.breaks, newBreak].sort((a, b) => a.startTime.localeCompare(b.startTime)) });
                                            setShowBreakAdd(false);
                                        }}
                                        className="flex-[2] py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
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
