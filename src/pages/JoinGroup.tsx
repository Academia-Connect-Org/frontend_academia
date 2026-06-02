import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MessageCircle, Check, X, Loader2 } from 'lucide-react';

const JoinGroup: React.FC = () => {
    const { inviteLink } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Veuillez patienter...');

    useEffect(() => {
        const join = async () => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                await api.post(`/chat/join?userId=${user.id}&inviteLink=${inviteLink}`);
                setStatus('success');
                setMessage('Vous avez rejoint le groupe avec succès !');
                setTimeout(() => {
                    navigate('/dashboard'); // Should ideally go to messages
                }, 2000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Lien d\'invitation invalide ou expiré.');
            }
        };
        join();
    }, [inviteLink, user, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-white rounded-[40px] shadow-3xl p-10 text-center"
            >
                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl ${status === 'loading' ? 'bg-blue-100 text-blue-600' :
                        status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-red-100 text-red-600'
                    }`}>
                    {status === 'loading' && <Loader2 size={40} className="animate-spin" />}
                    {status === 'success' && <Check size={40} />}
                    {status === 'error' && <X size={40} />}
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-4">
                    {status === 'loading' ? 'Rejoindre un espace' :
                        status === 'success' ? 'Bienvenue !' : 'Oups !'}
                </h2>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    {message}
                </p>

                {status === 'error' && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/20"
                    >
                        Retour au tableau de bord
                    </button>
                )}

                {status === 'success' && (
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Redirection en cours...
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default JoinGroup;
