import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Save, Calendar, Clock, MapPin, BookOpen, Users } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

export interface EditTimetableEntry {
    id?: number;
    classeId: number;
    subjectId: number;
    teacherId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    cycle: string;
}

interface TeacherEditScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: any | null; // The existing entry, or null for a new one
    onSuccess: () => void;
}

const DAYS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

const TeacherEditScheduleModal: React.FC<TeacherEditScheduleModalProps> = ({ isOpen, onClose, entry, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string }>({ type: 'success', text: '' });

    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [timetableConfig, setTimetableConfig] = useState<any>(null);

    const [formData, setFormData] = useState<EditTimetableEntry>({
        classeId: 0,
        subjectId: 0,
        teacherId: user?.id || 0,
        dayOfWeek: 'LUNDI',
        startTime: '08:00',
        endTime: '10:00',
        room: '',
        cycle: 'SECONDAIRE'
    });

    useEffect(() => {
        if (isOpen) {
            fetchDependencies();
            if (entry) {
                setFormData({
                    id: entry.id,
                    classeId: entry.classeId,
                    subjectId: entry.subjectId,
                    teacherId: entry.teacherId || user?.id || 0,
                    dayOfWeek: entry.dayOfWeek,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                    room: entry.room || '',
                    cycle: entry.cycle || 'SECONDAIRE'
                });
            } else {
                setFormData({
                    classeId: 0,
                    subjectId: 0,
                    teacherId: user?.id || 0,
                    dayOfWeek: 'LUNDI',
                    startTime: '08:00',
                    endTime: '10:00',
                    room: '',
                    cycle: 'SECONDAIRE'
                });
            }
        }
    }, [isOpen, entry]);

    const fetchDependencies = async () => {
        setLoading(true);
        try {
            const instId = user?.institution?.id;
            // On récupère toutes les classes et matières de l'établissement, plus le profil enseignant et la config
            const [classesRes, subjectsRes, roomsRes, teacherRes, configRes] = await Promise.all([
                api.get(`/classes`, { params: { institutionId: instId } }),
                api.get(`/subjects`, { params: { institutionId: instId } }),
                api.get(`/rooms/institution/${instId}`),
                api.get(`/teachers/${user?.id}`).catch(() => null),
                api.get(`/timetable/config/institution/${instId}`).catch(() => null)
            ]);
            setClasses(classesRes.data);
            setRooms(roomsRes.data);
            if (configRes && configRes.data) {
                setTimetableConfig(configRes.data);
            }
            
            let filteredSubjects = subjectsRes.data;
            const teacherData = teacherRes?.data;
            const specialties = teacherData?.specialties || user?.specialties || [];

            if (specialties && specialties.length > 0) {
                filteredSubjects = filteredSubjects.filter((s: any) => 
                    specialties.some((spec: string) => spec.toLowerCase().trim() === s.name.toLowerCase().trim())
                );
            } else {
                // Si aucune spécialité n'est définie pour cet enseignant, la liste est vide
                filteredSubjects = [];
            }
            
            setSubjects(filteredSubjects);
        } catch (error) {
            console.error("Erreur lors du chargement des données", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: 'success', text: '' });

        if (timetableConfig) {
            const minTime = timetableConfig.startHour || "07:00";
            const maxTime = timetableConfig.endHour || "18:00";
            
            if (formData.startTime < minTime || formData.endTime > maxTime) {
                setMessage({ type: 'error', text: `L'heure doit être comprise entre ${minTime} et ${maxTime}.` });
                return;
            }
            if (formData.startTime >= formData.endTime) {
                setMessage({ type: 'error', text: "L'heure de début doit être antérieure à l'heure de fin." });
                return;
            }
        }

        setSaving(true);

        // Trouver le cycle de la classe sélectionnée
        const selectedClass = classes.find(c => c.id === Number(formData.classeId));
        const cycleToUse = selectedClass?.cycle?.name || formData.cycle;

        const payload = {
            ...formData,
            classeId: Number(formData.classeId),
            subjectId: Number(formData.subjectId),
            cycle: cycleToUse
        };

        try {
            if (payload.id) {
                await api.put(`/timetable/${payload.id}`, payload);
                setMessage({ type: 'success', text: 'Session modifiée avec succès.' });
            } else {
                await api.post(`/timetable`, payload);
                setMessage({ type: 'success', text: 'Nouvelle session créée avec succès.' });
            }
            setTimeout(() => {
                onSuccess();
            }, 1000);
        } catch (error: any) {
            console.error("Failed to save timetable entry", error);
            // Vérifier s'il s'agit d'une erreur de conflit (message venant du backend)
            if (error.response && error.response.data && typeof error.response.data === 'string' && error.response.data.includes("Conflit détecté")) {
                setMessage({ type: 'error', text: error.response.data });
            } else if (error.response && error.response.data && error.response.data.message) {
                setMessage({ type: 'error', text: error.response.data.message });
            } else {
                setMessage({ type: 'error', text: "Erreur lors de l'enregistrement. Veuillez vérifier les conflits potentiels." });
            }
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl max-h-[90vh] flex flex-col rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-8 pb-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Calendar className="text-blue-600" size={28} />
                            {entry ? 'Modifier la session' : 'Nouvelle session'}
                        </h3>
                        <p className="text-slate-500 font-medium mt-1">
                            Ajustez les détails de votre emploi du temps.
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full flex items-center justify-center transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {message.text && (
                        <div className={`p-4 rounded-2xl mb-6 font-bold flex items-center gap-3 animate-in fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                            <p>{message.text}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement...</p>
                        </div>
                    ) : (
                        <form id="edit-schedule-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} /> Classe
                                    </label>
                                    <select
                                        required
                                        value={formData.classeId}
                                        onChange={(e) => setFormData({ ...formData, classeId: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    >
                                        <option value={0} disabled>Sélectionnez une classe</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <BookOpen size={14} /> Matière
                                    </label>
                                    <select
                                        required
                                        value={formData.subjectId}
                                        onChange={(e) => setFormData({ ...formData, subjectId: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    >
                                        <option value={0} disabled>Sélectionnez une matière</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.cycle?.name ? `[${s.cycle.name}] ` : ''}{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={14} /> Jour
                                    </label>
                                    <select
                                        required
                                        value={formData.dayOfWeek}
                                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    >
                                        {DAYS.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={14} /> Début
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.startTime.substring(0, 5)}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={14} /> Fin
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.endTime.substring(0, 5)}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={14} /> Salle
                                </label>
                                <select
                                    required
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                >
                                    <option value="" disabled>Sélectionnez une salle</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.name}>{r.name} {r.type ? `(${r.type})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-white flex justify-end shrink-0 gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        form="edit-schedule-form"
                        type="submit"
                        disabled={loading || saving}
                        className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherEditScheduleModal;
