import React, { useEffect, useState } from 'react';
import { Crown, Calendar, Clock, CreditCard, AlertCircle, CheckCircle, ChevronRight, RefreshCw, X } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

interface SchoolSubscriptionProps {
    institution: any;
    onRefresh: () => void;
}

const SchoolSubscription: React.FC<SchoolSubscriptionProps> = ({ institution, onRefresh }) => {
    const { user } = useAuth();
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
            setHistory(histRes.data);
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
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Status Banner */}
            {statusInfo && (
                <div className={`p-6 border-l-4 shadow-sm flex items-start gap-4 ${
                    statusInfo.color === 'emerald' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                    statusInfo.color === 'amber' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                    statusInfo.color === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-800' :
                    'bg-red-50 border-red-500 text-red-800'
                }`}>
                    <AlertCircle className={`shrink-0 ${
                        statusInfo.color === 'emerald' ? 'text-emerald-500' :
                        statusInfo.color === 'amber' ? 'text-amber-500' :
                        statusInfo.color === 'orange' ? 'text-orange-500' :
                        'text-red-500'
                    }`} size={24} />
                    <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">Statut de l'abonnement : {institution.subscriptionType}</h4>
                        <p className="font-medium text-sm">{statusInfo.message}</p>
                        {institution.subscriptionEndDate && (
                            <p className="text-xs opacity-70 mt-1">
                                Date de fin officielle : {new Date(institution.subscriptionEndDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleRenew}
                        className={`px-6 py-2.5 rounded-lg font-black text-sm text-white shadow-md transition-all ${
                            statusInfo.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                            statusInfo.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700' :
                            statusInfo.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                            'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        Renouveler
                    </button>
                </div>
            )}

            {!statusInfo && (
                <div className="p-8 bg-slate-50 rounded-2xl text-center border-2 border-dashed border-slate-200">
                    <Crown size={48} className="mx-auto text-slate-300 mb-4" />
                    <h4 className="text-xl font-bold text-slate-700 mb-2">Aucun abonnement actif</h4>
                    <p className="text-slate-500 mb-6">Cet établissement n'a jamais souscrit à un plan d'abonnement.</p>
                    <button
                        onClick={handleRenew}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30"
                    >
                        Souscrire à un plan
                    </button>
                </div>
            )}

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Calendar size={20} className="text-indigo-600" />
                        Historique des Paiements
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date d'activation</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date de fin</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Période</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        Aucun historique trouvé pour cet établissement.
                                    </td>
                                </tr>
                            ) : (
                                history.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            {new Date(record.startDate).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            {record.endDate ? new Date(record.endDate).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase">
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {record.period === 'MONTHLY' ? 'Mensuel' : record.period === 'YEARLY' ? 'Annuel' : 'Essai'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                                record.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-slate-100 text-slate-500'
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
