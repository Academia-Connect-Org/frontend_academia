import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    MoreVertical,
    Printer,
    Mail,
    Phone,
    UserCheck,
    FileText,
    Users,
    GraduationCap,
    Layers,
    BookOpen,
    Filter,
    Download,
    ArrowUpRight,
    SearchX,
    LayoutDashboard
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SecretariatDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const params = user?.institution?.id ? `?institutionId=${user.institution.id}` : '';
            try {
                const [statsRes, overviewRes] = await Promise.all([
                    api.get(`dashboard/secretariat${params}`),
                    api.get(`dashboard/overview${params}`)
                ]);
                setStats(statsRes.data);
                setOverview(overviewRes.data);
            } catch (err) {
                console.error("Error fetching secretariat stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.institution?.id]);

    const filteredStudents = (stats?.recentStudents || []).filter((s: any) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <>
            <div className="flex items-center justify-center h-64">
                <div className="relative">
                    <div className="h-16 w-16     animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <UserPlus className="text-blue-600 animate-pulse" size={20} />
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        Gestion Administrative
                    </h2>
                    <p className="text-slate-500 font-medium">Suivi des inscriptions, dossiers élèves et assiduité quotidienne.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Printer size={18} /> Rapports
                    </button>
                    <button className="bg-blue-600 text-white px-8 py-3  font-black flex items-center gap-2 shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all">
                        <UserPlus size={20} /> Nouvelle Inscription
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPICard
                    label="Inscriptions Jour"
                    count={stats?.dailyAdmissions || 0}
                    icon={UserPlus}
                    color="blue"
                    trend="+12%"
                />
                <KPICard
                    label="Total Élèves"
                    count={overview?.totalStudents || 0}
                    icon={GraduationCap}
                    color="indigo"
                    trend="Stable"
                />
                <KPICard
                    label="Absences Jour"
                    count={stats?.dailyAbsences || 0}
                    icon={UserCheck}
                    color="rose"
                    trend="-5%"
                />
                <KPICard
                    label="Certificats Émis"
                    count={stats?.certificatesIssued || 0}
                    icon={FileText}
                    color="emerald"
                    trend="+8%"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registrations List */}
                <div className="lg:col-span-2 bg-white ] shadow-2xl shadow-slate-200/40   overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-8   flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Dossiers Récents</h3>
                            <p className="text-slate-400 text-sm font-medium">Les dernières inscriptions enregistrées</p>
                        </div>
                        <div className="relative group min-w-[280px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher un dossier..."
                                className="pl-12 pr-6 py-3.5 bg-slate-50   focus: focus:bg-white  text-sm font-bold w-full transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] bg-slate-50/50">
                                    <th className="px-8 py-5 text-left">Élève / ID</th>
                                    <th className="px-8 py-5 text-left">Classe</th>
                                    <th className="px-8 py-5 text-left">Contact Parent</th>
                                    <th className="px-8 py-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode='popLayout'>
                                    {filteredStudents.map((student: any) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="hover:bg-blue-50/30 transition-all group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12  bg-slate-100 text-slate-600 font-black text-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{student.firstName} {student.lastName}</p>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID: #RE-{student.id.toString().padStart(4, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{student.classe?.name || '---'}</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase mt-1">{student.classe?.cycle?.name || 'Aucun Cycle'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {student.fatherFirstName ? `${student.fatherFirstName} ${student.fatherLastName}` :
                                                            student.motherFirstName ? `${student.motherFirstName} ${student.motherLastName}` : 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                                        <Phone size={12} className="text-blue-400" /> {student.fatherPhone || student.motherPhone || '---'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50  transition-all" title="Imprimer Dossier"><Printer size={18} /></button>
                                                    <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50  transition-all" title="Envoyer Message"><Mail size={18} /></button>
                                                    <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100  transition-all"><MoreVertical size={18} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>

                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-slate-50  text-slate-300">
                                                    <SearchX size={40} />
                                                </div>
                                                <p className="text-slate-400 font-bold italic">Aucun dossier trouvé pour cette recherche</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side info / Quick Access */}
                <div className="space-y-8">
                    {/* Distribution Summary */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 ] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5  -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
                        <h4 className="text-lg font-black mb-8 flex items-center gap-2">
                            Vue d'ensemble
                        </h4>

                        <div className="space-y-6">
                            <SmallStat label="Cycles" count={overview?.totalCycles || 0} icon={Layers} color="text-purple-400" />
                            <SmallStat label="Classes" count={overview?.totalClasses || 0} icon={LayoutDashboard} color="text-pink-400" />
                            <SmallStat label="Enseignants" count={overview?.totalTeachers || 0} icon={Users} color="text-emerald-400" />
                            <SmallStat label="Total Matières" count={overview?.totalSubjects || 0} icon={BookOpen} color="text-amber-400" />
                        </div>

                        <div className="mt-10 p-5 bg-white/10    flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-indigo-200 tracking-wider">Taux d'Inscription</p>
                                <p className="text-xl font-black">+18% <span className="text-[10px] font-medium text-emerald-400 ml-1">Ce mois</span></p>
                            </div>
                            <div className="w-12 h-12 bg-white/10  flex items-center justify-center">
                                <ArrowUpRight className="text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="bg-white p-8 ] shadow-xl   ring-1 ring-slate-400/5">
                        <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Filter size={18} className="text-blue-600" /> Actions Rapides
                        </h4>
                        <div className="space-y-3">
                            <QuickActionButton label="Éditer Liste Élèves" icon={FileText} color="bg-blue-50 text-blue-600" />
                            <QuickActionButton label="Feuilles de Présence" icon={UserCheck} color="bg-rose-50 text-rose-600" />
                            <QuickActionButton label="Configuration Inscriptions" icon={Layers} color="bg-purple-50 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const KPICard = ({ label, count, icon: Icon, color, trend }: any) => {
    const colorVariants: any = {
        blue: 'from-blue-500 to-blue-700 bg-blue-50 text-blue-600',
        indigo: 'from-indigo-500 to-indigo-700 bg-indigo-50 text-indigo-600',
        rose: 'from-rose-500 to-rose-700 bg-rose-50 text-rose-600',
        emerald: 'from-emerald-500 to-emerald-700 bg-emerald-50 text-emerald-600'
    };

    return (
        <div className="bg-white p-6 ] shadow-xl shadow-slate-200/40   group transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] relative overflow-hidden">
            <div className={`w-14 h-14 ${colorVariants[color].split(' ')[2]} ${colorVariants[color].split(' ')[3]}  flex items-center justify-center mb-5 group-hover:rotate-6 transition-all shadow-inner`}>
                <Icon size={28} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{label}</p>
            <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{count}</h4>
                <div className={`text-[10px] font-black px-2 py-1  ${trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                    {trend}
                </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colorVariants[color].split('0')[0]}0 opacity-30 w-full`}></div>
        </div>
    );
};

const SmallStat = ({ label, count, icon: Icon, color }: any) => (
    <div className="flex items-center gap-4 group">
        <div className={`w-10 h-10 bg-white/10  flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">{label}</p>
            <p className="text-lg font-black">{count}</p>
        </div>
    </div>
);

const QuickActionButton = ({ label, icon: Icon, color }: any) => (
    <button className="w-full flex items-center gap-4 p-4  hover:bg-slate-50 transition-all group group-active:scale-95   hover:">
        <div className={`w-10 h-10 ${color}  flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <span className="text-sm font-bold text-slate-700">{label}</span>
    </button>
);

export default SecretariatDashboard;
