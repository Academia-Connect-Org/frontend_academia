import React from 'react';
import { UserX, ClipboardList, Edit, Trash2, Eye } from 'lucide-react';

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
        if (student.enrollmentStatus === 'ENROLLED') return { text: 'Inscrit', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' };
        if (student.enrollmentStatus === 'PENDING_FEE') return { text: 'Frais en attente', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' };
        return { text: 'Dossier incomplet', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' };
    };

    if (loading && studentsLength === 0) {
        return (
            <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des données...</p>
            </div>
        );
    }

    const totalStudentPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Matricule</th>
                            <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Profil Élève</th>
                            <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Affectation</th>
                            <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Responsables Légaux</th>
                            <th className="px-5 py-3.5 text-right border-b border-slate-100 dark:border-slate-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {paginatedStudents.map((student: any) => (
                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                                <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200" onClick={() => setSelectedStudent(student)}>
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg text-[10px] uppercase font-mono">
                                        {student.studentIdNumber || '—'}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5" onClick={() => setSelectedStudent(student)}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                {student.lastName} {student.firstName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">{student.gender || 'N/A'}</span>
                                                {(() => {
                                                    const badge = getFinancialBadge(student);
                                                    return badge ? (
                                                        <span className={`px-2 py-0.5 ${badge.color} text-[9px] font-bold rounded-md uppercase`}>
                                                            {badge.text}
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5" onClick={() => setSelectedStudent(student)}>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-slate-900 dark:text-white text-xs">{student.classe?.name || 'Non assignée'}</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{student.classe?.cycle?.name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5" onClick={() => setSelectedStudent(student)}>
                                    <div className="text-xs space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-bold text-[9px] rounded">M</span>
                                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">{student.motherFirstName} {student.motherLastName || ''}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[9px] rounded">P</span>
                                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">{student.fatherFirstName} {student.fatherLastName || ''}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedStudent(student);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Voir dossier complet"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingStudent(student.id);
                                                setIsBulletinOpen(true);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Voir Bulletin"
                                        >
                                            <ClipboardList size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(student); }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ isOpen: true, id: student.id }); }}
                                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && !loading && (
                    <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-800/40 m-4 rounded-xl">
                        <UserX size={40} className="mx-auto text-slate-400 mb-3" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Aucun dossier trouvé</p>
                    </div>
                )}
                {totalStudentPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 gap-3 text-xs">
                        <div className="text-slate-500 dark:text-slate-400 font-medium">
                            Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} sur {filteredStudents.length} élèves
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs transition-colors"
                            >Précédent</button>
                            <span className="font-bold text-slate-600 dark:text-slate-300">Page {currentPage} sur {totalStudentPages}</span>
                            <button
                                disabled={currentPage === totalStudentPages}
                                onClick={() => setCurrentPage(p => Math.min(totalStudentPages, p + 1))}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs transition-colors"
                            >Suivant</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentTable;
