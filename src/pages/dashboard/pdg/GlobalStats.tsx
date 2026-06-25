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
    Globe
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

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

const GlobalStats: React.FC = () => {
    const [stats, setStats] = React.useState<any>(null);
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());

    React.useEffect(() => {
        api.get(`/dashboard/global-stats?month=${month}&year=${year}`).then(res => setStats(res.data)).catch(console.error);
    }, [month, year]);

    const exportGlobalStatsToPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');

        // Header
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 35, 'F');

        // Add Logo
        try {
            doc.addImage(logo, 'PNG', 14, 5, 25, 25);
        } catch (e) {
            console.error("Erreur chargement logo", e);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("NB-MIND SCHOOL", 45, 15);
        doc.setFontSize(14);
        doc.text("RAPPORT ANALYTIQUE GLOBAL", 45, 22);

        doc.setFontSize(9);
        doc.text(`Période filtrée : ${month}/${year}`, 45, 28);
        doc.text(`Généré le: ${new Date().toLocaleString()}`, 150, 28);

        // Summary Stats
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("1. Résumé des Indicateurs Clés", 14, 45);
        autoTable(doc, {
            startY: 50,
            head: [['Indicateur', 'Valeur', 'Tendance']],
            body: [
                ['Effectif Total', stats?.totalStudents || "N/A", 'En hausse'],
                ['Croissance Annuelle', stats?.annualGrowth || "N/A", 'Stable'],
                ['Taux de Rétention', stats?.retentionRate || "N/A", 'Excellent'],
                ['Personnel Enseignant', stats?.totalTeachers || "N/A", 'Actif'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });

        // Distribution by Level
        let finalY = (doc as any).lastAutoTable.finalY || 100;
        doc.setFontSize(14);
        doc.text("2. Répartition par Niveau (Cycle)", 14, finalY + 15);
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Niveau / Cycle', 'Nombre d\'élèves', 'Pourcentage']],
            body: (stats?.levelDistribution || []).map((lvl: any) => [lvl.name, lvl.value, lvl.percentage]),
            theme: 'grid'
        });

        // Top Institutions
        finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.setFontSize(14);
        doc.text("3. Top 5 Établissements par Effectif", 14, finalY + 15);
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Nom de l\'Établissement', 'Effectif total']],
            body: (stats?.schoolsDistribution || []).map((sch: any) => [sch.name, sch.value]),
            theme: 'grid'
        });

        doc.save(`Rapport_Global_Evenia_${month}_${year}.pdf`);
    };
    return (
        <>
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Analyse de Performance</h2>
                    <p className="text-slate-500">Données consolidées de l'ensemble du réseau Academia</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white    shadow-sm overflow-hidden">
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="px-3 py-2 text-sm font-bold text-slate-600 bg-transparent   outline-none hover:bg-slate-50 transition-all"
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="px-3 py-2 text-sm font-bold text-slate-600 bg-transparent outline-none hover:bg-slate-50 transition-all"
                        >
                            {[2023, 2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={exportGlobalStatsToPDF}
                        className="bg-blue-600 text-white px-6 py-2.5  font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                    >
                        <Download size={18} />
                        Exporter Rapport
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Croissance Annuelle"
                    value={stats?.annualGrowth || "..."}
                    trend="up"
                    icon={TrendingUp}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Effectif Total"
                    value={stats?.totalStudents || "..."}
                    trend="up"
                    icon={Users}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Enseignants Réseau"
                    value={stats?.totalTeachers || "..."}
                    trend="up"
                    icon={GraduationCap}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    title="Taux de Rétention"
                    value={stats?.retentionRate || "..."}
                    trend="up"
                    icon={Globe}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white p-8 ] shadow-xl shadow-slate-200/50  ">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Expansion du Réseau</h3>
                            <p className="text-slate-400 text-sm">Évolution des effectifs élèves par année</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={stats?.growthChart || []}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorStudents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-white p-8 ] shadow-xl shadow-slate-200/50  ">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Répartition par Niveau</h3>
                    <div className="h-[250px] w-full mb-8 min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={stats?.levelDistribution || []}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(stats?.levelDistribution || []).map((_: DistributionEntry, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                        {(stats?.levelDistribution || []).map((entry: DistributionEntry, index: number) => (
                            <DistributionItem
                                key={index}
                                label={entry.name}
                                value={entry.percentage}
                                color={`bg-[${COLORS[index % COLORS.length]}]`}
                                inlineColor={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Schools Distribution */}
            <div className="bg-white p-8 ] shadow-xl shadow-slate-200/50   mb-10">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Top 5 Établissements (Effectifs)</h3>
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={stats?.schoolsDistribution || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Gender Distribution */}
                <div className="bg-white p-8 ] shadow-xl shadow-slate-200/50  ">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8 text-center">Répartition des Élèves par Genre</h3>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={stats?.genderDistribution || []}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={10}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {(stats?.genderDistribution || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Garçons' ? '#3b82f6' : '#ec4899'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KPI/Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <KPICard title="Taux de réussite" value={stats?.successRate || "..."} detail="+% calculé sur le réseau" color="indigo" />
                    <KPICard title="Matières Total" value={stats?.totalSubjects || "..."} detail="Actives sur tout le réseau" color="blue" />
                    <KPICard title="Note Moyenne" value={stats?.averageScore || "..."} detail="Moyenne globale réseau" color="purple" />
                    <KPICard title="Devoirs Total" value={stats?.totalHomeworks || "..."} detail="Activités pédagogiques" color="emerald" />
                </div>
            </div>
        </>
    );
};

interface DistributionEntry {
    name: string;
    value: number;
    percentage: string;
}

const StatCard = ({ title, value, trend, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 ] shadow-lg shadow-slate-200/50   group hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-14 h-14 ${bg} ${color}  flex items-center justify-center transition-transform group-hover:rotate-12`}>
                <Icon size={28} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1  ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend === 'up' ? 'HAUSSE' : 'BAISSE'}
            </div>
        </div>
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-black text-slate-800">{value}</h4>
        </div>
    </div>
);

const DistributionItem = ({ label, value, inlineColor }: any) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 " style={{ backgroundColor: inlineColor }}></div>
            <span className="text-sm font-bold text-slate-600">{label}</span>
        </div>
        <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
);

const KPICard = ({ title, value, detail, color }: any) => {
    const colors = {
        indigo: 'bg-indigo-600',
        blue: 'bg-blue-600',
        purple: 'bg-purple-600',
        emerald: 'bg-emerald-600'
    };
    return (
        <div className={`${colors[color as keyof typeof colors]} p-8 ] text-white shadow-xl shadow-slate-200/50 flex flex-col justify-between`}>
            <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
                <h3 className="text-3xl font-black mb-2">{value}</h3>
            </div>
            <p className="text-white/40 text-xs mt-4">{detail}</p>
        </div>
    );
};

export default GlobalStats;
