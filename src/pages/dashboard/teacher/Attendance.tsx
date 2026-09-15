import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { Clock, UserX, Calendar, Users as UsersIcon, CheckCircle2, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';

const TeacherAttendance: React.FC = () => {
    const { user } = useAuth();
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [teacherProfile, setTeacherProfile] = useState<any>(null);
    const [filterDate, setFilterDate] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSessionModal, setSelectedSessionModal] = useState<any | null>(null);
    const itemsPerPage = 100;

    useEffect(() => {
        const fetchTeacherProfile = async () => {
            if (!user?.id) return;
            try {
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
            const grouped = (res.data || []).reduce((acc: any, curr: any) => {
                const key = `${curr.date}_${curr.timetableEntry?.id}`;
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Historique des Appels</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gérez et consultez vos derniers pointages de présence.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm self-start md:self-auto">
                    <Calendar size={16} className="text-blue-600 dark:text-blue-400 ml-2" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => {
                            setFilterDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white px-2 cursor-pointer"
                    />
                    {filterDate && (
                        <button
                            onClick={() => {
                                setFilterDate('');
                                setCurrentPage(1);
                            }}
                            className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400 mr-2 px-2 py-1 bg-red-50 dark:bg-red-950/40 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement de l'historique...</p>
                </div>
            ) : attendances.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Clock size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Aucun appel enregistré</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Vous n'avez pas encore effectué d'appel cette année.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Séances Effectuées</p>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalSessions}</h4>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                <UserX size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Absences Signalées</p>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalAbsents}</h4>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <UsersIcon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Total Présences</p>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalPresents}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paginatedAttendances.map((session: any, idx: number) => {
                            const previewRecords = session.records.slice(0, 2);
                            const hiddenCount = session.records.length - 2;

                            return (
                                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">{new Date(session.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                                                <span className="text-base font-bold text-slate-900 dark:text-white">{new Date(session.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{session.timetableEntry?.subject?.name || 'Matière inconnue'}</h3>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                                    <span>{session.classe?.name || 'Classe inconnue'}</span>
                                                    <span>•</span>
                                                    <span>{session.timetableEntry?.startTime?.slice(0, 5) || '--:--'} - {session.timetableEntry?.endTime?.slice(0, 5) || '--:--'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-[10px] font-bold rounded-lg uppercase">
                                                {session.records.filter((r: any) => r.status === 'PRESENT').length} Présents
                                            </span>
                                            <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-3 py-1 text-[10px] font-bold rounded-lg uppercase">
                                                {session.records.filter((r: any) => r.status === 'ABSENT').length} Absents
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                                    <th className="pb-2 font-bold">Élève</th>
                                                    <th className="pb-2 text-center font-bold">Statut</th>
                                                    <th className="pb-2 font-bold">Commentaire</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                                {previewRecords.map((rec: any) => (
                                                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                                                                    {rec.student?.firstName?.[0]}{rec.student?.lastName?.[0]}
                                                                </div>
                                                                <span className="font-bold text-slate-900 dark:text-white">{rec.student?.lastName} {rec.student?.firstName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 text-center">
                                                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase
                                                                ${rec.status === 'PRESENT' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                                                                    rec.status === 'ABSENT' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' :
                                                                        rec.status === 'LATE' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'}`}>
                                                                {rec.status === 'PRESENT' ? 'Présent' : rec.status === 'ABSENT' ? 'Absent' : rec.status === 'LATE' ? 'Retard' : 'Excusé'}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5">
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 italic">{rec.comment || '-'}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {session.records.length > 2 ? (
                                            <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800 mt-2">
                                                <button
                                                    onClick={() => setSelectedSessionModal(session)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all hover:scale-105 shadow-sm"
                                                >
                                                    <Eye size={14} /> Voir la suite (+{hiddenCount} autre{hiddenCount > 1 ? 's' : ''} élève{hiddenCount > 1 ? 's' : ''})
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800 mt-2">
                                                <button
                                                    onClick={() => setSelectedSessionModal(session)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <Eye size={14} /> Voir la fiche d'appel complète
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 py-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${currentPage === 1 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <ChevronLeft size={16} /> Précédent
                            </button>
                            <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-500 dark:text-slate-400">
                                Page <span className="text-blue-600 dark:text-blue-400">{currentPage}</span> / {totalPages}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${currentPage === totalPages ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                Suivant <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ELEGANT MODAL POPUP FOR FULL SESSION ATTENDANCE */}
            {selectedSessionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
                                    <span className="text-[9px] uppercase font-bold tracking-wider">{new Date(selectedSessionModal.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                                    <span className="text-base font-extrabold leading-none">{new Date(selectedSessionModal.date).getDate()}</span>
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                        {selectedSessionModal.timetableEntry?.subject?.name || 'Fiche d\'appel'}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                        <span>{selectedSessionModal.classe?.name || 'Classe inconnue'}</span>
                                        <span>•</span>
                                        <span>{selectedSessionModal.timetableEntry?.startTime?.slice(0, 5) || '--:--'} - {selectedSessionModal.timetableEntry?.endTime?.slice(0, 5) || '--:--'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSessionModal(null)}
                                className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Stats Banner */}
                        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Total: {selectedSessionModal.records.length} Élève(s)
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-[10px] font-bold rounded-lg uppercase">
                                    {selectedSessionModal.records.filter((r: any) => r.status === 'PRESENT').length} Présents
                                </span>
                                <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-3 py-1 text-[10px] font-bold rounded-lg uppercase">
                                    {selectedSessionModal.records.filter((r: any) => r.status === 'ABSENT').length} Absents
                                </span>
                            </div>
                        </div>

                        {/* Modal Table / List Body */}
                        <div className="p-4 sm:p-6 overflow-y-auto space-y-2 flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th className="pb-3 font-bold w-10">N°</th>
                                        <th className="pb-3 font-bold">Élève</th>
                                        <th className="pb-3 text-center font-bold">Statut</th>
                                        <th className="pb-3 font-bold">Commentaire</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {selectedSessionModal.records.map((rec: any, index: number) => (
                                        <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3 text-slate-400 font-semibold">{index + 1}</td>
                                            <td className="py-3 font-bold text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {rec.student?.firstName?.[0]}{rec.student?.lastName?.[0]}
                                                    </div>
                                                    <span>{rec.student?.lastName} {rec.student?.firstName}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase
                                                    ${rec.status === 'PRESENT' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                                                        rec.status === 'ABSENT' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' :
                                                            rec.status === 'LATE' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'}`}>
                                                    {rec.status === 'PRESENT' ? 'Présent' : rec.status === 'ABSENT' ? 'Absent' : rec.status === 'LATE' ? 'Retard' : 'Excusé'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-slate-500 dark:text-slate-400 italic">
                                                {rec.comment || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setSelectedSessionModal(null)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors uppercase tracking-wider"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;
