import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import {
    X, Mail, MessageSquare, Phone, MapPin, Calendar, GraduationCap, AlertCircle, CheckCircle2,
    DollarSign, Printer, Download, Plus, Clock, CreditCard
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { generateReceipt } from '../../../utils/receiptGenerator';

interface StudentDetailsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    role: string;
    onRefresh?: () => void;
    initialTab?: 'info' | 'finance';
}

export const StudentDetailsPopup: React.FC<StudentDetailsPopupProps> = ({ isOpen, onClose, student: initialStudent, role, onRefresh, initialTab }) => {
    const { user } = useAuth();
    const [student, setStudent] = useState<any>(initialStudent);

    useEffect(() => {
        setStudent(initialStudent);
    }, [initialStudent]);

    const refreshStudentDetails = async () => {
        if (!initialStudent?.id) return;
        try {
            const res = await api.get(`/students/${initialStudent.id}`);
            if (res.data) {
                setStudent(res.data);
            }
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Error refreshing student", error);
        }
    };
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'finance'>(initialTab || 'info');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab || 'info');
        }
    }, [isOpen, initialTab]);

    const [studentInstallments, setStudentInstallments] = useState<any[]>([]);
    const [loadingInstallments, setLoadingInstallments] = useState<boolean>(false);

    // Only for admin
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [paymentMode, setPaymentMode] = useState<string>('ESPÈCES');
    const [payingInstallmentId, setPayingInstallmentId] = useState<number | null>(null);

    const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
    const [processingMessage, setProcessingMessage] = useState<string>('');

    useEffect(() => {
        if (isOpen && student?.id) {
            fetchInstallments(student.id);
        }
    }, [isOpen, student?.id]);

    const fetchInstallments = async (studentId: number) => {
        try {
            setLoadingInstallments(true);
            const res = await api.get(`/finance/students/${studentId}/installments`);
            setStudentInstallments(res.data || []);
        } catch (error) {
            console.error("Error fetching installments", error);
        } finally {
            setLoadingInstallments(false);
        }
    };

    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'success' | 'error' | 'warning';
        title: string;
        message: string;
        onConfirm?: () => void;
        onCancel?: () => void;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    const showDialog = (type: 'confirm' | 'success' | 'error' | 'warning', title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
        setDialogState({ isOpen: true, type, title, message, onConfirm, onCancel });
    };

    const closeDialog = () => setDialogState(prev => ({ ...prev, isOpen: false }));

    const handleGenerateInstallments = async () => {
        if (role === 'PARENT' || role === 'STUDENT') return;
        try {
            setIsProcessingAction(true);
            setProcessingMessage("Actualisation des tranches et envoi des notifications...");
            await api.post(`/finance/students/${student.id}/assign-plan`);
            await fetchInstallments(student.id);
            await refreshStudentDetails();
            showDialog('success', 'Succès', 'Les tranches ont été générées avec succès.');
        } catch (error: any) {
            showDialog('error', 'Erreur', error.response?.data?.message || 'Erreur lors de la génération des tranches.');
        } finally {
            setIsProcessingAction(false);
        }
    };

    const confirmGenerateInstallments = () => {
        showDialog('confirm', 'Attention', 'Mettre à jour les tranches va ajouter les nouveaux frais et actualiser les montants, tout en conservant vos paiements et tranches actuels. Voulez-vous continuer ?', () => {
            closeDialog();
            handleGenerateInstallments();
        }, closeDialog);
    };

    const processPayment = async (installmentId: number, amountToPay: number) => {
        try {
            setPayingInstallmentId(installmentId);
            setProcessingMessage("Traitement du paiement et génération du reçu...");
            
            // Animation artificielle de 3 secondes demandée
            await new Promise(resolve => setTimeout(resolve, 3000));

            await api.post(`/finance/installments/${installmentId}/pay`, null, {
                params: { amount: amountToPay, paymentMethod: paymentMode }
            });
            await refreshStudentDetails();
            showDialog('success', 'Paiement Réussi', 'Le paiement a été enregistré avec succès.', () => {
                closeDialog();
                setPaymentAmount('');
                fetchInstallments(student.id);
            });
        } catch (error: any) {
            showDialog('error', 'Erreur de paiement', error.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement.', closeDialog);
        } finally {
            setPayingInstallmentId(null);
            setIsProcessingAction(false);
        }
    };

    const handlePayInstallmentClick = (installmentId: number, dueAmount: number, paidAmount: number) => {
        const amountToPay = Number(paymentAmount);
        const remaining = dueAmount - paidAmount;
        if (amountToPay <= 0 || amountToPay > remaining) {
            showDialog('warning', 'Montant Invalide', `Le montant doit être compris entre 1 et ${remaining.toLocaleString()} FCFA.`);
            return;
        }
        
        showDialog('confirm', 'Confirmer le paiement', `Voulez-vous vraiment enregistrer un paiement de ${amountToPay.toLocaleString()} FCFA par ${paymentMode.toLowerCase()} ?`, () => {
            closeDialog();
            processPayment(installmentId, amountToPay);
        }, closeDialog);
    };

    if (!isOpen || !student) return null;

    const isAdmin = role !== 'PARENT' && role !== 'STUDENT';

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-4 sm:p-6 text-white relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all backdrop-blur-md">
                        <X size={18} />
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mt-2 pr-10">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-white/10 flex items-center justify-center font-black text-3xl shadow-xl backdrop-blur-xl uppercase ring-2 ring-white/10 shrink-0">
                                {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">{student.lastName} {student.firstName}</h3>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <span className="flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 px-3 py-1 text-[10px] font-black tracking-widest uppercase backdrop-blur-md">
                                        <CheckCircle2 size={12} /> Scolarisé
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 text-[10px] font-black tracking-widest uppercase backdrop-blur-md">
                                        Matricule : {student.studentIdNumber || 'ATTENTE VALIDATION D\'INSCRIPTION'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {student.institution && (
                            <div className="flex flex-col gap-1.5 bg-white/5 p-4 rounded-xl backdrop-blur-md border border-white/10 w-full md:w-auto">
                                <div className="text-xs font-black uppercase tracking-widest text-indigo-200 flex items-center gap-2">
                                    <GraduationCap size={14} /> {student.institution.name}
                                </div>
                                <div className="flex flex-col gap-1 text-xs text-indigo-100">
                                    {student.institution.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="opacity-70" /> {student.institution.address}
                                        </div>
                                    )}
                                    {student.institution.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={12} className="opacity-70" /> {student.institution.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-4 sm:px-10 overflow-x-auto custom-scrollbar">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-6 font-black uppercase tracking-widest text-xs border-b-2 transition-colors ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Dossier Élève
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`py-4 px-6 font-black uppercase tracking-widest text-xs border-b-2 transition-colors ${activeTab === 'finance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Finances
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-50/20 custom-scrollbar">
                    {activeTab === 'info' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                            <div className="space-y-8 lg:col-span-1">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                        <div className="w-6 h-px bg-slate-200"></div> Données Personnelles
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between p-3 bg-white shadow-sm">
                                            <DetailItem icon={<CreditCard size={16} />} label="Matricule" value={student.studentIdNumber || 'Non assigné'} />
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white shadow-sm group">
                                            <DetailItem icon={<Mail size={16} />} label="Email / Compte" value={student.email ? student.email.toLowerCase().replace(/\s+/g, '') : 'Non généré'} />
                                            {student.email && student.defaultPassword && (
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mot de passe par défaut</p>
                                                    <p className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 inline-block">{student.defaultPassword}</p>
                                                </div>
                                            )}
                                            {student.id && isAdmin && (
                                                <button
                                                    onClick={async () => {
                                                        const prefill = encodeURIComponent(`Bonjour ${student.firstName}, je vous contacte concernant votre dossier scolaire...`);
                                                        navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${student.id}&prefill=${prefill}`);
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all"
                                                    title="Envoyer un message à l'élève"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <DetailItem icon={<Calendar size={16} />} label="Naissance" value={student.birthDate ? new Date(student.birthDate).toLocaleDateString('fr-FR') : 'Non renseigné'} />
                                        <DetailItem icon={<MapPin size={16} />} label="Demeure à" value={student.address || student.fatherAccount?.address || student.motherAccount?.address || 'Adresse inconnue'} />
                                        <DetailItem icon={<GraduationCap size={16} />} label="Classe" value={student.classe?.name || student.classeName || 'Non rattaché'} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8 lg:col-span-2">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                                    <div className="w-6 h-px bg-slate-200"></div> Responsables Parents
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ParentCard
                                        gender="F"
                                        name={student.motherFirstName || student.motherLastName ? `${student.motherFirstName || ''} ${student.motherLastName || ''}`.trim() : 'Non renseigné'}
                                        email={student.motherEmail}
                                        phone={student.motherPhone}
                                        defaultPassword={student.motherAccount?.defaultPassword}
                                        onMessage={() => {
                                            if (!isAdmin) return;
                                            const prefill = encodeURIComponent(`Bonjour, je vous contacte concernant le dossier de votre enfant ${student.firstName} ${student.lastName}...`);
                                            navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${student.motherAccount?.id}&prefill=${prefill}`);
                                        }}
                                        parentId={student.motherAccount?.id}
                                        canMessage={isAdmin}
                                    />
                                    <ParentCard
                                        gender="M"
                                        name={student.fatherFirstName || student.fatherLastName ? `${student.fatherFirstName || ''} ${student.fatherLastName || ''}`.trim() : 'Non renseigné'}
                                        email={student.fatherEmail}
                                        phone={student.fatherPhone}
                                        defaultPassword={student.fatherAccount?.defaultPassword}
                                        onMessage={() => {
                                            if (!isAdmin) return;
                                            const prefill = encodeURIComponent(`Bonjour, je vous contacte concernant le dossier de votre enfant ${student.firstName} ${student.lastName}...`);
                                            navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${student.fatherAccount?.id}&prefill=${prefill}`);
                                        }}
                                        parentId={student.fatherAccount?.id}
                                        canMessage={isAdmin}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                                    <div className="w-6 h-px bg-slate-200"></div> Historique Financier & Frais Scolaires
                                </h4>
                                {isAdmin && studentInstallments.length > 0 && (
                                    <button
                                        onClick={confirmGenerateInstallments}
                                        className="text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 font-black tracking-widest uppercase flex items-center gap-2 transition-colors"
                                    >
                                        Actualiser les tranches
                                    </button>
                                )}
                            </div>
                            <div className="bg-white p-3 sm:p-6 shadow-xl border border-slate-100 rounded-xl">
                                {loadingInstallments ? (
                                    <div className="py-20 text-center animate-pulse">
                                        <div className="w-12 h-12 bg-indigo-100 mx-auto mb-4 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Chargement des données financières...</p>
                                    </div>
                                ) : studentInstallments.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4 stroke-[1]" />
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucune donnée financière</p>
                                        <p className="text-slate-400 text-sm mt-2 mb-6">L'élève n'est lié à aucun plan de paiement.</p>
                                        {isAdmin && (
                                            <button
                                                onClick={handleGenerateInstallments}
                                                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all text-sm"
                                            >
                                                Générer les tranches
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
                                        {Object.entries(
                                            studentInstallments.filter((i: any) => i != null).reduce((acc: any, inst: any) => {
                                                const planName = inst.paymentPlan?.name || inst.feeType?.name || 'Autres';
                                                if (!acc[planName]) acc[planName] = { installments: [], planObj: inst.paymentPlan };
                                                acc[planName].installments.push(inst);
                                                return acc;
                                            }, {})
                                        ).map(([planName, group]: [string, any]) => {
                                            const installments = group.installments.sort((a: any, b: any) => {
                                                if (a.dueDate && b.dueDate) {
                                                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                                                }
                                                return a.id - b.id;
                                            });
                                            const totalDue = installments.reduce((sum: number, i: any) => sum + i.dueAmount, 0);
                                            const totalPaid = installments.reduce((sum: number, i: any) => sum + i.paidAmount, 0);
                                            const overallProgress = totalDue > 0 ? Math.min(100, (totalPaid / totalDue) * 100) : 0;
                                            const allPaid = totalPaid >= totalDue;

                                            return (
                                                <div key={planName} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                    {/* Card header - Plan name */}
                                                    <div className={`p-3 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 ${allPaid ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-slate-50 border-b border-slate-200'}`}>
                                                        <div className="flex items-center gap-3">
                                                            {allPaid
                                                                ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                                : <CreditCard size={18} className="text-indigo-500 shrink-0" />
                                                            }
                                                            <div>
                                                                <h5 className={`font-black uppercase tracking-wide text-sm ${allPaid ? 'text-emerald-700' : 'text-slate-800'}`}>{planName}</h5>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                                    {installments.length} tranche{installments.length > 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-left sm:text-right">
                                                            <p className={`text-base font-black tracking-tighter ${allPaid ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                                {totalPaid.toLocaleString()} <span className="text-xs font-bold text-slate-400">/ {totalDue.toLocaleString()} FCFA</span>
                                                            </p>
                                                            <div className="w-full sm:w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2 sm:ml-auto">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-700 ${allPaid ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                                    style={{ width: `${overallProgress}%` }}
                                                                />
                                                            </div>
                                                            {allPaid && (
                                                                <button
                                                                    onClick={async () => {
                                                                        const receiptUser = {
                                                                            firstName: student.fatherLastName ? student.fatherFirstName : (student.motherLastName ? student.motherFirstName : user?.firstName),
                                                                            lastName: student.fatherLastName || student.motherLastName || user?.lastName,
                                                                            email: student.fatherEmail || student.motherEmail || user?.email,
                                                                            institution: student.institution || user?.institution
                                                                        };
                                                                        setIsProcessingAction(true);
                                                                        setProcessingMessage("Génération du reçu sécurisé...");
                                                                        await new Promise(r => setTimeout(r, 50));
                                                                        try {
                                                                            await generateReceipt(null, installments[0], receiptUser, true, group);
                                                                        } finally {
                                                                            setIsProcessingAction(false);
                                                                        }
                                                                    }}
                                                                    className="mt-3 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 transition-colors sm:ml-auto"
                                                                >
                                                                    <Download size={12} /> Reçu Global
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Installments list */}
                                                    <div className="divide-y divide-slate-100">
                                                        {installments.map((inst: any, idx: number) => {
                                                            const remaining = inst.dueAmount - inst.paidAmount;
                                                            const isFullyPaid = remaining <= 0;
                                                            const progress = Math.min(100, Math.max(0, (inst.paidAmount / inst.dueAmount) * 100)) || 0;
                                                            const feeTypeName = inst.feeType?.name;
                                                            
                                                            let isPreviousUnpaid = false;
                                                            for (let i = 0; i < idx; i++) {
                                                                if (installments[i].dueAmount - installments[i].paidAmount > 0) {
                                                                    isPreviousUnpaid = true;
                                                                    break;
                                                                }
                                                            }

                                                            return (
                                                                <div key={inst.id} className={`p-3 sm:p-4 flex flex-col gap-3 ${isFullyPaid ? 'bg-emerald-50/30' : 'bg-white'} hover:bg-slate-50/60 transition-colors`}>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${isFullyPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                                                {idx + 1}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-black text-slate-700 text-sm">
                                                                                    Tranche {idx + 1}
                                                                                    {feeTypeName && feeTypeName !== planName && (
                                                                                        <span className="ml-2 text-[10px] font-bold text-slate-400 normal-case">— {feeTypeName}</span>
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                                                    Échéance : {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('fr-FR') : '—'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-left sm:text-right shrink-0">
                                                                            <p className="text-base font-black text-slate-800">{inst.dueAmount.toLocaleString()} <span className="text-xs text-slate-400">FCFA</span></p>
                                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isFullyPaid ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                                {isFullyPaid ? '✓ Soldé' : `Reste : ${remaining.toLocaleString()}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Progress bar */}
                                                                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all duration-700 ${isFullyPaid ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>

                                                                    {/* Reçus for installment */}
                                                                    {inst.transactions && inst.transactions.length > 0 && (
                                                                        <div className="pt-1 flex flex-wrap gap-2">
                                                                            {inst.transactions.map((tx: any) => (
                                                                                <button
                                                                                    key={tx.id}
                                                                                    onClick={async () => {
                                                                                        const receiptUser = {
                                                                                            firstName: student.fatherLastName ? student.fatherFirstName : (student.motherLastName ? student.motherFirstName : user?.firstName),
                                                                                            lastName: student.fatherLastName || student.motherLastName || user?.lastName,
                                                                                            email: student.fatherEmail || student.motherEmail || user?.email,
                                                                                            institution: student.institution || user?.institution
                                                                                        };
                                                                                        setIsProcessingAction(true);
            setProcessingMessage("Génération du reçu sécurisé...");
            await new Promise(r => setTimeout(r, 50));
            try {
                await generateReceipt(tx, inst, receiptUser, false);
            } finally {
                setIsProcessingAction(false);
            }
                                                                                    }}
                                                                                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                                                                                >
                                                                                    <Download size={12} /> Reçu ({tx.amount} FCFA)
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Payment form for admin */}
                                                                    {isAdmin && !isFullyPaid && (
                                                                        <div className="pt-1 flex flex-col sm:flex-row gap-2">
                                                                            {isPreviousUnpaid ? (
                                                                                <div className="flex-1 bg-amber-50/50 border border-amber-200/50 px-3 py-2 rounded-lg flex items-center justify-center">
                                                                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-center">
                                                                                        Veuillez d'abord solder la tranche précédente
                                                                                    </p>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <input
                                                                                        type="number"
                                                                                        placeholder={`Montant (max ${remaining.toLocaleString()} FCFA)`}
                                                                                        value={payingInstallmentId === inst.id ? paymentAmount : ''}
                                                                                        onFocus={() => {
                                                                                            if (payingInstallmentId !== inst.id) {
                                                                                                setPayingInstallmentId(inst.id);
                                                                                                setPaymentAmount('');
                                                                                            }
                                                                                        }}
                                                                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                                                                        className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold outline-none focus:border-indigo-400 rounded-lg"
                                                                                    />
                                                                                    <select
                                                                                        value={paymentMode}
                                                                                        onChange={(e) => setPaymentMode(e.target.value)}
                                                                                        className="bg-slate-50 border border-slate-200 px-2 py-2 text-xs font-bold outline-none focus:border-indigo-400 rounded-lg w-[110px]"
                                                                                    >
                                                                                        <option value="ESPÈCES">Espèces</option>
                                                                                        <option value="VIREMENT">Virement</option>
                                                                                        <option value="CHÈQUE">Chèque</option>
                                                                                        <option value="MOBILE_MONEY">Mobile</option>
                                                                                    </select>
                                                                                    <button
                                                                                        onClick={() => handlePayInstallmentClick(inst.id, inst.dueAmount, inst.paidAmount)}
                                                                                        disabled={payingInstallmentId === inst.id && !paymentAmount}
                                                                                        className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 rounded-lg"
                                                                                    >
                                                                                        Payer
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Elegant Loading Overlay for Processing Actions */}
            {isProcessingAction && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-[250] flex flex-col items-center justify-center p-4 rounded-xl animate-in fade-in duration-300">
                    <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                        {/* Demi-cercle extérieur qui tourne */}
                        <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
                        {/* Demi-cercle intérieur qui tourne dans le sens inverse */}
                        <div className="absolute inset-3 rounded-full border-[4px] border-transparent border-b-purple-500 border-l-purple-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                        {/* Icône au centre */}
                        <div className="relative flex items-center justify-center bg-indigo-50/50 rounded-full w-12 h-12 backdrop-blur-sm">
                            <Mail className="text-indigo-600 animate-pulse" size={20} />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2 uppercase">Veuillez patienter</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">{processingMessage}</p>
                </div>
            )}

            {dialogState.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-white max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                            dialogState.type === 'confirm' ? 'bg-amber-100 text-amber-600' :
                            dialogState.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            dialogState.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                            'bg-rose-100 text-rose-600'
                        }`}>
                            {dialogState.type === 'confirm' && <AlertCircle size={24} />}
                            {dialogState.type === 'success' && <CheckCircle2 size={24} />}
                            {dialogState.type === 'warning' && <AlertCircle size={24} />}
                            {dialogState.type === 'error' && <X size={24} />}
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">{dialogState.title}</h3>
                        <p className="text-sm text-slate-500 mb-6">{dialogState.message}</p>
                        <div className="flex gap-3 justify-end">
                            {dialogState.onCancel && (
                                <button onClick={dialogState.onCancel} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest transition-colors">
                                    Annuler
                                </button>
                            )}
                            {dialogState.onConfirm && (
                                <button onClick={dialogState.onConfirm} className={`px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-colors ${
                                    dialogState.type === 'confirm' ? 'bg-indigo-600 hover:bg-indigo-700' :
                                    dialogState.type === 'error' ? 'bg-rose-600 hover:bg-rose-700' :
                                    dialogState.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
                                    'bg-emerald-600 hover:bg-emerald-700'
                                }`}>
                                    Confirmer
                                </button>
                            )}
                            {!dialogState.onConfirm && !dialogState.onCancel && (
                                <button onClick={closeDialog} className={`px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-colors ${
                                    dialogState.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                    'bg-rose-600 hover:bg-rose-700'
                                }`}>
                                    Fermer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailItem = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-4 animate-in slide-in-from-left-2 duration-300">
        <div className="w-9 h-9 bg-white shadow-sm flex items-center justify-center text-indigo-500">
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-700 tracking-tight">{value}</p>
        </div>
    </div>
);

const ParentCard = ({ gender, name, email, phone, onMessage, parentId, canMessage, defaultPassword }: any) => (
    <div className="bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center text-[10px] font-black ${gender === 'M' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                    {gender}
                </span>
                <p className="text-xs font-black text-slate-800 uppercase group-hover:text-indigo-600 transition-colors truncate">{name || 'Non renseigné'}</p>
            </div>
            {canMessage && (
                <button
                    onClick={onMessage}
                    disabled={!parentId}
                    className={`w-10 h-10 flex items-center justify-center transition-all shadow-lg ${parentId ? 'bg-indigo-600 text-white shadow-indigo-600/30 hover:scale-110' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    title={parentId ? "Contacter le parent" : "Compte parent non disponible"}
                >
                    <MessageSquare size={16} />
                </button>
            )}
        </div>
        <div className="space-y-1.5 pl-1 relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <Mail size={12} className="text-slate-200" /> {email || 'Aucun email'}
            </div>
            {email && defaultPassword && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 font-mono">Pass: {defaultPassword}</span>
                </div>
            )}
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <Phone size={12} className="text-slate-200" /> {phone || 'Pas de numéro'}
            </div>
        </div>
        {!parentId && (
            <div className="absolute top-0 right-0 p-1">
                <span className="text-[7px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 uppercase tracking-tighter">Pas de compte</span>
            </div>
        )}
    </div>
);
