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
        blue: 'bg-blue-50 text-blue-600 shadow-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 shadow-emerald-100',
        indigo: 'bg-indigo-50 text-indigo-600 shadow-indigo-100',
        purple: 'bg-purple-50 text-purple-600 shadow-purple-100',
        pink: 'bg-pink-50 text-pink-600 shadow-pink-100',
        amber: 'bg-amber-50 text-amber-600 shadow-amber-100'
    };

    return (
        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-100 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center gap-6">
                <div className={`w-16 h-16 ${colors[color] || colors.blue} rounded-[24px] flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform shadow-inner`}>
                    {icon}
                </div>
                <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{label}</p>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</h4>
                </div>
            </div>
        </div>
    );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
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
            api.get(`/classes?institutionId=${user.institution.id}`).then(res => setClasses(res.data));
        }
    }, [user?.institution?.id]);


    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-9 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const demoAttendanceHistory = [
        { name: 'Lun', present: 850, absent: 50, malade: 20, total: 1000, garçons: 520, filles: 480, enseignants_present: 45, enseignants_absent: 2 },
        { name: 'Mar', present: 880, absent: 40, malade: 15, total: 1000, garçons: 520, filles: 480, enseignants_present: 46, enseignants_absent: 1 },
        { name: 'Mer', present: 920, absent: 20, malade: 10, total: 1000, garçons: 520, filles: 480, enseignants_present: 47, enseignants_absent: 0 },
        { name: 'Jeu', present: 890, absent: 35, malade: 18, total: 1000, garçons: 520, filles: 480, enseignants_present: 44, enseignants_absent: 3 },
        { name: 'Ven', present: 950, absent: 10, malade: 5, total: 1000, garçons: 520, filles: 480, enseignants_present: 47, enseignants_absent: 0 },
    ];

    const chartData = stats?.attendanceHistory || demoAttendanceHistory;

    const studentDistribution = stats?.studentDistribution || [
        { name: 'Primaire', value: 400, color: '#3b82f6' },
        { name: 'Collège', value: 300, color: '#6366f1' },
        { name: 'Lycée', value: 300, color: '#a855f7' },
    ];

    const isProviseur = user?.role === 'PROVISORIAT';

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {isProviseur ? `Bienvenue, M. le Proviseur` : "Vue d'ensemble"}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {isProviseur
                            ? "Suivi pédagogique et administratif de vos cycles."
                            : "Statistiques et indicateurs de performance de l'établissement."}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsDemoModalOpen(true)}
                        className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Users size={18} /> Rapport
                    </button>
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-extrabold flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all">
                        <Download size={18} /> Exporter
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                <StatCard
                    icon={<Users size={28} />}
                    label="Effectif Total"
                    value={`${stats?.totalStudents ?? 1250} Élèves`}
                    color="blue"
                />
                <StatCard
                    icon={<Clock size={28} />}
                    label="Enseignants"
                    value={stats?.totalTeachers ?? 48}
                    color="emerald"
                />
                <StatCard
                    icon={<FileText size={28} />}
                    label="Classes"
                    value={stats?.totalClasses ?? 24}
                    color="indigo"
                />
                <StatCard
                    icon={<Layers size={28} />}
                    label="Cycles"
                    value={stats?.totalCycles ?? 3}
                    color="purple"
                />
                <StatCard
                    icon={<BookOpen size={28} />}
                    label="Matières"
                    value={stats?.totalSubjects ?? 12}
                    color="pink"
                />
                <StatCard
                    icon={<TrendingUp size={28} />}
                    label="Moyenne Gén."
                    value={`${stats?.averageGPA ?? 14.5}/20`}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-10">
                {/* Attendance & Performance Chart */}
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Analyse de l'Assiduité & Effectifs</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Données simulées par catégorie et période.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Class Filter */}
                            <div className="relative">
                                <select
                                    value={selectedClasse}
                                    onChange={(e) => setSelectedClasse(e.target.value)}
                                    className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Toutes les classes</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Date Filter */}
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent border-none text-[10px] font-black text-slate-600 outline-none px-2 cursor-pointer"
                                />
                                <span className="text-slate-300">→</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent border-none text-[10px] font-black text-slate-600 outline-none px-2 cursor-pointer"
                                />
                                <Calendar size={14} className="text-slate-400 mr-2" />
                            </div>
                        </div>
                    </div>
                    <div className="h-[450px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 900 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 900 }} />
                                <Tooltip
                                    cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                                    contentStyle={{ borderRadius: '28px', border: 'none', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.18)', padding: '24px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '14px', padding: '6px 0' }}
                                />
                                <Line type="monotone" name="Présents" dataKey="present" stroke="#10b981" strokeWidth={5} dot={{ r: 5, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 9 }} />
                                <Line type="monotone" name="Absents" dataKey="absent" stroke="#ef4444" strokeWidth={3} strokeDasharray="6 6" dot={false} />
                                <Line type="monotone" name="Malades" dataKey="malade" stroke="#f59e0b" strokeWidth={3} dot={false} />
                                <Line type="monotone" name="Total" dataKey="total" stroke="#94a3b8" strokeWidth={2} dot={false} />
                                <Line type="monotone" name="Garçons" dataKey="garçons" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                <Line type="monotone" name="Filles" dataKey="filles" stroke="#f472b6" strokeWidth={3} dot={false} />
                                <Line type="monotone" name="Profs Présents" dataKey="enseignants_present" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} />
                                <Line type="monotone" name="Profs Absents" dataKey="enseignants_absent" stroke="#ef4444" strokeWidth={2} strokeDasharray="2 2" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chart Legend Context */}
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-8 pt-8 border-t border-slate-50">
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
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Distribution des Élèves</h3>
                    <div className="h-[300px] flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 w-full h-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={studentDistribution}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {studentDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                            {studentDistribution.map((item: any) => (
                                <div key={item.name} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                                    <span className="text-sm font-black text-slate-900 ml-auto">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Practical Section: Staff & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[40px] shadow-xl border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800">Dernières Actions Administratives</h3>
                        <button className="text-blue-600 text-sm font-bold hover:underline">Voir l'historique</button>
                    </div>
                    <div className="space-y-6">
                        {(stats?.recentActions && stats.recentActions.length > 0) ? stats.recentActions.map((action: any, idx: number) => (
                            <ActionItem
                                key={idx}
                                icon={action.icon === 'UserPlus' ? UserPlus : action.icon === 'Calendar' ? Calendar : Bell}
                                color={action.color || "bg-blue-50 text-blue-600"}
                                title={action.title}
                                desc={action.desc}
                                time={action.time}
                            />
                        )) : (
                            <>
                                <ActionItem
                                    icon={UserPlus}
                                    color="bg-blue-50 text-blue-600"
                                    title="Nouvelle Inscription"
                                    desc="Admission validée pour Sarah Kone (6ème B)."
                                    time="15 min"
                                />
                                <ActionItem
                                    icon={Calendar}
                                    color="bg-purple-50 text-purple-600"
                                    title="Modification Emploi du Temps"
                                    desc="M. Traoré (Maths) a décalé son cours de vendredi."
                                    time="1h 20m"
                                />
                                <ActionItem
                                    icon={Bell}
                                    color="bg-amber-50 text-amber-600"
                                    title="Alerte Parent"
                                    desc="Signalement d'absence prolongée envoyé aux parents de Marc Yao."
                                    time="Il y a 3h"
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] p-8 text-white shadow-2xl">
                    <h3 className="text-xl font-black mb-8 tracking-tight">Accès Rapide</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAction icon={Users} label="Profs" to={ROUTES.DASHBOARD.DIRECTION.TEACHERS} />
                        <QuickAction icon={Calendar} label="Planning" to={ROUTES.DASHBOARD.DIRECTION.SCHEDULE} />
                        <QuickAction icon={FileText} label="Bulletins" to="#" />
                        <QuickAction icon={PieChartIcon} label="Stats" to="#" />
                    </div>
                    <div className="mt-12 p-6 bg-white/10 rounded-3xl border border-white/10">
                        <p className="text-xs font-black text-blue-200 uppercase tracking-widest mb-2">Conseil du jour</p>
                        <p className="text-sm text-white/80 leading-relaxed italic">"Pensez à valider les heures supplémentaires des enseignants avant vendredi soir."</p>
                    </div>
                </div>
            </div>

            <DemographicsModal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
                institutionId={user?.institution?.id}
            />
        </>
    );
};

const ActionItem = ({ icon: Icon, color, title, desc, time }: any) => (
    <div className="flex gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
            <Icon size={22} />
        </div>
        <div>
            <div className="flex items-center justify-between mb-1">
                <h5 className="font-bold text-slate-900">{title}</h5>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
            </div>
            <p className="text-sm text-slate-500 line-clamp-1">{desc}</p>
        </div>
    </div>
);

const QuickAction = ({ icon: Icon, label, to }: any) => (
    <Link to={to} className="flex flex-col items-center justify-center gap-3 p-6 bg-white/10 hover:bg-white/20 border border-white/5 rounded-[32px] transition-all group active:scale-95">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-700 shadow-xl group-hover:rotate-6 transition-transform">
            <Icon size={20} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-blue-50">{label}</span>
    </Link>
);

export default DirectionDashboard;
