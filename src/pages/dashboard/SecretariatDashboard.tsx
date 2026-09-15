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
    SearchX,
    LayoutDashboard,
    Building2,
    X,
    Eye,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    ArrowUpRight,
    Clock
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

    // Live Pending Enrollments (matching Enroll.tsx)
    const [pendingList, setPendingList] = useState<any[]>([]);

    // Modal Details States
    const [activeKpiModal, setActiveKpiModal] = useState<'admissions' | 'students' | 'absences' | 'certificates' | 'pendingAdmissions' | null>(null);
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSearch, setModalSearch] = useState('');

    const instId = typeof user?.institution === 'object' ? user?.institution?.id : user?.institution;
    const instName = typeof user?.institution === 'object' ? user?.institution?.name : (user as any)?.institutionName || 'Établissement';

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const params = instId ? `?institutionId=${instId}` : '';
            try {
                const [statsRes, overviewRes, studentsRes] = await Promise.all([
                    api.get(`dashboard/secretariat${params}`),
                    api.get(`dashboard/overview${params}`),
                    api.get(`/students`, { params: instId ? { institutionId: instId } : {} }).catch(() => ({ data: [] }))
                ]);
                setStats(statsRes.data);
                setOverview(overviewRes.data);

                // Live Pending filter matching Enroll.tsx (PENDING_FEE / PENDING / EN_ATTENTE / !active)
                const pending = (studentsRes.data || []).filter((s: any) =>
                    s.enrollmentStatus === 'PENDING_FEE' || s.enrollmentStatus === 'PENDING' || s.status === 'EN_ATTENTE' || !s.active
                );
                setPendingList(pending);
            } catch (err) {
                console.error("Error fetching secretariat stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [instId]);

    // Handle KPI Card Clicks & Modal Data Fetching
    const handleOpenKpiModal = async (type: 'admissions' | 'students' | 'absences' | 'certificates' | 'pendingAdmissions') => {
        setActiveKpiModal(type);
        setModalSearch('');
        setModalLoading(true);
        setModalData([]);

        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        try {
            if (type === 'absences') {
                const url = instId ? `/attendances/institution/${instId}` : '/attendances';
                const res = await api.get(url).catch(() => ({ data: [] }));
                // Strict filter for current day absences or lates
                const list = (res.data || []).filter((a: any) => {
                    const isToday = a.date === todayStr || (a.date && a.date.startsWith(todayStr));
                    const isAbsentOrLate = a.status === 'ABSENT' || a.status === 'LATE';
                    return isToday && isAbsentOrLate;
                });
                setModalData(list);
            } else if (type === 'certificates') {
                const res = await api.get(`/certificates?institutionId=${instId || ''}`).catch(() => ({ data: [] }));
                setModalData(res.data || []);
            } else if (type === 'students') {
                const res = await api.get(`/students`, { params: { institutionId: instId } }).catch(() => ({ data: [] }));
                setModalData(res.data && res.data.length > 0 ? res.data : (stats?.recentStudents || []));
            } else if (type === 'admissions') {
                // Strict filter for current day admissions
                const todayAdmissions = (stats?.recentStudents || []).filter((s: any) => 
                    s.createdAt?.startsWith(todayStr) || s.admissionDate?.startsWith(todayStr)
                );
                setModalData(todayAdmissions);
            } else if (type === 'pendingAdmissions') {
                // Fetch pending students strictly matching Enroll.tsx
                const res = await api.get(`/students`, { params: instId ? { institutionId: instId } : {} }).catch(() => ({ data: [] }));
                const pending = (res.data || []).filter((s: any) =>
                    s.enrollmentStatus === 'PENDING_FEE' || s.enrollmentStatus === 'PENDING' || s.status === 'EN_ATTENTE' || !s.active
                );
                setModalData(pending.length > 0 ? pending : pendingList);
            }
        } catch (err) {
            console.error("Error loading KPI modal details:", err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleValidateStudent = (studentId: number | string) => {
        const rolePath = user?.role === 'PDG' ? 'pdg' : (user?.role === 'DIRECTION' || user?.role === 'PROVISORIAT') ? 'direction' : 'secretariat';
        window.location.href = `/dashboard/${rolePath}/students?studentId=${studentId}&tab=finance`;
    };

    const filteredStudents = (stats?.recentStudents || []).filter((s: any) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredModalData = modalData.filter((item: any) => {
        const studentName = item.student ? `${item.student.firstName} ${item.student.lastName}` : `${item.firstName || ''} ${item.lastName || ''}`;
        const className = item.classe?.name || item.student?.classe?.name || '';
        const search = modalSearch.toLowerCase();
        return studentName.toLowerCase().includes(search) || className.toLowerCase().includes(search);
    });

    if (loading) return (
        <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des données de l'établissement...</p>
        </div>
    );

    const pendingCount = pendingList.length > 0 ? pendingList.length : (stats?.monthlyPendingAdmissions || 0);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Users className="text-blue-600 dark:text-blue-400" size={24} />
                            Gestion Administrative
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Suivi des inscriptions, dossiers élèves et assiduité quotidienne.</p>
                </div>

                {/* Institution Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 px-3.5 py-1.5 rounded-xl self-start md:self-auto">
                    <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300">{instName}</span>
                </div>
            </div>

            {/* KPI Grid (5 Clickable Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                    label="Inscriptions Jour"
                    count={stats?.dailyAdmissions || 0}
                    icon={UserPlus}
                    color="blue"
                    onClick={() => handleOpenKpiModal('admissions')}
                />
                <KPICard
                    label="Attente Validation"
                    count={pendingCount}
                    icon={Clock}
                    color="amber"
                    onClick={() => handleOpenKpiModal('pendingAdmissions')}
                />
                <KPICard
                    label="Total Élèves"
                    count={overview?.totalStudents || 0}
                    icon={GraduationCap}
                    color="indigo"
                    onClick={() => handleOpenKpiModal('students')}
                />
                <KPICard
                    label="Absences Jour"
                    count={stats?.dailyAbsences || 0}
                    icon={UserCheck}
                    color="rose"
                    onClick={() => handleOpenKpiModal('absences')}
                />
                <KPICard
                    label="Certificats Émis"
                    count={stats?.certificatesIssued || 0}
                    icon={FileText}
                    color="emerald"
                    onClick={() => handleOpenKpiModal('certificates')}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Registrations List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Dossiers Récents</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Les dernières inscriptions enregistrées pour cet établissement</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher..."
                                className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none w-full sm:w-56"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto p-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-2 font-bold">Élève / ID</th>
                                    <th className="pb-2 font-bold">Classe</th>
                                    <th className="pb-2 font-bold">Contact Parent</th>
                                    <th className="pb-2 text-right font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                <AnimatePresence mode='popLayout'>
                                    {filteredStudents.map((student: any) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            <td className="py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                                                        {student.firstName?.[0]}{student.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{student.firstName} {student.lastName}</p>
                                                        <p className="text-[10px] text-slate-400">#RE-{student.id.toString().padStart(4, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="text-slate-800 dark:text-slate-200 font-bold">{student.classe?.name || '---'}</div>
                                                <div className="text-[10px] text-slate-400">{student.classe?.cycle?.name || 'Aucun Cycle'}</div>
                                            </td>
                                            <td className="py-3">
                                                <div className="text-slate-800 dark:text-slate-200 font-bold">
                                                    {student.fatherFirstName ? `${student.fatherFirstName} ${student.fatherLastName}` :
                                                        student.motherFirstName ? `${student.motherFirstName} ${student.motherLastName}` : 'N/A'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <Phone size={10} className="text-blue-500" /> {student.fatherPhone || student.motherPhone || '---'}
                                                </div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Imprimer Dossier"><Printer size={16} /></button>
                                                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Envoyer Message"><Mail size={16} /></button>
                                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><MoreVertical size={16} /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>

                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <SearchX size={32} className="text-slate-300 dark:text-slate-600" />
                                                <p className="text-xs text-slate-400 italic">Aucun dossier trouvé pour cette recherche</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side info / Quick Access */}
                <div className="space-y-4">
                    <div className="bg-slate-900 dark:bg-slate-850 p-5 rounded-2xl text-white border border-slate-800 shadow-sm space-y-4">
                        <h4 className="text-base font-bold flex items-center gap-2">Vue d'ensemble</h4>
                        <div className="space-y-3">
                            <SmallStat label="Cycles" count={overview?.totalCycles || 0} icon={Layers} color="text-purple-400" />
                            <SmallStat label="Classes" count={overview?.totalClasses || 0} icon={LayoutDashboard} color="text-pink-400" />
                            <SmallStat label="Enseignants" count={overview?.totalTeachers || 0} icon={Users} color="text-emerald-400" />
                            <SmallStat label="Total Matières" count={overview?.totalSubjects || 0} icon={BookOpen} color="text-amber-400" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Filter size={16} className="text-blue-600 dark:text-blue-400" /> Actions Rapides
                        </h4>
                        <div className="space-y-2">
                            <QuickActionButton label="Consulter Absences du Jour" icon={UserCheck} color="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" onClick={() => handleOpenKpiModal('absences')} />
                            <QuickActionButton label="Attentes de Validation (Mois)" icon={Clock} color="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" onClick={() => handleOpenKpiModal('pendingAdmissions')} />
                            <QuickActionButton label="Consulter Certificats Émis" icon={FileText} color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" onClick={() => handleOpenKpiModal('certificates')} />
                            <QuickActionButton label="Dossiers Élèves" icon={GraduationCap} color="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" onClick={() => handleOpenKpiModal('students')} />
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILED KPI MODAL POPUP */}
            {activeKpiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
                                    activeKpiModal === 'absences' ? 'bg-rose-600 shadow-rose-500/20' :
                                    activeKpiModal === 'certificates' ? 'bg-emerald-600 shadow-emerald-500/20' :
                                    activeKpiModal === 'students' ? 'bg-indigo-600 shadow-indigo-500/20' :
                                    activeKpiModal === 'pendingAdmissions' ? 'bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'
                                }`}>
                                    {activeKpiModal === 'absences' && <UserCheck size={22} />}
                                    {activeKpiModal === 'certificates' && <FileText size={22} />}
                                    {activeKpiModal === 'students' && <GraduationCap size={22} />}
                                    {activeKpiModal === 'admissions' && <UserPlus size={22} />}
                                    {activeKpiModal === 'pendingAdmissions' && <Clock size={22} />}
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                        {activeKpiModal === 'absences' && 'Détails des Absences du Jour'}
                                        {activeKpiModal === 'certificates' && 'Certificats & Attestations Émis'}
                                        {activeKpiModal === 'students' && 'Liste des Élèves de l\'Établissement'}
                                        {activeKpiModal === 'admissions' && 'Inscriptions & Admissions du Jour'}
                                        {activeKpiModal === 'pendingAdmissions' && 'Inscriptions en Attente de Validation (Paiement)'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Établissement: <span className="font-bold text-slate-700 dark:text-slate-300">{instName}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveKpiModal(null)}
                                className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Search Bar */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input
                                    type="text"
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                    placeholder="Filtrer par nom ou classe..."
                                    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none w-full"
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                                {filteredModalData.length} Élément(s)
                            </span>
                        </div>

                        {/* Modal Content / Table */}
                        <div className="p-5 overflow-y-auto space-y-2 flex-1">
                            {modalLoading ? (
                                <div className="py-12 text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-xs text-slate-400 font-bold">Chargement des données...</p>
                                </div>
                            ) : filteredModalData.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    <SearchX size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        {activeKpiModal === 'absences' && "Aucune absence enregistrée pour le jour actuel."}
                                        {activeKpiModal === 'admissions' && "Aucune nouvelle inscription enregistrée aujourd'hui."}
                                        {activeKpiModal === 'certificates' && "Aucun certificat délivré pour le moment."}
                                        {activeKpiModal === 'students' && "Aucun élève trouvé pour cet établissement."}
                                        {activeKpiModal === 'pendingAdmissions' && "Aucune inscription en attente de validation."}
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            <th className="pb-3 font-bold">Élève</th>
                                            <th className="pb-3 font-bold">Classe Demandée</th>
                                            {activeKpiModal === 'absences' && <th className="pb-3 text-center font-bold">Statut</th>}
                                            {activeKpiModal === 'pendingAdmissions' && <th className="pb-3 text-center font-bold">État Validation</th>}
                                            {activeKpiModal === 'certificates' && <th className="pb-3 font-bold">Type de Document</th>}
                                            <th className="pb-3 font-bold">Contact Parent</th>
                                            <th className="pb-3 text-right font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                        {filteredModalData.map((item: any, idx: number) => {
                                            const st = item.student || item;
                                            const cls = item.classe || st.classe;
                                            return (
                                                <tr key={item.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                                {st.firstName?.[0]}{st.lastName?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white">{st.firstName} {st.lastName}</p>
                                                                <p className="text-[10px] text-slate-400">#DOS-{st.id || idx + 1}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 font-bold text-slate-700 dark:text-slate-300">
                                                        {cls?.name || 'En attente d\'affectation'}
                                                    </td>
                                                    {activeKpiModal === 'absences' && (
                                                        <td className="py-3 text-center">
                                                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                                                                {item.status || 'ABSENT'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {activeKpiModal === 'pendingAdmissions' && (
                                                        <td className="py-3 text-center">
                                                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
                                                                {item.enrollmentStatus || 'PENDING_FEE'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {activeKpiModal === 'certificates' && (
                                                        <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                                                            {item.type || 'Certificat de Scolarité'}
                                                        </td>
                                                    )}
                                                    <td className="py-3 text-slate-600 dark:text-slate-400">
                                                        <div className="flex items-center gap-1">
                                                            <Phone size={12} className="text-blue-500 shrink-0" />
                                                            <span>{st.fatherPhone || st.motherPhone || 'Non renseigné'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        {activeKpiModal === 'pendingAdmissions' ? (
                                                            <button 
                                                                onClick={() => handleValidateStudent(st.id)}
                                                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
                                                                title="Valider Inscription & Consulter Dossier"
                                                            >
                                                                <CheckCircle2 size={14} /> Valider
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                                                                title="Imprimer"
                                                            >
                                                                <Printer size={14} /> Imprimer
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setActiveKpiModal(null)}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors uppercase tracking-wider"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ label, count, icon: Icon, color, onClick }: any) => {
    const iconColors: any = {
        blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white',
        indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white',
        rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white',
        amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white'
    };

    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between cursor-pointer transition-all duration-200 group"
        >
            <div>
                <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                    <ArrowUpRight size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{count}</h4>
            </div>
            <div className={`w-12 h-12 rounded-xl ${iconColors[color]} flex items-center justify-center shrink-0 transition-colors`}>
                <Icon size={24} />
            </div>
        </div>
    );
};

const SmallStat = ({ label, count, icon: Icon, color }: any) => (
    <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center ${color} shrink-0`}>
            <Icon size={16} />
        </div>
        <div className="flex-1 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">{label}</span>
            <span className="text-sm font-bold text-white">{count}</span>
        </div>
    </div>
);

const QuickActionButton = ({ label, icon: Icon, color, onClick }: any) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
            <Icon size={16} />
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-white">{label}</span>
    </button>
);

export default SecretariatDashboard;
