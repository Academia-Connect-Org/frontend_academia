import React from 'react';
import { Calculator, Trash2, Send } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

interface AverageHistoryViewProps {
    averageHistory: any[];
    handleDeleteSession: (session: any) => void;
    handleLoadSession: (session: any) => void;
    handlePublishSession: (session: any) => void;
}

const AverageHistoryView: React.FC<AverageHistoryViewProps> = ({
    averageHistory,
    handleDeleteSession,
    handleLoadSession,
    handlePublishSession
}) => {
    const { user } = useAuth();
    const dest = user?.institution?.type === 'ECOLE' ? 'à la Direction' : 'au Provisoriat';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {averageHistory.map((session) => (
                    <div key={session.key || session.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                    <Calculator size={20} />
                                </div>
                                <button
                                    onClick={() => handleDeleteSession(session)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">{session.subject?.name}</h4>
                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3">{session.classe?.name}</p>

                            <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-semibold">
                                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                                    <p className="text-[9px] uppercase text-slate-400">Période</p>
                                    <p className="text-slate-800 dark:text-slate-200">{session.trimester}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                                    <p className="text-[9px] uppercase text-slate-400">Coefficient</p>
                                    <p className="text-slate-800 dark:text-slate-200">×{session.coefficient}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">{session.studentCount} Élèves</span>
                                <span className="text-[10px] text-slate-400 font-medium">{session.academicYear}</span>
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => handleLoadSession(session)}
                                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                                >
                                    Voir / Éditer
                                </button>
                                <button
                                    onClick={() => handlePublishSession(session)}
                                    className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-colors"
                                    title={`Envoyer ${dest}`}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {averageHistory.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <Calculator size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold italic">Aucune moyenne enregistrée pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AverageHistoryView;
