import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import {
    X, Mail, MessageSquare, Phone, MapPin, Calendar, GraduationCap, AlertCircle, CheckCircle2,
    Printer, Download, CreditCard, Key, Eye, EyeOff, Copy, Check, BookOpen, Clock,
    Award, ArrowRight, History, UserCheck, UserX, ShieldCheck, Loader2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { generateReceipt } from '../../../utils/receiptGenerator';

interface StudentDetailsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    role: string;
    onRefresh?: () => void;
    initialTab?: 'info' | 'parcours' | 'finance' | 'subjects';
}

export const StudentDetailsPopup: React.FC<StudentDetailsPopupProps> = ({ isOpen, onClose, student: initialStudent, role, onRefresh, initialTab }) => {
    const { user } = useAuth();
    const [student, setStudent] = useState<any>(initialStudent);
    const [showPassword, setShowPassword] = useState<boolean>(true);
    const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

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
    const [activeTab, setActiveTab] = useState<'info' | 'parcours' | 'finance' | 'subjects'>(initialTab || 'info');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab || 'info');
        }
    }, [isOpen, initialTab]);

    const [academicHistory, setAcademicHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);



    // Selected academic year filter state for viewing historical student records
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && student?.id) {
            fetchAcademicHistory(student.id);
        }
    }, [isOpen, student?.id]);

    const availableAcademicYears = React.useMemo(() => {
        const map = new Map<number, any>();
        if (student?.enrollments) {
            student.enrollments.forEach((e: any) => {
                if (e.academicYear?.id) {
                    map.set(e.academicYear.id, {
                        id: e.academicYear.id,
                        name: e.academicYear.name,
                        isCurrent: e.academicYear.isCurrent,
                        isClosed: e.academicYear.isClosed,
                        classe: e.classe
                    });
                }
            });
        }
        if (academicHistory && academicHistory.length > 0) {
            academicHistory.forEach((h: any) => {
                if (h.academicYearId && !map.has(h.academicYearId)) {
                    map.set(h.academicYearId, {
                        id: h.academicYearId,
                        name: h.academicYearName,
                        isCurrent: h.isCurrent,
                        isClosed: !h.isCurrent,
                        classeName: h.classeName
                    });
                }
            });
        }
        return Array.from(map.values()).sort((a, b) => b.id - a.id);
    }, [student, academicHistory]);

    useEffect(() => {
        if (isOpen && availableAcademicYears.length > 0) {
            const activeYear = availableAcademicYears.find(a => a.isCurrent) || availableAcademicYears[0];
            if (activeYear && activeYear.id) {
                setSelectedAcademicYearId(activeYear.id);
            }
        }
    }, [isOpen, student, availableAcademicYears.length]);

    const selectedEnrollment = React.useMemo(() => {
        if (!student?.enrollments || student.enrollments.length === 0) return null;
        return student.enrollments.find((e: any) => e.academicYear?.id === selectedAcademicYearId)
            || student.enrollments.find((e: any) => e.academicYear?.isCurrent)
            || student.enrollments[student.enrollments.length - 1];
    }, [student, selectedAcademicYearId]);

    const activeClasse = selectedEnrollment?.classe || student?.classe;
    const activeClasseName = activeClasse?.name || availableAcademicYears.find(a => a.id === selectedAcademicYearId)?.classeName || student?.classeName || 'Non rattaché';
    const activeYearObj = availableAcademicYears.find(a => a.id === selectedAcademicYearId);



    const fetchAcademicHistory = async (studentId: number) => {
        try {
            setLoadingHistory(true);
            const res = await api.get(`/students/${studentId}/history`);
            setAcademicHistory(res.data || []);
        } catch (err) {
            console.error("Error fetching student academic history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const [studentInstallments, setStudentInstallments] = useState<any[]>([]);
    const [loadingInstallments, setLoadingInstallments] = useState<boolean>(false);

    const filteredInstallments = React.useMemo(() => {
        const list = Array.isArray(studentInstallments) ? studentInstallments : [];
        if (list.length === 0) return [];
        if (!selectedAcademicYearId) return list;
        return list.filter((inst: any) => {
            const ayId = inst.enrollment?.academicYear?.id || inst.paymentPlan?.academicYear?.id || inst.academicYear?.id;
            return ayId === selectedAcademicYearId;
        });
    }, [studentInstallments, selectedAcademicYearId]);

    const [subjectsList, setSubjectsList] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);

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
            setStudentInstallments(Array.isArray(res.data) ? res.data : (res.data?.installments || []));
        } catch (error) {
            console.error("Error fetching installments", error);
            setStudentInstallments([]);
        } finally {
            setLoadingInstallments(false);
        }
    };

    useEffect(() => {
        const targetClasseId = activeClasse?.id 
            || student?.classe?.id 
            || student?.classeId 
            || selectedEnrollment?.classe?.id;

        const targetInstitutionId = student?.institution?.id || user?.institution?.id;
        const targetCycleId = activeClasse?.cycle?.id || student?.classe?.cycle?.id || student?.cycleId;

        if (isOpen && (targetClasseId || targetInstitutionId || student?.id)) {
            const fetchSubjectsAndTeachers = async () => {
                try {
                    setLoadingSubjects(true);
                    const map: Record<string, any> = {};

                    // 1. Fetch Timetable Entries for class if classeId exists
                    if (targetClasseId) {
                        try {
                            const res = await api.get(`/timetable/classe/${targetClasseId}`);
                            const entries = res.data || [];
                            entries.forEach((e: any) => {
                                const key = `${e.subjectName || 'Matière'}-${e.teacherName || 'Professeur'}`;
                                if (!map[key]) {
                                    map[key] = {
                                        subjectName: e.subjectName || 'Matière',
                                        teacherName: e.teacherName || 'Professeur Titulaire',
                                        teacherId: e.teacherId,
                                        classeName: e.classeName || activeClasseName || 'Classe',
                                        schedules: []
                                    };
                                }
                                if (e.dayOfWeek && e.startTime && e.endTime) {
                                    const dayName = e.dayOfWeek.charAt(0) + e.dayOfWeek.slice(1).toLowerCase();
                                    map[key].schedules.push(`${dayName} ${e.startTime}-${e.endTime}${e.room ? ` (Salle ${e.room})` : ''}`);
                                }
                            });
                        } catch (timetableErr) {
                            console.warn("No timetable entries for classe", timetableErr);
                        }
                    }

                    // 2. If timetable returned no subjects, fetch official subjects for the institution or cycle
                    if (Object.keys(map).length === 0) {
                        try {
                            let subjectsUrl = '/subjects';
                            if (targetCycleId) {
                                subjectsUrl = `/subjects/cycle/${targetCycleId}`;
                            } else if (targetInstitutionId) {
                                subjectsUrl = `/subjects?institutionId=${targetInstitutionId}`;
                            }
                            const subjRes = await api.get(subjectsUrl);
                            const allSubjs = subjRes.data || [];
                            allSubjs.forEach((s: any) => {
                                const key = `${s.name}`;
                                map[key] = {
                                    subjectName: s.name,
                                    teacherName: 'Professeur Titulaire',
                                    teacherId: null,
                                    classeName: activeClasseName || 'Classe',
                                    category: s.category || 'Matière Officielle',
                                    schedules: ['Horaire d\'établissement']
                                };
                            });
                        } catch (subjErr) {
                            console.warn("Could not fetch institution subjects", subjErr);
                        }
                    }

                    setSubjectsList(Object.values(map));
                } catch (err) {
                    console.error("Error fetching student subjects", err);
                } finally {
                    setLoadingSubjects(false);
                }
            };
            fetchSubjectsAndTeachers();
        }
    }, [isOpen, student?.id, selectedAcademicYearId, activeClasse?.id, student?.institution?.id, user?.institution?.id]);

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
            
            await new Promise(resolve => setTimeout(resolve, 1500));

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
    const isAdministration = ['PDG', 'DIRECTION', 'PROVISORIAT', 'SECRETARIAT', 'ADMIN', 'APP_ADMIN'].includes((user?.role || role || '').toUpperCase());
    const studentPassword = student.defaultPassword || student.password || student.studentPassword || student.user?.defaultPassword || (student.studentIdNumber ? `std-${student.studentIdNumber}` : '123456');



    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 sm:p-6 text-white relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md">
                        <X size={18} />
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1 pr-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl shadow-lg backdrop-blur-xl uppercase ring-2 ring-white/10 shrink-0">
                                {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold uppercase tracking-tight">{student.lastName} {student.firstName}</h3>
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                    <span className="flex items-center gap-1 bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                                        <CheckCircle2 size={12} /> Scolarisé
                                    </span>
                                    <span className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                                        Matricule : {student.studentIdNumber || 'ATTENTE VALIDATION'}
                                    </span>
                                </div>
                            </div>
                        </div>

                                        {/* Institution Info & Animated Academic Year Selector Filter */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Animated Academic Year Selector Filter */}
                            {availableAcademicYears.length > 0 && (
                                <div className="flex items-center gap-2.5 bg-white/15 hover:bg-white/20 p-2.5 px-3.5 rounded-2xl backdrop-blur-md border border-white/25 shadow-lg transition-all animate-in fade-in duration-300">
                                    <Calendar size={16} className="text-blue-200 shrink-0" />
                                    <div className="flex flex-col min-w-[130px]">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">Filtre Année</span>
                                        <select
                                            value={selectedAcademicYearId || ''}
                                            onChange={(e) => setSelectedAcademicYearId(Number(e.target.value))}
                                            className="bg-transparent text-white text-xs font-black outline-none cursor-pointer [&>option]:text-slate-900 [&>option]:bg-white [&>option]:font-bold"
                                        >
                                            {availableAcademicYears.map((ay: any) => (
                                                <option key={ay.id} value={ay.id}>
                                                    {ay.name} {ay.isCurrent ? '(En cours)' : ay.isClosed ? '(Clôturée)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {student.institution && (
                                <div className="flex items-center justify-between gap-4 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10 flex-1 md:flex-initial">
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <div className="text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5 truncate">
                                            <GraduationCap size={14} className="shrink-0" /> <span className="truncate">{student.institution.name}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-[11px] text-blue-100">
                                            {student.institution.address && (
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <MapPin size={11} className="opacity-70 shrink-0" /> <span className="truncate">{student.institution.address}</span>
                                                </div>
                                            )}
                                            {student.institution.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone size={11} className="opacity-70 shrink-0" /> {student.institution.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {student.id && isAdmin && (
                                        <button
                                            onClick={async () => {
                                                const prefill = encodeURIComponent(`Bonjour ${student.firstName}, je vous contacte concernant votre dossier scolaire...`);
                                                navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${student.id}&prefill=${prefill}`);
                                            }}
                                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white shadow-md transition-all shrink-0"
                                            title="Envoyer un message"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-850/50 overflow-x-auto shrink-0">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-3.5 px-5 font-bold uppercase tracking-wider text-xs border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        Dossier Élève
                    </button>
                    <button
                        onClick={() => setActiveTab('parcours')}
                        className={`py-3.5 px-5 font-bold uppercase tracking-wider text-xs border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'parcours' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <History size={14} /> Parcours Scolaire
                    </button>
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={`py-3.5 px-5 font-bold uppercase tracking-wider text-xs border-b-2 transition-colors ${activeTab === 'subjects' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        Matières & Enseignants
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`py-3.5 px-5 font-bold uppercase tracking-wider text-xs border-b-2 transition-colors ${activeTab === 'finance' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        Finances
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40 dark:bg-slate-950/40 space-y-6">
                    {activeTab === 'info' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-6 lg:col-span-1">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" /> Données Personnelles
                                </h4>
                                <div className="space-y-3">
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <DetailItem icon={<CreditCard size={16} />} label="Matricule" value={student.studentIdNumber || 'Non assigné'} />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                        <DetailItem icon={<Mail size={16} />} label="Email / Compte" value={student.email ? student.email.toLowerCase().replace(/\s+/g, '') : 'Non généré'} />
                                        {student.id && isAdmin && (
                                            <button
                                                onClick={async () => {
                                                    const prefill = encodeURIComponent(`Bonjour ${student.firstName}, je vous contacte concernant votre dossier scolaire...`);
                                                    navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${student.id}&prefill=${prefill}`);
                                                }}
                                                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all shrink-0"
                                                title="Envoyer un message à l'élève"
                                            >
                                                <MessageSquare size={14} />
                                            </button>
                                        )}
                                    </div>



                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <DetailItem icon={<Calendar size={16} />} label="Naissance" value={student.birthDate ? new Date(student.birthDate).toLocaleDateString('fr-FR') : 'Non renseigné'} />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <DetailItem icon={<MapPin size={16} />} label="Demeure à" value={student.address || student.fatherAccount?.address || student.motherAccount?.address || 'Adresse inconnue'} />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <DetailItem icon={<GraduationCap size={16} />} label="Classe" value={activeClasseName} />
                                    </div>

                                    {/* Career Timeline Summary Box */}
                                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <History size={13} className="text-blue-600 dark:text-blue-400" /> Parcours Scolaire
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('parcours')}
                                                className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                            >
                                                Voir détails <ArrowRight size={10} />
                                            </button>
                                        </div>

                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            {academicHistory.length > 0 ? (
                                                <div className="flex items-center justify-between gap-2 pt-1">
                                                    <span>Arrivée: {academicHistory[0].academicYearName}</span>
                                                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[10px]">
                                                        {academicHistory.length} année(s)
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-medium">Historique en cours de chargement...</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6 lg:col-span-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" /> Responsables Parents
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
                    ) : activeTab === 'parcours' ? (
                        <div className="space-y-6">
                            {/* Header Parcours & Badges */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                                        <History size={18} className="text-blue-600 dark:text-blue-400" /> Parcours Scolaire de l'Élève
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                        Historique chronologique des années scolaires, moyennes annuelles et décisions du conseil.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                                    <span>Arrivée : {academicHistory.length > 0 ? academicHistory[0].academicYearName : 'N/A'}</span>
                                    <span>→</span>
                                    <span>Départ / Actuel : {academicHistory.length > 0 ? academicHistory[academicHistory.length - 1].academicYearName : 'N/A'}</span>
                                </div>
                            </div>

                            {/* Official Diploma Card if student is GRADUATED or has graduated history */}
                            {(student.status === 'GRADUATED' || academicHistory.some((h: any) => h.status === 'GRADUATED')) && (
                                <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 bg-indigo-500/30 rounded-2xl backdrop-blur-md shrink-0">
                                            <GraduationCap size={36} className="text-indigo-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="px-2.5 py-0.5 bg-indigo-500/40 text-indigo-200 rounded-md text-[10px] font-black uppercase tracking-widest border border-indigo-400/30">
                                                Cursus Officiellement Complété
                                            </span>
                                            <h4 className="text-lg font-black tracking-tight uppercase">Diplôme de fin d'études délivré</h4>
                                            <p className="text-xs text-indigo-200 font-medium">L'élève a accompli avec succès toutes les étapes de son cursus au sein de l'établissement.</p>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-right font-mono text-xs font-extrabold text-indigo-200 bg-black/40 px-4 py-2.5 rounded-xl border border-indigo-500/30 shrink-0">
                                        <div>Période d'Études :</div>
                                        <div className="text-white text-sm mt-0.5">{academicHistory[0]?.academicYearName || 'Arrivée'} → {academicHistory[academicHistory.length - 1]?.academicYearName || 'Obtention'}</div>
                                    </div>
                                </div>
                            )}

                            {/* Animated Career Timeline Nodes */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Évolution Chronologique par Année Académique</h5>

                                {loadingHistory ? (
                                    <div className="py-12 text-center">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-bold text-slate-500">Chargement du parcours scolaire...</p>
                                    </div>
                                ) : academicHistory.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 font-bold text-sm">
                                        Aucun historique de parcours scolaire trouvé pour cet élève.
                                    </div>
                                ) : (
                                    <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-6 my-2">
                                        {academicHistory.map((item: any, idx: number) => {
                                            const isPassed = item.status === 'PASSED' || item.statusLabel === 'Classe franchie';
                                            const isFailed = item.status === 'FAILED' || item.statusLabel === 'Redoublé';
                                            const isGraduated = item.status === 'GRADUATED' || item.statusLabel === 'Diplômé';
                                            const isCurrent = item.isCurrent;

                                            return (
                                                <div key={item.enrollmentId || idx} className="relative group">
                                                    {/* Animated Step Indicator Node */}
                                                    <div className={`absolute -left-[31px] top-2 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 transition-all ${
                                                        isGraduated ? 'border-indigo-600 ring-4 ring-indigo-500/20' :
                                                        isPassed ? 'border-emerald-500 ring-4 ring-emerald-500/20' :
                                                        isFailed ? 'border-red-500 ring-4 ring-red-500/20' :
                                                        'border-blue-500 ring-4 ring-blue-500/20 animate-pulse'
                                                    }`} />

                                                    <div className={`p-4 rounded-2xl border transition-all ${
                                                        isGraduated ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' :
                                                        isPassed ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' :
                                                        isFailed ? 'bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-800' :
                                                        'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-extrabold text-sm text-slate-800 dark:text-white">{item.academicYearName}</span>
                                                                    <span className="text-slate-400">•</span>
                                                                    <span className="font-bold text-xs text-slate-600 dark:text-slate-300">Classe : {item.classeName}</span>
                                                                    {isCurrent && (
                                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded text-[9px] font-black uppercase">Année Actuelle</span>
                                                                    )}
                                                                </div>
                                                                {item.finalAverage !== null && (
                                                                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                                        Moyenne Annuelle Obtenue : <span className="font-bold text-slate-800 dark:text-white">{item.finalAverage} / 20</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Status Badge */}
                                                            <div className="shrink-0">
                                                                {isPassed && (
                                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                                        <UserCheck size={12} /> Classe Franchie
                                                                    </span>
                                                                )}
                                                                {isFailed && (
                                                                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                                        <UserX size={12} /> Redoublé
                                                                    </span>
                                                                )}
                                                                {isGraduated && (
                                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                                        <Award size={12} /> Diplômé
                                                                    </span>
                                                                )}
                                                                {!isPassed && !isFailed && !isGraduated && (
                                                                    <span className="px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                                                        En cours de scolarité
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'subjects' ? (
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" /> Programme de la Classe & Enseignants
                            </h4>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                {loadingSubjects ? (
                                    <div className="py-16 text-center">
                                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Chargement des matières et enseignants...</p>
                                    </div>
                                ) : subjectsList.length === 0 ? (
                                    <div className="py-16 text-center space-y-2">
                                        <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                        <p className="text-slate-800 dark:text-white font-bold text-sm">Aucune matière affectée</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">Aucun cours n'est actuellement programmé pour la classe de cet élève.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {subjectsList.map((item, i) => (
                                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-blue-500/50 transition-all">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                                                            {item.subjectName.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">{item.subjectName}</h5>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Prof. {item.teacherName}</p>
                                                        </div>
                                                    </div>

                                                    {item.schedules && item.schedules.length > 0 && (
                                                        <div className="space-y-1 pt-1">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Horaires :</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.schedules.map((sch: string, sIdx: number) => (
                                                                    <span key={sIdx} className="px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold text-[10px] rounded-md border border-slate-200 dark:border-slate-700">
                                                                        {sch}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {item.teacherId && (
                                                    <button
                                                        onClick={() => {
                                                            const prefill = encodeURIComponent(`Bonjour M./Mme ${item.teacherName}, je vous contacte au sujet des cours de ${item.subjectName} de l'élève ${student.firstName} ${student.lastName}...`);
                                                            navigate(`/dashboard/${role.toLowerCase()}/messages?contactId=${item.teacherId}&prefill=${prefill}`);
                                                            if (onClose) onClose();
                                                        }}
                                                        className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-900/60 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                                    >
                                                        <MessageSquare size={14} /> Contacter l'Enseignant
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" /> Historique Financier & Frais Scolaires {activeYearObj ? `(${activeYearObj.name})` : ''}
                                </h4>
                                {isAdmin && (
                                    <button
                                        onClick={confirmGenerateInstallments}
                                        className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 font-bold tracking-wider uppercase rounded-xl transition-colors flex items-center gap-1.5"
                                    >
                                        <RefreshCw size={12} /> Actualiser les tranches
                                    </button>
                                )}
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                {loadingInstallments ? (
                                    <div className="py-16 text-center">
                                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Chargement des données financières...</p>
                                    </div>
                                ) : filteredInstallments.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <AlertCircle size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                        <p className="text-slate-800 dark:text-white font-bold text-sm">Aucune donnée financière pour l'année {activeYearObj?.name || 'sélectionnée'}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-4">L'élève n'est lié à aucun plan de paiement pour cette année scolaire.</p>
                                        {isAdmin && (
                                            <button
                                                onClick={handleGenerateInstallments}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                                            >
                                                <CreditCard size={15} /> Générer / Assigner les tranches
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                                        {Object.entries(
                                            filteredInstallments.filter((i: any) => i != null).reduce((acc: any, inst: any) => {
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
                                                <div key={planName} className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                                                    <div className={`p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${allPaid ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40' : 'bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800'}`}>
                                                        <div className="flex items-center gap-3">
                                                            {allPaid
                                                                ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                                                : <CreditCard size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                                            }
                                                            <div>
                                                                <h5 className={`font-bold uppercase tracking-wider text-xs ${allPaid ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>{planName}</h5>
                                                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                                                                    {installments.length} tranche{installments.length > 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-left sm:text-right">
                                                            <p className={`text-sm font-black tracking-tight ${allPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                                {(totalPaid || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {(totalDue || 0).toLocaleString()} FCFA</span>
                                                            </p>
                                                            <div className="w-full sm:w-28 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5 sm:ml-auto">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-700 ${allPaid ? 'bg-emerald-500' : 'bg-blue-600'}`}
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
                                                                    className="mt-2 text-[10px] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 px-2.5 py-1 font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 transition-colors sm:ml-auto"
                                                                >
                                                                    <Download size={12} /> Reçu Global
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
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
                                                                <div key={inst.id} className={`p-4 flex flex-col gap-2.5 ${isFullyPaid ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'bg-white dark:bg-slate-900'} hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors`}>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                                        <div className="flex items-center gap-2.5">
                                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isFullyPaid ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                                                                                {idx + 1}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-slate-900 dark:text-white text-xs">
                                                                                    Tranche {idx + 1}
                                                                                    {feeTypeName && feeTypeName !== planName && (
                                                                                        <span className="ml-1.5 text-[10px] text-slate-400 font-normal">— {feeTypeName}</span>
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                                                                    Échéance : {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('fr-FR') : '—'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-left sm:text-right shrink-0">
                                                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{(inst.dueAmount || 0).toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span></p>
                                                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${isFullyPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                                                {isFullyPaid ? '✓ Soldé' : `Reste : ${(remaining || 0).toLocaleString()}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all duration-700 ${isFullyPaid ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>

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
                                                                                    className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 font-bold rounded-lg flex items-center gap-1 transition-colors"
                                                                                >
                                                                                    <Download size={12} /> Reçu ({tx.amount} FCFA)
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {isAdmin && !isFullyPaid && (
                                                                        <div className="pt-1 flex flex-col sm:flex-row gap-2">
                                                                            {isPreviousUnpaid ? (
                                                                                <div className="flex-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3 py-1.5 rounded-xl flex items-center justify-center">
                                                                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-center">
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
                                                                                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none rounded-xl"
                                                                                    />
                                                                                    <select
                                                                                        value={paymentMode}
                                                                                        onChange={(e) => setPaymentMode(e.target.value)}
                                                                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none rounded-xl"
                                                                                    >
                                                                                        <option value="ESPÈCES">Espèces</option>
                                                                                        <option value="VIREMENT">Virement</option>
                                                                                        <option value="CHÈQUE">Chèque</option>
                                                                                        <option value="MOBILE_MONEY">Mobile</option>
                                                                                    </select>
                                                                                    <button
                                                                                        onClick={() => handlePayInstallmentClick(inst.id, inst.dueAmount, inst.paidAmount)}
                                                                                        disabled={payingInstallmentId === inst.id && !paymentAmount}
                                                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 rounded-xl"
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

                {/* Loading Overlay */}
                {isProcessingAction && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-[250] flex flex-col items-center justify-center p-4 rounded-2xl animate-in fade-in duration-200">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <h3 className="text-base font-bold text-white tracking-tight mb-1 uppercase">Veuillez patienter</h3>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-950/60 px-4 py-1.5 rounded-xl border border-blue-800">{processingMessage}</p>
                    </div>
                )}

                {dialogState.isOpen && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${dialogState.type === 'confirm' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' :
                                dialogState.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                                    dialogState.type === 'warning' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' :
                                        'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                }`}>
                                {dialogState.type === 'confirm' && <AlertCircle size={20} />}
                                {dialogState.type === 'success' && <CheckCircle2 size={20} />}
                                {dialogState.type === 'warning' && <AlertCircle size={20} />}
                                {dialogState.type === 'error' && <X size={20} />}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{dialogState.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{dialogState.message}</p>
                            <div className="flex gap-2 justify-end">
                                {dialogState.onCancel && (
                                    <button onClick={dialogState.onCancel} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors">
                                        Annuler
                                    </button>
                                )}
                                {dialogState.onConfirm && (
                                    <button onClick={dialogState.onConfirm} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
                                        Confirmer
                                    </button>
                                )}
                                {!dialogState.onConfirm && !dialogState.onCancel && (
                                    <button onClick={closeDialog} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
                                        Fermer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const ParentCard = ({ gender, name, email, phone, onMessage, parentId, canMessage, defaultPassword }: any) => {
    const [showParentPass, setShowParentPass] = useState(true);
    const [copiedPass, setCopiedPass] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${gender === 'M' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400'}`}>
                        {gender}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{name || 'Non renseigné'}</p>
                </div>
                {canMessage && (
                    <button
                        onClick={onMessage}
                        disabled={!parentId}
                        className={`p-2 rounded-xl transition-all shadow-sm ${parentId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                        title={parentId ? "Contacter le parent" : "Compte parent non disponible"}
                    >
                        <MessageSquare size={14} />
                    </button>
                )}
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400 shrink-0" /> {email || 'Aucun email'}
                </div>
                {defaultPassword && (
                    <div className="flex items-center justify-between gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <Key size={12} className="text-blue-500 shrink-0" />
                            <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white truncate select-all">
                                {showParentPass ? defaultPassword : '••••••••'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowParentPass(!showParentPass)}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                title={showParentPass ? "Masquer" : "Afficher"}
                            >
                                {showParentPass ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(defaultPassword);
                                    setCopiedPass(true);
                                    setTimeout(() => setCopiedPass(false), 2000);
                                }}
                                className="p-1 text-blue-600 dark:text-blue-400 hover:opacity-75"
                                title="Copier"
                            >
                                {copiedPass ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400 shrink-0" /> {phone || 'Pas de numéro'}
                </div>
            </div>
            {!parentId && (
                <div className="absolute top-2 right-2">
                    <span className="text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md uppercase">Pas de compte</span>
                </div>
            )}
        </div>
    );
};

export default StudentDetailsPopup;
