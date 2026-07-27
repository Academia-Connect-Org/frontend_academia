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
                setInstitutions(res.data);
                if (res.data.length > 0) {
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
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedInstitutionId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount || 0);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Finances & Analyses</h1>
                    <p className="text-slate-500 font-medium mt-2">Analysez les revenus et paiements de vos écoles</p>
                </div>
                
                {/* School Selector */}
                <div className="flex items-center gap-3 bg-white p-2 shadow-xl shadow-slate-200/50">
                    <Building2 className="text-slate-400 ml-3" size={20} />
                    <select
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 py-3 pr-8 cursor-pointer outline-none"
                        value={selectedInstitutionId}
                        onChange={(e) => setSelectedInstitutionId(e.target.value)}
                    >
                        <option value="" disabled>Sélectionner une école</option>
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {!loading && stats && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 md:p-8 shadow-xl shadow-slate-200/50 border-l-4 border-blue-500 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                            <div className="w-20 h-20 bg-blue-50 text-blue-500 absolute -right-6 -top-6 rotate-12 flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform">
                                <DollarSign size={40} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Revenus Encaissés</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight relative z-10">{formatCurrency(stats.totalRevenue)}</h3>
                        </div>

                        <div className="bg-white p-6 md:p-8 shadow-xl shadow-slate-200/50 border-l-4 border-emerald-500 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 absolute -right-6 -top-6 rotate-12 flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform">
                                <Users size={40} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Élèves Inscrits</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight relative z-10">{stats.totalStudents}</h3>
                        </div>

                        <div className="bg-white p-6 md:p-8 shadow-xl shadow-slate-200/50 border-l-4 border-red-500 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                            <div className="w-20 h-20 bg-red-50 text-red-500 absolute -right-6 -top-6 rotate-12 flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform">
                                <AlertCircle size={40} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Paiements en Retard</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight relative z-10">{stats.totalOverduePayments}</h3>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-4 md:p-8 shadow-xl shadow-slate-200/50">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Analyse des Paiements par Tranche</h3>
                        
                        {stats.tranchesStats && stats.tranchesStats.length > 0 ? (
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.tranchesStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="feeTypeName" 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="paidCount" name="Payés" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        <Bar dataKey="unpaidCount" name="Non Payés" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold">Aucune donnée de tranche trouvée pour cette école.</p>
                            </div>
                        )}
                    </div>

                    {/* Additional Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Revenue Chart */}
                        <div className="bg-white p-4 md:p-8 shadow-xl shadow-slate-200/50 lg:col-span-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Évolution des Recettes (Flux de Trésorerie)</h3>
                                <select 
                                    className="bg-slate-100 border-none text-sm font-bold text-slate-700 py-2 px-4 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
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
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats[revenuePeriod]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="period" tickFormatter={formatPeriod} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dy={10} />
                                            <YAxis tickFormatter={(val) => new Intl.NumberFormat('fr-FR', { notation: "compact", compactDisplay: "short" }).format(val)} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                                            <Tooltip formatter={(value: any) => formatCurrency(value as number)} labelFormatter={formatPeriod} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="amount" name="Revenu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200"><p className="text-slate-400 font-bold">Aucun paiement enregistré pour cette période.</p></div>
                            )}
                        </div>

                        {/* Student Status Pie Chart */}
                        <div className="bg-white p-4 md:p-8 shadow-xl shadow-slate-200/50">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6">Statut Global des Élèves</h3>
                            {stats.studentPaymentStatus ? (
                                <div className="h-64 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Totalement à jour', value: stats.studentPaymentStatus.fullyPaid || 0 },
                                                    { name: 'Paiement partiel', value: stats.studentPaymentStatus.partiallyPaid || 0 },
                                                    { name: 'Aucun paiement', value: stats.studentPaymentStatus.noPayment || 0 }
                                                ].filter(d => d.value > 0)}
                                                cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                                            >
                                                { [1, 2, 3].map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />) }
                                            </Pie>
                                            <Tooltip contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200"><p className="text-slate-400 font-bold">Données indisponibles.</p></div>
                            )}
                        </div>
                    </div>

                    {/* Detail Table */}
                    <div className="bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Détails Financiers par Tranche</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="p-4 border-b border-slate-100">Tranche</th>
                                        <th className="p-4 border-b border-slate-100">Attendus</th>
                                        <th className="p-4 border-b border-slate-100">Encaissés</th>
                                        <th className="p-4 border-b border-slate-100">Taux de Recouvrement</th>
                                        <th className="p-4 border-b border-slate-100">En Retard</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.tranchesStats?.map((tranche: any, idx: number) => {
                                        const expected = tranche.totalExpected || 0;
                                        const collected = tranche.totalCollected || 0;
                                        const recoveryRate = expected > 0 ? ((collected / expected) * 100).toFixed(1) : 0;
                                        
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                                                <td className="p-4 font-bold text-slate-700">{tranche.feeTypeName}</td>
                                                <td className="p-4 font-bold text-slate-600">{formatCurrency(expected)}</td>
                                                <td className="p-4 font-black text-emerald-600">{formatCurrency(collected)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-black ${parseFloat(recoveryRate as string) < 50 ? 'text-red-500' : 'text-emerald-500'}`}>{recoveryRate}%</span>
                                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${parseFloat(recoveryRate as string) < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${recoveryRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-red-500">{tranche.lateCount}</td>
                                            </tr>
                                        );
                                    })}
                                    {(!stats.tranchesStats || stats.tranchesStats.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">Aucun détail disponible</td>
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
