import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import {
    Users,
    TrendingUp,
    Filter,
    Download,
    Calendar,
    Clock,
    FileText,
    UserPlus,
    Bell,
    PieChart as PieChartIcon,
    Layers,
    BookOpen
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import DemographicsModal from '../../components/dashboard/shared/DemographicsModal';

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => {
    const colors: any = {
        blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
        indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
        purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
        pink: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400',
        amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${colors[color] || colors.blue} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">{value}</h4>
                </div>
            </div>
        </div>
    );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
);

const DirectionDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);

    // Filters
    const [classes, setClasses] = React.useState<any[]>([]);
    const [selectedClasse, setSelectedClasse] = React.useState<string>("");
    const [startDate, setStartDate] = React.useState<string>("");
    const [endDate, setEndDate] = React.useState<string>("");

    const fetchStats = React.useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (user?.institution?.id) params.append("institutionId", user.institution.id.toString());
        if (selectedClasse) params.append("classeId", selectedClasse);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        api.get(`dashboard/direction?${params.toString()}`)
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching dashboard stats:", err);
                setLoading(false);
            });
    }, [user?.institution?.id, selectedClasse, startDate, endDate]);

    React.useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    React.useEffect(() => {
        if (user?.institution?.id) {
            api.get(`/classes?institutionId=${user.institution.id}`).then(res => setClasses(res.data || [])).catch(() => setClasses([]));
        }
    }, [user?.institution?.id]);

    if (loading) return (
        <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement du tableau de bord...</p>
        </div>
    );

    const chartData = stats?.attendanceHistory || [];
    const studentDistribution = stats?.studentDistribution || [];

    const isProviseur = user?.role === 'PROVISORIAT';

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {isProviseur ? `Bienvenue, M. le Proviseur` : "Vue d'ensemble"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {isProviseur
                            ? "Suivi pédagogique et administratif de vos cycles."
                            : "Statistiques et indicateurs de performance de l'établissement."}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsDemoModalOpen(true)}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Users size={16} /> Rapport
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all">
                        <Download size={16} /> Exporter
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard
                    icon={<Users size={24} />}
                    label="Effectif Total"
                    value={`${stats?.totalStudents ?? 0} Élèves`}
                    color="blue"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    label="Enseignants"
                    value={stats?.totalTeachers ?? 0}
                    color="emerald"
                />
                <StatCard
                    icon={<FileText size={24} />}
                    label="Classes"
                    value={stats?.totalClasses ?? 0}
                    color="indigo"
                />
                <StatCard
                    icon={<Layers size={24} />}
                    label="Cycles"
                    value={stats?.totalCycles ?? 0}
                    color="purple"
                />
                <StatCard
                    icon={<BookOpen size={24} />}
                    label="Matières"
                    value={stats?.totalSubjects ?? 0}
                    color="pink"
                />
                <StatCard
                    icon={<TrendingUp size={24} />}
                    label="Moyenne Gén."
                    value={`${stats?.averageGPA ? stats.averageGPA.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '0,0'}/20`}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Attendance & Performance Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyse de l'Assiduité & Effectifs</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Données enregistrées par catégorie et période.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Class Filter */}
                            <select
                                value={selectedClasse}
                                onChange={(e) => setSelectedClasse(e.target.value)}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            >
                                <option value="">Toutes les classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            {/* Date Filter */}
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 px-3">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                                />
                                <span className="text-slate-400">→</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                                />
                                <Calendar size={14} className="text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {chartData.length > 0 ? (
                        <div className="h-[380px] min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ stroke: '#475569', strokeWidth: 1 }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Line type="monotone" name="Présents" dataKey="present" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                    <Line type="monotone" name="Absents" dataKey="absent" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                                    <Line type="monotone" name="Malades" dataKey="malade" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                    <Line type="monotone" name="Total" dataKey="total" stroke="#94a3b8" strokeWidth={2} dot={false} />
                                    <Line type="monotone" name="Garçons" dataKey="garçons" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                    <Line type="monotone" name="Filles" dataKey="filles" stroke="#f472b6" strokeWidth={2} dot={false} />
                                    <Line type="monotone" name="Profs Présents" dataKey="enseignants_present" stroke="#6366f1" strokeWidth={3} dot={{ r: 3, fill: '#6366f1' }} />
                                    <Line type="monotone" name="Profs Absents" dataKey="enseignants_absent" stroke="#ef4444" strokeWidth={2} strokeDasharray="2 2" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-800/40 rounded-xl">
                            <TrendingUp size={40} className="mx-auto text-slate-400 mb-3" />
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Aucune donnée d'assiduité disponible</p>
                        </div>
                    )}

                    {/* Chart Legend Context */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <LegendItem color="bg-emerald-500" label="Présents" />
                        <LegendItem color="bg-red-500" label="Absents" />
                        <LegendItem color="bg-amber-500" label="Malades" />
                        <LegendItem color="bg-blue-500" label="Garçons" />
                        <LegendItem color="bg-pink-400" label="Filles" />
                        <LegendItem color="bg-indigo-500" label="Profs Présents" />
                        <LegendItem color="bg-red-400" label="Profs Absents" />
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Distribution des Élèves</h3>
                    {studentDistribution.length > 0 ? (
                        <div className="h-[280px] flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 w-full h-full min-w-0">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <PieChart>
                                        <Pie
                                            data={studentDistribution}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {studentDistribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                            itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                            labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                            formatter={(val: any, name: any) => [`${val} élèves`, `${name}`]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {studentDistribution.map((item: any) => (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }} />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white ml-auto">{item.value || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/40 rounded-xl">
                            <PieChartIcon size={40} className="mx-auto text-slate-400 mb-3" />
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Aucune donnée de distribution disponible</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions & Shortcut Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Dernières Actions Administratives</h3>
                        <button className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">Voir l'historique</button>
                    </div>
                    <div className="space-y-3">
                        {(stats?.recentActions && stats.recentActions.length > 0) ? stats.recentActions.map((action: any, idx: number) => (
                            <ActionItem
                                key={idx}
                                icon={action.icon === 'UserPlus' ? UserPlus : action.icon === 'Calendar' ? Calendar : Bell}
                                color={action.color || "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"}
                                title={action.title}
                                desc={action.desc}
                                time={action.time}
                            />
                        )) : (
                            <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/40 rounded-xl">
                                <Bell size={36} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Aucune action récente enregistrée</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white rounded-2xl shadow-md flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold mb-6 tracking-tight">Accès Rapide</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickAction icon={Users} label="Profs" to={ROUTES.DASHBOARD.DIRECTION.TEACHERS} />
                            <QuickAction icon={Calendar} label="Planning" to={ROUTES.DASHBOARD.DIRECTION.SCHEDULE} />
                            <QuickAction icon={FileText} label="Bulletins" to="#" />
                            <QuickAction icon={PieChartIcon} label="Stats" to="#" />
                        </div>
                    </div>
                    <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/10">
                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Conseil du jour</p>
                        <p className="text-xs text-white/90 leading-relaxed italic">"Pensez à valider les heures supplémentaires des enseignants avant vendredi soir."</p>
                    </div>
                </div>
            </div>

            <DemographicsModal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
                institutionId={user?.institution?.id}
            />
        </div>
    );
};

const ActionItem = ({ icon: Icon, color, title, desc, time }: any) => (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer border border-transparent">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
            <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">{title}</h5>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{time}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{desc}</p>
        </div>
    </div>
);

const QuickAction = ({ icon: Icon, label, to }: any) => (
    <Link to={to} className="flex flex-col items-center justify-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all group active:scale-95 border border-white/10">
        <div className="w-9 h-9 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Icon size={18} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-50">{label}</span>
    </Link>
);

export default DirectionDashboard;
