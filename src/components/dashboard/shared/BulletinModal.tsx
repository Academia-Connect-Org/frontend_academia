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
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-[40px] p-20 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Génération du bulletin...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const isEcole = user?.institution?.type === 'ECOLE';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-slate-50 w-full max-w-5xl rounded-[48px] shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden my-auto">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 bg-white hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all shadow-sm z-50 text-slate-400"
                >
                    <X size={24} />
                </button>

                {/* Print/Download Actions */}
                <div className="absolute top-8 right-24 flex gap-3 z-50 no-print">
                    <button onClick={() => window.print()} className="p-3 bg-white hover:bg-slate-50 rounded-2xl transition-all shadow-sm text-slate-600 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-6">
                        <Printer size={18} /> Imprimer
                    </button>
                    <button className="p-3 bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-lg text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-6 shadow-blue-500/30">
                        <Download size={18} /> PDF
                    </button>
                </div>

                <div className="relative p-12 lg:p-16">
                    {/* Header: School Info & Student Profile */}
                    <div className="flex flex-col lg:flex-row justify-between gap-10 mb-16 border-b border-slate-200 pb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                    <School size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                                        {data.student?.institution?.name || "Institution Académique"}
                                    </h2>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Excellence & Réussite</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">BULLETIN DE NOTES - {data.trimester}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ANNÉE ACADÉMIQUE {data.academicYear}</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-8 pr-12">
                            <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center font-black text-2xl text-slate-300 shadow-inner">
                                {data.student?.profileImage ? (
                                    <img src={data.student.profileImage} alt="" className="w-full h-full object-cover rounded-[32px]" />
                                ) : (
                                    <GraduationCap size={44} />
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Profil de l'Élève</p>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                                    {data.student?.lastName} {data.student?.firstName}
                                </h3>
                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span className="px-2 py-0.5 bg-slate-50 rounded-lg">{data.student?.classe?.name || "N/A"}</span>
                                    <span>Mle: {data.student?.studentIdNumber || "---"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* General Summary Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <MatrixTile label="Moyenne Trimestrielle" value={data.generalAverage.toFixed(2)} icon={BarChart3} color="text-blue-600" bg="bg-blue-50" />
                        <MatrixTile label="Total Coefficients" value={data.totalCoefficients.toFixed(1)} icon={Award} color="text-indigo-600" bg="bg-indigo-50" />
                        <MatrixTile label="Total Points Pondérés" value={data.totalWeightedPoints.toFixed(2)} icon={Target} color="text-emerald-600" bg="bg-emerald-50" />
                    </div>

                    {/* Results Table */}
                    <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden mb-16">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">{isEcole ? "Matières" : "Matières & Enseignants"}</th>
                                    {!isEcole ? (
                                        <>
                                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Note Classe (NC)</th>
                                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Note Exam (NE)</th>
                                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Coeff</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Moyenne / 20</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Pondérée</th>
                                        </>
                                    ) : (
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Note Compo</th>
                                    )}
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Appréciation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.subjectResults.map((res: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-10 py-6 font-black text-slate-800 uppercase text-sm tracking-tight">{res.subjectName}</td>
                                        {!isEcole ? (
                                            <>
                                                <td className="px-6 py-6 text-center font-bold text-blue-500">{res.noteClasse !== null ? res.noteClasse.toFixed(2) : '--'}</td>
                                                <td className="px-6 py-6 text-center font-bold text-amber-600">{res.noteExamen !== null ? res.noteExamen.toFixed(2) : '--'}</td>
                                                <td className="px-6 py-6 text-center text-slate-500 font-bold">{res.coefficient}</td>
                                                <td className="px-10 py-6 text-center">
                                                    <span className={`text-base font-black ${res.average >= 12 ? 'text-emerald-600' : res.average >= 10 ? 'text-blue-600' : 'text-rose-600'}`}>
                                                        {res.average.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-center text-slate-900 font-black">{res.weightedAverage.toFixed(2)}</td>
                                            </>
                                        ) : (
                                            <td className="px-10 py-6 text-center font-black text-slate-800 tracking-tighter">
                                                {res.average.toFixed(2)}
                                            </td>
                                        )}
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-[10px] font-bold text-slate-400 italic">
                                                {res.average >= 16 ? "Excellent" : res.average >= 14 ? "Très Bien" : res.average >= 12 ? "Assez Bien" : res.average >= 10 ? "Passable" : "Insuffisant"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 border-t-2 border-slate-900">
                                    <td colSpan={isEcole ? 1 : 2} className="px-10 py-8 text-sm font-black text-slate-900 uppercase tracking-widest">Total Général / Moyenne</td>
                                    <td colSpan={isEcole ? 2 : 4} className="px-10 py-8 text-right">
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{data.generalAverage.toFixed(2)} <span className="text-lg text-slate-400">/ 20</span></span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer Signs */}
                    <div className="flex flex-col md:flex-row justify-between gap-10 mt-16 pt-16 border-t border-dashed border-slate-200">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Observation de la Direction</p>
                            <div className="w-64 h-24 border-2 border-slate-100 rounded-3xl p-4 italic text-slate-400 text-xs">
                                {data.generalAverage >= 10 ? "Félicitations, passage admis pour le prochain cycle." : "Travail insuffisant, redoublement à envisager."}
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Signatures & Cachet</p>
                            <div className="w-64 h-32 ml-auto border-2 border-slate-100 rounded-[32px] bg-slate-50/50 flex items-center justify-center italic text-[10px] text-slate-300">
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
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
        <div className={`w-14 h-14 ${bg} ${color} rounded-3xl flex items-center justify-center shadow-inner`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</h4>
        </div>
    </div>
);

export default BulletinModal;
