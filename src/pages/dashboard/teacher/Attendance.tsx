import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { Clock, UserX, AlertCircle, Calendar, Users as UsersIcon, CheckCircle2, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const TeacherAttendance: React.FC = () => {
    const { user } = useAuth();
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState<any>(null);
    const [filterDate, setFilterDate] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;

    useEffect(() => {
        const fetchTeacherProfile = async () => {
            if (!user?.id) return;
            try {
                // We need the teacher entity ID, not the user ID.
                const res = await api.get(`/teachers/user/${user.id}`);
                setTeacherProfile(res.data);
            } catch (err) {
                console.error("Error fetching teacher profile:", err);
            }
        };
        fetchTeacherProfile();
    }, [user?.id]);

    useEffect(() => {
        if (teacherProfile?.id) {
            fetchAttendances();
        }
    }, [teacherProfile?.id]);

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/attendances/teacher/${teacherProfile.id}`);
            // Group by session (date + timetableEntry)
            const grouped = res.data.reduce((acc: any, curr: any) => {
                const key = `${curr.date}_${curr.timetableEntry.id}`;
                if (!acc[key]) {
                    acc[key] = {
                        date: curr.date,
                        timetableEntry: curr.timetableEntry,
                        classe: curr.classe,
                        records: []
                    };
                }
                acc[key].records.push(curr);
                return acc;
            }, {});

            // Sort by date descending
            const sorted = Object.values(grouped).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setAttendances(sorted);
        } catch (error) {
            console.error("Failed to fetch attendances", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAttendances = attendances.filter(sess => {
        if (!filterDate) return true;
        return sess.date === filterDate;
    });

    const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);
    const paginatedAttendances = filteredAttendances.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        totalSessions: filteredAttendances.length,
        totalAbsents: filteredAttendances.reduce((acc, sess) => acc + sess.records.filter((r: any) => r.status === 'ABSENT').length, 0),
        totalPresents: filteredAttendances.reduce((acc, sess) => acc + sess.records.filter((r: any) => r.status === 'PRESENT').length, 0),
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historique des Appels</h2>
                    <p className="text-slate-500 text-sm">Gérez et consultez vos derniers pointages de présence.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2.5  shadow-sm  ">
                    <Calendar size={18} className="text-blue-500 ml-3" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => {
                            setFilterDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 px-2 cursor-pointer"
                    />
                    {filterDate && (
                        <button
                            onClick={() => {
                                setFilterDate('');
                                setCurrentPage(1);
                            }}
                            className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 mr-3 px-2 py-1 bg-slate-50    transition-all"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Chargement de l'historique...</p>
                </div>
            ) : attendances.length === 0 ? (
                <div className="bg-white p-12 ] shadow-xl   text-center">
                    <Clock size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-800 mb-2">Aucun appel enregistré</h3>
                    <p className="text-slate-500">Vous n'avez pas encore effectué d'appel cette année.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 ] shadow-xl  ">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500  flex items-center justify-center mb-4">
                                <CheckCircle2 size={22} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Séances Effectuées</p>
                            <h4 className="text-2xl font-black text-slate-800">{stats.totalSessions}</h4>
                        </div>
                        <div className="bg-white p-6 ] shadow-xl  ">
                            <div className="w-12 h-12 bg-rose-50 text-rose-500  flex items-center justify-center mb-4">
                                <UserX size={22} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Absences Signalées</p>
                            <h4 className="text-2xl font-black text-slate-800">{stats.totalAbsents}</h4>
                        </div>
                        <div className="bg-white p-6 ] shadow-xl  ">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500  flex items-center justify-center mb-4">
                                <UsersIcon size={22} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Présences</p>
                            <h4 className="text-2xl font-black text-slate-800">{stats.totalPresents}</h4>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {paginatedAttendances.map((session: any, idx: number) => (
                            <div key={idx} className="bg-white ] shadow-xl   overflow-hidden hover: transition-all group">
                                <div className="p-6 bg-slate-50/50   flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white  shadow-sm   flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-black text-blue-600 uppercase">{new Date(session.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                                            <span className="text-xl font-black text-slate-800">{new Date(session.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg">{session.timetableEntry?.subject?.name || 'Matière inconnue'}</h3>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {session.classe?.name || 'Classe inconnue'}</span>
                                                <span className="w-1 h-1 bg-slate-200 "></span>
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {session.timetableEntry?.startTime?.slice(0, 5) || '--:--'} - {session.timetableEntry?.endTime?.slice(0, 5) || '--:--'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-50 text-emerald-600 px-4 py-2  text-[10px] font-black tracking-widest uppercase">
                                            {session.records.filter((r: any) => r.status === 'PRESENT').length} Présents
                                        </div>
                                        <div className="bg-rose-50 text-rose-600 px-4 py-2  text-[10px] font-black tracking-widest uppercase">
                                            {session.records.filter((r: any) => r.status === 'ABSENT').length} Absents
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[9px] font-black uppercase tracking-widest text-slate-300  ">
                                                <th className="px-4 py-3">Élève</th>
                                                <th className="px-4 py-3 text-center">Statut</th>
                                                <th className="px-4 py-3">Commentaire</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {session.records.map((rec: any) => (
                                                <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8  bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                                                                {rec.student.firstName[0]}{rec.student.lastName[0]}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-700">{rec.student.lastName} {rec.student.firstName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center">
                                                            <span className={`px-3 py-1  text-[9px] font-black uppercase tracking-wider
                                                                ${rec.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' :
                                                                    rec.status === 'ABSENT' ? 'bg-rose-50 text-rose-600' :
                                                                        rec.status === 'LATE' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                                {rec.status === 'PRESENT' ? 'Présent' : rec.status === 'ABSENT' ? 'Absent' : rec.status === 'LATE' ? 'Retard' : 'Excusé'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs text-slate-400 font-medium italic">{rec.comment || '-'}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 py-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-2 px-6 py-3  font-black text-xs uppercase tracking-widest transition-all ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-blue-600 shadow-lg hover:scale-105 active:scale-95  '}`}
                            >
                                <ChevronLeft size={16} /> Précédent
                            </button>
                            <div className="px-6 py-3 bg-white    shadow-sm font-black text-xs text-slate-400 tracking-[0.2em] uppercase">
                                Page <span className="text-blue-600">{currentPage}</span> / {totalPages}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-2 px-6 py-3  font-black text-xs uppercase tracking-widest transition-all ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-blue-600 shadow-lg hover:scale-105 active:scale-95  '}`}
                            >
                                Suivant <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default TeacherAttendance;
