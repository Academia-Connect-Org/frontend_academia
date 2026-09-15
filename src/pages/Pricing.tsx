import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Crown, ArrowRight, ShieldCheck, Loader2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROUTES } from '../constants/routes';
import api from '../api/axios';
import SubscriptionPlanCard from '../components/shared/SubscriptionPlanCard';

const Pricing = () => {
    const [isYearly, setIsYearly] = useState(false);
    const navigate = useNavigate();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/public/plans');
                const sortedPlans = response.data.sort((a: any, b: any) => a.monthlyPrice - b.monthlyPrice);
                setPlans(sortedPlans);
            } catch (error) {
                console.error("Error fetching plans:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const getIconForPlan = (type: string) => {
        switch (type) {
            case 'FREE_TRIAL': return Clock;
            case 'SIMPLE': return Zap;
            case 'STANDARD': return Crown;
            case 'PREMIUM': return ShieldCheck;
            default: return Crown;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-20">
            {/* Header Section */}
            <header className="relative bg-slate-900 dark:bg-slate-950 pt-36 pb-20 text-white text-center mb-16 overflow-hidden border-b border-slate-800">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/15 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/15 blur-[130px] animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 font-semibold text-xs rounded-full mb-6">
                            <Tag size={14} /> Transparence & Flexibilité
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
                            Formules & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Tarifs</span>
                        </h1>
                        
                        <p className="text-xs md:text-sm text-slate-400 font-normal max-w-xl mx-auto leading-relaxed">
                            Choisissez la formule parfaitement adaptée aux besoins et à l'envergure de votre établissement scolaire.
                        </p>

                        {!loading && plans.some(plan => plan.type !== 'FREE_TRIAL' && (plan.billingOptions === 'BOTH' || plan.billingOptions == null)) && (
                            <div className="mt-8 flex items-center justify-center gap-3">
                                <span className={`text-xs font-semibold ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Mensuel</span>
                                <button
                                    onClick={() => setIsYearly(!isYearly)}
                                    className="w-14 h-7 bg-slate-800 border border-slate-700 rounded-full p-1 relative transition-colors cursor-pointer"
                                >
                                    <div className={`w-5 h-5 bg-sky-500 rounded-full shadow-md transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                                <span className={`text-xs font-semibold ${isYearly ? 'text-white' : 'text-slate-500'}`}>
                                    Annuel <small className="text-sky-400 font-bold ml-0.5">(-10%)</small>
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-sky-500" size={40} />
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center items-stretch gap-6 sm:gap-8 max-w-7xl mx-auto">
                        {plans.map((plan) => {
                            let effectiveIsYearly = isYearly;
                            if (plan.billingOptions === 'MONTHLY_ONLY') effectiveIsYearly = false;
                            if (plan.billingOptions === 'YEARLY_ONLY') effectiveIsYearly = true;

                            const calculatedPrice = plan.monthlyPrice === 0 
                                ? "0 FCFA" 
                                : (effectiveIsYearly ? `${plan.yearlyPrice.toLocaleString('fr-FR')} FCFA` : `${plan.monthlyPrice.toLocaleString('fr-FR')} FCFA`);
                            const calculatedDuration = plan.duration ? plan.duration : (effectiveIsYearly ? "/ an" : "/ mois");

                            return (
                                <SubscriptionPlanCard
                                    key={plan.id}
                                    planType={plan.type}
                                    title={plan.title}
                                    price={calculatedPrice}
                                    duration={calculatedDuration}
                                    icon={getIconForPlan(plan.type)}
                                    highlight={plan.highlight}
                                    features={plan.features}
                                    missing={plan.missingFeatures}
                                    isFeatured={plan.featured}
                                    forcedPeriod={plan.billingOptions !== 'BOTH' && plan.billingOptions != null ? effectiveIsYearly : null}
                                    mode="public"
                                    onButtonClick={() => navigate(`${ROUTES.PAYMENT}?plan=${plan.type}&planTitle=${encodeURIComponent(plan.title)}&price=${calculatedPrice}&duration=${calculatedDuration}`)}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Custom Quote Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 p-6 sm:p-10 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex gap-4 sm:gap-5 items-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-900/50">
                            <ShieldCheck size={26} />
                        </div>
                        <div>
                            <h4 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Besoin d'un devis sur-mesure ?</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Pour les groupes scolaires complexes de plus de 5 établissements.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate(ROUTES.CONTACT)}
                        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group shrink-0"
                    >
                        Contactez-nous
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Pricing;
