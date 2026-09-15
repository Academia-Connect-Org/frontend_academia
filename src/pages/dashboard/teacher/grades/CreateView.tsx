import React from 'react';
import { CheckCircle2, Send, Save } from 'lucide-react';
import { getGradeMention } from './utils';

interface CreateViewProps {
    classes: any[];
    selectedClass: any;
    handleClassChange: (id: string) => void;
    subjects: any[];
    selectedSubject: any;
    setSelectedSubject: (sub: any) => void;
    isPublished: boolean;
    evalType: string;
    setEvalType: (val: string) => void;
    trimester: string;
    setTrimester: (val: string) => void;
    academicYear: string;
    setAcademicYear: (val: string) => void;
    maxPoints: number;
    setMaxPoints: (val: number) => void;
    coefficient: number;
    setCoefficient: (val: number) => void;
    students: any[];
    studentGrades: Record<number, string>;
    setStudentGrades: (grades: Record<number, string>) => void;
    studentComments: Record<number, string>;
    setStudentComments: (comments: Record<number, string>) => void;
    handlePublishGrades: () => void;
    handleSaveGrades: () => void;
    isSaving: boolean;
}

const CreateView: React.FC<CreateViewProps> = ({
    classes,
    selectedClass,
    handleClassChange,
    subjects,
    selectedSubject,
    setSelectedSubject,
    isPublished,
    evalType,
    setEvalType,
    trimester,
    setTrimester,
    academicYear,
    setAcademicYear,
    maxPoints,
    setMaxPoints,
    students,
    studentGrades,
    setStudentGrades,
    studentComments,
    setStudentComments,
    handlePublishGrades,
    handleSaveGrades,
    isSaving
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe</label>
                        <select
                            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            value={selectedClass?.id || ''}
                            onChange={(e) => handleClassChange(e.target.value)}
                        >
                            {classes.length === 0 ? (
                                <option value="">Aucune classe assignée</option>
                            ) : (
                                classes.map((c: any) => (
                                    <option key={typeof c === 'object' ? c.id : c} value={typeof c === 'object' ? c.id : c}>
                                        {typeof c === 'object' ? c.name : c}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Matière</label>
                        <select
                            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            value={selectedSubject && typeof selectedSubject === 'object' ? selectedSubject.id : (selectedSubject || '')}
                            onChange={(e) => {
                                const selected = subjects.find(s => String(typeof s === 'object' ? s?.id : s) === e.target.value);
                                setSelectedSubject(selected);
                            }}
                        >
                            {subjects.length === 0 ? (
                                <option value="">Aucune matière trouvée</option>
                            ) : (
                                subjects.map((s: any) => {
                                    const subName = typeof s === 'object' ? s.name : s;
                                    const cycleName = typeof s === 'object' && s.cycle?.name ? ` (${s.cycle.name})` : '';
                                    return (
                                        <option key={typeof s === 'object' ? s.id : s} value={typeof s === 'object' ? s.id : s}>
                                            {subName}{cycleName}
                                        </option>
                                    );
                                })
                            )}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Évaluation</label>
                        <select
                            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            value={evalType}
                            onChange={(e) => setEvalType(e.target.value)}
                        >
                            <option value="TEST">Contrôle</option>
                            <option value="DEVOIR_1">Devoir 1</option>
                            <option value="DEVOIR_2">Devoir 2</option>
                            <option value="DEVOIR_3">Devoir 3</option>
                            <option value="EXAM">Examen / Composition</option>
                            <option value="TP">Travaux Pratiques (TP)</option>
                            <option value="ASSIGNMENT">Devoir Maison</option>
                            <option value="PARTICIPATION">Note de Participation</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Période</label>
                        <select
                            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            value={trimester}
                            onChange={(e) => setTrimester(e.target.value)}
                        >
                            <option value="1er Trimestre">1er Trimestre</option>
                            <option value="2ème Trimestre">2ème Trimestre</option>
                            <option value="3ème Trimestre">3ème Trimestre</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Année Scolaire</label>
                        <select
                            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                        >
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2026-2027">2026-2027</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Note Max</label>
                        <input
                            type="number"
                            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            value={maxPoints}
                            onChange={e => setMaxPoints(parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-2 font-bold">Élève</th>
                            <th className="pb-2 font-bold">Note / {maxPoints}</th>
                            <th className="pb-2 font-bold">Observation</th>
                            <th className="pb-2 font-bold">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {students.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                                            {s.lastName?.[0]}{s.firstName?.[0]}
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white uppercase">{s.lastName} {s.firstName}</span>
                                    </div>
                                </td>
                                <td className="py-2.5">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="---"
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 w-24 font-bold text-xs text-blue-600 dark:text-blue-400 rounded-xl outline-none"
                                        value={studentGrades[s.id] || ''}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(',', '.');
                                            if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) <= maxPoints)) {
                                                setStudentGrades({ ...studentGrades, [s.id]: val });
                                            }
                                        }}
                                    />
                                </td>
                                <td className="py-2.5">
                                    <input
                                        type="text"
                                        placeholder="Observation..."
                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 w-full max-w-[180px] text-xs font-medium text-slate-900 dark:text-white rounded-xl outline-none"
                                        value={studentComments[s.id] || ''}
                                        onChange={(e) => setStudentComments({ ...studentComments, [s.id]: e.target.value })}
                                    />
                                </td>
                                <td className="py-2.5">
                                    {studentGrades[s.id] !== '' ? (
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase"><CheckCircle2 size={14} /> Ok</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${getGradeMention(parseFloat(studentGrades[s.id]), maxPoints)?.color || 'bg-slate-400'}`}>
                                                {getGradeMention(parseFloat(studentGrades[s.id]), maxPoints)?.label}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-semibold text-slate-400 italic">En attente...</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{Object.values(studentGrades).filter(v => v !== '').length} / {students.length} Notes saisies</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePublishGrades}
                        disabled={isPublished || isSaving || !selectedClass || !selectedSubject}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${isPublished ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'} disabled:opacity-50`}
                    >
                        {isPublished ? <><CheckCircle2 size={16} /> TRANSMIS</> : <><Send size={16} /> ENVOYER AU PP</>}
                    </button>
                    <button
                        onClick={handleSaveGrades}
                        disabled={isSaving || Object.values(studentGrades).filter(v => v !== '').length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {isSaving ? 'Enregistrement...' : <>VALIDER TOUTES LES NOTES <Save size={16} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateView;
