import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { Clock, UserX, AlertCircle, Calendar, Users as UsersIcon, Download, User as UserIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ParentAttendance: React.FC = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildrenData = async () => {
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
                console.error("Error fetching children:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChildrenData();
    }, [user?.id]);

    useEffect(() => {
        if (selectedChildId) {
            fetchAttendances(selectedChildId);
        }
    }, [selectedChildId]);

    const fetchAttendances = async (studentId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/attendances/student/${studentId}`);
            const sorted = (res.data || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setAttendances(sorted);
        } catch (error) {
            console.error("Failed to fetch attendances", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: attendances.length,
        absences: attendances.filter(a => a.status === 'ABSENT').length,
        retards: attendances.filter(a => a.status === 'LATE').length,
        excused: attendances.filter(a => a.status === 'EXCUSED').length,
    };

    const displayAttendances = attendances.filter(a => a.status !== 'PRESENT');

    const filteredChildren = selectedClassId === 'all'
        ? children
        : children.filter(c => String(c.classe?.id) === selectedClassId);

    useEffect(() => {
        if (filteredChildren.length > 0 && !filteredChildren.find(c => String(c.id) === selectedChildId)) {
            setSelectedChildId(String(filteredChildren[0].id));
        }
    }, [selectedClassId, filteredChildren, selectedChildId]);

    const getCurrentChild = () => children.find(c => String(c.id) === selectedChildId);

    const downloadPDF = () => {
        const child = getCurrentChild();
        if (!child) return;

        const doc = new jsPDF();
        const schoolName = user?.institution?.name || "ÉTABLISSEMENT SCOLAIRE ACADEMIA CONNECT";

        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("RAPPORT D'ASSIDUITÉ", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(schoolName.toUpperCase(), 105, 30, { align: 'center' });

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.text(`Élève: ${child.firstName} ${child.lastName}`, 14, 55);
        doc.text(`Classe: ${child.classe?.name || 'N/A'}`, 14, 62);
        doc.text(`Parent: ${user?.firstName || ''} ${user?.lastName || ''}`, 14, 69);
        doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 140, 55);

        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 78, 182, 20, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("TOTAL INCIDENTS", 25, 86);
        doc.text("ABSENCES", 85, 86);
        doc.text("RETARDS", 150, 86);

        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text(String(displayAttendances.length), 25, 93);
        doc.text(String(stats.absences), 85, 93);
        doc.text(String(stats.retards), 150, 93);

        const tableRows = displayAttendances.map(row => [
            new Date(row.date).toLocaleDateString('fr-FR'),
            row.timetableEntry?.subject?.name || 'Matière non spécifiée',
            row.status === 'LATE' ? 'Retard' : row.status === 'EXCUSED' ? 'Justifié' : 'Absent',
            row.comment || 'Sans motif'
        ]);

        autoTable(doc, {
            startY: 110,
            head: [['Date', 'Matière', 'Statut', 'Observation']],
            body: tableRows,
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { top: 110 },
            styles: { fontSize: 9, cellPadding: 5 }
        });

        doc.save(`${child.firstName}_${child.lastName}_Assiduite.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                        Assiduité de mes Enfants
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Suivez en temps réel les absences, retards et motifs d'assiduité scolaires.
                    </p>
                </div>

                {classes.length > 1 && (
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe:</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none"
                        >
                            <option value="all">Toutes les classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {loading && children.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Synchronisation des données...</p>
                </div>
            ) : children.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                    <UsersIcon size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Aucun enfant identifié</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Aucun compte élève ne semble être lié à votre profil parent pour le moment.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2 max-w-md">
                        <UserIcon size={16} className="text-blue-600 dark:text-blue-400 ml-1 shrink-0" />
                        <select
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            className="bg-transparent flex-1 font-bold text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                            {filteredChildren.map((child: any) => (
                                <option key={child.id} value={String(child.id)}>
                                    {child.firstName} {child.lastName} {child.classe?.name ? `— ${child.classe.name}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <MatrixBlock label="Absences" value={stats.absences} color="rose" icon={UserX} />
                                <MatrixBlock label="Retards" value={stats.retards} color="amber" icon={Clock} />
                                <MatrixBlock label="Justifiées" value={stats.excused} color="indigo" icon={AlertCircle} />
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Calendar size={18} className="text-blue-600 dark:text-blue-400" /> Historique des Incidents de Présence
                                    </h3>
                                </div>

                                <div className="p-4 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                                <th className="pb-3 px-3 font-bold">Date</th>
                                                <th className="pb-3 px-3 font-bold">Matière & Horaires</th>
                                                <th className="pb-3 px-3 font-bold">Statut</th>
                                                <th className="pb-3 px-3 font-bold">Observation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                            {displayAttendances.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-slate-400 font-bold italic">
                                                        Exemplaire ! Aucun incident d'assiduité à signaler.
                                                    </td>
                                                </tr>
                                            ) : displayAttendances.map((row: any) => (
                                                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                                                        {new Date(row.date).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{row.timetableEntry?.subject?.name || 'Matière'}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {row.timetableEntry?.startTime?.slice(0, 5) || '08:00'} - {row.timetableEntry?.endTime?.slice(0, 5) || '09:00'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${row.status === 'ABSENT' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900' : row.status === 'LATE' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'}`}>
                                                            {row.status === 'LATE' ? 'Retard' : row.status === 'EXCUSED' ? 'Justifié' : 'Absent'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 italic">
                                                        {row.comment || 'Sans motif particulier'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-900 dark:bg-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-sm space-y-4">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <AlertCircle size={18} className="text-blue-400" /> Alertes Directes & Rappels
                                </h4>
                                <div className="space-y-2.5">
                                    {displayAttendances.slice(0, 3).map((alert, i) => (
                                        <div key={i} className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-blue-400 uppercase">{alert.status}</span>
                                                <span className="text-slate-400">{new Date(alert.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs font-medium text-slate-200">
                                                {alert.status === 'ABSENT' ? 'Absence enregistrée' : 'Retard noté'} en {alert.timetableEntry?.subject?.name || 'cours'}.
                                            </p>
                                        </div>
                                    ))}
                                    {displayAttendances.length === 0 && (
                                        <p className="text-xs text-slate-400 italic text-center py-6">Aucune alerte récente.</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={downloadPDF}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                            >
                                <Download size={16} /> Télécharger Rapport PDF
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const MatrixBlock = ({ label, value, color, icon: Icon }: any) => {
    const colors: any = {
        rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
        amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
        indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{label}</p>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h4>
            </div>
            <div className={`w-11 h-11 rounded-2xl ${colors[color]} flex items-center justify-center shrink-0`}>
                <Icon size={20} />
            </div>
        </div>
    );
};

export default ParentAttendance;
