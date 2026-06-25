import React from 'react';
import { Calculator, ClipboardList, Save, Check, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

interface AveragesViewProps {
    selectedClass: any;
    selectedSubject: any;
    trimester: string;
    coefficient: number;
    setCoefficient: (val: number) => void;
    setView: (view: any) => void;
    allEvaluations: any[];
    selectedEvalIds: Set<string>;
    setSelectedEvalIds: (ids: Set<string>) => void;
    handleCalculateAverages: () => void;
    calculatedResults: any[];
    setCalculatedResults: (results: any[]) => void;
    handleSaveAverages: () => void;
    handlePublishGrades: () => void;
}

const AveragesView: React.FC<AveragesViewProps> = ({
    selectedClass,
    selectedSubject,
    trimester,
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
        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white ] shadow-2xl   overflow-hidden">
                <div className="p-8   bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Calculator className="text-indigo-600" />
                            Moyennes Trimestrielles
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            {selectedClass?.name} • {selectedSubject?.name || 'Matière'} • {trimester}
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Coefficient</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={coefficient}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 1;
                                        setCoefficient(val);
                                        // Auto update calculated results to show new points
                                        setCalculatedResults(calculatedResults.map(r => ({
                                            ...r,
                                            coefficient: val,
                                            points: r.moyenneTrimestrielle * val
                                        })));
                                    }}
                                    className="w-20 bg-white    px-3 py-2 text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none text-center"
                                    min="1"
                                    step="0.5"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-8">
                    <div className="bg-slate-50 p-6 ]   space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Choisir les evaluations à inclure</span>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedEvalIds(new Set(allEvaluations.map(e => e.id)))}
                                    className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
                                >
                                    Tout sélectionner
                                </button>
                                <button
                                    onClick={() => setSelectedEvalIds(new Set())}
                                    className="text-[9px] font-black text-slate-400 uppercase hover:underline"
                                >
                                    Tout désélectionner
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allEvaluations.map(ev => (
                                <button
                                    key={ev.id}
                                    onClick={() => {
                                        const next = new Set(selectedEvalIds);
                                        if (next.has(ev.id)) next.delete(ev.id);
                                        else next.add(ev.id);
                                        setSelectedEvalIds(next);
                                    }}
                                    className={`px-4 py-2.5  text-[10px] font-bold  transition-all flex items-center gap-2 ${selectedEvalIds.has(ev.id) ? 'bg-indigo-600  text-white shadow-lg shadow-indigo-600/20' : 'bg-white  text-slate-500 hover:'}`}
                                >
                                    <div className={`p-1  ${selectedEvalIds.has(ev.id) ? 'bg-white/20' : 'bg-slate-100'}`}>
                                        {ev.isHomework ? <ClipboardList size={10} /> : <TrendingUp size={10} />}
                                    </div>
                                    <div className="text-left">
                                        <div className="leading-tight">{ev.title}</div>
                                        <div className="text-[7px] opacity-60 uppercase tracking-tighter">
                                            {ev.isHomework ? 'Devoir' : 'Evaluation'} • {new Date(ev.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {selectedEvalIds.has(ev.id) && <Check size={10} className="ml-1" />}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-2  ">
                            <p className="text-[9px] font-medium text-slate-400 italic">Incluez ou excluez des notes pour recalculer.</p>
                            <button
                                onClick={handleCalculateAverages}
                                className="px-6 py-2.5 bg-indigo-600 text-white  text-[10px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                            >
                                <Calculator size={14} /> Recalculer
                            </button>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400  ">
                                <th className="px-8 py-6">Élève</th>
                                {user?.institution?.type === 'ECOLE' && <th className="px-8 py-6">Matière</th>}
                                {user?.institution?.type !== 'ECOLE' && (
                                    <>
                                        <th className="px-8 py-6 text-center">Moy. Dev (/20)</th>
                                        <th className="px-8 py-6 text-center">Note Exam (/20)</th>
                                    </>
                                )}
                                <th className="px-8 py-6 text-center bg-indigo-50/50 text-indigo-600 font-black">
                                    {user?.institution?.type === 'ECOLE' ? 'Note /10' : 'Moy. Triméstrielle'}
                                </th>
                                <th className="px-8 py-6 text-center">Coeff</th>
                                <th className="px-8 py-6 text-center  ">Points</th>
                                <th className="px-8 py-6 text-right">Observation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {calculatedResults.map((res: any) => (
                                <tr key={`${res.student.id}-${res.subject?.id || 'all'}`} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9  bg-slate-100 text-slate-400 flex items-center justify-center font-black text-[10px]">
                                                {res.student.lastName[0]}{res.student.firstName[0]}
                                            </div>
                                            <p className="font-black text-slate-800 uppercase tracking-tight">{res.student.lastName} {res.student.firstName}</p>
                                        </div>
                                    </td>
                                    {user?.institution?.type === 'ECOLE' && (
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-3 py-1 bg-slate-100 ">
                                                {res.subject?.name}
                                            </span>
                                        </td>
                                    )}
                                    {user?.institution?.type !== 'ECOLE' && (
                                        <>
                                            <td className="px-8 py-5 text-center font-bold text-slate-600">{res.moyenneDevoirs.toFixed(2)}</td>
                                            <td className="px-8 py-5 text-center font-bold text-slate-600">{res.noteExamen.toFixed(2)}</td>
                                        </>
                                    )}
                                    <td className="px-8 py-5 text-center bg-indigo-50/30">
                                        <span className={`px-4 py-1.5  font-black text-sm ${res.moyenneTrimestrielle >= (user?.institution?.type === 'ECOLE' ? 5 : 10) ? 'bg-emerald-50 text-emerald-600  ' : 'bg-red-50 text-red-600  '}`}>
                                            {res.moyenneTrimestrielle.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center font-bold text-slate-400">×{res.coefficient}</td>
                                    <td className="px-8 py-5 text-center font-black text-slate-800  ">{res.points.toFixed(2)}</td>
                                    <td className="px-8 py-5 text-right">
                                        <input
                                            type="text"
                                            value={res.observation}
                                            onChange={(e) => {
                                                const newResults = [...calculatedResults];
                                                const idx = newResults.findIndex(r => r.student.id === res.student.id && r.subject?.id === res.subject?.id);
                                                if (idx !== -1) {
                                                    newResults[idx].observation = e.target.value;
                                                    setCalculatedResults(newResults);
                                                }
                                            }}
                                            className="text-[10px] font-black uppercase text-slate-500 tracking-wider bg-slate-50    px-3 py-2 text-right focus:bg-white outline-none w-full max-w-[150px]"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {user?.institution?.type === 'ECOLE' && calculatedResults.length > 0 && (
                    <div className="p-8 bg-slate-900 text-white ]">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                            <TrendingUp size={16} className="text-emerald-400" />
                            Récapitulatif des Moyennes Générales (Estimation)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from(new Set(calculatedResults.map(r => r.student.id))).map(studentId => {
                                const studentRes = calculatedResults.filter(r => r.student.id === studentId);
                                const studentName = `${studentRes[0].student.lastName} ${studentRes[0].student.firstName}`;
                                const totalPoints = studentRes.reduce((acc, r) => acc + r.moyenneTrimestrielle, 0); // All coef 1 in ECOLE
                                // Important: formula Somme / Nb matières SAISIES
                                const subjectsCount = studentRes.length; 
                                const generalAvg = totalPoints / (subjectsCount || 1);

                                return (
                                    <div key={studentId} className="bg-white/5    p-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500 mb-1 truncate max-w-[150px]">{studentName}</p>
                                            <p className="text-[9px] font-medium text-slate-400 italic">{subjectsCount} matières saisies</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${generalAvg >= 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {generalAvg.toFixed(2)}<span className="text-[10px] opacity-40 ml-1">/10</span>
                                            </p>
                                            <p className="text-[8px] font-black uppercase tracking-tighter opacity-60">Moy. Générale</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 p-4 bg-emerald-500/10    flex items-center gap-3">
                            <div className="w-8 h-8  bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <ClipboardList size={14} />
                            </div>
                            <p className="text-[10px] font-medium text-emerald-100 italic">
                                Note : Ce récapitulatif utilise la formule "Somme des notes / Nombre de matières saisies".
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-4 p-8">
                <button
                    onClick={handleSaveAverages}
                    className="bg-blue-600 text-white px-12 py-5 ] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    ENREGISTRER LES MOYENNES <Save size={18} />
                </button>
            </div>
            <div className="bg-emerald-600 ] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-emerald-600/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20  flex items-center justify-center">
                        <Check size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black tracking-tight leading-tight">Vérification Terminée ?</h4>
                        <p className="text-emerald-100 text-sm font-medium">Une fois les moyennes enregistrées, vous pourrez les envoyer définitivement {dest}.</p>
                    </div>
                </div>
                <button
                    onClick={handlePublishGrades}
                    className="bg-white text-emerald-600 px-10 py-4  font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                    Finaliser et Envoyer {dest}
                </button>
            </div>
        </div>
    );
};

export default AveragesView;
