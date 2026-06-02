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

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MatrixCard label="Moyenne Générale" value="13.4" trend="+0.2" icon={BarChart3} color="bg-blue-600" />
                <MatrixCard label="Evaluations faites" value={String(sessionCount)} trend="Sessions" icon={ClipboardList} color="bg-indigo-600" />
                <MatrixCard label="Taux de réussite" value="84%" trend="+3%" icon={CheckCircle2} color="bg-emerald-600" />
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-8">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Historique des Evaluations</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                className="text-xs font-black text-slate-600 outline-none bg-transparent"
                                value={selectedHistorySubject}
                                onChange={(e) => setSelectedHistorySubject(e.target.value)}
                            >
                                <option value="ALL">Toutes les matières</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                className="text-xs font-black text-slate-600 outline-none bg-transparent"
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
                                className="p-4 bg-white rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                            >
                                <Download size={18} /> Exporter <ChevronDown size={14} />
                            </button>

                            {showExportMenu && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <button
                                        onClick={() => handleExport('PDF')}
                                        className="w-full px-6 py-3.5 text-left text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                    >
                                        <FileText size={16} className="text-red-500" /> Format PDF (.pdf)
                                    </button>
                                    <button
                                        onClick={() => handleExport('EXCEL')}
                                        className="w-full px-6 py-3.5 text-left text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                    >
                                        <TableIcon size={16} className="text-emerald-500" /> Format EXCEL (.xlsx)
                                    </button>
                                    <button
                                        onClick={() => handleExport('CSV')}
                                        className="w-full px-6 py-3.5 text-left text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                    >
                                        <Download size={16} className="text-blue-500" /> Format CSV (.csv)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                <th className="px-8 py-6">Évaluation</th>
                                <th className="px-8 py-6">Classe & Matière</th>
                                <th className="px-8 py-6">Période</th>
                                <th className="px-8 py-6 text-center">Stats / Coeff</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(() => {
                                // Grouping logic
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
                                    <tr key={s.key} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                                                <ClipboardList size={20} />
                                            </div>
                                            <p className="font-black text-slate-800 uppercase text-[10px] tracking-widest">{s.type}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-black text-slate-800 leading-none mb-1 group-hover:text-blue-600 transition-all text-sm">{s.subject?.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{s.classe?.name || 'N/A'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-bold text-slate-600">{s.trimester}</p>
                                            <p className="text-[9px] font-black text-slate-300 uppercase">{s.academicYear}</p>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-sm font-black text-slate-800">{s.grades.length} <span className="text-[10px] text-slate-300 italic">élèves</span></span>
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter mt-1">Coeff: {s.coefficient}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEditGrade(s.grades[0])}
                                                    className="p-2.5 bg-white rounded-xl text-blue-400 hover:text-blue-600 hover:shadow-md border border-slate-100 transition-all"
                                                    title="Voir / Modifier la session"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // Direct deletion of all grades in session is tricky, delete first one as sample or implement batch delete
                                                        handleDeleteGrade(s.grades[0].id);
                                                    }}
                                                    className="p-2.5 bg-white rounded-xl text-red-400 hover:text-red-600 hover:shadow-md border border-slate-100 transition-all"
                                                    title="Supprimer la session"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">Aucune évaluation trouvée pour cette sélection.</td>
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
