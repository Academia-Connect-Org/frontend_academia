import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Building2, Users, DollarSign, AlertCircle } from 'lucide-react';

const Finances = () => {
    const { user } = useAuth();
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [revenuePeriod, setRevenuePeriod] = useState<'dailyRevenues' | 'weeklyRevenues' | 'monthlyRevenues' | 'yearlyRevenues'>('monthlyRevenues');

    useEffect(() => {
        const fetchInstitutions = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/institutions/ceo/${user.id}`);
                setInstitutions(res.data || []);
                if (res.data && res.data.length > 0) {
                    setSelectedInstitutionId(String(res.data[0].id));
                }
            } catch (err) {
                console.error("Error fetching institutions", err);
            }
        };
        fetchInstitutions();
    }, [user?.id]);

    const monthNames = {
        "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr", "05": "Mai", "06": "Juin",
        "07": "Juil", "08": "Août", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc"
    };

    const formatPeriod = (periodKey: any) => {
        if (!periodKey || typeof periodKey !== 'string') return "";
        const parts = periodKey.split("-");
        if (parts.length === 2) {
            return `${monthNames[parts[1] as keyof typeof monthNames] || parts[1]} ${parts[0]}`;
        }
        return periodKey;
    };

    const COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

    useEffect(() => {
        const fetchStats = async () => {
            if (!selectedInstitutionId) return;
            setLoading(true);
            try {
                const res = await api.get(`/dashboard/pdg-finances?institutionId=${selectedInstitutionId}`);
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching finance stats", err);
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedInstitutionId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount || 0);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Finances & Analyses</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Analysez les revenus et paiements de vos écoles</p>
                </div>
                
                {/* School Selector */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm">
                    <Building2 className="text-slate-400 ml-2 shrink-0" size={18} />
                    <select
                        className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 py-2 pr-6 cursor-pointer outline-none"
                        value={selectedInstitutionId}
                        onChange={(e) => setSelectedInstitutionId(e.target.value)}
                    >
                        <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Sélectionner une école</option>
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{inst.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-16">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!loading && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-600 relative overflow-hidden group">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl absolute -right-3 -top-3 rotate-12 flex items-center justify-center opacity-60 group-hover:scale-110 transition-transform">
                                <DollarSign size={32} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 relative z-10">Revenus Encaissés</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
                                {formatCurrency(stats?.totalRevenue ?? 0)}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-600 relative overflow-hidden group">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl absolute -right-3 -top-3 rotate-12 flex items-center justify-center opacity-60 group-hover:scale-110 transition-transform">
                                <Users size={32} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 relative z-10">Élèves Inscrits</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
                                {stats?.totalStudents ?? 0}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm border-l-4 border-l-red-600 relative overflow-hidden group">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl absolute -right-3 -top-3 rotate-12 flex items-center justify-center opacity-60 group-hover:scale-110 transition-transform">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 relative z-10">Paiements en Retard</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
                                {stats?.totalOverduePayments ?? 0}
                            </h3>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-6">Analyse des Paiements par Tranche</h3>
                        
                        {stats?.tranchesStats && stats.tranchesStats.length > 0 ? (
                            <div className="h-80 w-full min-w-0">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={stats.tranchesStats} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                        <XAxis 
                                            dataKey="feeTypeName" 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '15px' }} />
                                        <Bar dataKey="paidCount" name="Payés" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                        <Bar dataKey="unpaidCount" name="Non Payés" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-56 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <p className="text-xs text-slate-400 font-semibold">Aucune donnée de tranche trouvée pour cette école.</p>
                            </div>
                        )}
                    </div>

                    {/* Additional Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Revenue Chart */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Évolution des Recettes (Flux de Trésorerie)</h3>
                                <select 
                                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl cursor-pointer outline-none"
                                    value={revenuePeriod}
                                    onChange={(e: any) => setRevenuePeriod(e.target.value)}
                                >
                                    <option value="dailyRevenues">Par Jour</option>
                                    <option value="weeklyRevenues">Par Semaine</option>
                                    <option value="monthlyRevenues">Par Mois</option>
                                    <option value="yearlyRevenues">Par Année</option>
                                </select>
                            </div>
                            {stats?.[revenuePeriod] && stats[revenuePeriod].length > 0 ? (
                                <div className="h-80 w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <AreaChart data={stats[revenuePeriod]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                            <XAxis dataKey="period" tickFormatter={formatPeriod} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                            <YAxis tickFormatter={(val) => new Intl.NumberFormat('fr-FR', { notation: "compact", compactDisplay: "short" }).format(val)} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                            <Tooltip formatter={(value: any) => formatCurrency(value as number)} labelFormatter={formatPeriod} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff' }} />
                                            <Area type="monotone" dataKey="amount" name="Revenu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-56 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <p className="text-xs text-slate-400 font-semibold">Aucun paiement enregistré pour cette période.</p>
                                </div>
                            )}
                        </div>

                        {/* Student Status Pie Chart */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-6">Statut Global des Élèves</h3>
                            {stats?.studentPaymentStatus ? (
                                <div className="h-60 w-full min-w-0 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Totalement à jour', value: stats.studentPaymentStatus.fullyPaid || 0 },
                                                    { name: 'Paiement partiel', value: stats.studentPaymentStatus.partiallyPaid || 0 },
                                                    { name: 'Aucun paiement', value: stats.studentPaymentStatus.noPayment || 0 }
                                                ].filter(d => d.value > 0)}
                                                cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value"
                                            >
                                                { [1, 2, 3].map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />) }
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-56 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <p className="text-xs text-slate-400 font-semibold">Données indisponibles.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Détails Financiers par Tranche</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">Tranche</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">Attendus</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">Encaissés</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">Taux de Recouvrement</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">En Retard</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {stats?.tranchesStats?.map((tranche: any, idx: number) => {
                                        const expected = tranche.totalExpected || 0;
                                        const collected = tranche.totalCollected || 0;
                                        const recoveryRate = expected > 0 ? ((collected / expected) * 100).toFixed(1) : 0;
                                        
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{tranche.feeTypeName}</td>
                                                <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">{formatCurrency(expected)}</td>
                                                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(collected)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold ${parseFloat(recoveryRate as string) < 50 ? 'text-red-500' : 'text-emerald-500'}`}>{recoveryRate}%</span>
                                                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${parseFloat(recoveryRate as string) < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${recoveryRate}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-red-500">{tranche.lateCount || 0}</td>
                                            </tr>
                                        );
                                    })}
                                    {(!stats?.tranchesStats || stats.tranchesStats.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">Aucun détail financier disponible pour cette école</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Finances;
