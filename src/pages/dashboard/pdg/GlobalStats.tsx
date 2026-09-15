import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../../assets/logo.png';
import {
    Users,
    TrendingUp,
    GraduationCap,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Globe,
    Calendar
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import api from '../../../api/axios';

import { useAuth } from '../../../context/AuthContext';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

const GlobalStats: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = React.useState<any>(null);
    const [month, setMonth] = React.useState<number | ''>('');
    const [academicYears, setAcademicYears] = React.useState<any[]>([]);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchYears = async () => {
            try {
                const ceoId = user?.id;
                const res = await api.get('/academic-years', { params: { ceoId } });
                const years = res.data || [];
                setAcademicYears(years);
                if (years.length > 0) {
                    const active = years.find((y: any) => y.isActive || y.isCurrent) || years[0];
                    setSelectedAcademicYearId(active.id);
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des années académiques", err);
            }
        };
        fetchYears();
    }, [user?.id]);

    React.useEffect(() => {
        const ceoId = user?.id;
        const params: any = {};
        if (month) params.month = month;
        if (ceoId) params.ceoId = ceoId;
        if (selectedAcademicYearId) params.academicYearId = selectedAcademicYearId;

        api.get('/dashboard/global-stats', { params })
            .then(res => setStats(res.data))
            .catch(console.error);
    }, [month, selectedAcademicYearId, user?.id]);

    const exportGlobalStatsToPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');

        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 35, 'F');

        try {
            doc.addImage(logo, 'PNG', 14, 5, 25, 25);
        } catch (e) {
            console.error("Erreur chargement logo", e);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("ACADEMIA CONNECT", 45, 15);
        doc.setFontSize(14);
        doc.text("RAPPORT ANALYTIQUE GLOBAL", 45, 22);

        const selectedYearName = academicYears.find(ay => ay.id === selectedAcademicYearId)?.name || '';
        doc.setFontSize(9);
        doc.text(`Période filtrée : ${month ? `Mois ${month} - ` : ''}${selectedYearName || 'Toutes'}`, 45, 28);
        doc.text(`Généré le: ${new Date().toLocaleString()}`, 150, 28);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("1. Résumé des Indicateurs Clés", 14, 45);
        autoTable(doc, {
            startY: 50,
            head: [['Indicateur', 'Valeur', 'Tendance']],
            body: [
                ['Effectif Total', stats?.totalStudents ?? 0, 'En hausse'],
                ['Croissance Annuelle', stats?.annualGrowth ?? '0%', 'Stable'],
                ['Taux de Rétention', stats?.retentionRate ?? '0%', 'Excellent'],
                ['Personnel Enseignant', stats?.totalTeachers ?? 0, 'Actif'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });

        let finalY = (doc as any).lastAutoTable?.finalY || 100;
        doc.setFontSize(14);
        doc.text("2. Répartition par Niveau (Cycle)", 14, finalY + 15);
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Niveau / Cycle', 'Nombre d\'élèves', 'Pourcentage']],
            body: (stats?.levelDistribution || []).map((lvl: any) => [lvl.name, lvl.value, lvl.percentage]),
            theme: 'grid'
        });

        finalY = (doc as any).lastAutoTable?.finalY || 150;
        doc.setFontSize(14);
        doc.text("3. Top 5 Établissements par Effectif", 14, finalY + 15);
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Nom de l\'Établissement', 'Effectif total']],
            body: (stats?.schoolsDistribution || []).map((sch: any) => [sch.name, sch.value]),
            theme: 'grid'
        });

        doc.save(`Rapport_Global_Evenia_${selectedYearName || 'Stats'}.pdf`);
    };

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analyse de Performance</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Données consolidées de l'ensemble du réseau Academia</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value ? parseInt(e.target.value) : '')}
                            className="px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-transparent outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-r border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Toute l'année</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedAcademicYearId || ''}
                            onChange={(e) => setSelectedAcademicYearId(e.target.value ? Number(e.target.value) : null)}
                            className="px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-transparent outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            {academicYears.map((ay: any) => (
                                <option key={ay.id} value={ay.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {ay.name} {ay.isCurrent || ay.isActive ? '(En cours)' : ay.isClosed ? '(Clôturée)' : ''}
                                </option>
                            ))}
                            {academicYears.length === 0 && (
                                <option value="">Aucune année académique</option>
                            )}
                        </select>
                    </div>
                    <button
                        onClick={exportGlobalStatsToPDF}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all whitespace-nowrap"
                    >
                        <Download size={16} />
                        Exporter Rapport
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Croissance Annuelle"
                    value={stats?.annualGrowth ?? '0%'}
                    trend="up"
                    icon={TrendingUp}
                    color="text-blue-600 dark:text-blue-400"
                    bg="bg-blue-50 dark:bg-blue-950/50"
                />
                <StatCard
                    title="Effectif Total"
                    value={stats?.totalStudents ?? 0}
                    trend="up"
                    icon={Users}
                    color="text-emerald-600 dark:text-emerald-400"
                    bg="bg-emerald-50 dark:bg-emerald-950/50"
                />
                <StatCard
                    title="Enseignants Réseau"
                    value={stats?.totalTeachers ?? 0}
                    trend="up"
                    icon={GraduationCap}
                    color="text-purple-600 dark:text-purple-400"
                    bg="bg-purple-50 dark:bg-purple-950/50"
                />
                <StatCard
                    title="Taux de Rétention"
                    value={stats?.retentionRate ?? '0%'}
                    trend="up"
                    icon={Globe}
                    color="text-amber-600 dark:text-amber-400"
                    bg="bg-amber-50 dark:bg-amber-950/50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Expansion du Réseau</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Évolution des effectifs élèves par année</p>
                        </div>
                    </div>
                    <div className="h-[320px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={stats?.growthChart || []}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                    itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                    labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                    formatter={(val: any) => [`${val} élèves`, 'Effectif']}
                                />
                                <Area type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-4">Répartition par Niveau</h3>
                        <div className="h-[220px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={stats?.levelDistribution || []}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(stats?.levelDistribution || []).map((_: DistributionEntry, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                        itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                        labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                        formatter={(val: any, name: any, item: any) => [
                                            `${val} élèves${item?.payload?.percentage ? ` (${item.payload.percentage})` : ''}`,
                                            `${name}`
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {(stats?.levelDistribution || []).map((entry: DistributionEntry, index: number) => (
                            <DistributionItem
                                key={index}
                                label={entry.name}
                                value={entry.percentage}
                                inlineColor={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Schools Distribution */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-6">Top 5 Établissements (Effectifs)</h3>
                <div className="h-[280px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={stats?.schoolsDistribution || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                formatter={(val: any) => [`${val} élèves`, 'Effectif']}
                            />
                            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gender Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-6 text-center">Répartition des Élèves par Genre</h3>
                    <div className="h-[260px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={stats?.genderDistribution || []}
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1200}
                                >
                                    {(stats?.genderDistribution || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Garçons' ? '#3b82f6' : '#ec4899'} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                    itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                    labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                    formatter={(val: any, name: any) => [`${val} élèves`, `${name}`]}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KPI/Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KPICard title="Taux de réussite" value={stats?.successRate ?? '0%'} detail="Réseau global" color="indigo" />
                    <KPICard title="Matières Total" value={stats?.totalSubjects ?? 0} detail="Actives sur le réseau" color="blue" />
                    <KPICard title="Note Moyenne" value={stats?.averageScore ?? '0/20'} detail="Moyenne globale" color="purple" />
                    <KPICard title="Devoirs Total" value={stats?.totalHomeworks ?? 0} detail="Activités pédagogiques" color="emerald" />
                </div>
            </div>
        </div>
    );
};

interface DistributionEntry {
    name: string;
    value: number;
    percentage: string;
}

const StatCard = ({ title, value, trend, icon: Icon, color, bg }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
            <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend === 'up' ? 'HAUSSE' : 'BAISSE'}
            </div>
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{value}</h4>
        </div>
    </div>
);

const DistributionItem = ({ label, value, inlineColor }: any) => (
    <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: inlineColor }} />
            <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        </div>
        <span className="font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
);

const KPICard = ({ title, value, detail, color }: any) => {
    const colors = {
        indigo: 'from-indigo-600 to-indigo-700',
        blue: 'from-blue-600 to-sky-600',
        purple: 'from-purple-600 to-purple-700',
        emerald: 'from-emerald-600 to-teal-600'
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} p-5 rounded-xl text-white shadow-lg flex flex-col justify-between`}>
            <div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-black">{value}</h3>
            </div>
            <p className="text-white/60 text-[11px] mt-3 font-medium">{detail}</p>
        </div>
    );
};

export default GlobalStats;
