import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { Clock, UserX, AlertCircle, Calendar, Users as UsersIcon, ChevronRight, Plus, Download } from 'lucide-react';
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
            const sorted = res.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        const schoolName = user?.institution?.name || "ÉTABLISSEMENT SCOLAIRE";

        // Premium Header
        doc.setFillColor(30, 41, 59); // Slate-900
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("RAPPORT D'ASSIDUITÉ", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(schoolName.toUpperCase(), 105, 30, { align: 'center' });

        // Info Section
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.text(`Élève: ${child.firstName} ${child.lastName}`, 14, 55);
        doc.text(`Classe: ${child.classe?.name || 'N/A'}`, 14, 62);
        doc.text(`Parent: ${user?.firstName} ${user?.lastName}`, 14, 69);
        doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 140, 55);

        // Stats Summary
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

        // Attendance Table
        const tableRows = displayAttendances.map(row => [
            new Date(row.date).toLocaleDateString('fr-FR'),
            row.timetableEntry?.subject?.name || 'Inconnu',
            row.status === 'LATE' ? 'Retard' : row.status === 'EXCUSED' ? 'Excusé' : 'Absent',
            row.comment || 'N/A'
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Clock className="text-blue-600" size={32} />
                        Assiduité de mes Enfants
                    </h2>
                    <p className="text-slate-500 font-medium max-w-lg mt-1">
                        Suivez en temps réel les absences et les retards. La sélection est limitée aux classes de vos enfants inscrits.
                    </p>
                </div>

                {classes.length > 1 && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Filtrer par Classe</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="bg-white   px-6 py-3  font-bold text-slate-600 outline-none focus: transition-all shadow-sm"
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
                <div className="flex justify-center items-center h-64 bg-white ] shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12     animate-spin"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronisation des données...</p>
                    </div>
                </div>
            ) : children.length === 0 ? (
                <div className="bg-white p-16 ] shadow-xl   text-center">
                    <div className="w-20 h-20 bg-slate-50  flex items-center justify-center mx-auto mb-6">
                        <UsersIcon size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3">Aucun enfant identifié</h3>
                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                        Il semble qu'aucun compte élève ne soit actuellement lié à votre profil parent.
                        Veuillez contacter le secrétariat pour l'affiliation.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white p-2 ] shadow-lg   flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {filteredChildren.map((child: any) => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildId(String(child.id))}
                                className={`px-8 py-4 ] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap
                                    ${selectedChildId === String(child.id)
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105 active:scale-95'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <div className={`w-6 h-6  flex items-center justify-center text-[10px] ${selectedChildId === String(child.id) ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    {child.firstName[0]}
                                </div>
                                {child.firstName} {child.lastName}
                                <span className={`ml-2 px-2 py-0.5  text-[8px] font-bold ${selectedChildId === String(child.id) ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {child.classe?.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <div className="grid grid-cols-3 gap-6">
                                <MatrixBlock label="Absences" value={stats.absences} color="rose" icon={UserX} />
                                <MatrixBlock label="Retards" value={stats.retards} color="amber" icon={Clock} />
                                <MatrixBlock label="Justifiées" value={stats.excused} color="indigo" icon={AlertCircle} />
                            </div>

                            <div className="bg-white ] shadow-2xl   overflow-hidden">
                                <div className="px-10 py-8   bg-slate-50/20 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                                        <Calendar size={24} className="text-blue-600" /> Historique de Présence
                                    </h3>
                                    <div className="px-5 py-2 bg-emerald-50 text-emerald-600  text-[10px] font-black uppercase tracking-widest  ">
                                        Fidélité au cours
                                    </div>
                                </div>

                                <div className="p-4">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-8 py-6">Période / Date</th>
                                                <th className="px-8 py-6">Matière & Plage</th>
                                                <th className="px-8 py-6">Statut de présence</th>
                                                <th className="px-8 py-6">Commentaire</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50/50">
                                            {displayAttendances.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-24 text-center">
                                                        <div className="w-16 h-16 bg-emerald-50  flex items-center justify-center mx-auto mb-4">
                                                            <Plus className="text-emerald-500 rotate-45" size={24} />
                                                        </div>
                                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Exemplaire ! Aucun incident noté.</p>
                                                    </td>
                                                </tr>
                                            ) : displayAttendances.map((row: any) => (
                                                <tr key={row.id} className="group hover:bg-slate-50/50 transition-all cursor-default">
                                                    <td className="px-8 py-8 font-black text-slate-900 text-sm italic">
                                                        {new Date(row.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{row.timetableEntry?.subject?.name || 'Matière'}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                                                {row.timetableEntry?.startTime?.slice(0, 5)} - {row.timetableEntry?.endTime?.slice(0, 5)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <div className={`inline-flex items-center gap-3 px-6 py-2  text-[10px] font-black uppercase tracking-[0.1em] shadow-sm
                                                            ${row.status === 'ABSENT' ? 'bg-rose-50 text-rose-500  ' :
                                                                row.status === 'LATE' ? 'bg-amber-50 text-amber-500  ' : 'bg-indigo-50 text-indigo-500  '}`}>
                                                            <div className={`w-1.5 h-1.5  animate-pulse ${row.status === 'ABSENT' ? 'bg-rose-500' : row.status === 'LATE' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                                            {row.status === 'LATE' ? 'Retardé' : row.status === 'EXCUSED' ? 'Justifié' : 'Absent'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <p className="text-xs text-slate-500 font-medium max-w-[200px] group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                                                            {row.comment || 'Sans motif fourni'}
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-slate-900 ] p-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20  blur-[80px]"></div>
                                <h4 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
                                    <AlertCircle size={22} className="text-blue-400" /> Alertes Directes
                                </h4>
                                <div className="space-y-6 relative z-10">
                                    {displayAttendances.slice(0, 3).map((alert, i) => (
                                        <div key={i} className="p-6  bg-white/5   hover:bg-white/10 transition-all cursor-pointer group/alert">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{alert.status}</span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase">{new Date(alert.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-200 group-hover/alert:text-white transition-colors">
                                                {alert.status === 'ABSENT' ? 'Absence' : 'Retard'} détecté en {alert.timetableEntry?.subject?.name}.
                                            </p>
                                        </div>
                                    ))}
                                    {displayAttendances.length === 0 && (
                                        <div className="py-12 text-center opacity-40">
                                            <p className="text-xs font-black uppercase tracking-widest">Aucune alerte</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={downloadPDF}
                                className="w-full py-6 bg-white   ] font-black text-xs uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-50 hover: transition-all flex items-center justify-center gap-4 group shadow-lg"
                            >
                                <Download size={18} className="text-blue-600" /> Télécharger PDF <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const MatrixBlock = ({ label, value, color, icon: Icon }: any) => {
    const colors = {
        rose: 'text-rose-600 bg-rose-50 ',
        amber: 'text-amber-600 bg-amber-50 ',
        indigo: 'text-indigo-600 bg-indigo-50 ',
    };
    return (
        <div className="bg-white p-8 ] shadow-xl   group hover:-translate-y-1 transition-all">
            <div className={`w-14 h-14  flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all ${colors[color as keyof typeof colors]}`}>
                <Icon size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
        </div>
    );
};

export default ParentAttendance;
