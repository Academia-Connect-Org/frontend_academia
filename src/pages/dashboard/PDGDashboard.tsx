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



const PDGDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = React.useState<any>(null);
    const [growthData, setGrowthData] = React.useState<any[]>([]);
    const [alerts, setAlerts] = React.useState<any[]>([]);
    const [groupBy, setGroupBy] = React.useState('MONTH');
    const [schoolsPerf, setSchoolsPerf] = React.useState<any[]>([]);

    // Stats dynamic filters
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
        api.get('/dashboard/overview').then(res => setOverview(res.data)).catch(console.error);
        api.get('/dashboard/schools-performance').then(res => setSchoolsPerf(res.data)).catch(console.error);
        api.get('/institutions').then(res => setInstitutions(res.data)).catch(console.error);
        
        if (user?.id) {
            api.get(`/dashboard/alerts?userId=${user.id}`).then(res => setAlerts(res.data)).catch(console.error);
        }
    }, [user?.id]);

    React.useEffect(() => {
        api.get(`/cycles?institutionId=${filter.instId}`).then(res => setCycles(res.data)).catch(console.error);
        api.get(`/classes?institutionId=${filter.instId}&cycleId=${filter.cycleId}`).then(res => setClasses(res.data)).catch(console.error);
    }, [filter.instId, filter.cycleId]);

    React.useEffect(() => {
        const fetchSuccess = async () => {
            try {
                const params = new URLSearchParams();
                if (filter.instId) params.append('institutionId', filter.instId);
                if (filter.cycleId) params.append('cycleId', filter.cycleId);
                if (filter.classeId) params.append('classeId', filter.classeId);
                if (filter.year) params.append('year', filter.year);
                
                const res = await api.get(`/dashboard/success-stats?${params.toString()}`);
                setSuccessStats(res.data);
            } catch (err) {
                console.error("Erreur stats:", err);
            }
        };
        fetchSuccess();
    }, [filter]);

    React.useEffect(() => {
        api.get(`/dashboard/growth?groupBy=${groupBy}`).then(res => setGrowthData(res.data)).catch(console.error);
    }, [groupBy]);

    const exportToPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');

        // Header
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 297, 40, 'F');

        // Add logo
        try {
            doc.addImage(logo, 'PNG', 14, 5, 30, 30);
        } catch (e) {
            console.error(e);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("NB-MIND SCHOOL - RÉSEAU", 50, 20);

        doc.setFontSize(10);
        doc.text(`Rapport de Performance Généré le: ${new Date().toLocaleString()}`, 50, 30);
        doc.text(`Nombre d'écoles: ${schoolsPerf.length}`, 240, 30);

        const tableData = schoolsPerf.map(school => [
            school.name,
            school.dir,
            school.students,
            school.teachers,
            school.classes,
            school.cycles,
            school.attendance,
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

    return (
        <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
                <StatCard
                    title="Total Instituts"
                    value={overview?.totalSchools || "..."}
                    trend="Actif"
                    icon={School}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Total Élèves"
                    value={overview?.totalStudents || "..."}
                    trend="Actif"
                    icon={Users}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Enseignants"
                    value={overview?.totalTeachers || "..."}
                    trend="Actif"
                    icon={School}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <StatCard
                    title="Cycles"
                    value={overview?.totalCycles || "..."}
                    trend="Actif"
                    icon={Layers}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    title="Classes"
                    value={overview?.totalClasses || "..."}
                    trend="Actif"
                    icon={LayoutDashboard}
                    color="text-pink-600"
                    bg="bg-pink-50"
                />
                <StatCard
                    title="Matières"
                    value={overview?.totalSubjects || "..."}
                    trend="Actif"
                    icon={TrendingUp}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Main Sales Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Croissance du Réseau</h3>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-2">
                            <select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                                className="bg-white text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border-none shadow-sm focus:ring-0 cursor-pointer"
                            >
                                <option value="MONTH">Par Mois</option>
                                <option value="YEAR">Par Année</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-[350px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Quick Actions / Notifications */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <h3 className="text-xl font-black mb-8 relative z-10 tracking-tight">Alertes Critiques</h3>
                    <div className="space-y-6 relative z-10">
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
                            <p className="text-white/30 text-sm italic">Aucune alerte récente</p>
                        )}
                    </div>

                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD.PDG.MESSAGES)}
                        className="w-full mt-12 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold transition-all border border-white/10 text-sm"
                    >
                        Voir tout le journal
                    </button>
                </div>
            </div>

            {/* Success Statistics Section */}
            <div className="mb-10">
                <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-10 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <TrendingUp className="text-blue-600" size={28} />
                                Statistiques Complètes de Réussite
                            </h2>
                            <p className="text-slate-400 font-medium text-sm mt-1">Analyse approfondie des performances académiques à travers le réseau</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto">
                            <select 
                                className="bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20"
                                value={filter.year}
                                onChange={(e) => setFilter({...filter, year: e.target.value})}
                            >
                                <option value="2025-2026">2025-2026</option>
                                <option value="2024-2025">2024-2025</option>
                            </select>
                            <select 
                                className="bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20"
                                value={filter.instId}
                                onChange={(e) => setFilter({...filter, instId: e.target.value, cycleId: '', classeId: ''})}
                            >
                                <option value="">Toutes les Écoles</option>
                                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            <select 
                                className="bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20"
                                value={filter.cycleId}
                                onChange={(e) => setFilter({...filter, cycleId: e.target.value, classeId: ''})}
                            >
                                <option value="">Tous les Cycles</option>
                                {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select 
                                className="bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20"
                                value={filter.classeId}
                                onChange={(e) => setFilter({...filter, classeId: e.target.value})}
                            >
                                <option value="">Toutes les Classes</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
                        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-xl shadow-blue-500/20">
                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Moyenne Générale</p>
                            <h3 className="text-3xl font-black">{(Number(successStats?.average) || 0).toFixed(2)}/20</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full" style={{ width: `${(successStats?.average || 0) * 5}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-lg shadow-slate-200/50">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Meilleure Moyenne</p>
                            <h3 className="text-3xl font-black text-emerald-600">{(Number(successStats?.highestAverage) || 0).toFixed(2)}/20</h3>
                            <p className="text-[10px] text-emerald-500 font-bold mt-2">Performance d'Excellence</p>
                        </div>
                        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-lg shadow-slate-200/50">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Taux de Réussite</p>
                            <h3 className="text-3xl font-black text-blue-600">{(Number(successStats?.successRate) || 0).toFixed(1)}%</h3>
                            <p className="text-[10px] text-blue-400 font-bold mt-2">{successStats?.passingCount || 0} élèves admis</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                        {/* Histogram: Success Rate */}
                        <div className="bg-slate-50 p-6 rounded-[32px]">
                            <h4 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">Répartitions de Réussite (%)</h4>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Admis', value: successStats?.successRate || 0 },
                                        { name: 'Échec', value: 100 - (successStats?.successRate || 0) }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                                            <Cell fill="#2563eb" />
                                            <Cell fill="#f43f5e" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Curve: Evolution */}
                        <div className="bg-slate-50 p-6 rounded-[32px]">
                            <h4 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">Évolution des Moyennes</h4>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={successStats?.trimesterData || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Table or Schools list */}
            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Performance par Établissement</h3>
                        <p className="text-slate-400 text-sm">Vue d'ensemble de la performance des écoles du réseau</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={exportToPDF}
                            className="p-2.5 text-slate-400 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                            title="Exporter en PDF"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={() => navigate(ROUTES.DASHBOARD.PDG.STATS)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all"
                        >
                            <Search size={16} /> Rapport détaillé
                        </button>
                    </div>
                </div>
                <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 py-4">Établissement</th>
                                <th className="px-6 py-4">Directeur</th>
                                <th className="px-6 py-4">Effectif</th>
                                <th className="px-6 py-4">Taux de Présence</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {schoolsPerf.length > 0 ? schoolsPerf.map((school, idx) => (
                                <SchoolRow
                                    key={idx}
                                    name={school.name}
                                    dir={school.dir}
                                    students={school.students}
                                    attendance={school.attendance}
                                    progress={school.progress}
                                    status={school.status}
                                />
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                                        Aucun établissement trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

// Subcomponents
const StatCard = ({ title, value, trend, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-[28px] shadow-lg shadow-slate-200/50 border border-slate-100 group hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                <Icon size={28} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {trend.startsWith('+') ? <TrendingUp size={12} /> : null}
                {trend}
            </div>
        </div>
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-black text-slate-800">{value}</h4>
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
            className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-all"
        >
            <div className="relative">
                <div className={`w-3 h-3 ${colors[type as keyof typeof colors]} rounded-full mt-1.5 shadow-[0_0_10px_rgba(239,68,68,0.5)]`}></div>
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/5 group-last:hidden"></div>
            </div>
            <div>
                <h5 className="font-bold text-sm text-blue-100 mb-1">{title}</h5>
                <p className="text-xs text-white/40 leading-relaxed mb-1">{desc}</p>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{time}</span>
            </div>
        </div>
    );
};

const SchoolRow = ({ name, dir, students, attendance, progress, status }: any) => (
    <tr className="hover:bg-slate-50/50 transition-all group">
        <td className="px-6 py-5">
            <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{name}</p>
        </td>
        <td className="px-6 py-5 text-sm font-medium text-slate-500">{dir}</td>
        <td className="px-6 py-5 text-sm font-bold text-slate-700">{students}</td>
        <td className="px-6 py-5 text-sm font-bold text-slate-900">{attendance}</td>
        <td className="px-6 py-5">
            <div className="flex items-center gap-3">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                    <div className={`h-full ${progress > 90 ? 'bg-emerald-500' : progress > 80 ? 'bg-blue-500' : 'bg-amber-500'} rounded-full`} style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-xs font-black text-slate-400">{progress}%</span>
            </div>
        </td>
        <td className="px-6 py-5 text-center">
            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest 
                ${status === 'good' ? 'bg-emerald-50 text-emerald-600' : status === 'warning' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                {status === 'good' ? 'Optimale' : status === 'warning' ? 'À Surveiller' : 'Stable'}
            </span>
        </td>
    </tr>
);

export default PDGDashboard;
