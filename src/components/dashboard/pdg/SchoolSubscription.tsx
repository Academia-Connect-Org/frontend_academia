import React, { useEffect, useState } from 'react';
import { Crown, Calendar, AlertCircle } from 'lucide-react';
import api from '../../../api/axios';
import { useNavigate } from 'react-router-dom';

interface SchoolSubscriptionProps {
    institution: any;
    onRefresh: () => void;
}

const SchoolSubscription: React.FC<SchoolSubscriptionProps> = ({ institution }) => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [institution.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const histRes = await api.get(`/subscription/history/institution/${institution.id}`);
            setHistory(histRes.data || []);
        } catch (err) {
            console.error("Error fetching subscription data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRenew = () => {
        navigate(`/dashboard/pdg/select-plan/${institution.id}`);
    };

    const getStatusInfo = () => {
        if (!institution.subscriptionEndDate) return null;
        const end = new Date(institution.subscriptionEndDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 5) {
            return {
                status: 'ACTIVE',
                color: 'emerald',
                message: `Actif, expire dans ${diffDays} jours`,
                isExpired: false
            };
        } else if (diffDays >= 0 && diffDays <= 5) {
            return {
                status: 'WARNING',
                color: 'amber',
                message: `Expire bientôt (dans ${diffDays} jours). Pensez à renouveler !`,
                isExpired: false
            };
        } else if (diffDays < 0 && diffDays >= -5) {
            return {
                status: 'GRACE_PERIOD',
                color: 'orange',
                message: `Expiré depuis ${Math.abs(diffDays)} jours. Délai de grâce : l'école sera bloquée dans ${5 - Math.abs(diffDays)} jours.`,
                isExpired: true
            };
        } else {
            return {
                status: 'BLOCKED',
                color: 'red',
                message: `Abonnement terminé. L'accès à l'école est bloqué pour le personnel et les élèves.`,
                isExpired: true
            };
        }
    };

    const statusInfo = getStatusInfo();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Banner */}
            {statusInfo && (
                <div className={`p-5 rounded-2xl border-l-4 shadow-sm flex items-start gap-4 ${statusInfo.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-emerald-500 text-emerald-900 dark:text-emerald-300' :
                        statusInfo.color === 'amber' ? 'bg-amber-50 dark:bg-amber-950/40 border-l-amber-500 text-amber-900 dark:text-amber-300' :
                            'bg-red-50 dark:bg-red-950/40 border-l-red-500 text-red-900 dark:text-red-300'
                    }`}>
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h4 className="font-bold text-base mb-1">Statut de l'abonnement : {institution.subscriptionType}</h4>
                        <p className="font-medium text-xs">{statusInfo.message}</p>
                        {institution.subscriptionEndDate && (
                            <p className="text-[10px] opacity-80 mt-1">
                                Date de fin officielle : {new Date(institution.subscriptionEndDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleRenew}
                        className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all shrink-0"
                    >
                        Renouveler
                    </button>
                </div>
            )}

            {!statusInfo && (
                <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                    <Crown size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">Aucun abonnement actif</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Cet établissement n'a jamais souscrit à un plan d'abonnement.</p>
                    <button
                        onClick={handleRenew}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                    >
                        Souscrire à un plan
                    </button>
                </div>
            )}

            {/* History Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex justify-between items-center">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                        Historique des Paiements
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Date d'activation</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Date de fin</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Plan</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Période</th>
                                <th className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-semibold">
                                        Aucun historique trouvé pour cet établissement.
                                    </td>
                                </tr>
                            ) : (
                                history.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                                            {new Date(record.startDate).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                                            {record.endDate ? new Date(record.endDate).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold uppercase">
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-semibold">
                                            {record.period === 'MONTHLY' ? 'Mensuel' : record.period === 'YEARLY' ? 'Annuel' : 'Essai'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${record.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SchoolSubscription;
