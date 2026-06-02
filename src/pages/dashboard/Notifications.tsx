import React from 'react';
import {
    Bell,
    Calendar,
    MessageSquare,
    TrendingUp,
    ShieldCheck,
    CreditCard,
    Filter,
    MoreHorizontal,
    Trash2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const notificationsMock = [
    {
        id: 1,
        title: 'Nouveau Bulletin Disponible',
        desc: 'Le bulletin du 1er trimestre de Sarah Kone est disponible dans votre espace.',
        time: 'Il y a 2h',
        type: 'academic',
        unread: true,
        icon: TrendingUp,
        color: 'bg-blue-600'
    },
    {
        id: 2,
        title: 'Réunion Parents-Profs',
        desc: 'Demande de rendez-vous avec Mme Diallo (Maths) pour le 12 Mars à 15:30.',
        time: 'Hier',
        type: 'meeting',
        unread: true,
        icon: Calendar,
        color: 'bg-indigo-600'
    },
    {
        id: 3,
        title: 'Paiement Reçu',
        desc: 'Votre paiement de 125,000 F pour la scolarité de Moussa a été validé.',
        time: 'Il y a 2 jours',
        type: 'finance',
        unread: false,
        icon: CreditCard,
        color: 'bg-emerald-600'
    },
    {
        id: 4,
        title: 'Information Direction',
        desc: 'L\'établissement sera fermé le Vendredi 20 Mars (Journée Pédagogique).',
        time: 'Il y a 3 jours',
        type: 'info',
        unread: false,
        icon: ShieldCheck,
        color: 'bg-amber-600'
    },
];

const Notifications: React.FC<{ role: string }> = ({ role }) => {
    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Historique d'Alertes</h2>
                    <p className="text-slate-500 font-medium">Restez informé des derniers événements liés à votre profil.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white dark:bg-slate-800 dark:border-slate-700 border border-slate-200 px-6 py-3.5 rounded-3xl font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <CheckCircle2 size={18} /> Tout marquer lu
                    </button>
                    <button className="bg-red-50 text-red-600 px-6 py-3.5 rounded-3xl font-bold flex items-center gap-2 hover:bg-red-100 transition-all">
                        <Trash2 size={18} /> Tout supprimer
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
                    <div className="flex gap-4">
                        <button className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/30">Tout</button>
                        <button className="px-5 py-2.5 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors">Non lus</button>
                        <button className="px-5 py-2.5 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors">Académique</button>
                    </div>
                    <button className="p-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"><Filter size={20} /></button>
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {notificationsMock.map((notif) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-8 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group relative flex gap-6 items-start ${notif.unread ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-blue-600' : ''}`}
                        >
                            <div className={`w-14 h-14 shrink-0 rounded-[24px] ${notif.color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                                <notif.icon size={28} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`text-lg font-black dark:text-white tracking-tight ${notif.unread ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h4>
                                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{notif.time}</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mb-4">{notif.desc}</p>
                                <div className="flex gap-3">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline">Voir les détails</button>
                                    <span className="text-slate-200 dark:text-slate-700">|</span>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors">Supprimer</button>
                                </div>
                            </div>
                            <button className="p-2 text-slate-200 dark:text-slate-700 hover:text-slate-400 transition-colors group-hover:opacity-100 opacity-0"><MoreHorizontal size={20} /></button>
                        </motion.div>
                    ))}
                </div>

                <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex justify-center bg-slate-50/10 dark:bg-slate-800/10">
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-all flex items-center gap-2">
                        <AlertCircle size={16} /> Vous avez atteint la fin de vos notifications
                    </button>
                </div>
            </div>
        </>
    );
};

export default Notifications;
