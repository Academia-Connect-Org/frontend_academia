import React from 'react';
import { motion } from 'framer-motion';
import { 
    Layout, 
    Shield, 
    Zap, 
    CheckCircle2, 
    ArrowRight, 
    BarChart3, 
    FileText, 
    GraduationCap, 
    Smartphone,
    Building2,
    Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const Features: React.FC = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const modules = [
        {
            title: "Espace PDG",
            icon: Briefcase,
            badgeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200/50 dark:border-sky-900/50",
            iconColor: "text-sky-500",
            hoverBorder: "hover:border-sky-400 dark:hover:border-sky-400 hover:shadow-sky-500/10",
            desc: "Pilotage stratégique multi-établissements.",
            features: [
                "Tableau de bord financier consolidé",
                "Gestion globale des licences et abonnements",
                "Statistiques comparatives inter-écoles",
                "Audit et rapports stratégiques instantanés"
            ]
        },
        {
            title: "Direction & Pilotage",
            icon: Building2,
            badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/50",
            iconColor: "text-indigo-500",
            hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-indigo-500/10",
            desc: "Configuration académique et gestion RH.",
            features: [
                "Configuration intelligente des cycles et classes",
                "Génération d'emplois du temps sans conflits",
                "Gestion administrative du personnel (Staff & Enseignants)",
                "Diffusion d'annonces ciblées et notifications push"
            ]
        },
        {
            title: "Secrétariat & Admissions",
            icon: FileText,
            badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50",
            iconColor: "text-emerald-500",
            hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-emerald-500/10",
            desc: "Fluidification des processus administratifs.",
            features: [
                "Processus d'inscription (Enrollment) simplifié",
                "Suivi d'assiduité et dossiers élèves numériques",
                "Génération de certificats, reçus et bulletins",
                "Archivage sécurisé des documents académiques"
            ]
        },
        {
            title: "Espace Enseignant",
            icon: GraduationCap,
            badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50",
            iconColor: "text-amber-500",
            hoverBorder: "hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-amber-500/10",
            desc: "Innovation pédagogique au quotidien.",
            features: [
                "Appel numérique et cahier de texte synchronisé",
                "Saisie de notes et calcul automatique des moyennes",
                "Gestion des devoirs et ressources partagées",
                "Communication directe avec les parents"
            ]
        },
        {
            title: "Parents & Élèves",
            icon: Smartphone,
            badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/50",
            iconColor: "text-rose-500",
            hoverBorder: "hover:border-rose-400 dark:hover:border-rose-400 hover:shadow-rose-500/10",
            desc: "Engagement et suivi en temps réel.",
            features: [
                "Consultation instantanée des notes et bulletins",
                "Agenda scolaire et notifications de devoirs",
                "Messagerie sécurisée avec l'équipe pédagogique",
                "Suivi transparent des frais de scolarité"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
            {/* Hero Section */}
            <header className="relative bg-slate-900 dark:bg-slate-950 pt-36 pb-24 border-b border-slate-800">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-sky-500/15 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/15 blur-[120px] animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div {...fadeIn}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold rounded-full mb-6">
                            <Zap size={14} /> Écosystème Complet
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                            Des fonctionnalités <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">pensées pour vous</span>
                        </h1>
                        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
                            Academia Connect digitalise chaque aspect de votre établissement pour offrir une expérience fluide, sécurisée et performante.
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* Features Main Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {modules.map((module, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className={`bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between ${module.hoverBorder}`}
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-3.5 rounded-xl border ${module.badgeBg} group-hover:scale-110 transition-transform duration-300`}>
                                        <module.icon size={26} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{module.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{module.desc}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {module.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-3">
                                            <CheckCircle2 size={16} className={`${module.iconColor} shrink-0`} />
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Infrastructure Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-8 sm:p-12 rounded-3xl border border-slate-800 text-white relative overflow-hidden shadow-2xl group"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-[100px] pointer-events-none" />
                        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-sky-300 text-xs font-semibold rounded-full mb-6">
                                    <Shield size={14} /> Sécurité & Performance
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">Infrastructure Cloud Mondiale</h3>
                                <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed font-normal">
                                    Notre plateforme repose sur une architecture Cloud résiliente, garantissant une disponibilité de 99.9% et une sécurité des données de niveau bancaire.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                        <BarChart3 className="text-sky-400 mb-2" size={20} />
                                        <h4 className="font-bold text-xs mb-1">Temps Réel</h4>
                                        <p className="text-[11px] text-slate-400">Synchronisation instantanée sur tous vos appareils.</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                        <Layout className="text-sky-400 mb-2" size={20} />
                                        <h4 className="font-bold text-xs mb-1">Multi-Plateforme</h4>
                                        <p className="text-[11px] text-slate-400">Disponible sur Web, Desktop (Linux/Win/Mac) et Mobile.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex justify-center items-center relative">
                                <Smartphone size={220} className="text-white/10 animate-bounce" style={{ animationDuration: '4s' }} />
                                <Smartphone className="text-sky-400 absolute" size={100} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                        Prêt à transformer votre établissement ?
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            to={ROUTES.REGISTER} 
                            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            Créer un compte <ArrowRight size={16} />
                        </Link>
                        <Link 
                            to={ROUTES.PRICING} 
                            className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
                        >
                            Voir les Tarifs
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;
