import React, { useEffect, useState } from 'react';
import { Download, CreditCard, Clock, CheckCircle, Search, Filter, User, FolderOpen, ArrowRight } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { StudentDetailsPopup } from '../../../components/dashboard/shared/StudentDetailsPopup';
import { generateReceipt } from '../../../utils/receiptGenerator';

const Payments: React.FC = () => {
    const { user } = useAuth();
    const [installments, setInstallments] = useState<any[]>([]);
    const [filteredInstallments, setFilteredInstallments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterClass, setFilterClass] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildForPopup, setSelectedChildForPopup] = useState<any>(null);

    useEffect(() => {
        const fetchInstallmentsAndChildren = async () => {
            try {
                let url = '/finance/my-installments';
                if (selectedStudentId) {
                    url += `?studentId=${selectedStudentId}`;
                }
                const res = await api.get(url);
                setInstallments(res.data || []);
                setFilteredInstallments(res.data || []);

                if (user?.role === 'PARENT' || user?.role === 'PARENTS') {
                    if (user?.id) {
                        const statsRes = await api.get(`/dashboard/parent?userId=${user.id}`);
                        setChildren(statsRes.data?.children || statsRes.data?.childrenDetails || []);
                    }
                }
            } catch (err) {
                console.error("Error fetching data", err);
                toast.error("Erreur lors du chargement des données financières");
            } finally {
                setLoading(false);
            }
        };
        fetchInstallmentsAndChildren();
    }, [selectedStudentId, user]);

    useEffect(() => {
        let result = installments;
        if (filterYear) {
            result = result.filter(inst => inst.enrollment?.academicYear?.name?.includes(filterYear) || inst.enrollment?.academicYear?.id?.toString() === filterYear);
        }
        if (filterClass) {
            result = result.filter(inst => inst.enrollment?.classe?.name?.toLowerCase().includes(filterClass.toLowerCase()));
        }
        if (filterStatus === 'paid') {
            result = result.filter(inst => inst.isPaid);
        } else if (filterStatus === 'unpaid') {
            result = result.filter(inst => !inst.isPaid);
        }
        setFilteredInstallments(result);
    }, [filterYear, filterClass, filterStatus, installments]);

    const handleDownloadReceipt = async (tx: any, inst: any, isGlobal: boolean = false, group: any = null) => {
        setIsProcessingAction(true);
        setProcessingMessage("Génération du reçu sécurisé...");
        await new Promise(r => setTimeout(r, 50));
        try {
            await generateReceipt(tx, inst, user, isGlobal, group);
        } finally {
            setIsProcessingAction(false);
        }
    };

    const groupedInstallments = React.useMemo(() => {
        const groups: Record<string, any> = {};
        filteredInstallments.forEach(inst => {
            const planId = inst.paymentPlan?.id
                ? `plan-${inst.paymentPlan.id}-enroll-${inst.enrollment?.id}`
                : `fee-${inst.feeType?.id}-enroll-${inst.enrollment?.id}`;

            if (!groups[planId]) {
                groups[planId] = {
                    id: planId,
                    planName: inst.paymentPlan?.name || inst.feeType?.name || 'Frais de scolarité',
                    feeTypeName: inst.feeType?.name || 'Frais non défini',
                    enrollment: inst.enrollment,
                    installments: [],
                    totalDue: 0,
                    totalPaid: 0,
                    allTransactions: []
                };
            }
            groups[planId].installments.push(inst);
            groups[planId].totalDue += inst.dueAmount || 0;
            groups[planId].totalPaid += inst.paidAmount || 0;
            if (inst.transactions && Array.isArray(inst.transactions)) {
                groups[planId].allTransactions.push(...inst.transactions);
            }
        });

        return Object.values(groups).map(g => ({
            ...g,
            isFullyPaid: g.totalDue > 0 && g.totalDue <= g.totalPaid
        }));
    }, [filteredInstallments]);

    if (loading) return (
        <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des données financières...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Student Details Popup */}
            {selectedChildForPopup && (
                <StudentDetailsPopup
                    isOpen={!!selectedChildForPopup}
                    onClose={() => setSelectedChildForPopup(null)}
                    student={selectedChildForPopup}
                    role={user?.role || 'PARENT'}
                    onRefresh={() => { }}
                />
            )}

            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <CreditCard size={24} className="text-blue-600 dark:text-blue-400" />
                        Finances & Paiements
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Consultez le suivi des tranches de scolarité et téléchargez vos reçus officiels.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-44">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Année (ex: 2026)"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="relative flex-1 sm:w-44">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Classe (ex: 6ème)"
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="relative flex-1 sm:w-44">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="paid">Frais payés</option>
                            <option value="unpaid">Frais non payés</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Children Cards Header (For Parents to quickly open student folder) */}
            {children.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dossiers Financiers des Enfants</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {children.map((child: any) => (
                            <div
                                key={child.id}
                                onClick={() => setSelectedChildForPopup(child.student || child)}
                                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                                        {child.firstName?.charAt(0) || ''}{child.lastName?.charAt(0) || ''}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                            {child.firstName} {child.lastName}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                            {child.classeName || child.classe?.name || "Élève"}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[11px] rounded-xl flex items-center gap-1 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <FolderOpen size={14} /> Dossier
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Installment Groups List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedInstallments.length === 0 ? (
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
                        <CreditCard size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucun plan de paiement trouvé</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Aucun échéancier financier ne correspond à vos filtres actuels.</p>
                    </div>
                ) : (
                    groupedInstallments.map((group: any, idx: number) => {
                        const studentObj = group.enrollment?.student;

                        return (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
                                {/* Group Title & Fully Paid Status */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${group.isFullyPaid ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>
                                            {group.isFullyPaid ? <CheckCircle size={22} /> : <Clock size={22} />}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{group.planName}</h3>
                                            <span className={`inline-block px-2.5 py-0.5 mt-1 text-[10px] font-bold rounded-lg uppercase ${group.isFullyPaid ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'}`}>
                                                {group.isFullyPaid ? 'Intégralement Payé' : 'Paiement en cours'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tranches</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                                            {group.installments.filter((i: any) => i.isPaid).length} / {group.installments.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Enrollment Info & "Voir le Dossier" button */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Élève & Classe</p>
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                            {studentObj?.firstName ? `${studentObj.firstName} ${studentObj.lastName}` : 'Élève rattaché'}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            {group.enrollment?.classe?.name || 'Classe N/A'}
                                        </p>
                                    </div>

                                    {studentObj && (
                                        <button
                                            onClick={() => setSelectedChildForPopup(studentObj)}
                                            className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1 shrink-0"
                                        >
                                            <FolderOpen size={14} /> Dossier <ArrowRight size={12} />
                                        </button>
                                    )}
                                </div>

                                {/* Financial Amounts */}
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total payé</p>
                                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{group.totalPaid ? `${group.totalPaid.toLocaleString()} FCFA` : '0 FCFA'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reste à payer</p>
                                        <p className={`text-base font-bold mt-0.5 ${group.totalDue - group.totalPaid > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {Math.max(0, group.totalDue - group.totalPaid).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>

                                {/* Transactions & Receipt Download Actions */}
                                <div className="pt-2 flex flex-wrap gap-2">
                                    {group.isFullyPaid ? (
                                        <button
                                            onClick={() => handleDownloadReceipt(null, group.installments[0], true, group)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl transition-all shadow-sm"
                                        >
                                            <Download size={14} /> Reçu Global - {group.totalPaid.toLocaleString()} FCFA
                                        </button>
                                    ) : group.allTransactions && group.allTransactions.length > 0 ? (
                                        group.allTransactions.map((tx: any) => (
                                            <button
                                                key={tx.id}
                                                onClick={() => handleDownloadReceipt(tx, group.installments.find((i: any) => i.id === tx.installmentId) || group.installments[0])}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all shadow-sm"
                                            >
                                                <Download size={14} /> Reçu : {tx.amount?.toLocaleString() || 0} FCFA
                                            </button>
                                        ))
                                    ) : (
                                        <div className="w-full text-center py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-400 italic">Aucun reçu individuel disponible</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Processing Toast Overlay */}
            {isProcessingAction && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-4 max-w-sm">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Veuillez patienter</h3>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900">{processingMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
