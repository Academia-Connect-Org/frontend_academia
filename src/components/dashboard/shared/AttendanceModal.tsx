import React, { useState, useEffect } from 'react';
import { X, Check, Clock, UserX, UserCheck, CheckCircle2, AlertCircle, Loader2, Save, Info } from 'lucide-react';
import api from '../../../api/axios';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    gender?: string;
}

interface AttendanceRecord {
    id?: number;
    studentId: number;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    comment: string;
}

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    classeId: number;
    classeName: string;
    timetableEntryId: number;
    date: string;
    subjectName: string;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
    isOpen,
    onClose,
    classeId,
    classeName,
    timetableEntryId,
    date,
    subjectName
}) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [attendances, setAttendances] = useState<Record<number, AttendanceRecord>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string }>({ type: 'success', text: '' });

    useEffect(() => {
        if (isOpen && classeId) {
            fetchData();
        }
    }, [isOpen, classeId, date, timetableEntryId]);

    const fetchData = async () => {
        setLoading(true);
        setMessage({ type: 'success', text: '' });
        try {
            const [studentsRes, attendanceRes] = await Promise.all([
                api.get(`/students/classe/${classeId}`),
                api.get(`/attendances/session`, { params: { classeId, date, timetableEntryId } })
            ]);

            const stds = studentsRes.data || [];
            setStudents(stds);

            const fetchedAttendances = attendanceRes.data || [];
            const attMap: Record<number, AttendanceRecord> = {};

            stds.forEach((s: Student) => {
                const existing = fetchedAttendances.find((a: any) => a.student?.id === s.id);
                if (existing) {
                    attMap[s.id] = {
                        id: existing.id,
                        studentId: s.id,
                        status: existing.status,
                        comment: existing.comment || ''
                    };
                } else {
                    attMap[s.id] = {
                        studentId: s.id,
                        status: 'PRESENT',
                        comment: ''
                    };
                }
            });

            setAttendances(attMap);
        } catch (error) {
            console.error("Failed to fetch students/attendances", error);
            setMessage({ type: 'error', text: "Erreur lors du chargement des données." });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
        setAttendances(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleCommentChange = (studentId: number, comment: string) => {
        setAttendances(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], comment }
        }));
    };

    const markAllAs = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
        const newAttMap: Record<number, AttendanceRecord> = {};
        Object.values(attendances).forEach(a => {
            newAttMap[a.studentId] = { ...a, status };
        });
        setAttendances(newAttMap);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: 'success', text: '' });
        try {
            const payload = Object.values(attendances).map(a => ({
                studentId: a.studentId,
                status: a.status,
                comment: a.comment
            }));

            await api.post(`/attendances/session`, payload, {
                params: { classeId, date, timetableEntryId }
            });
            setMessage({ type: 'success', text: "L'appel a été enregistré avec succès." });
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (error) {
            console.error("Failed to save attendances", error);
            setMessage({ type: 'error', text: "Erreur lors de l'enregistrement de l'appel." });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <UserCheck className="text-blue-600 dark:text-blue-400" size={20} />
                            Faire l'Appel
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {subjectName} • {classeName} • Séance du {date ? new Date(date).toLocaleDateString('fr-FR') : 'Date non définie'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
                    {message.text && (
                        <div className={`p-4 rounded-xl font-bold text-xs flex items-center gap-2.5 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 mb-3" size={36} />
                            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Chargement des élèves...</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Effectif: {students.length} élèves</span>
                                <button onClick={() => markAllAs('PRESENT')} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition-colors">Tous Présents</button>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {students.map((student) => {
                                    const att = attendances[student.id];
                                    if (!att) return null;

                                    return (
                                        <div key={student.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {student.firstName?.[0]}{student.lastName?.[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{student.lastName} {student.firstName}</p>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{student.gender === 'F' ? 'Fille' : 'Garçon'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${att.status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                    >
                                                        <Check size={14} /> Présent
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${att.status === 'ABSENT' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                    >
                                                        <UserX size={14} /> Absent
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'LATE')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${att.status === 'LATE' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                    >
                                                        <Clock size={14} /> Retard
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${att.status === 'EXCUSED' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                    >
                                                        <Info size={14} /> Excusé
                                                    </button>
                                                </div>
                                            </div>

                                            {(att.status !== 'PRESENT') && (
                                                <div className="w-full">
                                                    <input
                                                        type="text"
                                                        placeholder="Motif (optionnel)"
                                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                                        value={att.comment}
                                                        onChange={(e) => handleCommentChange(student.id, e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? 'Enregistrement...' : 'Valider l\'appel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;
