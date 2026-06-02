import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, Zap, Crown, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROUTES } from '../constants/routes';

const Pricing = () => {
    const [isYearly, setIsYearly] = useState(false);

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
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <PricingCard
                        title="Essai Gratuit"
                        price="0 FCFA"
                        duration="3 Mois"
                        icon={Clock}
                        highlight="Offre de Bienvenue"
                        features={[
                            "Accès complet temporaire",
                            "Toutes fonctionnalités Premium",
                            "Configuration assistée",
                            "Une seule fois par PDG"
                        ]}
                    />

                    <PricingCard
                        title="Simple"
                        price={isYearly ? "600 000 FCFA" : "55 000 FCFA"}
                        duration={isYearly ? "/ an" : "/ mois"}
                        icon={Zap}
                        highlight="Essentiel Admin"
                        features={[
                            "Gestion admin complète",
                            "Messagerie interne (limité)",
                            "Statistiques de base",
                            "Pointage présence",
                            "Emploi du temps"
                        ]}
                        missing={[
                            "Génération de bulletins",
                            "Devoirs & Examens en ligne",
                            "Exports PDF/Excel avancés",
                            "Stockage illimité",
                            "IA de prédiction scolaire",
                            "Marque blanche possible"
                        ]}
                    />

                    <PricingCard
                        title="Standard"
                        price={isYearly ? "1 080 000 FCFA" : "95 000 FCFA"}
                        duration={isYearly ? "/ an" : "/ mois"}
                        icon={Crown}
                        highlight="Populaire"
                        isFeatured
                        features={[
                            "Tout illimité",
                            "Génération de bulletins auto",
                            "Messagerie réseau complète",
                            "Espace Parents & Élèves Pro",
                            "Exports statistiques avancés",
                            "Support Prioritaire",
                            "Devoirs & Examens en ligne",
                        ]}
                        missing={[
                            "IA de prédiction scolaire",
                            "Marque blanche possible",
                        ]}
                    />

                    <PricingCard
                        title="Premium"
                        price={isYearly ? "1 620 000 FCFA" : "145 000 FCFA"}
                        duration={isYearly ? "/ an" : "/ mois"}
                        icon={ShieldCheck}
                        highlight="L'Elite Academia"
                        features={[
                            "Tout illimité",
                            "Génération de bulletins auto",
                            "Messagerie réseau complète",
                            "Espace Parents & Élèves Pro",
                            "Exports statistiques avancés",
                            "Support Prioritaire",
                            "Devoirs & Examens en ligne",
                            "IA de prédiction scolaire",
                            "Marque blanche possible",
                            "Support VIP & Formateur dédié"
                        ]}
                    />
                </div>

                <div className="mt-20 p-12 bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Besoin d'un devis personnalisé ?</h4>
                            <p className="text-slate-500 font-medium italic">Pour les grands groupes scolaires de plus de 5 établissements.</p>
                        </div>
                    </div>
                    <button className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all group">
                        Contactez-nous
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const PricingCard = ({ title, price, duration, icon: Icon, features, missing, isFeatured, highlight }: any) => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`relative p-10 rounded-[48px] border-2 transition-all duration-500 ${isFeatured ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 scale-105 z-10' : 'border-slate-100 bg-white/50 backdrop-blur-sm shadow-xl'}`}
        >
            <div className="mb-8">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${isFeatured ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {highlight}
                </span>
            </div>

            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${isFeatured ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <Icon size={32} />
            </div>

            <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">{title}</h3>
            <div className="flex items-baseline gap-1 mb-8 pb-8 border-b border-slate-50">
                <span className="text-3xl font-black text-slate-900">{price}</span>
                <span className="text-sm font-bold text-slate-400">{duration}</span>
            </div>

            <div className="space-y-5 mb-10">
                {features.map((f: string, i: number) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-bold text-slate-600">{f}</span>
                    </div>
                ))}
                {missing?.map((m: string, i: number) => (
                    <div key={i} className="flex gap-4 opacity-40">
                        <div className="w-5 h-5 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <X size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-slate-400 italic line-through">{m}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => navigate(`${ROUTES.PAYMENT}?plan=${title}&price=${price}&duration=${duration}`)}
                className={`w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all ${isFeatured
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10'
                    }`}>
                Sélectionner ce plan
            </button>
        </motion.div>
    );
};

export default Pricing;
