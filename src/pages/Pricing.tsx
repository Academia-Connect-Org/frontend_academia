import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, Zap, Crown, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
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
                // Optional: Sort plans by price (monthly)
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
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Blue Header Section */}
            <header className="bg-blue-900 pt-32 pb-20 text-white text-center mb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase"
                    >
                        Plans & <span className="text-blue-400">Tarifs</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-blue-100/80 font-medium italic max-w-2xl mx-auto"
                    >
                        Choisissez le pack qui correspond à l'envergure de votre établissement.
                    </motion.p>

                    {!loading && plans.some(plan => plan.type !== 'FREE_TRIAL' && (plan.billingOptions === 'BOTH' || plan.billingOptions == null)) && (
                        <div className="mt-12 flex items-center justify-center gap-4">
                            <span className={`text-sm font-black uppercase tracking-widest ${!isYearly ? 'text-white' : 'text-white/40'}`}>Mensuel</span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className="w-16 h-8 bg-white/20 rounded-full p-1 relative transition-colors hover:bg-white/30"
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-0'}`}></div>
                            </button>
                            <span className={`text-sm font-black uppercase tracking-widest ${isYearly ? 'text-white' : 'text-white/40'}`}>Annuel <small className="text-blue-400 text-[10px] ml-1">(-10%)</small></span>
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={48} />
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
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

                <div className="mt-20 p-12 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Besoin d'un devis personnalisé ?</h4>
                            <p className="text-slate-500 font-medium italic">Pour les grands groupes scolaires de plus de 5 établissements.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate(ROUTES.CONTACT)}
                        className="px-10 py-5 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-xl flex items-center gap-3 hover:bg-slate-800 transition-all group"
                    >
                        Contactez-nous
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
