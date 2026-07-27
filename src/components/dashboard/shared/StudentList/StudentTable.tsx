import React from 'react';
import { UserX, ClipboardList, Edit, Trash2 } from 'lucide-react';

interface StudentTableProps {
    loading: boolean;
    studentsLength: number;
    filteredStudents: any[];
    currentPage: number;
    setCurrentPage: (page: number | ((p: number) => number)) => void;
    ITEMS_PER_PAGE: number;
    setSelectedStudent: (student: any) => void;
    setViewingStudent: (id: number) => void;
    setIsBulletinOpen: (isOpen: boolean) => void;
    openEditModal: (student: any) => void;
    setConfirmDelete: (state: { isOpen: boolean, id: number | null }) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
    loading,
    studentsLength,
    filteredStudents,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    setSelectedStudent,
    setViewingStudent,
    setIsBulletinOpen,
    openEditModal,
    setConfirmDelete
}) => {

    const getFinancialBadge = (student: any) => {
        if (student.enrollmentStatus === 'ENROLLED') return { text: 'Inscrit', color: 'bg-emerald-100 text-emerald-700' };
        if (student.enrollmentStatus === 'PENDING_FEE') return { text: 'Frais en attente', color: 'bg-amber-100 text-amber-700' };
        return { text: 'Dossier incomplet', color: 'bg-slate-100 text-slate-700' };
    };

    if (loading && studentsLength === 0) {
        return (
            <div className="py-20 text-center animate-pulse">
                <div className="w-16 h-16 bg-slate-100 mx-auto mb-4 animate-spin"></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Chargement des données...</p>
            </div>
        );
    }

    const totalStudentPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="bg-white shadow-xl overflow-hidden">
            <div className="p-2 overflow-x-auto scrollbar-hide">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <th className="px-10 py-6">Matricule</th>
                            <th className="px-10 py-6">Profil Élève</th>
                            <th className="px-10 py-6">Affectation</th>
                            <th className="px-10 py-6">Responsables Légaux</th>
                            <th className="px-10 py-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginatedStudents.map((student: any) => (
                            <tr key={student.id} className="hover:bg-slate-50/80 group transition-all cursor-pointer">
                                <td className="px-10 py-6" onClick={() => setSelectedStudent(student)}>
                                    <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 tracking-widest uppercase">
                                        {student.studentIdNumber || '—'}
                                    </span>
                                </td>
                                <td className="px-10 py-6" onClick={() => setSelectedStudent(student)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-sm uppercase shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 uppercase text-xs tracking-tight group-hover:text-indigo-600 transition-colors">
                                                {student.lastName} {student.firstName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.gender || 'N/A'}</p>
                                                {(() => {
                                                    const badge = getFinancialBadge(student);
                                                    return badge ? (
                                                        <span className={`px-2 py-0.5 ${badge.color} text-[9px] font-black rounded-sm uppercase tracking-widest`}>
                                                            {badge.text}
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6" onClick={() => setSelectedStudent(student)}>
                                    <div className="flex flex-col gap-1.5 items-start">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black tracking-tight">{student.classe?.name || 'Non assignée'}</span>
                                        <span className="text-[9px] uppercase font-black tracking-[0.1em] text-slate-300 ml-1">{student.classe?.cycle?.name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6" onClick={() => setSelectedStudent(student)}>
                                    <div className="text-[11px] space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="p-1 bg-rose-50 text-rose-500 font-black text-[8px] uppercase">M</span>
                                            <span className="font-bold text-slate-600 truncate max-w-[120px]">{student.motherFirstName} {student.motherLastName || ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="p-1 bg-blue-50 text-blue-500 font-black text-[8px] uppercase">P</span>
                                            <span className="font-bold text-slate-600 truncate max-w-[120px]">{student.fatherFirstName} {student.fatherLastName || ''}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingStudent(student.id);
                                                setIsBulletinOpen(true);
                                            }}
                                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                            title="Voir Bulletin"
                                        >
                                            <ClipboardList size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(student); }}
                                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ isOpen: true, id: student.id }); }}
                                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && !loading && (
                    <div className="py-24 text-center bg-slate-50/30 m-4">
                        <UserX size={48} className="mx-auto text-slate-200 mb-6 stroke-[1]" />
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Aucun dossier trouvé</p>
                    </div>
                )}
                {totalStudentPages > 1 && (
                    <div className="flex justify-between items-center px-10 py-6 border-t border-slate-100 bg-white">
                        <div className="text-xs font-bold text-slate-400">
                            Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} sur {filteredStudents.length} élèves
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs transition-colors"
                            >Précédent</button>
                            <span className="text-xs font-bold text-slate-500">Page {currentPage} sur {totalStudentPages}</span>
                            <button
                                disabled={currentPage === totalStudentPages}
                                onClick={() => setCurrentPage(p => Math.min(totalStudentPages, p + 1))}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs transition-colors"
                            >Suivant</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentTable;
