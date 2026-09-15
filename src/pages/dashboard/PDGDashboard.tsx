import React from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/logo.png';
import {
    Users,
    TrendingUp,
    School,
    Search,
    Download,
    LayoutDashboard,
    Layers
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

// Theme-Adaptive Chart Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl z-50">
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">{label}</p>
                {payload.map((item: any, idx: number) => (
                    <p key={idx} className="text-xs font-semibold flex items-center gap-2" style={{ color: item.fill || item.color || '#2563eb' }}>
                        <span>{item.name || 'Valeur'} :</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                            {typeof item.value === 'number' ? (Number.isInteger(item.value) ? item.value : item.value.toFixed(1)) : item.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const PDGDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = React.useState<any>(null);
    const [growthData, setGrowthData] = React.useState<any[]>([]);
    const [alerts, setAlerts] = React.useState<any[]>([]);
    const [groupBy, setGroupBy] = React.useState('MONTH');
    const [schoolsPerf, setSchoolsPerf] = React.useState<any[]>([]);

    const [institutions, setInstitutions] = React.useState<any[]>([]);
    const [cycles, setCycles] = React.useState<any[]>([]);
    const [classes, setClasses] = React.useState<any[]>([]);
    const [filter, setFilter] = React.useState({
        instId: '',
        cycleId: '',
        classeId: '',
        year: '2025-2026'
    });
    const [successStats, setSuccessStats] = React.useState<any>(null);

    React.useEffect(() => {
        if (!user?.id) return;
        const params = new URLSearchParams();
        params.append('ceoId', user.id.toString());
        const qs = `?${params.toString()}`;

        api.get(`/dashboard/overview${qs}`).then(res => setOverview(res.data)).catch(console.error);
        api.get(`/dashboard/schools-performance${qs}`).then(res => setSchoolsPerf(res.data || [])).catch(console.error);
        api.get(`/institutions${qs}`).then(res => setInstitutions(res.data || [])).catch(console.error);
        api.get(`/dashboard/alerts?userId=${user.id}`).then(res => setAlerts(res.data || [])).catch(console.error);
    }, [user?.id]);

    React.useEffect(() => {
        if (filter.instId) {
            api.get(`/cycles?institutionId=${filter.instId}`).then(res => setCycles(res.data || [])).catch(console.error);
            api.get(`/classes?institutionId=${filter.instId}&cycleId=${filter.cycleId}`).then(res => setClasses(res.data || [])).catch(console.error);
        } else {
            setCycles([]);
            setClasses([]);
        }
    }, [filter.instId, filter.cycleId]);

    React.useEffect(() => {
        const fetchSuccess = async () => {
            try {
                const params = new URLSearchParams();
                if (user?.id) params.append('ceoId', user.id.toString());
                if (filter.instId) params.append('institutionId', filter.instId);
                if (filter.cycleId) params.append('cycleId', filter.cycleId);
                if (filter.classeId) params.append('classeId', filter.classeId);
                if (filter.year) params.append('year', filter.year);

                const res = await api.get(`/dashboard/success-stats?${params.toString()}`);
                setSuccessStats(res.data);
            } catch (err) {
                console.error("Erreur stats:", err);
                setSuccessStats(null);
            }
        };
        fetchSuccess();
    }, [filter, user?.id]);

    React.useEffect(() => {
        if (!user?.id) return;
        const params = new URLSearchParams();
        params.append('ceoId', user.id.toString());
        params.append('groupBy', groupBy);

        api.get(`/dashboard/growth?${params.toString()}`).then(res => setGrowthData(res.data || [])).catch(console.error);
    }, [groupBy, user?.id]);

    const exportToPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');

        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 297, 40, 'F');

        try {
            doc.addImage(logo, 'PNG', 14, 5, 30, 30);
        } catch (e) {
            console.error(e);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("ACADEMIA CONNECT - RÉSEAU", 50, 20);

        doc.setFontSize(10);
        doc.text(`Rapport de Performance Généré le: ${new Date().toLocaleString()}`, 50, 30);
        doc.text(`Nombre d'écoles: ${schoolsPerf.length}`, 240, 30);

        const tableData = schoolsPerf.map(school => [
            school.name,
            school.dir,
            school.students ?? 0,
            school.teachers ?? 0,
            school.classes ?? 0,
            school.cycles ?? 0,
            school.attendance ?? '0%',
            school.status === 'good' ? 'Optimale' : school.status === 'warning' ? 'À Surveiller' : 'Stable'
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Établissement', 'Responsable', 'Élèves', 'Profs', 'Classes', 'Cycles', 'Présence', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 50 }
        });

        doc.save(`Rapport_Performance_Evenia_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Calculate dynamic distribution data for success stats
    const distributionChartData = successStats?.distribution && successStats.distribution.length > 0
        ? successStats.distribution
        : [
            { name: 'Admis (≥10)', value: successStats?.passingCount || 0, color: '#2563eb' },
            { name: 'Échec (<10)', value: Math.max(0, (successStats?.totalGrades || 0) - (successStats?.passingCount || 0)), color: '#f43f5e' }
        ];

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                    title="Total Établissements"
                    value={overview?.totalSchools ?? 0}
                    trend="Actif"
                    icon={School}
                    color="text-blue-600 dark:text-blue-400"
                    bg="bg-blue-50 dark:bg-blue-950/40"
                />
                <StatCard
                    title="Total Élèves"
                    value={overview?.totalStudents ?? 0}
                    trend="Actif"
                    icon={Users}
                    color="text-emerald-600 dark:text-emerald-400"
                    bg="bg-emerald-50 dark:bg-emerald-950/40"
                />
                <StatCard
                    title="Enseignants"
                    value={overview?.totalTeachers ?? 0}
                    trend="Actif"
                    icon={School}
                    color="text-amber-600 dark:text-amber-400"
                    bg="bg-amber-50 dark:bg-amber-950/40"
                />
                <StatCard
                    title="Cycles"
                    value={overview?.totalCycles ?? 0}
                    trend="Actif"
                    icon={Layers}
                    color="text-purple-600 dark:text-purple-400"
                    bg="bg-purple-50 dark:bg-purple-950/40"
                />
                <StatCard
                    title="Classes"
                    value={overview?.totalClasses ?? 0}
                    trend="Actif"
                    icon={LayoutDashboard}
                    color="text-pink-600 dark:text-pink-400"
                    bg="bg-pink-50 dark:bg-pink-950/40"
                />
                <StatCard
                    title="Matières"
                    value={overview?.totalSubjects ?? 0}
                    trend="Actif"
                    icon={TrendingUp}
                    color="text-indigo-600 dark:text-indigo-400"
                    bg="bg-indigo-50 dark:bg-indigo-950/40"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Growth Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Croissance du Réseau</h3>
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl cursor-pointer outline-none transition-colors"
                        >
                            <option value="MONTH" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">Par Mois</option>
                            <option value="YEAR" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">Par Année</option>
                        </select>
                    </div>

                    <div className="h-[320px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area type="monotone" dataKey="students" name="Élèves" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Critical Alerts */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Alertes Critiques</h3>
                        <div className="space-y-4">
                            {alerts.length > 0 ? alerts.map((alert, idx) => (
                                <AlertItem
                                    key={idx}
                                    title={alert.title}
                                    desc={alert.desc}
                                    time={alert.time}
                                    type={alert.type}
                                    onClick={() => navigate(alert.type === 'urgent' ? ROUTES.DASHBOARD.PDG.MESSAGES : ROUTES.DASHBOARD.PDG.NOTIFICATIONS)}
                                />
                            )) : (
                                <p className="text-slate-500 dark:text-slate-400 text-xs italic">Aucune alerte récente</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD.PDG.MESSAGES)}
                        className="w-full mt-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-2.5 rounded-xl font-bold transition-all text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                        Voir tout le journal
                    </button>
                </div>
            </div>

            {/* Success Statistics Section */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
                            Statistiques Complètes de Réussite
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Analyse approfondie des performances académiques à travers le réseau</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full xl:w-auto">
                        <select
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition-colors"
                            value={filter.year}
                            onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                        >
                            <option value="2025-2026" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">2025-2026</option>
                            <option value="2024-2025" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">2024-2025</option>
                        </select>
                        <select
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition-colors"
                            value={filter.instId}
                            onChange={(e) => setFilter({ ...filter, instId: e.target.value, cycleId: '', classeId: '' })}
                        >
                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">Toutes les Écoles</option>
                            {institutions.map(i => <option key={i.id} value={i.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">{i.name}</option>)}
                        </select>
                        <select
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition-colors"
                            value={filter.cycleId}
                            onChange={(e) => setFilter({ ...filter, cycleId: e.target.value, classeId: '' })}
                        >
                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">Tous les Cycles</option>
                            {cycles.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">{c.name}</option>)}
                        </select>
                        <select
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition-colors"
                            value={filter.classeId}
                            onChange={(e) => setFilter({ ...filter, classeId: e.target.value })}
                        >
                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">Toutes les Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-md">
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-1">Moyenne Générale</p>
                        <h3 className="text-2xl font-black">{(Number(successStats?.average) || 0).toFixed(2)}/20</h3>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (successStats?.average || 0) * 5)}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Meilleure Moyenne</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{(Number(successStats?.highestAverage) || 0).toFixed(2)}/20</h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Performance d'Excellence</p>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Taux de Réussite Global</p>
                        <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">{(Number(successStats?.successRate) || 0).toFixed(1)}%</h3>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1">{successStats?.passingCount || 0} / {successStats?.totalGrades || 0} évaluations réussies</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-50/80 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800/90 p-5 rounded-xl border border-slate-200/80 hover:border-blue-300/80 dark:border-slate-700/80 dark:hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase tracking-wider transition-colors">Répartitions de Réussite</h4>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-700 px-2 py-0.5 rounded-md shadow-xs transition-colors">
                                Données Réelles ({successStats?.totalGrades || 0} notes)
                            </span>
                        </div>
                        <div className="h-[230px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={distributionChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                    <Bar dataKey="value" name="Effectif" radius={[6, 6, 0, 0]} barSize={36}>
                                        {distributionChartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || (index === 0 ? '#2563eb' : '#f43f5e')} className="cursor-pointer hover:opacity-80 transition-opacity" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800/90 p-5 rounded-xl border border-slate-200/80 hover:border-blue-300/80 dark:border-slate-700/80 dark:hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all duration-300 group">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 uppercase tracking-wider transition-colors mb-4">Évolution des Moyennes par Trimestre</h4>
                        <div className="h-[230px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <LineChart data={successStats?.trimesterData || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Line type="monotone" dataKey="value" name="Moyenne/20" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, stroke: '#6366f1', strokeWidth: 3, fill: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Performance par Établissement</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Vue d'ensemble de la performance des écoles du réseau</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToPDF}
                            className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Exporter en PDF"
                        >
                            <Download size={18} />
                        </button>
                        <button
                            onClick={() => navigate(ROUTES.DASHBOARD.PDG.STATS)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
                        >
                            <Search size={14} /> Rapport détaillé rapide
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-3.5 whitespace-nowrap border-b border-slate-100 dark:border-slate-800">Établissement</th>
                                <th className="px-6 py-3.5 whitespace-nowrap border-b border-slate-100 dark:border-slate-800">Directeur/Proviseur</th>
                                <th className="px-6 py-3.5 whitespace-nowrap border-b border-slate-100 dark:border-slate-800">Effectif</th>
                                <th className="px-6 py-3.5 whitespace-nowrap border-b border-slate-100 dark:border-slate-800">Présence</th>
                                <th className="px-6 py-3.5 whitespace-nowrap border-b border-slate-100 dark:border-slate-800">Performance</th>
                                <th className="px-6 py-3.5 whitespace-nowrap text-center border-b border-slate-100 dark:border-slate-800">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {schoolsPerf.length > 0 ? schoolsPerf.map((school, idx) => (
                                <SchoolRow
                                    key={idx}
                                    name={school.name}
                                    dir={school.dir}
                                    students={school.students ?? 0}
                                    attendance={school.attendance ?? '0%'}
                                    progress={school.progress ?? 0}
                                    status={school.status}
                                />
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-semibold">
                                        Aucun établissement trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, trend, icon: Icon, color, bg }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon size={20} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {trend}
            </div>
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{title}</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">{value}</h4>
        </div>
    </div>
);

const AlertItem = ({ title, desc, time, type, onClick }: any) => {
    const colors = {
        urgent: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };
    return (
        <div
            onClick={onClick}
            className="flex gap-3 group cursor-pointer hover:translate-x-1 transition-all"
        >
            <div className="relative shrink-0">
                <div className={`w-2.5 h-2.5 ${colors[type as keyof typeof colors]} rounded-full mt-1`} />
            </div>
            <div className="flex-1 min-w-0">
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-200 mb-0.5 truncate">{title}</h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mb-1 line-clamp-2">{desc}</p>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">{time}</span>
            </div>
        </div>
    );
};

const SchoolRow = ({ name, dir, students, attendance, progress, status }: any) => (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
            <p className="font-bold text-slate-900 dark:text-white text-xs">{name}</p>
        </td>
        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{dir || 'Non assigné'}</td>
        <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{students}</td>
        <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">{attendance}</td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2 min-w-[120px]">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${progress > 90 ? 'bg-emerald-500' : progress > 80 ? 'bg-blue-500' : 'bg-amber-500'} rounded-full`} style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{progress}%</span>
            </div>
        </td>
        <td className="px-6 py-4 text-center whitespace-nowrap">
            <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full ${status === 'good' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : status === 'warning' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {status === 'good' ? 'Optimale' : status === 'warning' ? 'À Surveiller' : 'Stable'}
            </span>
        </td>
    </tr>
);

export default PDGDashboard;
