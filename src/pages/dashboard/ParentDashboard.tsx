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

const ParentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
            {/* Header: Student Selection / Welcome */}
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-4">
                        {stats?.children?.map((child: any, idx: number) => (
                            <div key={child.id} className={`w-16 h-16 rounded-full border-4 border-white ${idx % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} flex items-center justify-center font-black text-xl shadow-lg ring-1 ring-slate-200`}>
                                {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                            </div>
                        ))}
                        {(!stats?.children || stats.children.length === 0) && (
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <UsersIcon size={24} />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bonjour, {stats?.parentName || user?.firstName}</h2>
                        <p className="text-slate-400 text-sm font-medium">Vous avez {stats?.childrenCount || 0} enfant(s) inscrit(s) cette année.</p>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                        Prendre RDV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* School Results & Progress */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
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
                                />
                            ))}
                            {(!stats?.children || stats.children.length === 0) && (
                                <p className="text-slate-400 text-center py-4">Aucun enfant trouvé.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight cursor-pointer" onClick={() => navigate('/dashboard/parent/schedule')}>Calendrier & Événements</h3>
                        <div className="space-y-4">
                            <EventItem title="Réunion Parents-Profs" date="12 Mars" type="Important" />
                            <EventItem title="Examen Trimestriel 2" date="20-25 Mars" type="Examen" />
                            <EventItem title="Sortie Pédagogique (Musée)" date="05 Avril" type="Activités" />
                        </div>
                    </div>
                </div>

                {/* Sidebar: Payments & Messages */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <MessageCircle size={20} className="text-blue-600" /> Notifications
                        </h3>
                        <div className="space-y-4 mb-8">
                            {stats?.recentNotifications && stats.recentNotifications.length > 0 ? (
                                stats.recentNotifications.map((notif: any, idx: number) => (
                                    <div key={idx} className={`p-4 rounded-2xl border border-slate-100 ${notif.type === 'warning' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">{notif.time}</p>
                                        <h5 className="text-sm font-bold text-slate-800">{notif.title}</h5>
                                        <p className="text-xs text-slate-500 font-medium">{notif.desc}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucune nouvelle notification.</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/parent/messages')}
                            className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                        >
                            Ouvrir la messagerie
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const StudentProgress = ({ name, grade, average, trend, color }: { name: string, grade: string, average: string, trend: string, color: string }) => {
    const isUp = trend.startsWith('+');
    return (
        <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-${color}-100 text-${color}-600 flex items-center justify-center font-black`}>
                    {name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-extrabold text-slate-900">{name}</h4>
                    <p className="text-xs text-slate-500 font-bold">{grade}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-black text-slate-900 tracking-tight">{average}</p>
                <div className={`flex items-center justify-end gap-1 text-[10px] font-black ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isUp ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />} {trend} pts
                </div>
            </div>
            <div className="pl-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-colors">
                    <ArrowRight size={18} />
                </div>
            </div>
        </div>
    );
};

const EventItem = ({ title, date, type }: { title: string, date: string, type: string }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs text-center leading-none">
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
