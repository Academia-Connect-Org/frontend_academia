import React from 'react';
import { motion } from 'framer-motion';
import { 
    Layout, 
    Users, 
    BookOpen, 
    Shield, 
    Zap, 
    CheckCircle2, 
    ArrowRight, 
    BarChart3, 
    Calendar, 
    MessageSquare, 
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
            color: "blue",
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
            color: "indigo",
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
            color: "emerald",
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
            color: "amber",
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
            color: "rose",
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
        <div className="min-h-screen bg-slate-50 overflow-hidden">
            {/* Hero Section */}
            <header className="relative bg-[#0A192F] pt-40 pb-32">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div {...fadeIn}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-black uppercase tracking-widest mb-10">
                            <Zap size={14} /> Ecosysteme Complet
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                            Des fonctionnalités <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">PENSÉES POUR VOUS</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            NB-MIND School digitalise chaque aspect de votre établissement pour offrir une expérience fluide, sécurisée et performante.
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* Features Main Grid */}
            <section className="py-32 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {modules.map((module, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200 border border-slate-100 group hover:border-blue-500/30 transition-all duration-500"
                        >
                            <div className="flex items-start gap-6 mb-10">
                                <div className={`w-20 h-20 rounded-[28px] bg-${module.color}-50 text-${module.color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                                    <module.icon size={36} />
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">{module.title}</h3>
                                    <p className="text-slate-500 font-medium italic">{module.desc}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {module.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-start gap-4">
                                        <div className={`mt-1.5 w-5 h-5 rounded-full bg-${module.color}-50 text-${module.color}-500 flex items-center justify-center shrink-0`}>
                                            <CheckCircle2 size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-slate-600 font-bold leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    {/* Infrastructure Card (Double Width or Highlighted) */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-blue-900 rounded-[48px] p-12 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-8">
                                    <Shield size={14} /> Sécurité & Performance
                                </div>
                                <h3 className="text-4xl font-black mb-6 uppercase tracking-tight">Infrastructure Cloud Mondiale</h3>
                                <p className="text-blue-200/70 text-lg mb-10 leading-relaxed font-light">
                                    Notre plateforme repose sur une architecture Cloud résiliente, garantissant une disponibilité de 99.9% et une sécurité des données de niveau bancaire.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-3xl">
                                        <BarChart3 className="text-blue-400 mb-4" />
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Temps Réel</h4>
                                        <p className="text-xs text-blue-200/50">Synchronisation instantanée sur tous vos terminaux.</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-3xl">
                                        <Layout className="text-blue-400 mb-4" />
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Multi-Plateforme</h4>
                                        <p className="text-xs text-blue-200/50">Disponible sur Web, Desktop (Linux/Win/Mac) et Mobile.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex justify-center">
                                <Smartphone size={320} className="text-white/10 animate-bounce" style={{ animationDuration: '4s' }} />
                                <Smartphone className="text-white absolute mt-20" size={120} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 tracking-tighter uppercase">
                        Prêt à transformer votre école ?
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link 
                            to={ROUTES.REGISTER} 
                            className="px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            Créer un compte <ArrowRight size={18} />
                        </Link>
                        <Link 
                            to={ROUTES.PRICING} 
                            className="px-10 py-5 bg-slate-100 text-slate-900 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-200 transition-all"
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
