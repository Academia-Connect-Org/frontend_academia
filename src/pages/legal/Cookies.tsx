import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Info, Globe, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Cookies: React.FC = () => {
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
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-8 border border-amber-200/50 dark:border-amber-900/50">
                        <Cookie size={32} />
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                        Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Cookies</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-normal">
                        Nous utilisons des cookies strictement nécessaires pour garantir la sécurité et la fluidité de votre expérience sur Academia Connect.
                    </p>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <Info className="text-amber-500" size={20} /> Qu'est-ce qu'un Cookie ?
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site. Il permet de conserver votre session active et de sécuriser l'accès au Dashboard scolaire.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
                                <ShieldCheck className="text-amber-500" size={20} /> Types de Cookies Utilisés
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">Indispensables</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Essentiels pour l'authentification et le maintien de votre session sécurisée.</p>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">Analytiques</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Permettent de mesurer l'utilisation anonyme pour améliorer les performances de la plateforme.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <Globe className="text-amber-500" size={20} /> Vos choix
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                Vous pouvez à tout moment configurer votre navigateur pour rejeter les cookies. Veuillez noter que la désactivation des cookies indispensables empêchera la connexion sécurisée à votre compte.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cookies;
