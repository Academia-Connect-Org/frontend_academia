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
import { Users, DollarSign, AlertCircle, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Finances = () => {
    const { user } = useAuth();
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(user?.institution?.id ? String(user.institution.id) : '');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [revenuePeriod, setRevenuePeriod] = useState<'dailyRevenues' | 'weeklyRevenues' | 'monthlyRevenues' | 'yearlyRevenues'>('monthlyRevenues');

    // Academic Year State
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);

    useEffect(() => {
        if (user?.institution?.id) {
            setSelectedInstitutionId(String(user.institution.id));
        }
    }, [user?.institution?.id]);

    useEffect(() => {
        if (!selectedInstitutionId) return;
        const fetchYears = async () => {
            try {
                const res = await api.get(`/academic-years/institution/${selectedInstitutionId}`);
                const years = res.data || [];
                setAcademicYears(years);
                const activeYear = years.find((y: any) => y.isActive || y.isCurrent || y.current) || years[0];
                if (activeYear) {
                    setSelectedAcademicYearId(activeYear.id);
                }
            } catch (err) {
                console.error("Error fetching academic years", err);
            }
        };
        fetchYears();
    }, [selectedInstitutionId]);

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
                const params: any = { institutionId: selectedInstitutionId };
                if (selectedAcademicYearId) {
                    params.academicYearId = selectedAcademicYearId;
                }
                const res = await api.get('/dashboard/pdg-finances', { params });
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching finance stats", err);
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedInstitutionId, selectedAcademicYearId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount || 0);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Finances & Analyses</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm md:text-base">Analysez les revenus, paiements et grilles tarifaires de votre école</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {academicYears.length > 0 && (
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                            <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Année :</span>
                            <select
                                value={selectedAcademicYearId || ''}
                                onChange={(e) => setSelectedAcademicYearId(e.target.value ? Number(e.target.value) : null)}
                                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                            >
                                {academicYears.map((ay: any) => (
                                    <option key={ay.id} value={ay.id} className="dark:bg-slate-900 text-slate-800 dark:text-white">
                                        {ay.name} {ay.isCurrent || ay.isActive ? '(En cours)' : ay.isClosed ? '(Clôturée)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-24">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {!loading && stats && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div 
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-blue-500 relative overflow-hidden group transition-all duration-300"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 rounded-2xl absolute -right-4 -top-4 rotate-12 flex items-center justify-center opacity-70 group-hover:scale-110 transition-transform">
                                <DollarSign size={36} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 relative z-10">Revenus Encaissés</p>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{formatCurrency(stats.totalRevenue)}</h3>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-emerald-500 relative overflow-hidden group transition-all duration-300"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 rounded-2xl absolute -right-4 -top-4 rotate-12 flex items-center justify-center opacity-70 group-hover:scale-110 transition-transform">
                                <Users size={36} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 relative z-10">Élèves Inscrits</p>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{stats.totalStudents}</h3>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-red-500 relative overflow-hidden group transition-all duration-300"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 rounded-2xl absolute -right-4 -top-4 rotate-12 flex items-center justify-center opacity-70 group-hover:scale-110 transition-transform">
                                <AlertCircle size={36} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 relative z-10">Paiements en Retard</p>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{stats.totalOverduePayments}</h3>
                        </motion.div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 transition-all duration-300">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Analyse des Paiements par Tranche</h3>

                        {stats.tranchesStats && stats.tranchesStats.length > 0 ? (
                            <div className="h-80 md:h-96 w-full min-w-0">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={stats.tranchesStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                        <XAxis
                                            dataKey="feeTypeName"
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
                                            cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                            labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="paidCount" name="Payés" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                        <Bar dataKey="unpaidCount" name="Non Payés" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                <p className="text-slate-400 dark:text-slate-500 font-bold text-xs">Aucune donnée de tranche trouvée pour cette école.</p>
                            </div>
                        )}
                    </div>

                    {/* Additional Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Monthly Revenue Chart */}
                        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 lg:col-span-2 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Évolution des Recettes (Flux de Trésorerie)</h3>
                                <select 
                                    className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-200 py-2 px-4 rounded-xl cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={revenuePeriod}
                                    onChange={(e: any) => setRevenuePeriod(e.target.value)}
                                >
                                    <option value="dailyRevenues">Par Jour</option>
                                    <option value="weeklyRevenues">Par Semaine</option>
                                    <option value="monthlyRevenues">Par Mois</option>
                                    <option value="yearlyRevenues">Par Année</option>
                                </select>
                            </div>
                            {stats[revenuePeriod] && stats[revenuePeriod].length > 0 ? (
                                <div className="h-80 md:h-96 w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <AreaChart data={stats[revenuePeriod]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                            <XAxis dataKey="period" tickFormatter={formatPeriod} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                            <YAxis tickFormatter={(val) => new Intl.NumberFormat('fr-FR', { notation: "compact", compactDisplay: "short" }).format(val)} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                            <Tooltip 
                                                formatter={(value: any) => [formatCurrency(value as number), 'Revenu']} 
                                                labelFormatter={formatPeriod} 
                                                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} 
                                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                                itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                                labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="amount" name="Revenu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <p className="text-slate-400 dark:text-slate-500 font-bold text-xs">Aucun paiement enregistré pour cette période.</p>
                                </div>
                            )}
                        </div>

                        {/* Student Status Pie Chart */}
                        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 transition-all duration-300">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-6">Statut Global des Élèves</h3>
                            {stats.studentPaymentStatus ? (
                                <div className="h-72 w-full min-w-0 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Totalement à jour', value: stats.studentPaymentStatus.fullyPaid || 0 },
                                                    { name: 'Paiement partiel', value: stats.studentPaymentStatus.partiallyPaid || 0 },
                                                    { name: 'Aucun paiement', value: stats.studentPaymentStatus.noPayment || 0 }
                                                ].filter(d => d.value > 0)}
                                                cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                                            >
                                                {[1, 2, 3].map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                                itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                                labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                                formatter={(val: any, name: any) => [`${val} élève(s)`, `${name}`]}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <p className="text-slate-400 dark:text-slate-500 font-bold text-xs">Données indisponibles.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Table */}
                    <div className="bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Détails Financiers par Tranche</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/70 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">Tranche</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">Attendus</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">Encaissés</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">Taux de Recouvrement</th>
                                        <th className="p-4 border-b border-slate-100 dark:border-slate-800">En Retard</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.tranchesStats?.map((tranche: any, idx: number) => {
                                        const expected = tranche.totalExpected || 0;
                                        const collected = tranche.totalCollected || 0;
                                        const recoveryRate = expected > 0 ? ((collected / expected) * 100).toFixed(1) : 0;

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{tranche.feeTypeName}</td>
                                                <td className="p-4 font-bold text-slate-600 dark:text-slate-400">{formatCurrency(expected)}</td>
                                                <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(collected)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-black ${parseFloat(recoveryRate as string) < 50 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>{recoveryRate}%</span>
                                                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${parseFloat(recoveryRate as string) < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${recoveryRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-red-500 dark:text-red-400">{tranche.lateCount}</td>
                                            </tr>
                                        );
                                    })}
                                    {(!stats.tranchesStats || stats.tranchesStats.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold text-xs">Aucun détail disponible</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {!loading && !stats && (
                <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8">
                    <PieChartIcon size={40} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Aucune donnée financière disponible pour cette sélection.</p>
                </div>
            )}
        </motion.div>
    );
};

export default Finances;
