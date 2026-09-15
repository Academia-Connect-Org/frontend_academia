import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
    MessageCircle,
    TrendingUp,
    ArrowRight,
    UserPlus,
    Building2,
    Calendar,
    Award,
    Users,
    Bell
} from 'lucide-react';
import { StudentDetailsPopup } from '../../components/dashboard/shared/StudentDetailsPopup';

const ParentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState<any | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/dashboard/parent?userId=${user.id}`);
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching parent dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user?.id]);

    if (loading) return (
        <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement du tableau de bord parent...</p>
        </div>
    );

    const childrenCount = stats?.childrenCount || stats?.childrenDetails?.length || 0;
    const parentDisplayName = stats?.parentName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Parent');

    return (
        <div className="space-y-6">
            {selectedChild && (
                <StudentDetailsPopup
                    student={selectedChild}
                    onClose={() => setSelectedChild(null)}
                    isOpen={true}
                    role="PARENT"
                    onRefresh={() => { }}
                />
            )}

            {/* Header: Student Selection / Welcome */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Bonjour, {parentDisplayName}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {childrenCount > 0
                            ? `Vous avez ${childrenCount} enfant(s) inscrit(s) dans le réseau ACADEMIA CONNECT.`
                            : 'Aucun enfant inscrit pour le moment. Inscrivez votre enfant dès aujourd’hui.'}
                    </p>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                    <button
                        onClick={() => navigate('/dashboard/parent/enroll')}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <UserPlus size={16} /> Inscrire un Enfant
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/parent/schools')}
                        className="px-5 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <Building2 size={16} /> Explorer les Écoles
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* School Results & Progress */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Children Academic Progress Card */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard/parent/results')}>
                                <Award className="text-blue-600 dark:text-blue-400" size={20} /> Performance Académique des Enfants
                            </h3>
                            <button onClick={() => navigate('/dashboard/parent/results')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                Voir détails <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {stats?.childrenDetails && stats.childrenDetails.length > 0 ? (
                                stats.childrenDetails.map((child: any, idx: number) => (
                                    <StudentProgress
                                        key={child.id || idx}
                                        name={`${child.firstName || ''} ${child.lastName || ''}`}
                                        grade={child.classeName || child.classe?.name || "Classe non attribuée"}
                                        average={child.average ? `${child.average} / 20` : "0.00 / 20"}
                                        status={child.enrollmentStatus}
                                        onClick={() => {
                                            const fullChild = stats.children?.find((c: any) => c.id === child.id);
                                            setSelectedChild(fullChild || child);
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                                    <Users size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Aucun enfant n'est actuellement rattaché à votre compte</p>
                                    <p className="text-[11px] text-slate-400">Utilisez le bouton "Inscrire un enfant" ci-dessus pour effectuer votre première inscription.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Schedule & Events Card */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard/parent/schedule')}>
                                <Calendar className="text-purple-600 dark:text-purple-400" size={20} /> Calendrier & Emploi du Temps
                            </h3>
                            <button onClick={() => navigate('/dashboard/parent/schedule')} className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                                Planning <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-2">
                            <Calendar size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Aucun évènement ou examen imminent</p>
                            <p className="text-[11px] text-slate-400">Consultez l'emploi du temps détaillé de vos enfants pour voir leurs cours hebdomadaires.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Notifications & Messages */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Bell size={20} className="text-blue-600 dark:text-blue-400" /> Notifications Récentes
                        </h3>

                        <div className="space-y-3">
                            {stats?.recentNotifications && stats.recentNotifications.length > 0 ? (
                                stats.recentNotifications.map((notif: any, idx: number) => (
                                    <div key={idx} className={`p-3.5 rounded-2xl border ${notif.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/60' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/60'}`}>
                                        <p className="text-[10px] font-bold text-slate-400 mb-0.5">{notif.time || 'Aujourd\'hui'}</p>
                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.desc}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                                    <MessageCircle size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">0 nouvelle notification</p>
                                    <p className="text-[11px] text-slate-400">Vous êtes à jour dans vos messages et alertes.</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/dashboard/parent/messages')}
                            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={16} /> Ouvrir la messagerie
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentProgress = ({ name, grade, average, status, onClick }: { name: string, grade: string, average: string, status?: string, onClick?: () => void }) => {
    let badge = null;
    if (status === 'PENDING' || status === 'PENDING_FEE') {
        badge = { text: "Frais en attente", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800" };
    } else if (status === 'ENROLLED' || status === 'ACTIVE') {
        badge = { text: "Inscrit", color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" };
    } else if (status) {
        badge = { text: status, color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700" };
    }

    const initials = name.trim().split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'E';

    return (
        <div onClick={onClick} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {initials}
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase truncate">{name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{grade}</p>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-200/60 dark:border-slate-700/60">
                {badge && (
                    <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-bold uppercase ${badge.color}`}>{badge.text}</span>
                )}
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{average}</p>
                </div>
                <div className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl flex items-center gap-1 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    Dossier <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
