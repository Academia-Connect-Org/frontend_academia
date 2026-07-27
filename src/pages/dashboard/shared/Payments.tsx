import React, { useEffect, useState } from 'react';
import { Download, CreditCard, Clock, CheckCircle, Search, Filter } from 'lucide-react';
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
                setInstallments(res.data);
                setFilteredInstallments(res.data);

                if (user?.role === 'PARENT' || user?.role === 'PARENTS') {
                    if (user?.id) {
                        const statsRes = await api.get(`/dashboard/parent?userId=${user.id}`);
                        setChildren(statsRes.data?.children || []);
                    }
                }
            } catch (err) {
                console.error("Error fetching data", err);
                toast.error("Erreur lors du chargement des données");
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
            // Group by payment plan AND enrollment (student)
            // This ensures that siblings with the same payment plan are grouped separately
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

    if (loading) return <div className="flex items-center justify-center h-full">Chargement...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Finances & Paiements</h1>
                    <p className="text-slate-500 font-medium mt-1">Consultez vos tranches et téléchargez vos reçus Nasaire</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-auto flex-1">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Année (ex: 2026)"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 placeholder-slate-400"
                        />
                    </div>
                    <div className="relative w-full sm:w-auto flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Classe (ex: 6ème)"
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 placeholder-slate-400"
                        />
                    </div>
                    <div className="relative w-full sm:w-auto flex-1">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-6 py-4 bg-white border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="paid">Frais payés</option>
                            <option value="unpaid">Frais non payés</option>
                        </select>
                    </div>
                </div>
            </div>

            {children.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {children.map((child: any) => (
                        <div
                            key={child.id}
                            onClick={() => setSelectedChildForPopup(child)}
                            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-white/10 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer flex items-center gap-4 group rounded-3xl"
                        >
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {child.firstName?.charAt(0) || ''}{child.lastName?.charAt(0) || ''}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                                    {child.firstName} {child.lastName}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">
                                    Voir le dossier complet
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedInstallments.length === 0 ? (
                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-white/10 flex flex-col justify-between gap-4 transition-all opacity-80 rounded-3xl">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center font-black bg-slate-100 text-slate-400">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-400">Aucun plan de paiement</h3>
                                    <span className="inline-block px-2 py-1 mt-1 text-xs font-bold rounded-sm bg-slate-100 text-slate-500">
                                        N/A
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-4 border border-white/50 dark:border-white/5 space-y-2 mt-2 rounded-2xl">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Élève</span>
                                <span className="font-black text-slate-400">-</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Classe</span>
                                <span className="font-black text-slate-400">-</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2 border-t border-slate-100 pt-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400">Total payé</p>
                                <p className="text-lg font-black text-slate-400">0 FCFA</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400">Reste à payer</p>
                                <p className="text-lg font-black text-slate-400">0 FCFA</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    groupedInstallments.map((group: any, idx: number) => (
                        <div key={idx} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-white/10 flex flex-col justify-between gap-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all rounded-3xl relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 flex items-center justify-center font-black ${group.isFullyPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {group.isFullyPaid ? <CheckCircle size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800">{group.planName}</h3>
                                        <span className={`inline-block px-2 py-1 mt-1 text-xs font-bold rounded-sm ${group.isFullyPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {group.isFullyPaid ? 'Intégralement Payé' : 'Paiement en cours'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400">Tranches</p>
                                    <p className="text-sm font-black text-slate-700">
                                        {group.installments.filter((i:any) => i.isPaid).length} / {group.installments.length}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-4 border border-white/50 dark:border-white/5 space-y-2 mt-2 rounded-2xl">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">Élève</span>
                                    <span className="font-black text-slate-800">{group.enrollment?.student?.firstName} {group.enrollment?.student?.lastName}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">Classe</span>
                                    <span className="font-black text-slate-800">{group.enrollment?.classe?.name}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2 border-t border-slate-100 pt-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400">Total payé</p>
                                    <p className="text-lg font-black text-emerald-600">{group.totalPaid} FCFA</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400">Reste à payer</p>
                                    <p className={`text-lg font-black ${group.totalDue - group.totalPaid > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {Math.max(0, group.totalDue - group.totalPaid)} FCFA
                                    </p>
                                </div>
                            </div>

                            {/* Transactions & Reçus */}
                            <div className="mt-2 flex flex-wrap gap-2">
                                {group.isFullyPaid ? (
                                    <button
                                        onClick={() => handleDownloadReceipt(null, group.installments[0], true, group)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-sm hover:bg-emerald-100 transition-all rounded-xl shadow-sm"
                                    >
                                        <Download size={16} /> Reçu Global - {group.totalPaid} FCFA
                                    </button>
                                ) : group.allTransactions && group.allTransactions.length > 0 ? (
                                    group.allTransactions.map((tx: any) => (
                                        <button
                                            key={tx.id}
                                            onClick={() => handleDownloadReceipt(tx, group.installments.find((i:any) => i.id === tx.installmentId) || group.installments[0])}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 font-black text-xs hover:bg-white dark:hover:bg-slate-800 transition-all rounded-xl shadow-sm"
                                        >
                                            <Download size={14} /> Reçu : {tx.amount} FCFA
                                        </button>
                                    ))
                                ) : (
                                    <div className="w-full text-center py-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/5 rounded-xl">
                                        <span className="text-xs font-bold text-slate-400 italic">Aucun reçu disponible</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isProcessingAction && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[250] flex flex-col items-center justify-center p-4 rounded-xl animate-in fade-in duration-300">
                    <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
                        <div className="absolute inset-3 rounded-full border-[4px] border-transparent border-b-purple-500 border-l-purple-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                        <div className="relative flex items-center justify-center bg-indigo-50/50 rounded-full w-12 h-12 backdrop-blur-sm">
                            <Download className="text-indigo-600 animate-pulse" size={20} />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2 uppercase">Veuillez patienter</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">{processingMessage}</p>
                </div>
            )}

            {selectedStudentId && (
                <StudentDetailsPopup
                    isOpen={!!selectedStudentId}
                    onClose={() => setSelectedStudentId('')}
                    student={{ id: selectedStudentId }}
                    role={user?.role || ''}
                />
            )}
        </div>
    );
};

export default Payments;
