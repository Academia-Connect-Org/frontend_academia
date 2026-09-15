import React from 'react';
import { Calculator, ClipboardList, Save, Check, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

interface AveragesViewProps {
    classes: any[];
    subjects: any[];
    selectedClass: any;
    handleClassChange: (clsId: string) => void;
    selectedSubject: any;
    setSelectedSubject: (sub: any) => void;
    trimester: string;
    setTrimester: (val: string) => void;
    academicYear: string;
    setAcademicYear: (val: string) => void;
    coefficient: number;
    setCoefficient: (val: number) => void;
    setView: (view: any) => void;
    allEvaluations: any[];
    selectedEvalIds: Set<string>;
    setSelectedEvalIds: (ids: Set<string>) => void;
    handleCalculateAverages: (cls?: any, sub?: any, trim?: string, year?: string) => void;
    calculatedResults: any[];
    setCalculatedResults: (results: any[]) => void;
    handleSaveAverages: () => void;
    handlePublishGrades: () => void;
}

const AveragesView: React.FC<AveragesViewProps> = ({
    classes,
    subjects,
    selectedClass,
    handleClassChange,
    selectedSubject,
    setSelectedSubject,
    trimester,
    setTrimester,
    academicYear,
    setAcademicYear,
    coefficient,
    setCoefficient,
    allEvaluations,
    selectedEvalIds,
    setSelectedEvalIds,
    handleCalculateAverages,
    calculatedResults,
    setCalculatedResults,
    handleSaveAverages,
    handlePublishGrades
}) => {
    const { user } = useAuth();
    const dest = user?.institution?.type === 'ECOLE' ? 'à la Direction' : 'au Provisoriat';

    return (
        <div className="space-y-6">
            {/* Top Selection Bar: Classe, Matière, Trimestre, Année */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1 min-w-[160px] flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classe *</label>
                    <select
                        value={typeof selectedClass === 'object' ? selectedClass?.id || '' : selectedClass || ''}
                        onChange={(e) => {
                            handleClassChange(e.target.value);
                            const cls = classes.find(c => String(c.id) === e.target.value);
                            handleCalculateAverages(cls, selectedSubject, trimester, academicYear);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    >
                        <option value="">Sélectionner une classe...</option>
                        {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[160px] flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matière *</label>
                    <select
                        value={typeof selectedSubject === 'object' ? selectedSubject?.id || '' : selectedSubject || ''}
                        onChange={(e) => {
                            const sub = subjects.find(s => String(s.id) === e.target.value);
                            setSelectedSubject(sub);
                            handleCalculateAverages(selectedClass, sub, trimester, academicYear);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    >
                        <option value="">Sélectionner une matière...</option>
                        {subjects.map((s: any) => {
                            const cycleName = s.cycle?.name || (typeof s.cycle === 'string' ? s.cycle : '');
                            const cycleSuffix = cycleName ? ` (${cycleName})` : '';
                            return (
                                <option key={s.id} value={s.id}>
                                    {s.name}{cycleSuffix}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trimestre *</label>
                    <select
                        value={trimester}
                        onChange={(e) => {
                            setTrimester(e.target.value);
                            handleCalculateAverages(selectedClass, selectedSubject, e.target.value, academicYear);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    >
                        <option value="1er Trimestre">1er Trimestre</option>
                        <option value="2ème Trimestre">2ème Trimestre</option>
                        <option value="3ème Trimestre">3ème Trimestre</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Année Scolaire</label>
                    <select
                        value={academicYear}
                        onChange={(e) => {
                            setAcademicYear(e.target.value);
                            handleCalculateAverages(selectedClass, selectedSubject, trimester, e.target.value);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    >
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Calculator className="text-indigo-600 dark:text-indigo-400" size={18} />
                            Moyennes Trimestrielles
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium uppercase">
                            {selectedClass?.name || 'Classe non choisie'} • {selectedSubject?.name || 'Toutes les matières'}{selectedSubject?.cycle?.name ? ` (${selectedSubject.cycle.name})` : ''} • {trimester}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Coefficient</label>
                        <input
                            type="number"
                            value={coefficient}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 1;
                                setCoefficient(val);
                                setCalculatedResults(calculatedResults.map(r => ({
                                    ...r,
                                    coefficient: val,
                                    points: r.moyenneTrimestrielle * val
                                })));
                            }}
                            className="w-16 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 text-center outline-none"
                            min="1"
                            step="0.5"
                        />
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choisir les évaluations à inclure</span>
                            <div className="flex gap-3 text-xs font-bold">
                                <button
                                    onClick={() => setSelectedEvalIds(new Set(allEvaluations.map(e => e.id)))}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Tout sélectionner
                                </button>
                                <button
                                    onClick={() => setSelectedEvalIds(new Set())}
                                    className="text-slate-400 hover:underline"
                                >
                                    Tout désélectionner
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allEvaluations.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Aucune évaluation disponible pour cette sélection.</p>
                            ) : (
                                allEvaluations.map(ev => (
                                    <button
                                        key={ev.id}
                                        onClick={() => {
                                            const next = new Set(selectedEvalIds);
                                            if (next.has(ev.id)) next.delete(ev.id);
                                            else next.add(ev.id);
                                            setSelectedEvalIds(next);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${selectedEvalIds.has(ev.id) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <div className={`p-1 rounded-md ${selectedEvalIds.has(ev.id) ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                            {ev.isHomework ? <ClipboardList size={12} /> : <TrendingUp size={12} />}
                                        </div>
                                        <span>{ev.title}</span>
                                        {selectedEvalIds.has(ev.id) && <Check size={12} />}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <p className="text-[10px] text-slate-400 italic">Incluez ou excluez des notes pour recalculer.</p>
                            <button
                                onClick={() => handleCalculateAverages()}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                                <Calculator size={14} /> Recalculer
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="pb-2 font-bold">Élève</th>
                                {user?.institution?.type === 'ECOLE' && <th className="pb-2 font-bold">Matière</th>}
                                {user?.institution?.type !== 'ECOLE' && (
                                    <>
                                        <th className="pb-2 text-center font-bold">Moy. Dev (/20)</th>
                                        <th className="pb-2 text-center font-bold">Note Exam (/20)</th>
                                    </>
                                )}
                                <th className="pb-2 text-center font-bold">Moy. Trimestrielle</th>
                                <th className="pb-2 text-center font-bold">Coeff</th>
                                <th className="pb-2 text-center font-bold">Points</th>
                                <th className="pb-2 text-right font-bold">Observation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {calculatedResults.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 italic font-semibold">
                                        Aucune moyenne calculée pour cette sélection. Choisissez une classe et une matière puis cliquez sur "Recalculer".
                                    </td>
                                </tr>
                            ) : (
                                calculatedResults.map((res: any) => (
                                    <tr key={`${res.student.id}-${res.subject?.id || 'all'}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                                            {res.student.lastName} {res.student.firstName}
                                        </td>
                                        {user?.institution?.type === 'ECOLE' && (
                                            <td className="py-3 text-slate-500 font-semibold">{res.subject?.name || 'Général'}</td>
                                        )}
                                        {user?.institution?.type !== 'ECOLE' && (
                                            <>
                                                <td className="py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{res.moyenneDevoirs?.toFixed(2) || '0.00'}</td>
                                                <td className="py-3 text-center text-slate-700 dark:text-slate-300 font-semibold">{res.noteExamen?.toFixed(2) || '0.00'}</td>
                                            </>
                                        )}
                                        <td className="py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded font-bold text-xs ${res.moyenneTrimestrielle >= (user?.institution?.type === 'ECOLE' ? 5 : 10) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'}`}>
                                                {res.moyenneTrimestrielle?.toFixed(2) || '0.00'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center text-slate-500 font-semibold">x{res.coefficient || coefficient}</td>
                                        <td className="py-3 text-center font-bold text-slate-900 dark:text-white">{res.points?.toFixed(2) || '0.00'}</td>
                                        <td className="py-3 text-right text-slate-500 dark:text-slate-400 font-medium">{res.observation || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={handleSaveAverages}
                        disabled={calculatedResults.length === 0}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save size={16} /> Enregistrer les Moyennes
                    </button>
                    <button
                        onClick={handlePublishGrades}
                        disabled={calculatedResults.length === 0}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Check size={16} /> Finaliser et Envoyer {dest}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AveragesView;
