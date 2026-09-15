import React, { useEffect, useState } from 'react';
import { X, Calendar, Award, CheckCircle2, AlertCircle, Loader2, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import api from '../../../api/axios';

interface StudentAcademicHistoryModalProps {
    studentId: number | null;
    studentName?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const StudentAcademicHistoryModal: React.FC<StudentAcademicHistoryModalProps> = ({
    studentId,
    studentName,
    isOpen,
    onClose
}) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchHistory();
        }
    }, [isOpen, studentId]);

    const fetchHistory = async () => {
        if (!studentId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/students/${studentId}/history`);
            setHistory(res.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors du chargement de l'historique scolaire");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[32px] shadow-2xl p-6 space-y-6 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 mb-1">
                            <Clock size={12} /> Dossier Archivé
                        </span>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                            Historique Scolaire {studentName ? `- ${studentName}` : ''}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-xs font-bold">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-12 text-center text-slate-400 font-bold">
                        <Loader2 className="animate-spin inline-block mr-2" /> Chargement des données archivées...
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((item: any) => (
                            <div
                                key={item.enrollmentId}
                                className={`p-5 rounded-2xl border transition-all ${item.isCurrent
                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700'
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${item.isCurrent ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-slate-800 dark:text-white text-base">
                                                    {item.academicYearName}
                                                </h4>
                                                {item.isCurrent && (
                                                    <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider">
                                                        Année En Cours
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                Classe : <span className="text-slate-800 dark:text-slate-200">{item.classeName}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        {item.status === 'PASSED' && (
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                <CheckCircle2 size={12} /> ADMIS
                                            </span>
                                        )}
                                        {item.status === 'FAILED' && (
                                            <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                <AlertCircle size={12} /> REDOUBLEMENT
                                            </span>
                                        )}
                                        {item.status === 'GRADUATED' && (
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                <Award size={12} /> DIPLÔMÉ
                                            </span>
                                        )}
                                        {item.status === 'PENDING_FEE' && (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                <Clock size={12} /> EN ATTENTE FRAIS
                                            </span>
                                        )}
                                        {item.status === 'ENROLLED' && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                <ShieldCheck size={12} /> INSCRI(E)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Award size={14} className="text-indigo-500" />
                                        <div>
                                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Moyenne Annuelle</span>
                                            <span className="font-black text-slate-800 dark:text-white">
                                                {item.finalAverage !== null ? `${item.finalAverage}` : 'En cours'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={14} className="text-emerald-500" />
                                        <div>
                                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Scolarité Réglée</span>
                                            <span className="font-black text-slate-800 dark:text-white">
                                                {item.totalPaid ? `${item.totalPaid.toLocaleString()} FCFA` : '0 FCFA'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400 font-medium italic">
                        Aucun historique scolaire archivé trouvé pour cet élève.
                    </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentAcademicHistoryModal;
