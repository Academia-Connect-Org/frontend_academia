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
            setClasses(res.data);
            if (res.data.length > 0) {
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
            setAttendances(res.data);
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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Clock className="text-blue-600" size={28} />
                        Suivi des Présences
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Consultez et gérez l'assiduité des élèves par classe.</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 outline-none focus:border-blue-300"
                    >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MatrixBlock label="Taux de présence" value={`${presenceRate}%`} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-50" />
                <MatrixBlock label="Élèves Absents" value={String(stats.absent)} icon={UserX} color="text-rose-500" bg="bg-rose-50" />
                <MatrixBlock label="Retards du jour" value={String(stats.late)} icon={Clock} color="text-amber-500" bg="bg-amber-50" />
                <MatrixBlock label="Dossiers Traités" value={String(stats.total)} icon={Users} color="text-blue-500" bg="bg-blue-50" />
            </div>

            <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                {/* Filters */}
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleDateChange(-1)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-slate-50"><ChevronLeft size={18} /></button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-sm font-black text-slate-900 px-4 uppercase tracking-widest leading-none outline-none cursor-pointer"
                            />
                            <button onClick={() => handleDateChange(1)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-slate-50"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                </div>

                <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                <th className="px-6 py-4">Élève</th>
                                <th className="px-6 py-4">Classe</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Heure d'arrivée</th>
                                <th className="px-6 py-4">Alerte Parent</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">
                                        Chargement en cours...
                                    </td>
                                </tr>
                            ) : attendances.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">
                                        Aucun appel enregistré pour cette classe à cette date.
                                    </td>
                                </tr>
                            ) : attendances.map((row: any) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 group transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 uppercase tracking-tighter shadow-sm border-2 border-slate-50 group-hover:bg-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                                {row.student?.firstName?.[0]}{row.student?.lastName?.[0]}
                                            </div>
                                            <p className="font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors uppercase tracking-tight">{row.student?.lastName} {row.student?.firstName}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-tighter">{row.classe?.name}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm
                                            ${row.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' :
                                                row.status === 'ABSENT' ? 'bg-rose-50 text-rose-600' :
                                                    row.status === 'LATE' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {row.status === 'LATE' ? 'Retard' : row.status === 'EXCUSED' ? 'Excusé' : row.status === 'PRESENT' ? 'Présent' : 'Absent'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-xs font-black text-slate-700 italic">
                                            <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{row.timetableEntry?.subject?.name || 'Inconnu'}</span>
                                            <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">{row.timetableEntry?.startTime?.slice(0, 5)} - {row.timetableEntry?.endTime?.slice(0, 5)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs text-slate-500">{row.comment || '-'}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-slate-50 hover:border-slate-100 opacity-0 group-hover:opacity-100 duration-500">
                                            <AlertCircle size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mise à jour automatique every 5 min | Dernière synchro: 08:32</p>
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-900 shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
                        Imprimer Liste d'Appel
                    </button>
                </div>
            </div>
        </>
    );
};

// Sub-components
const MatrixBlock = ({ label, value, icon: Icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) => (
    <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 group transition-all duration-300 hover:bg-slate-50/50">
        <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12`}>
            <Icon size={22} />
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">{label}</p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</h4>
    </div>
);

export default Attendance;
