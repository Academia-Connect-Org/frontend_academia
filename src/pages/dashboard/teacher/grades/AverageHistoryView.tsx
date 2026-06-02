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
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {averageHistory.map((session) => (
                    <div key={session.key || session.id} className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors"></div>

                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                                    <Calculator size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeleteSession(session)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight mb-1">{session.subject?.name}</h4>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 group-hover:translate-x-1 transition-transform">{session.classe?.name}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-3 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Période</p>
                                    <p className="text-[10px] font-bold text-slate-700">{session.trimester}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Coefficient</p>
                                    <p className="text-[10px] font-bold text-slate-700">×{session.coefficient}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-800">{session.studentCount} Élèves</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{session.academicYear}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleLoadSession(session)}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all"
                                    >
                                        Voir / Editer
                                    </button>
                                    <button
                                        onClick={() => handlePublishSession(session)}
                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                        title={`Envoyer ${dest}`}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {averageHistory.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px]">
                        <Calculator size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold italic">Aucune moyenne enregistrée pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AverageHistoryView;
