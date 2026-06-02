import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Users, BookOpen, GraduationCap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';
import featAdmin from '../assets/feature-admin.png';
import featComm from '../assets/feature-comm.png';
import featPerf from '../assets/feature-perf.png';
import Footer from '../components/Footer';

const Home: React.FC = () => {
    return (
        <div className="bg-white">
            {/* HERO SECTION - FULL SCREEN WITH BACKGROUND */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background Image Container */}
                <div className="absolute inset-0 z-0">
                    <img src={heroImg} alt="Hero Background" className="w-full h-full object-cover" />
                    {/* Premium Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/60 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8">
                            Modernisez votre établissement avec <span className="text-blue-400">NB-MIND School</span>
                        </h1>
                        <p className="text-xl text-blue-50/90 mb-10 leading-relaxed font-medium">
                            Une plateforme intégrée pour gérer l'administration, la pédagogie et la communication en temps réel. Donnez à votre école les outils qu'elle mérite.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register" className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg hover:bg-blue-600 shadow-xl shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group border border-blue-400/50">
                                Commencer l'aventure <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/support" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all text-center">
                                En savoir plus
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Simple Scroll Indicator Animation */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
                >
                    <span className="text-xs font-semibold tracking-widest uppercase">Découvrir</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
                </motion.div>
            </section>

            {/* FEATURES SECTION - ALTERNATING LAYOUT */}
            <section className="py-64 bg-slate-50 relative z-10">
                <div className="max-w-7xl mx-auto px-10 sm:px-16 lg:px-34 text-center mb-48">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black text-blue-900 mb-8"
                    >
                        Performance & Connectivité
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl text-slate-500 max-w-3xl mx-auto font-light"
                    >
                        Plongez dans l'écosystème NB-MIND School où chaque détail est conçu pour l'excellence opérationnelle de votre établissement.
                    </motion.p>
                </div>

                <div className="max-w-7xl mx-auto px-10 sm:px-16 lg:px-24 space-y-64 lg:space-y-80">
                    {/* Feature 1: Image Left, Text Right */}
                    <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="w-full md:w-1/2"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-blue-600/10 rounded-[40px] blur-2xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
                                <img
                                    src={featAdmin}
                                    alt="Administration Dashboard"
                                    className="relative w-full rounded-[40px] shadow-2xl transform group-hover:scale-[1.03] transition-transform duration-700 border border-white/50"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full md:w-1/2 space-y-8"
                        >
                            <div className="w-20 h-1.5 bg-blue-600 rounded-full mb-6"></div>
                            <h3 className="text-4xl md:text-6xl font-black text-blue-900 leading-tight">Admin Intelligente</h3>
                            <p className="text-2xl text-slate-600 leading-relaxed font-light">
                                Automatisez les inscriptions, la gestion des classes et des emplois du temps avec une précision inégalée.
                            </p>
                            <ul className="space-y-5 text-slate-500 font-medium text-lg">
                                <li className="flex items-center gap-4"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div> Inscriptions instantanées</li>
                                <li className="flex items-center gap-4"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div> Tableaux de bord en temps réel</li>
                                <li className="flex items-center gap-4"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div> Archivage hautement sécurisé</li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Feature 2: Text Left, Image Right */}
                    <div className="flex flex-col-reverse md:flex-row items-center gap-16 lg:gap-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="w-full md:w-1/2 space-y-8"
                        >
                            <div className="w-20 h-1.5 bg-indigo-600 rounded-full mb-6"></div>
                            <h3 className="text-4xl md:text-6xl font-black text-blue-900 leading-tight">Relations Fluides</h3>
                            <p className="text-2xl text-slate-600 leading-relaxed font-light">
                                Renforcez le lien entre parents et direction grâce à notre messagerie instantanée.
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-6">
                                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100">
                                    <span className="block text-4xl font-black text-blue-600 mb-1">98%</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold">Satisfaction</span>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-900/5 border border-slate-100">
                                    <span className="block text-4xl font-black text-indigo-600 mb-1">100%</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold">Transparence</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
                            className="w-full md:w-1/2"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-indigo-600/10 rounded-[40px] blur-2xl group-hover:bg-indigo-600/20 transition-all duration-700"></div>
                                <img
                                    src={featComm}
                                    alt="Communication App"
                                    className="relative w-full rounded-[40px] shadow-2xl transform group-hover:scale-[1.03] transition-transform duration-700 border border-white/50"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature 3: Image Left, Text Right (Performance) */}
                    <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="w-full md:w-1/2"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-amber-600/10 rounded-[40px] blur-2xl group-hover:bg-amber-600/20 transition-all duration-700"></div>
                                <img
                                    src={featPerf}
                                    alt="Excellence and Performance"
                                    className="relative w-full rounded-[40px] shadow-2xl transform group-hover:scale-[1.03] transition-transform duration-700 border border-white/50"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full md:w-1/2 space-y-8"
                        >
                            <div className="w-20 h-1.5 bg-amber-500 rounded-full mb-6"></div>
                            <h3 className="text-4xl md:text-6xl font-black text-blue-900 leading-tight">Performance</h3>
                            <p className="text-2xl text-slate-600 leading-relaxed font-light">
                                Suivez les performances académiques en temps réel grâce à des outils analytiques.
                            </p>
                            <div className="p-8 rounded-[32px] bg-white shadow-xl border border-slate-100 flex items-center gap-8 group">
                                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                                    <GraduationCap size={32} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-xl">Succès Garanti</p>
                                    <p className="text-slate-400">Suivi individuel de chaque élève.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature 4: Text Left, Image Right (Future & Innovation) */}
                    <div className="flex flex-col-reverse md:flex-row items-center gap-16 lg:gap-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="w-full md:w-1/2 space-y-8"
                        >
                            <div className="w-20 h-1.5 bg-blue-400 rounded-full mb-6"></div>
                            <h3 className="text-4xl md:text-6xl font-black text-blue-900 leading-tight">Digitalisation</h3>
                            <p className="text-2xl text-slate-600 leading-relaxed font-light">
                                Accédez à votre établissement n'importe où, n'importe quand.
                            </p>
                            <div className="flex items-start gap-4 p-8 rounded-[32px] bg-blue-900 text-white shadow-2xl">
                                <Globe size={40} className="text-blue-400 shrink-0" />
                                <div>
                                    <h4 className="text-xl font-bold mb-2">Partout dans le monde</h4>
                                    <p className="text-blue-200/70 font-light">Utilisez NB-MIND School sur Mobile, Tablette et PC en synchronisation totale.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
                            className="w-full md:w-1/2"
                        >
                            <div className="relative bg-gradient-to-tr from-blue-900 to-indigo-900 p-2 rounded-[50px] shadow-2xl overflow-hidden aspect-video group">
                                <div className="absolute inset-0 bg-blue-400/10 mix-blend-overlay"></div>
                                <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 border border-white/20 group-hover:scale-110 transition-transform duration-700">
                                        <Zap className="text-blue-400" size={48} fill="currentColor" />
                                    </div>
                                    <h4 className="text-white text-3xl font-black mb-4 tracking-tight">Connectivité Totale</h4>
                                    <p className="text-blue-200/60 text-lg font-light leading-relaxed">Une infrastructure Cloud résiliente pour une disponibilité de 99.9%.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FOOTER - ONLY FOR HOME PAGE */}
            <Footer />
        </div>
    );
};

export default Home;
