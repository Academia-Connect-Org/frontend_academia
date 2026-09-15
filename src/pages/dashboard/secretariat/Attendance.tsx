import React, { useState, useEffect } from 'react';
import {
    Clock,
    UserX,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Users,
    AlertCircle
} from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

const Attendance: React.FC = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedDate) {
            fetchAttendances();
        } else {
            setAttendances([]);
        }
    }, [selectedClassId, selectedDate]);

    const fetchClasses = async () => {
        try {
            const institutionId = user?.institution?.id;
            const res = await api.get('/classes', { params: { institutionId } });
            setClasses(res.data || []);
            if ((res.data || []).length > 0) {
                setSelectedClassId(String(res.data[0].id));
            }
        } catch (error) {
            console.error("Failed to fetch classes", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/attendances/classe/${selectedClassId}`, { params: { date: selectedDate } });
            setAttendances(res.data || []);
        } catch (error) {
            console.error("Failed to fetch attendances", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const stats = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'PRESENT').length,
        absent: attendances.filter(a => a.status === 'ABSENT').length,
        late: attendances.filter(a => a.status === 'LATE').length,
        excused: attendances.filter(a => a.status === 'EXCUSED').length,
    };

    const presenceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                        Suivi des Présences
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consultez et gérez l'assiduité des élèves par classe.</p>
                </div>
                <div className="flex gap-3 self-start md:self-auto">
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none"
                    >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MatrixBlock label="Taux de présence" value={`${presenceRate}%`} icon={CheckCircle} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/40" />
                <MatrixBlock label="Élèves Absents" value={String(stats.absent)} icon={UserX} color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-950/40" />
                <MatrixBlock label="Retards du jour" value={String(stats.late)} icon={Clock} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/40" />
                <MatrixBlock label="Dossiers Traités" value={String(stats.total)} icon={Users} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/40" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleDateChange(-1)} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white px-2 cursor-pointer"
                        />
                        <button onClick={() => handleDateChange(1)} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>

                <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="pb-2 font-bold">Élève</th>
                                <th className="pb-2 font-bold">Classe</th>
                                <th className="pb-2 font-bold">Statut</th>
                                <th className="pb-2 font-bold">Session</th>
                                <th className="pb-2 font-bold">Commentaire</th>
                                <th className="pb-2 text-right font-bold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400 font-bold uppercase tracking-wider">
                                        Chargement en cours...
                                    </td>
                                </tr>
                            ) : attendances.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400 font-bold italic">
                                        Aucun appel enregistré pour cette classe à cette date.
                                    </td>
                                </tr>
                            ) : attendances.map((row: any) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                                                {row.student?.firstName?.[0]}{row.student?.lastName?.[0]}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white uppercase">{row.student?.lastName} {row.student?.firstName}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">{row.classe?.name}</td>
                                    <td className="py-3">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase
                                            ${row.status === 'PRESENT' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                                                row.status === 'ABSENT' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' :
                                                    row.status === 'LATE' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'}`}>
                                            {row.status === 'LATE' ? 'Retard' : row.status === 'EXCUSED' ? 'Excusé' : row.status === 'PRESENT' ? 'Présent' : 'Absent'}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                            <span className="font-bold">{row.timetableEntry?.subject?.name || 'Inconnu'}</span>
                                            <span>({row.timetableEntry?.startTime?.slice(0, 5)} - {row.timetableEntry?.endTime?.slice(0, 5)})</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-slate-500 dark:text-slate-400 italic">
                                        {row.comment || '-'}
                                    </td>
                                    <td className="py-3 text-right">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <AlertCircle size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MatrixBlock = ({ label, value, icon: Icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{value}</h4>
        </div>
        <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
            <Icon size={22} />
        </div>
    </div>
);

export default Attendance;
