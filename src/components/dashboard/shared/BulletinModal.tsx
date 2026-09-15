import React from 'react';
import { X, Printer, Download, Award, Target, BarChart3, GraduationCap, School } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

interface BulletinModalProps {
    studentId: number;
    trimester: string;
    academicYear: string;
    onClose: () => void;
}

const BulletinModal: React.FC<BulletinModalProps> = ({ studentId, trimester, academicYear, onClose }) => {
    const { user } = useAuth();
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchBulletin();
    }, [studentId, trimester, academicYear]);

    const fetchBulletin = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/student/${studentId}/bulletin`, {
                params: { trimester, academicYear }
            });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching bulletin:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center shadow-2xl">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Génération du bulletin...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const isEcole = user?.institution?.type === 'ECOLE';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden my-auto">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors z-50"
                >
                    <X size={18} />
                </button>

                {/* Actions */}
                <div className="absolute top-4 right-16 flex gap-2 z-50 no-print">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5">
                        <Printer size={14} /> <span className="hidden sm:inline">Imprimer</span>
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md">
                        <Download size={14} /> <span className="hidden sm:inline">PDF</span>
                    </button>
                </div>

                <div className="p-6 sm:p-10 pt-16">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                                    <School size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                        {data.student?.institution?.name || "Institution Académique"}
                                    </h2>
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Excellence & Réussite</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">BULLETIN DE NOTES - {data.trimester}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">ANNÉE ACADÉMIQUE {data.academicYear}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-lg text-slate-400 overflow-hidden shrink-0">
                                {data.student?.profileImage ? (
                                    <img src={data.student.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <GraduationCap size={28} />
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">Profil de l'Élève</p>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                    {data.student?.lastName} {data.student?.firstName}
                                </h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md">{data.student?.classe?.name || "N/A"}</span>
                                    <span>Mle: {data.student?.studentIdNumber || "---"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <MatrixTile label="Moyenne Trimestrielle" value={(data.generalAverage ?? 0).toFixed(2)} icon={BarChart3} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/40" />
                        <MatrixTile label="Total Coefficients" value={(data.totalCoefficients ?? 0).toFixed(1)} icon={Award} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-950/40" />
                        <MatrixTile label="Total Points Pondérés" value={(data.totalWeightedPoints ?? 0).toFixed(2)} icon={Target} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/40" />
                    </div>

                    {/* Results Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto mb-8">
                        <table className="w-full text-left whitespace-nowrap min-w-[650px] border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                                    <th className="px-6 py-3.5">{isEcole ? "Matières" : "Matières & Enseignants"}</th>
                                    {!isEcole ? (
                                        <>
                                            <th className="px-4 py-3.5 text-center">Note Classe (NC)</th>
                                            <th className="px-4 py-3.5 text-center">Note Exam (NE)</th>
                                            <th className="px-4 py-3.5 text-center">Coeff</th>
                                            <th className="px-6 py-3.5 text-center">Moyenne / 20</th>
                                            <th className="px-6 py-3.5 text-center">Pondérée</th>
                                        </>
                                    ) : (
                                        <th className="px-6 py-3.5 text-center">Note Compo</th>
                                    )}
                                    <th className="px-6 py-3.5 text-right">Appréciation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {(data.subjectResults || []).map((res: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white uppercase">{res.subjectName}</td>
                                        {!isEcole ? (
                                            <>
                                                <td className="px-4 py-3.5 text-center font-semibold text-blue-600 dark:text-blue-400">{res.noteClasse !== null ? res.noteClasse.toFixed(2) : '--'}</td>
                                                <td className="px-4 py-3.5 text-center font-semibold text-amber-600 dark:text-amber-400">{res.noteExamen !== null ? res.noteExamen.toFixed(2) : '--'}</td>
                                                <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400 font-bold">{res.coefficient}</td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <span className={`font-bold ${res.average >= 12 ? 'text-emerald-600 dark:text-emerald-400' : res.average >= 10 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                        {res.average.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-center text-slate-900 dark:text-white font-bold">{res.weightedAverage.toFixed(2)}</td>
                                            </>
                                        ) : (
                                            <td className="px-6 py-3.5 text-center font-bold text-slate-900 dark:text-white">
                                                {res.average.toFixed(2)}
                                            </td>
                                        )}
                                        <td className="px-6 py-3.5 text-right">
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 italic">
                                                {res.average >= 16 ? "Excellent" : res.average >= 14 ? "Très Bien" : res.average >= 12 ? "Assez Bien" : res.average >= 10 ? "Passable" : "Insuffisant"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-xs">
                                    <td colSpan={isEcole ? 1 : 2} className="px-6 py-4 text-slate-900 dark:text-white uppercase tracking-wider">Total Général / Moyenne</td>
                                    <td colSpan={isEcole ? 2 : 4} className="px-6 py-4 text-right">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white">{(data.generalAverage ?? 0).toFixed(2)} <span className="text-xs text-slate-400">/ 20</span></span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Signatures */}
                    <div className="flex flex-col sm:flex-row justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Observation de la Direction</p>
                            <div className="w-64 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 italic text-slate-600 dark:text-slate-300">
                                {(data.generalAverage ?? 0) >= 10 ? "Félicitations, passage admis pour le prochain cycle." : "Travail insuffisant, redoublement à envisager."}
                            </div>
                        </div>
                        <div className="sm:text-right">
                            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Signatures & Cachet</p>
                            <div className="w-64 sm:ml-auto p-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 italic text-[11px] text-slate-400 text-center">
                                {isEcole ? "Signature du Directeur / de la Directrice" : "Signature du Chef d'Établissement"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MatrixTile = ({ label, value, icon: Icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) => (
    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
        <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">{value}</h4>
        </div>
    </div>
);

export default BulletinModal;
