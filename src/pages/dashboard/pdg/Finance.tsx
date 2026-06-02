import React from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Wallet,
    AlertCircle
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

const data = [
    { name: 'Sept', income: 8.5, expense: 4.2 },
    { name: 'Oct', income: 7.2, expense: 3.8 },
    { name: 'Nov', income: 9.8, expense: 4.5 },
    { name: 'Déc', income: 12.5, expense: 5.2 },
    { name: 'Jan', income: 6.4, expense: 3.9 },
    { name: 'Fév', income: 8.9, expense: 4.1 },
];

const Finance: React.FC = () => {
    return (
        <>
            {/* Main Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Santé Financière</h2>
                    <p className="text-slate-500">Mouvements de trésorerie et gestion budgétaire globale</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} />
                        Relevés
                    </button>
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-extrabold flex items-center gap-2 shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all">
                        <Wallet size={18} />
                        Gestion Budget
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <FinanceCard
                    title="Recettes Totales"
                    value="154.2 M FCFA"
                    trend="+15%"
                    trendType="up"
                />
                <FinanceCard
                    title="Dépenses Globales"
                    value="84.5 M FCFA"
                    trend="-2.4%"
                    trendType="down"
                />
                <FinanceCard
                    title="Solde Net"
                    value="69.7 M FCFA"
                    trend="+12.8%"
                    trendType="up"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue/Expense Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Flux de Trésorerie</h3>
                            <p className="text-slate-400 text-sm">Comparatif Recettes vs Dépenses (M FCFA)</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <span className="text-xs font-bold text-slate-400">Recettes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                                <span className="text-xs font-bold text-slate-400">Dépenses</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="income" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="expense" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Breakdown & Alerts */}
                <div className="space-y-6">
                    {/* Budget Consumption */}
                    <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-6">Utilisation Budget</h3>
                        <div className="space-y-6">
                            <ProgressItem label="Salaires & Personnel" percent={78} color="bg-blue-600" />
                            <ProgressItem label="Maintenance & Infrastructures" percent={45} color="bg-amber-500" />
                            <ProgressItem label="Marketing & Scolarité" percent={92} color="bg-emerald-500" />
                            <ProgressItem label="Logistique & Cantine" percent={24} color="bg-slate-400" />
                        </div>
                    </div>

                    {/* Quick Alerts */}
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-400" />
                            Attention Budgétaire
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-xs font-bold text-red-400 uppercase mb-1">Dépassement</p>
                                <p className="text-sm text-white/80 leading-snug">Lycée Excellence: Poste maintenance +12%</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Optimisation</p>
                                <p className="text-sm text-white/80 leading-snug">Réseau Mobile: Économie de 500k détectée</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Internal Components
const FinanceCard = ({ title, value, trend, trendType }: any) => {
    return (
        <div className={`p-8 bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 hover:scale-[1.02] transition-all duration-300`}>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">{value}</h3>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                ${trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend} vs mois dernier
            </div>
        </div>
    );
};

const ProgressItem = ({ label, percent, color }: any) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
            <span className="text-sm font-black text-slate-800">{percent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default Finance;
