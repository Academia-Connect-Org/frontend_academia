import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CreditCard, Phone, ArrowRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const SubscriptionExpired = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const role = user?.role?.toString().toUpperCase();
    const isPdg = role === 'PDG';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-red-500/10 dark:bg-red-500/15 blur-[140px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="max-w-xl w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-12 text-center relative z-10"
            >
                {/* Logo Badge */}
                <div className="p-1 bg-transparent dark:bg-white rounded-xl transition-transform duration-300 mx-auto mb-6 w-fit flex items-center justify-center">
                    <img src={logo} alt="Logo Academia Connect" className="h-10 w-10 object-contain rounded-lg" />
                </div>

                <div className="w-20 h-20 bg-red-500/10 dark:bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-red-200/50 dark:border-red-900/50">
                    <ShieldAlert size={40} />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                    Accès <span className="text-red-500">Restreint</span>
                </h1>

                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
                    L'abonnement de votre établissement a expiré. L'accès aux données reste suspendu jusqu'au renouvellement de votre formule.
                </p>

                {isPdg ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <motion.div 
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => navigate(`/dashboard/pdg/select-plan/${user?.institution?.id}`)}
                                className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center gap-3 hover:border-sky-500 dark:hover:border-sky-500 transition-all cursor-pointer group shadow-sm"
                            >
                                <div className="w-10 h-10 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CreditCard size={20} />
                                </div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Renouveler l'abonnement</span>
                            </motion.div>

                            <motion.div 
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center gap-3 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-sm"
                            >
                                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Phone size={20} />
                                </div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Support Client Direct</span>
                            </motion.div>
                        </div>

                        <button
                            onClick={() => navigate(`/dashboard/pdg/select-plan/${user?.institution?.id}`)}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            Voir les Tarifs Academia
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <div className="p-4 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-200/50 dark:border-amber-900/50 text-xs font-medium leading-relaxed">
                            Veuillez contacter le responsable (PDG) de l'établissement pour effectuer le renouvellement.
                        </div>
                        <button
                            onClick={logout}
                            className="w-full py-3.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 group"
                        >
                            Se Déconnecter
                            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                <p className="mt-8 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Code Établissement: <span className="font-mono text-slate-600 dark:text-slate-400">{user?.institution?.code || 'EC-2026-XN'}</span>
                </p>
            </motion.div>
        </div>
    );
};

export default SubscriptionExpired;
