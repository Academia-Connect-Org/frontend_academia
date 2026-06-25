import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-32">
            <div className="max-w-4xl mx-auto px-6">
                <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-12 group font-bold">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'accueil
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white ] p-12 md:p-20 shadow-2xl shadow-slate-200  "
                >
                    <div className="w-20 h-20 bg-blue-50 text-blue-600  flex items-center justify-center mb-10">
                        <Shield size={40} />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
                        Politique de <span className="text-blue-600">Confidentialité</span>
                    </h1>
                    <p className="text-slate-500 text-lg mb-12 leading-relaxed italic font-medium">
                        Dernière mise à jour : 27 Avril 2026. Chez NB-MIND School, la protection de vos données personnelles est notre priorité absolue.
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <Lock className="text-blue-500" size={24} /> 1. Collecte des Données
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Nous collectons les informations nécessaires au bon fonctionnement de l'établissement scolaire :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
                                <li>Identité des élèves, parents et personnel éducatif.</li>
                                <li>Coordonnées de contact (Email, Téléphone).</li>
                                <li>Données académiques (Notes, Absences, Emplois du temps).</li>
                                <li>Informations de paiement pour les frais de scolarité.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <Eye className="text-blue-500" size={24} /> 2. Utilisation des Données
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Vos données sont utilisées exclusivement pour la gestion administrative et pédagogique de l'école. Elles ne sont jamais vendues à des tiers. Nous les utilisons pour :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 font-medium">
                                <li>Assurer la communication entre l'école et les familles.</li>
                                <li>Générer les bulletins scolaires et documents officiels.</li>
                                <li>Sécuriser l'accès à la plateforme Dashboard.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <Shield className="text-blue-500" size={24} /> 3. Sécurité
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Toutes les données sont chiffrées (AES-256) et stockées sur des serveurs sécurisés basés sur une infrastructure Cloud mondialement reconnue, garantissant une protection maximale contre les accès non autorisés.
                            </p>
                        </section>

                        <section className="p-10 bg-slate-50 ]   italic font-medium">
                            Pour toute question concernant vos données personnelles, contactez notre délégué à la protection des données (DPO) à l'adresse : <a href="mailto:privacy@nb-mind.com" className="text-blue-600 font-bold underline">privacy@nb-mind.com</a>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Privacy;
