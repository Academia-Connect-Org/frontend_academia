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

            const stds = studentsRes.data;
            setStudents(stds);

            const fetchedAttendances = attendanceRes.data || [];
            const attMap: Record<number, AttendanceRecord> = {};

            // default everyone to PRESENT if no record exists
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
            }, 1500);
        } catch (error) {
            console.error("Failed to save attendances", error);
            setMessage({ type: 'error', text: "Erreur lors de l'enregistrement de l'appel." });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full h-full sm:h-auto max-w-4xl sm:max-h-[95vh] flex flex-col sm:rounded-[32px] shadow-2xl animate-in sm:zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="p-5 sm:p-8 pb-4 sm:pb-6 flex justify-between items-start sm:items-center shrink-0 bg-white border-b border-slate-100">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 sm:gap-3">
                            <UserCheck className="text-blue-600" size={24} />
                            Faire l'Appel
                        </h3>
                        <p className="text-slate-500 font-medium mt-1 text-xs sm:text-sm">
                            {subjectName} • {classeName} • Séance du {new Date(date).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
                    {message.text && (
                        <div className={`p-4  mb-6 font-bold flex items-center gap-3 animate-in fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600  ' : 'bg-red-50 text-red-600  '}`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement des élèves...</p>
                        </div>
                    ) : (
                        <div className="bg-white sm:rounded-3xl shadow-sm overflow-hidden sm:border border-slate-100">
                            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Effectif: {students.length} élèves</span>
                                <div className="flex gap-2">
                                    <button onClick={() => markAllAs('PRESENT')} className="px-4 py-2 bg-emerald-100 rounded-xl text-emerald-700 hover:bg-emerald-200 text-xs font-bold transition-colors">Tous Présents</button>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {students.map((student) => {
                                    const att = attendances[student.id];
                                    if (!att) return null;

                                    return (
                                        <div key={student.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 w-full">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-slate-800 text-sm truncate">{student.lastName} {student.firstName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{student.gender === 'F' ? 'Fille' : 'Garçon'}</p>
                                                    </div>
                                                </div>

                                                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide shrink-0">
                                                    <div className="flex items-center gap-2 shrink-0 min-w-max">
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${att.status === 'PRESENT' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                        >
                                                            <Check size={14} /> Présent
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${att.status === 'ABSENT' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                        >
                                                            <UserX size={14} /> Absent
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'LATE')}
                                                            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${att.status === 'LATE' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                        >
                                                            <Clock size={14} /> Retard
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                                                            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${att.status === 'EXCUSED' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                        >
                                                            <Info size={14} /> Excusé
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {(att.status !== 'PRESENT') && (
                                                <div className="w-full">
                                                    <input
                                                        type="text"
                                                        placeholder="Motif (optionnel)"
                                                        className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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

                <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex justify-end shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 rounded-2xl text-white font-black shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Enregistrement...' : 'Valider l\'appel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;
