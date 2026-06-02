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
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Classe</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
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
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Matière</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={selectedSubject && typeof selectedSubject === 'object' ? selectedSubject.id : (selectedSubject || '')}
                            onChange={(e) => {
                                const selected = subjects.find(s => String(typeof s === 'object' ? s?.id : s) === e.target.value);
                                setSelectedSubject(selected);
                            }}
                        >
                            {subjects.length === 0 ? (
                                <option value="">Aucune matière trouvée</option>
                            ) : (
                                subjects.map((s: any) => (
                                    <option key={typeof s === 'object' ? s.id : s} value={typeof s === 'object' ? s.id : s}>
                                        {typeof s === 'object' ? s.name : s}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Evaluation</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={evalType}
                            onChange={(e) => setEvalType(e.target.value)}
                        >
                            <option value="TEST">Contrôle  </option>
                            <option value="DEVOIR_1">Devoir 1</option>
                            <option value="DEVOIR_2">Devoir 2</option>
                            <option value="DEVOIR_3">Devoir 3</option>
                            <option value="EXAM">Examen / Composition</option>
                            <option value="TP">Travaux Pratiques (TP)</option>
                            <option value="ASSIGNMENT">Devoir Maison</option>
                            <option value="PARTICIPATION">Note de Participation</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Période</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={trimester}
                            onChange={(e) => setTrimester(e.target.value)}
                        >
                            <option value="1er Trimestre">1er Trimestre</option>
                            <option value="2ème Trimestre">2ème Trimestre</option>
                            <option value="3ème Trimestre">3ème Trimestre</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Année Scolaire</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                        >
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2026-2027">2026-2027</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Note Max</label>
                        <input
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-700"
                            value={maxPoints}
                            onChange={e => setMaxPoints(parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="p-10 overflow-x-auto min-h-[400px]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                            <th className="px-6 py-4">Élève</th>
                            <th className="px-6 py-4">Note / {maxPoints}</th>
                            <th className="px-6 py-4">Observation</th>
                            <th className="px-6 py-4">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 group transition-all">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">{s.lastName[0]}{s.firstName[0]}</div>
                                        <p className="font-bold text-slate-800 uppercase text-sm tracking-tight">{s.lastName} {s.firstName}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="---"
                                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 w-32 font-black text-lg text-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        value={studentGrades[s.id] || ''}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(',', '.');
                                            if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) <= maxPoints)) {
                                                setStudentGrades({ ...studentGrades, [s.id]: val });
                                            }
                                        }}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        placeholder="Observation..."
                                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 w-full max-w-[200px] text-xs font-semibold text-slate-600 focus:bg-white transition-all outline-none"
                                        value={studentComments[s.id] || ''}
                                        onChange={(e) => setStudentComments({ ...studentComments, [s.id]: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    {studentGrades[s.id] !== '' ? (
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1.5 text-xs font-black text-emerald-500 uppercase tracking-widest"><CheckCircle2 size={14} /> Ok</span>
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase text-white animate-in zoom-in duration-300 ${getGradeMention(parseFloat(studentGrades[s.id]), maxPoints)?.color || 'bg-slate-400'}`}>
                                                {getGradeMention(parseFloat(studentGrades[s.id]), maxPoints)?.label}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">En attente...</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Object.values(studentGrades).filter(v => v !== '').length} / {students.length} Notes saisies</p>
                    </div>

                    <button
                        onClick={handlePublishGrades}
                        disabled={isPublished || isSaving || !selectedClass || !selectedSubject}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all ${isPublished ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm'} disabled:opacity-50`}
                    >
                        {isPublished ? <><CheckCircle2 size={16} /> TRANSMIS AU PP</> : <><Send size={16} /> ENVOYER AU PP</>}
                    </button>
                </div>

                <button
                    onClick={handleSaveGrades}
                    disabled={isSaving || Object.values(studentGrades).filter(v => v !== '').length === 0}
                    className="bg-blue-600 text-white px-12 py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center gap-3"
                >
                    {isSaving ? 'Enregistrement...' : <>VALIDER TOUTES LES NOTES <Save size={18} /></>}
                </button>
            </div>
        </div>
    );
};

export default CreateView;
