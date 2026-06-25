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
                                <Shield className="text-blue-500" size={24} /> 3. Sécurité et Hébergement
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Toutes les données sont chiffrées de bout en bout (AES-256) lors de leur transmission et de leur stockage. Notre plateforme est hébergée sur des serveurs sécurisés AWS hautement disponibles, garantissant une protection maximale contre les accès non autorisés, les fuites et la perte de données.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
                                <li>Sauvegardes automatiques quotidiennes chiffrées.</li>
                                <li>Pare-feu applicatif (WAF) et protection anti-DDoS.</li>
                                <li>Contrôle d'accès strict (RBAC) pour que chaque utilisateur n'accède qu'à ses propres données.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <FileText className="text-blue-500" size={24} /> 4. Partage des Données
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Nous nous engageons formellement à ne **jamais vendre, louer ou céder** vos données personnelles à des tiers à des fins commerciales ou publicitaires. Vos données peuvent toutefois être partagées dans des contextes très stricts :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 font-medium">
                                <li>Avec nos prestataires techniques de confiance (hébergement AWS, passerelles de paiement sécurisées) uniquement pour exécuter le service.</li>
                                <li>Si la loi l'exige, dans le cadre de réquisitions judiciaires légales.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <Lock className="text-blue-500" size={24} /> 5. Vos Droits et Contrôle (RGPD)
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Conformément aux réglementations internationales sur la protection des données (RGPD, etc.), vous disposez à tout moment des droits suivants sur vos informations :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 font-medium">
                                <li>**Droit d'accès** : consulter les données que nous possédons sur vous.</li>
                                <li>**Droit de rectification** : corriger les données inexactes ou incomplètes.</li>
                                <li>**Droit à l'effacement** (Droit à l'oubli) : demander la suppression de votre compte et de vos données.</li>
                                <li>**Droit à la portabilité** : récupérer vos données dans un format standard lisible.</li>
                            </ul>
                            <p className="text-slate-600 leading-relaxed mt-4">
                                Pour exercer ces droits, le personnel de l'établissement scolaire doit d'abord être contacté, car c'est lui le "Responsable de traitement" de vos données scolaires. Vous pouvez également nous contacter directement pour toute assistance technique.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <Eye className="text-blue-500" size={24} /> 6. Cookies et Traceurs
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                L'application NB-MIND School utilise des "cookies" (petits fichiers texte) de manière très limitée. Nous n'utilisons **aucun cookie publicitaire ou de suivi tiers**. Les seuls cookies utilisés sont strictement nécessaires au fonctionnement technique de l'application :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 font-medium">
                                <li>Cookies de session pour maintenir votre connexion sécurisée au Dashboard.</li>
                                <li>Cookies de préférences pour mémoriser la langue ou le thème d'affichage.</li>
                            </ul>
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
