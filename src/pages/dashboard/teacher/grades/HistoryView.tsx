import React from 'react';
import { BarChart3, ClipboardList, CheckCircle2, Filter, Download, ChevronDown, FileText, Table as TableIcon, Edit2, Trash2 } from 'lucide-react';
import MatrixCard from './MatrixCard';

interface HistoryViewProps {
    history: any[];
    selectedHistorySubject: string;
    setSelectedHistorySubject: (sub: string) => void;
    subjects: any[];
    selectedHistoryYear: string;
    setSelectedHistoryYear: (year: string) => void;
    showExportMenu: boolean;
    setShowExportMenu: (show: boolean) => void;
    handleExport: (format: 'PDF' | 'EXCEL' | 'CSV') => void;
    displayHistory: any[];
    handleEditGrade: (grade: any) => void;
    handleDeleteGrade: (id: number) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
    history,
    selectedHistorySubject,
    setSelectedHistorySubject,
    subjects,
    selectedHistoryYear,
    setSelectedHistoryYear,
    showExportMenu,
    setShowExportMenu,
    handleExport,
    displayHistory,
    handleEditGrade,
    handleDeleteGrade
}) => {
    const sessionCount = new Set(history.map(g => `${g.classe?.id}-${g.subject?.id}-${g.type}-${g.trimester}-${g.academicYear}`)).size;
    
    // Dynamic average calculation
    const avgScore = history.length > 0
        ? (history.reduce((acc, g) => acc + (g.value || 0), 0) / history.length).toFixed(1)
        : '0.0';

    const successRate = history.length > 0
        ? Math.round((history.filter(g => (g.value || 0) >= (g.maxPoints || 20) / 2).length / history.length) * 100) + '%'
        : '0%';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MatrixCard label="Moyenne Générale" value={avgScore} trend="Global" icon={BarChart3} color="bg-blue-600" />
                <MatrixCard label="Évaluations faites" value={String(sessionCount)} trend="Sessions" icon={ClipboardList} color="bg-indigo-600" />
                <MatrixCard label="Taux de réussite" value={successRate} trend="Moyenne" icon={CheckCircle2} color="bg-emerald-600" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Historique des Évaluations</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                className="text-xs font-bold text-slate-900 dark:text-white outline-none bg-transparent"
                                value={selectedHistorySubject}
                                onChange={(e) => setSelectedHistorySubject(e.target.value)}
                            >
                                <option value="ALL">Toutes les matières</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                className="text-xs font-bold text-slate-900 dark:text-white outline-none bg-transparent"
                                value={selectedHistoryYear}
                                onChange={(e) => setSelectedHistoryYear(e.target.value)}
                            >
                                <option value="ALL">Toutes les années</option>
                                <option value="2024-2025">2024-2025</option>
                                <option value="2025-2026">2025-2026</option>
                                <option value="2026-2027">2026-2027</option>
                            </select>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs"
                            >
                                <Download size={14} /> Exporter <ChevronDown size={14} />
                            </button>

                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl py-2 z-50">
                                    <button
                                        onClick={() => handleExport('PDF')}
                                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                    >
                                        <FileText size={14} className="text-red-500" /> Format PDF (.pdf)
                                    </button>
                                    <button
                                        onClick={() => handleExport('EXCEL')}
                                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                    >
                                        <TableIcon size={14} className="text-emerald-500" /> Format EXCEL (.xlsx)
                                    </button>
                                    <button
                                        onClick={() => handleExport('CSV')}
                                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                    >
                                        <Download size={14} className="text-blue-500" /> Format CSV (.csv)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="pb-2 font-bold">Évaluation</th>
                                <th className="pb-2 font-bold">Classe & Matière</th>
                                <th className="pb-2 font-bold">Période</th>
                                <th className="pb-2 text-center font-bold">Stats / Coeff</th>
                                <th className="pb-2 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {(() => {
                                const sessions: any[] = [];
                                displayHistory.forEach(g => {
                                    const key = `${g.classe?.id}-${g.subject?.id}-${g.type}-${g.trimester}-${g.academicYear}`;
                                    let session = sessions.find(s => s.key === key);
                                    if (!session) {
                                        session = {
                                            key,
                                            classe: g.classe,
                                            subject: g.subject,
                                            type: g.type,
                                            trimester: g.trimester,
                                            academicYear: g.academicYear,
                                            coefficient: g.coefficient,
                                            maxPoints: g.maxPoints,
                                            grades: []
                                        };
                                        sessions.push(session);
                                    }
                                    session.grades.push(g);
                                });

                                return sessions.length > 0 ? sessions.map((s) => (
                                    <tr key={s.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                    <ClipboardList size={16} />
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px]">{s.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <p className="font-bold text-slate-900 dark:text-white text-xs">{s.subject?.name}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase italic">{s.classe?.name || 'N/A'}</p>
                                        </td>
                                        <td className="py-3">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{s.trimester}</p>
                                            <p className="text-[10px] text-slate-400">{s.academicYear}</p>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className="font-bold text-slate-900 dark:text-white">{s.grades.length} élèves</span>
                                            <span className="block text-[10px] font-semibold text-blue-600 dark:text-blue-400">Coeff: {s.coefficient}</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEditGrade(s.grades[0])}
                                                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGrade(s.grades[0].id)}
                                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 italic">Aucune évaluation trouvée pour cette sélection.</td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryView;
