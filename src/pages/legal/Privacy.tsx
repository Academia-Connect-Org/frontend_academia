import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Privacy: React.FC = () => {
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
                        <Shield size={32} />
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                        Politique de <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Confidentialité</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-normal">
                        Dernière mise à jour : 27 Avril 2026. Chez Academia Connect, la sécurité et la confidentialité de vos données personnelles et scolaires sont notre priorité absolue.
                    </p>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <Lock className="text-sky-500" size={20} /> 1. Collecte des Données
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                                Nous collectons uniquement les informations nécessaires au fonctionnement administratif et pédagogique de l'établissement scolaire :
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                                <li>Identité des élèves, parents et personnels éducatifs.</li>
                                <li>Coordonnées de contact (Email, Téléphone).</li>
                                <li>Données académiques (Notes, Absences, Emplois du temps).</li>
                                <li>Historique des paiements des frais de scolarité.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <Eye className="text-sky-500" size={20} /> 2. Utilisation des Données
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Vos données sont utilisées exclusivement pour la gestion de l'école. Elles ne sont jamais vendues ou cédées à des tiers.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                                <li>Assurer la communication entre l'école et les familles.</li>
                                <li>Générer les bulletins scolaires et reçus officiels.</li>
                                <li>Sécuriser l'accès à l'application.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <Shield className="text-sky-500" size={20} /> 3. Sécurité et Chiffrement
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                                Toutes les données sont transmises via des protocoles sécurisés HTTPS/TLS et chiffrées au repos.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                                <li>Sauvegardes automatiques quotidiennes chiffrées.</li>
                                <li>Pare-feu applicatif et protection contre les intrusions.</li>
                                <li>Habilitations strictes par rôle (RBAC).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                                <FileText className="text-sky-500" size={20} /> 4. Partage des Données
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Nous ne partageons vos données avec aucun tiers commercial. Les seuls partages techniques concernent l'infrastructure d'hébergement et les passerelles de paiement sécurisées.
                            </p>
                        </section>

                        <section className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
                            <Mail className="text-sky-500 shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">Contact Délégué à la Protection des Données (DPO)</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Pour toute question relative à vos données personnelles :</p>
                                <a href="mailto:academiaconnects@gmail.com" className="text-sky-600 dark:text-sky-400 font-semibold text-xs hover:underline">
                                    academiaconnects@gmail.com
                                </a>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Privacy;
