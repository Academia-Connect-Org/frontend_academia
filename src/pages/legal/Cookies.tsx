import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Info, Globe, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Cookies: React.FC = () => {
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
                    <div className="w-20 h-20 bg-amber-50 text-amber-600  flex items-center justify-center mb-10">
                        <Cookie size={40} />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
                        Gestion des <span className="text-amber-600">Cookies</span>
                    </h1>
                    <p className="text-slate-500 text-lg mb-12 leading-relaxed italic font-medium">
                        Nous utilisons des cookies pour améliorer votre expérience sur ACADEMIA CONNECT.
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <Info className="text-amber-500" size={24} /> Qu'est-ce qu'un Cookie ?
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-bold">
                                Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site. Il permet d'enregistrer des informations relatives à votre navigation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <ShieldCheck className="text-amber-500" size={24} /> Types de Cookies Utilisés
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-8 bg-slate-50 ]  ">
                                    <h4 className="font-black text-slate-900 mb-2 uppercase tracking-wide">Indispensables</h4>
                                    <p className="text-sm text-slate-500 italic">Essentiels pour l'authentification et l'accès au Dashboard sécurisé.</p>
                                </div>
                                <div className="p-8 bg-slate-50 ]   opacity-60">
                                    <h4 className="font-black text-slate-900 mb-2 uppercase tracking-wide">Analytiques</h4>
                                    <p className="text-sm text-slate-500 italic">Pour comprendre comment vous utilisez notre outil et l'améliorer (anonyme).</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <Globe className="text-amber-500" size={24} /> Vos choix
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Vous pouvez à tout moment désactiver les cookies non essentiels depuis les paramètres de votre navigateur. Veuillez noter que cela peut affecter certaines fonctionnalités de notre Dashboard.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cookies;
