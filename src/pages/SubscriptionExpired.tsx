import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CreditCard, Phone, ArrowRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubscriptionExpired = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Normalize role for comparison
    const role = user?.role?.toString().toUpperCase();
    const isRestrictedRole = role === 'ELEVE' || role === 'PARENT' || role === 'PARENTS' || role === 'ENSEIGNANT';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-white ] p-16 shadow-2xl shadow-indigo-200   text-center relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50  blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                <div className="w-24 h-24 bg-red-50 text-red-600 ] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-red-200 rotate-12">
                    <ShieldAlert size={48} strokeWidth={2.5} />
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">
                    Accès <span className="text-red-500">Restreint</span>
                </h1>

                <p className="text-slate-500 font-medium italic text-lg mb-12 leading-relaxed max-w-md mx-auto">
                    L'abonnement de votre établissement a expiré. Pour protéger vos données, l'accès à la plateforme est suspendu jusqu'au renouvellement.
                </p>

                {!isRestrictedRole ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="p-8 bg-slate-50 ]   flex flex-col items-center gap-4 hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/pricing')}>
                                <div className="w-12 h-12 bg-indigo-600 text-white  flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                    <CreditCard size={24} />
                                </div>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Renouveler</span>
                            </div>

                            <div className="p-8 bg-slate-50 ]   flex flex-col items-center gap-4 hover:shadow-xl transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-emerald-500 text-white  flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <Phone size={24} />
                                </div>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Support VIP</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/pricing')}
                            className="w-full py-6 bg-slate-900 text-white ] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all group"
                        >
                            Voir les Tarifs Academia
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={logout}
                        className="w-full py-6 bg-slate-100 text-slate-600 ] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-200 transition-all group"
                    >
                        Se Déconnecter
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}

                <p className="mt-10 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Code Établissement: {user?.institution?.code || 'EC-2026-XN'}
                </p>
            </motion.div>
        </div>
    );
};

export default SubscriptionExpired;
