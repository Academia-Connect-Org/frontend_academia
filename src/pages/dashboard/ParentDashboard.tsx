import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
    MessageCircle,
    TrendingUp,
    ArrowRight,
    Users as UsersIcon
} from 'lucide-react';
import { StudentDetailsPopup } from '../../components/dashboard/shared/StudentDetailsPopup';

const ParentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [installments, setInstallments] = useState<any[]>([]);
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

    if (loading) return <div className="flex items-center justify-center h-full">Chargement...</div>;

    return (
        <>
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
            <div className="bg-white p-8 ] shadow-xl   mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">

                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bonjour, {stats?.parentName || user?.firstName}</h2>
                        <p className="text-slate-400 text-sm font-medium">Vous avez {stats?.childrenCount || 0} enfant(s) inscrit(s) cette année.</p>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/dashboard/parent/enroll')}
                        className="px-6 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30">
                        Inscrire un enfant
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/parent/schools')}
                        className="px-6 py-4 bg-slate-800 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-800/30">
                        Explorer les écoles
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* School Results & Progress */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 ] shadow-xl  ">
                        <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight cursor-pointer" onClick={() => navigate('/dashboard/parent/results')}>Performance Académique</h3>
                        <div className="space-y-6">
                            {stats?.childrenDetails?.map((child: any, idx: number) => (
                                <StudentProgress
                                    key={child.id}
                                    name={`${child.firstName} ${child.lastName}`}
                                    grade={child.classeName || "N/A"}
                                    average={child.average || "--"}
                                    trend="0"
                                    color={idx % 2 === 0 ? "blue" : "purple"}
                                    status={child.enrollmentStatus}
                                    onClick={() => {
                                        const fullChild = stats.children?.find((c: any) => c.id === child.id);
                                        setSelectedChild(fullChild || child);
                                    }}
                                />
                            ))}
                            {(!stats?.children || stats.children.length === 0) && (
                                <p className="text-slate-400 text-center py-4">Aucun enfant trouvé.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 ] shadow-xl  ">
                        <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight cursor-pointer" onClick={() => navigate('/dashboard/parent/schedule')}>Calendrier & Événements</h3>
                        <div className="space-y-4">
                            <p className="text-slate-400 text-center py-4 text-xs font-bold italic">Aucun événement à venir pour le moment.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Payments & Messages */}
                <div className="space-y-8">
                    <div className="bg-white p-8 ] shadow-xl  ">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <MessageCircle size={20} className="text-blue-600" /> Notifications
                        </h3>
                        <div className="space-y-4 mb-8">
                            {stats?.recentNotifications && stats.recentNotifications.length > 0 ? (
                                stats.recentNotifications.map((notif: any, idx: number) => (
                                    <div key={idx} className={`p-4    ${notif.type === 'warning' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{notif.time}</p>
                                        <h5 className="text-sm font-bold text-slate-800">{notif.title}</h5>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2">{notif.desc}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50    ">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucune nouvelle notification.</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/parent/messages')}
                            className="w-full py-4 bg-slate-50 text-slate-500  font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all  "
                        >
                            Ouvrir la messagerie
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const StudentProgress = ({ name, grade, average, trend, color, status, onClick }: { name: string, grade: string, average: string, trend: string, color: string, status?: string, onClick?: () => void }) => {
    const isUp = trend.startsWith('+');

    let badge = null;
    if (status === 'PENDING' || status === 'PENDING_FEE') {
        badge = { text: "Frais en attente", color: "bg-amber-100 text-amber-700" };
    } else if (status === 'ENROLLED' || status === 'ACTIVE') {
        badge = { text: "Inscrit", color: "bg-emerald-100 text-emerald-700" };
    } else if (status) {
        badge = { text: status, color: "bg-slate-100 text-slate-700" };
    }

    return (
        <div onClick={onClick} className="p-4 sm:p-6 bg-slate-50 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 group cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                <div className={`w-12 h-12 bg-${color}-100 text-${color}-600 flex items-center justify-center font-black text-sm uppercase shadow-sm shrink-0 group-hover:scale-110 transition-transform`}>
                    {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight truncate" title={name}>{name}</h4>
                    <p className="text-xs text-slate-500 font-bold truncate">{grade}</p>
                </div>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 w-full lg:w-auto mt-2 lg:mt-0 border-t lg:border-none pt-4 lg:pt-0 border-slate-200/60">
                <div className="text-left sm:text-right flex flex-col sm:items-end gap-1 flex-1 sm:flex-none">
                    {badge && (
                        <span className={`px-2 py-0.5 ${badge.color} text-[9px] font-black uppercase tracking-widest inline-block`}>{badge.text}</span>
                    )}
                    <div className="flex items-center justify-start sm:justify-end gap-2 mt-2">
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{average}</p>
                        <div className={`flex items-center justify-end gap-1 text-[10px] font-black ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isUp ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />} {trend} pts
                        </div>
                    </div>
                </div>
                <div className="shrink-0 flex items-center w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="w-full sm:w-auto px-4 py-2.5 bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
                        Voir le dossier <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventItem = ({ title, date, type }: { title: string, date: string, type: string }) => (
    <div className="flex items-center justify-between p-4  hover:bg-slate-50 transition-all cursor-pointer   hover:">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600  flex items-center justify-center font-black text-xs text-center leading-none">
                {date.split(' ')[0]}<br />{date.split(' ')[1]}
            </div>
            <div>
                <h5 className="text-sm font-bold text-slate-800">{title}</h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{type}</p>
            </div>
        </div>
        <ArrowRight size={16} className="text-slate-200" />
    </div>
);

export default ParentDashboard;
