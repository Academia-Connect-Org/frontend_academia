import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api, { getFileUrl } from '../../../api/axios';
import { ROUTES } from '../../../constants/routes';
import { Crown, ChevronLeft, ArrowRight, Building, RefreshCw, AlertCircle } from 'lucide-react';
import SubscriptionPlanCard from '../../../components/shared/SubscriptionPlanCard';

const SelectPlan: React.FC = () => {
    const { institutionId } = useParams<{ institutionId: string }>();
    const [searchParams] = useSearchParams();
    const isNew = searchParams.get('isNew') === 'true';

    const { user } = useAuth();
    const navigate = useNavigate();

    const [institution, setInstitution] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [instRes, plansRes] = await Promise.all([
                    api.get(`/institutions/${institutionId}`),
                    api.get('/public/plans')
                ]);

                setInstitution(instRes.data);

                const availablePlans = (plansRes.data || [])
                    .sort((a: any, b: any) => (a.monthlyPrice || 0) - (b.monthlyPrice || 0))
                    .filter((p: any) => {
                        if (p.type === 'NONE') return false;
                        if (p.type === 'FREE_TRIAL' && instRes.data.subscriptionType !== 'NONE') return false;
                        return true;
                    });

                setPlans(availablePlans);

                if (instRes.data.subscriptionType === 'NONE' && availablePlans.some((p: any) => p.type === 'FREE_TRIAL')) {
                    setSelectedPlan(availablePlans.find((p: any) => p.type === 'FREE_TRIAL'));
                } else if (availablePlans.length > 0) {
                    setSelectedPlan(availablePlans.find((p: any) => p.type !== 'FREE_TRIAL') || availablePlans[0]);
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Impossible de charger les plans d'abonnement ou l'établissement.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [institutionId, isNew]);

    const handleConfirm = async () => {
        if (!selectedPlan) return;

        if (selectedPlan.type === 'FREE_TRIAL') {
            setIsSubmitting(true);
            setError(null);
            try {
                await api.post('/subscription/subscribe', null, {
                    params: {
                        pdgId: user?.id,
                        institutionId: institution.id,
                        type: 'FREE_TRIAL',
                        period: 'MONTHLY'
                    }
                });
                navigate('/dashboard/pdg');
            } catch (err: any) {
                console.error("Error activating free trial", err);
                setError(err.response?.data?.message || "Erreur lors de l'activation du plan d'essai.");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            let effectiveIsYearly = selectedPeriod === 'YEARLY';
            if (selectedPlan.billingOptions === 'MONTHLY_ONLY') effectiveIsYearly = false;
            if (selectedPlan.billingOptions === 'YEARLY_ONLY') effectiveIsYearly = true;
            const actualPeriod = effectiveIsYearly ? 'YEARLY' : 'MONTHLY';

            const rawPrice = actualPeriod === 'MONTHLY' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
            const priceStr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(rawPrice);
            const durationStr = actualPeriod === 'MONTHLY' ? '/ mois' : '/ an';
            navigate(`${ROUTES.PAYMENT}?plan=${selectedPlan.type}&planTitle=${encodeURIComponent(selectedPlan.title)}&price=${priceStr}&duration=${durationStr}&institutionId=${institution.id}&period=${actualPeriod}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!institution) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Établissement introuvable</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Nous n'avons pas pu charger les informations de l'établissement.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs">Retour</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-sm mb-8">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs transition-colors">
                        <ChevronLeft size={18} />
                        Retour
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center text-slate-400">
                            {institution.logoUrl ? <img src={getFileUrl(institution.logoUrl)} alt="Logo" className="w-full h-full object-cover" /> : <Building size={20} />}
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Abonnement pour</p>
                            <h2 className="font-bold text-slate-900 dark:text-white text-xs leading-tight">{institution.name}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <Crown size={40} className="mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                        {institution.subscriptionType === 'NONE' ? 'Choisissez votre plan initial' : 'Renouvelez votre abonnement'}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {institution.subscriptionType === 'NONE'
                            ? 'Choisissez le forfait qui correspond à vos ambitions pour commencer à utiliser la plateforme.'
                            : 'Sélectionnez un forfait pour continuer à utiliser toutes nos fonctionnalités.'}
                    </p>
                </div>

                {plans.some(plan => plan.type !== 'FREE_TRIAL' && (plan.billingOptions === 'BOTH' || plan.billingOptions == null)) && (
                    <div className="flex justify-center mb-10">
                        <div className="bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center border border-slate-200/80 dark:border-slate-800">
                            <button
                                onClick={() => setSelectedPeriod('MONTHLY')}
                                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${selectedPeriod === 'MONTHLY' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Facturation Mensuelle
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('YEARLY')}
                                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${selectedPeriod === 'YEARLY' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Facturation Annuelle
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded-md uppercase">-10%</span>
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl font-bold border border-red-200 dark:border-red-800 text-xs flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Plan Cards */}
                <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan?.id === plan.id;
                        const isFree = plan.type === 'FREE_TRIAL';
                        const isFeatured = plan.featured;
                        
                        let effectiveIsYearly = selectedPeriod === 'YEARLY';
                        if (plan.billingOptions === 'MONTHLY_ONLY') effectiveIsYearly = false;
                        if (plan.billingOptions === 'YEARLY_ONLY') effectiveIsYearly = true;
                        
                        const actualPeriod = effectiveIsYearly ? 'YEARLY' : 'MONTHLY';
                        const forcedPeriod = plan.billingOptions !== 'BOTH' && plan.billingOptions != null ? effectiveIsYearly : null;

                        const calculatedPrice = isFree ? "0 FCFA" : (actualPeriod === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString('fr-FR') + " FCFA";
                        const calculatedDuration = isFree ? "" : (actualPeriod === 'MONTHLY' ? '/ mois' : '/ an');

                        return (
                            <SubscriptionPlanCard
                                key={plan.id}
                                planType={plan.type}
                                title={plan.title}
                                description={plan.description}
                                price={calculatedPrice}
                                duration={calculatedDuration}
                                features={plan.features}
                                missing={plan.missingFeatures}
                                isFeatured={isFeatured}
                                highlight={plan.highlight}
                                forcedPeriod={forcedPeriod}
                                mode="selectable"
                                isSelected={isSelected}
                                onSelect={() => setSelectedPlan(plan)}
                            />
                        );
                    })}
                </div>

                {/* Footer Action */}
                <div className="mt-10 text-center">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedPlan || isSubmitting}
                        className={`inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm transition-all ${!selectedPlan || isSubmitting
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        {isSubmitting ? (
                            <><RefreshCw size={20} className="animate-spin" /> Activation en cours...</>
                        ) : selectedPlan?.type === 'FREE_TRIAL' ? (
                            <>Activer l'essai gratuit <ArrowRight size={20} /></>
                        ) : (
                            <>Continuer vers le paiement <ArrowRight size={20} /></>
                        )}
                    </button>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 font-medium">Paiement sécurisé. Aucun engagement à long terme.</p>
                </div>
            </div>
        </div>
    );
};

export default SelectPlan;
