import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Users, Globe, Building, Briefcase, FileText, GraduationCap, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';
import featAdmin from '../assets/feature-admin.png';
import featComm from '../assets/feature-comm.png';
import featPerf from '../assets/feature-perf.png';
import logoImg from '../assets/logo13.png';
import Footer from '../components/Footer';
const AnimatedCounter = ({ from = 0, to, duration = 2, suffix = "" }: { from?: number, to: number, duration?: number, suffix?: string }) => {
    const [count, setCount] = useState(from);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

    useEffect(() => {
        if (isInView) {
            let startTimestamp: number | null = null;
            const step = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
                // easeOutQuart
                const easeProgress = 1 - Math.pow(1 - progress, 4);
                setCount(Math.floor(easeProgress * (to - from) + from));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
    }, [isInView, from, to, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

const Home: React.FC = () => {
    return (
        <div className="bg-slate-950 min-h-screen flex flex-col overflow-x-hidden w-full">
            <div className="bg-slate-50 flex-grow w-full">
                {/* HERO SECTION */}
                <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 z-0">
                        <img src={heroImg} alt="Hero Background" className="w-full h-full object-cover opacity-40" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-24 md:pt-25">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="w-full"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400 text-blue-300 font-bold tracking-widest text-xs uppercase mb-8">
                                <span className="w-1.5 h-1.5 bg-blue-400 animate-pulse"></span>
                                Un environnement de travail unifié
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-8 mb-8">
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight max-w-3xl">
                                    Digitalisez la passion d'apprendre avec <span className="text-blue-400">ACADEMIA CONNECT</span>
                                </h1>
                                <div className="flex-shrink-0 md:ml-auto">
                                    <img src={logoImg} alt="Logo Academia Connect" className="h-32 md:h-48 lg:h-94 w-auto object-contain" />
                                </div>
                            </div>
                            <p className="text-lg md:text-xl text-blue-100/80 mb-10 leading-relaxed font-medium max-w-3xl">
                                Une solution complète et premium qui relie l'administration, les enseignants et les familles pour garantir l'excellence et le succès des élèves.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white font-bold text-base md:text-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-3 group border border-blue-500 shadow-xl shadow-blue-900/50">
                                    Démarrer l'aventure <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </Link>
                                <Link to="/support" className="px-6 py-3 md:px-8 md:py-4 bg-transparent border border-slate-500 text-white font-bold text-base md:text-lg hover:bg-white/10 hover:border-white transition-colors text-center">
                                    Découvrir la plateforme
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>


                {/* ECOSYSTEM SECTION - PROFILES */}
                <section className="py-16 md:py-32 bg-white relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16 md:mb-24">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">Un Écosystème pour Chaque Acteur</h2>
                            <div className="w-24 h-1.5 bg-blue-600 mx-auto mb-8"></div>
                            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium">
                                ACADEMIA CONNECT offre des outils sur-mesure pour chaque profil, garantissant une synergie parfaite au sein de votre établissement.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* PDG */}
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-50 border border-slate-200 p-6 md:p-10 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group">
                                <div className="w-16 h-16 bg-blue-900 text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Briefcase size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Le Profil PDG</h3>
                                <p className="text-slate-600 mb-6 font-medium">Gestion globale multi-écoles, pilotage financier stratégique et audit complet de vos établissements.</p>
                                <ul className="space-y-3 text-slate-500 text-sm font-bold">
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-600"></div> Gestion multi-écoles</li>
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-600"></div> Audit & Statistiques</li>
                                </ul>
                            </motion.div>

                            {/* Direction */}
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-50 border border-slate-200 p-6 md:p-10 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group">
                                <div className="w-16 h-16 bg-indigo-900 text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Building size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Direction</h3>
                                <p className="text-slate-600 mb-6 font-medium">Configuration des cycles et classes, gestion du personnel et création d'emplois du temps intelligents.</p>
                                <ul className="space-y-3 text-slate-500 text-sm font-bold">
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-indigo-600"></div> Emploi du temps IA</li>
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-indigo-600"></div> Gestion du personnel</li>
                                </ul>
                            </motion.div>

                            {/* Secrétariat */}
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-slate-50 border border-slate-200 p-6 md:p-10 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group">
                                <div className="w-16 h-16 bg-emerald-700 text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Secrétariat</h3>
                                <p className="text-slate-600 mb-6 font-medium">Fluidifiez les admissions, gérez les dossiers élèves et générez instantanément les documents administratifs.</p>
                                <ul className="space-y-3 text-slate-500 text-sm font-bold">
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-600"></div> Inscriptions rapides</li>
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-emerald-600"></div> Documents auto-générés</li>
                                </ul>
                            </motion.div>

                            {/* Enseignant */}
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-50 border border-slate-200 p-6 md:p-10 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group lg:col-start-2">
                                <div className="w-16 h-16 bg-amber-600 text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <GraduationCap size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Enseignant</h3>
                                <p className="text-slate-600 mb-6 font-medium">Appel numérique en un clic, gestion fine des notes, cahier de texte électronique et partage de ressources.</p>
                                <ul className="space-y-3 text-slate-500 text-sm font-bold">
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-500"></div> Carnet de notes avancé</li>
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-500"></div> Cahier de texte numérique</li>
                                </ul>
                            </motion.div>

                            {/* Parent & Élève */}
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-50 border border-slate-200 p-6 md:p-10 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group">
                                <div className="w-16 h-16 bg-purple-700 text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Parent & Élève</h3>
                                <p className="text-slate-600 mb-6 font-medium">Suivi des résultats et assiduité en temps réel via mobile, accès aux devoirs et suivi financier transparent.</p>
                                <ul className="space-y-3 text-slate-500 text-sm font-bold">
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-purple-600"></div> Suivi Mobile 24/7</li>
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-purple-600"></div> Transparence financière</li>
                                </ul>
                            </motion.div>

                        </div>
                    </div>
                </section>

                {/* PERFORMANCE SECTION */}
                <section className="py-16 md:py-32 bg-slate-50 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-600/20 translate-x-4 translate-y-4 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
                                    <img src={featPerf} alt="Performance" className="relative w-full shadow-2xl border border-slate-200 z-10" />
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 space-y-6 md:space-y-8">
                                <div className="w-20 h-1.5 bg-blue-600 mb-6"></div>
                                <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">Sécurité & Connectivité Totale</h3>
                                <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                                    Hébergé sur le Cloud avec une architecture résiliente. Connectez-vous partout, sur ordinateur, tablette ou smartphone.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                                    <div className="bg-white p-6 border border-slate-200 shadow-lg flex-1">
                                        <ShieldCheck size={32} className="text-blue-600 mb-4" />
                                        <h4 className="font-bold text-slate-900 mb-2">Sécurité Bancaire</h4>
                                        <p className="text-slate-500 text-sm">Chiffrement de bout en bout de toutes vos données.</p>
                                    </div>
                                    <div className="bg-white p-6 border border-slate-200 shadow-lg flex-1">
                                        <Zap size={32} className="text-amber-500 mb-4" />
                                        <h4 className="font-bold text-slate-900 mb-2">Haute Disponibilité</h4>
                                        <p className="text-slate-500 text-sm">Garantie de service à 99.9% toute l'année.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* KEY STATS SECTION - MOVED TO BOTTOM */}
                <section className="bg-blue-600 text-white py-10 md:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 text-center divide-x divide-blue-500/50">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center p-2 md:p-4">
                                <ShieldCheck size={32} className="md:w-10 md:h-10 mb-4 text-blue-200" />
                                <h3 className="text-2xl md:text-4xl font-black mb-2"><AnimatedCounter to={100} suffix="%" /></h3>
                                <p className="text-blue-100 font-semibold uppercase tracking-wider text-[10px] md:text-sm">Sécurité</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col items-center p-2 md:p-4">
                                <Mail size={32} className="md:w-10 md:h-10 mb-4 text-blue-200" />
                                <h3 className="text-2xl md:text-4xl font-black mb-2"><AnimatedCounter to={15} suffix="K+" /></h3>
                                <p className="text-blue-100 font-semibold uppercase tracking-wider text-[10px] md:text-sm">Abonnés</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center p-2 md:p-4">
                                <Users size={32} className="md:w-10 md:h-10 mb-4 text-blue-200" />
                                <h3 className="text-2xl md:text-4xl font-black mb-2"><AnimatedCounter to={50} suffix="K+" /></h3>
                                <p className="text-blue-100 font-semibold uppercase tracking-wider text-[10px] md:text-sm">Utilisateurs</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col items-center p-2 md:p-4">
                                <Building size={32} className="md:w-10 md:h-10 mb-4 text-blue-200" />
                                <h3 className="text-2xl md:text-4xl font-black mb-2"><AnimatedCounter to={120} /></h3>
                                <p className="text-blue-100 font-semibold uppercase tracking-wider text-[10px] md:text-sm">Écoles Partenaires</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-col items-center p-2 md:p-4">
                                <GraduationCap size={32} className="md:w-10 md:h-10 mb-4 text-blue-200" />
                                <h3 className="text-2xl md:text-4xl font-black mb-2"><AnimatedCounter to={450} /></h3>
                                <p className="text-blue-100 font-semibold uppercase tracking-wider text-[10px] md:text-sm">Établissements</p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* DOWNLOAD SECTION */}
                <section className="py-20 bg-gradient-to-b from-blue-50 to-white border-t border-slate-200" id="download">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">Téléchargez nos Applications</h2>
                        <div className="w-24 h-1.5 bg-blue-600 mx-auto mb-8"></div>
                        <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl mx-auto">
                            Retrouvez ACADEMIA CONNECT sur tous vos appareils pour une expérience optimale, où que vous soyez.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                            {/* Bureau */}
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 uppercase tracking-wide">Version Bureau</h3>
                                <p className="text-slate-500 mb-8 font-medium">L'expérience complète et sans distractions pour le personnel administratif et enseignant.</p>
                                <div className="flex flex-col gap-4 w-full">
                                    <a href="https://school.nb-mind.com/downloads/Academia%20Connect%20Setup%201.0.0.exe" className="px-6 py-4 bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-blue-900/20 hover:-translate-y-1">
                                        <svg viewBox="0 0 88 88" className="w-6 h-6 fill-current"><path d="M0,12.402l35.687-4.86l0.016,34.423H0V12.402z M35.67,46.104l0.033,34.406L0,75.698V46.104H35.67z M39.95,6.84L88,0v41.921H39.95V6.84z M88,46.101V88l-48.05-6.842V46.101H88z" /></svg>
                                        Windows (.exe)
                                    </a>
                                    <a href="https://school.nb-mind.com/downloads/academia-connect_1.0.0_amd64.deb" className="px-6 py-4 bg-orange-600 text-white font-bold text-base hover:bg-orange-700 transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-orange-900/20 hover:-translate-y-1">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zm0 1.5A8.25 8.25 0 1 0 12 20.25 8.25 8.25 0 0 0 12 3.75z" /></svg>
                                        Ubuntu (.deb)
                                    </a>
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 uppercase tracking-wide">Version Mobile</h3>
                                <p className="text-slate-500 mb-8 font-medium">Restez connecté en temps réel avec le suivi des élèves et la messagerie instantanée.</p>
                                <div className="flex flex-col gap-4 w-full">
                                    <a href="#" className="px-6 py-4 bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-slate-900/20 hover:-translate-y-1">
                                        <svg viewBox="0 0 384 512" className="w-6 h-6 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                                        App Store (iOS)
                                    </a>
                                    <a href="https://school.nb-mind.com/downloads/academia-connect-android.apk" className="px-6 py-4 bg-green-600 text-white font-bold text-base hover:bg-green-500 transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-green-900/20 hover:-translate-y-1">
                                        <svg viewBox="0 0 512 512" className="w-6 h-6 fill-current"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" /></svg>
                                        Android (.apk)
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* INSTRUCTIONS D'INSTALLATION */}
                        <div className="mt-16 max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-left">
                            <details className="group">
                                <summary className="flex justify-between items-center text-2xl font-bold text-slate-800 uppercase tracking-wide cursor-pointer list-none border-b border-slate-100 pb-4">
                                    <span>Guide d'installation</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <h4 className="font-bold text-blue-600 flex items-center gap-2"><svg viewBox="0 0 88 88" className="w-4 h-4 fill-current"><path d="M0,12.402l35.687-4.86l0.016,34.423H0V12.402z M35.67,46.104l0.033,34.406L0,75.698V46.104H35.67z M39.95,6.84L88,0v41.921H39.95V6.84z M88,46.101V88l-48.05-6.842V46.101H88z" /></svg> Windows (.exe)</h4>
                                        <p className="text-slate-600 text-sm mt-1">Téléchargez le fichier <strong>.exe</strong>, double-cliquez dessus et suivez les instructions. Windows SmartScreen peut afficher un avertissement de sécurité, cliquez sur "Informations complémentaires" puis "Exécuter quand même".</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-orange-600 flex items-center gap-2"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zm0 1.5A8.25 8.25 0 1 0 12 20.25 8.25 8.25 0 0 0 12 3.75z" /></svg> Ubuntu Linux (.deb)</h4>
                                        <p className="text-slate-600 text-sm mt-1">Téléchargez le fichier <strong>.deb</strong>. Ouvrez votre terminal dans le dossier de téléchargement (ou le dossier où se trouve le fichier .deb) et exécutez la commande suivante :</p>
                                        <div className="mt-2 bg-slate-900 text-slate-300 p-3 rounded-lg flex items-center justify-between group overflow-hidden border border-slate-800 shadow-inner">
                                            <code className="text-sm font-mono whitespace-nowrap overflow-x-auto pr-4">sudo dpkg -i academia-connect_1.0.0_amd64.deb</code>
                                        </div>
                                        <p className="text-slate-500 text-xs mt-2 italic">L'application apparaîtra ensuite dans votre menu d'applications.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-600 flex items-center gap-2"><svg viewBox="0 0 512 512" className="w-4 h-4 fill-current"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" /></svg> Android (.apk)</h4>
                                        <p className="text-slate-600 text-sm mt-1">Téléchargez le fichier <strong>.apk</strong> directement sur votre smartphone. Lors de l'ouverture, votre téléphone peut vous demander l'autorisation d'installer des applications issues de "Sources inconnues". Acceptez dans vos paramètres de sécurité pour finaliser l'installation.</p>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </section>
            </div> {/* End of bg-slate-50 wrapper */}

            <div className="mt-auto w-full bg-slate-950">
                <Footer />
            </div>
        </div>
    );
};

export default Home;
