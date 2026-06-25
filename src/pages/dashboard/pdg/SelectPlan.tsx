import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api, { getFileUrl } from '../../../api/axios';
import { ROUTES } from '../../../constants/routes';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, ChevronLeft, ArrowRight, Building, RefreshCw, AlertCircle } from 'lucide-react';

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

                // Filter plans based on whether it's a new school or renewal
                const availablePlans = plansRes.data
                    .sort((a: any, b: any) => (a.monthlyPrice || 0) - (b.monthlyPrice || 0))
                    .filter((p: any) => {
                        if (p.type === 'NONE') return false;
                        // Show Free trial if the institution hasn't chosen any plan yet
                        if (p.type === 'FREE_TRIAL' && instRes.data.subscriptionType !== 'NONE') return false;
                        return true;
                    });

                setPlans(availablePlans);

                // Auto-select free trial if no plan chosen yet, else first paid plan
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

        // If Free Trial is selected, activate immediately via API
        if (selectedPlan.type === 'FREE_TRIAL') {
            setIsSubmitting(true);
            setError(null);
            try {
                await api.post('/subscription/subscribe', null, {
                    params: {
                        pdgId: user?.id,
                        institutionId: institution.id,
                        type: 'FREE_TRIAL',
                        period: 'MONTHLY' // Free trial is usually a fixed period anyway
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
            // Paid plan -> Redirect to Payment Gateway
            const rawPrice = selectedPeriod === 'MONTHLY' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
            const priceStr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(rawPrice);
            const durationStr = selectedPeriod === 'MONTHLY' ? '/ mois' : '/ an';

            navigate(`${ROUTES.PAYMENT}?plan=${selectedPlan.title}&price=${priceStr}&duration=${durationStr}&institutionId=${institution.id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!institution) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-black text-slate-800 mb-2">Établissement introuvable</h2>
                <p className="text-slate-500 mb-6">Nous n'avons pas pu charger les informations de l'établissement.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">Retour</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm mb-8">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
                        <ChevronLeft size={20} />
                        Retour
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center text-slate-400">
                            {institution.logoUrl ? <img src={getFileUrl(institution.logoUrl)} alt="Logo" className="w-full h-full object-cover" /> : <Building size={20} />}
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Abonnement pour</p>
                            <h2 className="font-bold text-slate-800 text-sm leading-tight">{institution.name}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <Crown size={48} className="mx-auto text-indigo-600 mb-6" />
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        {institution.subscriptionType === 'NONE' ? 'Choisissez votre plan initial' : 'Renouvelez votre abonnement'}
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        {institution.subscriptionType === 'NONE'
                            ? 'Choisissez le forfait qui correspond à vos ambitions pour commencer à utiliser la plateforme.'
                            : 'Sélectionnez un forfait pour continuer à utiliser toutes nos fonctionnalités.'}
                    </p>
                </div>

                {/* Billing Toggle (Hide if only free trial is selected/available) */}
                <div className="flex justify-center mb-12">
                    <div className="bg-slate-200/50 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200">
                        <button
                            onClick={() => setSelectedPeriod('MONTHLY')}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${selectedPeriod === 'MONTHLY' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Facturation Mensuelle
                        </button>
                        <button
                            onClick={() => setSelectedPeriod('YEARLY')}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${selectedPeriod === 'YEARLY' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Facturation Annuelle
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-wider">-10%</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 flex items-center gap-3">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan?.id === plan.id;
                        const isFree = plan.type === 'FREE_TRIAL';
                        const isFeatured = plan.featured;

                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelectedPlan(plan)}
                                className={`p-5 border-2 transition-all cursor-pointer relative flex flex-col bg-white ${isFeatured ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-[1.02] z-10' : 'border-slate-100 hover:border-indigo-300 hover:shadow-xl'
                                    } ${isSelected
                                        ? 'ring-4 ring-indigo-600/20 bg-indigo-50/10'
                                        : ''
                                    }`}
                            >
                                {isFeatured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-indigo-600 text-white text-xs font-black tracking-widest uppercase shadow-lg flex items-center gap-2 w-max">
                                        <Crown size={14} /> {plan.highlight || "Recommandé"}
                                    </div>
                                )}

                                {isSelected && !isFeatured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 text-white text-xs font-black tracking-widest uppercase shadow-md flex items-center gap-2 w-max">
                                        <CheckCircle size={14} /> Sélectionné
                                    </div>
                                )}

                                <div className="mb-6 mt-2">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{plan.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium h-10">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    {isFree ? (
                                        <div className="text-4xl font-black text-slate-900">0 FCFA</div>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-black text-slate-900">
                                                {(selectedPeriod === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString()}
                                            </span>
                                            <span className="text-slate-500 font-bold ml-1 text-sm">FCFA / {selectedPeriod === 'MONTHLY' ? 'mois' : 'an'}</span>
                                        </>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Inclus :</p>
                                    <ul className="space-y-4">
                                        {plan.features?.map((f: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium leading-tight">
                                                <div className="mt-0.5 w-4 h-4 bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <CheckCircle size={10} />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Action */}
                <div className="mt-12 text-center">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedPlan || isSubmitting}
                        className={`inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-lg transition-all ${!selectedPlan || isSubmitting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1'
                            }`}
                    >
                        {isSubmitting ? (
                            <><RefreshCw size={24} className="animate-spin" /> Activation en cours...</>
                        ) : selectedPlan?.type === 'FREE_TRIAL' ? (
                            <>Activer l'essai gratuit <ArrowRight size={24} /></>
                        ) : (
                            <>Continuer vers le paiement <ArrowRight size={24} /></>
                        )}
                    </button>
                    <p className="text-slate-400 text-sm mt-4 font-medium">Paiement sécurisé. Aucun engagement à long terme.</p>
                </div>
            </div>
        </div>
    );
};

export default SelectPlan;
