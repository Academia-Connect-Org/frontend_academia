import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Terms: React.FC = () => {
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
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600  flex items-center justify-center mb-10">
                        <Scale size={40} />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
                        Conditions <span className="text-indigo-600">Générales</span>
                    </h1>
                    <p className="text-slate-500 text-lg mb-12 leading-relaxed italic font-medium">
                        En utilisant ACADEMIA CONNECT, vous acceptez les présentes conditions d'utilisation.
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <CheckCircle className="text-indigo-500" size={24} /> 1. Objet du Service
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                ACADEMIA CONNECT est une plateforme logicielle de gestion scolaire (SaaS) destinée à faciliter le pilotage des établissements scolaires.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <AlertTriangle className="text-indigo-500" size={24} /> 2. Responsabilités
                            </h2>
                            <div className="space-y-4 text-slate-600 font-medium">
                                <p>
                                    L'établissement utilisateur est seul responsable de l'exactitude des données saisies sur la plateforme (notes, absences, documents administratifs).
                                </p>
                                <p>
                                    L'utilisateur s'engage à ne pas utiliser le service à des fins illégales ou pour diffuser des contenus inappropriés.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                                <FileText className="text-indigo-500" size={24} /> 3. Propriété Intellectuelle
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Le logiciel, le design, le code et l'ensemble de l'interface sont la propriété exclusive de ACADEMIA CONNECT. Toute reproduction est interdite.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
