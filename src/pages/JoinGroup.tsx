import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, X, Loader2, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import { ROUTES } from '../constants/routes';

const JoinGroup: React.FC = () => {
    const { inviteLink } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Veuillez patienter...');

    useEffect(() => {
        const join = async () => {
            if (!user) {
                navigate(ROUTES.LOGIN);
                return;
            }
            try {
                await api.post(`/chat/join?userId=${user.id}&link=${inviteLink}`);
                setStatus('success');
                setMessage('Vous avez rejoint le groupe avec succès !');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Lien d\'invitation invalide ou expiré.');
            }
        };
        join();
    }, [inviteLink, user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-80 bg-sky-500/10 dark:bg-sky-500/15 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-8 text-center relative z-10"
            >
                {/* Logo Badge */}
                <div className="p-1 bg-transparent dark:bg-white rounded-xl transition-transform duration-300 mx-auto mb-6 w-fit flex items-center justify-center">
                    <img src={logo} alt="Logo Academia Connect" className="h-10 w-10 object-contain rounded-lg" />
                </div>

                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transition-transform duration-500 ${
                    status === 'loading' ? 'bg-sky-500/10 text-sky-500 border border-sky-200/50 dark:border-sky-900/50' :
                    status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-200/50 dark:border-emerald-900/50' :
                    'bg-red-500/10 text-red-500 border border-red-200/50 dark:border-red-900/50'
                }`}>
                    {status === 'loading' && <Loader2 size={36} className="animate-spin" />}
                    {status === 'success' && <Check size={36} />}
                    {status === 'error' && <X size={36} />}
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                    {status === 'loading' ? 'Rejoindre un espace' :
                     status === 'success' ? 'Bienvenue !' : 'Lien invalide'}
                </h2>

                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    {message}
                </p>

                {status === 'error' && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200"
                    >
                        Retour au tableau de bord
                    </button>
                )}

                {status === 'success' && (
                    <div className="flex items-center justify-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-xs animate-pulse">
                        <Loader2 size={16} className="animate-spin" />
                        Redirection vers votre espace...
                    </div>
                )}

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link to={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-600 transition-colors">
                        <ArrowLeft size={12} /> Retour à l'accueil
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default JoinGroup;
