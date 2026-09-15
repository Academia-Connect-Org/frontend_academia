import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pt-36 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors mb-8 group font-semibold text-xs sm:text-sm">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-12 md:p-16"
                >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center mb-8 border border-sky-200/50 dark:border-sky-900/50">
                        <Scale size={32} />
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                        Conditions <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Générales</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-normal">
                        En utilisant la plateforme Academia Connect, vous acceptez l'intégralité des présentes conditions d'utilisation.
                    </p>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <CheckCircle className="text-sky-500" size={20} /> 1. Objet du Service
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                Academia Connect est une solution logicielle cloud (SaaS) destinée à la gestion administrative, pédagogique et financière des établissements scolaires.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <AlertTriangle className="text-sky-500" size={20} /> 2. Responsabilités
                            </h2>
                            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                                <p>
                                    L'établissement scolaire utilisateur est responsable de l'exactitude des informations saisies (bulletins, absences, reçus de paiement).
                                </p>
                                <p>
                                    L'utilisateur s'engage à préserver la confidentialité de ses identifiants de connexion et à ne pas utiliser la plateforme à des fins non autorisées.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <FileText className="text-sky-500" size={20} /> 3. Propriété Intellectuelle
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                L'ensemble des composantes d'Academia Connect (interfaces, logos, code source, marques) sont protégés au titre du droit d'auteur et de la propriété intellectuelle.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
